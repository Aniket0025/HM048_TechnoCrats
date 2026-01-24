import { HttpError } from "../utils/HttpError.js";
import { User } from "../models/User.js";
import { Subject } from "../models/Subject.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";

export async function bulkUsers(req, res) {
    const { users } = req.body;

    if (!Array.isArray(users)) {
        throw new HttpError(400, "users[] is required");
    }

    const created = [];
    const errors = [];

    for (const row of users) {
        try {
            const name = String(row?.name || "").trim();
            const email = String(row?.email || "").trim();
            const password = String(row?.password || "");
            const role = row?.role;
            const department = row?.department;
            const avatar = row?.avatar;

            if (!name || !email || !password || !role) {
                errors.push({ row, message: "name, email, password, role required" });
                continue;
            }

            const user = await User.create({ name, email, password, role, department, avatar });
            created.push(user);
        } catch (e) {
            errors.push({ row, message: e?.message || "error" });
        }
    }

    return res.json({ ok: true, created: created.length, errors });
}

export async function bulkSubjects(req, res) {
    const { subjects } = req.body;
    if (!Array.isArray(subjects)) throw new HttpError(400, "subjects[] is required");

    const created = [];
    const errors = [];

    for (const row of subjects) {
        try {
            const code = row?.code;
            const name = row?.name;
            const department = row?.department;
            const semester = row?.semester;
            if (!code || !name) {
                errors.push({ row, message: "code and name required" });
                continue;
            }
            const subject = await Subject.create({ code, name, department, semester });
            created.push(subject);
        } catch (e) {
            errors.push({ row, message: e?.message || "error" });
        }
    }

    return res.json({ ok: true, created: created.length, errors });
}

export async function bulkCourses(req, res) {
    const { courses } = req.body;
    if (!Array.isArray(courses)) throw new HttpError(400, "courses[] is required");

    const created = [];
    const errors = [];

    for (const row of courses) {
        try {
            const name = row?.name;
            const subjectId = row?.subjectId;
            const teacherUserId = row?.teacherUserId;
            const department = row?.department;
            const semester = row?.semester;
            const section = row?.section;
            const batchYear = row?.batchYear;

            if (!name || !subjectId) {
                errors.push({ row, message: "name and subjectId required" });
                continue;
            }

            const course = await Course.create({ name, subjectId, teacherUserId, department, semester, section, batchYear });
            created.push(course);
        } catch (e) {
            errors.push({ row, message: e?.message || "error" });
        }
    }

    return res.json({ ok: true, created: created.length, errors });
}

export async function bulkEnrollments(req, res) {
    const { enrollments } = req.body;
    if (!Array.isArray(enrollments)) throw new HttpError(400, "enrollments[] is required");

    const created = [];
    const errors = [];

    for (const row of enrollments) {
        try {
            const courseId = row?.courseId;
            const studentUserId = row?.studentUserId;
            if (!courseId || !studentUserId) {
                errors.push({ row, message: "courseId and studentUserId required" });
                continue;
            }
            const doc = await Enrollment.create({ courseId, studentUserId, status: "active" });
            created.push(doc);
        } catch (e) {
            errors.push({ row, message: e?.message || "error" });
        }
    }

    return res.json({ ok: true, created: created.length, errors });
}
