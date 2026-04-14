"""Fix product specification keys to use English."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.product import Product


# Translation mapping from Finnish to English
SPEC_TRANSLATIONS = {
    "Paino": "Weight",
    "Näyttö": "Display",
    "Suoritin": "Processor",
    "Akunkesto": "Battery Life",
    "Tallennustila": "Storage",
    "RAM": "RAM",
    "Käyttöjärjestelmä": "Operating System",
    "Näytön koko": "Screen Size",
    "Resoluutio": "Resolution",
    "Kamera": "Camera",
    "Etukamera": "Front Camera",
    "Takakamera": "Rear Camera",
    "Akkukapasiteetti": "Battery Capacity",
    "Latausnopeus": "Charging Speed",
    "SIM": "SIM",
    "5G": "5G",
    "Vedenkestävyys": "Water Resistance",
    "Paneelityyppi": "Panel Type",
    "Virkistystaajuus": "Refresh Rate",
    "HDR": "HDR",
    "Smart-ominaisuudet": "Smart Features",
    "HDMI-portit": "HDMI Ports",
    "USB-portit": "USB Ports",
    "Äänentoisto": "Audio",
    "Paneelin tekniikka": "Panel Technology",
    "Vaste-aika": "Response Time",
    "Contrast Ratio": "Contrast Ratio",
    "Liitännät": "Connectivity",
    "Säädöt": "Adjustments",
    "Melunvaimennus": "Noise Cancellation",
    "Akun kesto": "Battery Duration",
    "Latausaika": "Charging Time",
    "Yhteydet": "Connections",
    "Paino (kuulokkeet)": "Weight",
    "Mukana": "Included",
    "Resoluutio (video)": "Video Resolution",
    "Kuvataajuus": "Frame Rate",
    "Kenno": "Sensor",
    "Objektiivi": "Lens",
    "Zoomaus": "Zoom",
    "Stabilointi": "Stabilization",
    "Videotallennusmuodot": "Video Formats",
    "Vedenpitävyys": "Waterproof",
    # Additional translations
    "Mitat": "Dimensions",
    "Mylly": "Grinder",
    "Paine": "Pressure",
    "Tyyppi": "Type",
    "Ominaisuudet": "Features",
    "Vesisäiliö": "Water Tank",
    "Linkous": "Spin Speed",
    "Melutaso": "Noise Level",
    "Täyttö": "Capacity",
    "Energialuokka": "Energy Class",
    "Tilavuus": "Volume",
    "Lämpötila-alue": "Temperature Range",
    "Ilmankierto": "Air Circulation",
    "Ohjelmat": "Programs",
    "Imutaso": "Suction Power",
    "Pölysäiliö": "Dust Container",
    "Suodatin": "Filter",
    "Melutaso (dB)": "Noise Level (dB)",
    "Toiminta-aika": "Runtime",
    "Latausaika (h)": "Charging Time (h)",
    "Lämpötilatarkkuus": "Temperature Accuracy",
    "Yhteensopivuus": "Compatibility",
    "Anturit": "Sensors",
    "Sovellus": "App",
}


def fix_specifications():
    """Fix product specifications to use English keys."""
    db = SessionLocal()

    try:
        print("Fixing product specification keys to English...")

        products = db.query(Product).filter(Product.specifications.isnot(None)).all()
        updated_count = 0

        for product in products:
            if not product.specifications:
                continue

            # Create new specifications dict with English keys
            new_specs = {}
            updated = False

            for finnish_key, value in product.specifications.items():
                # Translate the key if we have a mapping
                english_key = SPEC_TRANSLATIONS.get(finnish_key, finnish_key)
                new_specs[english_key] = value

                if english_key != finnish_key:
                    updated = True

            # Update if changes were made
            if updated:
                product.specifications = new_specs
                updated_count += 1
                print(f"  Updated: {product.name[:50]}...")

        db.commit()
        print(f"\n✓ Successfully updated {updated_count} products with English specification keys!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    fix_specifications()
