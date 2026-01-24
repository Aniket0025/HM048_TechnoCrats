import { Assignment } from "../models/Assignment.js";
import { AssignmentSubmission } from "../models/AssignmentSubmission.js";
import { QuizQuestion } from "../models/QuizQuestion.js";
import { AssignmentEvaluation } from "../models/AssignmentEvaluation.js";

// Submit file-based assignment
export async function submitFileAssignment(req, res) {
    try {
        const { assignmentId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Check if student belongs to the batch
        const student = await (await import("../models/User.js")).User.findById(req.user.sub);
        if (!student.batches.includes(assignment.batch)) {
            return res.status(403).json({ message: "Unauthorized: You don't belong to this batch" });
        }

        // Check if resubmission is allowed
        const existingSubmission = await AssignmentSubmission.findOne({
            assignment: assignmentId,
            student: req.user.sub,
        });

        if (existingSubmission && !assignment.allowResubmission) {
            return res.status(400).json({ message: "Resubmission not allowed" });
        }

        const isLate = new Date() > new Date(assignment.dueDate);
        const submissionData = {
            assignment: assignmentId,
            student: req.user.sub,
            type: "FILE",
            fileSubmission: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                filePath: req.file.path,
            },
            status: "SUBMITTED",
            submittedAt: new Date(),
            isLate,
            attemptNumber: existingSubmission ? existingSubmission.attemptNumber + 1 : 1,
        };

        const submission = existingSubmission
            ? await AssignmentSubmission.findByIdAndUpdate(existingSubmission._id, submissionData, { new: true })
            : await AssignmentSubmission.create(submissionData);

        res.status(201).json(submission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Submit quiz assignment
export async function submitQuizAssignment(req, res) {
    try {
        const { assignmentId, answers, startedAt } = req.body;
        
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Check if student belongs to the batch
        const student = await (await import("../models/User.js")).User.findById(req.user.sub);
        if (!student.batches.includes(assignment.batch)) {
            return res.status(403).json({ message: "Unauthorized: You don't belong to this batch" });
        }

        // Check time limit
        const submittedAt = new Date();
        const timeTakenMinutes = Math.round((submittedAt - new Date(startedAt)) / (1000 * 60));
        
        if (assignment.quizSettings.timeLimitMinutes && timeTakenMinutes > assignment.quizSettings.timeLimitMinutes) {
            return res.status(400).json({ message: "Time limit exceeded" });
        }

        // Get questions and evaluate answers
        const questions = await QuizQuestion.find({ assignment: assignmentId });
        const evaluatedAnswers = answers.map((answer, index) => {
            const question = questions[index];
            let isCorrect = false;
            let marks = 0;

            if (question.questionType === "MCQ") {
                isCorrect = answer.answer === question.correctAnswer;
                marks = isCorrect ? question.marks : 0;
            } else if (question.questionType === "TRUE_FALSE") {
                isCorrect = answer.answer.toLowerCase() === question.correctAnswer.toLowerCase();
                marks = isCorrect ? question.marks : 0;
            } else if (question.questionType === "SHORT_ANSWER") {
                // For short answers, partial evaluation can be done by teacher
                marks = 0; // Will be evaluated by teacher
            }

            return {
                question: question._id,
                answer: answer.answer,
                marks,
                isCorrect,
            };
        });

        const totalMarks = evaluatedAnswers.reduce((sum, ans) => sum + ans.marks, 0);
        const isLate = submittedAt > new Date(assignment.dueDate);

        // Check attempt limit
        const existingSubmissions = await AssignmentSubmission.countDocuments({
            assignment: assignmentId,
            student: req.user.sub,
        });

        if (existingSubmissions >= assignment.quizSettings.attemptLimit) {
            return res.status(400).json({ message: "Attempt limit exceeded" });
        }

        const submission = await AssignmentSubmission.create({
            assignment: assignmentId,
            student: req.user.sub,
            type: "QUIZ",
            quizSubmission: {
                answers: evaluatedAnswers,
                startedAt: new Date(startedAt),
                submittedAt,
                timeTakenMinutes,
            },
            status: "SUBMITTED",
            submittedAt,
            isLate,
            attemptNumber: existingSubmissions + 1,
        });

        // Auto-evaluate if all questions are auto-evaluable
        const hasOnlyAutoQuestions = questions.every(q => q.questionType !== "SHORT_ANSWER");
        if (hasOnlyAutoQuestions) {
            await AssignmentEvaluation.create({
                assignment: assignmentId,
                student: req.user.sub,
                submission: submission._id,
                evaluatedBy: req.user.sub, // Self-evaluated
                marksObtained: totalMarks,
                isAutoEvaluated: true,
                evaluatedAt: new Date(),
                status: "EVALUATED",
            });
        }

        res.status(201).json(submission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get student's submissions
export async function getStudentSubmissions(req, res) {
    try {
        const { assignmentId } = req.query;
        const filter = { student: req.user.sub };
        
        if (assignmentId) {
            filter.assignment = assignmentId;
        }

        const submissions = await AssignmentSubmission.find(filter)
            .populate("assignment", "title dueDate totalMarks type")
            .populate("quizSubmission.answers.question", "questionText questionType correctAnswer marks")
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get all submissions for an assignment (teacher)
export async function getAssignmentSubmissions(req, res) {
    try {
        const { assignmentId } = req.params;
        
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment || String(assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
            .populate("student", "name email")
            .populate("quizSubmission.answers.question", "questionText questionType correctAnswer marks")
            .sort({ submittedAt: -1 });

        // Get evaluations for each submission
        const submissionIds = submissions.map(s => s._id);
        const evaluations = await AssignmentEvaluation.find({
            submission: { $in: submissionIds },
        }).populate("evaluatedBy", "name");

        const submissionsWithEvaluations = submissions.map(submission => ({
            ...submission.toObject(),
            evaluation: evaluations.find(e => String(e.submission) === String(submission._id)),
        }));

        res.json(submissionsWithEvaluations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
