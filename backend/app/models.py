# MongoDB models are usually just schemas or simple classes in FastAPI
# Since we are moving away from SQLAlchemy, we will use these for logic if needed,
# but mostly we will rely on Pydantic schemas for data validation.

# Collection names
COLLECTION_ARCADES = "arcades"
COLLECTION_USERS = "users"
COLLECTION_MACHINES = "machines"
COLLECTION_CARDS = "cards"
COLLECTION_TRANSACTIONS = "transactions"
COLLECTION_LOGS = "logs"
