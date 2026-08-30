// [청록] firebase.ts - Firebase App & Firestore & Google Auth 초기화

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Firebase 앱 초기화 (싱글톤)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth 및 Google 프로바이더
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Cloud Firestore 인스턴스 (커스텀 데이터베이스 ID 바인딩 지원)
const dbId = firebaseConfig.firestoreDatabaseId;
export const db = (dbId && dbId !== '(default)') 
  ? getFirestore(app, dbId) 
  : getFirestore(app);
