import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NotesViewer from "@/components/NotesViewer";
import { getDailyNote } from "@/api/dailyNotes";

export default function StudentNoteViewPage() {
    const { id } = useParams();
    const [note, setNote] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        getDailyNote(id).then(setNote);
    }, [id]);

    if (!note) return <div>Loading...</div>;

    return <NotesViewer note={note} />;
}
