import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    getStudentAssignments,
    getStudentSubmissions,
    Assignment,
    AssignmentSubmission,
} from "@/api/assignments";
import { format } from "date-fns";
import { Clock, FileText, CheckCircle, AlertCircle, Play, Download, Upload, Eye } from "lucide-react";

export default function StudentAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [filter, setFilter] = useState({ subject: "", status: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [assignmentsData, submissionsData] = await Promise.all([
                getStudentAssignments(),
                getStudentSubmissions(),
            ]);
            setAssignments(assignmentsData);
            setSubmissions(submissionsData);
        } catch (error) {
            console.error("Failed to load assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionStatus = (assignmentId: string) => {
        const submission = submissions.find(s => s.assignment._id === assignmentId);
        if (!submission) return null;
        return submission;
    };

    const getStatusBadge = (assignment: Assignment, submission?: AssignmentSubmission) => {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isOverdue = now > dueDate;

        if (!submission) {
            return <Badge variant={isOverdue ? "destructive" : "secondary"}>
                {isOverdue ? "Overdue" : "Pending"}
            </Badge>;
        }

        if (submission.status === "EVALUATED") {
            return <Badge variant="default">Evaluated</Badge>;
        }

        if (submission.isLate) {
            return <Badge variant="destructive">Late Submission</Badge>;
        }

        return <Badge variant="secondary">Submitted</Badge>;
    };

    const filteredAssignments = assignments.filter(assignment => {
        if (filter.subject && assignment.subject._id !== filter.subject) return false;
        if (filter.status) {
            const submission = getSubmissionStatus(assignment._id);
            if (filter.status === "submitted" && !submission) return false;
            if (filter.status === "pending" && submission) return false;
            if (filter.status === "evaluated" && submission?.status !== "EVALUATED") return false;
        }
        return true;
    });

    if (loading) {
        return <div className="p-6">Loading assignments...</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Assignments</h1>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <Select value={filter.subject} onValueChange={(value) => setFilter({ ...filter, subject: value })}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Subjects</SelectItem>
                        {Array.from(new Set(assignments.map(a => a.subject))).map(subject => (
                            <SelectItem key={subject._id} value={subject._id}>
                                {subject.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filter.status} onValueChange={(value) => setFilter({ ...filter, status: value })}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="evaluated">Evaluated</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => {
                    const submission = getSubmissionStatus(assignment._id);
                    const isOverdue = new Date() > new Date(assignment.dueDate);

                    return (
                        <Card key={assignment._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg line-clamp-2">{assignment.title}</CardTitle>
                                    <Badge variant="outline">{assignment.type}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">{assignment.subject.name}</p>
                                    <p className="text-sm text-gray-600">{assignment.batch.name}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>Due: {format(new Date(assignment.dueDate), "PPP p")}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Marks: {assignment.totalMarks}</span>
                                    {getStatusBadge(assignment, submission)}
                                </div>

                                {submission && (
                                    <div className="text-sm space-y-1">
                                        <p>Submitted: {format(new Date(submission.submittedAt!), "PPP")}</p>
                                        {submission.status === "EVALUATED" && (
                                            <p className="font-semibold text-green-600">
                                                Score: {submission.evaluation?.marksObtained || "N/A"}/{assignment.totalMarks}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {assignment.type === "FILE" ? (
                                        <Button
                                            className="flex-1"
                                            onClick={() => window.location.href = `/assignments/${assignment._id}/submit`}
                                            disabled={submission && !assignment.allowResubmission}
                                        >
                                            {submission ? (
                                                <>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    {assignment.allowResubmission ? "Resubmit" : "Submitted"}
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Submit File
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="flex-1"
                                            onClick={() => window.location.href = `/assignments/${assignment._id}/quiz`}
                                            disabled={submission && !assignment.allowResubmission}
                                        >
                                            {submission ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    {assignment.allowResubmission ? "Retake Quiz" : "Completed"}
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Start Quiz
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.href = `/assignments/${assignment._id}`}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>

                                {isOverdue && !submission && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>Assignment is overdue</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredAssignments.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No assignments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters or check back later.
                    </p>
                </div>
            )}
        </div>
    );
}
