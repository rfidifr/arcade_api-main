import os
import urllib.parse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
if not MONGODB_URL:
    print("WARNING: MONGODB_URL not found in environment variables!")
DATABASE_NAME = os.getenv("DATABASE_NAME", "arcade_db")

# Function to handle special characters in MongoDB URL
def get_safe_mongodb_url(url: str) -> str:
    if not url or "://" not in url:
        return url
    
    # Split scheme from the rest
    scheme, rest = url.split("://", 1)
    
    # Check if there is user info (contains @ and :)
    if "@" in rest:
        user_info_part, host_part = rest.rsplit("@", 1)
        if ":" in user_info_part:
            username, password = user_info_part.split(":", 1)
            # Quote username and password to handle special characters like '@'
            safe_username = urllib.parse.quote_plus(username)
            safe_password = urllib.parse.quote_plus(password)
            return f"{scheme}://{safe_username}:{safe_password}@{host_part}"
            
    return url

# Use the safe URL for connection
client = AsyncIOMotorClient(get_safe_mongodb_url(MONGODB_URL))
db = client[DATABASE_NAME]

async def get_db():
    return db
