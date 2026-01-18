import { HttpError } from "../utils/HttpError.js";
import { Mark } from "../models/Mark.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";

export async function upsertMark(req, res) {
    const { courseId, studentUserId, type, title, maxMarks, marks } = req.body;

    if (!courseId || !studentUserId || !type || !title || maxMarks === undefined || marks === undefined) {
        throw new HttpError(400, "courseId, studentUserId, type, title, maxMarks, marks are required");
    }

    const course = await Course.findById(courseId);
    if (!course) throw new HttpError(404, "Course not found");

    if (String(course.teacherUserId || "") !== String(req.user.sub)) {
        throw new HttpError(403, "Forbidden");
    }

    const enrolled = await Enrollment.findOne({ courseId, studentUserId, status: "active" });
    if (!enrolled) throw new HttpError(400, "Student not enrolled");

    const doc = await Mark.findOneAndUpdate(
        { courseId, studentUserId, type, title },
        { courseId, studentUserId, type, title, maxMarks, marks, gradedByUserId: req.user.sub, gradedAt: new Date() },
        { upsert: true, new: true }
    );

    return res.status(201).json({ mark: doc });
}

export async function bulkUpsertMarks(req, res) {
    const { courseId, type, title, maxMarks, items } = req.body;

    if (!courseId || !type || !title || maxMarks === undefined || !Array.isArray(items)) {
        throw new HttpError(400, "courseId, type, title, maxMarks, items[] are required");
    }

    const course = await Course.findById(courseId);
    if (!course) throw new HttpError(404, "Course not found");

    if (String(course.teacherUserId || "") !== String(req.user.sub)) {
        throw new HttpError(403, "Forbidden");
    }

    const writes = [];
    for (const row of items) {
        const studentUserId = row?.studentUserId;
        const marks = row?.marks;
        if (!studentUserId || marks === undefined) continue;
        writes.push({
            updateOne: {
                filter: { courseId, studentUserId, type, title },
                update: { $set: { courseId, studentUserId, type, title, maxMarks, marks, gradedByUserId: req.user.sub, gradedAt: new Date() } },
                upsert: true,
            },
        });
    }

    if (writes.length === 0) throw new HttpError(400, "No valid rows");

    const result = await Mark.bulkWrite(writes, { ordered: false });
    return res.json({ ok: true, modified: result.modifiedCount, upserted: result.upsertedCount });
}

export async function getMyMarks(req, res) {
    const marks = await Mark.find({ studentUserId: req.user.sub }).populate({
        path: "courseId",
        populate: [{ path: "subjectId" }, { path: "teacherUserId", select: "name email" }],
    });
    return res.json({ marks });
}

export async function getCourseMarks(req, res) {
    const { courseId } = req.params;

    if (req.user.role === "teacher") {
        const course = await Course.findById(courseId);
        if (!course) throw new HttpError(404, "Course not found");
        if (String(course.teacherUserId || "") !== String(req.user.sub)) {
            throw new HttpError(403, "Forbidden");
        }
    }

    const marks = await Mark.find({ courseId }).populate("studentUserId", "name email department");
    return res.json({ marks });
}
