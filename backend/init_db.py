"""
Database Initialization & Migration Script

Usage:
    python backend/init_db.py [--reset] [--seed]

Options:
    --reset : Drop all tables and recreate (WARNING: deletes data)
    --seed  : Populate with sample data
"""

import os
import sys
import argparse
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app import create_app, db
from app.models import FuneralService, Tribute


def reset_database():
    """Drop all tables and recreate the schema."""
    print("⚠️  Resetting database...")
    db.drop_all()
    print("✓ Tables dropped")

    db.create_all()
    print("✓ Tables created")


def seed_database():
    """Populate database with sample data."""
    print("🌱 Seeding database with sample data...")

    # Sample services
    services = [
        FuneralService(
            name="Funeral Planning",
            description="Comprehensive assistance with funeral arrangements, venue selection, and vendor coordination.",
        ),
        FuneralService(
            name="Obituary Writing",
            description="Professional obituary composition that honors your loved one's life and legacy.",
        ),
        FuneralService(
            name="Memorial Tributes",
            description="Personalized online tribute pages with guestbook, photo galleries, and candle lighting.",
        ),
        FuneralService(
            name="Pre-Planning Services",
            description="Plan ahead to ease the burden on your family during difficult times.",
        ),
        FuneralService(
            name="Eulogy Assistance",
            description="Guided help in writing and delivering meaningful eulogies.",
        ),
    ]

    for service in services:
        if not FuneralService.query.filter_by(name=service.name).first():
            db.session.add(service)

    # Sample tributes
    tributes = [
        Tribute(
            name="Maria Garcia",
            message="A beautiful soul who brought joy to everyone around her. You will be deeply missed.",
        ),
        Tribute(
            name="James Wilson",
            message="An inspiration to us all. Your legacy will live on in our hearts forever.",
        ),
        Tribute(
            name="Sarah Ahmed",
            message="Thank you for the wonderful memories. Rest in peace, dear friend.",
        ),
        Tribute(
            name="David Chen",
            message="Forever grateful for the guidance and love you provided throughout the years.",
        ),
        Tribute(
            name="Anonymous",
            message="In loving memory of a remarkable life. May peace be with your family.",
        ),
    ]

    for tribute in tributes:
        # Check if tribute doesn't already exist
        if not Tribute.query.filter_by(name=tribute.name, message=tribute.message).first():
            db.session.add(tribute)

    db.session.commit()
    print(f"✓ Added {len(services)} services")
    print(f"✓ Added {len(tributes)} sample tributes")


def display_summary():
    """Display database summary."""
    print("\n📊 Database Summary:")
    print(f"  - Services: {FuneralService.query.count()}")
    print(f"  - Tributes: {Tribute.query.count()}")


def main():
    parser = argparse.ArgumentParser(description="Initialize and manage the database")
    parser.add_argument("--reset", action="store_true", help="Reset database (drop all tables)")
    parser.add_argument("--seed", action="store_true", help="Seed database with sample data")
    args = parser.parse_args()

    # Create app context
    app = create_app()

    with app.app_context():
        # Create tables if they don't exist
        print("📦 Ensuring tables exist...")
        db.create_all()
        print("✓ Tables ready")

        # Reset if requested
        if args.reset:
            reset_database()

        # Seed if requested
        if args.seed:
            seed_database()

        # Display summary
        display_summary()

        print("\n✅ Database initialization complete!")


if __name__ == "__main__":
    main()
