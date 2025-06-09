import React from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Map each custom alert type to an icon.
const iconMap = {
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
};

interface CustomAlertProps {
  type?: "error" | "success" | "warning" | "info";
  title: string;
  message: string;
  className?: string;
}

// Map custom types to allowed Alert variants.
const variantMap: Record<NonNullable<CustomAlertProps["type"]>, "default" | "destructive"> = {
  error: "destructive",
  success: "default",
  warning: "default",
  info: "default",
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  type = "info",
  title,
  message,
  className = "",
}) => {
  return (
    <Alert variant={variantMap[type]} className={`flex items-start gap-2 ${className}`}>
      {iconMap[type]}
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );
};

export default CustomAlert;
