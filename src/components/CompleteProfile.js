import { useEffect, useState } from "react";

const CHATTROOM_LOGO = "/chattroom-logo.png";

function CompleteProfile({
  suggestedUsername = "",
  isSaving = false,
  errorMessage = "",
  onSubmit,
  onInputChange,
  onSignOut,
}) {
  const [username, setUsername] = useState(suggestedUsername.trim());
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setUsername(suggestedUsername.trim());
  }, [suggestedUsername]);

  useEffect(() => {
    if (errorMessage) {
      setLocalError("");
    }
  }, [errorMessage]);

  const handleChange = (event) => {
    const value = event.target.value;
    setUsername(value);
    if (localError) {
      setLocalError("");
    }
    if (typeof onInputChange === "function") {
      onInputChange();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setLocalError("Please choose a username.");
      return;
    }

    const canonical = trimmed.replace(/\s+/g, " ");

    if (canonical.length < 3) {
      setLocalError("Usernames must be at least 3 characters long.");
      return;
    }

    const validPattern = /^[a-zA-Z0-9._\- ]+$/;
    if (!validPattern.test(canonical)) {
      setLocalError("Use letters, numbers, spaces, dots, hyphens, or underscores only.");
      return;
    }

    if (typeof onSubmit === "function") {
      onSubmit(canonical);
    }
  };

  const helperText = errorMessage || localError;

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <img src={CHATTROOM_LOGO} alt="ChattRoom logo" className="profile-card__logo" />
        <span className="profile-card__brand">ChattRoom</span>
        <h2 className="profile-card__title">Fill in missing fields</h2>
        <p className="profile-card__subtitle">Please fill in the remaining details to continue.</p>
      </div>

      <form className="profile-card__form" onSubmit={handleSubmit}>
        <label className="profile-card__label" htmlFor="username-input">
          Username
        </label>
        <input
          id="username-input"
          name="username"
          type="text"
          className="profile-card__input"
          value={username}
          onChange={handleChange}
          placeholder="Choose a username"
          autoComplete="nickname"
          disabled={isSaving}
        />

        {helperText && <p className="profile-card__error">{helperText}</p>}

        <div className="profile-card__actions">
          <button type="submit" className="profile-card__button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Continue"}
          </button>
          {typeof onSignOut === "function" && (
            <button type="button" className="profile-card__signout" onClick={onSignOut}>
              Sign out
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CompleteProfile;



