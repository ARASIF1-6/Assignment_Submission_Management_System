"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { FormInput, FormErrorAlert } from "@/components/ui/FormInput";
import { apiUsers, apiAuth } from "@/lib/api";
import { CreateUserRequestDto, Role, UpdateUserRequestDto, UserResponseDto } from "@/types/api";
import { Plus, Search, Trash2, Pencil, UserCheck, ShieldCheck, GraduationCap, ToggleLeft, ToggleRight } from "lucide-react";

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserRequestDto>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: Role.Student,
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createServerError, setCreateServerError] = useState<string | null>(null);

  // Edit Modal
  const [editTarget, setEditTarget] = useState<UserResponseDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserRequestDto>({ firstName: "", lastName: "", isActive: true });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editServerError, setEditServerError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await apiUsers.getAll();
      if (res.success) setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // ---- Create ----
  const validateCreate = () => {
    const errs: Record<string, string> = {};
    if (!createForm.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) errs.email = "Enter a valid email";
    if (!createForm.firstName.trim()) errs.firstName = "First name is required";
    if (!createForm.lastName.trim()) errs.lastName = "Last name is required";
    if (!createForm.password) errs.password = "Password is required";
    else if (createForm.password.length < 6) errs.password = "Password must be at least 6 characters";
    else if (!/[a-z]/.test(createForm.password)) errs.password = "Passwords must have at least one lowercase ('a'-'z').";
    else if (!/[A-Z]/.test(createForm.password)) errs.password = "Passwords must have at least one uppercase ('A'-'Z').";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateServerError(null);
    if (!validateCreate()) return;
    setIsCreating(true);
    const res = await apiAuth.register(createForm);
    setIsCreating(false);
    if (res.success) {
      showToast("User Created", `Registered ${createForm.firstName} ${createForm.lastName} as ${createForm.role}.`, "success");
      setIsCreateOpen(false);
      setCreateForm({ email: "", password: "", firstName: "", lastName: "", role: Role.Student });
      loadUsers();
    } else {
      setCreateServerError(res.message);
    }
  };

  // ---- Edit ----
  const openEdit = (u: UserResponseDto) => {
    setEditTarget(u);
    setEditForm({ firstName: u.firstName, lastName: u.lastName, isActive: u.isActive });
    setEditErrors({});
    setEditServerError(null);
  };

  const validateEdit = () => {
    const errs: Record<string, string> = {};
    if (!editForm.firstName.trim()) errs.firstName = "First name is required";
    if (!editForm.lastName.trim()) errs.lastName = "Last name is required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !validateEdit()) return;
    setEditServerError(null);
    setIsEditing(true);
    const res = await apiUsers.update(editTarget.id, editForm);
    setIsEditing(false);
    if (res.success) {
      showToast("User Updated", `${editForm.firstName} ${editForm.lastName} has been updated.`, "success");
      setEditTarget(null);
      loadUsers();
    } else {
      setEditServerError(res.message);
    }
  };

  // ---- Delete ----
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    const res = await apiUsers.delete(id);
    if (res.success) {
      showToast("User Deleted", "User removed from system.", "info");
      loadUsers();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase());
    if (roleFilter === "Admin") return matchesSearch && u.roles.includes("Admin");
    if (roleFilter === "Teacher") return matchesSearch && u.roles.includes("Teacher");
    if (roleFilter === "Student") return matchesSearch && u.roles.includes("Student");
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Control system accounts, roles, and administrative access</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => { setIsCreateOpen(true); setCreateServerError(null); setCreateErrors({}); }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
        >
          <option value="ALL">All Roles</option>
          <option value="Admin">Admins</option>
          <option value="Teacher">Teachers</option>
          <option value="Student">Students</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading users...</div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users found.</td></tr>
                ) : filteredUsers.map((u) => {
                  const roleName = u.roles[0] || "User";
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-4 font-semibold text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                            {u.firstName.charAt(0)}
                          </div>
                          <span>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${
                          roleName === "Admin"
                            ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                            : roleName === "Teacher"
                            ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                            : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        }`}>
                          {roleName === "Admin" && <ShieldCheck className="w-3 h-3" />}
                          {roleName === "Teacher" && <UserCheck className="w-3 h-3" />}
                          {roleName === "Student" && <GraduationCap className="w-3 h-3" />}
                          {roleName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${u.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(u)}
                              className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 transition"
                              title="Edit User"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Create User */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New User Account" subtitle="Add a new student, teacher, or administrator">
        <form noValidate onSubmit={handleCreate} className="flex flex-col gap-4">
          <FormErrorAlert message={createServerError} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Account Role</label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
              className="w-full px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value={Role.Student}>Student</option>
              <option value={Role.Teacher}>Teacher</option>
              <option value={Role.Admin}>Admin</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="First Name" placeholder="Jane" value={createForm.firstName}
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
              error={createErrors.firstName} required />
            <FormInput label="Last Name" placeholder="Smith" value={createForm.lastName}
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
              error={createErrors.lastName} required />
          </div>
          <FormInput label="Email Address" type="email" placeholder="jane.smith@school.edu"
            value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            error={createErrors.email} required />
          <FormInput label="Initial Password" type="password" placeholder="••••••••"
            value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            error={createErrors.password} required />
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">Cancel</button>
            <button type="submit" disabled={isCreating} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition">
              {isCreating ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit User Account" subtitle={editTarget ? `Editing ${editTarget.firstName} ${editTarget.lastName}` : ""}>
        <form noValidate onSubmit={handleEdit} className="flex flex-col gap-4">
          <FormErrorAlert message={editServerError} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="First Name" placeholder="Jane" value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              error={editErrors.firstName} required />
            <FormInput label="Last Name" placeholder="Smith" value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              error={editErrors.lastName} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Account Status</label>
            <button
              type="button"
              onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 transition ${
                editForm.isActive
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/40 text-rose-300"
              }`}
            >
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
