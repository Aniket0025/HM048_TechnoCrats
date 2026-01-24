import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload, Eye, Save, FileText, HelpCircle } from "lucide-react";
import {
    createAssignment,
    uploadAssignmentFile,
    addQuizQuestions,
    publishAssignment,
    Assignment,
    QuizQuestion,
} from "@/api/assignments";

interface Props {
    subjects: { _id: string; name: string; code: string }[];
    batches: { _id: string; name: string }[];
    onSuccess?: (assignment: Assignment) => void;
}

export default function AssignmentCreationWizard({ subjects, batches, onSuccess }: Props) {
    const [step, setStep] = useState(1);
    const [assignmentType, setAssignmentType] = useState<"FILE" | "QUIZ">("FILE");
    const [loading, setLoading] = useState(false);
    const [assignmentId, setAssignmentId] = useState<string | null>(null);
    
    // Basic assignment details
    const [assignmentData, setAssignmentData] = useState({
        title: "",
        description: "",
        subject: "",
        batch: "",
        dueDate: "",
        totalMarks: 100,
        allowedFileTypes: "pdf,doc,docx",
        maxFileSizeMB: 10,
        allowResubmission: false,
    });

    // Quiz settings
    const [quizSettings, setQuizSettings] = useState({
        timeLimitMinutes: undefined as number | undefined,
        shuffleQuestions: false,
        attemptLimit: 1,
        showCorrectAnswers: false,
    });

    // Quiz questions
    const [questions, setQuestions] = useState<Partial<QuizQuestion>[]>([]);

    // File upload
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const handleNext = async () => {
        if (step === 1) {
            // Create assignment first
            setLoading(true);
            try {
                const assignment = await createAssignment({
                    ...assignmentData,
                    type: assignmentType,
                    quizSettings: assignmentType === "QUIZ" ? quizSettings : undefined,
                });
                setAssignmentId(assignment._id);
                setStep(2);
            } catch (error) {
                console.error("Failed to create assignment:", error);
            } finally {
                setLoading(false);
            }
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handlePublish = async () => {
        if (!assignmentId) return;
        setLoading(true);
        try {
            // Upload files if any
            if (assignmentType === "FILE" && uploadedFiles.length > 0) {
                await Promise.all(
                    uploadedFiles.map(file => uploadAssignmentFile(assignmentId, file))
                );
            }

            // Add quiz questions if any
            if (assignmentType === "QUIZ" && questions.length > 0) {
                await addQuizQuestions(assignmentId, questions);
            }

            // Publish assignment
            const published = await publishAssignment(assignmentId);
            onSuccess?.(published);
        } catch (error) {
            console.error("Failed to publish assignment:", error);
        } finally {
            setLoading(false);
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, {
            questionText: "",
            questionType: "MCQ",
            options: ["", "", "", ""],
            correctAnswer: "",
            marks: 1,
            order: questions.length + 1,
        }]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Create Assignment
                    </CardTitle>
                    <div className="flex gap-2">
                        <Badge variant={step === 1 ? "default" : "secondary"}>Step 1: Basic Info</Badge>
                        <Badge variant={step === 2 ? "default" : "secondary"}>
                            Step 2: {assignmentType === "FILE" ? "Files" : "Questions"}
                        </Badge>
                        <Badge variant={step === 3 ? "default" : "secondary"}>Step 3: Review & Publish</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label>Assignment Type</Label>
                                <div className="flex gap-4 mt-2">
                                    <Button
                                        variant={assignmentType === "FILE" ? "default" : "outline"}
                                        onClick={() => setAssignmentType("FILE")}
                                    >
                                        File-Based Assignment
                                    </Button>
                                    <Button
                                        variant={assignmentType === "QUIZ" ? "default" : "outline"}
                                        onClick={() => setAssignmentType("QUIZ")}
                                    >
                                        Quiz-Based Assignment
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={assignmentData.title}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                                        placeholder="Assignment title"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="totalMarks">Total Marks *</Label>
                                    <Input
                                        id="totalMarks"
                                        type="number"
                                        value={assignmentData.totalMarks}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, totalMarks: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={assignmentData.description}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                                    placeholder="Assignment instructions and requirements"
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Subject *</Label>
                                    <Select value={assignmentData.subject} onValueChange={(value) => setAssignmentData({ ...assignmentData, subject: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject._id} value={subject._id}>
                                                    {subject.name} ({subject.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Batch *</Label>
                                    <Select value={assignmentData.batch} onValueChange={(value) => setAssignmentData({ ...assignmentData, batch: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.map((batch) => (
                                                <SelectItem key={batch._id} value={batch._id}>
                                                    {batch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dueDate">Due Date & Time *</Label>
                                    <Input
                                        id="dueDate"
                                        type="datetime-local"
                                        value={assignmentData.dueDate}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="maxFileSizeMB">Max File Size (MB)</Label>
                                    <Input
                                        id="maxFileSizeMB"
                                        type="number"
                                        value={assignmentData.maxFileSizeMB}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, maxFileSizeMB: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="allowedFileTypes">Allowed File Types (comma-separated)</Label>
                                <Input
                                    id="allowedFileTypes"
                                    value={assignmentData.allowedFileTypes}
                                    onChange={(e) => setAssignmentData({ ...assignmentData, allowedFileTypes: e.target.value })}
                                    placeholder="pdf,doc,docx,zip"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="allowResubmission"
                                    checked={assignmentData.allowResubmission}
                                    onCheckedChange={(checked) => setAssignmentData({ ...assignmentData, allowResubmission: !!checked })}
                                />
                                <Label htmlFor="allowResubmission">Allow Resubmission</Label>
                            </div>

                            {/* Quiz-specific settings */}
                            {assignmentType === "QUIZ" && (
                                <div className="space-y-4 border-t pt-4">
                                    <h3 className="font-semibold">Quiz Settings</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                                            <Input
                                                id="timeLimit"
                                                type="number"
                                                value={quizSettings.timeLimitMinutes}
                                                onChange={(e) => setQuizSettings({ ...quizSettings, timeLimitMinutes: e.target.value ? Number(e.target.value) : undefined })}
                                                placeholder="Leave empty for no limit"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="attemptLimit">Attempt Limit</Label>
                                            <Input
                                                id="attemptLimit"
                                                type="number"
                                                value={quizSettings.attemptLimit}
                                                onChange={(e) => setQuizSettings({ ...quizSettings, attemptLimit: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="shuffleQuestions"
                                                checked={quizSettings.shuffleQuestions}
                                                onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, shuffleQuestions: !!checked })}
                                            />
                                            <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="showCorrectAnswers"
                                                checked={quizSettings.showCorrectAnswers}
                                                onCheckedChange={(checked) => setQuizSettings({ ...quizSettings, showCorrectAnswers: !!checked })}
                                            />
                                            <Label htmlFor="showCorrectAnswers">Show Correct Answers</Label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Content */}
                    {step === 2 && (
                        <div className="space-y-4">
                            {assignmentType === "FILE" ? (
                                <div>
                                    <Label>Assignment Files</Label>
                                    <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <div className="text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="mt-4">
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                                        Click to upload or drag and drop
                                                    </span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        multiple
                                                        onChange={(e) => {
                                                            if (e.target.files) {
                                                                setUploadedFiles([...uploadedFiles, ...Array.from(e.target.files)]);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    PDF, DOC, DOCX up to {assignmentData.maxFileSizeMB}MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <span className="text-sm">{file.name}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Quiz Questions</h3>
                                        <Button onClick={addQuestion}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Question
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {questions.map((question, index) => (
                                            <Card key={index}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeQuestion(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div>
                                                        <Label>Question Type</Label>
                                                        <Select
                                                            value={question.questionType}
                                                            onValueChange={(value) => updateQuestion(index, "questionType", value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="MCQ">Multiple Choice</SelectItem>
                                                                <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                                                <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Question</Label>
                                                        <Textarea
                                                            value={question.questionText}
                                                            onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                                                            placeholder="Enter your question"
                                                        />
                                                    </div>
                                                    {question.questionType === "MCQ" && (
                                                        <div>
                                                            <Label>Options</Label>
                                                            <div className="space-y-2">
                                                                {question.options?.map((option, optIndex) => (
                                                                    <Input
                                                                        key={optIndex}
                                                                        value={option}
                                                                        onChange={(e) => {
                                                                            const newOptions = [...(question.options || [])];
                                                                            newOptions[optIndex] = e.target.value;
                                                                            updateQuestion(index, "options", newOptions);
                                                                        }}
                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Correct Answer</Label>
                                                            {question.questionType === "MCQ" ? (
                                                                <Select
                                                                    value={question.correctAnswer}
                                                                    onValueChange={(value) => updateQuestion(index, "correctAnswer", value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select correct option" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {question.options?.map((_, optIndex) => (
                                                                            <SelectItem key={optIndex} value={optIndex.toString()}>
                                                                                Option {optIndex + 1}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : question.questionType === "TRUE_FALSE" ? (
                                                                <Select
                                                                    value={question.correctAnswer}
                                                                    onValueChange={(value) => updateQuestion(index, "correctAnswer", value)}
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="true">True</SelectItem>
                                                                        <SelectItem value="false">False</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <Input
                                                                    value={question.correctAnswer}
                                                                    onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                                                                    placeholder="Model answer"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Label>Marks</Label>
                                                            <Input
                                                                type="number"
                                                                value={question.marks}
                                                                onChange={(e) => updateQuestion(index, "marks", Number(e.target.value))}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold">Review Assignment</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p><strong>Title:</strong> {assignmentData.title}</p>
                                <p><strong>Type:</strong> {assignmentType}</p>
                                <p><strong>Subject:</strong> {subjects.find(s => s._id === assignmentData.subject)?.name}</p>
                                <p><strong>Batch:</strong> {batches.find(b => b._id === assignmentData.batch)?.name}</p>
                                <p><strong>Due Date:</strong> {new Date(assignmentData.dueDate).toLocaleString()}</p>
                                <p><strong>Total Marks:</strong> {assignmentData.totalMarks}</p>
                                {assignmentType === "QUIZ" && (
                                    <>
                                        <p><strong>Questions:</strong> {questions.length}</p>
                                        <p><strong>Time Limit:</strong> {quizSettings.timeLimitMinutes || "No limit"} minutes</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setStep(Math.max(1, step - 1))}
                            disabled={step === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex gap-2">
                            {step < 3 ? (
                                <Button onClick={handleNext} disabled={loading}>
                                    {loading ? "Creating..." : "Next"}
                                </Button>
                            ) : (
                                <Button onClick={handlePublish} disabled={loading}>
                                    {loading ? "Publishing..." : "Publish Assignment"}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
