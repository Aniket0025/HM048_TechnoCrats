import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(url: string) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const reconnectAttempts = useRef(0);
    const maxReconnect = 5;

    useEffect(() => {
        const socketInstance = io(url, {
            transports: ["websocket"],
            upgrade: false,
        });

        socketInstance.on("connect", () => {
            console.log("[Socket] Connected");
            setConnected(true);
            reconnectAttempts.current = 0;
        });

        socketInstance.on("disconnect", () => {
            console.log("[Socket] Disconnected");
            setConnected(false);
            if (reconnectAttempts.current < maxReconnect) {
                setTimeout(() => {
                    reconnectAttempts.current += 1;
                    socketInstance.connect();
                }, 2000 * reconnectAttempts.current);
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [url]);

    return { socket, connected };
}
