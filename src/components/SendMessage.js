import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { censorText } from "../utils/profanity";

function SendMessage({ user }) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canSend = text.trim().length > 0 && !isSending;

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
      displayName: user.displayName || user.email,
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
        placeholder="Type a message..."
        aria-label="Message"
        disabled={isSending}
      />
      <button type="submit" className="send-message__button" disabled={!canSend}>
        {isSending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}

export default SendMessage;