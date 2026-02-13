import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import urllib.parse

# Import collection names from models
COLLECTION_ARCADES = "arcades"
COLLECTION_USERS = "users"
COLLECTION_MACHINES = "machines"
COLLECTION_CARDS = "cards"

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "arcade_db")

def get_safe_mongodb_url(url: str) -> str:
    if not url or "://" not in url:
        return url
    scheme, rest = url.split("://", 1)
    if "@" in rest:
        user_info_part, host_part = rest.rsplit("@", 1)
        if ":" in user_info_part:
            username, password = user_info_part.split(":", 1)
            return f"{scheme}://{urllib.parse.quote_plus(username)}:{urllib.parse.quote_plus(password)}@{host_part}"
    return url

async def seed_data():
    client = AsyncIOMotorClient(get_safe_mongodb_url(MONGODB_URL))
    db = client[DATABASE_NAME]

    print(f"Connecting to database: {DATABASE_NAME}...")

    # 1. Clear existing data (optional, but good for a clean start)
    # await db[COLLECTION_ARCADES].delete_many({})
    # await db[COLLECTION_MACHINES].delete_many({})
    # await db[COLLECTION_CARDS].delete_many({})

    # 2. Seed Arcades
    arcades = [
        {"id": "ARC_DLH_01", "name": "Nexus Arcade", "location": "Delhi"},
        {"id": "ARC_MUM_01", "name": "GameZone Mumbai", "location": "Mumbai"}
    ]
    await db[COLLECTION_ARCADES].insert_many(arcades)
    print("Inserted Arcades")

    # 3. Seed Machines
    machines = [
        {"id": "M-001", "name": "Street Fighter 6", "status": "ONLINE", "type": "Arcade", "arcade_id": "ARC_DLH_01", "revenueToday": 1200, "pricePerPlay": 50},
        {"id": "M-002", "name": "Mario Kart DX", "status": "BUSY", "type": "Racing", "arcade_id": "ARC_DLH_01", "revenueToday": 2400, "pricePerPlay": 100},
        {"id": "M-003", "name": "Air Hockey", "status": "OFFLINE", "type": "Sports", "arcade_id": "ARC_DLH_01", "revenueToday": 450, "pricePerPlay": 80},
        {"id": "M-004", "name": "Claw Machine", "status": "MAINTENANCE", "type": "Prize", "arcade_id": "ARC_MUM_01", "revenueToday": 0, "pricePerPlay": 150}
    ]
    await db[COLLECTION_MACHINES].insert_many(machines)
    print("Inserted Machines")

    # 4. Seed Cards
    cards = [
        {"card_id": "CARD-8832", "balance": 450.0, "status": "ACTIVE", "arcade_id": "ARC_DLH_01", "issued_to": "Guest #8832"},
        {"card_id": "CARD-9941", "balance": 1200.0, "status": "ACTIVE", "arcade_id": "ARC_DLH_01", "issued_to": "Guest #9941"},
        {"card_id": "CARD-1223", "balance": 0.0, "status": "BLOCKED", "arcade_id": "ARC_DLH_01", "issued_to": "Reported Lost"}
    ]
    await db[COLLECTION_CARDS].insert_many(cards)
    print("Inserted Cards")

    print("Database seeding completed successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
