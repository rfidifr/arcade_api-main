from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- CARD SCHEMAS ---
class CardBase(BaseModel):
    card_id: str = Field(..., min_length=4, max_length=16) # More flexible ID length
    owner_name: str
    contact_no: Optional[str] = "0000000000" # Optional with default

class CardCreate(CardBase):
    pass

class CardResponse(CardBase):
    balance: float
    arcade_id: Optional[str] = "SYSTEM"

    class Config:
        from_attributes = True

# --- TRANSACTION SCHEMAS ---
class RechargeRequest(BaseModel):
    card_id: str
    amount: float = Field(..., gt=0) # Must be greater than 0

class PunchRequest(BaseModel):
    card_id: str
    machine_id: str

# --- USER & AUTH SCHEMAS ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    arcade_id: Optional[str] = None

class RefundRequest(BaseModel):
    card_id: str
    reason: Optional[str] = "Customer request"    

class MachineCreate(BaseModel):
    id:str
    name:str
    cost_per_play:float

class MachineResponse(BaseModel):
    id: str
    name: str
    cost_per_play: float
    arcade_id: str
