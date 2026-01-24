import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    getAcademicYears,
    createTimetableStructure,
    getTimetableStructures,
    getAcademicDataPreview,
    generateAITimetable,
    getGeneratedTimetables,
    TimetableStructure,
    AcademicData,
    Timetable
} from "@/api/aiTimetable";
import { 
    Calendar, 
    Clock, 
    Users, 
    BookOpen, 
    Settings, 
    Play, 
    CheckCircle, 
    AlertCircle, 
    Brain,
    ChevronRight,
    ChevronLeft
} from "lucide-react";

interface Props {
    onTimetableGenerated?: (timetables: Timetable[]) => void;
}

export default function AITimetableWizard({ onTimetableGenerated }: Props) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<string[]>([]);
    const [structures, setStructures] = useState<TimetableStructure[]>([]);
    const [academicData, setAcademicData] = useState<AcademicData | null>(null);
    const [generatedTimetables, setGeneratedTimetables] = useState<Timetable[]>([]);

    // Form data
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("Odd");
    const [selectedStructure, setSelectedStructure] = useState("");
    const [structureData, setStructureData] = useState({
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        lecturesPerDay: 7,
        lectureDuration: 60,
        startTime: "09:00",
        lunchBreak: {
            afterLecture: 4,
            duration: 60
        },
        recessBreaks: [
            { afterLecture: 2, duration: 15 }
        ],
        constraints: []
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [yearsData, structuresData] = await Promise.all([
                getAcademicYears(),
                getTimetableStructures()
            ]);
            setAcademicYears(yearsData.data);
            setStructures(structuresData.data);
        } catch (error) {
            console.error("Failed to load initial data:", error);
        }
    };

    const handleNext = async () => {
        if (step === 2) {
            // Create or select structure
            if (!selectedStructure) {
                await createNewStructure();
            }
            await loadAcademicData();
        } else if (step === 3) {
            // Generate timetable
            await generateTimetable();
        }
        setStep(Math.min(step + 1, 5));
    };

    const handlePrevious = () => {
        setStep(Math.max(step - 1, 1));
    };

    const createNewStructure = async () => {
        setLoading(true);
        try {
            const structure = await createTimetableStructure({
                ...structureData,
                academicYear: selectedYear
            });
            setSelectedStructure(structure.data._id);
        } catch (error) {
            console.error("Failed to create structure:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAcademicData = async () => {
        setLoading(true);
        try {
            const data = await getAcademicDataPreview(selectedYear, selectedSemester);
            setAcademicData(data.data);
        } catch (error) {
            console.error("Failed to load academic data:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateTimetable = async () => {
        setLoading(true);
        try {
            const result = await generateAITimetable({
                academicYear: selectedYear,
                semester: selectedSemester,
                structureId: selectedStructure
            });
            setGeneratedTimetables(result.data.timetables);
            onTimetableGenerated?.(result.data.timetables);
        } catch (error) {
            console.error("Failed to generate timetable:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <Brain className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                            <h2 className="text-2xl font-bold mb-2">AI Timetable Generator</h2>
                            <p className="text-gray-600">Create optimized, conflict-free timetables using AI</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="academicYear">Academic Year *</Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select academic year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map(year => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="semester">Semester *</Label>
                                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Odd">Odd Semester</SelectItem>
                                        <SelectItem value="Even">Even Semester</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Timetable Structure</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <Label>Use Existing Structure</Label>
                                <Select value={selectedStructure} onValueChange={setSelectedStructure}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select existing structure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {structures.map(structure => (
                                            <SelectItem key={structure._id} value={structure._id}>
                                                {structure.academicYear} - {structure.workingDays.length} days, {structure.lecturesPerDay} lectures/day
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="text-center text-sm text-gray-500">OR</div>

                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-medium">Create New Structure</h4>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Working Days</Label>
                                        <div className="space-y-2 mt-2">
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                                                <div key={day} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={day}
                                                        checked={structureData.workingDays.includes(day)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setStructureData({
                                                                    ...structureData,
                                                                    workingDays: [...structureData.workingDays, day]
                                                                });
                                                            } else {
                                                                setStructureData({
                                                                    ...structureData,
                                                                    workingDays: structureData.workingDays.filter(d => d !== day)
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={day}>{day}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label>Lectures per Day</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={structureData.lecturesPerDay}
                                                onChange={(e) => setStructureData({
                                                    ...structureData,
                                                    lecturesPerDay: Number(e.target.value)
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Lecture Duration (minutes)</Label>
                                            <Input
                                                type="number"
                                                min="30"
                                                max="180"
                                                value={structureData.lectureDuration}
                                                onChange={(e) => setStructureData({
                                                    ...structureData,
                                                    lectureDuration: Number(e.target.value)
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Start Time</Label>
                                            <Input
                                                type="time"
                                                value={structureData.startTime}
                                                onChange={(e) => setStructureData({
                                                    ...structureData,
                                                    startTime: e.target.value
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Lunch Break After Lecture</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={structureData.lecturesPerDay}
                                            value={structureData.lunchBreak.afterLecture}
                                            onChange={(e) => setStructureData({
                                                ...structureData,
                                                lunchBreak: {
                                                    ...structureData.lunchBreak,
                                                    afterLecture: Number(e.target.value)
                                                }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Lunch Break Duration (minutes)</Label>
                                        <Input
                                            type="number"
                                            min="15"
                                            max="120"
                                            value={structureData.lunchBreak.duration}
                                            onChange={(e) => setStructureData({
                                                ...structureData,
                                                lunchBreak: {
                                                    ...structureData.lunchBreak,
                                                    duration: Number(e.target.value)
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Academic Data Preview</h3>
                        
                        {academicData ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Faculty ({academicData.faculty.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {academicData.faculty.slice(0, 5).map(faculty => (
                                                <div key={faculty.id} className="text-sm">
                                                    <p className="font-medium">{faculty.name}</p>
                                                    <p className="text-gray-600">{faculty.subjects.length} subjects</p>
                                                </div>
                                            ))}
                                            {academicData.faculty.length > 5 && (
                                                <p className="text-sm text-gray-500">...and {academicData.faculty.length - 5} more</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Subjects ({academicData.subjects.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {academicData.subjects.slice(0, 5).map(subject => (
                                                <div key={subject.id} className="text-sm">
                                                    <p className="font-medium">{subject.name}</p>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline">{subject.type}</Badge>
                                                        <Badge variant="secondary">{subject.lecturesPerWeek}/week</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                            {academicData.subjects.length > 5 && (
                                                <p className="text-sm text-gray-500">...and {academicData.subjects.length - 5} more</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Divisions ({academicData.divisions.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {academicData.divisions.map(division => (
                                                <div key={division.id} className="text-sm">
                                                    <p className="font-medium">{division.name}</p>
                                                    <p className="text-gray-600">{division.studentCount} students</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-600">Loading academic data...</p>
                            </div>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Generating AI Timetable</h3>
                        
                        <div className="text-center py-8">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-gray-600">AI is analyzing constraints and optimizing schedules...</p>
                                    <Progress value={75} className="w-64 mx-auto" />
                                </div>
                            ) : generatedTimetables.length > 0 ? (
                                <div className="space-y-4">
                                    <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                                    <p className="text-lg font-semibold text-green-600">Timetable Generated Successfully!</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">{generatedTimetables.length}</p>
                                            <p className="text-sm text-gray-600">Divisions</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">
                                                {generatedTimetables.reduce((sum, t) => sum + (t.statistics?.totalLectures || 0), 0)}
                                            </p>
                                            <p className="text-sm text-gray-600">Total Lectures</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">
                                                {generatedTimetables.reduce((sum, t) => sum + (t.conflicts?.length || 0), 0)}
                                            </p>
                                            <p className="text-sm text-gray-600">Conflicts</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold">
                                                {(generatedTimetables.reduce((sum, t) => sum + (t.statistics?.complianceScore || 0), 0) / generatedTimetables.length).toFixed(1)}%
                                            </p>
                                            <p className="text-sm text-gray-600">Compliance</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-gray-600">Ready to generate timetable</p>
                                    <Button onClick={generateTimetable} disabled={loading}>
                                        <Play className="h-4 w-4 mr-2" />
                                        Generate Timetable
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Generated Timetables</h3>
                        
                        <div className="space-y-4">
                            {generatedTimetables.map(timetable => (
                                <Card key={timetable._id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{timetable.division.name}</CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    {timetable.academicYear} - {timetable.semester} Semester
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant={timetable.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                    {timetable.status}
                                                </Badge>
                                                {timetable.conflicts && timetable.conflicts.length > 0 && (
                                                    <Badge variant="destructive">
                                                        {timetable.conflicts.length} Conflicts
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Total Lectures</p>
                                                <p className="font-semibold">{timetable.statistics?.totalLectures || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Theory</p>
                                                <p className="font-semibold">{timetable.statistics?.theoryLectures || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Lab</p>
                                                <p className="font-semibold">{timetable.statistics?.labLectures || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Compliance</p>
                                                <p className="font-semibold">{timetable.statistics?.complianceScore || 0}%</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                            {timetable.status === 'DRAFT' && (
                                                <Button size="sm">
                                                    Publish
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-6 w-6" />
                            AI Timetable Generator
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }, (_, i) => i + 1).map(num => (
                                <div
                                    key={num}
                                    className={`w-2 h-2 rounded-full ${
                                        num <= step ? "bg-blue-600" : "bg-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {renderStepContent()}

                    <div className="flex justify-between pt-6 border-t">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={step === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={loading || (step === 1 && !selectedYear)}
                        >
                            {step === 4 ? 'Generate' : 'Next'}
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
