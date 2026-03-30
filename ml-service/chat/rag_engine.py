import os
import json
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader, DirectoryLoader

class RAGEngine:
    def __init__(self, persist_directory="./vector_db"):
        self.persist_directory = persist_directory
        self._embeddings = None
        self.vector_db = None
        
        # Ensure directory exists
        if not os.path.exists(persist_directory):
            os.makedirs(persist_directory)
            
        # Try to load existing DB metadata if it exists
        # Note: We don't load the full DB yet because it requires embeddings
        if os.path.exists(os.path.join(persist_directory, "chroma.sqlite3")):
            print("📦 RAG Engine: Vector DB found (will load on first query)")
        else:
            print("📦 RAG Engine: Vector DB Empty. Run index_knowledge_base() first.")

    @property
    def embeddings(self):
        if self._embeddings is None:
            print("📥 RAG Engine: Loading embedding model (all-MiniLM-L6-v2)...")
            self._embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
            print("✅ RAG Engine: Embedding model ready")
        return self._embeddings

    def _ensure_vector_db(self):
        if self.vector_db is None and os.path.exists(os.path.join(self.persist_directory, "chroma.sqlite3")):
             self.vector_db = Chroma(persist_directory=self.persist_directory, embedding_function=self.embeddings)
             print("📦 RAG Engine: Vector DB Loaded")

    def index_knowledge_base(self, knowledge_dir):
        """Processes all documents in the knowledge base and stores in Vector DB"""
        print(f"📂 Indexing knowledge base from: {knowledge_dir}")
        loader = DirectoryLoader(knowledge_dir, glob="**/*.md", loader_cls=TextLoader)
        documents = loader.load()
        
        text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        docs = text_splitter.split_documents(documents)
        
        self.vector_db = Chroma.from_documents(
            documents=docs, 
            embedding=self.embeddings,
            persist_directory=self.persist_directory
        )
        self.vector_db.persist()
        print(f"✅ Indexed {len(docs)} document chunks.")

    def query(self, user_query, k=3):
        """Retrieves top k relevant documents for a query"""
        self._ensure_vector_db()
        if not self.vector_db:
            return ""
        
        results = self.vector_db.similarity_search(user_query, k=k)
        context = "\n\n".join([doc.page_content for doc in results])
        return context

# Global instance
rag_engine = RAGEngine()

if __name__ == "__main__":
    # Test script
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    k_dir = os.path.join(base_dir, "knowledge_base")
    rag_engine.index_knowledge_base(k_dir)
