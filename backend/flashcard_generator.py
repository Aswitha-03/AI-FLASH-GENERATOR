import re
import random

def split_into_sentences(text):
    return re.split(r'(?<=[.!?])\s+', text.strip())

def classify_difficulty(sentence):
    words = len(sentence.split())

    if words < 10:
        return "Easy"
    elif words > 20:
        return "Hard"
    else:
        return "Medium"

def extract_topic(sentence):
    keywords = [
        "ai",
        "machine",
        "learning",
        "data",
        "network",
        "database",
        "python",
        "algorithm"
    ]

    sentence = sentence.lower()

    for keyword in keywords:
        if keyword in sentence:
            return keyword

    return "general"

def generate_flashcards(text):
    sentences = split_into_sentences(text)
    flashcards = []

    for sentence in sentences:
        sentence = sentence.strip()

        if len(sentence) < 5:
            continue

        question = None

        if " stands for " in sentence:
            subject = sentence.split(" stands for ")[0].strip()
            question = f"What does {subject} stand for?"

        elif " refers to " in sentence:
            subject = sentence.split(" refers to ")[0].strip()
            question = f"What does {subject} refer to?"

        elif " is used for " in sentence:
            subject = sentence.split(" is used for ")[0].strip()
            question = f"What is {subject} used for?"

        elif " is responsible for " in sentence:
            subject = sentence.split(" is responsible for ")[0].strip()
            question = f"What is the role of {subject}?"

        elif " consists of " in sentence:
            subject = sentence.split(" consists of ")[0].strip()
            question = f"What does {subject} consist of?"

        elif " means " in sentence:
            subject = sentence.split(" means ")[0].strip()
            question = f"What does {subject} mean?"

        elif " defined as " in sentence:
            subject = sentence.split(" defined as ")[0].strip()
            question = f"How is {subject} defined?"

        elif " is " in sentence:
            subject = sentence.split(" is ")[0].strip()

            templates = [
                f"What is {subject}?",
                f"Define {subject}.",
                f"Explain {subject}.",
                f"What do you mean by {subject}?"
            ]

            question = random.choice(templates)

        elif " are " in sentence:
            subject = sentence.split(" are ")[0].strip()
            question = f"What are {subject}?"

        else:
            words = sentence.split()
            subject = " ".join(words[:3])
            question = f"Explain {subject}."

        flashcards.append({
            "question": question,
            "answer": sentence,
            "difficulty": classify_difficulty(sentence),
            "topic": extract_topic(sentence)
        })

    return flashcards