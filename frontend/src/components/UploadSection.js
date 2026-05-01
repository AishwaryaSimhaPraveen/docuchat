import "../styles/UploadSection.css";

function UploadSection({ uploaded, status, onFileChange, onUpload, onReset }) {
  return (
    <div className="upload-box">
      <h3 className="section-title">
        {uploaded ? "✅ PDF Ready!" : "Step 1 — Upload your PDF"}
      </h3>

      {!uploaded ? (
        <div className="upload-row">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => onFileChange(e.target.files[0])}
            className="file-input"
          />
          <button onClick={onUpload} className="upload-btn">
            Upload
          </button>
        </div>
      ) : (
        <button onClick={onReset} className="reset-btn">
          Upload a different PDF
        </button>
      )}

      {status && (
        <p className={`status ${uploaded ? "status-success" : "status-info"}`}>
          {status}
        </p>
      )}
    </div>
  );
}

export default UploadSection;