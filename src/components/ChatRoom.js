import { useEffect, useMemo, useRef, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { FiLogOut, FiSettings, FiUser, FiX } from "react-icons/fi";
import { db } from "../firebase";
import ChatMessage from "./ChatMessage";
import SendMessage from "./SendMessage";

const CHATTROOM_LOGO = "/chattroom-logo.png";
const MESSAGE_LIMIT = 25;

const getTimestampValue = (value) => {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  if (value instanceof Date) return value.getTime();
  return 0;
};

function ChatRoom({
  user,
  userProfile,
  onSignOut,
  onSubmitUsername = () => {},
  onResetUsernameError = () => {},
  isSavingUsername = false,
  usernameError = "",
  suggestedUsername = "",
}) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const profileButtonRef = useRef(null);
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState(userProfile?.username ?? suggestedUsername ?? "");
  const pendingUsernameRef = useRef("");

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(MESSAGE_LIMIT)
    );

    const unsubscribe = onSnapshot(messagesQuery, snapshot => {
      const nextMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => getTimestampValue(a.createdAt) - getTimestampValue(b.createdAt));
      setMessages(nextMessages);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setUsernameDraft(userProfile?.username ?? suggestedUsername ?? "");
  }, [userProfile?.username, suggestedUsername]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      const target = event.target;
      if (!menuRef.current || !profileButtonRef.current) return;
      if (!menuRef.current.contains(target) && !profileButtonRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isEditingUsername || isSavingUsername || usernameError) {
      return;
    }

    const pending = pendingUsernameRef.current;
    if (!pending) return;

    const latestUsername = (userProfile?.username ?? "").trim();
    if (latestUsername && latestUsername === pending) {
      setIsEditingUsername(false);
      pendingUsernameRef.current = "";
    }
  }, [isEditingUsername, isSavingUsername, usernameError, userProfile?.username]);

  const displayName = useMemo(() => {
    return userProfile?.username || user?.displayName || user?.email || "Friend";
  }, [userProfile?.username, user?.displayName, user?.email]);

  const accountName = useMemo(() => {
    return user?.displayName || userProfile?.username || "Your account";
  }, [user?.displayName, userProfile?.username]);

  const accountEmail = user?.email ?? "";
  const photoURL = userProfile?.photoURL || user?.photoURL || "";
  const avatarFallback = (displayName || "U").trim().charAt(0).toUpperCase();

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const openAccountPanel = () => {
    setIsAccountPanelOpen(true);
    setIsMenuOpen(false);
  };

  const closeAccountPanel = () => {
    setIsAccountPanelOpen(false);
    cancelEditingUsername();
  };

  const startEditingUsername = () => {
    setIsEditingUsername(true);
    setUsernameDraft(userProfile?.username ?? suggestedUsername ?? "");
    onResetUsernameError();
  };

  const cancelEditingUsername = () => {
    setIsEditingUsername(false);
    setUsernameDraft(userProfile?.username ?? suggestedUsername ?? "");
    pendingUsernameRef.current = "";
    onResetUsernameError();
  };

  const handleUsernameSubmit = (event) => {
    event.preventDefault();
    const trimmed = usernameDraft.trim();
    if (!trimmed) return;

    pendingUsernameRef.current = trimmed;
    onSubmitUsername(trimmed);
  };

  return (
    <div
      className="chat-room"
      style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%", width: "100%" }}
    >
      <header className="chat-room__header" style={{ flexShrink: 0 }}>
        <div className="chat-room__brand">
          <img
            src={CHATTROOM_LOGO}
            alt="ChattRoom logo"
            className="chat-room__logo"
          />
          <div>
            <h1 className="chat-room__title">ChattRoom</h1>
            <p className="chat-room__subtitle">Chatting as {displayName}</p>
          </div>
        </div>

        <div className="chat-room__actions" ref={menuRef}>
          <button
            type="button"
            className="chat-room__profile-toggle"
            onClick={toggleMenu}
            ref={profileButtonRef}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-label="Account menu"
          >
            {photoURL ? (
              <img src={photoURL} alt="Profile avatar" className="chat-room__profile-avatar" />
            ) : (
              <span className="chat-room__profile-avatar chat-room__profile-avatar--fallback" aria-hidden="true">
                {avatarFallback}
              </span>
            )}
          </button>

          {isMenuOpen && (
            <div className="chat-room__menu" role="menu">
              <div className="chat-room__menu-profile" role="presentation">
                <FiUser aria-hidden="true" />
                <div className="chat-room__menu-text">
                  <span className="chat-room__menu-label">{accountName}</span>
                  <span className="chat-room__menu-muted">{userProfile?.username || displayName}</span>
                </div>
              </div>
              <button type="button" className="chat-room__menu-item" role="menuitem" onClick={openAccountPanel}>
                <FiSettings aria-hidden="true" />
                <span className="chat-room__menu-label">Manage account</span>
              </button>
              <button type="button" className="chat-room__menu-item chat-room__menu-item--danger" role="menuitem" onClick={onSignOut}>
                <FiLogOut aria-hidden="true" />
                <span className="chat-room__menu-label">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <section
        className="chat-room__messages"
        aria-live="polite"
        aria-label="Chat messages"
        style={{ flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}
      >
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} currentUser={user} />
        ))}
        <div ref={messagesEndRef} />
      </section>

      <div style={{ flexShrink: 0 }}>
        <SendMessage user={user} userProfile={userProfile} />
      </div>

      {isAccountPanelOpen && (
        <div className="account-drawer" role="dialog" aria-modal="true" aria-labelledby="account-drawer-title">
          <div className="account-drawer__panel">
            <header className="account-drawer__header">
              <div>
                <h2 id="account-drawer-title">Account</h2>
                <p className="account-drawer__subtitle">Profile details</p>
              </div>
              <button type="button" className="account-drawer__close" onClick={closeAccountPanel} aria-label="Close account panel">
                <FiX aria-hidden="true" />
              </button>
            </header>

            <div className="account-drawer__section">
              <div className="account-drawer__row account-drawer__profile-row">
                <div className="account-drawer__profile-summary">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile avatar" className="account-drawer__avatar" />
                  ) : (
                    <span className="account-drawer__avatar account-drawer__avatar--fallback">{avatarFallback}</span>
                  )}
                  <div>
                    <p className="account-drawer__profile-name">{accountName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="account-drawer__link"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open("https://myaccount.google.com", "_blank", "noopener");
                    }
                  }}
                >
                  Update profile
                </button>
              </div>
            </div>

            <div className="account-drawer__section">
              <div className="account-drawer__row">
                <div>
                  <span className="account-drawer__label">Username</span>
                  <span className="account-drawer__value">{userProfile?.username || "Add a username"}</span>
                </div>
                {!isEditingUsername && (
                  <button type="button" className="account-drawer__link" onClick={startEditingUsername}>
                    Update username
                  </button>
                )}
              </div>

              {isEditingUsername && (
                <form className="account-drawer__username-form" onSubmit={handleUsernameSubmit}>
                  <label className="account-drawer__label" htmlFor="account-username-input">
                    New username
                  </label>
                  <input
                    id="account-username-input"
                    className="account-drawer__input"
                    type="text"
                    value={usernameDraft}
                    onChange={(event) => {
                      setUsernameDraft(event.target.value);
                      onResetUsernameError();
                    }}
                    autoComplete="nickname"
                    disabled={isSavingUsername}
                  />
                  {(usernameError) && <p className="account-drawer__error">{usernameError}</p>}
                  <div className="account-drawer__actions">
                    <button type="button" className="account-drawer__secondary" onClick={cancelEditingUsername} disabled={isSavingUsername}>
                      Cancel
                    </button>
                    <button type="submit" className="account-drawer__primary" disabled={isSavingUsername}>
                      {isSavingUsername ? "Saving..." : "Save username"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatRoom;

