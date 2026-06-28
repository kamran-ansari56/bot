import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _auth = null;
let _db = null;
let _provider = null;

function ensure() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (!_auth) _auth = getAuth(app);
  if (!_db) _db = getFirestore(app);
  if (!_provider) _provider = new GoogleAuthProvider();
}

export function getAuthClient() { ensure(); return _auth; }
export function getDbClient() { ensure(); return _db; }
export function getProvider() { ensure(); return _provider; }
