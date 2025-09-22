import { useEffect, useState } from "react";
import "./App.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import SignIn from "./components/SignIn";
import ChatRoom from "./components/ChatRoom";

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

  return (
    <div className="App">
      {authInitializing ? (
        <div className="App__loading">Loading...</div>
      ) : !user ? (
        <div className="auth">
          <h1 className="auth__title">Welcome to the Chat App</h1>
          <p className="auth__subtitle">Sign in with Google to start chatting with your friends.</p>
          {authError && <p className="auth__error">{authError}</p>}
          <SignIn />
        </div>
      ) : (
        <>
          {authError && <p className="auth__error">{authError}</p>}
          <ChatRoom user={user} onSignOut={handleSignOut} />
        </>
      )}
    </div>
  );
}

export default App;
