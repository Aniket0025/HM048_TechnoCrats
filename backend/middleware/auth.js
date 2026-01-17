import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.slice("Bearer ".length);

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "JWT_SECRET is not set" });
        }

        const payload = jwt.verify(token, secret);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
