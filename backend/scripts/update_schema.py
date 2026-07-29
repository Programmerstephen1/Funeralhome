"""Run to apply minimal schema updates when Alembic isn't configured.

Usage (from repo root):
    python backend/scripts/update_schema.py

This script will:
- create the `donations` table if missing
- ensure `purpose` and `memorial_id` columns exist on `payment_transactions` (adds them when missing)

It uses the app's SQLAlchemy config and supports SQLite and Postgres-compatible databases.
"""
from backend.app import create_app, db
from backend.app import models
from sqlalchemy import inspect, text
import sys

app = create_app()

with app.app_context():
    engine = db.get_engine(app)
    insp = inspect(engine)

    # 1) Ensure donations table exists
    if 'donations' not in insp.get_table_names():
        print('Creating donations table...')
        try:
            models.Donation.__table__.create(bind=engine)
            print('donations table created.')
        except Exception as e:
            print('Failed to create donations table:', e)
    else:
        print('donations table already exists.')

    # 2) Ensure payment_transactions has purpose and memorial_id columns
    cols = {c['name'] for c in insp.get_columns('payment_transactions')}
    alter_statements = []

    if 'purpose' not in cols:
        print('Adding purpose column to payment_transactions...')
        if engine.dialect.name == 'sqlite':
            alter_statements.append("ALTER TABLE payment_transactions ADD COLUMN purpose VARCHAR(50);")
        else:
            alter_statements.append("ALTER TABLE payment_transactions ADD COLUMN purpose VARCHAR(50);")

    if 'memorial_id' not in cols:
        print('Adding memorial_id column to payment_transactions...')
        if engine.dialect.name == 'sqlite':
            alter_statements.append("ALTER TABLE payment_transactions ADD COLUMN memorial_id VARCHAR(150);")
        else:
            alter_statements.append("ALTER TABLE payment_transactions ADD COLUMN memorial_id VARCHAR(150);")

    if alter_statements:
        conn = engine.connect()
        trans = conn.begin()
        try:
            for stmt in alter_statements:
                print('Executing:', stmt)
                conn.execute(text(stmt))
            trans.commit()
            print('Schema updates applied successfully.')
        except Exception as e:
            trans.rollback()
            print('Failed to apply schema updates:', e)
            sys.exit(1)
        finally:
            conn.close()
    else:
        print('No schema changes required.')

    # 3) Ensure product_sizes table exists (for product size variants)
    if 'product_sizes' not in insp.get_table_names():
        print('Creating product_sizes table...')
        try:
            conn = engine.connect()
            conn.execute(text('''
                CREATE TABLE product_sizes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER,
                    label VARCHAR(255),
                    price_modifier FLOAT,
                    FOREIGN KEY(product_id) REFERENCES product(id)
                );
            '''))
            print('product_sizes table created.')
        except Exception as e:
            print('Failed to create product_sizes table:', e)
    else:
        print('product_sizes table already exists.')

    # 4) Ensure products table has has_sound_system column
    prod_cols = {c['name'] for c in insp.get_columns('products')}
    if 'has_sound_system' not in prod_cols:
        print('Adding has_sound_system column to products...')
        try:
            conn = engine.connect()
            conn.execute(text("ALTER TABLE products ADD COLUMN has_sound_system BOOLEAN DEFAULT 0;"))
            print('has_sound_system column added.')
        except Exception as e:
            print('Failed to add has_sound_system column:', e)
        finally:
            conn.close()
    else:
        print('products.has_sound_system already present.')

    # 5) Backfill required inclusions for existing hearse/vehicle products and ensure media has sound systems
    try:
        conn = engine.connect()
        # Backfill hearses/vehicles
        stmt = text("SELECT id, inclusions, category_id FROM products WHERE category_id IN ('hearses','hearse','vehicles')")
        rows = conn.execute(stmt).fetchall()
        VEHICLE_REQUIRED = [
            'Auto-lowering gear', 'Casket gazebo tent', 'Public system for the grave yard site', 'Portrait stand', 'Church trolley', 'Graveside turf'
        ]
        for r in rows:
            prod_id = r['id']
            current = r['inclusions'] or ''
            existing = {i.strip().lower() for i in current.split(',') if i.strip()}
            new_list = current
            for req in VEHICLE_REQUIRED:
                if req.strip().lower() not in existing:
                    if new_list:
                        new_list = new_list + ', ' + req
                    else:
                        new_list = req
            if new_list != (current or ''):
                conn.execute(text("UPDATE products SET inclusions = :incs WHERE id = :id"), {'incs': new_list, 'id': prod_id})

        # Backfill media/videography
        rows = conn.execute(text("SELECT id, inclusions, category_id FROM products WHERE category_id IN ('media','videography')")).fetchall()
        for r in rows:
            prod_id = r['id']
            current = r['inclusions'] or ''
            if 'sound' not in current.lower():
                new_list = (current + ', Sound systems') if current else 'Sound systems'
                conn.execute(text("UPDATE products SET inclusions = :incs, has_sound_system = 1 WHERE id = :id"), {'incs': new_list, 'id': prod_id})
    except Exception as e:
        print('Failed to backfill product inclusions:', e)
    finally:
        try:
            conn.close()
        except:
            pass

    print('Done.')
