import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { HttpError } from "../utils/HttpError.js";
import { User } from "../models/User.js";

function signToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new HttpError(500, "JWT_SECRET is not set");
    }

    return jwt.sign(
        { sub: user._id.toString(), email: user.email, role: user.role },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

function getGoogleConfig() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new HttpError(500, "Google OAuth env vars missing (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REDIRECT_URI)");
    }

    return { clientId, clientSecret, redirectUri };
}

function signState(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new HttpError(500, "JWT_SECRET is not set");
    }

    return jwt.sign(
        {
            ...payload,
            nonce: crypto.randomBytes(16).toString("hex"),
        },
        secret,
        { expiresIn: "10m" }
    );
}

function verifyState(state) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new HttpError(500, "JWT_SECRET is not set");
    }

    try {
        return jwt.verify(state, secret);
    } catch {
        throw new HttpError(400, "Invalid OAuth state");
    }
}

function getSafeRedirectUrl(redirectTo) {
    const frontend = process.env.FRONTEND_ORIGIN;
    if (!frontend) return null;

    if (!redirectTo) return new URL(frontend).toString();

    if (redirectTo.startsWith("/")) {
        const url = new URL(frontend);
        url.pathname = redirectTo;
        return url.toString();
    }

    try {
        const url = new URL(redirectTo);
        const frontendUrl = new URL(frontend);
        if (url.origin !== frontendUrl.origin) return new URL(frontend).toString();
        return url.toString();
    } catch {
        return new URL(frontend).toString();
    }
}

function buildGoogleAuthUrl({ clientId, redirectUri, state }) {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "online");
    if (state) url.searchParams.set("state", state);
    return url.toString();
}

async function exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri }) {
    const body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    });

    const resp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
    });

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
        throw new HttpError(401, json?.error_description || json?.error || "OAuth token exchange failed");
    }

    return json;
}

export async function googleStart(req, res) {
    const { clientId, redirectUri } = getGoogleConfig();

    const redirectTo = typeof req.query.redirectTo === "string" ? req.query.redirectTo : null;
    const state = signState({ redirectTo });

    const url = buildGoogleAuthUrl({ clientId, redirectUri, state });
    return res.redirect(url);
}

export async function googleCallback(req, res) {
    const { clientId, clientSecret, redirectUri } = getGoogleConfig();

    const code = req.query.code;
    if (!code || typeof code !== "string") {
        throw new HttpError(400, "Missing OAuth code");
    }

    const state = req.query.state;
    if (!state || typeof state !== "string") {
        throw new HttpError(400, "Missing OAuth state");
    }

    const decodedState = verifyState(state);
    const redirectFromState = typeof decodedState?.redirectTo === "string" ? decodedState.redirectTo : null;

    const tokens = await exchangeCodeForTokens({ code, clientId, clientSecret, redirectUri });
    const idToken = tokens?.id_token;
    if (!idToken) throw new HttpError(401, "Missing id_token from Google");

    const oauthClient = new OAuth2Client({ clientId });
    const ticket = await oauthClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    const email = payload?.email;
    if (!email) throw new HttpError(401, "Google account email not available");

    const name = payload?.name || "";
    const avatar = payload?.picture || "";

    let user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
        const randomPassword = crypto.randomBytes(24).toString("hex");
        user = await User.create({
            name,
            email: String(email).toLowerCase(),
            password: randomPassword,
            role: "student",
            avatar,
        });
    } else {
        const patch = {};
        if (name && !user.name) patch.name = name;
        if (avatar && !user.avatar) patch.avatar = avatar;
        if (Object.keys(patch).length > 0) {
            user = await User.findByIdAndUpdate(user._id, patch, { new: true });
        }
    }

    const token = signToken(user);

    const successRedirect =
        getSafeRedirectUrl(redirectFromState) ||
        getSafeRedirectUrl(process.env.OAUTH_SUCCESS_REDIRECT) ||
        getSafeRedirectUrl(process.env.FRONTEND_ORIGIN);

    if (successRedirect) {
        const url = new URL(successRedirect);
        url.searchParams.set("token", token);
        return res.redirect(url.toString());
    }

    return res.json({ token, user });
}
