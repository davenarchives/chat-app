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
    <button
      type="button"
      className="auth__button"
      onClick={signInWithGoogle}
      title="Continue with Google"
    >
      <span className="auth__button-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
          <path fill="#4285F4" d="M22.68 12.187c0-.828-.074-1.623-.212-2.387H12v4.52h6.034c-.26 1.408-1.04 2.602-2.214 3.402v2.833h3.58c2.095-1.93 3.28-4.777 3.28-8.368Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.985 7.28-2.666l-3.58-2.833c-1.003.672-2.286 1.07-3.7 1.07-2.843 0-5.253-1.92-6.112-4.5H2.212v2.887C4.02 20.98 7.69 23 12 23Z" />
          <path fill="#FBBC05" d="M5.888 14.07A7.01 7.01 0 0 1 5.523 12c0-.717.122-1.413.365-2.07V7.043H2.212A10.951 10.951 0 0 0 1 12c0 1.818.434 3.536 1.212 4.957l2.676-2.887Z" />
          <path fill="#EA4335" d="M12 4.75c1.613 0 3.06.555 4.205 1.645l3.153-3.153C17.46 1.34 14.97.25 12 .25 7.69.25 4.02 2.27 2.212 5.113l3.676 2.887C6.747 6.42 9.157 4.75 12 4.75Z" />
        </svg>
      </span>
      <span className="auth__button-label">Continue with Google</span>
    </button>
  );
}

export default SignIn;
