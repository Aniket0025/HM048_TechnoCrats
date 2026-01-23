import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AITimetableWizard from "@/components/AITimetableWizard";
import TimetableViewer from "@/components/TimetableViewer";
import {
    getGeneratedTimetables,
    getTimetableDetails,
    publishTimetable,
    Timetable
} from "@/api/aiTimetable";
import { 
    Brain, 
    Calendar, 
    Download, 
    Eye, 
    Plus, 
    Search, 
    Filter,
    CheckCircle,
    AlertCircle,
    Clock
} from "lucide-react";

export default function AITimetablePage() {
    const [activeTab, setActiveTab] = useState<'generate' | 'view'>('generate');
    const [timetables, setTimetables] = useState<Timetable[]>([]);
    const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterYear, setFilterYear] = useState<string>("all");

    useEffect(() => {
        loadTimetables();
    }, []);

    const loadTimetables = async () => {
        setLoading(true);
        try {
            const data = await getGeneratedTimetables();
            setTimetables(data.data);
        } catch (error) {
            console.error("Failed to load timetables:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTimetable = async (timetable: Timetable) => {
        setLoading(true);
        try {
            const data = await getTimetableDetails(timetable._id);
            setSelectedTimetable(data.data.timetable);
        } catch (error) {
            console.error("Failed to load timetable details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishTimetable = async (id: string) => {
        try {
            await publishTimetable(id);
            await loadTimetables();
            if (selectedTimetable && selectedTimetable._id === id) {
                setSelectedTimetable({
                    ...selectedTimetable,
                    status: 'PUBLISHED'
                });
            }
        } catch (error) {
            console.error("Failed to publish timetable:", error);
        }
    };

    const handleTimetableGenerated = (newTimetables: Timetable[]) => {
        setTimetables(prev => [...newTimetables, ...prev]);
        setActiveTab('view');
    };

    const filteredTimetables = timetables.filter(timetable => {
        const matchesSearch = timetable.division.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             timetable.academicYear.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || timetable.status === filterStatus;
        const matchesYear = filterYear === 'all' || timetable.academicYear === filterYear;
        
        return matchesSearch && matchesStatus && matchesYear;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <Badge className="bg-green-100 text-green-800">Published</Badge>;
            case 'DRAFT':
                return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
            case 'ARCHIVED':
                return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getComplianceColor = (score: number) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Brain className="h-8 w-8 text-blue-600" />
                        AI Timetable Generator
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Create optimized, conflict-free timetables using artificial intelligence
                    </p>
                </div>
                <Button onClick={() => setActiveTab('generate')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(value: 'generate' | 'view') => setActiveTab(value)}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="generate">Generate Timetable</TabsTrigger>
                    <TabsTrigger value="view">View Timetables</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="mt-6">
                    <AITimetableWizard onTimetableGenerated={handleTimetableGenerated} />
                </TabsContent>

                <TabsContent value="view" className="mt-6">
                    {selectedTimetable ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedTimetable(null)}
                                >
                                    ← Back to List
                                </Button>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        Version {selectedTimetable.version}
                                    </Badge>
                                    {getStatusBadge(selectedTimetable.status)}
                                </div>
                            </div>
                            <TimetableViewer
                                timetable={selectedTimetable}
                                formattedTimetable={selectedTimetable.formattedTimetable}
                                onPublish={handlePublishTimetable}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Filters */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Filter className="h-5 w-5" />
                                        Filters
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search timetables..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="DRAFT">Draft</SelectItem>
                                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filterYear} onValueChange={setFilterYear}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Years</SelectItem>
                                                {Array.from(new Set(timetables.map(t => t.academicYear))).map(year => (
                                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" onClick={loadTimetables}>
                                            Refresh
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timetables Grid */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading timetables...</p>
                                </div>
                            ) : filteredTimetables.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTimetables.map((timetable) => (
                                        <Card key={timetable._id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg">{timetable.division.name}</CardTitle>
                                                        <p className="text-sm text-gray-600">
                                                            {timetable.academicYear} - {timetable.semester}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        {getStatusBadge(timetable.status)}
                                                        <Badge variant="outline" className="text-xs">
                                                            v{timetable.version}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Total Lectures</p>
                                                        <p className="font-semibold">
                                                            {timetable.statistics?.totalLectures || 0}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Compliance</p>
                                                        <p className={`font-semibold ${getComplianceColor(timetable.statistics?.complianceScore || 0)}`}>
                                                            {timetable.statistics?.complianceScore || 0}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Theory</p>
                                                        <p className="font-semibold">
                                                            {timetable.statistics?.theoryLectures || 0}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Lab</p>
                                                        <p className="font-semibold">
                                                            {timetable.statistics?.labLectures || 0}
                                                        </p>
                                                    </div>
                                                </div>

                                                {timetable.conflicts && timetable.conflicts.length > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{timetable.conflicts.length} conflicts</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(timetable.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        by {timetable.generatedBy?.name}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                        onClick={() => handleViewTimetable(timetable)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    {timetable.status === 'DRAFT' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handlePublishTimetable(timetable._id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Publish
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No timetables found
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchTerm || filterStatus !== 'all' || filterYear !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Generate your first AI-powered timetable'
                                        }
                                    </p>
                                    <Button onClick={() => setActiveTab('generate')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Generate Timetable
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
