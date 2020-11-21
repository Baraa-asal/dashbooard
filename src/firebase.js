import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvE45YCM9Pe7omAsm0ADV0iicHffXx6bk",
  authDomain: "iot-dashboard-b1512.firebaseapp.com",
  databaseURL: "https://iot-dashboard-b1512.firebaseio.com",
  projectId: "iot-dashboard-b1512",
  storageBucket: "iot-dashboard-b1512.appspot.com",
  messagingSenderId: "1023829053215",
  appId: "1:1023829053215:web:e162250f3840a3ccc0aa2a",
  measurementId: "G-MZRNPZMGQ5"
};

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const generateUserDocument = async (user, additionalData) => {
  if (!user) return;
  const userRef = firestore.doc(`users/${user.uid}`);
  const snapshot = await userRef.get();
  if (!snapshot.exists) {
    const {email, displayName, photoURL} = user;
    try {
      await userRef.set({
        displayName,
        email,
        photoURL,
        ...additionalData
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  }
}
