import { useState, useEffect } from "react";
import AssignmentCreationWizard from "@/components/AssignmentCreationWizard";
import { ArrowLeft } from "lucide-react";

export default function CreateAssignmentPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // In a real app, these would come from API calls
            // For now, using mock data
            setSubjects([
                { _id: "1", name: "Mathematics", code: "MATH101" },
                { _id: "2", name: "Physics", code: "PHY101" },
                { _id: "3", name: "Computer Science", code: "CS101" },
            ]);
            
            setBatches([
                { _id: "1", name: "Batch A 2024" },
                { _id: "2", name: "Batch B 2024" },
                { _id: "3", name: "Batch C 2024" },
            ]);
        } catch (error) {
            console.error("Failed to load initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignmentCreated = () => {
        window.location.href = "/assignments/teacher";
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <button
                    className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    onClick={() => window.history.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Assignments
                </button>
                <h1 className="text-3xl font-bold">Create New Assignment</h1>
                <p className="text-gray-600 mt-2">
                    Create a file-based or quiz-based assignment for your students
                </p>
            </div>

            <AssignmentCreationWizard
                subjects={subjects}
                batches={batches}
                onSuccess={handleAssignmentCreated}
            />
        </div>
    );
}
