import { HttpError } from "../utils/HttpError.js";
import { Profile } from "../models/Profile.js";
import { User } from "../models/User.js";

export async function getMyProfile(req, res) {
    const profile = await Profile.findOne({ userId: req.user.sub }).populate(
        "userId",
        "name email role department avatar"
    );

    if (!profile) {
        const user = await User.findById(req.user.sub);
        if (!user) throw new HttpError(404, "User not found");
        return res.json({ profile: null, user });
    }

    return res.json({ profile });
}

export async function updateMyProfile(req, res) {
    const {
        bio,
        phone,
        address,
        dateOfBirth,
        gender,
        emergencyContact,
        socialLinks,
        preferences,
    } = req.body;

    const update = {};
    if (bio !== undefined) update.bio = bio;
    if (phone !== undefined) update.phone = phone;
    if (address !== undefined) update.address = address;
    if (dateOfBirth !== undefined) update.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) update.gender = gender;
    if (emergencyContact !== undefined) update.emergencyContact = emergencyContact;
    if (socialLinks !== undefined) update.socialLinks = socialLinks;
    if (preferences !== undefined) update.preferences = preferences;

    let profile = await Profile.findOne({ userId: req.user.sub });

    if (!profile) {
        profile = await Profile.create({ userId: req.user.sub, ...update });
    } else {
        Object.assign(profile, update);
        await profile.save();
    }

    await profile.populate("userId", "name email role department avatar");

    return res.json({ profile });
}

export async function getProfileByUserId(req, res) {
    const { userId } = req.params;

    const profile = await Profile.findOne({ userId }).populate(
        "userId",
        "name email role department avatar"
    );

    if (!profile) throw new HttpError(404, "Profile not found");

    return res.json({ profile });
}
