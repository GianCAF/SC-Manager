// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCP308eMgmVQ2oWNa4QOZDlkOL5ane2QKQ",
    authDomain: "sc-manager-32c2f.firebaseapp.com",
    projectId: "sc-manager-32c2f",
    storageBucket: "sc-manager-32c2f.firebasestorage.app",
    messagingSenderId: "574222217875",
    appId: "1:574222217875:web:464427c2fc4f98895d1366",
    measurementId: "G-0Z1MP1S1FS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);