import mongoose from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["FILE", "QUIZ"], required: true },
    // File-based submission
    fileSubmission: {
        filename: { type: String },
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
        filePath: { type: String },
    },
    // Quiz-based submission
    quizSubmission: {
        answers: [{
            question: { type: mongoose.Schema.Types.ObjectId, ref: "QuizQuestion" },
            answer: { type: String, required: true },
            marks: { type: Number, default: 0 },
            isCorrect: { type: Boolean },
        }],
        startedAt: { type: Date, required: true },
        submittedAt: { type: Date, required: true },
        timeTakenMinutes: { type: Number },
    },
    status: {
        type: String,
        enum: ["DRAFT", "SUBMITTED", "LATE", "EVALUATED"],
        default: "DRAFT",
    },
    submittedAt: { type: Date },
    isLate: { type: Boolean, default: false },
    attemptNumber: { type: Number, default: 1 },
}, { timestamps: true });

// Indexes
assignmentSubmissionSchema.index({ assignment: 1, student: 1 });
assignmentSubmissionSchema.index({ student: 1, status: 1 });

export const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);
