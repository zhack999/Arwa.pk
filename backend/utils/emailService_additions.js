// ── Append these to emailService.js (uses the same wrapper()/safeSend() already defined
//    at the top of that file — do not duplicate those) ──

export async function sendVerificationEmail(user, { token, otp }) {
    const verifyLink = `${FRONTEND_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
    await safeSend({
        to: user.email,
        subject: "Verify your Arwa Botaniqs account",
        html: wrapper(`
            <h2 style="color:${BRAND_GREEN};">Verify Your Email</h2>
            <p>Hi ${user.first_name}, welcome to Arwa Botaniqs! Please verify your email to activate your account.</p>
            <p>Enter this code in the app:</p>
            <p style="font-size:28px; font-weight:bold; letter-spacing:6px; color:${BRAND_GREEN}; text-align:center; margin:20px 0;">${otp}</p>
            <p>Or click the button below:</p>
            <a href="${verifyLink}" style="display:inline-block; margin-top:12px; padding:12px 28px; background:${BRAND_GREEN}; color:${BRAND_GOLD}; text-decoration:none; letter-spacing:1px;">VERIFY EMAIL</a>
            <p style="margin-top:20px; font-size:13px; color:#888;">This code and link expire in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
        `),
    });
}

export async function sendOtpEmail(user, otp, purpose) {
    const purposeCopy = purpose === "reset"
        ? "Use this code to reset your password:"
        : "Use this code to verify your account:";
    await safeSend({
        to: user.email,
        subject: purpose === "reset" ? "Your password reset code" : "Your verification code",
        html: wrapper(`
            <h2 style="color:${BRAND_GREEN};">Your One-Time Code</h2>
            <p>Hi ${user.first_name || ""}, ${purposeCopy}</p>
            <p style="font-size:28px; font-weight:bold; letter-spacing:6px; color:${BRAND_GREEN}; text-align:center; margin:20px 0;">${otp}</p>
            <p style="margin-top:20px; font-size:13px; color:#888;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email — your account is still secure.</p>
        `),
    });
}

// Deliberately does NOT confirm whether the email exists — sent only when it does, but
// worded so it reveals nothing new if somehow forwarded/seen by someone else.
export async function sendPasswordResetOtpEmail(user, otp) {
    return sendOtpEmail(user, otp, "reset");
}

export async function sendAccountLockedEmail(user, { unlockAt }) {
    await safeSend({
        to: user.email,
        subject: "Your account was temporarily locked",
        html: wrapper(`
            <h2 style="color:${BRAND_GREEN};">Account Temporarily Locked</h2>
            <p>Hi ${user.first_name || ""}, we noticed several failed login attempts on your account.</p>
            <p>For your security, your account has been temporarily locked until <strong>${unlockAt}</strong>.</p>
            <p>If this wasn't you, we'd recommend resetting your password once the lock clears.</p>
        `),
    });
}
