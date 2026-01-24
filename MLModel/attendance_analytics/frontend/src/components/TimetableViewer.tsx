import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timetable, FormattedTimetable, TimetableSlot } from "@/api/aiTimetable";
import { Download, Eye, Edit, Calendar, Clock, Users, BookOpen } from "lucide-react";

interface Props {
    timetable: Timetable;
    formattedTimetable: FormattedTimetable;
    onEdit?: (timetable: Timetable) => void;
    onPublish?: (id: string) => void;
}

export default function TimetableViewer({ 
    timetable, 
    formattedTimetable, 
    onEdit, 
    onPublish 
}: Props) {
    const [selectedView, setSelectedView] = useState<'week' | 'day'>('week');
    const [selectedDay, setSelectedDay] = useState<string>('Monday');

    const getLectureTime = (lectureNumber: number) => {
        const startTime = new Date();
        const [hours, minutes] = timetable.structure.startTime.split(':');
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const lectureDuration = timetable.structure.lectureDuration;
        const lectureTime = new Date(startTime.getTime() + (lectureNumber - 1) * lectureDuration * 60000);
        
        return lectureTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };

    const getSlotColor = (slot: TimetableSlot) => {
        if (slot.isBreak) {
            return slot.breakType === 'LUNCH' ? 'bg-orange-100 border-orange-300' : 'bg-gray-100 border-gray-300';
        }
        if (slot.isLab) {
            return 'bg-blue-100 border-blue-300';
        }
        return 'bg-green-100 border-green-300';
    };

    const exportTimetable = () => {
        // Create CSV content
        let csvContent = "Day,Lecture,Time,Subject,Faculty,Room,Type\n";
        
        Object.entries(formattedTimetable).forEach(([day, slots]) => {
            slots.forEach(slot => {
                const time = getLectureTime(slot.lectureNumber);
                const subject = slot.subject ? slot.subject.name : (slot.isBreak ? slot.breakType : 'Free');
                const faculty = slot.faculty ? slot.faculty.name : '';
                const type = slot.isBreak ? 'Break' : (slot.isLab ? 'Lab' : 'Theory');
                
                csvContent += `${day},${slot.lectureNumber},${time},${subject},${faculty},${slot.room},${type}\n`;
            });
        });

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${timetable.division.name}_timetable.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const renderWeekView = () => {
        const days = Object.keys(formattedTimetable);
        const maxLectures = Math.max(...days.map(day => formattedTimetable[day].length));

        return (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 bg-gray-50 p-2 text-left font-medium">
                                Day / Lecture
                            </th>
                            {Array.from({ length: maxLectures }, (_, i) => (
                                <th key={i + 1} className="border border-gray-300 bg-gray-50 p-2 text-center min-w-[120px]">
                                    <div className="text-xs font-medium">Lecture {i + 1}</div>
                                    <div className="text-xs text-gray-500">{getLectureTime(i + 1)}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map(day => (
                            <tr key={day}>
                                <td className="border border-gray-300 bg-gray-50 p-2 font-medium">
                                    {day}
                                </td>
                                {Array.from({ length: maxLectures }, (_, i) => {
                                    const slot = formattedTimetable[day][i];
                                    return (
                                        <td 
                                            key={i} 
                                            className={`border border-gray-300 p-2 text-xs ${getSlotColor(slot)}`}
                                        >
                                            {slot.isBreak ? (
                                                <div className="text-center font-medium">
                                                    {slot.breakType}
                                                </div>
                                            ) : slot.subject ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium truncate">
                                                        {slot.subject.name}
                                                    </div>
                                                    {slot.faculty && (
                                                        <div className="text-gray-600 truncate">
                                                            {slot.faculty.name}
                                                        </div>
                                                    )}
                                                    <div className="text-gray-500">
                                                        {slot.room}
                                                    </div>
                                                    {slot.isLab && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Lab
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-400">
                                                    Free
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderDayView = () => {
        const daySlots = formattedTimetable[selectedDay] || [];

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(formattedTimetable).map(day => (
                                <SelectItem key={day} value={day}>
                                    {day}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4">
                    {daySlots.map((slot, index) => (
                        <Card key={index} className={getSlotColor(slot)}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="font-medium">Lecture {slot.lectureNumber}</div>
                                            <div className="text-sm text-gray-600">
                                                {getLectureTime(slot.lectureNumber)}
                                            </div>
                                        </div>
                                        
                                        {slot.isBreak ? (
                                            <div className="flex-1 text-center">
                                                <div className="text-lg font-medium">
                                                    {slot.breakType} BREAK
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {slot.breakType === 'LUNCH' ? 
                                                        `${timetable.structure.lunchBreak.duration} minutes` : 
                                                        '15 minutes'
                                                    }
                                                </div>
                                            </div>
                                        ) : slot.subject ? (
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium">{slot.subject.name}</h4>
                                                    {slot.isLab && (
                                                        <Badge variant="secondary">Lab</Badge>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Faculty:</span>
                                                        <span className="ml-2">{slot.faculty?.name || 'TBD'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Room:</span>
                                                        <span className="ml-2">{slot.room}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Type:</span>
                                                        <span className="ml-2">{slot.isLab ? 'Lab' : 'Theory'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 text-center text-gray-500">
                                                Free Period
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{timetable.division.name} Timetable</h2>
                    <p className="text-gray-600">
                        {timetable.academicYear} - {timetable.semester} Semester
                    </p>
                </div>
                <div className="flex items-center gap-2">
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

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">{timetable.structure.workingDays.length}</div>
                        <div className="text-sm text-gray-600">Working Days</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">{timetable.statistics?.totalLectures || 0}</div>
                        <div className="text-sm text-gray-600">Total Lectures</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">{timetable.statistics?.theoryLectures || 0}</div>
                        <div className="text-sm text-gray-600">Theory</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                        <div className="text-2xl font-bold">{timetable.statistics?.labLectures || 0}</div>
                        <div className="text-sm text-gray-600">Lab</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Eye className="h-8 w-8 mx-auto mb-2 text-red-600" />
                        <div className="text-2xl font-bold">{timetable.statistics?.complianceScore || 0}%</div>
                        <div className="text-sm text-gray-600">Compliance</div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={selectedView} onValueChange={(value: 'week' | 'day') => setSelectedView(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Week View</SelectItem>
                            <SelectItem value="day">Day View</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={exportTimetable}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    {onEdit && (
                        <Button variant="outline" onClick={() => onEdit(timetable)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                    {onPublish && timetable.status === 'DRAFT' && (
                        <Button onClick={() => onPublish(timetable._id)}>
                            Publish
                        </Button>
                    )}
                </div>
            </div>

            {/* Timetable Content */}
            <div className="border rounded-lg">
                {selectedView === 'week' ? renderWeekView() : renderDayView()}
            </div>

            {/* Conflicts */}
            {timetable.conflicts && timetable.conflicts.length > 0 && (
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="text-red-600">Conflicts Detected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {timetable.conflicts.map((conflict, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                    <Badge variant={conflict.severity === 'HIGH' ? 'destructive' : 'secondary'}>
                                        {conflict.severity}
                                    </Badge>
                                    <span className="text-sm">{conflict.description}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
