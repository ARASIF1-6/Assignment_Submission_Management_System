"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/ui/Badge";
import {
  apiAssignments,
  apiClasses,
  apiSubmissions,
  apiUsers,
  apiSubjects,
} from "@/lib/api";
import {
  AssignmentResponseDto,
  AssignmentStatus,
  ClassResponseDto,
  Role,
  SubmissionResponseDto,
  SubmissionStatus,
  UserResponseDto,
} from "@/types/api";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const { user, primaryRole, isAdmin, isTeacher, isStudent } = useAuth();

  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [assignRes, subRes, classRes, userRes] = await Promise.all([
          apiAssignments.getAll(),
          apiSubmissions.getAll(),
          apiClasses.getAll(),
          apiUsers.getAll(),
        ]);

        if (assignRes.success) setAssignments(assignRes.data || []);
        if (subRes.success) setSubmissions(subRes.data || []);
        if (classRes.success) setClasses(classRes.data || []);
        if (userRes.success) setUsers(userRes.data || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter((a) => a.status === AssignmentStatus.Published).length;
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.status === SubmissionStatus.Graded).length;
  const pendingGrading = submissions.filter((s) => s.status === SubmissionStatus.Submitted).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assignment & Submission Platform</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.fullName || "User"}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isAdmin && "You have full administrative privileges over users, classes, subjects, and assignments."}
              {isTeacher && "Manage class assignments, review student work, and submit grades with feedback."}
              {isStudent && "Track upcoming assignment deadlines, submit answers, and check your graded feedback."}
            </p>
          </div>

          {/* Role Quick Action */}
          <div className="flex items-center gap-3 shrink-0">
            {isTeacher && (
              <Link
                href="/assignments"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </Link>
            )}
            {isStudent && (
              <Link
                href="/assignments"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>View My Work</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/users"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
              >
                <Users className="w-4 h-4" />
                <span>Manage Users</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Assignments
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalAssignments}</h3>
            <p className="text-xs text-indigo-400 mt-1 font-medium">
              {publishedAssignments} Published
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <FileText className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Submissions
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalSubmissions}</h3>
            <p className="text-xs text-emerald-400 mt-1 font-medium">
              {gradedSubmissions} Graded
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <UploadCloud className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Grading
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{pendingGrading}</h3>
            <p className="text-xs text-amber-400 mt-1 font-medium">Needs Teacher Action</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Classes
            </p>
            <h3 className="text-2xl font-bold text-slate-100 mt-1">{classes.length}</h3>
            <p className="text-xs text-purple-400 mt-1 font-medium">{users.length} Users Total</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Recent Assignments & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Assignments */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Recent Assignments</h3>
              <p className="text-xs text-slate-400">Latest active course tasks and deadlines</p>
            </div>
            <Link
              href="/assignments"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No assignments created yet.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {assignments.slice(0, 4).map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/assignments/${assignment.id}`}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900/90 transition flex flex-col gap-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition">
                        {assignment.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {assignment.className} • {assignment.subjectName}
                      </p>
                    </div>
                    <AssignmentStatusBadge status={assignment.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/40 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Due: {new Date(assignment.deadline).toLocaleDateString()}
                    </span>
                    <span className="font-medium text-slate-300">
                      Max Marks: {assignment.maxMarks}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Submissions Overview */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Submissions Stream</h3>
              <p className="text-xs text-slate-400">Recent student answers and teacher reviews</p>
            </div>
            <Link
              href="/submissions"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">No submissions recorded yet.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {submissions.slice(0, 4).map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">
                        {sub.assignmentTitle}
                      </h4>
                      <p className="text-xs text-slate-400">Submitted by {sub.studentName}</p>
                    </div>
                    <SubmissionStatusBadge status={sub.status} />
                  </div>
                  {sub.status === SubmissionStatus.Graded && sub.marks !== undefined && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                      <span>Score: {sub.marks} pts</span>
                      {sub.feedback && <span className="italic truncate max-w-[200px]">&quot;{sub.feedback}&quot;</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
