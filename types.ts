
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  videoUrl: string;
  thumbnail?: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  description: string;
  thumbnail: string;
  category: string;
  progress: number;
  lessons: Lesson[];
  price: string;
  isLocked: boolean;
  order?: number;
}

export interface Enrollment {
  courseId: string;
  enrolledAt: any;
  expiresAt: any;
  status: 'active' | 'expired' | 'pending';
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  membershipType: 'free' | 'pro' | 'admin';
  createdAt: any;
  streak: number;
  studyTimeHours: number;
  recentlyWatchedCourseId?: string;
}

export interface UserProgress {
  totalCourses: number;
  completedLessons: number;
  studyTimeHours: number;
  streak: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
