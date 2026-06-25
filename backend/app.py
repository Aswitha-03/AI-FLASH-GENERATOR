from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from bcrypt import hashpw, gensalt, checkpw

from flashcard_generator import generate_flashcards
from quiz_generator import generate_quiz
from recommendation_engine import analyze_performance

from db import (
    users_collection,
    flashcards_collection,
    quiz_collection,
    recommendation_collection
)

app = Flask(__name__)
CORS(app)


# =========================
# SIGNUP
# =========================
@app.route('/signup', methods=['POST'])
def signup():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    existing_user = users_collection.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "message": "Email already exists"
        }), 400

    hashed_password = hashpw(
        password.encode(),
        gensalt()
    ).decode()

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.now()
    })

    return jsonify({
        "message": "Signup Successful"
    })


# =========================
# LOGIN
# =========================
@app.route('/login', methods=['POST'])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if checkpw(
        password.encode(),
        user["password"].encode()
    ):

        return jsonify({
            "message": "Login Successful",
            "email": email
        })

    return jsonify({
        "message": "Invalid Password"
    }), 401


# =========================
# GENERATE FLASHCARDS
# =========================
@app.route('/generate', methods=['POST'])
def generate():

    data = request.json

    text = data.get("text", "")
    email = data.get("email")

    flashcards = generate_flashcards(text)

    flashcards_collection.insert_one({
        "user_email": email,
        "input_text": text,
        "flashcards": flashcards,
        "status": "not_known",
        "created_at": datetime.now()
    })

    return jsonify({
        "flashcards": flashcards
    })


# =========================
# QUIZ
# =========================
@app.route('/quiz', methods=['POST'])
def quiz():

    data = request.json

    flashcards = data.get("flashcards", [])

    quiz_data = generate_quiz(flashcards)

    quiz_collection.insert_one({
        "quiz": quiz_data,
        "created_at": datetime.now()
    })

    return jsonify({
        "quiz": quiz_data
    })


# =========================
# RECOMMENDATION
# =========================
@app.route('/recommend', methods=['POST'])
def recommend():

    data = request.json

    incorrect_cards = data.get(
        "incorrect_cards",
        []
    )

    weak_topics, recommendations = (
        analyze_performance(
            incorrect_cards
        )
    )

    recommendation_collection.insert_one({
        "incorrect_cards": incorrect_cards,
        "weak_topics": weak_topics,
        "recommendations": recommendations,
        "created_at": datetime.now()
    })

    return jsonify({
        "weak_topics": weak_topics,
        "recommendations": recommendations
    })


# =========================
# USER HISTORY
# =========================
@app.route('/history/<email>', methods=['GET'])
def history(email):

    history_data = []

    records = flashcards_collection.find(
        {"user_email": email},
        {"_id": 0}
    )

    for item in records:
        history_data.append(item)

    return jsonify(history_data)


# =========================
# DASHBOARD
# =========================
@app.route('/dashboard/<email>', methods=['GET'])
def dashboard(email):

    total_flashcards = (
        flashcards_collection.count_documents(
            {"user_email": email}
        )
    )

    total_quizzes = (
        quiz_collection.count_documents({})
    )

    total_recommendations = (
        recommendation_collection.count_documents({})
    )

    return jsonify({
        "total_flashcards": total_flashcards,
        "total_quizzes": total_quizzes,
        "total_recommendations": total_recommendations
    })


# =========================
# UPDATE STATUS
# =========================
@app.route('/update-status', methods=['POST'])
def update_status():

    data = request.json

    email = data.get("email")
    input_text = data.get("input_text")
    status = data.get("status")

    flashcards_collection.update_one(
        {
            "user_email": email,
            "input_text": input_text
        },
        {
            "$set": {
                "status": status
            }
        }
    )

    return jsonify({
        "message": "Status Updated"
    })


# =========================
# REVIEW
# =========================
@app.route('/review/<email>', methods=['GET'])
def review(email):

    cards = list(
        flashcards_collection.find(
            {"user_email": email},
            {"_id": 0}
        )
    )

    cards.sort(
        key=lambda x:
        0 if x.get(
            "status"
        ) == "not_known"
        else 1
    )

    return jsonify(cards)


if __name__ == '__main__':
    app.run(debug=True)