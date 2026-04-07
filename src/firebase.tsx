// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoO88lsES--IW1OnW-mHcvqY_eaJnGl0s",
  authDomain: "cis444-aim-rivals.firebaseapp.com",
  projectId: "cis444-aim-rivals",
  storageBucket: "cis444-aim-rivals.firebasestorage.app",
  messagingSenderId: "287907953240",
  appId: "1:287907953240:web:ad8f590a9342ec2ce8682d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;