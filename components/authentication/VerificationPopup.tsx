// components/VerificationPopup.tsx
"use client";

import React, { useState } from "react";
import Popup from "./Popup";
import { sendVerificationEmail } from "@/actions/user";

interface userI {
  email?: string | null;
  companyName?: string | null;
  username: string;
  id?: string;
  verificationStatus?: boolean;
  password?: string | null;
}

interface VerificationPopupProps {
  user: userI

  // Optionally, you can allow the parent to control the open state.
  onClose?: () => void;
}

const VerificationPopup: React.FC<VerificationPopupProps> = ({ user, onClose }) => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendVerification = async () => {
    setSending(true);
    setMessage("");

    if (!user.email || !user.id) return;

    const userObj = {
      email: user.email,
      companyName: user.companyName || "",
      username: user.username || "",
      _id: user.id,
      verificationStatus: user.verificationStatus || false, // fallback to false instead of ""
      password: user.password || ""
    };
    try {
      const res = await sendVerificationEmail(userObj)
      if (res) {
        setMessage("Verification email sent. Please check your inbox.");
      } else {
        setMessage("Failed to send verification email. Please try again later.");
      }
    } catch (error) {
      console.error("Error sending verification email", error);
      setMessage("An unexpected error occurred.");
    }
    setSending(false);
    // Optionally, call onClose() to let the parent know the popup can be closed.
    if (onClose) onClose();
  };

  return (
    <Popup
      title="Email Not Verified"
      defaultOpen={true} // open automatically
      onSubmit={handleSendVerification}
      submitLabel={sending ? "Sending..." : "Resend Verification Email"}
    >
      <p>
        Your account is not verified. Please check your email for a verification link or click the button below to resend the verification email.
      </p>
      {message && <p className="text-green-600 font-medium mt-2">{message}</p>}
    </Popup>
  );
};

export default VerificationPopup;
