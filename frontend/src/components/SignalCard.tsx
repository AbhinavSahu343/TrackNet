"use client";

import { AlertCircle, CheckCircle, Radio } from "lucide-react";

interface SignalCardProps {
  title: string;
  status: "healthy" | "warning" | "critical";
  value: string | number;
  description?: string;
}

export const SignalCard: React.FC<SignalCardProps> = ({
  title,
  status,
  value,
  description,
}) => {
  const statusConfig = {
    healthy: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      icon: CheckCircle,
    },
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-600",
      icon: AlertCircle,
    },
    critical: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div
      className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className={`text-2xl font-bold mt-2 ${config.iconColor}`}>
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
      </div>
    </div>
  );
};
