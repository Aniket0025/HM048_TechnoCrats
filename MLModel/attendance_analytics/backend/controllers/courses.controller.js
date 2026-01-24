import { HttpError } from "../utils/HttpError.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";

async function getEnrolledCourseIdsForStudent(studentUserId) {
    const enrollments = await Enrollment.find({ studentUserId, status: "active" }).select("courseId");
    return enrollments.map((e) => e.courseId);
}

export async function listCourses(req, res) {
    const role = req.user.role;

    if (role === "student") {
        const ids = await getEnrolledCourseIdsForStudent(req.user.sub);
        const courses = await Course.find({ _id: { $in: ids }, isActive: true })
            .populate("subjectId")
            .populate("teacherUserId", "name email role");
        return res.json({ courses });
    }

    if (role === "teacher") {
        const courses = await Course.find({ teacherUserId: req.user.sub, isActive: true })
            .populate("subjectId")
            .populate("teacherUserId", "name email role");
        return res.json({ courses });
    }

    const courses = await Course.find({})
        .sort({ createdAt: -1 })
        .populate("subjectId")
        .populate("teacherUserId", "name email role");
    return res.json({ courses });
}

export async function createCourse(req, res) {
    const { name, subjectId, teacherUserId, department, semester, section, batchYear } = req.body;

    if (!name || !subjectId) {
        throw new HttpError(400, "name and subjectId are required");
    }

    const course = await Course.create({ name, subjectId, teacherUserId, department, semester, section, batchYear });
    return res.status(201).json({ course });
}

export async function assignTeacher(req, res) {
    const { id } = req.params;
    const { teacherUserId } = req.body;

    if (!teacherUserId) throw new HttpError(400, "teacherUserId is required");

    const teacher = await User.findById(teacherUserId);
    if (!teacher || teacher.role !== "teacher") {
        throw new HttpError(400, "teacherUserId must belong to a teacher");
    }

    const course = await Course.findByIdAndUpdate(id, { teacherUserId }, { new: true });
    if (!course) throw new HttpError(404, "Not found");

    return res.json({ course });
}

export async function enrollStudents(req, res) {
    const { id } = req.params;
    const { studentUserId, studentUserIds } = req.body;

    const course = await Course.findById(id);
    if (!course) throw new HttpError(404, "Course not found");

    if (req.user.role === "teacher" && String(course.teacherUserId || "") !== String(req.user.sub)) {
        throw new HttpError(403, "Forbidden");
    }

    const ids = Array.isArray(studentUserIds) ? studentUserIds : studentUserId ? [studentUserId] : [];
    if (ids.length === 0) throw new HttpError(400, "studentUserId or studentUserIds required");

    const students = await User.find({ _id: { $in: ids } }).select("_id role");
    const studentIdSet = new Set(students.filter((u) => u.role === "student").map((u) => u._id.toString()));

    const docs = [];
    for (const sid of ids) {
        if (!studentIdSet.has(String(sid))) continue;
        docs.push({ courseId: id, studentUserId: sid });
    }

    if (docs.length === 0) throw new HttpError(400, "No valid students");

    const result = await Enrollment.insertMany(docs, { ordered: false }).catch(() => []);
    return res.json({ ok: true, enrolled: Array.isArray(result) ? result.length : 0 });
}

export async function listCourseStudents(req, res) {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) throw new HttpError(404, "Course not found");

    if (req.user.role === "teacher" && String(course.teacherUserId || "") !== String(req.user.sub)) {
        throw new HttpError(403, "Forbidden");
    }

    const enrollments = await Enrollment.find({ courseId: id, status: "active" }).populate(
        "studentUserId",
        "name email role department avatar"
    );
    const students = enrollments.map((e) => e.studentUserId);

    return res.json({ students });
}
