// Firebase Configuration and Services (No Auth - Simple User System)
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBK3zhyToaDrFm2CEgWWiClQoKQeta9nM4",
  authDomain: "phonics-app-7d7af.firebaseapp.com",
  projectId: "phonics-app-7d7af",
  storageBucket: "phonics-app-7d7af.firebasestorage.app",
  messagingSenderId: "89134790621",
  appId: "1:89134790621:web:e6a03a555b748c7622a834"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Simple User Services (No Auth Required)
export const userService = {
  // Create a new user with email as unique identifier
  async createUser(email, displayName = '') {
    try {
      const userId = email; // Use email as user ID
      const userData = {
        email: email,
        displayName: displayName || email.split('@')[0],
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        totalAttempts: 0,
        totalScore: 0,
        averageScore: 0,
        phonemesCompleted: [],
        progressHistory: [], // Array to store last 30 attempts
        currentStreak: 0,
        bestScore: 0
      };

      await setDoc(doc(db, 'users', userId), userData);
      return { success: true, user: { uid: userId, ...userData } };
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Get user by email
  async getUser(email) {
    try {
      const userId = email;
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return null;
      }
      return { uid: userId, ...userDoc.data() };
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Update user last login
  async updateLastLogin(email) {
    try {
      const userId = email;
      await updateDoc(doc(db, 'users', userId), {
        lastLogin: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update last login error:', error);
      throw error;
    }
  },

  // Check if user exists, if not create new user
  async ensureUser(email, displayName = '') {
    try {
      let user = await this.getUser(email);
      if (!user) {
        const result = await this.createUser(email, displayName);
        user = result.user;
      } else {
        await this.updateLastLogin(email);
      }
      return user;
    } catch (error) {
      console.error('Ensure user error:', error);
      throw error;
    }
  }
};

// Progress Services with 30-try limit
export const progressService = {
  async saveAttempt(email, phoneme, audioScore, videoScore, audioMostLikely = null, videoMostLikely = null) {
    try {
      const userId = email;
      const attemptData = {
        userId,
        phoneme,
        audioScore,
        videoScore,
        audioMostLikely,
        videoMostLikely,
        timestamp: serverTimestamp(),
        combinedScore: Math.round((audioScore + videoScore) / 2)
      };

      // Save attempt to attempts collection
      const attemptRef = await addDoc(collection(db, 'attempts'), attemptData);

      // Update user statistics and progress history
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const newTotalAttempts = userData.totalAttempts + 1;
        const newTotalScore = userData.totalScore + attemptData.combinedScore;
        const newAverageScore = Math.round(newTotalScore / newTotalAttempts);
        
        // Update phonemes completed if not already in list
        const phonemesCompleted = userData.phonemesCompleted || [];
        if (!phonemesCompleted.includes(phoneme)) {
          phonemesCompleted.push(phoneme);
        }

        // Update progress history (keep only last 30 attempts)
        const progressHistory = userData.progressHistory || [];
        progressHistory.push({
          attemptId: attemptRef.id,
          phoneme,
          audioScore,
          videoScore,
          combinedScore: attemptData.combinedScore,
          timestamp: serverTimestamp()
        });

        // Keep only last 30 attempts
        if (progressHistory.length > 30) {
          progressHistory.splice(0, progressHistory.length - 30);
        }

        // Calculate current streak and best score
        const currentStreak = this.calculateStreak(progressHistory);
        const bestScore = Math.max(userData.bestScore || 0, attemptData.combinedScore);

        await updateDoc(userRef, {
          totalAttempts: newTotalAttempts,
          totalScore: newTotalScore,
          averageScore: newAverageScore,
          phonemesCompleted,
          progressHistory,
          currentStreak,
          bestScore,
          lastAttempt: serverTimestamp()
        });
      }

      return { success: true, attemptId: attemptRef.id };
    } catch (error) {
      console.error('Save attempt error:', error);
      throw error;
    }
  },

  calculateStreak(progressHistory) {
    if (!progressHistory || progressHistory.length === 0) return 0;
    
    let streak = 0;
    for (let i = progressHistory.length - 1; i >= 0; i--) {
      if (progressHistory[i].combinedScore >= 70) { // Good score threshold
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  async getUserProgress(email) {
    try {
      const userId = email;
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      return userDoc.data();
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  },

  async getUserAttempts(email, limit = 30) {
    try {
      const userId = email;
      const attemptsQuery = query(
        collection(db, 'attempts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(attemptsQuery);
      const attempts = [];
      querySnapshot.forEach((doc) => {
        attempts.push({ id: doc.id, ...doc.data() });
      });

      return attempts.slice(0, limit);
    } catch (error) {
      console.error('Get user attempts error:', error);
      throw error;
    }
  },

  async getPhonemeProgress(email, phoneme) {
    try {
      const userId = email;
      const attemptsQuery = query(
        collection(db, 'attempts'),
        where('userId', '==', userId),
        where('phoneme', '==', phoneme),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(attemptsQuery);
      const attempts = [];
      querySnapshot.forEach((doc) => {
        attempts.push({ id: doc.id, ...doc.data() });
      });

      return attempts;
    } catch (error) {
      console.error('Get phoneme progress error:', error);
      throw error;
    }
  },

  async updateUserProfile(email, updates) {
    try {
      const userId = email;
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

// Error helper
export const getErrorMessage = (error) => {
  if (error.message) {
    return error.message;
  }
  return 'An error occurred. Please try again.';
};

export { db };
export default { userService, progressService };
