"use client";

import React from "react";
import { ClipLoader } from "react-spinners";

interface LoadingScreenProps {
  spinnerSize?: number;
  spinnerColor?: string;
  message?: string 
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  spinnerSize = 80,
  spinnerColor = "black",
  message="Loading..."
}) => {

  return (
    <div
      className="fixed inset-0 z-50 flex items-center flex-col justify-center bg-white/50 backdrop-blur-sm"
      style={{ WebkitBackdropFilter: "blur(4px)" }} // for Safari support
    >
      <ClipLoader color={spinnerColor} size={spinnerSize} />
      {message && <span className="inline-block pt-2 font-semibold">{message}</span>}
    </div>
  );
};

export default LoadingScreen;
