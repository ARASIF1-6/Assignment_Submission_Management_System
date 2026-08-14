"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { FormInput, FormTextArea, FormErrorAlert } from "@/components/ui/FormInput";
import { AssignmentStatusBadge } from "@/components/ui/Badge";
import { apiAssignments, apiTeacherClassSubjects } from "@/lib/api";
import {
  AssignmentResponseDto,
  AssignmentStatus,
  TeacherClassSubjectResponseDto,
  CreateAssignmentRequestDto,
  UpdateAssignmentRequestDto,
} from "@/types/api";
import {
  Plus,
  Search,
  Filter,
  Clock,
  Layers,
  CheckCircle2,
  Trash2,
  Edit,
  Pencil,
  Send,
  BookOpen,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function AssignmentsPage() {
  const { isTeacher, isAdmin, isStudent } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<AssignmentResponseDto[]>([]);
  const [teacherClassSubjects, setTeacherClassSubjects] = useState<TeacherClassSubjectResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State for Creating Assignment
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAssignmentRequestDto>({
    teacherClassSubjectId: "",
    title: "",
    description: "",
    deadline: "",
    maxMarks: 100,
    allowResubmission: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Assignment State
  const [editTarget, setEditTarget] = useState<AssignmentResponseDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateAssignmentRequestDto>({
    title: "", description: "", deadline: "", maxMarks: 100, allowResubmission: true,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const [assignRes, csRes] = await Promise.all([
        apiAssignments.getAll(),
        apiTeacherClassSubjects.getAll(),
      ]);

      if (assignRes.success) setAssignments(assignRes.data || []);
      if (csRes.success) {
        setTeacherClassSubjects(csRes.data || []);
        if (csRes.data && csRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, teacherClassSubjectId: csRes.data[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.teacherClassSubjectId) errs.teacherClassSubjectId = "Please select a Class & Subject mapping";
    if (!formData.title.trim()) errs.title = "Assignment title is required";
    if (!formData.description.trim()) errs.description = "Description is required";
    if (!formData.deadline) errs.deadline = "Deadline date/time is required";
    if (formData.maxMarks <= 0) errs.maxMarks = "Max marks must be greater than 0";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    const res = await apiAssignments.create(formData);
    setIsSubmitting(false);

    if (res.success) {
      showToast("Assignment Created", "Assignment has been created as draft.", "success");
      setIsModalOpen(false);
      loadAssignments();
    } else {
      setServerError(res.message || "Failed to create assignment.");
      showToast("Error", res.message, "error");
    }
  };

  const handlePublish = async (id: string) => {
    const res = await apiAssignments.publish(id);
    if (res.success) {
      showToast("Published", "Assignment is now published to students.", "success");
      loadAssignments();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  const openEdit = (assignment: AssignmentResponseDto) => {
    setEditTarget(assignment);
    // Format deadline to datetime-local value (strip seconds/Z)
    const dl = assignment.deadline ? assignment.deadline.slice(0, 16) : "";
    setEditForm({
      title: assignment.title,
      description: assignment.description,
      deadline: dl,
      maxMarks: assignment.maxMarks,
      allowResubmission: assignment.allowResubmission,
    });
    setEditErrors({});
    setEditServerError(null);
  };

  const validateEditForm = () => {
    const errs: Record<string, string> = {};
    if (!editForm.title.trim()) errs.title = "Assignment title is required";
    if (!editForm.description.trim()) errs.description = "Description is required";
    if (!editForm.deadline) errs.deadline = "Deadline date/time is required";
    if (editForm.maxMarks <= 0) errs.maxMarks = "Max marks must be greater than 0";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !validateEditForm()) return;
    setEditServerError(null);
    setIsEditSubmitting(true);
    const res = await apiAssignments.update(editTarget.id, editForm);
    setIsEditSubmitting(false);
    if (res.success) {
      showToast("Assignment Updated", `"${editForm.title}" has been updated.`, "success");
      setEditTarget(null);
      loadAssignments();
    } else {
      setEditServerError(res.message || "Failed to update assignment.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    const res = await apiAssignments.delete(id);
    if (res.success) {
      showToast("Deleted", "Assignment deleted successfully.", "info");
      loadAssignments();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  // Filtered List
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.className.toLowerCase().includes(search.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "PUBLISHED") return matchesSearch && a.status === AssignmentStatus.Published;
    if (statusFilter === "DRAFT") return matchesSearch && a.status === AssignmentStatus.Draft;
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Assignments</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse course assignments, deadlines, and submission requirements
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by assignment title, class, or subject..."
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
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Drafts</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading assignments...</div>
      ) : filteredAssignments.length === 0 ? (
        <Card className="py-12 text-center text-slate-400">
          No assignments found matching your criteria.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                    {assignment.subjectName}
                  </span>
                  <AssignmentStatusBadge status={assignment.status} />
                </div>

                <h3 className="text-base font-bold text-slate-100 leading-snug hover:text-indigo-300 transition">
                  <Link href={`/assignments/${assignment.id}`}>{assignment.title}</Link>
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{assignment.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {assignment.maxMarks} Marks
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={`/assignments/${assignment.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>View & Submit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {(isTeacher || isAdmin) && (
                    <div className="flex items-center gap-1">
                      {assignment.status === AssignmentStatus.Draft && (
                        <button
                          onClick={() => handlePublish(assignment.id)}
                          className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition"
                          title="Publish to Students"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(assignment)}
                        className="p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 transition"
                        title="Edit Assignment"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Assignment */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Assignment"
        subtitle="Publish course tasks for student submissions"
      >
        <form noValidate onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <FormErrorAlert message={serverError} />

          {/* Class & Subject Mapping */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Class &amp; Subject Mapping <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.teacherClassSubjectId}
                onChange={(e) => {
                  setFormData({ ...formData, teacherClassSubjectId: e.target.value });
                  if (formErrors.teacherClassSubjectId) setFormErrors((prev) => ({ ...prev, teacherClassSubjectId: "" }));
                }}
                className={`w-full appearance-none px-4 py-2.5 pr-9 rounded-xl text-sm focus:outline-none transition-all ${
                  formErrors.teacherClassSubjectId
                    ? "bg-rose-950/40 border-2 border-rose-500 text-rose-100 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/25 shadow-lg shadow-rose-500/10"
                    : "bg-slate-950/70 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                }`}
              >
                <option value="" disabled>
                  — Select a Class &amp; Subject —
                </option>
                {teacherClassSubjects.length === 0 ? (
                  <option disabled>No teacher class-subject mappings available</option>
                ) : (
                  teacherClassSubjects.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.className} — {cs.subjectName} ({cs.teacherName})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {formErrors.teacherClassSubjectId && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mt-0.5">
                <svg className="w-4 h-4 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {formErrors.teacherClassSubjectId}
              </span>
            )}
          </div>

          <FormInput
            label="Assignment Title"
            placeholder="e.g., Binary Search Tree Implementation"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            required
          />

          <FormTextArea
            label="Assignment Instructions & Description"
            placeholder="Specify assignment guidelines, test cases, and formatting instructions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={formErrors.description}
            rows={4}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Submission Deadline"
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              error={formErrors.deadline}
              required
            />

            <FormInput
              label="Maximum Marks"
              type="number"
              min="1"
              max="1000"
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
              error={formErrors.maxMarks}
              required
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="allowResubmission"
              checked={formData.allowResubmission}
              onChange={(e) => setFormData({ ...formData, allowResubmission: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="allowResubmission" className="text-xs text-slate-300 font-medium cursor-pointer">
              Allow resubmissions before deadline
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Assignment */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Assignment"
        subtitle={editTarget ? `Editing "${editTarget.title}"` : ""}
      >
        <form noValidate onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <FormErrorAlert message={editServerError} />

          <FormInput
            label="Assignment Title"
            placeholder="e.g., Binary Search Tree Implementation"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            error={editErrors.title}
            required
          />

          <FormTextArea
            label="Assignment Instructions & Description"
            placeholder="Specify assignment guidelines, test cases, and formatting instructions..."
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            error={editErrors.description}
            rows={4}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Submission Deadline"
              type="datetime-local"
              value={editForm.deadline}
              onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
              error={editErrors.deadline}
              required
            />
            <FormInput
              label="Maximum Marks"
              type="number"
              min="1"
              max="1000"
              value={editForm.maxMarks}
              onChange={(e) => setEditForm({ ...editForm, maxMarks: Number(e.target.value) })}
              error={editErrors.maxMarks}
              required
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="editAllowResubmission"
              checked={editForm.allowResubmission}
              onChange={(e) => setEditForm({ ...editForm, allowResubmission: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <label htmlFor="editAllowResubmission" className="text-xs text-slate-300 font-medium cursor-pointer">
              Allow resubmissions before deadline
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setEditTarget(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isEditSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
