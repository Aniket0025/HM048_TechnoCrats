import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { Wifi, WifiOff, Users, X, CheckCircle, AlertCircle } from "lucide-react";

interface AttendanceRecord {
    studentId: string;
    studentName: string;
    timestamp: string;
}

export default function TeacherLiveSessionPage() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user } = useAuth();
    const { socket, connected } = useSocket("http://localhost:5000");
    const [students, setStudents] = useState<AttendanceRecord[]>([]);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (!socket || !user || !sessionId) return;

        socket.emit("join-session", { sessionId, userId: user.sub, role: "teacher" });

        socket.on("attendance-marked", (data) => {
            setStudents((prev) => [...prev, data]);
        });

        socket.on("error", (data) => {
            setMessage({ type: "error", text: data.message });
        });

        return () => {
            socket.off("attendance-marked");
            socket.off("error");
        };
    }, [socket, user, sessionId]);

    async function closeSession() {
        if (!socket || !sessionId) return;
        socket.emit("close-session", { sessionId });
        setMessage({ type: "success", text: "Session closed" });
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl font-bold">Live Session</h1>
                        <button
                            onClick={closeSession}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                        >
                            Close Session
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        {connected ? (
                            <>
                                <Wifi className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">Connected</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-4 h-4 text-red-500" />
                                <span className="text-red-600">Disconnected</span>
                            </>
                        )}
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg mb-4 flex items-center gap-2 ${
                        message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                        {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Attendance ({students.length})</h2>
                    </div>
                    {students.length === 0 ? (
                        <p className="text-gray-500">No students have marked attendance yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {students.map((s, i) => (
                                <li key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                                    <span className="font-medium">{s.studentName}</span>
                                    <span className="text-xs text-gray-500">{new Date(s.timestamp).toLocaleTimeString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
