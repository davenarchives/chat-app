import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCHgPguDkNgDpz5itGaFDONYBQIQJSNMBA",
    authDomain: "chat-app-80356.firebaseapp.com",
    projectId: "chat-app-80356",
    storageBucket: "chat-app-80356.firebasestorage.app",
    messagingSenderId: "644362171268",
    appId: "1:644362171268:web:b9bb39c759640c7a58a3d1",
    measurementId: "G-V8JS49142F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);

