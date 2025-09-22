import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

function SignIn() {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  return (
    <button type="button" className="auth__button" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}

export default SignIn;
