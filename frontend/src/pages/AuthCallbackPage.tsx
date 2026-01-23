import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TOKEN_KEY = "edusync_token";

export default function AuthCallbackPage() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
            toast({
                title: "Authentication failed",
                description: "Missing token from OAuth callback.",
                variant: "destructive",
            });
            navigate("/login", { replace: true });
            return;
        }

        localStorage.setItem(TOKEN_KEY, token);
        window.location.replace("/dashboard");
    }, [location.search, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-sm text-muted-foreground">Signing you in…</div>
        </div>
    );
}
