import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  FamilyProfile,
  RoutineActivity,
  CommunicationCard,
  ObservationEntry,
} from '../types';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with experimentalForceLongPolling for robust proxy/iframe connectivity
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Structured Error Handling according to firebase-skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore notice:', JSON.stringify(errInfo));
  const isPermissionDenied =
    (error as any)?.code === 'permission-denied' ||
    (error instanceof Error && error.message.includes('permission'));
  if (isPermissionDenied) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// Test connection asynchronously according to firebase-skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.info('Firebase Firestore connection test verified.');
  } catch (error: any) {
    if (
      error?.code === 'unavailable' ||
      (error instanceof Error &&
        (error.message.includes('the client is offline') ||
          error.message.includes('unavailable') ||
          error.message.includes('Could not reach Cloud Firestore backend')))
    ) {
      console.warn('Firebase client operates in offline mode when internet is unstable. Local state fallback is active.');
    } else {
      console.warn('Firebase Firestore connection note:', error?.message || error);
    }
  }
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    testConnection();
  }, 1200);
}

// Auth helper functions
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erro ao autenticar com Google:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Firestore persistence helpers
export async function saveProfileToFirestore(userId: string, profile: FamilyProfile, email?: string): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      {
        userId,
        parentName: profile.parentName || 'Cuidador',
        childName: profile.childName || 'Criança',
        childAge: profile.childAge || '',
        focusArea: profile.focusArea || '',
        onboardingCompleted: profile.onboardingCompleted ?? true,
        highContrast: profile.highContrast ?? false,
        reducedMotion: profile.reducedMotion ?? false,
        fontSize: profile.fontSize || 'normal',
        soundEnabled: profile.soundEnabled ?? true,
        versesEnabled: profile.versesEnabled ?? true,
        verseFrequency: profile.verseFrequency || 'normal',
        email: email || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadProfileFromFirestore(userId: string): Promise<Partial<FamilyProfile> | null> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as Partial<FamilyProfile>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveActivityToFirestore(userId: string, activity: RoutineActivity): Promise<void> {
  const path = `users/${userId}/activities/${activity.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'activities', activity.id);
    await setDoc(docRef, {
      ...activity,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteActivityFromFirestore(userId: string, activityId: string): Promise<void> {
  const path = `users/${userId}/activities/${activityId}`;
  try {
    const docRef = doc(db, 'users', userId, 'activities', activityId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadActivitiesFromFirestore(userId: string): Promise<RoutineActivity[]> {
  const path = `users/${userId}/activities`;
  try {
    const colRef = collection(db, 'users', userId, 'activities');
    const snap = await getDocs(colRef);
    const list: RoutineActivity[] = [];
    snap.forEach((d) => {
      list.push(d.data() as RoutineActivity);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveCardToFirestore(userId: string, card: CommunicationCard): Promise<void> {
  const path = `users/${userId}/cards/${card.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'cards', card.id);
    await setDoc(docRef, {
      ...card,
      userId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCardFromFirestore(userId: string, cardId: string): Promise<void> {
  const path = `users/${userId}/cards/${cardId}`;
  try {
    const docRef = doc(db, 'users', userId, 'cards', cardId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadCardsFromFirestore(userId: string): Promise<CommunicationCard[]> {
  const path = `users/${userId}/cards`;
  try {
    const colRef = collection(db, 'users', userId, 'cards');
    const snap = await getDocs(colRef);
    const list: CommunicationCard[] = [];
    snap.forEach((d) => {
      list.push(d.data() as CommunicationCard);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveObservationToFirestore(userId: string, entry: ObservationEntry): Promise<void> {
  const path = `users/${userId}/observations/${entry.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'observations', entry.id);
    await setDoc(docRef, {
      ...entry,
      userId,
      createdAt: entry.date ? `${entry.date}T${entry.time || '12:00'}:00.000Z` : new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteObservationFromFirestore(userId: string, observationId: string): Promise<void> {
  const path = `users/${userId}/observations/${observationId}`;
  try {
    const docRef = doc(db, 'users', userId, 'observations', observationId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadObservationsFromFirestore(userId: string): Promise<ObservationEntry[]> {
  const path = `users/${userId}/observations`;
  try {
    const colRef = collection(db, 'users', userId, 'observations');
    const snap = await getDocs(colRef);
    const list: ObservationEntry[] = [];
    snap.forEach((d) => {
      list.push(d.data() as ObservationEntry);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
