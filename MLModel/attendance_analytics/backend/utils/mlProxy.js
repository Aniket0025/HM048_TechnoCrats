import { spawn } from "child_process";
import path from "path";

const MODEL_PATH = path.resolve(process.cwd(), "../MLModel");

let modelLoaded = false;
let loadingPromise = null;

async function ensureModelLoaded() {
    if (modelLoaded) return;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        try {
            await runPythonScript(["-c", "import joblib; import sklearn; print('OK')"]);
            modelLoaded = true;
        } catch (e) {
            console.error("[ML] Failed to load Python ML environment:", e);
            modelLoaded = false;
        } finally {
            loadingPromise = null;
        }
    })();

    return loadingPromise;
}

function runPythonScript(args) {
    return new Promise((resolve, reject) => {
        const python = process.platform === "win32" ? "python" : "python3";
        const proc = spawn(python, args, {
            cwd: MODEL_PATH,
            stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => (stdout += data.toString()));
        proc.stderr.on("data", (data) => (stderr += data.toString()));

        proc.on("close", (code) => {
            if (code === 0) resolve(stdout.trim());
            else reject(new Error(stderr || stdout));
        });
    });
}

export async function predictProxy(features) {
    await ensureModelLoaded();
    if (!modelLoaded) {
        throw new Error("ML model not available");
    }

    const {
        ip,
        userAgent,
        gpsLat,
        gpsLng,
        gpsAccuracy,
        hour,
        dayOfWeek,
        deviceFingerprint,
    } = features;

    // Simple feature engineering for demo
    const ipParts = ip ? ip.split(".").map(Number) : [0, 0, 0, 0];
    const uaLength = userAgent ? userAgent.length : 0;
    const fpHash = deviceFingerprint ? deviceFingerprint.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 1000 : 0;

    const input = [
        hour || 0,
        dayOfWeek || 0,
        gpsLat || 0,
        gpsLng || 0,
        gpsAccuracy || 0,
        ipParts[0] || 0,
        ipParts[1] || 0,
        ipParts[2] || 0,
        ipParts[3] || 0,
        uaLength,
        fpHash,
    ];

    try {
        const result = await runPythonScript([
            "src/predict.py",
            "--input",
            input.join(","),
        ]);

        // Result is expected to be a JSON string with probability
        const prob = parseFloat(result);
        if (isNaN(prob) || prob < 0 || prob > 1) {
            throw new Error("Invalid ML output");
        }
        return prob;
    } catch (e) {
        console.error("[ML] Prediction failed:", e);
        // Fallback: simple heuristic
        const heuristicScore =
            (gpsAccuracy && gpsAccuracy > 100 ? 0.3 : 0) +
            (ipParts[0] === 10 || ipParts[0] === 192 ? 0.1 : 0.2) +
            (uaLength < 30 ? 0.2 : 0);
        return Math.min(1, heuristicScore);
    }
}
