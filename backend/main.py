from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from bson import ObjectId

app = FastAPI(title="Farmer Market Backend")

# Enable CORS so the frontend can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["farmer_market_db"]

class ProduceItem(BaseModel):
    crop_name: str
    category: str
    quantity_kg: float
    price_per_kg: float
    farmer_name: str
    location: str

@app.get("/")
def home():
    return {"message": "Farmer to Market Backend is running"}

@app.get("/api/produce")
async def get_produce():
    items = []
    async for doc in db["produce_listings"].find():
        items.append({
            "id": str(doc["_id"]),
            "crop_name": doc.get("crop_name"),
            "category": doc.get("category"),
            "quantity_kg": doc.get("quantity_kg"),
            "price_per_kg": doc.get("price_per_kg"),
            "farmer_name": doc.get("farmer_name"),
            "location": doc.get("location"),
            "status": doc.get("status", "Available")
        })
    return items

@app.post("/api/produce")
async def add_produce(item: ProduceItem):
    data = item.model_dump()
    data["status"] = "Available"
    result = await db["produce_listings"].insert_one(data)
    return {"id": str(result.inserted_id), "message": "Produce listed successfully"}

@app.get("/api/analytics/summary")
async def get_analytics():
    # 1. Category-level MongoDB aggregation pipeline
    pipeline = [
        {
            "$group": {
                "_id": "$category",
                "category": {"$first": "$category"},
                "avg_price": {"$avg": "$price_per_kg"},
                "total_quantity": {"$sum": "$quantity_kg"},
                "count": {"$sum": 1}
            }
        }
    ]
    cursor = db["produce_listings"].aggregate(pipeline)
    category_summary = await cursor.to_list(length=100)

    # 2. Overall calculations for cards & middleman comparison
    all_prices = []
    total_qty = 0
    async for doc in db["produce_listings"].find():
        if "price_per_kg" in doc and doc["price_per_kg"] is not None:
            all_prices.append(float(doc["price_per_kg"]))
        if "quantity_kg" in doc and doc["quantity_kg"] is not None:
            total_qty += float(doc["quantity_kg"])

    avg_farmer_price = round(sum(all_prices) / len(all_prices), 2) if all_prices else 0.0
    traditional_margin = round(avg_farmer_price * 0.25, 2)  # 25% middleman margin markup

    return {
        "categories": category_summary,
        "average_price": avg_farmer_price,
        "avg_price": avg_farmer_price,
        "farmer_earns_directly": avg_farmer_price,
        "traditional_mandi_margin": traditional_margin,
        "traditional_margin": traditional_margin,
        "total_stock_kg": total_qty
    }