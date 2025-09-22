import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function SendMessage({ user }) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canSend = text.trim().length > 0 && !isSending;

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!canSend) return;

    try {
      setIsSending(true);
      await addDoc(collection(db, "messages"), {
        text: text.trim(),
        createdAt: serverTimestamp(),
        uid: user.uid,
        photoURL: user.photoURL,
        displayName: user.displayName || user.email,
      });
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
