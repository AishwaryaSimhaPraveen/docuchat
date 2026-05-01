import "../styles/UploadSection.css";

function UploadSection({ uploadedFiles, status, onFileChange, onUpload, onReset }) {
  return (
    <div className="upload-box">
      <h3 className="section-title">📂 Documents</h3>

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="files-list">
          {uploadedFiles.map((file, i) => (
            <div key={i} className="file-tag">
              📄 {file}
            </div>
          ))}
        </div>
      )}

      {/* Upload row */}
      <div className="upload-row">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => onFileChange(e.target.files[0])}
          className="file-input"
        />
        <button onClick={onUpload} className="upload-btn">
          Upload PDF
        </button>
      </div>

      {status && (
        <p className={`status ${uploadedFiles.length > 0 ? "status-success" : "status-info"}`}>
          {status}
        </p>
      )}

      {uploadedFiles.length > 0 && (
        <button onClick={onReset} className="reset-btn">
          🗑 Clear all documents
        </button>
      )}
    </div>
  );
}

export default UploadSection;