from pymongo import MongoClient

client = MongoClient(
    "mongodb+srv://aswithabalu03102006_db_user:aswi_0330@cluster0.cut4o6a.mongodb.net/?retryWrites=true&w=majority"
)

client.admin.command('ping')
print("✅ MongoDB Atlas Connected")

db = client["studymate"]
users_collection = db["users"]
flashcards_collection = db["flashcards"]
quiz_collection = db["quizzes"]
recommendation_collection = db["recommendations"]