import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Fence {
    id: string;
    name: string;
    lat: number;
    lng: number;
    radius: number;
    color?: string;
}

interface Props {
    fences: Fence[];
    onFenceCreate?: (fence: Omit<Fence, "id">) => void;
    onFenceUpdate?: (id: string, fence: Partial<Fence>) => void;
    onFenceDelete?: (id: string) => void;
    center?: { lat: number; lng: number };
    zoom?: number;
    readonly?: boolean;
    currentLocation?: { lat: number; lng: number };
}

export default function GeoFenceMap({
    fences,
    onFenceCreate,
    onFenceUpdate,
    onFenceDelete,
    center = { lat: 28.6139, lng: 77.2090 },
    zoom = 15,
    readonly = false,
    currentLocation,
}: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapRefInstance = useRef<google.maps.Map | null>(null);
    const circlesRef = useRef<Map<string, google.maps.Circle>>(new Map());
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
    const [isDrawing, setIsDrawing] = useState(false);
    const [tempCircle, setTempCircle] = useState<google.maps.Circle | null>(null);

    useEffect(() => {
        const loader = new Loader({
            apiKey: process.env.VITE_GOOGLE_MAPS_API_KEY || "",
            version: "weekly",
            libraries: ["geometry", "places"],
        });

        loader.load().then(() => {
            if (!mapRef.current) return;

            const map = new google.maps.Map(mapRef.current, {
                center,
                zoom,
                mapTypeId: "roadmap",
                clickableIcons: false,
            });

            mapRefInstance.current = map;

            if (!readonly) {
                map.addListener("click", handleMapClick);
            }

            if (currentLocation) {
                new google.maps.Marker({
                    position: currentLocation,
                    map,
                    title: "Your Location",
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeColor: "#fff",
                        strokeWeight: 2,
                    },
                });
            }
        });
    }, []);

    useEffect(() => {
        if (!mapRefInstance.current) return;
        drawFences();
    }, [fences]);

    function drawFences() {
        // Clear old circles/markers
        circlesRef.current.forEach(c => c.setMap(null));
        markersRef.current.forEach(m => m.setMap(null));
        circlesRef.current.clear();
        markersRef.current.clear();

        fences.forEach(fence => {
            const circle = new google.maps.Circle({
                map: mapRefInstance.current!,
                center: { lat: fence.lat, lng: fence.lng },
                radius: fence.radius,
                fillColor: fence.color || "#4285F4",
                fillOpacity: 0.2,
                strokeColor: fence.color || "#4285F4",
                strokeOpacity: 0.6,
                strokeWeight: 2,
                clickable: !readonly,
            });

            circlesRef.current.set(fence.id, circle);

            if (!readonly) {
                circle.addListener("click", () => {
                    const newName = prompt("Edit fence name:", fence.name);
                    if (newName && onFenceUpdate) {
                        onFenceUpdate(fence.id, { name: newName });
                    }
                });
            }

            // Center marker
            const marker = new google.maps.Marker({
                position: { lat: fence.lat, lng: fence.lng },
                map: mapRefInstance.current!,
                title: fence.name,
                label: { text: fence.name, color: "#fff" },
                clickable: !readonly,
            });

            markersRef.current.set(fence.id, marker);
        });
    }

    function handleMapClick(e: google.maps.MapMouseEvent) {
        if (readonly || isDrawing) return;

        const lat = e.latLng!.lat();
        const lng = e.latLng!.lng();

        const circle = new google.maps.Circle({
            map: mapRefInstance.current!,
            center: { lat, lng },
            radius: 50,
            fillColor: "#34A853",
            fillOpacity: 0.2,
            strokeColor: "#34A853",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            editable: true,
        });

        setTempCircle(circle);
        setIsDrawing(true);

        const listener = circle.addListener("radius_changed", () => {
            // Optional: live preview radius
        });

        const finishDrawing = () => {
            google.maps.event.removeListener(listener);
            const radius = circle.getRadius();
            const name = prompt("Fence name:", `Fence ${fences.length + 1}`);

            if (name && onFenceCreate) {
                onFenceCreate({ name, lat, lng, radius });
            }

            circle.setMap(null);
            setTempCircle(null);
            setIsDrawing(false);
        };

        // Double-click or press Enter to finish
        google.maps.event.addListenerOnce(mapRefInstance.current!, "click", finishDrawing);
        document.addEventListener("keydown", function onKey(e) {
            if (e.key === "Enter") {
                document.removeEventListener("keydown", onKey);
                finishDrawing();
            }
        });
    }

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full min-h-[500px]" />
            {!readonly && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-2 z-10">
                    <button
                        onClick={() => {
                            if (tempCircle) {
                                tempCircle.setMap(null);
                                setTempCircle(null);
                                setIsDrawing(false);
                            }
                        }}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                    >
                        Cancel Drawing
                    </button>
                </div>
            )}
        </div>
    );
}
