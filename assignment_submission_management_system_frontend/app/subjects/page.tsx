"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { FormInput, FormTextArea, FormErrorAlert } from "@/components/ui/FormInput";
import { apiSubjects } from "@/lib/api";
import { CreateSubjectRequestDto, SubjectResponseDto, UpdateSubjectRequestDto } from "@/types/api";
import { Plus, Trash2, Pencil, ToggleLeft, ToggleRight } from "lucide-react";

export default function SubjectsPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateSubjectRequestDto>({ name: "", code: "", description: "" });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createServerError, setCreateServerError] = useState<string | null>(null);

  // Edit Modal
  const [editTarget, setEditTarget] = useState<SubjectResponseDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateSubjectRequestDto>({ name: "", description: "", isActive: true });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await apiSubjects.getAll();
      if (res.success) setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSubjects(); }, []);

  // ---- Create ----
  const validateCreate = () => {
    const errs: Record<string, string> = {};
    if (!createForm.name.trim()) errs.name = "Subject name is required";
    if (!createForm.code.trim()) errs.code = "Subject code is required";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateServerError(null);
    if (!validateCreate()) return;
    setIsCreating(true);
    const res = await apiSubjects.create(createForm);
    setIsCreating(false);
    if (res.success) {
      showToast("Subject Created", "New academic subject created.", "success");
      setIsCreateOpen(false);
      setCreateForm({ name: "", code: "", description: "" });
      loadSubjects();
    } else {
      setCreateServerError(res.message);
    }
  };

  // ---- Edit ----
  const openEdit = (subj: SubjectResponseDto) => {
    setEditTarget(subj);
    setEditForm({ name: subj.name, description: subj.description || "", isActive: subj.isActive });
    setEditErrors({});
    setEditServerError(null);
  };

  const validateEdit = () => {
    const errs: Record<string, string> = {};
    if (!editForm.name.trim()) errs.name = "Subject name is required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !validateEdit()) return;
    setEditServerError(null);
    setIsEditing(true);
    const res = await apiSubjects.update(editTarget.id, editForm);
    setIsEditing(false);
    if (res.success) {
      showToast("Subject Updated", `"${editForm.name}" has been updated.`, "success");
      setEditTarget(null);
      loadSubjects();
    } else {
      setEditServerError(res.message);
    }
  };

  // ---- Delete ----
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    const res = await apiSubjects.delete(id);
    if (res.success) {
      showToast("Subject Deleted", "Subject removed.", "info");
      loadSubjects();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Academic Subjects</h1>
          <p className="text-xs text-slate-400 mt-1">Manage core curriculum and subject codes</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setIsCreateOpen(true); setCreateServerError(null); setCreateErrors({}); }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Subject</span>
          </button>
        )}
      </div>

      {/* Subject Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <Card className="py-12 text-center text-slate-400">No subjects registered yet.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subj) => (
            <Card key={subj.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20 font-mono">
                    {subj.code}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${subj.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                    {subj.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 leading-snug">{subj.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{subj.description || "No description provided."}</p>
              </div>
              {isAdmin && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEdit(subj)}
                    className="p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 transition"
                    title="Edit Subject"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(subj.id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
                    title="Delete Subject"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Subject */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Subject" subtitle="Add a subject to the academic registry">
        <form noValidate onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormErrorAlert message={createServerError} />
          <FormInput label="Subject Name" placeholder="Data Structures & Algorithms"
            value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            error={createErrors.name} required />
          <FormInput label="Subject Code" placeholder="CS-201"
            value={createForm.code} onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
            error={createErrors.code} required />
          <FormTextArea label="Description" placeholder="Course details..."
            value={createForm.description || ""} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            rows={3} />
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={isCreating} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition">
              {isCreating ? "Creating..." : "Save Subject"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Subject */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Subject" subtitle={editTarget ? `Editing "${editTarget.name}"` : ""}>
        <form noValidate onSubmit={handleEdit} className="flex flex-col gap-4">
          <FormErrorAlert message={editServerError} />
          <FormInput label="Subject Name" placeholder="Data Structures & Algorithms"
            value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            error={editErrors.name} required />
          <FormTextArea label="Description" placeholder="Course details..."
            value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={3} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Status</label>
            <button type="button" onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition ${editForm.isActive ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300" : "bg-rose-500/10 border-rose-500/40 text-rose-300"}`}>
              {editForm.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              {editForm.isActive ? "Active — click to deactivate" : "Inactive — click to activate"}
            </button>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={isEditing} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition">
              {isEditing ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
