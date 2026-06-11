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
            rules_csv_path = Path(__file__).parent.parent / "association_rules.csv"
            if rules_csv_path.exists():
                df_rules = pd.read_csv(rules_csv_path)
                for _, row in df_rules.iterrows():
                    rule = AssociationRule(
                        antecedents=str(row['antecedents']),
                        consequents=str(row['consequents']),
                        support=float(row['support']),
                        confidence=float(row['confidence']),
                        lift=float(row['lift'])
                    )
                    db.add(rule)
                db.commit()
                print(f"Proses seeding AssociationRule sukses! ({len(df_rules)} rules)")
            else:
                print(f"File association_rules.csv tidak ditemukan: {rules_csv_path}")

    except Exception as e:
        db.rollback()
        print(f"Gagal melakukan seeding data: {e}")
    finally:
        db.close()