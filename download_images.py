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
    # Create directories if they don't exist
    os.makedirs('app/static/img/products', exist_ok=True)

    # Using direct image URLs that are more reliable
    images = {
        'products/strawberries.jpg': 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=800',
        'products/blueberries.jpg': 'https://images.unsplash.com/photo-1425934398893-310a009a77f9?w=800',
        'products/frozen-berries.jpg': 'https://images.unsplash.com/photo-1563746098251-d35aef196e83?w=800',
        'products/mixed-berries.jpg': 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=800',
        'products/berry-jam.jpg': 'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=800'
    }

    for filename, url in images.items():
        file_path = os.path.join('app/static/img', filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        download_image(url, file_path)

if __name__ == '__main__':
    main()
