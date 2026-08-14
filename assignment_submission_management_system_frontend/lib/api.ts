import { getApiBaseUrl, STORAGE_KEYS } from "./config";
import {
  ApiResponse,
  AssignTeacherRequestDto,
  AssignmentResponseDto,
  AssignmentStatus,
  AuthResponseDto,
  ClassResponseDto,
  TeacherClassSubjectResponseDto,
  CreateAssignmentRequestDto,
  CreateClassRequestDto,
  CreateSubjectRequestDto,
  CreateSubmissionRequestDto,
  CreateUserRequestDto,
  EnrollStudentRequestDto,
  EnrollmentResponseDto,
  GradeSubmissionRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  SettingResponseDto,
  SubjectResponseDto,
  SubmissionResponseDto,
  SubmissionStatus,
  UpdateAssignmentRequestDto,
  UpdateClassRequestDto,
  UpdateSubjectRequestDto,
  UpdateSubmissionRequestDto,
  UpdateSubmissionStatusRequestDto,
  UpdateUserRequestDto,
  UpsertSettingRequestDto,
  UserResponseDto,
} from "@/types/api";

// Utility to get auth token from storage
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }
  return null;
};

// Generic fetch wrapper targeting ASP.NET Core API
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Error ${response.status}: ${response.statusText}`,
          data: null as unknown as T,
        };
      }
      return data as ApiResponse<T>;
    } else {
      if (!response.ok) {
        return {
          success: false,
          message: `Error ${response.status}: ${response.statusText}`,
          data: null as unknown as T,
        };
      }
      return {
        success: true,
        message: "Operation completed",
        data: {} as T,
      };
    }
  } catch (error: any) {
    console.error(`API Request Error [${endpoint}]:`, error);
    return {
      success: false,
      message: error?.message || "Failed to connect to backend server.",
      data: null as unknown as T,
    };
  }
}

// Check live backend API health
export async function checkApiHealth(): Promise<{ online: boolean; message: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/swagger/index.html`, { method: "HEAD" });
    if (res.ok || res.status === 200 || res.status === 304 || res.status === 404) {
      return { online: true, message: `Connected to API (${baseUrl})` };
    }
    return { online: false, message: `API Unreachable (${baseUrl})` };
  } catch {
    return { online: false, message: `Backend Offline (${baseUrl})` };
  }
}

