import "../styles/ChatSection.css";

function ChatSection({ messages, question, loading, onQuestionChange, onAsk, onKeyDown }) {
  return (
    <div className="chat-box">
      <h3 className="section-title">
        Step 2 — Ask anything about your document
      </h3>

      {/* Messages */}
      <div className="messages">
        {messages.length === 0 && (
          <p className="placeholder">Your conversation will appear here...</p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === "user" ? "message-user" : "message-ai"}`}
          >
            <span className="role-label">
              {msg.role === "user" ? "You" : "🤖 DocuChat"}
            </span>
            <p>{msg.text}</p>
          </div>
        ))}

        {loading && (
          <div className="message message-ai">
            <span className="role-label">🤖 DocuChat</span>
            <p className="thinking">Thinking...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-row">
        <textarea
          value={question}
          onChange={(e) => onQuestionChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question about your document... (Press Enter to send)"
          className="textarea"
          rows={2}
        />
        <button
          onClick={onAsk}
          disabled={loading}
          className={`send-btn ${loading ? "send-btn-disabled" : ""}`}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatSection;