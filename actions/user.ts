"use server";

import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ConnectToDB } from "@/config/db";
import { sendEmail } from "@/utils/sendEmail";
import User from "@/schemas/user";

interface user {
  email: string;
  companyName: string;
  password: string;
  username: string;
}

export async function signupHandler(data: user) {
  await ConnectToDB();

  const { email, username, companyName, password } = data;
  if (!email || !companyName || !password) {
    throw new Error("Missing fields");
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash the password and create the new user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email, username, companyName, password: hashedPassword });

  // Send the verification email using the reusable function
  await sendVerificationEmail(newUser);

  // Optionally, generate a JWT if you want to auto-login the new user
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: "24h" });

  return {
    token,
    user: { id: newUser._id.toString(), email, companyName, username },
  };
}

interface ExtendedUser extends user {
  _id: string;
  verificationStatus: boolean
}

export async function sendVerificationEmail(user: ExtendedUser) {
  // Generate a verification token (expires in 1 hour)
  const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "24h" });
  // Construct the verification link
  const verificationLink = `${process.env.BaseUrl}/verify-email?token=${verificationToken}`;
  
  // Send the verification email
  await sendEmail(user.email, "Verify Your Email", `Click the following link to verify your email: ${verificationLink}`);
  
  return verificationToken;
}

export async function verifyEmailAction(token: string) {
  await ConnectToDB();

  if (!token) {
    throw new Error("Missing token");
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    
    if (!decoded?.id) {
      throw new Error("Invalid token");
    }

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if already verified
    if (user.verificationStatus) {
      return { message: "Email already verified" };
    }

    // Update the user's verified status
    user.verificationStatus = true;
    await user.save();

    return { message: "Email verified successfully" };
  } catch (error) {
    console.error("Verification error:", error);
    throw new Error("Invalid or expired token");
  }
}


export async function forgotPasswordEmailHandler(data: { email: string }) {
  // Ensure DB is connected
  await ConnectToDB();

  const { email } = data;
  if (!email) throw new Error("Missing email");

  const user = await User.findOne({ email });
  if (!user) throw new Error("No user found with that email");

  // Generate reset token (expires in 1 hour)
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "24h" });

  // Send email with the reset link
  const resetLink = `${process.env.BaseUrl}/reset-password?token=${resetToken}`;
  await sendEmail(email, "Reset Your Password", `Click here to reset your password: ${resetLink}`);

  return { message: "Password reset email sent", resetToken };
}


export async function resetPassword(data:  {token: string, newPassword: string}) {
  await ConnectToDB();
  const { token, newPassword } = data;
  if (!token || !newPassword) {
    throw new Error("Invalid request");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    if (!decoded || !decoded.id) {
      throw { error: "Invalid token" };
    }

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: "Password updated successfully" };
  } catch (error) {
    console.error("Password reset error:", error);
    throw new Error("Invalid or expired token");
  }
}
