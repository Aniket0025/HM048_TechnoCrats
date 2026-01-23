import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTeacherAssignments, Assignment } from "@/api/assignments";
import { format } from "date-fns";
import { Plus, FileText, Users, Calendar, Eye, Edit, Trash2, BarChart3 } from "lucide-react";

export default function TeacherAssignmentsPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [filter, setFilter] = useState({ subject: "", batch: "", status: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const data = await getTeacherAssignments(filter);
            setAssignments(data);
        } catch (error) {
            console.error("Failed to load assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED":
                return <Badge variant="default">Published</Badge>;
            case "DRAFT":
                return <Badge variant="secondary">Draft</Badge>;
            case "CLOSED":
                return <Badge variant="destructive">Closed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        return (
            <Badge variant={type === "FILE" ? "default" : "secondary"}>
                {type === "FILE" ? "File" : "Quiz"}
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading assignments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Assignments</h1>
                <Button onClick={() => window.location.href = "/assignments/create"}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                </Button>
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
                <Select value={filter.batch} onValueChange={(value) => setFilter({ ...filter, batch: value })}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by batch" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Batches</SelectItem>
                        {Array.from(new Set(assignments.map(a => a.batch))).map(batch => (
                            <SelectItem key={batch._id} value={batch._id}>
                                {batch.name}
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
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                    <Card key={assignment._id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg line-clamp-2">{assignment.title}</CardTitle>
                                <div className="flex gap-2">
                                    {getTypeBadge(assignment.type)}
                                    {getStatusBadge(assignment.status)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">{assignment.subject.name}</p>
                                <p className="text-sm text-gray-600">{assignment.batch.name}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {format(new Date(assignment.dueDate), "PPP p")}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total Marks: {assignment.totalMarks}</span>
                                <span className="text-sm text-gray-500">
                                    Created: {format(new Date(assignment.createdAt), "PPP")}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => window.location.href = `/assignments/${assignment._id}`}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                                {assignment.status === "PUBLISHED" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.href = `/assignments/${assignment._id}/evaluate`}
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                )}
                                {assignment.status === "DRAFT" && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.location.href = `/assignments/${assignment._id}/edit`}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {assignments.length === 0 && (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No assignments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Create your first assignment to get started.
                    </p>
                    <Button className="mt-4" onClick={() => window.location.href = "/assignments/create"}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                    </Button>
                </div>
            )}
        </div>
    );
}
