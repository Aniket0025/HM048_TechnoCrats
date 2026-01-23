import { api } from "./base";

export interface Assignment {
    _id: string;
    title: string;
    description: string;
    type: "FILE" | "QUIZ";
    subject: { _id: string; name: string; code: string };
    batch: { _id: string; name: string };
    teacher: { _id: string; name: string };
    dueDate: string;
    totalMarks: number;
    allowedFileTypes: string[];
    maxFileSizeMB: number;
    allowResubmission: boolean;
    quizSettings?: {
        timeLimitMinutes?: number;
        shuffleQuestions?: boolean;
        attemptLimit?: number;
        showCorrectAnswers?: boolean;
    };
    status: "DRAFT" | "PUBLISHED" | "CLOSED";
    publishedAt?: string;
    createdAt: string;
}

export interface QuizQuestion {
    _id: string;
    questionText: string;
    questionType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
    options?: string[];
    correctAnswer: string;
    marks: number;
    explanation?: string;
    order: number;
}

export interface AssignmentFile {
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    filePath: string;
}

export interface AssignmentSubmission {
    _id: string;
    assignment: Assignment;
    student: { _id: string; name: string };
    type: "FILE" | "QUIZ";
    fileSubmission?: {
        filename: string;
        originalName: string;
        mimeType: string;
        size: number;
        filePath: string;
    };
    quizSubmission?: {
        answers: {
            question: QuizQuestion;
            answer: string;
            marks: number;
            isCorrect?: boolean;
        }[];
        startedAt: string;
        submittedAt: string;
        timeTakenMinutes: number;
    };
    status: "DRAFT" | "SUBMITTED" | "LATE" | "EVALUATED";
    submittedAt?: string;
    isLate: boolean;
    attemptNumber: number;
}

export interface AssignmentEvaluation {
    _id: string;
    assignment: Assignment;
    student: { _id: string; name: string };
    submission: AssignmentSubmission;
    evaluatedBy: { _id: string; name: string };
    marksObtained: number;
    feedback?: string;
    rubricScores?: {
        criterion: string;
        score: number;
        maxScore: number;
    }[];
    isAutoEvaluated: boolean;
    evaluatedAt: string;
    status: "PENDING" | "EVALUATED" | "REVIEWED";
}

// Assignment CRUD
export async function createAssignment(data: Partial<Assignment>) {
    const { data: assignment } = await api.post("/assignments", data);
    return assignment;
}

export async function uploadAssignmentFile(assignmentId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignmentId);
    formData.append("type", "assignment-file");
    
    const { data: uploadedFile } = await api.post("/assignments/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return uploadedFile;
}

export async function addQuizQuestions(assignmentId: string, questions: Partial<QuizQuestion>[]) {
    const { data: quizQuestions } = await api.post("/assignments/add-questions", {
        assignmentId,
        questions,
    });
    return quizQuestions;
}

export async function getTeacherAssignments(params?: {
    subject?: string;
    batch?: string;
    status?: string;
}) {
    const { data: assignments } = await api.get("/assignments/teacher", { params });
    return assignments;
}

export async function getStudentAssignments() {
    const { data: assignments } = await api.get("/assignments/student");
    return assignments;
}

export async function getAssignmentDetails(id: string) {
    const { data } = await api.get(`/assignments/${id}`);
    return data;
}

export async function publishAssignment(id: string) {
    const { data: assignment } = await api.patch(`/assignments/${id}/publish`);
    return assignment;
}

export async function deleteAssignment(id: string) {
    await api.delete(`/assignments/${id}`);
}

// Submissions
export async function submitFileAssignment(assignmentId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignmentId);
    formData.append("type", "submission");
    
    const { data: submission } = await api.post("/submissions/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return submission;
}

export async function submitQuizAssignment(assignmentId: string, answers: { answer: string }[], startedAt: string) {
    const { data: submission } = await api.post("/submissions/quiz", {
        assignmentId,
        answers,
        startedAt,
    });
    return submission;
}

export async function getStudentSubmissions(assignmentId?: string) {
    const { data: submissions } = await api.get("/submissions/student", {
        params: assignmentId ? { assignmentId } : {},
    });
    return submissions;
}

export async function getAssignmentSubmissions(assignmentId: string) {
    const { data: submissions } = await api.get(`/submissions/assignment/${assignmentId}`);
    return submissions;
}

// Evaluations
export async function evaluateFileAssignment(submissionId: string, data: {
    marksObtained: number;
    feedback?: string;
    rubricScores?: { criterion: string; score: number; maxScore: number }[];
}) {
    const { data: evaluation } = await api.post(`/evaluations/file/${submissionId}`, data);
    return evaluation;
}

export async function evaluateQuizAssignment(submissionId: string, data: {
    adjustedMarks: number;
    feedback?: string;
    answerReviews?: { marks: number; feedback: string }[];
}) {
    const { data: evaluation } = await api.post(`/evaluations/quiz/${submissionId}`, data);
    return evaluation;
}

export async function getEvaluation(submissionId: string) {
    const { data: evaluation } = await api.get(`/evaluations/submission/${submissionId}`);
    return evaluation;
}

export async function getAssignmentEvaluationStats(assignmentId: string) {
    const { data: stats } = await api.get(`/evaluations/stats/${assignmentId}`);
    return stats;
}
