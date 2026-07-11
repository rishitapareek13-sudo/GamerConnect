import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import socket from '../api/socket';

export default function TeamChat({ teamId }) {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    // Load chat history first
    api.get(`/messages/${teamId}`).then((res) => setMessages(res.data));

    // Connect and join this team's room
    socket.connect();
    socket.emit('join-team', teamId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.disconnect();
    };
  }, [teamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit('send-message', { teamId, senderId: user._id || user.id, text });
    setText('');
  };
  const [showRating, setShowRating] = useState(false);
 
  return (
    <div className="bg-shell-panel clip-hud p-4 flex flex-col h-96">
      <p className="text-text-onDark text-sm font-medium mb-3">Team chat</p>
      <button
  onClick={() => setShowRating(!showRating)}
  className="text-accent text-xs font-mono mb-3 self-start"
>
  {showRating ? 'Close ratings' : 'Rate a teammate'}
</button>

{showRating && <RatingForm onDone={() => setShowRating(false)} />}

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1">
        {messages.map((m) => {
          const isMe = m.sender._id === (user._id || user.id);
          return (
            <div
              key={m._id}
              className={`max-w-[75%] px-3 py-2 text-xs ${
                isMe ? 'bg-accent text-white self-end' : 'bg-shell text-text-onDark self-start'
              }`}
            >
              {!isMe && (
                <div className="text-[10px] font-mono opacity-70 mb-0.5">{m.sender.username}</div>
              )}
              {m.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-shell text-text-onDark px-3 py-2 text-xs outline-none clip-hud"
        />
        <button type="submit" className="clip-hud bg-accent text-white text-xs font-medium px-4 py-2">
          Send
        </button>
      </form>
    </div>
  );
}