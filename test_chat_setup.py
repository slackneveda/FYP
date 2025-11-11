# cSpell:ignore sweetapp openrouter OPENROUTER
"""
Test script for AI Chat Assistant
Run this to verify all components are working correctly
"""

import os
import sys
import warnings

# Suppress ChromaDB telemetry warnings
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', message='.*telemetry.*')

import django

# Setup Django environment
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Import after Django setup
try:
    from sweetapp.vector_db import get_vector_db  # type: ignore
    from sweetapp import chat_views  # type: ignore # Fix import error
    from decouple import config  # type: ignore
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

def test_chromadb():
    """Test ChromaDB initialization and search"""
    print("\n" + "="*50)
    print("Testing ChromaDB")
    print("="*50)
    
    try:
        db = get_vector_db()
        stats = db.get_collection_stats()
        
        print(f"✓ ChromaDB initialized")
        print(f"  - Collection: {stats.get('collection_name')}")
        print(f"  - Documents: {stats.get('total_documents')}")
        print(f"  - Model: {stats.get('embedding_model')}")
        
        if stats.get('total_documents', 0) == 0:
            print("⚠️  Warning: No documents in collection")
            print("   PDF might not have been loaded successfully")
            return False
        
        return True
    except Exception as e:
        print(f"❌ ChromaDB Error: {e}")
        return False

def test_vector_search():
    """Test vector search functionality"""
    print("\n" + "="*50)
    print("Testing Vector Search")
    print("="*50)
    
    try:
        db = get_vector_db()
        
        # Test search
        query = "chocolate cake"
        print(f"\nSearching for: '{query}'")
        results = db.search(query, n_results=3)
        
        if not results:
            print("❌ No search results returned")
            return False
        
        print(f"✓ Found {len(results)} results:")
        for i, result in enumerate(results, 1):
            product_name = result.get('metadata', {}).get('product_name', 'Unknown')
            distance = result.get('distance', 0)
            print(f"  {i}. {product_name} (similarity: {1-distance:.2f})")
        
        return True
    except Exception as e:
        print(f"❌ Search Error: {e}")
        return False

def test_openrouter_config():
    """Test OpenRouter API configuration"""
    print("\n" + "="*50)
    print("Testing OpenRouter Configuration")
    print("="*50)
    
    try:
        api_key = config('OPENROUTER_API_KEY', default='')
        
        if not api_key:
            print("❌ OPENROUTER_API_KEY not set in .env file")
            return False
        
        if not api_key.startswith('sk-or-v1-'):
            print("⚠️  Warning: API key format looks incorrect")
            print(f"   Expected to start with 'sk-or-v1-', got: {api_key[:10]}...")
            return False
        
        print(f"✓ OPENROUTER_API_KEY configured")
        print(f"  Key: {api_key[:20]}...{api_key[-10:]}")
        
        return True
    except Exception as e:
        print(f"❌ Configuration Error: {e}")
        return False

def test_pdf_file():
    """Test if PDF training data exists"""
    print("\n" + "="*50)
    print("Testing PDF Training Data")
    print("="*50)
    
    pdf_path = os.path.join(
        os.path.dirname(__file__),
        'sweet_dessert_updated_descriptions_training_data.pdf'
    )
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found at: {pdf_path}")
        return False
    
    size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
    print(f"✓ PDF file found")
    print(f"  Path: {pdf_path}")
    print(f"  Size: {size_mb:.2f} MB")
    
    return True

def test_django_imports():
    """Test Django app imports"""
    print("\n" + "="*50)
    print("Testing Django Imports")
    print("="*50)
    
    try:
        from sweetapp import chat_views, vector_db  # type: ignore # cSpell:ignore sweetapp
        print("✓ chat_views module imported")
        print("✓ vector_db module imported")
        
        # Check key functions exist
        assert hasattr(chat_views, 'chat_stream')
        assert hasattr(chat_views, 'add_to_cart')
        assert hasattr(vector_db, 'DessertVectorDB')
        
        print("✓ All required functions available")
        return True
    except Exception as e:
        print(f"❌ Import Error: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("Sweet Dessert AI Chat Assistant - System Test")
    print("="*60)
    
    results = {
        'PDF File': test_pdf_file(),
        'Django Imports': test_django_imports(),
        'ChromaDB': test_chromadb(),
        'Vector Search': test_vector_search(),
        'OpenRouter Config': test_openrouter_config(),
    }
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{test_name:.<40} {status}")
    
    print("\n" + "="*60)
    print(f"Results: {passed}/{total} tests passed")
    print("="*60)
    
    if passed == total:
        print("\n🎉 All tests passed! Your chat assistant is ready to use.")
        print("\nNext steps:")
        print("1. Start backend: python manage.py runserver")
        print("2. Start frontend: cd frontend/sweet-dessert && npm run dev")
        print("3. Open browser to: http://localhost:5173")
        print("4. Navigate to Chat Assistant page and test!")
    else:
        print("\n⚠️  Some tests failed. Please review errors above.")
        print("Check CHAT_AI_SETUP_GUIDE.md for troubleshooting.")
    
    print("")

if __name__ == '__main__':
    main()
