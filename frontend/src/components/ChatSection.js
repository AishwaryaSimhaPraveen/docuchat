import "../styles/ChatSection.css";

function ChatSection({ messages, question, loading, onQuestionChange, onAsk, onKeyDown }) {
  return (
    <div className="chat-box">
      <h3 className="section-title">💬 Chat with your documents</h3>

      {/* Messages */}
      <div className="messages">
        {messages.length === 0 && (
          <p className="placeholder">
            Ask anything about your uploaded documents...
          </p>
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

            {/* Show sources if available */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="sources">
                <span className="sources-label">📄 Sources: </span>
                {msg.sources.map((source, j) => (
                  <span key={j} className="source-tag">{source}</span>
                ))}
              </div>
            )}
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
          placeholder="Ask a question... (Press Enter to send)"
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