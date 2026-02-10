import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyB_VHHc0q7gtkthYDc7SitElFRgF7Asodo",
  authDomain: "leafcareapp.firebaseapp.com",
  projectId: "leafcareapp",
  storageBucket: "leafcareapp.firebasestorage.app",
  messagingSenderId: "1073803406065",
  appId: "1:1073803406065:web:193999e3e18b13645d9750",
  measurementId: "G-NZ9Z5D1WCD"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);