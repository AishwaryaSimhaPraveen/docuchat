# 📄 DocuChat — AI Document Q&A App

Upload any PDF and have a conversation with it using AI.

## Tech Stack
- **Frontend:** React, Jest, React Testing Library
- **Backend:** FastAPI (Python), Pytest
- **AI:** LangChain, OpenAI GPT-3.5-turbo, ChromaDB (RAG)
- **DevOps:** Docker, Docker Compose

## How It Works
1. Upload a PDF
2. App splits it into chunks and stores as vectors (ChromaDB)
3. Ask questions — AI answers from your document only
4. Uses RAG (Retrieval Augmented Generation) pattern

## Run Locally

### With Docker (recommended)
```bash
docker compose up --build
```
Visit http://localhost:3000

### Without Docker
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm start
```

## Environment Variables
Create `backend/.env`:

OPENAI_API_KEY=your_openai_key_here

## Testing
```bash
# Backend tests
cd backend && pytest test_main.py -v

# Frontend tests
cd frontend && npm test
```

## Project Structure
docuchat/
├── backend/
│   ├── main.py          # FastAPI app + RAG pipeline
│   ├── test_main.py     # Pytest tests
│   └── requirements.txt
└── frontend/
├── src/
│   ├── components/  # Header, UploadSection, ChatSection
│   ├── styles/      # CSS per component
│   └── App.js       # Root component
└── src/App.test.js  # Jest tests
