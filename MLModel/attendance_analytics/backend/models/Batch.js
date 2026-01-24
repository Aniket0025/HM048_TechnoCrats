import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    year: Number,
    department: String,
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

export const Batch = mongoose.model("Batch", batchSchema);
