from pathlib import Path
import pandas as pd
from app.database import SessionLocal, engine
from app.models import Base, CustomerCluster, AssociationRule

def seed_data(csv_file_path: str):
    csv_path = Path(csv_file_path)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed CustomerCluster if empty
        if db.query(CustomerCluster).first() is None:
            if not csv_path.exists():
                print(f"File CSV tidak ditemukan: {csv_path}")
            else:
                print(f"Mengimpor data awal dari {csv_path}...")
                df = pd.read_csv(csv_path)
                for _, row in df.iterrows():
                    customer = CustomerCluster(
                        customer_id=row['Customer ID'],
                        customer_name=row['Customer_Name'],
                        segment=row['Segment'],
                        recency=int(row['Recency']),
                        frequency=int(row['Frequency']),
                        monetary=float(row['Monetary']),
                        recency_scaled=float(row['Recency_scaled']),
                        frequency_scaled=float(row['Frequency_scaled']),
                        monetary_scaled=float(row['Monetary_scaled']),
                        cluster=int(row['Cluster'])
                    )
                    db.add(customer)
                db.commit()
                print("Proses seeding CustomerCluster sukses!")

        # Seed AssociationRule if empty
        if db.query(AssociationRule).first() is None:
            print("Seeding AssociationRule (Market Basket Analysis)...")
            mock_rules = [
                {"antecedents": "Office Supplies, Paper", "consequents": "Binders", "support": 0.12, "confidence": 0.85, "lift": 2.1},
                {"antecedents": "Technology, Accessories", "consequents": "Phones", "support": 0.08, "confidence": 0.72, "lift": 3.4},
                {"antecedents": "Furniture, Bookcases", "consequents": "Chairs", "support": 0.05, "confidence": 0.65, "lift": 1.8},
                {"antecedents": "Office Supplies, Envelopes", "consequents": "Fasteners", "support": 0.03, "confidence": 0.58, "lift": 1.5},
                {"antecedents": "Technology, Copiers", "consequents": "Machines", "support": 0.02, "confidence": 0.90, "lift": 4.5},
                {"antecedents": "Office Supplies, Art", "consequents": "Binders", "support": 0.09, "confidence": 0.61, "lift": 1.3},
                {"antecedents": "Furniture, Tables", "consequents": "Chairs", "support": 0.04, "confidence": 0.77, "lift": 2.2},
                {"antecedents": "Technology, Phones", "consequents": "Accessories", "support": 0.07, "confidence": 0.81, "lift": 3.0},
            ]
            for r in mock_rules:
                rule = AssociationRule(
                    antecedents=r["antecedents"],
                    consequents=r["consequents"],
                    support=r["support"],
                    confidence=r["confidence"],
                    lift=r["lift"]
                )
                db.add(rule)
            db.commit()
            print("Proses seeding AssociationRule sukses!")

    except Exception as e:
        db.rollback()
        print(f"Gagal melakukan seeding data: {e}")
    finally:
        db.close()