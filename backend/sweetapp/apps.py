# cSpell:ignore sweetapp
from django.apps import AppConfig
import os
import logging

logger = logging.getLogger(__name__)


class SweetappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sweetapp'
    
    def ready(self):
        """Initialize ChromaDB when Django starts"""
        # Only run in main process (not in reloader)
        import sys
        if 'runserver' not in sys.argv:
            return
            
        try:
            from .vector_db import get_vector_db
            
            # Path to your PDF training data
            pdf_path = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                'sweet_dessert_updated_descriptions_training_data.pdf'
            )
            
            if os.path.exists(pdf_path):
                logger.info(f"Initializing ChromaDB with PDF: {pdf_path}")
                vector_db = get_vector_db()
                vector_db.load_pdf_to_chromadb(pdf_path, force_reload=False)
                
                stats = vector_db.get_collection_stats()
                logger.info(f"ChromaDB ready: {stats}")
            else:
                logger.warning(f"PDF training data not found at: {pdf_path}")
                logger.warning("Chat assistant will work but without product knowledge.")
                
        except Exception as e:
            logger.error(f"Error initializing ChromaDB: {e}", exc_info=True)
            logger.warning("Chat assistant may not work properly without ChromaDB.")
