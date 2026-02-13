from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import our local modules
from . import models, security, database
from .database import get_db
from .routers import admin, manager, operations

app = FastAPI(
    title="Secure RFID Arcade Management System",
    description="A multi-tenant system for managing arcade branches, managers, and RFID cards.",
    version="2.0.0"
)

# --- STARTUP EVENT ---
@app.on_event("startup")
async def startup_event():
    db = await database.get_db()
    # Check if any admin exists
    admin_user = await db[models.COLLECTION_USERS].find_one({"role": "admin"})
    if not admin_user:
        hashed_pwd = security.get_password_hash("admin123")
        await db[models.COLLECTION_USERS].insert_one({
            "username": "admin",
            "hashed_password": hashed_pwd,
            "role": "admin"
        })
        print("Default admin user created: admin / admin123")

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # More permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INCLUDE ROUTERS ---
# This connects all the files you created in the 'routers' folder
app.include_router(admin.router)
app.include_router(manager.router)
app.include_router(operations.router)

# --- THE LOGIN ROUTE ---
@app.post("/token", tags=["Authentication"])
async def login_for_access_token(
    db = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    The entry point for Managers and Admins. 
    Verifies credentials and returns a JWT Access Token.
    """
    # 1. Look for the user in the database
    user = await db[models.COLLECTION_USERS].find_one({"username": form_data.username})
    
    # 2. Check password security
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Create the token with user identity, role, and arcade_id
    access_token = security.create_access_token(
        data={
            "sub": user["username"], 
            "role": user["role"], 
            "arcade_id": user.get("arcade_id")
        }
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi import Response

@app.api_route("/health", methods=["GET", "HEAD"])
def health(response: Response):
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Secure RFID Arcade API",
        "docs": "/docs",
        "health": "/health"
    }


