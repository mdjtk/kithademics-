import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Course, Lesson } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  async createUserProfile(userId: string, email: string, displayName: string, membershipType: string = 'free') {
    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, path), {
        email,
        displayName,
        membershipType,
        createdAt: serverTimestamp(),
        streak: 0,
        studyTimeHours: 0,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserProfile(userId: string) {
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async updateCourseProgress(userId: string, courseId: string, completedLessonIds: string[]) {
    const path = `users/${userId}/progress/${courseId}`;
    try {
      await setDoc(doc(db, path), {
        completedLessonIds,
        lastAccessedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getCourseProgress(userId: string, courseId: string) {
    const path = `users/${userId}/progress/${courseId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async getAllProgress(userId: string) {
    const path = `users/${userId}/progress`;
    try {
      const q = collection(db, path);
      const querySnapshot = await getDocs(q);
      const progress: Record<string, string[]> = {};
      querySnapshot.forEach((doc) => {
        progress[doc.id] = doc.data().completedLessonIds;
      });
      return progress;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getCourses() {
    const path = 'courses';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      const courses: Course[] = [];
      querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() } as Course);
      });
      return courses.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async saveCourse(course: Course) {
    const path = `courses/${course.id}`;
    try {
      await setDoc(doc(db, path), {
        title: course.title,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
        price: course.price,
        isLocked: course.isLocked,
        lessons: course.lessons,
        order: course.order || 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCourse(courseId: string) {
    const path = `courses/${courseId}`;
    // Not strictly required for MVP but good for admin
  },

  async getSpotlight() {
    const path = 'spotlight/main';
    try {
      const docSnap = await getDoc(doc(db, path));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveSpotlight(data: any) {
    const path = 'spotlight/main';
    try {
      await setDoc(doc(db, path), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getAllUsers() {
    const path = 'users';
    try {
      const q = collection(db, path);
      const querySnapshot = await getDocs(q);
      const users: any[] = [];
      for (const docSnap of querySnapshot.docs) {
        const userData = docSnap.data();
        // Fetch enrollments for each user
        const enrollmentsSnapshot = await getDocs(collection(db, `${path}/${docSnap.id}/enrollments`));
        const enrollments = enrollmentsSnapshot.docs.map(e => ({ courseId: e.id, ...e.data() }));
        users.push({ id: docSnap.id, ...userData, enrollments });
      }
      return users;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateUserMembership(userId: string, membershipType: string) {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { membershipType });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateEnrollment(userId: string, courseId: string, data: any) {
    const path = `users/${userId}/enrollments/${courseId}`;
    try {
      await setDoc(doc(db, path), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteEnrollment(userId: string, courseId: string) {
    const path = `users/${userId}/enrollments/${courseId}`;
    try {
      // For simplicity in rules and logic, we use a delete pattern if needed
      // But usually just setting status to 'expired' or similar is safer
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
