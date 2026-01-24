import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { submitFileAssignment } from "@/api/assignments";
import { Upload, File, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
    assignmentId: string;
    allowedFileTypes: string[];
    maxFileSizeMB: number;
    allowResubmission: boolean;
    existingSubmission?: any;
    onSubmitted?: () => void;
}

export default function FileSubmissionComponent({
    assignmentId,
    allowedFileTypes,
    maxFileSizeMB,
    allowResubmission,
    existingSubmission,
    onSubmitted,
}: Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        // Check file type
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (!fileExtension || !allowedFileTypes.includes(fileExtension)) {
            return `File type .${fileExtension} is not allowed. Allowed types: ${allowedFileTypes.join(", ")}`;
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSizeMB) {
            return `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum allowed size of ${maxFileSizeMB}MB`;
        }

        return null;
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                setSelectedFile(null);
            } else {
                setError(null);
                setSelectedFile(file);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            await submitFileAssignment(assignmentId, selectedFile);
            
            clearInterval(progressInterval);
            setUploadProgress(100);
            setSuccess(true);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            
            setTimeout(() => {
                onSubmitted?.();
            }, 1500);
        } catch (error) {
            setError("Failed to upload file. Please try again.");
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    if (success) {
        return (
            <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                    File submitted successfully!
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Submit Assignment
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Existing submission info */}
                {existingSubmission && !allowResubmission && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            You have already submitted this assignment. Resubmission is not allowed.
                        </AlertDescription>
                    </Alert>
                )}

                {existingSubmission && allowResubmission && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            You have already submitted this assignment. You can resubmit to replace your previous submission.
                        </AlertDescription>
                    </Alert>
                )}

                {/* File upload area */}
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Choose File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <span className="mt-2 block text-sm font-medium text-gray-900">
                                        Click to upload or drag and drop
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleFileSelect}
                                        disabled={uploading || (existingSubmission && !allowResubmission)}
                                        accept={allowedFileTypes.map(type => `.${type}`).join(",")}
                                    />
                                </label>
                                <p className="mt-1 text-xs text-gray-500">
                                    {allowedFileTypes.map(type => type.toUpperCase()).join(", ")} up to {maxFileSizeMB}MB
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected file info */}
                {selectedFile && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <File className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSelectedFile(null);
                                setError(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                            }}
                            disabled={uploading}
                        >
                            Remove
                        </Button>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Upload progress */}
                {uploading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
                )}

                {/* Submit button */}
                <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading || (existingSubmission && !allowResubmission)}
                    className="w-full"
                >
                    {uploading ? "Uploading..." : "Submit Assignment"}
                </Button>
            </CardContent>
        </Card>
    );
}
