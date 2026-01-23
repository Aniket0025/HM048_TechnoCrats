import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ExcalidrawWrapper from "@/components/ExcalidrawWrapper";
import { getClass, getTodayNote } from "@/api/classes";

export default function TeacherClassPage() {
    const { classId } = useParams();
    const [classDoc, setClassDoc] = useState<any>(null);
    const [todayNote, setTodayNote] = useState<any>(null);

    useEffect(() => {
        if (!classId) return;
        getClass(classId).then(setClassDoc);
        getTodayNote(classId).then(setTodayNote);
    }, [classId]);

    if (!classDoc) return <div>Loading...</div>;

    return (
        <div className="h-screen">
            <header className="p-4 bg-white shadow">
                <h1 className="text-xl font-bold">{classDoc.title}</h1>
                <p className="text-sm text-gray-600">{classDoc.subject.name} – {classDoc.batch.name}</p>
            </header>
            <ExcalidrawWrapper
                classId={classId}
                initialData={todayNote?.excalidrawData}
                onSave={() => alert("Saved!")}
            />
        </div>
    );
}