// ==================== AUTH API ====================
export const apiAuth = {
  login: async (dto: LoginRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    return await request<AuthResponseDto>("/api/Auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  register: async (dto: RegisterRequestDto): Promise<ApiResponse<AuthResponseDto>> => {
    return await request<AuthResponseDto>("/api/Auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};

// ==================== USERS API ====================
export const apiUsers = {
  getAll: async (): Promise<ApiResponse<UserResponseDto[]>> => {
    return await request<UserResponseDto[]>("/api/Users");
  },

  create: async (dto: CreateUserRequestDto): Promise<ApiResponse<UserResponseDto>> => {
    return await request<UserResponseDto>("/api/Users", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  update: async (id: string, dto: UpdateUserRequestDto): Promise<ApiResponse<UserResponseDto>> => {
    return await request<UserResponseDto>(`/api/Users/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    return await request<object>(`/api/Users/${id}`, { method: "DELETE" });
  },

  enrollStudent: async (dto: EnrollStudentRequestDto): Promise<ApiResponse<object>> => {
    return await request<object>("/api/Users/enroll", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};

// ==================== CLASSES API ====================
export const apiClasses = {
  getAll: async (): Promise<ApiResponse<ClassResponseDto[]>> => {
    return await request<ClassResponseDto[]>("/api/Classes");
  },

  create: async (dto: CreateClassRequestDto): Promise<ApiResponse<ClassResponseDto>> => {
    return await request<ClassResponseDto>("/api/Classes", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  update: async (id: string, dto: UpdateClassRequestDto): Promise<ApiResponse<ClassResponseDto>> => {
    return await request<ClassResponseDto>(`/api/Classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    return await request<object>(`/api/Classes/${id}`, { method: "DELETE" });
  },
};

// ==================== SUBJECTS API ====================
export const apiSubjects = {
  getAll: async (): Promise<ApiResponse<SubjectResponseDto[]>> => {
    return await request<SubjectResponseDto[]>("/api/Subjects");
  },

  create: async (dto: CreateSubjectRequestDto): Promise<ApiResponse<SubjectResponseDto>> => {
    return await request<SubjectResponseDto>("/api/Subjects", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  update: async (id: string, dto: UpdateSubjectRequestDto): Promise<ApiResponse<SubjectResponseDto>> => {
    return await request<SubjectResponseDto>(`/api/Subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    return await request<object>(`/api/Subjects/${id}`, { method: "DELETE" });
  },
};

// ==================== TEACHER CLASS SUBJECTS API ====================
export const apiTeacherClassSubjects = {
  getAll: async (): Promise<ApiResponse<TeacherClassSubjectResponseDto[]>> => {
    return await request<TeacherClassSubjectResponseDto[]>("/api/teacher-class-subjects");
  },

  assignTeacher: async (dto: AssignTeacherRequestDto): Promise<ApiResponse<TeacherClassSubjectResponseDto>> => {
    return await request<TeacherClassSubjectResponseDto>("/api/teacher-class-subjects", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    return await request<object>(`/api/teacher-class-subjects/${id}`, { method: "DELETE" });
  },
};

// ==================== ASSIGNMENTS API ====================
export const apiAssignments = {
  getAll: async (): Promise<ApiResponse<AssignmentResponseDto[]>> => {
    return await request<AssignmentResponseDto[]>("/api/Assignments");
  },

  getById: async (id: string): Promise<ApiResponse<AssignmentResponseDto>> => {
    return await request<AssignmentResponseDto>(`/api/Assignments/${id}`);
  },

  create: async (dto: CreateAssignmentRequestDto): Promise<ApiResponse<AssignmentResponseDto>> => {
    return await request<AssignmentResponseDto>("/api/Assignments", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  update: async (id: string, dto: UpdateAssignmentRequestDto): Promise<ApiResponse<AssignmentResponseDto>> => {
    return await request<AssignmentResponseDto>(`/api/Assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    return await request<object>(`/api/Assignments/${id}`, { method: "DELETE" });
  },

  publish: async (id: string): Promise<ApiResponse<AssignmentResponseDto>> => {
    return await request<AssignmentResponseDto>(`/api/Assignments/${id}/publish`, {
      method: "PATCH",
    });
  },
};

// ==================== SUBMISSIONS API ====================
export const apiSubmissions = {
  getAll: async (assignmentId?: string): Promise<ApiResponse<SubmissionResponseDto[]>> => {
    const url = assignmentId ? `/api/Submissions?assignmentId=${assignmentId}` : "/api/Submissions";
    return await request<SubmissionResponseDto[]>(url);
  },

  submit: async (dto: CreateSubmissionRequestDto): Promise<ApiResponse<SubmissionResponseDto>> => {
    return await request<SubmissionResponseDto>("/api/Submissions", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  update: async (id: string, dto: UpdateSubmissionRequestDto): Promise<ApiResponse<SubmissionResponseDto>> => {
    return await request<SubmissionResponseDto>(`/api/Submissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  grade: async (id: string, dto: GradeSubmissionRequestDto): Promise<ApiResponse<SubmissionResponseDto>> => {
    return await request<SubmissionResponseDto>(`/api/Submissions/${id}/grade`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },

  updateStatus: async (id: string, dto: UpdateSubmissionStatusRequestDto): Promise<ApiResponse<SubmissionResponseDto>> => {
    return await request<SubmissionResponseDto>(`/api/Submissions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },
};

// ==================== SETTINGS API ====================
export const apiSettings = {
  getAll: async (): Promise<ApiResponse<SettingResponseDto[]>> => {
    return await request<SettingResponseDto[]>("/api/Settings");
  },

  upsert: async (dto: UpsertSettingRequestDto): Promise<ApiResponse<SettingResponseDto>> => {
    return await request<SettingResponseDto>("/api/Settings", {
      method: "PUT",
      body: JSON.stringify(dto),
    });
  },

  delete: async (id: string): Promise<ApiResponse<object>> => {
    return await request<object>(`/api/Settings/${id}`, { method: "DELETE" });
  },
};
