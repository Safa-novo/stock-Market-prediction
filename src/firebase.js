// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqeBeMj3MFEmNUuvVKIqLXbcqF-yojKps",
  authDomain: "stock-market-predictor-d4067.firebaseapp.com",
  databaseURL: "https://stock-market-predictor-d4067-default-rtdb.firebaseio.com",
  projectId: "stock-market-predictor-d4067",
  storageBucket: "stock-market-predictor-d4067.firebasestorage.app",
  messagingSenderId: "711397941765",
  appId: "1:711397941765:web:5f3d8f355ccd18e9e9326c",
  measurementId: "G-7C1BGBFQRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);