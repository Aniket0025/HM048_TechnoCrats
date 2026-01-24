import { api } from "./base";

export async function saveDailyNote(payload: {
    classId: string;
    excalidrawData: any;
    excalidrawFiles: any[];
    tags: string[];
    isPublic: boolean;
}) {
    const { data } = await api.post("/daily-notes", payload);
    return data;
}

export async function listDailyNotes(params?: {
    subject?: string;
    batch?: string;
    teacher?: string;
    from?: string;
    to?: string;
}) {
    const { data } = await api.get("/daily-notes", { params });
    return data;
}

export async function getDailyNote(id: string) {
    const { data } = await api.get(`/daily-notes/${id}`);
    return data;
}

export async function exportDailyNote(id: string, format: "png" | "pdf") {
    const { data } = await api.get(`/daily-notes/${id}/export/${format}`);
    return data;
}
