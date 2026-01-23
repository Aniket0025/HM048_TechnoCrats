import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Button } from "@/components/ui/button";
import { saveDailyNote } from "@/api/dailyNotes";

interface Props {
    classId: string;
    initialData?: any;
    onSave?: () => void;
}

export default function ExcalidrawWrapper({ classId, initialData, onSave }: Props) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const autoSaveInterval = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (excalidrawAPI) {
            // Auto-save every 30 seconds
            autoSaveInterval.current = setInterval(() => {
                handleSave(true);
            }, 30000);
        }
        return () => {
            if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
        };
    }, [excalidrawAPI]);

    async function handleSave(isAuto = false) {
        if (!excalidrawAPI) return;
        const scene = excalidrawAPI.getSceneElements();
        const files = excalidrawAPI.getFiles();
        const appState = excalidrawAPI.getAppState();

        try {
            await saveDailyNote({
                classId,
                excalidrawData: { elements: scene, appState },
                excalidrawFiles: Object.values(files),
                tags: [],
                isPublic: false,
            });
            if (!isAuto) onSave?.();
        } catch (e) {
            console.error("[Save] Failed:", e);
        }
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="p-2 bg-white shadow flex gap-2">
                <Button onClick={() => handleSave(false)}>Save Now</Button>
                <Button variant="outline" onClick={() => excalidrawAPI?.resetScene()}>
                    Clear
                </Button>
            </div>
            <div className="flex-1">
                <Excalidraw
                    initialData={initialData}
                    onChange={() => {/* optional live sync */}}
                    onPointerUpdate={() => {/* optional cursor sync */}}
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}
                />
            </div>
        </div>
    );
}
