from fastapi import APIRouter, Depends, HTTPException, status
from .. import models, schemas, security, database
from ..dependencies import verify_admin
from ..dependencies import get_current_user
from ..security import create_secretkey

router = APIRouter(
    prefix="/admin",
    tags=["Administrator Only"]
)

@router.post("/create-arcade", status_code=status.HTTP_201_CREATED)
async def create_arcade(
    name: str, 
    location: str, 
    db = Depends(database.get_db), 
    _ = Depends(verify_admin)
):
    # Generate a simple ID or use a UUID
    arcade_id = f"ARC_{name[:3].upper()}_{location[:2].upper()}"
    new_arcade = {
        "id": arcade_id, 
        "name": name, 
        "location": location
    }
    
    await db[models.COLLECTION_ARCADES].insert_one(new_arcade)
    # Convert _id to string for JSON serialization
    new_arcade["_id"] = str(new_arcade["_id"])
    return {"message": "Arcade created", "arcade": new_arcade}

@router.post("/create-manager", status_code=status.HTTP_201_CREATED)
async def create_manager(
    username: str, 
    password: str, 
    arcade_id: str, 
    db = Depends(database.get_db), 
    _ = Depends(verify_admin)
):
    # Check if arcade exists
    arcade = await db[models.COLLECTION_ARCADES].find_one({"id": arcade_id})
    if not arcade:
        raise HTTPException(status_code=404, detail="Arcade ID not found")

    # Hash the password for security
    hashed_pwd = security.get_password_hash(password)
    new_user = {
        "username": username, 
        "hashed_password": hashed_pwd, 
        "role": "manager", 
        "arcade_id": arcade_id
    }
    
    await db[models.COLLECTION_USERS].insert_one(new_user)
    return {"message": f"Manager {username} created for arcade {arcade_id}"}

@router.post("/new_machine", response_model=schemas.MachineResponse)
async def new_machine(
    machine_data: schemas.MachineCreate,
    secret_key: str= Depends(create_secretkey),
    db= Depends(database.get_db),
    current_user=Depends(get_current_user)
):
    # Security: Only manager and administrator can create machines
    if current_user.get("role") not in ["manager",'admin']:
        raise HTTPException(status_code=403, detail="Permission denied")

    # Create new machine linked to manage's arcade
    arcade_id = current_user.get("arcade_id") or "SYSTEM_ARCADE"
    new_machine_dict = {
        **machine_data.model_dump(),
        "arcade_id":arcade_id,
        "secret_key": secret_key,
        "status": "ACTIVE",
        #"created_at": datetime.utcnow()
    }
    print(new_machine_dict)
    await db[models.COLLECTION_CARDS].insert_one(new_machine_dict)
    
    # Log the creation
    log = {
        "type": "INFO",
        "message": f"New machine registered: {machine_data.id}",
        "source": "Manager Ops",
       # "timestamp": datetime.utcnow(),
        "arcade_id": arcade_id
    }
    await db[models.COLLECTION_LOGS].insert_one(log)
    
    return new_machine_dict
