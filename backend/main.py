from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv
import tempfile
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Global state
vectorstore = None
chat_history = []
uploaded_files = []


@app.get("/")
def root():
    return {"message": "DocuChat backend is running!"}


@app.get("/files")
def get_files():
    return {"files": uploaded_files}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global vectorstore, uploaded_files

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        loader = PyPDFLoader(tmp_path)
        pages = loader.load()

        # Add source filename to each chunk's metadata
        for page in pages:
            page.metadata["source"] = file.filename

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100
        )
        chunks = splitter.split_documents(pages)

        embeddings = OpenAIEmbeddings()

        # If vectorstore exists, add to it — otherwise create new
        if vectorstore is None:
            vectorstore = Chroma.from_documents(chunks, embeddings)
        else:
            vectorstore.add_documents(chunks)

        # Track uploaded files
        if file.filename not in uploaded_files:
            uploaded_files.append(file.filename)

        os.unlink(tmp_path)
        return {
            "message": f"'{file.filename}' uploaded successfully!",
            "total_files": len(uploaded_files),
            "files": uploaded_files
        }

    except Exception as e:
        os.unlink(tmp_path)
        return {"error": f"Failed to process PDF: {str(e)}"}


@app.post("/ask")
async def ask_question(payload: dict):
    global chat_history

    if vectorstore is None:
        return {"answer": "Please upload a PDF first!", "sources": []}

    question = payload.get("question", "").strip()
    if not question:
        return {"answer": "Please ask a question!", "sources": []}

    # Retrieve more chunks for better answers
    retriever = vectorstore.as_retriever(
        search_kwargs={"k": 6}
    )

    # Build context-aware prompt with chat history
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful document assistant. 
        Answer questions based on the provided document context.
        If the answer isn't in the context, say "I couldn't find that in the uploaded documents."
        Always be specific and detailed in your answers.
        If referencing information, mention which document it came from if known.
        
        Context from documents:
        {context}"""),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}")
    ])

    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2)

    # Get relevant documents
    docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in docs])

    # Extract unique sources
    sources = list(set([
        doc.metadata.get("source", "Unknown")
        for doc in docs
    ]))

    # Build and run chain
    chain = prompt | llm | StrOutputParser()

    answer = chain.invoke({
        "context": context,
        "chat_history": chat_history,
        "question": question
    })

    # Update chat history
    chat_history.append(HumanMessage(content=question))
    chat_history.append(AIMessage(content=answer))

    # Keep history manageable — last 10 exchanges
    if len(chat_history) > 20:
        chat_history = chat_history[-20:]

    return {
        "answer": answer,
        "sources": sources
    }


@app.post("/reset")
def reset():
    global vectorstore, chat_history, uploaded_files
    vectorstore = None
    chat_history = []
    uploaded_files = []
    return {"message": "Session reset successfully!"}