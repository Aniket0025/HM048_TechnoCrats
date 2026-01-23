import { AssignmentEvaluation } from "../models/AssignmentEvaluation.js";
import { AssignmentSubmission } from "../models/AssignmentSubmission.js";
import { Assignment } from "../models/Assignment.js";

// Evaluate file-based assignment
export async function evaluateFileAssignment(req, res) {
    try {
        const { submissionId } = req.params;
        const { marksObtained, feedback, rubricScores } = req.body;
        
        const submission = await AssignmentSubmission.findById(submissionId).populate("assignment");
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        // Verify teacher owns the assignment
        if (String(submission.assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Validate marks
        if (marksObtained < 0 || marksObtained > submission.assignment.totalMarks) {
            return res.status(400).json({ message: "Invalid marks" });
        }

        const evaluation = await AssignmentEvaluation.findOneAndUpdate(
            { submission: submissionId },
            {
                assignment: submission.assignment._id,
                student: submission.student,
                submission: submissionId,
                evaluatedBy: req.user.sub,
                marksObtained,
                feedback,
                rubricScores,
                isAutoEvaluated: false,
                evaluatedAt: new Date(),
                status: "EVALUATED",
            },
            { upsert: true, new: true }
        );

        // Update submission status
        submission.status = "EVALUATED";
        await submission.save();

        res.json(evaluation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Evaluate quiz assignment (adjust marks and add feedback)
export async function evaluateQuizAssignment(req, res) {
    try {
        const { submissionId } = req.params;
        const { adjustedMarks, feedback, answerReviews } = req.body;
        
        const submission = await AssignmentSubmission.findById(submissionId).populate("assignment");
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        // Verify teacher owns the assignment
        if (String(submission.assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Validate marks
        if (adjustedMarks < 0 || adjustedMarks > submission.assignment.totalMarks) {
            return res.status(400).json({ message: "Invalid marks" });
        }

        // Update quiz answers with teacher reviews
        if (answerReviews && answerReviews.length > 0) {
            answerReviews.forEach((review, index) => {
                if (submission.quizSubmission.answers[index]) {
                    submission.quizSubmission.answers[index].marks = review.marks;
                    submission.quizSubmission.answers[index].teacherFeedback = review.feedback;
                }
            });
            await submission.save();
        }

        const evaluation = await AssignmentEvaluation.findOneAndUpdate(
            { submission: submissionId },
            {
                assignment: submission.assignment._id,
                student: submission.student,
                submission: submissionId,
                evaluatedBy: req.user.sub,
                marksObtained: adjustedMarks,
                feedback,
                isAutoEvaluated: false,
                evaluatedAt: new Date(),
                status: "EVALUATED",
            },
            { upsert: true, new: true }
        );

        // Update submission status
        submission.status = "EVALUATED";
        await submission.save();

        res.json(evaluation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get evaluation details
export async function getEvaluation(req, res) {
    try {
        const { submissionId } = req.params;
        
        const evaluation = await AssignmentEvaluation.findOne({ submission: submissionId })
            .populate("assignment", "title totalMarks type")
            .populate("student", "name email")
            .populate("evaluatedBy", "name")
            .populate({
                path: "submission",
                populate: {
                    path: "quizSubmission.answers.question",
                    select: "questionText questionType correctAnswer marks",
                },
            });

        if (!evaluation) {
            return res.status(404).json({ message: "Evaluation not found" });
        }

        // Check access permissions
        if (req.user.role === "student" && String(evaluation.student._id) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (req.user.role === "teacher" && String(evaluation.evaluatedBy._id) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        res.json(evaluation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get evaluation statistics for an assignment
export async function getAssignmentEvaluationStats(req, res) {
    try {
        const { assignmentId } = req.params;
        
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment || String(assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const evaluations = await AssignmentEvaluation.find({ assignment: assignmentId })
            .populate("student", "name email");

        const totalSubmissions = await AssignmentSubmission.countDocuments({ assignment: assignmentId });
        const totalEvaluated = evaluations.length;
        const averageMarks = evaluations.reduce((sum, e) => sum + e.marksObtained, 0) / totalEvaluated || 0;
        
        const gradeDistribution = {
            A: evaluations.filter(e => e.marksObtained >= assignment.totalMarks * 0.9).length,
            B: evaluations.filter(e => e.marksObtained >= assignment.totalMarks * 0.8 && e.marksObtained < assignment.totalMarks * 0.9).length,
            C: evaluations.filter(e => e.marksObtained >= assignment.totalMarks * 0.7 && e.marksObtained < assignment.totalMarks * 0.8).length,
            D: evaluations.filter(e => e.marksObtained >= assignment.totalMarks * 0.6 && e.marksObtained < assignment.totalMarks * 0.7).length,
            F: evaluations.filter(e => e.marksObtained < assignment.totalMarks * 0.6).length,
        };

        res.json({
            totalSubmissions,
            totalEvaluated,
            pendingEvaluation: totalSubmissions - totalEvaluated,
            averageMarks,
            gradeDistribution,
            evaluations: evaluations.map(e => ({
                student: e.student,
                marksObtained: e.marksObtained,
                percentage: (e.marksObtained / assignment.totalMarks) * 100,
                evaluatedAt: e.evaluatedAt,
            })),
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
