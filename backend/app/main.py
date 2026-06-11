from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import CSV_FILE_PATH, CORS_ORIGINS
from app.database import engine, get_db
from app.models import Base, User, CustomerCluster
from app.schemas import UserCreate, Token, CustomerCreate
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.seeder import seed_data
from app.ai_routes import router as ai_router
from app.analytics_routes import router as analytics_ext_router

app = FastAPI(title="NexaBI Backend API Service")

cors_origins = CORS_ORIGINS
allow_credentials = True
if "*" in cors_origins:
    cors_origins = ["*"]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan AI Router
app.include_router(ai_router)
app.include_router(analytics_ext_router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_data(CSV_FILE_PATH)

# ENDPOINT AUTENTIKASI (USER MANAGEMENT)
@app.post("/api/auth/dev-login", tags=["Authentication"])
def dev_login(db: Session = Depends(get_db)):
    user = db.query(User).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Belum ada user")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED, tags=["Authentication"])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    print(f"Register attempt: username='{user_data.username}' password='{user_data.password}'")
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        print("Username already exists")
        raise HTTPException(status_code=400, detail="Username sudah terdaftar")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(username=user_data.username, hashed_password=hashed_pwd)
    db.add(new_user)
    db.commit()
    return {"message": "Registrasi pengguna berhasil"}

@app.post("/api/auth/login", response_model=Token, tags=["Authentication"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"Login attempt: username='{form_data.username}' password='{form_data.password}'")
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        print("User not found")
        raise HTTPException(status_code=400, detail="Username atau password salah")
    if not verify_password(form_data.password, user.hashed_password):
        print("Password mismatch")
        raise HTTPException(status_code=400, detail="Username atau password salah")
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# ENDPOINT DATA ANALYTICS (READ-ONLY OVERVIEW)
@app.get("/api/analytics/overview", tags=["Analytics Overview"])
def get_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total = db.query(CustomerCluster).count()
    c1 = db.query(CustomerCluster).filter(CustomerCluster.cluster == 1).count()
    c2 = db.query(CustomerCluster).filter(CustomerCluster.cluster == 2).count()
    avg_monetary = db.query(func.avg(CustomerCluster.monetary)).scalar() or 0
    
    return {
        "total_customers": total,
        "cluster_pasif_count": c1,
        "cluster_loyal_count": c2,
        "average_monetary": round(avg_monetary, 2)
    }

# ENDPOINT CRUD CUSTOMER CLUSTERS (DIPROTEKSI JWT)
@app.post("/api/customers", status_code=status.HTTP_201_CREATED, tags=["Customer CRUD"])
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_customer = db.query(CustomerCluster).filter(CustomerCluster.customer_id == customer_data.customer_id).first()
    if existing_customer:
        raise HTTPException(status_code=400, detail="Customer ID sudah ada di database")
        
    new_customer = CustomerCluster(**customer_data.model_dump())
    db.add(new_customer)
    db.commit()
    return {"message": "Data customer baru berhasil ditambahkan"}

@app.get("/api/customers", tags=["Customer CRUD"])
def get_all_customers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customers = db.query(CustomerCluster).all()
    result = []
    for c in customers:
        cluster_name = "Pelanggan Pasif" if c.cluster == 1 else "Pelanggan Loyal"
        result.append({
            "id": c.id,
            "customer_id": c.customer_id,
            "customer_name": c.customer_name,
            "segment": c.segment,
            "recency": c.recency,
            "frequency": c.frequency,
            "monetary": c.monetary,
            "cluster": c.cluster,
            "cluster_name": cluster_name,
            "coordinates": {"x": c.recency_scaled, "y": c.frequency_scaled, "z": c.monetary_scaled}
        })
    return result

@app.put("/api/customers/{customer_id}", tags=["Customer CRUD"])
def update_customer(customer_id: str, updated_data: CustomerCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = db.query(CustomerCluster).filter(CustomerCluster.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer tidak ditemukan")
    
    for key, value in updated_data.model_dump().items():
        setattr(customer, key, value)
        
    db.commit()
    return {"message": f"Data customer dengan ID {customer_id} berhasil diperbarui"}

@app.delete("/api/customers/{customer_id}", tags=["Customer CRUD"])
def delete_customer(customer_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    customer = db.query(CustomerCluster).filter(CustomerCluster.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer tidak ditemukan")
    
    db.delete(customer)
    db.commit()
    return {"message": f"Data customer dengan ID {customer_id} berhasil dihapus dari sistem"}