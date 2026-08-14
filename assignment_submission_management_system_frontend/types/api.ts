// Backend API Enums matching C# definitions
export enum AssignmentStatus {
  Draft = 0,
  Published = 1,
}

export enum SubmissionStatus {
  Submitted = 0,
  Graded = 1,
  Returned = 2,
  Late = 3,
}

export enum Role {
  Admin = "Admin",
  Teacher = "Teacher",
  Student = "Student",
}

// Wrapper format returned by ASP.NET Core backend: ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponseDto {
  token: string;
  expiresAt: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

// User DTOs
export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface CreateUserRequestDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserRequestDto {
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export interface EnrollStudentRequestDto {
  studentId: string;
  classId: string;
}

export interface EnrollmentResponseDto {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  isActive: boolean;
  createdAt: string;
}

// Class DTOs
export interface ClassResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateClassRequestDto {
  name: string;
  code: string;
  description?: string;
  academicYear: string;
}

export interface UpdateClassRequestDto {
  name: string;
  description?: string;
  academicYear: string;
  isActive: boolean;
}

// Subject DTOs
export interface SubjectResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSubjectRequestDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubjectRequestDto {
  name: string;
  description?: string;
  isActive: boolean;
}

// TeacherClassSubject DTOs
export interface TeacherClassSubjectResponseDto {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface AssignTeacherRequestDto {
  classId: string;
  subjectId: string;
  teacherId: string;
}

// Assignment DTOs
export interface AssignmentResponseDto {
  id: string;
  teacherClassSubjectId: string;
  className: string;
  subjectName: string;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  status: AssignmentStatus;
  allowResubmission: boolean;
  createdByTeacherName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAssignmentRequestDto {
  teacherClassSubjectId: string;
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  allowResubmission: boolean;
}

export interface UpdateAssignmentRequestDto {
  title: string;
  description: string;
  deadline: string;
  maxMarks: number;
  allowResubmission: boolean;
}

// Submission DTOs
export interface SubmissionResponseDto {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  answer: string;
  submittedAt: string;
  updatedAt?: string;
  status: SubmissionStatus;
  marks?: number;
  feedback?: string;
  gradedAt?: string;
  gradedByTeacherName?: string;
}

export interface CreateSubmissionRequestDto {
  assignmentId: string;
  answer: string;
}

export interface UpdateSubmissionRequestDto {
  answer: string;
}

export interface GradeSubmissionRequestDto {
  marks: number;
  feedback?: string;
}

export interface UpdateSubmissionStatusRequestDto {
  status: SubmissionStatus;
  feedback?: string;
}

// Setting DTOs
export interface SettingResponseDto {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpsertSettingRequestDto {
  key: string;
  value: string;
  description?: string;
}
