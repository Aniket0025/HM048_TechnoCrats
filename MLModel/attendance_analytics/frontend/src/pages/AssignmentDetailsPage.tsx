import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAssignmentDetails } from "@/api/assignments";
import { format } from "date-fns";
import { ArrowLeft, Download, FileText, Clock, Users, Award } from "lucide-react";

export default function AssignmentDetailsPage() {
    const [assignmentData, setAssignmentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pathParts = window.location.pathname.split("/");
        const assignmentId = pathParts[pathParts.length - 1];
        if (assignmentId) {
            loadAssignmentDetails(assignmentId);
        }
    }, []);

    const loadAssignmentDetails = async (assignmentId: string) => {
        try {
            const data = await getAssignmentDetails(assignmentId);
            setAssignmentData(data);
        } catch (error) {
            console.error("Failed to load assignment details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFile = (file: any) => {
        const link = document.createElement("a");
        link.href = `/api/assignments/files/${file.filename}`;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading assignment details...</p>
                </div>
            </div>
        );
    }

    if (!assignmentData) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Assignment not found</h3>
                    <Button className="mt-4" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    const { assignment, files, questions, submission } = assignmentData;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold">{assignment.title}</h1>
            </div>

            {/* Assignment Info */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle>Assignment Details</CardTitle>
                        <div className="flex gap-2">
                            <Badge variant={assignment.type === "FILE" ? "default" : "secondary"}>
                                {assignment.type === "FILE" ? "File Assignment" : "Quiz"}
                            </Badge>
                            <Badge variant={assignment.status === "PUBLISHED" ? "default" : "secondary"}>
                                {assignment.status}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-700">{assignment.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Subject</p>
                            <p className="font-medium">{assignment.subject.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Batch</p>
                            <p className="font-medium">{assignment.batch.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Teacher</p>
                            <p className="font-medium">{assignment.teacher.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Marks</p>
                            <p className="font-medium">{assignment.totalMarks}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Due Date</p>
                                <p className="font-medium">{format(new Date(assignment.dueDate), "PPP p")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="font-medium">{format(new Date(assignment.createdAt), "PPP")}</p>
                            </div>
                        </div>
                        {assignment.publishedAt && (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-600">Published</p>
                                    <p className="font-medium">{format(new Date(assignment.publishedAt), "PPP")}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Assignment Files */}
            {files && files.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Assignment Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {files.map((file: any) => (
                                <div key={file._id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="font-medium">{file.originalName}</p>
                                            <p className="text-sm text-gray-500">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDownloadFile(file)}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quiz Questions */}
            {questions && questions.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Quiz Questions ({questions.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {questions.map((question: any, index: number) => (
                                <Card key={question._id}>
                                    <CardContent className="pt-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">Q{index + 1}</Badge>
                                                <Badge variant="secondary">{question.questionType}</Badge>
                                                <span className="text-sm font-medium">{question.marks} marks</span>
                                            </div>
                                            <p className="font-medium">{question.questionText}</p>
                                            {question.options && (
                                                <div className="space-y-1">
                                                    {question.options.map((option: string, optIndex: number) => (
                                                        <div key={optIndex} className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">
                                                                {String.fromCharCode(65 + optIndex)}.
                                                            </span>
                                                            <span className="text-sm">{option}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Student Submission */}
            {submission && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Your Submission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <Badge variant={submission.status === "EVALUATED" ? "default" : "secondary"}>
                                        {submission.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Submitted</p>
                                    <p className="font-medium">
                                        {format(new Date(submission.submittedAt), "PPP p")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Attempt</p>
                                    <p className="font-medium">#{submission.attemptNumber}</p>
                                </div>
                                {submission.isLate && (
                                    <div>
                                        <p className="text-sm text-gray-600">Late</p>
                                        <Badge variant="destructive">Yes</Badge>
                                    </div>
                                )}
                            </div>

                            {submission.fileSubmission && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Submitted File</p>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-green-500" />
                                            <div>
                                                <p className="font-medium">{submission.fileSubmission.originalName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(submission.fileSubmission.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadFile(submission.fileSubmission)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {submission.evaluation && (
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium mb-2">Evaluation Results</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Marks Obtained</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {submission.evaluation.marksObtained}/{assignment.totalMarks}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Percentage</p>
                                            <p className="text-lg font-bold">
                                                {((submission.evaluation.marksObtained / assignment.totalMarks) * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                    {submission.evaluation.feedback && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium mb-1">Feedback</p>
                                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                                {submission.evaluation.feedback}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
