import random

def generate_quiz(flashcards):
    quiz = []

    for i, card in enumerate(flashcards):
        correct = card["answer"]

        # fake distractors
        distractors = [
            "Not related concept",
            "Incorrect definition",
            "Partially correct idea",
            "Opposite meaning"
        ]

        options = random.sample(distractors, 3) + [correct]
        random.shuffle(options)

        quiz.append({
            "id": i,
            "question": card["question"],
            "options": options,
            "correct_answer": correct,
            "difficulty": card.get("difficulty", "Easy")
        })

    return quiz