import mongoose from "mongoose";

const assignmentEvaluationSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "AssignmentSubmission", required: true },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    feedback: { type: String },
    rubricScores: [{
        criterion: { type: String },
        score: { type: Number },
        maxScore: { type: Number },
    }],
    isAutoEvaluated: { type: Boolean, default: false },
    evaluatedAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["PENDING", "EVALUATED", "REVIEWED"],
        default: "PENDING",
    },
}, { timestamps: true });

// Indexes
assignmentEvaluationSchema.index({ assignment: 1, student: 1 });
assignmentEvaluationSchema.index({ evaluatedBy: 1 });

export const AssignmentEvaluation = mongoose.model("AssignmentEvaluation", assignmentEvaluationSchema);
