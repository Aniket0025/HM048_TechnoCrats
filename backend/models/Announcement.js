import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true, trim: true },
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: {
            type: String,
            enum: ["admin", "department", "teacher", "student"],
            required: true,
        },
        department: { type: String, trim: true },
        attachments: [{ type: String, trim: true }],
        isActive: { type: Boolean, default: true },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

announcementSchema.index({ role: 1, department: 1, isActive: 1 });
announcementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Announcement = mongoose.model("Announcement", announcementSchema);
