import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

const isNative = Capacitor.isNativePlatform();

export const signInWithGoogle = async () => {
  try {
    if (isNative) {
      // On native (Android/iOS), use Capacitor Firebase Authentication plugin
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      const result = await FirebaseAuthentication.signInWithGoogle();

      // Use the credential to sign in with Firebase JS SDK
      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    } else {
      // On web browser, popup works fine
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    if (isNative) {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      await FirebaseAuthentication.signOut();
    }
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
