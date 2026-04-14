"""Seed database with product reviews."""

import random
from datetime import datetime, timedelta
from decimal import Decimal

from faker import Faker
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.product import Product, ProductReview
from app.models.user import User, UserRole

fake = Faker("fi_FI")


def create_reviews(db: Session) -> None:
    """Create product reviews for existing products."""
    print("Creating product reviews...")

    # Get all products
    products = db.query(Product).all()
    print(f"Found {len(products)} products")

    # Get all customer users
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER).all()
    print(f"Found {len(customers)} customer users")

    if not customers:
        print("No customer users found. Please run seed_verkkokauppa_data.py first.")
        return

    # Review templates by rating
    review_templates = {
        5: {
            "titles": [
                "Erinomainen tuote!",
                "Paras ostos ikinä",
                "Suosittelen lämpimästi",
                "Täydellinen",
                "Ylitti odotukset",
                "Loistava laatu",
                "Ei moitteita",
                "Huippulaatua",
                "Toimii täydellisesti",
                "Kannattaa ostaa",
            ],
            "comments": [
                "Erittäin tyytyväinen ostokseen. Tuote vastasi täysin kuvailua ja toimii moitteettomasti. Suosittelen!",
                "Paras laatu ja toimivuus. Kannattaa ehdottomasti hankkia.",
                "Olen käyttänyt tuotetta nyt muutaman viikon ja olen todella tyytyväinen. Laatu on erinomaista.",
                "Täydellinen tuote tarpeisiini. Toimitus oli nopea ja pakkaus huolellinen.",
                "Ylitti kaikki odotukseni. Loistava hinta-laatusuhde.",
                "Erittäin laadukas ja hyvin tehty. Toimii juuri niin kuin pitääkin.",
                "Paras ostokseni tänä vuonna. Suosittelen kaikille!",
                "Toimitus oli nopea ja tuote vastasi täysin odotuksia. Viisi tähteä!",
            ],
        },
        4: {
            "titles": [
                "Hyvä tuote",
                "Toimii hyvin",
                "Suosittelen",
                "Hyvä hinta-laatusuhde",
                "Melko hyvä",
                "Ihan ok",
                "Toimiva ratkaisu",
            ],
            "comments": [
                "Hyvä tuote, mutta pientä parannettavaa löytyy. Kokonaisuutena olen tyytyväinen.",
                "Toimii hyvin, vaikka jotkin pienet yksityiskohdat voisivat olla parempia.",
                "Hyvä ostos. Laatu on kohdillaan ja toimii kuten pitääkin.",
                "Olin hieman epäileväinen ensin, mutta tuote on toiminut hyvin. Pieni miinus pakkauksesta.",
                "Ihan hyvä tuote. Vastaa hyvin kuvailua.",
                "Hyvä hinta-laatusuhde. Suosittelen varauksin.",
            ],
        },
        3: {
            "titles": [
                "OK tuote",
                "Ihan käyttökelpoinen",
                "Keskinkertainen",
                "Voisi olla parempikin",
                "Ihan jees",
            ],
            "comments": [
                "Ihan ok tuote, mutta ei mitään erikoista. Täyttää tarkoituksensa.",
                "Toimii, mutta laatu voisi olla parempaa tähän hintaan.",
                "Keskinkertainen tuote. Ei huono, mutta ei erinomainen.",
                "Ihan käyttökelpoinen, mutta odotukset olivat korkeammat.",
                "Toimii kuten pitääkin, mutta ei erityisen vakuuttava.",
            ],
        },
        2: {
            "titles": [
                "Pettymys",
                "Ei vastannut odotuksia",
                "Heikko laatu",
                "Ei suosittele",
            ],
            "comments": [
                "Pettymys. Odotukset olivat korkeammalla. Laatu ei vastaa hintaa.",
                "Tuote ei vastannut kuvailua. Palautan todennäköisesti.",
                "Heikko laatu verrattuna hintaan. En voi suositella.",
                "Ei toiminut odotetulla tavalla. Pieni pettymys.",
            ],
        },
        1: {
            "titles": [
                "Huono ostos",
                "Ei toimi",
                "Älä osta",
                "Täysi pettymys",
            ],
            "comments": [
                "Tuote ei toiminut ollenkaan. Täysi pettymys.",
                "Huono laatu. Hajosi heti käyttöönoton jälkeen.",
                "En voi suositella kenellekään. Täysin käyttökelvoton.",
                "Rahan haaskaus. Palautan heti.",
            ],
        },
    }

    # Clear existing reviews
    db.query(ProductReview).delete()
    db.commit()
    print("✓ Cleared existing reviews")

    total_reviews = 0

    for product in products:
        # Determine number of reviews based on product type
        # Featured products get more reviews
        if product.is_featured:
            num_reviews = random.randint(15, 30)
        else:
            num_reviews = random.randint(5, 15)

        # Determine rating distribution (realistic skew towards higher ratings)
        ratings = []
        for _ in range(num_reviews):
            rand = random.random()
            if rand < 0.5:  # 50% - 5 stars
                ratings.append(5)
            elif rand < 0.75:  # 25% - 4 stars
                ratings.append(4)
            elif rand < 0.90:  # 15% - 3 stars
                ratings.append(3)
            elif rand < 0.97:  # 7% - 2 stars
                ratings.append(2)
            else:  # 3% - 1 star
                ratings.append(1)

        # Shuffle customers to get random reviewers
        reviewer_pool = random.sample(customers * 10, num_reviews)

        for i, rating in enumerate(ratings):
            customer = reviewer_pool[i % len(customers)]

            # Select random title and comment based on rating
            title = random.choice(review_templates[rating]["titles"])
            comment = random.choice(review_templates[rating]["comments"])

            # Add some variation to comments
            if rating >= 4 and random.random() < 0.3:
                comment += f" Toimitus oli {random.choice(['nopea', 'sujuva', 'viiveetön'])}."

            # Random date within last 6 months
            days_ago = random.randint(1, 180)
            created_date = datetime.utcnow() - timedelta(days=days_ago)

            # 70% chance of verified purchase
            verified = random.random() < 0.7

            # Random helpful count (higher ratings get more helpful votes)
            if rating >= 4:
                helpful_count = random.randint(0, 15)
            else:
                helpful_count = random.randint(0, 5)

            review = ProductReview(
                product_id=product.id,
                user_id=customer.id,
                rating=rating,
                title=title,
                comment=comment,
                verified_purchase=verified,
                helpful_count=helpful_count,
                created_at=created_date,
                updated_at=created_date,
            )
            db.add(review)
            total_reviews += 1

        # Update product rating statistics
        avg_rating = sum(ratings) / len(ratings)
        product.rating_average = Decimal(str(round(avg_rating, 2)))
        product.rating_count = len(ratings)

    db.commit()
    print(f"✓ Created {total_reviews} reviews across {len(products)} products")

    # Print summary
    print("\n=== Review Statistics ===")
    for product in products[:5]:  # Show first 5 products
        print(
            f"  {product.name[:50]}... - {product.rating_count} reviews, avg {product.rating_average}"
        )


def main():
    """Run the review seeding."""
    print("=== Seeding reviews ===\n")

    db = SessionLocal()
    try:
        create_reviews(db)
        print("\n=== Review seeding completed successfully ===")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
