import { useState } from "react";
import { IoSend } from "react-icons/io5";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { censorText } from "../utils/profanity";

function SendMessage({ user, userProfile }) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const username = userProfile?.username;
  const canSend = text.trim().length > 0 && !isSending && Boolean(username);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!canSend) return;

    const originalText = text.trim();
    const cleanedText = censorText(originalText);
    if (!cleanedText) {
      setText("");
      return;
    }

    const createdAt = serverTimestamp();
    const messagePayload = {
      text: cleanedText,
      createdAt,
      uid: user.uid,
      photoURL: user.photoURL,
      username,
    };

    if (cleanedText !== originalText) {
      messagePayload.flagged = true;
      messagePayload.cleanedAt = createdAt;
    }

    try {
      setIsSending(true);
      await addDoc(collection(db, "messages"), messagePayload);
      setText("");
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className="send-message" onSubmit={sendMessage}>
      <input
        className="send-message__input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={username ? "Type a message..." : "Add a username to start chatting"}
        aria-label="Message"
        disabled={isSending || !username}
      />
      <button
        type="submit"
        className="send-message__button"
        disabled={!canSend}
        aria-label={isSending ? "Sending message" : "Send message"}
        title={isSending ? "Sending message" : "Send message"}
      >
        {isSending ? (
          <span className="send-message__spinner" aria-hidden="true" />
        ) : (
          <IoSend className="send-message__icon" aria-hidden="true" />
        )}
      </button>
    </form>
  );
}

export default SendMessage;
