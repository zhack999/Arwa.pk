// Same pattern as googleAuth.js: verify the access token really belongs to OUR app
// (Facebook's debug_token endpoint) before trusting anything it unlocks.

export function isConfigured() {
    return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
}

// Returns { email, firstName, lastName, picture, facebookId } or throws.
export async function verifyFacebookAccessToken(accessToken) {
    if (!isConfigured()) {
        throw new Error("Facebook login is not configured.");
    }
    if (!accessToken) {
        throw new Error("Missing Facebook access token.");
    }

    const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;

    // Step 1: confirm the token is real, unexpired, and issued for OUR app.
    const debugRes = await fetch(
        `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(appAccessToken)}`
    );
    if (!debugRes.ok) {
        throw new Error("Couldn't verify Facebook token.");
    }
    const debugData = await debugRes.json();
    const info = debugData.data;
    if (!info || !info.is_valid || info.app_id !== process.env.FACEBOOK_APP_ID) {
        throw new Error("Invalid or expired Facebook token.");
    }

    // Step 2: fetch the actual profile now that the token is confirmed valid.
    const profileRes = await fetch(
        `https://graph.facebook.com/me?fields=id,first_name,last_name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
    );
    if (!profileRes.ok) {
        throw new Error("Couldn't fetch Facebook profile.");
    }
    const profile = await profileRes.json();

    if (!profile.email) {
        // Some Facebook accounts have no verified email, or the user declined the email
        // permission — we can't create/link an account without one.
        throw new Error("Your Facebook account doesn't have an email we can use. Please try another sign-in method.");
    }

    return {
        facebookId: profile.id,
        email: profile.email,
        firstName: profile.first_name || "Customer",
        lastName: profile.last_name || "",
        picture: profile.picture?.data?.url || null,
    };
}
