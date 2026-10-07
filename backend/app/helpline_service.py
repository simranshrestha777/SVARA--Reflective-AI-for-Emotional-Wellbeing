CRISIS_RESOURCES = {
    "nepal": {
        "country": "Nepal",
        "helplines": [
            {
                "name": "National Suicide Prevention Helpline",
                "number": "1166",
                "type": "call",
                "description": (
                    "National suicide prevention and crisis support."
                ),
            }
        ],
        "emergency_message": (
            "If you are in immediate danger, contact local emergency "
            "services or go to the nearest hospital."
        ),
    },

    "united states": {
        "country": "United States",
        "helplines": [
            {
                "name": "988 Suicide & Crisis Lifeline",
                "number": "988",
                "type": "call_or_text",
                "description": (
                    "Call or text 988 for crisis support."
                ),
            }
        ],
        "emergency_message": (
            "If you are in immediate danger, call 911 or go to "
            "the nearest emergency department."
        ),
    },

    "usa": {
        "country": "United States",
        "helplines": [
            {
                "name": "988 Suicide & Crisis Lifeline",
                "number": "988",
                "type": "call_or_text",
                "description": (
                    "Call or text 988 for crisis support."
                ),
            }
        ],
        "emergency_message": (
            "If you are in immediate danger, call 911 or go to "
            "the nearest emergency department."
        ),
    },

    "canada": {
        "country": "Canada",
        "helplines": [
            {
                "name": "Talk Suicide Canada / 988",
                "number": "988",
                "type": "call_or_text",
                "description": (
                    "Call or text 988 for suicide crisis support."
                ),
            }
        ],
        "emergency_message": (
            "If you are in immediate danger, call 911 or go to "
            "the nearest emergency department."
        ),
    },

    "australia": {
        "country": "Australia",
        "helplines": [
            {
                "name": "Lifeline",
                "number": "13 11 14",
                "type": "call",
                "description": (
                    "Free, confidential crisis support available 24/7."
                ),
            }
        ],
        "emergency_message": (
            "If life is in danger, call 000."
        ),
    },

    "new zealand": {
        "country": "New Zealand",
        "helplines": [
            {
                "name": "1737 Need to Talk?",
                "number": "1737",
                "type": "call_or_text",
                "description": (
                    "Free call or text any time for support from "
                    "a trained counsellor."
                ),
            }
        ],
        "emergency_message": (
            "If you are in immediate danger, call 111."
        ),
    },

    "singapore": {
        "country": "Singapore",
        "helplines": [
            {
                "name": "Samaritans of Singapore",
                "number": "1767",
                "type": "call",
                "description": (
                    "24/7 suicide crisis support."
                ),
            },
            {
                "name": "national mindline",
                "number": "1771",
                "type": "call",
                "description": (
                    "24/7 mental health support."
                ),
            },
        ],
        "emergency_message": (
            "If there is immediate danger to life or safety, "
            "contact emergency services or go to a hospital."
        ),
    },

    "japan": {
        "country": "Japan",
        "helplines": [
            {
                "name": "#Inochi SOS",
                "number": "0120-061-338",
                "type": "call",
                "description": (
                    "Suicide prevention consultation service."
                ),
            }
        ],
        "emergency_message": (
            "If you are in immediate danger, contact local emergency "
            "services or go to the nearest emergency department."
        ),
    },
}


def get_crisis_resources(country: str | None):

    country_name = (
        country.lower().strip()
        if country
        else ""
    )

    resources = CRISIS_RESOURCES.get(country_name)

    if resources:
        return resources

    return {
        "country": country,
        "helplines": [],
        "emergency_message": (
            "If you may be in immediate danger, please contact "
            "your local emergency services or go to the nearest "
            "hospital. You can also use a reputable international "
            "crisis-resource directory to find support in your area."
        ),
    }