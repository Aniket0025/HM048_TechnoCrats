import { useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/utils/download";

interface Props {
    note: {
        excalidrawData: any;
        excalidrawFiles: any[];
        thumbnailUrl?: string;
        pdfUrl?: string;
    };
}

export default function NotesViewer({ note }: Props) {
    const [viewMode, setViewMode] = useState<"json" | "png" | "pdf">("json");

    async function handleDownload(format: "png" | "pdf" | "json") {
        if (format === "json") {
            const blob = new Blob([JSON.stringify(note.excalidrawData, null, 2)], { type: "application/json" });
            downloadFile(blob, "notes.json");
        } else if (format === "png" && note.thumbnailUrl) {
            window.open(note.thumbnailUrl, "_blank");
        } else if (format === "pdf" && note.pdfUrl) {
            window.open(note.pdfUrl, "_blank");
        }
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="p-2 bg-white shadow flex gap-2">
                <Button variant="outline" onClick={() => handleDownload("json")}>
                    Download JSON
                </Button>
                <Button variant="outline" onClick={() => handleDownload("png")}>
                    Download PNG
                </Button>
                <Button variant="outline" onClick={() => handleDownload("pdf")}>
                    Download PDF
                </Button>
            </div>
            <div className="flex-1">
                <Excalidraw
                    initialData={note.excalidrawData}
                    viewModeEnabled
                    theme="light"
                />
            </div>
        </div>
    );
}
