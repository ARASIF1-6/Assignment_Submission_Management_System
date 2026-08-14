"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { checkApiHealth } from "@/lib/api";
import { LogOut, Wifi, WifiOff, RefreshCw } from "lucide-react";

export const Header: React.FC = () => {
  const { user, primaryRole, logout } = useAuth();
  const [apiStatus, setApiStatus] = useState<{ online: boolean; message: string }>({
    online: false,
    message: "Checking connection...",
  });
  const [isChecking, setIsChecking] = useState(false);

  const verifyHealth = async () => {
    setIsChecking(true);
    const status = await checkApiHealth();
    setApiStatus(status);
    setIsChecking(false);
  };

  useEffect(() => {
    verifyHealth();
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
      {/* API Status Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={verifyHealth}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
            apiStatus.online
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
          }`}
          title="Click to re-check API backend health"
        >
          {isChecking ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-300" />
          ) : apiStatus.online ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline">{apiStatus.message}</span>
        </button>
      </div>

      {/* Right Controls: User Profile & Logout */}
      <div className="flex items-center gap-4">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.fullName || "User"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {user?.email || "user@domain.com"} {primaryRole ? `• ${primaryRole}` : ""}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition flex items-center gap-1.5"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
