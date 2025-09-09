// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBiNJ0bQvgvfjAC_Zpc7OWv8vfbNsKyR5w",
  authDomain: "ecommerce-chat-web-a1815.firebaseapp.com",
  projectId: "ecommerce-chat-web-a1815",
  storageBucket: "ecommerce-chat-web-a1815.firebasestorage.app",
  messagingSenderId: "338783026013",
  appId: "1:338783026013:web:cc82fedc06c8f4bc6ac6b4",
  measurementId: "G-DWEG7KJ6Y8"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
const analytics = getAnalytics(firebaseApp);
