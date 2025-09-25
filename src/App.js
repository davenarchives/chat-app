import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import SignIn from "./components/SignIn";
import ChatRoom from "./components/ChatRoom";
import CompleteProfile from "./components/CompleteProfile";

const CHATTROOM_LOGO = "/chattroom-logo.png";

function App() {
  const [user, setUser] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [authError, setAuthError] = useState("");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      currentUser => {
        setUser(currentUser);
        setAuthInitializing(false);
      },
      error => {
        console.error("Auth listener failed", error);
        setAuthError("We couldn't check your authentication status. Please refresh the page.");
        setAuthInitializing(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      setProfileLoading(false);
      setProfileFetchError("");
      setUsernameError("");
      setIsSavingUsername(false);
      return undefined;
    }

    setProfileLoading(true);
    setProfileFetchError("");

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      snapshot => {
        if (snapshot.exists()) {
          setProfile({ id: snapshot.id, ...snapshot.data() });
        } else {
          setProfile(null);
        }
        setProfileLoading(false);
      },
      error => {
        console.error("Profile listener failed", error);
        setProfile(null);
        setProfileLoading(false);
        setProfileFetchError("We couldn't load your profile details. Try refreshing.");
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  const suggestedUsername = useMemo(() => {
    if (!user?.displayName) return "";
    return user.displayName.trim().slice(0, 30);
  }, [user?.displayName]);

  const handleResetUsernameError = () => {
    if (usernameError || profileFetchError) {
      setUsernameError("");
      setProfileFetchError("");
    }
  };

  const handleUsernameSubmit = async (rawUsername) => {
    if (!user?.uid) {
      return;
    }

    const trimmedUsername = rawUsername.trim();
    if (!trimmedUsername) {
      setUsernameError("Please choose a username.");
      return;
    }

    const canonicalUsername = trimmedUsername.replace(/\s+/g, " ");

    if (canonicalUsername.length < 3) {
      setUsernameError("Usernames must be at least 3 characters long.");
      return;
    }

    const validPattern = /^[a-zA-Z0-9._\- ]+$/;
    if (!validPattern.test(canonicalUsername)) {
      setUsernameError("Use letters, numbers, spaces, dots, hyphens, or underscores only.");
      return;
    }

    const normalized = canonicalUsername.toLowerCase();

    try {
      setIsSavingUsername(true);
      setUsernameError("");

      const usernameQuery = query(
        collection(db, "users"),
        where("usernameLower", "==", normalized),
        limit(1)
      );
      const existing = await getDocs(usernameQuery);
      if (!existing.empty && existing.docs[0].id !== user.uid) {
        setUsernameError("That username is already taken. Try another one.");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const payload = {
        username: canonicalUsername,
        usernameLower: normalized,
        displayName: user.displayName ?? null,
        photoURL: user.photoURL ?? null,
        updatedAt: serverTimestamp(),
      };

      if (!profile?.createdAt) {
        payload.createdAt = serverTimestamp();
      }

      await setDoc(userDocRef, payload, { merge: true });
    } catch (error) {
      console.error("Failed to save username", error);
      const fallbackMessage = error?.code === "permission-denied"
        ? "We couldn't save that username. Check your Firestore rules and try again."
        : "We couldn't save that username. Please try again.";
      setUsernameError(fallbackMessage);
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed", error);
      setAuthError("Sign out failed. Please try again.");
    }
  };

  if (authInitializing) {
    return (
      <div className="App">
        <div className="App__loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <div className="auth">
          <div className="auth__brand">
            <img
              src={CHATTROOM_LOGO}
              alt="ChattRoom logo"
              className="auth__logo"
            />
            <h1 className="auth__title">Welcome to ChattRoom</h1>
          </div>
          <p className="auth__subtitle">Sign in with Google to start chatting with your friends.</p>
          {authError && <p className="auth__error">{authError}</p>}
          <SignIn />
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="App">
        <div className="App__loading">Loading your profile...</div>
      </div>
    );
  }

  if (!profile?.username) {
    return (
      <div className="App">
        <CompleteProfile
          suggestedUsername={suggestedUsername}
          isSaving={isSavingUsername}
          errorMessage={usernameError || profileFetchError}
          onSubmit={handleUsernameSubmit}
          onInputChange={handleResetUsernameError}
          onSignOut={handleSignOut}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        padding: "clamp(16px, 4vw, 24px)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "min(960px, 100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {authError && (
          <p className="auth__error" style={{ marginBottom: "16px" }}>
            {authError}
          </p>
        )}
        <div style={{ flex: "1 1 auto", display: "flex", width: "100%", overflow: "hidden" }}>
          <ChatRoom
            user={user}
            userProfile={profile}
            onSignOut={handleSignOut}
            onSubmitUsername={handleUsernameSubmit}
            onResetUsernameError={handleResetUsernameError}
            isSavingUsername={isSavingUsername}
            usernameError={usernameError || profileFetchError}
            suggestedUsername={suggestedUsername}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
