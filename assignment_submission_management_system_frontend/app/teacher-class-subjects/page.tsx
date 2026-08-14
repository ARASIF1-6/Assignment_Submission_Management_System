"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  apiTeacherClassSubjects,
  apiClasses,
  apiSubjects,
  apiUsers,
} from "@/lib/api";
import {
  AssignTeacherRequestDto,
  ClassResponseDto,
  TeacherClassSubjectResponseDto,
  SubjectResponseDto,
  UserResponseDto,
} from "@/types/api";
import { Plus, UserCheck, Trash2 } from "lucide-react";

export default function TeacherClassSubjectsPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [teacherClassSubjects, setTeacherClassSubjects] = useState<TeacherClassSubjectResponseDto[]>([]);
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
  const [teachers, setTeachers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<AssignTeacherRequestDto>({
    classId: "",
    subjectId: "",
    teacherId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [csRes, cRes, sRes, uRes] = await Promise.all([
        apiTeacherClassSubjects.getAll(),
        apiClasses.getAll(),
        apiSubjects.getAll(),
        apiUsers.getAll(),
      ]);

      if (csRes.success) setTeacherClassSubjects(csRes.data || []);
      if (cRes.success) {
        setClasses(cRes.data || []);
        if (cRes.data && cRes.data.length > 0) setForm((prev) => ({ ...prev, classId: cRes.data[0].id }));
      }
      if (sRes.success) {
        setSubjects(sRes.data || []);
        if (sRes.data && sRes.data.length > 0) setForm((prev) => ({ ...prev, subjectId: sRes.data[0].id }));
      }
      if (uRes.success) {
        const teacherUsers = (uRes.data || []).filter((u) => u.roles.includes("Teacher"));
        setTeachers(teacherUsers);
        if (teacherUsers.length > 0) setForm((prev) => ({ ...prev, teacherId: teacherUsers[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.classId || !form.subjectId || !form.teacherId) return;

    setIsSubmitting(true);
    const res = await apiTeacherClassSubjects.assignTeacher(form);
    setIsSubmitting(false);

    if (res.success) {
      showToast("Teacher Assigned", "Assigned teacher to class-subject.", "success");
      setIsModalOpen(false);
      loadData();
    } else {
      showToast("Assignment Error", res.message, "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this assignment?")) return;
    const res = await apiTeacherClassSubjects.delete(id);
    if (res.success) {
      showToast("Assignment Removed", "Teacher class-subject mapping removed.", "info");
      loadData();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Teacher Class-Subjects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map faculty teachers to teach specific subjects within class sections
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Teacher</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading assignments...</div>
      ) : teacherClassSubjects.length === 0 ? (
        <Card className="py-12 text-center text-slate-400">
          No teacher class-subject assignments configured yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {teacherClassSubjects.map((cs) => (
            <Card key={cs.id} className="flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                    {cs.subjectName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100">{cs.className}</h3>
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Assigned Teacher</span>
                    <span className="text-xs font-semibold text-slate-200">{cs.teacherName}</span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => handleDelete(cs.id)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
                    title="Remove Assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Assign Teacher */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Teacher to Subject & Class"
        subtitle="Select class section, subject, and designated teacher"
      >
        <form onSubmit={handleAssign} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Class Section
            </label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Subject
            </label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Teacher
            </label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              {isSubmitting ? "Assigning..." : "Assign Teacher"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
