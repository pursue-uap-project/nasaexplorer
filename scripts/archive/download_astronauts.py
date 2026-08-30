import os
import json
import urllib.request
import urllib.parse

# Setup folders
output_dir = 'public/assets/astronauts'
os.makedirs(output_dir, exist_ok=True)

# Load existing astronauts database
db_path = 'src/data/astronauts.json'
with open(db_path, 'r', encoding='utf-8') as f:
    astronauts = json.load(f)

# Query template
api_url = "https://images-api.nasa.gov/search"

def search_nasa_image(name):
    # Try with "official portrait" first, then fall back to "astronaut"
    queries = [
        f"{name} official portrait",
        f"{name} portrait",
        f"{name} astronaut",
        name
    ]
    
    for query in queries:
        try:
            url = f"{api_url}?q={urllib.parse.quote(query)}&media_type=image&page_size=3"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                items = data.get('collection', {}).get('items', [])
                if items:
                    # Look at items, try to find one with links
                    for item in items:
                        links = item.get('links', [])
                        if links:
                            img_url = links[0].get('href', '')
                            if img_url:
                                # Replace ~thumb with ~medium or ~small to get higher quality but reasonable size
                                img_url = img_url.replace('~thumb', '~medium')
                                return img_url
        except Exception as e:
            print(f"Error searching for query '{query}': {e}")
            continue
    return None

for ast_id, info in astronauts.items():
    name = info['name']
    print(f"Processing {name} ({ast_id})...")
    
    img_url = search_nasa_image(name)
    if img_url:
        print(f"  Found image URL: {img_url}")
        dest_path = os.path.join(output_dir, f"{ast_id}.jpg")
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"  Successfully downloaded to {dest_path}")
            # Update the database to point to local path
            info['image'] = f"assets/astronauts/{ast_id}.jpg"
        except Exception as e:
            print(f"  Failed to download image: {e}")
    else:
        print(f"  No image found for {name} on NASA Images API.")

# Save the updated astronauts database
with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(astronauts, f, indent=2, ensure_ascii=False)

print("Finished processing all astronauts!")
