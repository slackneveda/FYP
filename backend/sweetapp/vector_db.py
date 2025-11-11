"""
Vector Database Management for Sweet Dessert Chat Assistant
Handles PDF processing, ChromaDB storage, and semantic search
"""

# cSpell:ignore hnsw embedder metadatas
import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import PyPDF2
from typing import List, Dict, Tuple
import re
import logging

logger = logging.getLogger(__name__)


class DessertVectorDB:
    """Manages vector database operations for dessert product search"""
    
    def __init__(self):
        """Initialize ChromaDB client and sentence transformer model"""
        # Set up persistent ChromaDB storage
        db_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
            "chroma_db"
        )
        
        try:
            # Suppress telemetry warnings
            import warnings
            warnings.filterwarnings('ignore', category=DeprecationWarning)
            
            self.client = chromadb.PersistentClient(
                path=db_path,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True,
                    is_persistent=True
                )
            )
            logger.info(f"ChromaDB initialized at: {db_path}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise
        
        # Initialize sentence transformer for embeddings
        try:
            self.embedder = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
            logger.info("Sentence transformer model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load sentence transformer: {e}")
            raise
        
        # Get or create desserts collection
        try:
            self.collection = self.client.get_collection("desserts")
            logger.info(f"Loaded existing desserts collection with {self.collection.count()} documents")
        except Exception:
            self.collection = self.client.create_collection(
                name="desserts",
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("Created new desserts collection")
    
    def extract_product_chunks(self, pdf_path: str) -> List[Dict[str, str]]:
        """
        Extract product descriptions from PDF file
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            List of dictionaries containing product chunks with metadata
        """
        chunks = []
        
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file not found: {pdf_path}")
            return chunks
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                full_text = ""
                
                # Extract all text from PDF
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        text = page.extract_text()
                        full_text += text + "\n"
                    except Exception as e:
                        logger.warning(f"Error extracting page {page_num}: {e}")
                
                # Clean the text
                full_text = full_text.replace('\x00', '')  # Remove null bytes
                
                # Split text into logical product sections
                # This pattern looks for product entries in the PDF
                sections = self._split_into_sections(full_text)
                
                for idx, section in enumerate(sections):
                    if not section.strip():
                        continue
                    
                    # Parse product information
                    product_info = self._parse_product_section(section)
                    
                    if product_info:
                        chunks.append({
                            'id': f'product_{idx}',
                            'text': product_info['full_text'],
                            'metadata': {
                                'product_name': product_info['name'],
                                'category': product_info.get('category', 'Unknown'),
                                'price': product_info.get('price', 'N/A'),
                                'type': 'product_description',
                                'source': 'pdf_training_data'
                            }
                        })
            
            logger.info(f"Extracted {len(chunks)} product chunks from PDF")
            return chunks
            
        except Exception as e:
            logger.error(f"Error extracting PDF: {e}")
            return []
    
    def _split_into_sections(self, text: str) -> List[str]:
        """Split text into product sections"""
        # Split by numbered items or product names
        # Looks for patterns like "1. Product Name" or standalone product names
        sections = []
        
        # Split by double newlines or numbered items
        raw_sections = re.split(r'\n\n+|\n(?=\d+\.)', text)
        
        for section in raw_sections:
            section = section.strip()
            if len(section) > 20:  # Filter out very short sections
                sections.append(section)
        
        return sections
    
    def _parse_product_section(self, section: str) -> Dict[str, str]:
        """Parse a product section to extract structured information"""
        lines = [line.strip() for line in section.split('\n') if line.strip()]
        
        if not lines:
            return None
        
        # First line is usually the product name
        first_line = lines[0]
        
        # Remove numbering if present
        product_name = re.sub(r'^\d+\.\s*', '', first_line)
        
        # Look for dessert keywords to validate this is a product
        dessert_keywords = [
            'cake', 'brownie', 'cookie', 'donut', 'cupcake', 
            'cheesecake', 'sundae', 'ice cream', 'tart', 'pie',
            'chocolate', 'vanilla', 'strawberry', 'caramel'
        ]
        
        section_lower = section.lower()
        if not any(keyword in section_lower for keyword in dessert_keywords):
            return None
        
        # Extract price if present
        price_match = re.search(r'(?:Rs\.?|PKR)\s*(\d+(?:,\d+)?)', section)
        price = price_match.group(1) if price_match else 'N/A'
        
        # Try to determine category
        category = 'Dessert'
        for keyword in ['cake', 'brownie', 'cookie', 'donut', 'cupcake', 'cheesecake']:
            if keyword in section_lower:
                category = keyword.capitalize() + 's'
                break
        
        return {
            'name': product_name,
            'category': category,
            'price': price,
            'full_text': section
        }
    
    def load_pdf_to_chromadb(self, pdf_path: str, force_reload: bool = False):
        """
        Load PDF content into ChromaDB
        
        Args:
            pdf_path: Path to the PDF file
            force_reload: If True, reload even if collection has data
        """
        # Check if collection already has data
        existing_count = self.collection.count()
        
        if existing_count > 0 and not force_reload:
            logger.info(f"Collection already has {existing_count} documents. Skipping load.")
            logger.info("Set force_reload=True to reload the data.")
            return
        
        if force_reload and existing_count > 0:
            logger.info(f"Force reload enabled. Clearing {existing_count} existing documents.")
            # Clear existing collection
            try:
                self.client.delete_collection("desserts")
                self.collection = self.client.create_collection(
                    name="desserts",
                    metadata={"hnsw:space": "cosine"}
                )
                logger.info("Collection cleared and recreated")
            except Exception as e:
                logger.error(f"Error clearing collection: {e}")
                return
        
        # Extract chunks from PDF
        chunks = self.extract_product_chunks(pdf_path)
        
        if not chunks:
            logger.error("No chunks extracted from PDF. Check PDF format and content.")
            return
        
        # Prepare data for ChromaDB
        texts = [chunk['text'] for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]
        ids = [chunk['id'] for chunk in chunks]
        
        # Generate embeddings
        logger.info(f"Generating embeddings for {len(texts)} chunks...")
        try:
            embeddings = self.embedder.encode(texts, show_progress_bar=True).tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return
        
        # Add to ChromaDB in batches to avoid memory issues
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch_end = min(i + batch_size, len(chunks))
            try:
                self.collection.add(
                    embeddings=embeddings[i:batch_end],
                    documents=texts[i:batch_end],
                    metadatas=metadatas[i:batch_end],
                    ids=ids[i:batch_end]
                )
                logger.info(f"Loaded batch {i//batch_size + 1}: {batch_end - i} chunks")
            except Exception as e:
                logger.error(f"Error adding batch {i//batch_size + 1}: {e}")
        
        final_count = self.collection.count()
        logger.info(f"Successfully loaded {final_count} chunks into ChromaDB")
    
    def search(self, query: str, n_results: int = 3) -> List[Dict]:
        """
        Search for similar desserts using semantic search
        
        Args:
            query: User's search query
            n_results: Number of results to return
            
        Returns:
            List of dictionaries containing search results with metadata
        """
        if not query or not query.strip():
            logger.warning("Empty query provided to search")
            return []
        
        try:
            # Generate query embedding
            query_embedding = self.embedder.encode([query]).tolist()
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=min(n_results, self.collection.count())
            )
            
            # Format results
            formatted_results = []
            
            if results['documents'] and results['documents'][0]:
                for i in range(len(results['documents'][0])):
                    formatted_results.append({
                        'text': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else 0,
                        'id': results['ids'][0][i] if results['ids'] else f'result_{i}'
                    })
            
            logger.info(f"Found {len(formatted_results)} results for query: '{query[:50]}...'")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error during search: {e}")
            return []
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the collection"""
        try:
            count = self.collection.count()
            return {
                'total_documents': count,
                'collection_name': 'desserts',
                'embedding_model': 'sentence-transformers/all-MiniLM-L6-v2'
            }
        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {}


# Global instance to be used across the application
vector_db = None

def get_vector_db() -> DessertVectorDB:
    """Get or create the global vector database instance"""
    global vector_db
    if vector_db is None:
        vector_db = DessertVectorDB()
    return vector_db
