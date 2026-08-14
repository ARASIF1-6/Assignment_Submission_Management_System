import React from "react";
import { AssignmentStatus, SubmissionStatus } from "@/types/api";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "sm",
}) => {
  const variantStyles = {
    primary: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    secondary: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    neutral: "bg-slate-700/40 text-slate-300 border-slate-600/40",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-medium",
    md: "px-3 py-1 text-sm font-semibold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-xs transition ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

export const AssignmentStatusBadge: React.FC<{ status: AssignmentStatus }> = ({ status }) => {
  if (status === AssignmentStatus.Published) {
    return <Badge variant="success">Published</Badge>;
  }
  return <Badge variant="warning">Draft</Badge>;
};

export const SubmissionStatusBadge: React.FC<{ status: SubmissionStatus }> = ({ status }) => {
  switch (status) {
    case SubmissionStatus.Graded:
      return <Badge variant="success">Graded</Badge>;
    case SubmissionStatus.Submitted:
      return <Badge variant="info">Submitted</Badge>;
    case SubmissionStatus.Returned:
      return <Badge variant="warning">Returned</Badge>;
    case SubmissionStatus.Late:
      return <Badge variant="danger">Late Submission</Badge>;
    default:
      return <Badge variant="neutral">Pending</Badge>;
  }
};
