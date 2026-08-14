"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { FormInput, FormTextArea } from "@/components/ui/FormInput";
import { AssignmentStatusBadge, SubmissionStatusBadge } from "@/components/ui/Badge";
import { apiAssignments, apiSubmissions } from "@/lib/api";
import {
  AssignmentResponseDto,
  SubmissionResponseDto,
  SubmissionStatus,
} from "@/types/api";
import {
  ArrowLeft,
  Clock,
  Award,
  BookOpen,
  User,
  Send,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [assignment, setAssignment] = useState<AssignmentResponseDto | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Student submission form state
  const [answerText, setAnswerText] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [mySubmission, setMySubmission] = useState<SubmissionResponseDto | null>(null);

  // Teacher Grading Modal state
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionResponseDto | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState<string>("");
  const [gradeError, setGradeError] = useState<string>("");
  const [isGrading, setIsGrading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assignRes, subRes] = await Promise.all([
        apiAssignments.getById(id),
        apiSubmissions.getAll(id),
      ]);

      if (assignRes.success && assignRes.data) {
        setAssignment(assignRes.data);
      }

      if (subRes.success && subRes.data) {
        setSubmissions(subRes.data);

        // Find current student's submission if any
        if (user) {
          const mySub = subRes.data.find(
            (s) => s.studentId === user.userId || s.studentName.includes(user.fullName.split(" ")[0])
          );
          if (mySub) {
            setMySubmission(mySub);
            setAnswerText(mySub.answer);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  // Student answer submit
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) {
      setAnswerError("Please enter your answer text or submission code");
      return;
    }
    setAnswerError("");
    setIsSubmittingAnswer(true);

    let res;
    if (mySubmission) {
      res = await apiSubmissions.update(mySubmission.id, { answer: answerText });
    } else {
      res = await apiSubmissions.submit({ assignmentId: id, answer: answerText });
    }
    setIsSubmittingAnswer(false);

    if (res.success) {
      showToast("Submission Recorded", "Your answer was saved successfully!", "success");
      fetchData();
    } else {
      showToast("Submission Error", res.message, "error");
    }
  };

  // Teacher grade submit
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !assignment) return;

    if (gradeMarks < 0 || gradeMarks > assignment.maxMarks) {
      setGradeError(`Marks must be between 0 and ${assignment.maxMarks}`);
      return;
    }
    setGradeError("");
    setIsGrading(true);

    const res = await apiSubmissions.grade(selectedSubmission.id, { marks: gradeMarks, feedback: gradeFeedback });
    setIsGrading(false);

    if (res.success) {
      showToast("Submission Graded", "Marks & feedback recorded successfully.", "success");
      setSelectedSubmission(null);
      fetchData();
    } else {
      showToast("Grading Error", res.message, "error");
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400">Loading assignment details...</div>;
  }

  if (!assignment) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-4">
        <p className="text-slate-400">Assignment not found or has been removed.</p>
        <Link href="/assignments" className="text-indigo-400 font-semibold text-sm hover:underline">
          &larr; Return to Assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back Link */}
      <Link
        href="/assignments"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assignments</span>
      </Link>

      {/* Assignment Header Card */}
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                {assignment.className} — {assignment.subjectName}
              </span>
              <AssignmentStatusBadge status={assignment.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              {assignment.title}
            </h1>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Deadline</span>
                <span>{new Date(assignment.deadline).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <Award className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Max Marks</span>
                <span>{assignment.maxMarks} Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Body */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Instructions & Guidelines
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {assignment.description}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Created by: <strong className="text-slate-200">{assignment.createdByTeacherName}</strong></span>
          <span>Resubmission: {assignment.allowResubmission ? "Allowed" : "Not Allowed"}</span>
        </div>
      </Card>

      {/* STUDENT SECTION: Submit Answer */}
      {(isStudent || isAdmin) && (
        <Card className="flex flex-col gap-4 border-indigo-500/30">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                <span>Student Solution Submission</span>
              </h3>
              <p className="text-xs text-slate-400">Provide your code, answers, or text response below</p>
            </div>
            {mySubmission && <SubmissionStatusBadge status={mySubmission.status} />}
          </div>

          {mySubmission && mySubmission.status === SubmissionStatus.Graded && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex flex-col gap-1">
              <span className="text-sm font-bold">Graded Score: {mySubmission.marks} / {assignment.maxMarks}</span>
              {mySubmission.feedback && (
                <p className="text-xs text-emerald-300">Teacher Feedback: &quot;{mySubmission.feedback}&quot;</p>
              )}
            </div>
          )}

          <form noValidate onSubmit={handleStudentSubmit} className="flex flex-col gap-4">
            <FormTextArea
              label="Your Answer / Solution"
              placeholder="Paste code or detailed text explanation here..."
              value={answerText}
              onChange={(e) => {
                setAnswerText(e.target.value);
                if (answerError) setAnswerError("");
              }}
              error={answerError}
              rows={6}
              disabled={mySubmission?.status === SubmissionStatus.Graded && !assignment.allowResubmission}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingAnswer}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                <FileCheck className="w-4 h-4" />
                <span>{mySubmission ? "Update Submission" : "Submit Answer"}</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* TEACHER / ADMIN SECTION: Student Submissions Table */}
      {(isTeacher || isAdmin) && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-400" />
                <span>Student Submissions ({submissions.length})</span>
              </h3>
              <p className="text-xs text-slate-400">Review solutions, enter marks, and provide feedback</p>
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              No students have submitted solutions for this assignment yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Submitted At</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Marks</th>
                    <th className="p-3.5">Feedback</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3.5 font-semibold text-slate-100">{sub.studentName}</td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <SubmissionStatusBadge status={sub.status} />
                      </td>
                      <td className="p-3.5 font-bold text-slate-100">
                        {sub.marks !== undefined ? `${sub.marks} / ${assignment.maxMarks}` : "—"}
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate">
                        {sub.feedback || "—"}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedSubmission(sub);
                            setGradeMarks(sub.marks || 0);
                            setGradeFeedback(sub.feedback || "");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 font-semibold transition"
                        >
                          Grade / Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Grade Modal */}
      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title="Grade Student Submission"
        subtitle={`Student: ${selectedSubmission?.studentName}`}
      >
        {selectedSubmission && (
          <form noValidate onSubmit={handleGradeSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
                Submitted Answer
              </label>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedSubmission.answer}
              </div>
            </div>

            <FormInput
              label={`Marks (Out of ${assignment.maxMarks})`}
              type="number"
              min="0"
              max={assignment.maxMarks}
              value={gradeMarks}
              onChange={(e) => setGradeMarks(Number(e.target.value))}
              error={gradeError}
              required
            />

            <FormTextArea
              label="Teacher Feedback"
              placeholder="Great work! Clarify edge cases..."
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGrading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                {isGrading ? "Saving Grade..." : "Submit Grade"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
