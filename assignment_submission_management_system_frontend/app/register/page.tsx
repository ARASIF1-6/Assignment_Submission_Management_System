"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { FormInput, FormErrorAlert } from "@/components/ui/FormInput";
import { Role } from "@/types/api";
import { Sparkles, ArrowRight, UserCheck, ShieldCheck, GraduationCap, ShieldAlert, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAdmin, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>(Role.Student);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Access Guard Check
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Administrator Access Required</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Account registration is restricted to System Administrators. Please log in with an Administrator account to register new users.
            </p>
          </div>
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isAuthenticated ? "Return to Dashboard" : "Go to Sign In"}</span>
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Please enter a valid email address";

    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";

    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    else if (!/[a-z]/.test(password)) errs.password = "Passwords must have at least one lowercase ('a'-'z').";
    else if (!/[A-Z]/.test(password)) errs.password = "Passwords must have at least one uppercase ('A'-'Z').";

    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const res = await register({
      email,
      password,
      firstName,
      lastName,
      role,
    });
    setIsSubmitting(false);

    if (res.success) {
      showToast("Account Created", `Registered user ${firstName} ${lastName} as ${role}!`, "success");
      router.push("/users");
    } else {
      setServerError(res.message || "Registration failed.");
      showToast("Registration Failed", res.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-lg relative z-10 my-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Admin User Registration</h1>
          <p className="text-sm text-slate-400 mt-1">
            Register new Student, Teacher, or Admin accounts
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl shadow-2xl">
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormErrorAlert message={serverError} />

            {/* Role Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Account Role <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setRole(Role.Student)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    role === Role.Student
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(Role.Teacher)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    role === Role.Teacher
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(Role.Admin)}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    role === Role.Admin
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: "" }));
                }}
                error={errors.firstName}
                required
              />
              <FormInput
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: "" }));
                }}
                error={errors.lastName}
                required
              />
            </div>

            <FormInput
              label="Email Address"
              type="email"
              placeholder="john.doe@school.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                error={errors.password}
                required
              />
              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                error={errors.confirmPassword}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                "Registering Account..."
              ) : (
                <>
                  <span>Create User Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            <Link href="/users" className="text-indigo-400 font-semibold hover:underline">
              &larr; Back to User Management
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
