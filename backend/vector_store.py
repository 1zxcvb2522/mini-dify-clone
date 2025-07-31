# backend/vector_store.py
import os
import time
import chromadb
from chromadb.config import Settings
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.chat_models import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

# wait for chroma
for _ in range(30):
    try:
        client = chromadb.HttpClient(
            host="chroma",
            port=8000,
            tenant="default_tenant",
            database="default_database",
            settings=Settings(anonymized_telemetry=False),
        )
        break
    except Exception:
        time.sleep(1)
else:
    raise RuntimeError("Chroma did not start in 30 s")

embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    openai_api_base=os.getenv("OPENAI_BASE"),
)
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

def index_pdf(file_bytes: bytes, filename: str):
    from pypdf import PdfReader
    import io
    text = "\n".join(p.extract_text() for p in PdfReader(io.BytesIO(file_bytes)).pages)
    docs = splitter.create_documents([text], metadatas=[{"source": filename}])
    Chroma.from_documents(docs, embeddings, client=client, collection_name="docs")

def rag_chain(question: str, temperature=0.7):
    db = Chroma(client=client, collection_name="docs", embedding_function=embeddings)
    llm = ChatOpenAI(
        temperature=temperature,
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_api_base=os.getenv("OPENAI_BASE"),
    )
    from langchain.chains import RetrievalQA
    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=db.as_retriever(search_kwargs={"k": 4}),
    ).run(question)