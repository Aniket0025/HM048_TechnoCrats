import { useState, useEffect } from "react";
import { getAssignmentDetails } from "@/api/assignments";
import EvaluationPanel from "@/components/EvaluationPanel";
import { ArrowLeft } from "lucide-react";

export default function EvaluationPage() {
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

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading evaluation panel...</p>
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

    const { assignment } = assignmentData;

    return (
        <div>
            <div className="p-6 pb-0">
                <button
                    className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Assignment
                </button>
            </div>
            <EvaluationPanel
                assignmentId={assignment._id}
                totalMarks={assignment.totalMarks}
                assignmentType={assignment.type}
            />
        </div>
    );
}
