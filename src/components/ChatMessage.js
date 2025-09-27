const FALLBACK_NAME = "Friend";

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
    dateLabel: dateValue.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    }),
    timeLabel: dateValue.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
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

function getUsernameColor(name) {
  const source = name || FALLBACK_NAME;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = source.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 62%)`;
}

function ChatMessage({ message = {}, currentUser, profileOverrides = {} }) {
  const isOwnMessage = message?.uid && currentUser?.uid === message.uid;
  const overrideUsername = profileOverrides?.username;
  const overridePhotoURL = profileOverrides?.photoURL;
  const authorLabel = overrideUsername || message?.username || FALLBACK_NAME;
  const timestamp = formatTimestamp(message?.createdAt);
  const displayPhotoURL = overridePhotoURL ?? message?.photoURL;
  const hasAvatar = Boolean(displayPhotoURL);
  const authorColor = getUsernameColor(authorLabel);
  const tooltip = timestamp
    ? `${authorLabel} - ${timestamp.dateLabel} ${timestamp.timeLabel}`
    : authorLabel;

  return (
    <article
      className={`chat-message ${isOwnMessage ? "chat-message--own" : "chat-message--other"}`}
      title={tooltip}
      aria-label={tooltip}
    >
      {hasAvatar ? (
        <img className="chat-message__avatar" src={displayPhotoURL} alt={`${authorLabel}'s avatar`} />
      ) : (
        <div className="chat-message__avatar chat-message__avatar--placeholder" aria-hidden="true">
          {getInitials(authorLabel)}
        </div>
      )}
      <div className="chat-message__body">
        <div className="chat-message__content">
          <header className="chat-message__meta">
            <span className="chat-message__author" style={{ color: authorColor }}>
              {authorLabel}
            </span>
            {timestamp && (
              <time className="chat-message__time" dateTime={timestamp.isoValue}>
                {timestamp.timeLabel}
              </time>
            )}
          </header>
          <p className="chat-message__text">{message?.text}</p>
        </div>
      </div>
    </article>
  );
}

export default ChatMessage;
