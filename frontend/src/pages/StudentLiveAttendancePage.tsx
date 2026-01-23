import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../hooks/useSocket";
import QRScannerWithPermissions from "../components/QRScannerWithPermissions";
import { Camera, Wifi, WifiOff, CheckCircle, AlertCircle } from "lucide-react";

export default function StudentLiveAttendancePage() {
    const { user } = useAuth();
    const { socket, connected } = useSocket("http://localhost:5000");
    const [showScanner, setShowScanner] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (!socket || !user) return;

        socket.on("attendance-success", (data) => {
            setMessage({ type: "success", text: "Attendance marked successfully!" });
            setShowScanner(false);
        });

        socket.on("attendance-error", (data) => {
            setMessage({ type: "error", text: data.message });
            setShowScanner(false);
        });

        return () => {
            socket.off("attendance-success");
            socket.off("attendance-error");
        };
    }, [socket, user]);

    async function handleScanSuccess(qrToken: string, location: { lat: number; lng: number; accuracy: number }) {
        if (!socket || !user) return;
        socket.emit("mark-attendance", {
            qrToken,
            gpsLat: location.lat,
            gpsLng: location.lng,
            gpsAccuracy: location.accuracy,
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                    <h1 className="text-2xl font-bold mb-2">Live Attendance</h1>
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
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-gray-600 mb-4">Tap below to scan QR and mark your attendance.</p>
                    <button
                        onClick={() => setShowScanner(true)}
                        disabled={!connected}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                    >
                        <Camera className="w-5 h-5" />
                        Scan QR Code
                    </button>
                </div>

                {showScanner && (
                    <QRScannerWithPermissions
                        onScanSuccess={handleScanSuccess}
                        onClose={() => setShowScanner(false)}
                    />
                )}
            </div>
        </div>
    );
}
