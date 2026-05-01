import { useState } from "react";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import ChatSection from "./components/ChatSection";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) return;
    setStatus("Uploading and processing your PDF...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setStatus(`Error: ${data.error}`);
        return;
      }

      setStatus(data.message);
      setUploadedFiles(data.files || []);
    } catch (err) {
      setStatus("Upload failed. Make sure your backend is running!");
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { role: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      const aiMessage = {
        role: "ai",
        text: data.answer,
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const handleReset = async () => {
    try {
      await fetch("http://127.0.0.1:8000/reset", { method: "POST" });
    } catch (err) {
      console.error("Reset failed", err);
    }
    setUploadedFiles([]);
    setMessages([]);
    setStatus("");
    setFile(null);
  };

  return (
    <div className="app-container">
      <Header />
      <UploadSection
        uploadedFiles={uploadedFiles}
        status={status}
        onFileChange={setFile}
        onUpload={uploadFile}
        onReset={handleReset}
      />
      {uploadedFiles.length > 0 && (
        <ChatSection
          messages={messages}
          question={question}
          loading={loading}
          onQuestionChange={setQuestion}
          onAsk={askQuestion}
          onKeyDown={handleKeyDown}
        />
      )}
    </div>
  );
}

export default App;