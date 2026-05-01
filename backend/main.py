from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
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

# Global retriever
retriever = None

@app.get("/")
def root():
    return {"message": "DocuChat backend is running!"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global retriever

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        loader = PyPDFLoader(tmp_path)
        pages = loader.load()
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = splitter.split_documents(pages)
        embeddings = OpenAIEmbeddings()
        vectorstore = Chroma.from_documents(chunks, embeddings)
        retriever = vectorstore.as_retriever()
        os.unlink(tmp_path)
        return {"message": f"'{file.filename}' uploaded and ready to chat!"}
    except Exception as e:
        os.unlink(tmp_path)
        return {"error": f"Failed to process PDF: {str(e)}"}


@app.post("/ask")
async def ask_question(payload: dict):
    if not retriever:
        return {"answer": "Please upload a PDF first!"}

    # Build the prompt
    prompt = ChatPromptTemplate.from_template("""
    Answer the question based only on the context below.
    If you don't know the answer, say "I couldn't find that in the document."

    Context: {context}
    Question: {question}
    """)

    # Build the chain
    llm = ChatOpenAI(model="gpt-3.5-turbo")
    chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    answer = chain.invoke(payload["question"])
    return {"answer": answer}