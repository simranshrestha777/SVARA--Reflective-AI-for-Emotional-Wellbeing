def analyze_safety(message: str):
    text = message.lower().strip()

    high_risk_phrases = [
        "kill myself",
        "end my life",
        "take my own life",
        "want to die",
        "going to die",
        "hurt myself",
        "harm myself",
        "suicide",
        "commit suicide",
        "don't want to live",
        "do not want to live",
    ]

    medium_risk_phrases = [
        "life is not worth living",
        "life isn't worth living",
        "can't take this anymore",
        "cannot take this anymore",
        "feel hopeless",
        "no reason to live",
        "nothing matters anymore",
    ]

    violence_phrases = [
        "kill someone",
        "hurt someone",
        "harm someone",
        "attack someone",
    ]

    for phrase in high_risk_phrases:
        if phrase in text:
            return {
                "risk_level": "high",
                "category": "self_harm",
                "matched_phrase": phrase,
            }

    for phrase in violence_phrases:
        if phrase in text:
            return {
                "risk_level": "high",
                "category": "violence",
                "matched_phrase": phrase,
            }

    for phrase in medium_risk_phrases:
        if phrase in text:
            return {
                "risk_level": "medium",
                "category": "emotional_distress",
                "matched_phrase": phrase,
            }

    return {
        "risk_level": "low",
        "category": None,
        "matched_phrase": None,
    }