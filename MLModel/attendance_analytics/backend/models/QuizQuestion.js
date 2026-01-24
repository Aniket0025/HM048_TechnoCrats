import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ["MCQ", "TRUE_FALSE", "SHORT_ANSWER"], required: true },
    options: [{ type: String }], // For MCQ
    correctAnswer: { type: String, required: true }, // For MCQ: option index; for TRUE_FALSE: "true"/"false"; for SHORT_ANSWER: model answer
    marks: { type: Number, required: true, min: 0 },
    explanation: { type: String }, // Optional explanation for correct answer
    order: { type: Number, required: true },
}, { timestamps: true });

// Index for ordering questions
quizQuestionSchema.index({ assignment: 1, order: 1 });

export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
