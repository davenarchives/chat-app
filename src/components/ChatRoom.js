import { useEffect, useRef, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import ChatMessage from "./ChatMessage";
import SendMessage from "./SendMessage";

function ChatRoom({ user, onSignOut }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("createdAt"),
      limit(200)
    );

    const unsubscribe = onSnapshot(messagesQuery, snapshot => {
      const nextMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(nextMessages);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayName = user?.displayName || user?.email || "Friend";

  return (
    <div
      className="chat-room"
      style={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%", width: "100%" }}
    >
      <header className="chat-room__header" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="chat-room__title">Chat Room</h1>
          <p className="chat-room__subtitle">Chatting as {displayName}</p>
        </div>
        <button type="button" className="chat-room__signout" onClick={onSignOut}>
          Sign out
        </button>
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
        <SendMessage user={user} />
      </div>
    </div>
  );
}

export default ChatRoom;
