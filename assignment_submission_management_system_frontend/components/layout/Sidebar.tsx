"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types/api";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  Settings,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [Role.Admin, Role.Teacher, Role.Student],
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: FileText,
    roles: [Role.Admin, Role.Teacher, Role.Student],
  },
  {
    label: "Submissions",
    href: "/submissions",
    icon: UploadCloud,
    roles: [Role.Admin, Role.Teacher, Role.Student],
  },
  {
    label: "Classes",
    href: "/classes",
    icon: GraduationCap,
    roles: [Role.Admin, Role.Teacher],
  },
  {
    label: "Subjects",
    href: "/subjects",
    icon: BookOpen,
    roles: [Role.Admin],
  },
  {
    label: "Assign Teachers",
    href: "/teacher-class-subjects",
    icon: UserCheck,
    roles: [Role.Admin],
  },
  {
    label: "Users & Roles",
    href: "/users",
    icon: Users,
    roles: [Role.Admin],
  },
  {
    label: "System Settings",
    href: "/settings",
    icon: Settings,
    roles: [Role.Admin],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, primaryRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredItems = NAV_ITEMS.filter(
    (item) => !primaryRole || item.roles.includes(primaryRole as Role)
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand & Logo Header */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base tracking-tight leading-tight">
                ASMS Portal
              </h1>
              <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">
                Submission Hub
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-inner"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Current Active Role Widget */}
        <div className="mt-auto pt-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Active Role
              </p>
              <p className="text-xs font-bold text-indigo-300 truncate">
                {primaryRole || "User"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
