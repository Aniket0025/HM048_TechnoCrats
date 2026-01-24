import { api } from "./base";

export async function createClass(payload: {
    title: string;
    subject: string;
    batch: string;
    scheduledAt?: string;
    duration?: number;
}) {
    const { data } = await api.post("/classes", payload);
    return data;
}

export async function listClasses() {
    const { data } = await api.get("/classes");
    return data;
}

export async function getClass(id: string) {
    const { data } = await api.get(`/classes/${id}`);
    return data;
}

export async function getTodayNote(classId: string) {
    const { data } = await api.get(`/classes/${classId}/today-note`);
    return data;
}
