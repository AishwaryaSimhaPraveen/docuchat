import pytest
from fastapi.testclient import TestClient
from main import app
import io

# Create a test client that talks to our FastAPI app
client = TestClient(app)


# ── TEST 1: Check backend is running
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "DocuChat backend is running!"}


# ── TEST 2: Ask without uploading first
def test_ask_without_upload():
    response = client.post("/ask", json={"question": "What is this about?"})
    assert response.status_code == 200
    assert response.json()["answer"] == "Please upload a PDF first!"


# ── TEST 3: Upload without a file
def test_upload_no_file():
    response = client.post("/upload")
    assert response.status_code == 422  # FastAPI validation error


# ── TEST 4: Upload a fake PDF
def test_upload_fake_pdf():
    fake_pdf = io.BytesIO(b"fake pdf content")
    response = client.post(
        "/upload",
        files={"file": ("test.pdf", fake_pdf, "application/pdf")}
    )
    # Will fail processing but should not crash the server
    assert response.status_code in [200, 500]


# ── TEST 5: Ask with empty question
def test_ask_empty_question():
    response = client.post("/ask", json={"question": ""})
    assert response.status_code == 200
    assert "answer" in response.json()