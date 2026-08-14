"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto, Role } from "@/types/api";
import { STORAGE_KEYS } from "@/lib/config";
import { apiAuth } from "@/lib/api";

interface AuthContextType {
  user: AuthResponseDto | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  primaryRole: Role | string | null;
  login: (dto: LoginRequestDto) => Promise<{ success: boolean; message: string }>;
  register: (dto: RegisterRequestDto) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthResponseDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Failed loading auth state:", err);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuthData = (data: AuthResponseDto) => {
    setUser(data);
    setToken(data.token);
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
  };

  const login = async (dto: LoginRequestDto) => {
    const res = await apiAuth.login(dto);
    if (res.success && res.data) {
      saveAuthData(res.data);
      return { success: true, message: res.message || "Login successful" };
    }
    return { success: false, message: res.message || "Login failed" };
  };

  const register = async (dto: RegisterRequestDto) => {
    const res = await apiAuth.register(dto);
    if (res.success && res.data) {
      saveAuthData(res.data);
      return { success: true, message: res.message || "Registration successful" };
    }
    return { success: false, message: res.message || "Registration failed" };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    router.push("/login");
  };

  const primaryRole = user?.roles && user.roles.length > 0 ? user.roles[0] : null;
  const isAdmin = primaryRole === Role.Admin;
  const isTeacher = primaryRole === Role.Teacher;
  const isStudent = primaryRole === Role.Student;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        isTeacher,
        isStudent,
        primaryRole,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
