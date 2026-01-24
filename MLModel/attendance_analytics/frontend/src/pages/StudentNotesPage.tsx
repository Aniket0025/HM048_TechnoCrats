import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listDailyNotes, getDailyNote } from "@/api/dailyNotes";
import { format } from "date-fns";

export default function StudentNotesPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [filter, setFilter] = useState({ subject: "", batch: "", from: "", to: "" });

    useEffect(() => {
        listDailyNotes(filter).then(setNotes);
    }, [filter]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Daily Teaching Notes</h1>

            {/* Filters */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Input placeholder="From date" type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} />
                <Input placeholder="To date" type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} />
                <Select value={filter.subject} onValueChange={(v) => setFilter({ ...filter, subject: v })}>
                    <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {/* Populate from API */}
                    </SelectContent>
                </Select>
                <Select value={filter.batch} onValueChange={(v) => setFilter({ ...filter, batch: v })}>
                    <SelectTrigger><SelectValue placeholder="Batch" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {/* Populate from API */}
                    </SelectContent>
                </Select>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                    <Card key={note._id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.open(`/notes/${note._id}`, "_blank")}>
                        <CardHeader>
                            <CardTitle className="text-lg">{note.subject.name}</CardTitle>
                            <p className="text-sm text-gray-600">{format(new Date(note.date), "PPP")}</p>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-2">Teacher: {note.teacher.name}</p>
                            <p className="text-sm mb-2">Batch: {note.batch.name}</p>
                            {note.thumbnailUrl && (
                                <img src={note.thumbnailUrl} alt="thumbnail" className="w-full h-32 object-cover rounded mb-2" />
                            )}
                            <div className="flex gap-2">
                                {note.tags?.map((tag: string) => (
                                    <Badge key={tag} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
