import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        bio: { type: String, trim: true, maxlength: 500 },
        phone: { type: String, trim: true },
        address: { type: String, trim: true },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"] },
        emergencyContact: {
            name: { type: String, trim: true },
            phone: { type: String, trim: true },
            relation: { type: String, trim: true },
        },
        socialLinks: {
            linkedin: { type: String, trim: true },
            github: { type: String, trim: true },
            portfolio: { type: String, trim: true },
        },
        preferences: {
            language: { type: String, default: "en" },
            timezone: { type: String, default: "UTC" },
            emailNotifications: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

export const Profile = mongoose.model("Profile", profileSchema);
