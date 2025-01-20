import os
import requests

def download_image(url, filename):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, stream=True)
        response.raise_for_status()
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Successfully downloaded {filename}")
        return True
    except Exception as e:
        print(f"Failed to download {filename}: {str(e)}")
        return False

def main():
    # Create directories
    os.makedirs('app/static/img/recipes', exist_ok=True)
    os.makedirs('app/static/img/about', exist_ok=True)

    # Images to download
    images = {
        'recipes/smoothie-bowl.jpg': 'https://images.unsplash.com/photo-1626790680787-de5e9a07bcf2?w=800',
        'recipes/berry-pie.jpg': 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800',
        'recipes/berry-jam.jpg': 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=800',
        'about/farm.jpg': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800'
    }

    for filename, url in images.items():
        file_path = os.path.join('app/static/img', filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        download_image(url, file_path)

if __name__ == '__main__':
    main()
