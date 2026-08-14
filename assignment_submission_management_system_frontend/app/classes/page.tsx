"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { FormInput, FormTextArea, FormErrorAlert } from "@/components/ui/FormInput";
import { apiClasses, apiUsers } from "@/lib/api";
import { ClassResponseDto, CreateClassRequestDto, UpdateClassRequestDto, UserResponseDto } from "@/types/api";
import { Plus, UserPlus, Trash2, Pencil, ToggleLeft, ToggleRight } from "lucide-react";

export default function ClassesPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [students, setStudents] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateClassRequestDto>({ name: "", code: "", description: "", academicYear: "2025-2026" });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createServerError, setCreateServerError] = useState<string | null>(null);

  // Edit Modal
  const [editTarget, setEditTarget] = useState<ClassResponseDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateClassRequestDto>({ name: "", description: "", academicYear: "", isActive: true });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  // Enroll Modal
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [classRes, userRes] = await Promise.all([apiClasses.getAll(), apiUsers.getAll()]);
      if (classRes.success) setClasses(classRes.data || []);
      if (userRes.success) {
        const studentUsers = (userRes.data || []).filter((u) => u.roles.includes("Student"));
        setStudents(studentUsers);
        if (studentUsers.length > 0) setSelectedStudentId(studentUsers[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ---- Create ----
  const validateCreate = () => {
    const errs: Record<string, string> = {};
    if (!createForm.name.trim()) errs.name = "Class name is required";
    if (!createForm.code.trim()) errs.code = "Class code is required";
    if (!createForm.academicYear.trim()) errs.academicYear = "Academic year is required";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateServerError(null);
    if (!validateCreate()) return;
    setIsCreating(true);
    const res = await apiClasses.create(createForm);
    setIsCreating(false);
    if (res.success) {
      showToast("Class Created", "New academic class created.", "success");
      setIsCreateOpen(false);
      setCreateForm({ name: "", code: "", description: "", academicYear: "2025-2026" });
      loadData();
    } else {
      setCreateServerError(res.message);
    }
  };

  // ---- Edit ----
  const openEdit = (cls: ClassResponseDto) => {
    setEditTarget(cls);
    setEditForm({ name: cls.name, description: cls.description || "", academicYear: cls.academicYear, isActive: cls.isActive });
    setEditErrors({});
    setEditServerError(null);
  };

  const validateEdit = () => {
    const errs: Record<string, string> = {};
    if (!editForm.name.trim()) errs.name = "Class name is required";
    if (!editForm.academicYear.trim()) errs.academicYear = "Academic year is required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !validateEdit()) return;
    setEditServerError(null);
    setIsEditing(true);
    const res = await apiClasses.update(editTarget.id, editForm);
    setIsEditing(false);
    if (res.success) {
      showToast("Class Updated", `"${editForm.name}" has been updated.`, "success");
      setEditTarget(null);
      loadData();
    } else {
      setEditServerError(res.message);
    }
  };

  // ---- Enroll ----
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !selectedStudentId) return;
    setIsEnrolling(true);
    const res = await apiUsers.enrollStudent({ classId: selectedClassId, studentId: selectedStudentId });
    setIsEnrolling(false);
    if (res.success) {
      showToast("Student Enrolled", "Student assigned to class successfully.", "success");
      setIsEnrollOpen(false);
    } else {
      showToast("Enrollment Error", res.message, "error");
    }
  };

  // ---- Delete ----
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    const res = await apiClasses.delete(id);
    if (res.success) {
      showToast("Class Deleted", "Class removed.", "info");
      loadData();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Classes</h1>
          <p className="text-xs text-slate-400 mt-1">Manage academic sections and student enrollments</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setIsCreateOpen(true); setCreateServerError(null); setCreateErrors({}); }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class</span>
          </button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading classes...</div>
      ) : classes.length === 0 ? (
        <Card className="py-12 text-center text-slate-400">No classes registered yet.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <Card key={cls.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 font-mono">
                    {cls.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">{cls.academicYear}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cls.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"}`}>
                      {cls.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-100 leading-snug">{cls.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{cls.description || "No description provided."}</p>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => { setSelectedClassId(cls.id); setIsEnrollOpen(true); }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Enroll</span>
                    </button>
                    <button
                      onClick={() => openEdit(cls)}
                      className="p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 transition"
                      title="Edit Class"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Class */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Class Section" subtitle="Specify academic class details">
        <form noValidate onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormErrorAlert message={createServerError} />
          <FormInput label="Class Name" placeholder="Computer Science — Section A"
            value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            error={createErrors.name} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Class Code" placeholder="CS-101-A"
              value={createForm.code} onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
              error={createErrors.code} required />
            <FormInput label="Academic Year" placeholder="2025-2026"
              value={createForm.academicYear} onChange={(e) => setCreateForm({ ...createForm, academicYear: e.target.value })}
              error={createErrors.academicYear} required />
          </div>
          <FormTextArea label="Description" placeholder="Class description..."
            value={createForm.description || ""} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            rows={3} />
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={isCreating} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition">
              {isCreating ? "Creating..." : "Save Class"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Class */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Class" subtitle={editTarget ? `Editing "${editTarget.name}"` : ""}>
        <form noValidate onSubmit={handleEdit} className="flex flex-col gap-4">
          <FormErrorAlert message={editServerError} />
          <FormInput label="Class Name" placeholder="Computer Science — Section A"
            value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            error={editErrors.name} required />
          <FormInput label="Academic Year" placeholder="2025-2026"
            value={editForm.academicYear} onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
            error={editErrors.academicYear} required />
          <FormTextArea label="Description" placeholder="Class description..."
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

      {/* Modal: Enroll Student */}
      <Modal isOpen={isEnrollOpen} onClose={() => setIsEnrollOpen(false)} title="Enroll Student into Class" subtitle="Assign a registered student to this class section">
        <form onSubmit={handleEnroll} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Select Student</label>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500">
              {students.map((st) => (
                <option key={st.id} value={st.id}>{st.firstName} {st.lastName} ({st.email})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsEnrollOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={isEnrolling} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition">
              {isEnrolling ? "Enrolling..." : "Confirm Enrollment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
