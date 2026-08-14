import React from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label} {props.required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all ${
          error
            ? "bg-rose-950/40 border-2 border-rose-500 text-rose-100 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/25 shadow-lg shadow-rose-500/10"
            : "bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mt-1 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-rose-400">{error}</span>
        </span>
      ) : helperText ? (
        <span className="text-xs text-slate-400 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
};

interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label} {props.required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      <textarea
        id={inputId}
        rows={props.rows || 4}
        className={`w-full px-4 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all ${
          error
            ? "bg-rose-950/40 border-2 border-rose-500 text-rose-100 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/25 shadow-lg shadow-rose-500/10"
            : "bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
        } ${className}`}
        {...props}
      />
      {error ? (
        <span className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mt-1 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-rose-400">{error}</span>
        </span>
      ) : helperText ? (
        <span className="text-xs text-slate-400 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
};

export const FormErrorAlert: React.FC<{ message?: string | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-4 rounded-2xl bg-rose-950/50 border-2 border-rose-500/80 text-rose-200 text-xs font-semibold flex items-start gap-3 shadow-xl shadow-rose-950/40 animate-in fade-in slide-in-from-top-2 duration-200">
      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-bold text-rose-300 uppercase tracking-wider text-[11px] mb-0.5">
          Validation & Submission Error
        </h4>
        <p className="text-rose-200 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
