import { api } from "./base";

export interface TimetableStructure {
    _id: string;
    academicYear: string;
    workingDays: string[];
    lecturesPerDay: number;
    lectureDuration: number;
    startTime: string;
    lunchBreak: {
        afterLecture: number;
        duration: number;
    };
    recessBreaks?: Array<{
        afterLecture: number;
        duration: number;
    }>;
    constraints?: Array<{
        type: string;
        value: string;
    }>;
    isActive: boolean;
    createdAt: string;
}

export interface AcademicData {
    faculty: Array<{
        id: string;
        name: string;
        email: string;
        subjects: Array<{
            id: string;
            name: string;
            code: string;
            type: string;
        }>;
    }>;
    subjects: Array<{
        id: string;
        name: string;
        code: string;
        type: string;
        lecturesPerWeek: number;
        difficulty: string;
        divisions: Array<{
            id: string;
            name: string;
        }>;
    }>;
    divisions: Array<{
        id: string;
        name: string;
        academicYear: string;
        studentCount: number;
    }>;
}

export interface TimetableSlot {
    day: string;
    lectureNumber: number;
    subject?: {
        _id: string;
        name: string;
        code: string;
        type: string;
    };
    faculty?: {
        _id: string;
        name: string;
        email: string;
    };
    room: string;
    isLab?: boolean;
    isBreak?: boolean;
    breakType?: 'LUNCH' | 'RECESS';
}

export interface Timetable {
    _id: string;
    academicYear: string;
    division: {
        _id: string;
        name: string;
        academicYear: string;
    };
    semester: string;
    slots: TimetableSlot[];
    structure: TimetableStructure;
    generatedBy: {
        _id: string;
        name: string;
    };
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    version: number;
    conflicts?: Array<{
        type: string;
        description: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
    statistics?: {
        totalLectures: number;
        theoryLectures: number;
        labLectures: number;
        facultyUtilization: number;
        roomUtilization: number;
        complianceScore: number;
    };
    createdAt: string;
}

export interface FormattedTimetable {
    [day: string]: TimetableSlot[];
}

// Step 1: Get academic years
export async function getAcademicYears() {
    const { data } = await api.get("/ai-timetable/academic-years");
    return data;
}

// Step 2: Create timetable structure
export async function createTimetableStructure(structure: Partial<TimetableStructure>) {
    const { data } = await api.post("/ai-timetable/structure", structure);
    return data;
}

// Step 3: Get timetable structures
export async function getTimetableStructures() {
    const { data } = await api.get("/ai-timetable/structures");
    return data;
}

// Step 4: Get academic data preview
export async function getAcademicDataPreview(academicYear: string, semester: string) {
    const { data } = await api.get("/ai-timetable/academic-data-preview", {
        params: { academicYear, semester }
    });
    return data;
}

// Step 5: Generate AI timetable
export async function generateAITimetable(params: {
    academicYear: string;
    semester: string;
    structureId: string;
}) {
    const { data } = await api.post("/ai-timetable/generate", params);
    return data;
}

// Step 6: Get generated timetables
export async function getGeneratedTimetables(params?: {
    academicYear?: string;
    semester?: string;
    status?: string;
}) {
    const { data } = await api.get("/ai-timetable/generated", { params });
    return data;
}

// Step 7: Get specific timetable with details
export async function getTimetableDetails(id: string) {
    const { data } = await api.get(`/ai-timetable/${id}`);
    return data;
}

// Step 8: Publish timetable
export async function publishTimetable(id: string) {
    const { data } = await api.patch(`/ai-timetable/${id}/publish`);
    return data;
}

// Step 9: Update timetable
export async function updateTimetable(id: string, slots: TimetableSlot[]) {
    const { data } = await api.put(`/ai-timetable/${id}`, { slots });
    return data;
}
