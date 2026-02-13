from fastapi import APIRouter, Depends, HTTPException
from .. import models, schemas, database
from ..dependencies import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/manager",
    tags=["Manager Operations"]
)

@router.post("/create-card", response_model=schemas.CardResponse)
async def create_card(
    card_data: schemas.CardCreate, 
    db = Depends(database.get_db), 
    current_user = Depends(get_current_user)
):
    # Security: Ensure only a manager/admin can do this
    if current_user.get("role") not in ["manager", "administrator", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    arcade_id = current_user.get("arcade_id") or "SYSTEM_ARCADE"

    # 1. Check if card already exists in this arcade
    existing_card = await db[models.COLLECTION_CARDS].find_one({
        "card_id": card_data.card_id,
        "arcade_id": arcade_id
    })
    if existing_card:
        raise HTTPException(status_code=400, detail=f"Card {card_data.card_id} already exists in this arcade")

    # 2. Create card and link it to the manager's arcade automatically
    new_card_dict = {
        **card_data.model_dump(),
        "arcade_id": arcade_id,
        "balance": 0.0,
        "status": "ACTIVE",
        "created_at": datetime.utcnow()
    }
    
    await db[models.COLLECTION_CARDS].insert_one(new_card_dict)
    
    # Log the creation
    log = {
        "type": "INFO",
        "message": f"New card registered: {card_data.card_id}",
        "source": "Manager Ops",
        "timestamp": datetime.utcnow(),
        "arcade_id": arcade_id
    }
    await db[models.COLLECTION_LOGS].insert_one(log)
    
    return new_card_dict

@router.put("/recharge")
async def recharge_card(
    data: schemas.RechargeRequest, 
    db = Depends(database.get_db), 
    current_user = Depends(get_current_user)
):
    # Security: Ensure only a manager/admin can do this
    if current_user.get("role") not in ["manager", "administrator", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    # Filter by arcade_id if manager, otherwise allow all for admin
    query = {"card_id": data.card_id}
    if current_user.get("role") == "manager":
        query["arcade_id"] = current_user.get("arcade_id")

    card = await db[models.COLLECTION_CARDS].find_one(query)

    if not card:
        raise HTTPException(status_code=404, detail="Card not found or not in your arcade")

    arcade_id = card.get("arcade_id") or "SYSTEM_ARCADE"
    new_balance = card["balance"] + data.amount
    await db[models.COLLECTION_CARDS].update_one(
        {"card_id": card["card_id"]},
        {"$set": {"balance": new_balance}}
    )
    
    # Log the history (Transaction)
    tx = {
        "card_id": card["card_id"], 
        "amount": data.amount,
        "type": "CREDIT",
        "terminal": "Manager Panel",
        "status": "SUCCESS",
        "timestamp": datetime.utcnow(),
        "arcade_id": arcade_id
    }
    await db[models.COLLECTION_TRANSACTIONS].insert_one(tx)
    
    # Log for System Logs
    log = {
        "type": "INFO",
        "message": f"Card {data.card_id} recharged with {data.amount}",
        "source": "Manager Ops",
        "timestamp": datetime.utcnow(),
        "arcade_id": arcade_id
    }
    await db[models.COLLECTION_LOGS].insert_one(log)
    
    return {"message": "Recharge successful", "new_balance": new_balance}

@router.put("/refund")
async def refund_card(
    data: schemas.RefundRequest, 
    db = Depends(database.get_db), 
    current_user = Depends(get_current_user)
):
    # Security: Ensure only a manager/admin can do this
    if current_user.get("role") not in ["manager", "administrator", "admin"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    # Filter by arcade_id if manager, otherwise allow all for admin
    query = {"card_id": data.card_id}
    if current_user.get("role") == "manager":
        query["arcade_id"] = current_user.get("arcade_id")

    card = await db[models.COLLECTION_CARDS].find_one(query)

    if not card:
        raise HTTPException(
            status_code=404, 
            detail="Card not found or does not belong to your arcade"
        )

    arcade_id = card.get("arcade_id") or "SYSTEM_ARCADE"
    refund_amount = card["balance"]
    
    # 2. Reset balance
    await db[models.COLLECTION_CARDS].update_one(
        {"card_id": card["card_id"]},
        {"$set": {"balance": 0.0}}
    )

    # 3. Log the transaction
    refund_log = {
        "card_id": card["card_id"], 
        "amount": refund_amount,
        "type": "DEBIT",
        "terminal": "Manager Panel",
        "status": "SUCCESS",
        "timestamp": datetime.utcnow(),
        "arcade_id": arcade_id
    }
    
    await db[models.COLLECTION_TRANSACTIONS].insert_one(refund_log)
    
    # Also add to System Logs
    log = {
        "type": "INFO",
        "message": f"Refund processed for card {data.card_id}. Amount: {refund_amount}",
        "source": "Manager Ops",
        "timestamp": datetime.utcnow(),
        "arcade_id": arcade_id
    }
    await db[models.COLLECTION_LOGS].insert_one(log)

    return {
        "message": "Refund processed successfully",
        "card_id": card["card_id"],
        "refunded_amount": refund_amount,
        "new_balance": 0.0
    }

@router.get("/machines")
async def get_machines(
    db = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    # If admin, show all machines. If manager, show only their arcade machines.
    query = {}
    if current_user.get("role") == "manager":
        query["arcade_id"] = current_user.get("arcade_id")
    
    cursor = db[models.COLLECTION_MACHINES].find(query)
    machines = await cursor.to_list(length=100)
    
    # Convert _id to string for each machine
    for m in machines:
        m["_id"] = str(m["_id"])
        
    return machines

@router.get("/cards")
async def get_cards(
    db = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    query = {}
    if current_user.get("role") == "manager":
        query["arcade_id"] = current_user.get("arcade_id")
        
    cursor = db[models.COLLECTION_CARDS].find(query)
    cards = await cursor.to_list(length=100)
    
    for c in cards:
        c["_id"] = str(c["_id"])
        if "card_id" in c:
            c["id"] = c["card_id"]
        if "issued_to" in c:
            c["issuedTo"] = c["issued_to"]
            
    return cards

@router.get("/logs")
async def get_logs(
    db = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    query = {}
    if current_user.get("role") == "manager":
        query["arcade_id"] = current_user.get("arcade_id")
    
    # Sort by timestamp descending
    cursor = db[models.COLLECTION_LOGS].find(query).sort("timestamp", -1)
    logs = await cursor.to_list(length=100)
    
    for l in logs:
        l["_id"] = str(l["_id"])
        l["id"] = l["_id"]
        if "timestamp" in l and isinstance(l["timestamp"], datetime):
            l["time"] = l["timestamp"].strftime("%H:%M:%S")
        elif "timestamp" in l:
            l["time"] = str(l["timestamp"])
    return logs

@router.get("/transactions")
async def get_transactions(
    db = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    query = {}
    if current_user.get("role") == "manager":
        query["arcade_id"] = current_user.get("arcade_id")
        
    cursor = db[models.COLLECTION_TRANSACTIONS].find(query).sort("timestamp", -1)
    txs = await cursor.to_list(length=100)
    
    for t in txs:
        t["_id"] = str(t["_id"])
        t["id"] = t["_id"]
        if "card_id" in t:
            t["cardId"] = t["card_id"]
        if "timestamp" in t and isinstance(t["timestamp"], datetime):
            t["time"] = t["timestamp"].strftime("%H:%M:%S")
        elif "timestamp" in t:
            t["time"] = str(t["timestamp"])
            
    return txs