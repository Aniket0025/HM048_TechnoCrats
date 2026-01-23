import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuizQuestion, submitQuizAssignment } from "@/api/assignments";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
    assignmentId: string;
    questions: QuizQuestion[];
    timeLimit?: number;
    shuffleQuestions?: boolean;
    attemptLimit?: number;
    onSubmitted?: () => void;
}

export default function QuizInterface({
    assignmentId,
    questions,
    timeLimit,
    shuffleQuestions,
    attemptLimit,
    onSubmitted,
}: Props) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ answer: string }[]>(
        questions.map(() => ({ answer: "" }))
    );
    const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : null);
    const [startedAt] = useState(new Date().toISOString());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // Shuffle questions if required
    const displayQuestions = shuffleQuestions
        ? [...questions].sort(() => Math.random() - 0.5)
        : questions;

    useEffect(() => {
        if (timeLeft === null) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null || prev <= 0) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleAnswerChange = (answer: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = { answer };
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < displayQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        // Check if all questions are answered
        const unanswered = answers.filter((a) => !a.answer.trim()).length;
        if (unanswered > 0 && timeLeft !== 0) {
            setShowAlert(true);
            return;
        }

        setIsSubmitting(true);
        try {
            await submitQuizAssignment(assignmentId, answers, startedAt);
            onSubmitted?.();
        } catch (error) {
            console.error("Failed to submit quiz:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = ((currentQuestion + 1) / displayQuestions.length) * 100;
    const question = displayQuestions[currentQuestion];

    if (!question) return null;

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Quiz</h1>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                            timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                        }`}>
                            <Clock className="h-4 w-4" />
                            <span className="font-mono">{formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                    Question {currentQuestion + 1} of {displayQuestions.length}
                </p>
            </div>

            {/* Alert for unanswered questions */}
            {showAlert && (
                <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You have {answers.filter((a) => !a.answer.trim()).length} unanswered question(s). 
                        Are you sure you want to submit?
                    </AlertDescription>
                    <div className="flex gap-2 mt-3">
                        <Button variant="outline" onClick={() => setShowAlert(false)}>
                            Continue Quiz
                        </Button>
                        <Button onClick={() => {
                            setShowAlert(false);
                            handleSubmit();
                        }}>
                            Submit Anyway
                        </Button>
                    </div>
                </Alert>
            )}

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                        <span className="flex-1">Question {currentQuestion + 1}</span>
                        <span className="text-sm font-normal text-gray-600">
                            {question.marks} mark{question.marks > 1 ? "s" : ""}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-lg">{question.questionText}</p>

                    {/* MCQ Options */}
                    {question.questionType === "MCQ" && (
                        <RadioGroup
                            value={answers[currentQuestion]?.answer}
                            onValueChange={handleAnswerChange}
                        >
                            {question.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="flex-1">
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {/* True/False */}
                    {question.questionType === "TRUE_FALSE" && (
                        <RadioGroup
                            value={answers[currentQuestion]?.answer}
                            onValueChange={handleAnswerChange}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="true" />
                                <Label htmlFor="true">True</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="false" />
                                <Label htmlFor="false">False</Label>
                            </div>
                        </RadioGroup>
                    )}

                    {/* Short Answer */}
                    {question.questionType === "SHORT_ANSWER" && (
                        <Textarea
                            value={answers[currentQuestion]?.answer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={4}
                        />
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                        >
                            Previous
                        </Button>
                        <div className="flex gap-2">
                            {currentQuestion < displayQuestions.length - 1 ? (
                                <Button onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question Navigation */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg">Question Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                        {displayQuestions.map((_, index) => {
                            const isAnswered = answers[index]?.answer.trim();
                            const isCurrent = index === currentQuestion;
                            return (
                                <Button
                                    key={index}
                                    variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentQuestion(index)}
                                    className="relative"
                                >
                                    {index + 1}
                                    {isAnswered && (
                                        <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-500" />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
