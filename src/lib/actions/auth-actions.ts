"use server";

import { prisma } from "@/lib/prisma";
import { transporter, mailOptions } from "@/lib/nodemailer";
import bcrypt from "bcryptjs";

export async function sendOTP(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await prisma.passwordRecoveryToken.upsert({
      where: { email_token: { email, token: otp } }, // Simplified or handle collision
      update: { token: otp, expires },
      create: { email, token: otp, expires },
    });
    
    // Actually, upsert with email_token unique constraint might be tricky if we want to replace the old one for the same email.
    // Let's just delete old ones for this email first.
    await prisma.passwordRecoveryToken.deleteMany({
      where: { email },
    });

    await prisma.passwordRecoveryToken.create({
      data: { email, token: otp, expires },
    });

    // Send Email
    await transporter.sendMail({
      ...mailOptions,
      to: email,
      subject: "Your PLEN Password Reset OTP",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">PLEN Security</h2>
          <p>Hello,</p>
          <p>You requested a password reset. Use the following 6-digit OTP to proceed:</p>
          <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f3f4f6; text-align: center; border-radius: 8px; letter-spacing: 5px; color: #000;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">&copy; 2026 PLEN Platform. All rights reserved.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("SEND_OTP_ERROR", error);
    return { error: "Failed to send OTP" };
  }
}

export async function verifyOTP(email: string, token: string) {
  try {
    const recoveryToken = await prisma.passwordRecoveryToken.findFirst({
      where: {
        email,
        token,
        expires: { gt: new Date() },
      },
    });

    if (!recoveryToken) {
      return { error: "Invalid or expired OTP" };
    }

    return { success: true };
  } catch (error) {
    return { error: "Verification failed" };
  }
}

export async function resetPassword(email: string, token: string, password: string) {
  try {
    const recoveryToken = await prisma.passwordRecoveryToken.findFirst({
      where: {
        email,
        token,
        expires: { gt: new Date() },
      },
    });

    if (!recoveryToken) {
      return { error: "Security context invalid" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the token after use
    await prisma.passwordRecoveryToken.delete({
      where: { id: recoveryToken.id },
    });

    return { success: true };
  } catch (error) {
    return { error: "Reset failed" };
  }
}
