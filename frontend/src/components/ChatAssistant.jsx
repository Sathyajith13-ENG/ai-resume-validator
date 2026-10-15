import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../api/client';
import './ChatAssistant.css';

const SUGGESTIONS = [
  'How can I improve my résumé for this role?',
  'Which missing skills should I prioritise?',
  'How should I format my experience section?',
  'What action verbs work best for my industry?',
];

export default function ChatAssistant({ sessionId }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'ve analysed your résumé. Ask me anything — I can suggest improvements, explain skill gaps, or help you tailor your experience.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(sessionId, msg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
      setMessages((prev) => prev.slice(0, -1)); // remove optimistic user message
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-assistant card">
      <div className="chat-header">
        <div className="chat-header-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h2 className="chat-title font-display">AI Career Coach</h2>
          <p className="chat-subtitle text-muted text-sm">Ask anything about your résumé</p>
        </div>
        <div className="chat-status-dot" aria-label="AI assistant online" title="Online" />
      </div>

      {/* Message list */}
      <div className="chat-messages" role="log" aria-label="Chat messages" aria-live="polite">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message chat-message--${msg.role} animate-fade-in`}
          >
            {msg.role === 'assistant' && (
              <span className="chat-avatar" aria-hidden="true">🤖</span>
            )}
            <div className="chat-bubble">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message chat-message--assistant">
            <span className="chat-avatar" aria-hidden="true">🤖</span>
            <div className="chat-bubble chat-bubble--typing" aria-label="AI is typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error animate-fade-in" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length === 1 && (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              className="chat-suggestion-btn"
              onClick={() => send(s)}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your résumé or this job..."
          rows={2}
          maxLength={2000}
          disabled={loading}
          aria-label="Chat message input"
        />
        <button
          className="btn btn-primary chat-send-btn"
          onClick={() => send()}
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          {loading ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
          <span>{loading ? 'Thinking...' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
}
