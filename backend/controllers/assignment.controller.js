import { Assignment } from "../models/Assignment.js";
import { AssignmentFile } from "../models/AssignmentFile.js";
import { QuizQuestion } from "../models/QuizQuestion.js";
import { AssignmentSubmission } from "../models/AssignmentSubmission.js";
import { AssignmentEvaluation } from "../models/AssignmentEvaluation.js";
import { User } from "../models/User.js";

// Create new assignment (File or Quiz type)
export async function createAssignment(req, res) {
    try {
        const {
            title,
            description,
            type,
            subject,
            batch,
            dueDate,
            totalMarks,
            allowedFileTypes,
            maxFileSizeMB,
            allowResubmission,
            quizSettings,
        } = req.body;

        const assignment = await Assignment.create({
            title,
            description,
            type,
            subject,
            batch,
            teacher: req.user.sub,
            dueDate: new Date(dueDate),
            totalMarks,
            allowedFileTypes: allowedFileTypes ? allowedFileTypes.split(",") : ["pdf"],
            maxFileSizeMB: maxFileSizeMB || 10,
            allowResubmission: allowResubmission || false,
            quizSettings: quizSettings || {},
        });

        res.status(201).json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Upload assignment file (teacher)
export async function uploadAssignmentFile(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { assignmentId } = req.body;
        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment || String(assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const fileRecord = await AssignmentFile.create({
            assignment: assignmentId,
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            filePath: req.file.path,
            uploadedBy: req.user.sub,
        });

        res.status(201).json(fileRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Add quiz questions to assignment
export async function addQuizQuestions(req, res) {
    try {
        const { assignmentId, questions } = req.body;
        
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment || String(assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const quizQuestions = await QuizQuestion.insertMany(
            questions.map((q, index) => ({
                ...q,
                assignment: assignmentId,
                order: index + 1,
            }))
        );

        res.status(201).json(quizQuestions);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get assignments for teacher
export async function getTeacherAssignments(req, res) {
    try {
        const { subject, batch, status } = req.query;
        const filter = { teacher: req.user.sub };
        
        if (subject) filter.subject = subject;
        if (batch) filter.batch = batch;
        if (status) filter.status = status;

        const assignments = await Assignment.find(filter)
            .populate("subject", "name code")
            .populate("batch", "name")
            .sort({ createdAt: -1 });

        res.json(assignments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get assignments for student
export async function getStudentAssignments(req, res) {
    try {
        const student = await User.findById(req.user.sub).populate("batches");
        const batchIds = student.batches.map(b => b._id);
        
        const filter = {
            batch: { $in: batchIds },
            status: "PUBLISHED",
        };

        const assignments = await Assignment.find(filter)
            .populate("subject", "name code")
            .populate("batch", "name")
            .populate("teacher", "name")
            .sort({ dueDate: 1 });

        res.json(assignments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Get assignment details with questions/files
export async function getAssignmentDetails(req, res) {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id)
            .populate("subject", "name code")
            .populate("batch", "name")
            .populate("teacher", "name");

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        // Get assignment files
        const files = await AssignmentFile.find({ assignment: id });
        
        // Get quiz questions if it's a quiz
        let questions = [];
        if (assignment.type === "QUIZ") {
            questions = await QuizQuestion.find({ assignment: id }).sort({ order: 1 });
        }

        // Get student's submission if student
        let submission = null;
        if (req.user.role === "student") {
            submission = await AssignmentSubmission.findOne({
                assignment: id,
                student: req.user.sub,
            }).populate("quizSubmission.answers.question");
        }

        res.json({ assignment, files, questions, submission });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Publish assignment
export async function publishAssignment(req, res) {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id);
        
        if (!assignment || String(assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        assignment.status = "PUBLISHED";
        assignment.publishedAt = new Date();
        await assignment.save();

        res.json(assignment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Delete assignment (only if no submissions)
export async function deleteAssignment(req, res) {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findById(id);
        
        if (!assignment || String(assignment.teacher) !== req.user.sub) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const submissionCount = await AssignmentSubmission.countDocuments({ assignment: id });
        if (submissionCount > 0) {
            return res.status(400).json({ message: "Cannot delete assignment with submissions" });
        }

        await Assignment.findByIdAndDelete(id);
        await QuizQuestion.deleteMany({ assignment: id });
        await AssignmentFile.deleteMany({ assignment: id });

        res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
