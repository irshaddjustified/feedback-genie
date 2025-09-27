'use client';

import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = decodeURIComponent(searchParams.get("redirect") || "/");
  const db = getFirestore();

  // If already authenticated, persist minimal session locally and redirect immediately
  // This prevents showing the login page to signed-in users coming back.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("sessionUser", JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }));
        // Use replace to avoid navigating back to the auth page
        router.replace(redirectPath);
      }
    });
    return () => unsub();
  }, [redirectPath, router]);

  const handleLogin = async () => {
    try {
      // Ensure session persists across tabs/reloads
      await setPersistence(auth, browserLocalPersistence);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const responderRef = doc(db, 'responders', user.uid);
      const docSnap = await getDoc(responderRef);

      if (!docSnap.exists()) {
        // User is new — save them
        await setDoc(responderRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
      } else {
        console.log('Returning user:', docSnap.data());
      }

      // Persist minimal session locally (in addition to Firebase's persistence)
      localStorage.setItem("sessionUser", JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      }));

      router.push(redirectPath);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl mb-4">Login</h2>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}
