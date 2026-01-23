import { useState, useEffect } from "react";
import { getAssignmentDetails } from "@/api/assignments";
import QuizInterface from "@/components/QuizInterface";
import { ArrowLeft } from "lucide-react";

export default function QuizPage() {
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
            console.error("Failed to load quiz:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizSubmitted = () => {
        window.location.href = "/assignments";
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!assignmentData) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900">Quiz not found</h3>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2 inline" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { assignment, questions, submission } = assignmentData;

    // Check if student has already submitted
    if (submission && !assignment.allowResubmission) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Quiz Already Submitted</h2>
                    <p className="text-gray-600 mb-6">
                        You have already submitted this quiz. Resubmission is not allowed.
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
            <QuizInterface
                assignmentId={assignment._id}
                questions={questions}
                timeLimit={assignment.quizSettings?.timeLimitMinutes}
                shuffleQuestions={assignment.quizSettings?.shuffleQuestions}
                attemptLimit={assignment.quizSettings?.attemptLimit}
                onSubmitted={handleQuizSubmitted}
            />
        </div>
    );
}
