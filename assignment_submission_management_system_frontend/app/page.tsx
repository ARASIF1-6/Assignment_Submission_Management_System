"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Award,
  Clock,
  Layers,
  Users,
  Settings,
  Lock,
  FileText,
  ChevronRight,
  Star,
  Send,
  Sliders,
  Database,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, user, primaryRole } = useAuth();
  const [activeRoleTab, setActiveRoleTab] = useState<"admin" | "teacher" | "student">("admin");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-[-100px] w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-[-100px] w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-100 tracking-tight block">ASMS Portal</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block">
                Assignment &amp; Submission System
              </span>
            </div>
          </Link>

          {/* Quick Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#overview" className="hover:text-indigo-400 transition">Overview</a>
            <a href="#roles" className="hover:text-indigo-400 transition">Roles &amp; Access</a>
            <a href="#responsibilities" className="hover:text-indigo-400 transition">Responsibilities</a>
            <a href="#matrix" className="hover:text-indigo-400 transition">Feature Matrix</a>
          </nav>

          {/* Auth Button */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                <span>Dashboard ({primaryRole || "User"})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Role-Centric Institutional Academic Management System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight max-w-4xl mx-auto">
          Streamlining Academic Workflows for{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admins, Teachers &amp; Students
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          An integrated platform built with distinct role permissions — offering seamless account governance, coursework authoring, real-time submission tracking, and evaluation workflows.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
          >
            <span>Access Portal Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#roles"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition"
          >
            <span>Explore Role Architecture</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Role-Based Access</h4>
            <p className="text-xs text-slate-400 mt-1">Strict RBAC boundaries for Admin, Teacher, and Student personas.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Coursework Lifecycle</h4>
            <p className="text-xs text-slate-400 mt-1">Drafting, publishing, deadlines, and resubmission settings.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Evaluation &amp; Feedback</h4>
            <p className="text-xs text-slate-400 mt-1">Numerical scoring out of max marks and feedback comments.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-3">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Live API Backend</h4>
            <p className="text-xs text-slate-400 mt-1">Directly integrated with ASP.NET Core Web API database services.</p>
          </div>
        </div>
      </section>

      {/* Roles Deep Dive Section */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Three-Tier Architecture</h2>
          <p className="text-3xl font-extrabold text-slate-100 tracking-tight mt-2">
            Tailored Dashboard &amp; Permissions by Role
          </p>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Each user experience is customized around the primary role assigned during administrator registration.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Admin Role */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 transition flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-6 shadow-lg shadow-purple-500/10 group-hover:scale-110 transition">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                System Governance
              </div>
              <h3 className="text-2xl font-bold text-slate-100">Administrator</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Full authority over system user accounts, class sections, course subjects, and global faculty allocations.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Provision Student, Teacher &amp; Admin accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Configure Classes, Academic Years &amp; Subjects</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Assign Teachers to Class-Subject Mappings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Toggle Active / Inactive user &amp; class statuses</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Admin Login</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Teacher Role */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-violet-500/50 transition flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 mb-6 shadow-lg shadow-violet-500/10 group-hover:scale-110 transition">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                Faculty Execution
              </div>
              <h3 className="text-2xl font-bold text-slate-100">Teacher / Faculty</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Manages course assignments, monitors student submissions, evaluates work, and provides grade feedback.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Draft &amp; publish coursework assignments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Set submission deadlines &amp; max score points</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Inspect student solutions in real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span>Grade submissions with numerical marks &amp; notes</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Teacher Login</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Student Role */}
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-6 shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                Scholar Portal
              </div>
              <h3 className="text-2xl font-bold text-slate-100">Student</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Views enrolled coursework, tracks assignment deadlines, submits solutions, and checks review scores.
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>View assigned tasks by class &amp; subject</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Submit online code &amp; solution answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Track live countdowns to due deadlines</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Review graded marks &amp; teacher comments</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Student Login</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Responsibilities Breakdown */}
      <section id="responsibilities" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Detailed Duty Breakdown</h2>
          <p className="text-3xl font-extrabold text-slate-100 tracking-tight mt-2">
            Role Responsibilities &amp; Operations
          </p>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Select a role below to inspect the full list of system capabilities and workflow duties.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveRoleTab("admin")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
              activeRoleTab === "admin"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Duties</span>
          </button>

          <button
            onClick={() => setActiveRoleTab("teacher")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
              activeRoleTab === "teacher"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher Duties</span>
          </button>

          <button
            onClick={() => setActiveRoleTab("student")}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition ${
              activeRoleTab === "student"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Duties</span>
          </button>
        </div>

        {/* Tab Content Cards */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-2xl">
          {activeRoleTab === "admin" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>1. User Provisioning &amp; Role Management</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Only System Administrators possess the authorization to register new user accounts (Students, Teachers, and Admins). Administrators manage global user status toggles (Active vs Inactive) and perform account removals.
                </p>

                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-8">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <span>2. Academic Classes &amp; Sections</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Admins establish institutional class structures, assign class codes (e.g. `CS-101-A`), set academic years (e.g. `2025-2026`), edit class metadata, and handle student enrollment mappings.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span>3. Subject Catalog &amp; Faculty Allocation</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Admins maintain the core course subject registry (e.g. `Algorithms`, `Database Systems`) and map specific Teachers to Class-Subject pairings (`apiTeacherClassSubjects`).
                </p>

                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-8">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span>4. Global System Configuration</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Admins manage global settings, institutional parameters, system maintenance flags, and oversee overall data security and API endpoint compliance.
                </p>
              </div>
            </div>
          )}

          {activeRoleTab === "teacher" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-400" />
                  <span>1. Assignment Authoring &amp; Drafting</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Teachers create new assignments by choosing target Class-Subject mappings, writing comprehensive instructions, setting submission deadlines, and defining total maximum score points.
                </p>

                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-8">
                  <Send className="w-5 h-5 text-violet-400" />
                  <span>2. Publishing &amp; Resubmission Controls</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Assignments start in `Draft` state so teachers can refine guidelines. Once finalized, teachers publish assignments to students and configure whether resubmissions are permitted before due dates.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                  <span>3. Submission Queue Inspection</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Teachers access the global submission stream or filter by specific assignments to inspect submitted student solution code, timestamps, and completion statuses.
                </p>

                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-8">
                  <Award className="w-5 h-5 text-violet-400" />
                  <span>4. Evaluation, Scoring &amp; Feedback</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Teachers grade student solutions by assigning numerical scores out of maximum points and writing constructive feedback remarks that are instantly visible to the student.
                </p>
              </div>
            </div>
          )}

          {activeRoleTab === "student" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-200">
              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <span>1. Enrolled Coursework Overview</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Students log into their dashboard to view all published assignments for their enrolled classes and subjects, complete with instructions and deadline dates.
                </p>

                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-8">
                  <Send className="w-5 h-5 text-emerald-400" />
                  <span>2. Online Solution Submission</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Students complete their coursework online by entering source code, formatted text, or project descriptions directly into the assignment submission form.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>3. Live Deadline &amp; Status Tracking</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Clear badge indicators show whether a submission is `Submitted`, `Graded`, or `Late`. Countdown timers alert students to upcoming due dates.
                </p>

                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-8">
                  <Star className="w-5 h-5 text-emerald-400" />
                  <span>4. Score Reviews &amp; Iterative Revision</span>
                </h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Students review their awarded points and teacher feedback. If resubmission is enabled by the faculty member, students can submit revised solutions prior to the deadline.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Permission Matrix Table */}
      <section id="matrix" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Permissions Matrix</h2>
          <p className="text-3xl font-extrabold text-slate-100 tracking-tight mt-2">
            Role Capability Comparison
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Quick reference guide comparing platform capabilities across all three system roles.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4 sm:p-5">Platform Feature / Capability</th>
                  <th className="p-4 sm:p-5 text-center text-purple-300">Admin</th>
                  <th className="p-4 sm:p-5 text-center text-violet-300">Teacher</th>
                  <th className="p-4 sm:p-5 text-center text-emerald-300">Student</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 sm:p-5 font-semibold text-slate-200">Register New Users (Students/Teachers/Admins)</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Denied</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Denied</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 sm:p-5 font-semibold text-slate-200">Create &amp; Edit Academic Classes &amp; Subjects</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Read Only</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Read Only</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 sm:p-5 font-semibold text-slate-200">Assign Teachers to Class-Subject Mappings</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Read Only</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Denied</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 sm:p-5 font-semibold text-slate-200">Create &amp; Publish Course Assignments</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Read Only</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 sm:p-5 font-semibold text-slate-200">Submit Solutions &amp; Code Answers</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">Optional</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">Optional</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 sm:p-5 font-semibold text-slate-200">Evaluate Submissions &amp; Award Marks</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ View Only</td>
                </tr>

                <tr className="hover:bg-slate-900/40">
                  <td className="p-4 sm:p-5 font-semibold text-slate-200">Configure Global System Settings</td>
                  <td className="p-4 sm:p-5 text-center text-emerald-400 font-bold">✔ Full Access</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Denied</td>
                  <td className="p-4 sm:p-5 text-center text-slate-500">❌ Denied</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* System Workflow Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">End-to-End Execution</h2>
          <p className="text-3xl font-extrabold text-slate-100 tracking-tight mt-2">
            How the Platform Works
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-100">Setup &amp; Allocation</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Admin creates classes, subjects, registers accounts, and assigns teachers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-purple-600/30">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-100">Create &amp; Publish</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Teacher authors assignment guidelines, sets deadlines, and publishes to class.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-100">Student Submission</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Student views task details, writes solution text/code, and submits before due date.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-lg shadow-amber-600/30">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-100">Grading &amp; Review</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Teacher reviews solution, awards marks, and writes feedback for student score review.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-12 border-t border-slate-800/80 bg-slate-950/90 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-300">
              ASMS Portal — Assignment &amp; Submission Management System
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Integrated ASP.NET Core Backend &amp; Next.js TypeScript Frontend
          </p>

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
          >
            Go to Login
          </Link>
        </div>
      </footer>
    </div>
  );
}
