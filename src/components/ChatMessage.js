function formatTimestamp(createdAt) {
  if (!createdAt) return "";
  const date = typeof createdAt.toDate === "function" ? createdAt.toDate() : createdAt;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function ChatMessage({ message = {}, currentUser }) {
  const isOwnMessage = message?.uid && currentUser?.uid === message.uid;
  const displayName = message?.displayName || message?.email || "Unknown user";
  const timestamp = formatTimestamp(message?.createdAt);
  const hasAvatar = Boolean(message?.photoURL);

  return (
    <article className={`chat-message ${isOwnMessage ? "chat-message--own" : "chat-message--other"}`}>
      {hasAvatar ? (
        <img className="chat-message__avatar" src={message.photoURL} alt={`${displayName}'s avatar`} />
      ) : (
        <div className="chat-message__avatar chat-message__avatar--placeholder" aria-hidden="true">
          {getInitials(displayName)}
        </div>
      )}
      <div className="chat-message__content">
        <header className="chat-message__meta">
          <span className="chat-message__author">{displayName}</span>
          {timestamp && <time className="chat-message__time">{timestamp}</time>}
        </header>
        <p className="chat-message__text">{message?.text}</p>
      </div>
    </article>
  );
}

export default ChatMessage;
