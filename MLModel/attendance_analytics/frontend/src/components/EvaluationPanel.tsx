import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    getAssignmentSubmissions,
    evaluateFileAssignment,
    evaluateQuizAssignment,
    getAssignmentEvaluationStats,
} from "@/api/assignments";
import { format } from "date-fns";
import {
    Download,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    Star,
    MessageSquare,
    BarChart3,
} from "lucide-react";

interface Props {
    assignmentId: string;
    totalMarks: number;
    assignmentType: "FILE" | "QUIZ";
}

interface SubmissionWithEvaluation {
    _id: string;
    student: { _id: string; name: string; email: string };
    assignment: any;
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
            question: {
                _id: string;
                questionText: string;
                questionType: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
                correctAnswer: string;
                marks: number;
            };
            answer: string;
            marks: number;
            isCorrect?: boolean;
            teacherFeedback?: string;
        }[];
        startedAt: string;
        submittedAt: string;
        timeTakenMinutes: number;
    };
    status: "DRAFT" | "SUBMITTED" | "LATE" | "EVALUATED";
    submittedAt: string;
    isLate: boolean;
    attemptNumber: number;
    evaluation?: {
        _id: string;
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
    };
}

export default function EvaluationPanel({
    assignmentId,
    totalMarks,
    assignmentType,
}: Props) {
    const [submissions, setSubmissions] = useState<SubmissionWithEvaluation[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithEvaluation | null>(null);
    const [loading, setLoading] = useState(true);
    const [evaluating, setEvaluating] = useState(false);

    // Evaluation form state
    const [marksObtained, setMarksObtained] = useState("");
    const [feedback, setFeedback] = useState("");
    const [answerReviews, setAnswerReviews] = useState<{ marks: number; feedback: string }[]>([]);

    useEffect(() => {
        loadData();
    }, [assignmentId]);

    const loadData = async () => {
        try {
            const [submissionsData, statsData] = await Promise.all([
                getAssignmentSubmissions(assignmentId),
                getAssignmentEvaluationStats(assignmentId),
            ]);
            setSubmissions(submissionsData);
            setStats(statsData);
        } catch (error) {
            console.error("Failed to load evaluation data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSubmission = (submission: SubmissionWithEvaluation) => {
        setSelectedSubmission(submission);
        
        // Pre-fill evaluation form
        if (submission.evaluation) {
            setMarksObtained(submission.evaluation.marksObtained.toString());
            setFeedback(submission.evaluation.feedback || "");
        } else {
            setMarksObtained("");
            setFeedback("");
        }

        // For quiz submissions, initialize answer reviews
        if (assignmentType === "QUIZ" && submission.quizSubmission) {
            setAnswerReviews(
                submission.quizSubmission.answers.map((answer) => ({
                    marks: answer.marks,
                    feedback: answer.teacherFeedback || "",
                }))
            );
        }
    };

    const handleEvaluate = async () => {
        if (!selectedSubmission) return;

        setEvaluating(true);
        try {
            if (assignmentType === "FILE") {
                await evaluateFileAssignment(selectedSubmission._id, {
                    marksObtained: Number(marksObtained),
                    feedback,
                });
            } else {
                await evaluateQuizAssignment(selectedSubmission._id, {
                    adjustedMarks: Number(marksObtained),
                    feedback,
                    answerReviews,
                });
            }
            
            await loadData(); // Refresh data
            alert("Evaluation saved successfully!");
        } catch (error) {
            console.error("Failed to save evaluation:", error);
            alert("Failed to save evaluation. Please try again.");
        } finally {
            setEvaluating(false);
        }
    };

    const handleDownloadFile = (submission: SubmissionWithEvaluation) => {
        if (submission.fileSubmission) {
            // Create download link
            const link = document.createElement("a");
            link.href = `/api/submissions/download/${submission.fileSubmission.filename}`;
            link.download = submission.fileSubmission.originalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const updateAnswerReview = (index: number, field: "marks" | "feedback", value: string | number) => {
        const updated = [...answerReviews];
        updated[index] = { ...updated[index], [field]: value };
        setAnswerReviews(updated);
    };

    const getStatusBadge = (submission: SubmissionWithEvaluation) => {
        if (submission.evaluation) {
            return <Badge variant="default">Evaluated</Badge>;
        }
        if (submission.isLate) {
            return <Badge variant="destructive">Late</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading evaluation data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Assignment Evaluation</h1>
                <Button variant="outline" onClick={() => window.location.href = `/assignments/${assignmentId}`}>
                    Back to Assignment
                </Button>
            </div>

            {/* Statistics */}
            {stats && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Evaluation Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                                <p className="text-sm text-gray-600">Total Submissions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{stats.totalEvaluated}</p>
                                <p className="text-sm text-gray-600">Evaluated</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{stats.averageMarks.toFixed(1)}</p>
                                <p className="text-sm text-gray-600">Average Score</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{stats.pendingEvaluation}</p>
                                <p className="text-sm text-gray-600">Pending</p>
                            </div>
                        </div>
                        
                        {/* Grade Distribution */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Grade Distribution</h4>
                            <div className="space-y-2">
                                {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                                    <div key={grade} className="flex items-center gap-2">
                                        <span className="w-8 text-sm font-medium">{grade}:</span>
                                        <Progress value={(Number(count) / Number(stats.totalEvaluated)) * 100} className="flex-1" />
                                        <span className="w-8 text-sm">{String(count)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Submissions List */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Submissions ({submissions.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                            {submissions.map((submission) => (
                                <div
                                    key={submission._id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                        selectedSubmission?._id === submission._id
                                            ? "border-blue-500 bg-blue-50"
                                            : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => handleSelectSubmission(submission)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">{submission.student.name}</span>
                                        {getStatusBadge(submission)}
                                    </div>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>Submitted: {format(new Date(submission.submittedAt), "PPP")}</p>
                                        {submission.evaluation && (
                                            <p className="font-semibold">
                                                Score: {submission.evaluation.marksObtained}/{totalMarks}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Evaluation Form */}
                <div className="lg:col-span-2">
                    {selectedSubmission ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Evaluate: {selectedSubmission.student.name}</span>
                                    {selectedSubmission.fileSubmission && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadFile(selectedSubmission)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download File
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="evaluation" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                                        {assignmentType === "QUIZ" && (
                                            <TabsTrigger value="answers">Answer Review</TabsTrigger>
                                        )}
                                    </TabsList>
                                    
                                    <TabsContent value="evaluation" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="marks">Marks Obtained</Label>
                                                <Input
                                                    id="marks"
                                                    type="number"
                                                    min="0"
                                                    max={totalMarks}
                                                    value={marksObtained}
                                                    onChange={(e) => setMarksObtained(e.target.value)}
                                                    placeholder={`out of ${totalMarks}`}
                                                />
                                            </div>
                                            <div>
                                                <Label>Percentage</Label>
                                                <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                                                    {marksObtained ? ((Number(marksObtained) / totalMarks) * 100).toFixed(1) : "0"}%
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="feedback">Feedback</Label>
                                            <Textarea
                                                id="feedback"
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                placeholder="Provide detailed feedback to the student..."
                                                rows={6}
                                            />
                                        </div>

                                        <Button
                                            onClick={handleEvaluate}
                                            disabled={evaluating || !marksObtained}
                                            className="w-full"
                                        >
                                            {evaluating ? "Saving..." : "Save Evaluation"}
                                        </Button>
                                    </TabsContent>

                                    {assignmentType === "QUIZ" && (
                                        <TabsContent value="answers" className="space-y-4">
                                            <div className="space-y-4">
                                                {selectedSubmission.quizSubmission?.answers.map((answer, index) => (
                                                    <Card key={index}>
                                                        <CardContent className="pt-4">
                                                            <div className="space-y-3">
                                                                <p className="font-medium">
                                                                    Q{index + 1}: {answer.question.questionText}
                                                                </p>
                                                                <div className="text-sm text-gray-600">
                                                                    <p><strong>Student Answer:</strong> {answer.answer}</p>
                                                                    <p><strong>Correct Answer:</strong> {answer.question.correctAnswer}</p>
                                                                    <p><strong>Auto Score:</strong> {answer.marks}/{answer.question.marks}</p>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <div>
                                                                        <Label>Adjusted Marks</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max={answer.question.marks}
                                                                            value={answerReviews[index]?.marks || 0}
                                                                            onChange={(e) => updateAnswerReview(index, "marks", Number(e.target.value))}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label>Feedback</Label>
                                                                        <Input
                                                                            value={answerReviews[index]?.feedback || ""}
                                                                            onChange={(e) => updateAnswerReview(index, "feedback", e.target.value)}
                                                                            placeholder="Question-specific feedback"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </TabsContent>
                                    )}
                                </Tabs>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No submission selected</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Select a submission from the list to start evaluating.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
