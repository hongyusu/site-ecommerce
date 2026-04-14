"""Add real product images from Unsplash based on product categories."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.product import Product


# Map keywords to Unsplash image IDs and search terms
PRODUCT_IMAGES = {
    'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',  # MacBook
    'iphone': 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800',  # iPhone
    'ipad': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',  # iPad
    'airpods': 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800',  # AirPods
    'apple watch': 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800',  # Apple Watch
    'samsung galaxy': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',  # Samsung phone
    'samsung tv': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',  # Samsung TV
    'samsung qled': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',  # QLED TV
    'lg oled': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',  # OLED TV
    'tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',  # Generic TV
    'playstation': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',  # PlayStation
    'xbox': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800',  # Xbox
    'gopro': 'https://images.unsplash.com/photo-1585641096913-2e41e2eb2dab?w=800',  # GoPro
    'camera': 'https://images.unsplash.com/photo-1606604480540-5388290ddb21?w=800',  # Camera
    'canon': 'https://images.unsplash.com/photo-1606604480540-5388290ddb21?w=800',  # Canon camera
    'sony alpha': 'https://images.unsplash.com/photo-1606094794371-f9d07cee1b73?w=800',  # Sony camera
    'headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',  # Headphones
    'sony wh': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',  # Sony headphones
    'laptop': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',  # Generic laptop
    'thinkpad': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',  # ThinkPad
    'dell xps': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',  # Dell laptop
    'asus': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',  # ASUS laptop
    'keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',  # Keyboard
    'mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',  # Mouse
    'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',  # Monitor
    'pixel': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',  # Pixel phone
    'oneplus': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',  # OnePlus
    'xiaomi': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',  # Xiaomi
    'soundbar': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',  # Soundbar
    'sonos': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',  # Sonos
    'thermostat': 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800',  # Thermostat
    'doorbell': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',  # Doorbell
    'vacuum': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',  # Vacuum
    'roomba': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',  # Roomba
    'washing': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800',  # Washing machine
    'refrigerator': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',  # Fridge
    'espresso': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800',  # Espresso machine
    'philips hue': 'https://images.unsplash.com/photo-1558089687-e460d2d7ce28?w=800',  # Smart bulbs
}


def get_image_for_product(name: str) -> str:
    """Get appropriate Unsplash image URL for product."""
    name_lower = name.lower()
    
    # Check for specific matches
    for keyword, url in PRODUCT_IMAGES.items():
        if keyword in name_lower:
            return url
    
    # Default fallback
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'


def add_real_images():
    """Update all products with real Unsplash images."""
    db = SessionLocal()

    try:
        print("Adding real product images from Unsplash...")

        products = db.query(Product).all()
        updated_count = 0

        for product in products:
            if product.images and len(product.images) > 0:
                new_url = get_image_for_product(product.name)
                product.images[0].image_url = new_url
                updated_count += 1
                print(f"  {product.name[:50]} -> {new_url.split('/')[-1][:30]}")

        db.commit()
        print(f"\n✓ Successfully updated {updated_count} products with real images!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    add_real_images()
