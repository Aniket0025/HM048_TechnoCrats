import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, X, MapPin, Loader2 } from "lucide-react";

interface Location {
    lat: number;
    lng: number;
    accuracy: number;
}

export default function QRScannerWithPermissions({ onScanSuccess, onClose }: {
    onScanSuccess: (qrToken: string, location: Location) => void;
    onClose: () => void;
}) {
    const [hasCamera, setHasCamera] = useState<boolean | null>(null);
    const [hasLocation, setHasLocation] = useState<boolean | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const containerId = "qr-scanner-container";

    useEffect(() => {
        checkPermissions();
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
            }
        };
    }, []);

    async function checkPermissions() {
        // Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCamera(true);
            stream.getTracks().forEach(t => t.stop());
        } catch {
            setHasCamera(false);
            setError("Camera permission denied. Please allow camera access.");
        }

        // Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => setHasLocation(true),
                () => setHasLocation(false)
            );
        } else {
            setHasLocation(false);
        }
    }

    async function requestLocation() {
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
                setLoading(false);
            },
            (err) => {
                setError("Location access denied. Please enable location.");
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }

    useEffect(() => {
        if (hasCamera && hasLocation && location) {
            startScanner();
        }
    }, [hasCamera, hasLocation, location]);

    function startScanner() {
        if (scannerRef.current) return;
        const scanner = new Html5QrcodeScanner(
            containerId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );
        scanner.render(
            (decodedText) => {
                scanner.clear().then(() => {
                    scannerRef.current = null;
                });
                onScanSuccess(decodedText, location!);
            },
            () => {}
        );
        scannerRef.current = scanner;
    }

    if (hasCamera === null || hasLocation === null) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    if (hasCamera === false || hasLocation === false) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <h2 className="text-lg font-semibold mb-4">Permissions Required</h2>
                    {hasCamera === false && (
                        <p className="text-sm text-red-600 mb-2">Camera access is required to scan QR codes.</p>
                    )}
                    {hasLocation === false && (
                        <p className="text-sm text-red-600 mb-4">Location access is required for attendance verification.</p>
                    )}
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Scan QR Code</h2>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>

                {!location ? (
                    <div className="text-center py-8">
                        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-4">Location is required for attendance.</p>
                        <button
                            onClick={requestLocation}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Enable Location"}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-2 text-xs text-green-600">
                            Location captured (±{Math.round(location.accuracy)}m)
                        </div>
                        <div id={containerId} />
                    </>
                )}

                {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </div>
        </div>
    );
}
