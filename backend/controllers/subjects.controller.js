import { HttpError } from "../utils/HttpError.js";
import { Subject } from "../models/Subject.js";

export async function listSubjects(req, res) {
    const items = await Subject.find({}).sort({ createdAt: -1 });
    return res.json({ subjects: items });
}

export async function createSubject(req, res) {
    const { code, name, department, semester } = req.body;

    if (!code || !name) {
        throw new HttpError(400, "code and name are required");
    }

    const subject = await Subject.create({ code, name, department, semester });
    return res.status(201).json({ subject });
}

export async function updateSubject(req, res) {
    const { id } = req.params;
    const { code, name, department, semester } = req.body;

    const subject = await Subject.findByIdAndUpdate(
        id,
        { code, name, department, semester },
        { new: true }
    );

    if (!subject) throw new HttpError(404, "Not found");
    return res.json({ subject });
}

export async function deleteSubject(req, res) {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) throw new HttpError(404, "Not found");
    return res.json({ ok: true });
}
