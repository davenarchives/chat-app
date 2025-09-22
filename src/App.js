import { useEffect, useState } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import SignIn from "./components/SignIn";
import ChatRoom from "./components/ChatRoom";

const CHATTROOM_LOGO = "/chattroom-logo.png";

function App() {
  const [user, setUser] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [authError, setAuthError] = useState("");

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
          <ChatRoom user={user} onSignOut={handleSignOut} />
        </div>
      </div>
    </div>
  );
}

export default App;
