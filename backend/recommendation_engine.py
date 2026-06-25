def analyze_performance(incorrect_cards):
    topic_count = {}
    weak_topics = []
    recommendations = []

    for card in incorrect_cards:
        topic = card.get("topic", "general")
        topic_count[topic] = topic_count.get(topic, 0) + 1

    sorted_topics = sorted(topic_count.items(), key=lambda x: x[1], reverse=True)

    for topic, count in sorted_topics:
        weak_topics.append(topic)
        recommendations.append(f"Revise {topic} concepts and practice more questions.")

    if not weak_topics:
        recommendations.append("Great job! Keep practicing regularly.")

    return weak_topics, recommendations