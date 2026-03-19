// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdD0rHp9nriI124Ub1gdbsaLgR26Fo57s",
  authDomain: "word-nerd-7bcf7.firebaseapp.com",
  projectId: "word-nerd-7bcf7",
  storageBucket: "word-nerd-7bcf7.firebasestorage.app",
  messagingSenderId: "484707208649",
  appId: "1:484707208649:web:4c96f5c167ec8ffffdec18",
  measurementId: "G-L0N55SDFXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);