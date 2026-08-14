"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Card } from "@/components/ui/Card";
import { FormInput, FormTextArea } from "@/components/ui/FormInput";
import { apiSettings, checkApiHealth } from "@/lib/api";
import { getApiBaseUrl, setApiBaseUrl } from "@/lib/config";
import { SettingResponseDto } from "@/types/api";
import { Settings as SettingsIcon, Save, RefreshCw, Server, Plus, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [apiUrl, setApiUrlState] = useState("");
  const [settings, setSettings] = useState<SettingResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<{ online: boolean; message: string }>({
    online: false,
    message: "Checking...",
  });

  // Upsert Setting State
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [isSavingSetting, setIsSavingSetting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setApiUrlState(getApiBaseUrl());
    const health = await checkApiHealth();
    setApiHealth(health);

    try {
      const res = await apiSettings.getAll();
      if (res.success) setSettings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveApiUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    showToast("Base URL Saved", "API base URL configuration updated.", "success");
    const health = await checkApiHealth();
    setApiHealth(health);
  };

  const handleUpsertSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) {
      showToast("Validation Error", "Key and Value are required.", "error");
      return;
    }

    setIsSavingSetting(true);
    const res = await apiSettings.upsert({ key, value, description });
    setIsSavingSetting(false);

    if (res.success) {
      showToast("Setting Saved", `Key '${key}' updated.`, "success");
      setKey("");
      setValue("");
      setDescription("");
      loadData();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  const handleDeleteSetting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this setting?")) return;
    const res = await apiSettings.delete(id);
    if (res.success) {
      showToast("Setting Deleted", "System setting removed.", "info");
      loadData();
    } else {
      showToast("Error", res.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure backend API connection and system parameters</p>
      </div>

      {/* Backend API Connection Card */}
      <Card className="flex flex-col gap-4 border-indigo-500/30">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-100">ASP.NET Core API Integration</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              apiHealth.online
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            {apiHealth.message}
          </span>
        </div>

        <form onSubmit={handleSaveApiUrl} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <FormInput
              label="Backend API Base URL"
              placeholder="http://localhost:5000"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              helperText="Target ASP.NET Core Web API server URL"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition w-full sm:w-auto self-end mb-0.5"
          >
            <Save className="w-4 h-4" />
            <span>Save URL</span>
          </button>
        </form>
      </Card>

      {/* Application Key-Value Settings */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add / Edit Setting Form */}
          <Card className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Upsert System Setting</span>
            </h3>

            <form onSubmit={handleUpsertSetting} className="flex flex-col gap-4">
              <FormInput
                label="Setting Key"
                placeholder="MaxFileSizeMB"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
              <FormInput
                label="Setting Value"
                placeholder="25"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
              <FormTextArea
                label="Description"
                placeholder="Setting explanation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
              <button
                type="submit"
                disabled={isSavingSetting}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition"
              >
                {isSavingSetting ? "Saving..." : "Save Setting Key"}
              </button>
            </form>
          </Card>

          {/* Settings List */}
          <Card className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-100">Registered System Settings</h3>
            {isLoading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading settings...</div>
            ) : settings.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No custom settings configured.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {settings.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-300">{s.key}</span>
                        <span className="text-xs text-slate-400 font-semibold">= {s.value}</span>
                      </div>
                      {s.description && (
                        <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSetting(s.id)}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 transition"
                      title="Delete Setting"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
