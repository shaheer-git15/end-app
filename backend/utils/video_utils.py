# utils/video_utils.py

import random

# Allowed phonemes for matching
ALLOWED_PHONEMES = ["ai", "c/k", "qu", "y", "z", "g", "s"]

def process_video(video_bytes: bytes, phoneme: str):
    """
    Processes video bytes and returns video score and most likely phoneme.
    Currently returns placeholder values until video AI model is fully integrated.
    
    Returns:
        (video_score: int, video_most_likely: str or None)
    """
    if phoneme not in ALLOWED_PHONEMES:
        raise ValueError(f"Phoneme '{phoneme}' not supported.")
    
    # Placeholder implementation - replace with actual video AI model
    score = random.randint(30, 95)
    most_likely = None
    
    # If score is low, suggest an alternative phoneme
    if score < 50:
        most_likely = random.choice([p for p in ALLOWED_PHONEMES if p != phoneme])
    
    return score, most_likely