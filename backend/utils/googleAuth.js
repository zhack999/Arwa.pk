// Verifies a Google access token the frontend obtained via Google Identity Services'
// OAuth2 token client, then fetches the profile server-side. We never trust profile
// fields sent up from the frontend directly — the access token itself is re-validated
// against Google before we call userinfo with it, so a forged/replayed token from
// somewhere else can't be used to claim an account.
//
// No `google-auth-library` dependency needed — just Node's built-in fetch (Node 18+,
// already implied by Express 5 in package.json).

export function isConfigured() {
    return Boolean(process.env.GOOGLE_CLIENT_ID);
}

// Returns { email, emailVerified, firstName, lastName, picture, googleId } or throws.
export async function verifyGoogleAccessToken(accessToken) {
    if (!isConfigured()) {
        throw new Error("Google login is not configured.");
    }
    if (!accessToken) {
        throw new Error("Missing Google access token.");
    }

    // Step 1: confirm the token is real and was issued for OUR app (audience check) —
    // without this, any Google access token from any app could be used to log in here.
    const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`);
    if (!tokenInfoRes.ok) {
        throw new Error("Invalid or expired Google token.");
    }
    const tokenInfo = await tokenInfoRes.json();
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error("Google token was not issued for this app.");
    }

    // Step 2: fetch the actual profile now that the token is confirmed valid.
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
        throw new Error("Couldn't fetch Google profile.");
    }
    const profile = await profileRes.json();

    if (!profile.email) {
        throw new Error("Your Google account doesn't have an email address we can use.");
    }

    return {
        googleId: profile.sub,
        email: profile.email,
        emailVerified: Boolean(profile.email_verified),
        firstName: profile.given_name || profile.name || "Customer",
        lastName: profile.family_name || "",
        picture: profile.picture || null,
    };
}
