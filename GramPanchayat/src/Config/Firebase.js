// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { collection, getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1Qfvc1W7xS2_Lu9au4zH821aBLmujDP8",
  authDomain: "e-grampanchayat-c6e43.firebaseapp.com",
  projectId: "e-grampanchayat-c6e43",
  storageBucket: "e-grampanchayat-c6e43.firebasestorage.app",
  messagingSenderId: "915270119511",
  appId: "1:915270119511:web:3b85304408dd028565b312",
  measurementId: "G-MBM57YJ14G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage= getStorage(app);
export const db=getFirestore(app);

export const usersRef = collection(db, 'users');
export const complaintsRef = collection(db, 'complaints');
export const noticesRef = collection(db, 'notices');
export const servicesRef = collection(db, 'services');