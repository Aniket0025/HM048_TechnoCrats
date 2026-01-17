import { HttpError } from "../utils/HttpError.js";
import { TimetableEntry } from "../models/TimetableEntry.js";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";

export async function listTimetable(req, res) {
    const { courseId } = req.query;
    const role = req.user.role;

    const populate = {
        path: "courseId",
        populate: [{ path: "subjectId" }, { path: "teacherUserId", select: "name email" }],
    };

    if (courseId) {
        const entries = await TimetableEntry.find({ courseId })
            .sort({ dayOfWeek: 1, startTime: 1 })
            .populate(populate);
        return res.json({ timetable: entries });
    }

    if (role === "student") {
        const enrollments = await Enrollment.find({ studentUserId: req.user.sub, status: "active" }).select("courseId");
        const ids = enrollments.map((e) => e.courseId);
        const entries = await TimetableEntry.find({ courseId: { $in: ids } })
            .sort({ dayOfWeek: 1, startTime: 1 })
            .populate(populate);
        return res.json({ timetable: entries });
    }

    if (role === "teacher") {
        const courses = await Course.find({ teacherUserId: req.user.sub }).select("_id");
        const ids = courses.map((c) => c._id);
        const entries = await TimetableEntry.find({ courseId: { $in: ids } })
            .sort({ dayOfWeek: 1, startTime: 1 })
            .populate(populate);
        return res.json({ timetable: entries });
    }

    const entries = await TimetableEntry.find({})
        .sort({ dayOfWeek: 1, startTime: 1 })
        .populate(populate);
    return res.json({ timetable: entries });
}

export async function createTimetableEntry(req, res) {
    const { courseId, dayOfWeek, startTime, endTime, room } = req.body;

    if (!courseId || dayOfWeek === undefined || !startTime || !endTime) {
        throw new HttpError(400, "courseId, dayOfWeek, startTime, endTime are required");
    }

    const entry = await TimetableEntry.create({
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        room,
        createdByUserId: req.user.sub,
    });

    return res.status(201).json({ timetableEntry: entry });
}

export async function deleteTimetableEntry(req, res) {
    const { id } = req.params;
    const entry = await TimetableEntry.findByIdAndDelete(id);
    if (!entry) throw new HttpError(404, "Not found");
    return res.json({ ok: true });
}
