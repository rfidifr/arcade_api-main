from fastapi import APIRouter, Depends, HTTPException, status
from .. import models, schemas, database
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/ops",
    tags=["Machine Operations"]
)

# 1. THE PUNCH: Deduct money and log the game
@router.post("/punch")
async def punch_card(
    data: schemas.PunchRequest, 
    db = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    arcade_id = current_user.get("arcade_id")
    
    # 1. Find the card (must be in the same arcade as the manager/machine)
    card = await db[models.COLLECTION_CARDS].find_one({
        "card_id": data.card_id,
        "arcade_id": arcade_id
    })

    # 2. Find the machine
    machine = await db[models.COLLECTION_MACHINES].find_one({
        "id": data.machine_id,
        "arcade_id": arcade_id
    })

    if not card:
        raise HTTPException(status_code=404, detail="Card not found in this arcade")
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found in this arcade")

    # 3. Check Balance
    if card["balance"] < machine["cost_per_play"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Insufficient balance. Cost: {machine['cost_per_play']}, Balance: {card['balance']}"
        )

    # 4. Process Transaction
    new_balance = card["balance"] - machine["cost_per_play"]
    await db[models.COLLECTION_CARDS].update_one(
        {"card_id": card["card_id"]},
        {"$set": {"balance": new_balance}}
    )
    
    # 5. Create the "Paper Trail" (History)
    from datetime import datetime
    tx = {
        "card_id": card["card_id"],
        "machine_id": machine["id"],
        "amount": machine["cost_per_play"],
        "type": "PUNCH",
        "terminal": machine["name"],
        "status": "SUCCESS",
        "timestamp": datetime.utcnow(),
        "arcade_id": arcade_id
    }
    
    await db[models.COLLECTION_TRANSACTIONS].insert_one(tx)
    
    return {
        "status": "success", 
        "game": machine["name"], 
        "remaining_balance": new_balance
    }

# 2. QUICK VIEW: Check card balance (Used by customer kiosks)
@router.get("/card-status/{card_id}")
async def get_card_status(
    card_id: str, 
    db = Depends(database.get_db),
    current_user = Depends(get_current_user)
):
    card = await db[models.COLLECTION_CARDS].find_one({
        "card_id": card_id,
        "arcade_id": current_user.get("arcade_id")
    })

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    return {
        "owner": card["owner_name"],
        "balance": card["balance"]
    }