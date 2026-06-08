from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class CustomerCluster(Base):
    __tablename__ = "customer_clusters"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(50), unique=True, index=True)
    customer_name = Column(String(100))
    segment = Column(String(50))
    recency = Column(Integer)
    frequency = Column(Integer)
    monetary = Column(Float)
    recency_scaled = Column(Float)
    frequency_scaled = Column(Float)
    monetary_scaled = Column(Float)
    cluster = Column(Integer)

class AssociationRule(Base):
    __tablename__ = "association_rules"

    id = Column(Integer, primary_key=True, index=True)
    antecedents = Column(String(255))
    consequents = Column(String(255))
    support = Column(Float)
    confidence = Column(Float)
    lift = Column(Float)