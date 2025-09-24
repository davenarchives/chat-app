function formatTimestamp(createdAt) {
  if (!createdAt) return null;

  let dateValue = createdAt;
  if (typeof createdAt.toDate === "function") {
    dateValue = createdAt.toDate();
  } else if (typeof createdAt.toMillis === "function") {
    dateValue = new Date(createdAt.toMillis());
  } else if (typeof createdAt.seconds === "number") {
    dateValue = new Date(createdAt.seconds * 1000);
  }

  if (!(dateValue instanceof Date) || Number.isNaN(dateValue.getTime())) {
    return null;
  }

  return {
    dateLabel: dateValue.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
    timeLabel: dateValue.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    isoValue: dateValue.toISOString(),
  };
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

function ChatMessage({ message = {}, currentUser }) {
  const isOwnMessage = message?.uid && currentUser?.uid === message.uid;
  const authorLabel = message?.username || "Friend";
  const timestamp = formatTimestamp(message?.createdAt);
  const hasAvatar = Boolean(message?.photoURL);

  return (
    <article className={`chat-message ${isOwnMessage ? "chat-message--own" : "chat-message--other"}`}>
      {hasAvatar ? (
        <img className="chat-message__avatar" src={message.photoURL} alt={`${authorLabel}'s avatar`} />
      ) : (
        <div className="chat-message__avatar chat-message__avatar--placeholder" aria-hidden="true">
          {getInitials(authorLabel)}
        </div>
      )}
      <div className="chat-message__content">
        <header className="chat-message__meta">
          <span className="chat-message__author">{authorLabel}</span>
          {timestamp && (
            <time className="chat-message__time" dateTime={timestamp.isoValue}>
              {timestamp.dateLabel} at {timestamp.timeLabel}
            </time>
          )}
        </header>
        <p className="chat-message__text">{message?.text}</p>
      </div>
    </article>
  );
}

export default ChatMessage;
