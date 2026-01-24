import { useState, useEffect } from "react";
import { getAssignmentDetails } from "@/api/assignments";
import FileSubmissionComponent from "@/components/FileSubmissionComponent";
import { ArrowLeft } from "lucide-react";

export default function FileSubmissionPage() {
    const [assignmentData, setAssignmentData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const pathParts = window.location.pathname.split("/");
        const assignmentId = pathParts[pathParts.length - 2];
        if (assignmentId) {
            loadAssignmentDetails(assignmentId);
        }
    }, []);

    const loadAssignmentDetails = async (assignmentId: string) => {
        try {
            const data = await getAssignmentDetails(assignmentId);
            setAssignmentData(data);
        } catch (error) {
            console.error("Failed to load assignment:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmissionComplete = () => {
        window.location.href = "/assignments";
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading assignment...</p>
                </div>
            </div>
        );
    }

    if (!assignmentData) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Assignment not found</h3>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2 inline" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { assignment, submission } = assignmentData;

    // Check if student has already submitted
    if (submission && !assignment.allowResubmission) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Assignment Already Submitted</h2>
                    <p className="text-gray-600 mb-6">
                        You have already submitted this assignment. Resubmission is not allowed.
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2 inline" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <button
                    className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Assignment
                </button>
                <h1 className="text-3xl font-bold">Submit Assignment</h1>
                <p className="text-gray-600 mt-2">{assignment.title}</p>
            </div>

            <FileSubmissionComponent
                assignmentId={assignment._id}
                allowedFileTypes={assignment.allowedFileTypes}
                maxFileSizeMB={assignment.maxFileSizeMB}
                allowResubmission={assignment.allowResubmission}
                existingSubmission={submission}
                onSubmitted={handleSubmissionComplete}
            />
        </div>
    );
}
