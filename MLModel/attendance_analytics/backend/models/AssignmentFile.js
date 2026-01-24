import mongoose from "mongoose";

const assignmentFileSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    filePath: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const AssignmentFile = mongoose.model("AssignmentFile", assignmentFileSchema);
