"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { SubmissionStatusBadge } from "@/components/ui/Badge";
import { FormInput, FormTextArea } from "@/components/ui/FormInput";
import { apiSubmissions } from "@/lib/api";
import { SubmissionResponseDto, SubmissionStatus } from "@/types/api";
import { Search, Filter, UploadCloud, CheckCircle2, Clock, Eye } from "lucide-react";

export default function SubmissionsPage() {
  const { isTeacher, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Grade Modal State
  const [selectedSub, setSelectedSub] = useState<SubmissionResponseDto | null>(null);
  const [marks, setMarks] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await apiSubmissions.getAll();
      if (res.success) setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setIsSubmitting(true);
    const res = await apiSubmissions.grade(selectedSub.id, { marks, feedback });
    setIsSubmitting(false);

    if (res.success) {
      showToast("Graded", "Submission grade updated.", "success");
      setSelectedSub(null);
      loadSubmissions();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.assignmentTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.studentName.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "GRADED") return matchesSearch && s.status === SubmissionStatus.Graded;
    if (statusFilter === "SUBMITTED") return matchesSearch && s.status === SubmissionStatus.Submitted;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          Submissions Tracker
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor all student submitted work, grades, and teacher reviews
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name or assignment title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Submissions</option>
            <option value="SUBMITTED">Pending Grading</option>
            <option value="GRADED">Graded</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading submissions...</div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-slate-400">
          No submissions found matching filter.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sub) => (
            <Card key={sub.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    {sub.studentName}
                  </span>
                  <SubmissionStatusBadge status={sub.status} />
                </div>

                <h3 className="text-base font-bold text-slate-100 leading-snug">
                  {sub.assignmentTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 line-clamp-3 font-mono">
                  {sub.answer}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Date: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                  <span className="font-bold text-slate-200">
                    {sub.marks !== undefined ? `Score: ${sub.marks} pts` : "Un-graded"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/assignments/${sub.assignmentId}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Task</span>
                  </Link>

                  {(isTeacher || isAdmin) && (
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setMarks(sub.marks || 0);
                        setFeedback(sub.feedback || "");
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold transition"
                    >
                      Grade
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Grade Modal */}
      <Modal
        isOpen={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title="Grade Submission"
        subtitle={`Student: ${selectedSub?.studentName}`}
      >
        {selectedSub && (
          <form noValidate onSubmit={handleGradeSubmit} className="flex flex-col gap-4">
            <FormInput
              label="Assigned Marks"
              type="number"
              min="0"
              max="1000"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              required
            />
            <FormTextArea
              label="Teacher Feedback"
              placeholder="Feedback comments..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                {isSubmitting ? "Saving..." : "Save Grade"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
