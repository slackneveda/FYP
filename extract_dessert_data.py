import os
import re
import json
import ast

def extract_desserts_from_js(file_path):
    """Extract dessert data from JavaScript file"""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the desserts array using more robust pattern
    desserts_match = re.search(r'export\s+const\s+desserts\s*=\s*\[(.*?)\];', content, re.DOTALL)
    
    if not desserts_match:
        print("Could not find desserts array in file")
        return []
    
    desserts_str = desserts_match.group(1)
    
    # Split by object boundaries and process each dessert
    desserts = []
    
    # Find all dessert objects
    brace_count = 0
    current_object = ""
    in_object = False
    
    for char in desserts_str:
        if char == '{':
            if brace_count == 0:
                in_object = True
                current_object = "{"
            else:
                current_object += char
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            current_object += char
            if brace_count == 0 and in_object:
                # Process this complete object
                dessert = parse_dessert_object(current_object)
                if dessert:
                    desserts.append(dessert)
                current_object = ""
                in_object = False
        elif in_object:
            current_object += char
    
    return desserts

def parse_dessert_object(obj_str):
    """Parse individual dessert object from string"""
    dessert_dict = {}
    
    try:
        # Extract simple fields with regex
        fields = {
            'id': r'id:\s*(\d+)',
            'name': r'name:\s*["\']([^"\']+)["\']',
            'description': r'description:\s*["\']([^"\']+)["\']',
            'price': r'price:\s*(\d+(?:\.\d+)?)',
            'category': r'category:\s*["\']([^"\']+)["\']',
            'image': r'image:\s*["\']([^"\']+)["\']',
            'rating': r'rating:\s*(\d+(?:\.\d+)?)',
            'reviews': r'reviews:\s*(\d+)',
            'preparationTime': r'preparationTime:\s*(\d+)',
            'featured': r'featured:\s*(true|false)',
            'seasonal': r'seasonal:\s*(true|false)',
            'bestSeller': r'bestSeller:\s*(true|false)',
        }
        
        for field, pattern in fields.items():
            match = re.search(pattern, obj_str)
            if match:
                value = match.group(1)
                if field in ['id', 'reviews', 'preparationTime']:
                    dessert_dict[field] = int(value)
                elif field in ['price', 'rating']:
                    dessert_dict[field] = float(value)
                elif field in ['featured', 'seasonal', 'bestSeller']:
                    dessert_dict[field] = value.lower() == 'true'
                else:
                    dessert_dict[field] = value
        
        # Extract arrays
        array_fields = {
            'dietaryInfo': r'dietaryInfo:\s*\[([^\]]+)\]',
            'ingredients': r'ingredients:\s*\[([^\]]+)\]',
            'allergens': r'allergens:\s*\[([^\]]+)\]',
        }
        
        for field, pattern in array_fields.items():
            match = re.search(pattern, obj_str)
            if match:
                array_content = match.group(1)
                # Extract quoted strings from array
                items = re.findall(r'["\']([^"\']+)["\']', array_content)
                dessert_dict[field] = items
            else:
                dessert_dict[field] = []
        
        return dessert_dict
        
    except Exception as e:
        print(f"Error parsing dessert object: {e}")
        return None

def extract_categories_from_js(file_path):
    """Extract categories from JavaScript file"""
    if not os.path.exists(file_path):
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find categories array
    categories_match = re.search(r'export\s+const\s+categories\s*=\s*\[(.*?)\];', content, re.DOTALL)
    
    if categories_match:
        categories_str = categories_match.group(1)
        categories = re.findall(r'["\']([^"\']+)["\']', categories_str)
        return categories
    
    return []

def extract_testimonials_from_js(file_path):
    """Extract testimonials from JavaScript file"""
    if not os.path.exists(file_path):
        return []
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find testimonials array
    testimonials_match = re.search(r'export\s+const\s+testimonials\s*=\s*\[(.*?)\];', content, re.DOTALL)
    
    testimonials = []
    if testimonials_match:
        testimonials_str = testimonials_match.group(1)
        
        # Split by testimonial objects
        testimonial_objects = re.findall(r'\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}', testimonials_str)
        
        for obj_str in testimonial_objects:
            testimonial = {}
            
            # Extract fields
            id_match = re.search(r'id:\s*(\d+)', obj_str)
            if id_match:
                testimonial['id'] = int(id_match.group(1))
            
            name_match = re.search(r'name:\s*["\']([^"\']+)["\']', obj_str)
            if name_match:
                testimonial['name'] = name_match.group(1)
            
            text_match = re.search(r'text:\s*["\']([^"\']+)["\']', obj_str)
            if text_match:
                testimonial['text'] = text_match.group(1)
            
            rating_match = re.search(r'rating:\s*(\d+)', obj_str)
            if rating_match:
                testimonial['rating'] = int(rating_match.group(1))
            
            date_match = re.search(r'date:\s*["\']([^"\']+)["\']', obj_str)
            if date_match:
                testimonial['date'] = date_match.group(1)
            
            avatar_match = re.search(r'avatar:\s*["\']([^"\']+)["\']', obj_str)
            if avatar_match:
                testimonial['avatar'] = avatar_match.group(1)
            
            testimonials.append(testimonial)
    
    return testimonials

# Test the extraction
if __name__ == "__main__":
    desserts_file = r"D:\UNI\FYP\PROJECT\frontend\sweet-dessert\src\data\desserts.js"
    
    print("Extracting desserts...")
    desserts = extract_desserts_from_js(desserts_file)
    print(f"Extracted {len(desserts)} desserts")
    
    print("\nExtracting categories...")
    categories = extract_categories_from_js(desserts_file)
    print(f"Extracted {len(categories)} categories: {categories}")
    
    print("\nExtracting testimonials...")
    testimonials = extract_testimonials_from_js(desserts_file)
    print(f"Extracted {len(testimonials)} testimonials")
    
    # Print first dessert as sample
    if desserts:
        print("\nSample dessert:")
        print(json.dumps(desserts[0], indent=2))