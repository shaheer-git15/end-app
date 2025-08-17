# from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# import traceback

# # Import updated utils
# from utils.audio_utils import analyze_audio
# from utils.video_utils import process_video

# app = FastAPI(title="Phonics Backend", version="2.0.0")

# # CORS (currently open; restrict in production)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/health")
# def health():
#     return {"status": "ok"}

# @app.post("/grade")
# async def grade_pronunciation(
#     video: UploadFile = File(...),
#     phoneme: str = Form(...),
# ):
#     """
#     Accepts:
#     - video: file (mp4/mov)
#     - phoneme: e.g., "ai", "y", "z"
    
#     Returns:
#     {
#         "selected_phoneme": "y",
#         "audio_score": 42,
#         "audio_most_likely": "z",
#         "video_score": 75
#     }
#     """
#     if not phoneme or not phoneme.strip():
#         raise HTTPException(status_code=400, detail="Missing 'phoneme'.")

#     # Read the uploaded file into memory
#     try:
#         video_bytes = await video.read()
#         if not video_bytes:
#             raise ValueError("Empty upload.")
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

#     try:
#         # AUDIO processing
#         audio_result = analyze_audio(video_bytes, phoneme)
#         audio_score = audio_result["audio_score"]
#         audio_most_likely = audio_result.get("audio_most_likely")
        
#         # VIDEO processing
#         video_score, video_most_likely = process_video(video_bytes, phoneme)
        
#     except FileNotFoundError as fe:
#         raise HTTPException(status_code=422, detail=str(fe))
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

#     # Build response according to your rule
#     result = {
#         "selected_phoneme": phoneme,
#         "audio_score": int(audio_score),
#         "video_score": int(video_score)
#     }
    
#     if audio_score < 50 and audio_most_likely:
#         result["audio_most_likely"] = audio_most_likely
        
#     if video_score < 50 and video_most_likely:
#         result["video_most_likely"] = video_most_likely

#     return result












# main.py
import os
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import requests  # used only for model download

app = FastAPI(title="Phonics Backend", version="2.0.0")

# CORS (currently open; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model config
MODEL_DIR = os.getenv("MODEL_DIR", "models")
MODEL_FILENAME = os.getenv("MODEL_FILENAME", "best_model.pth")
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)
MODEL_URL = os.getenv("MODEL_URL")  # <-- set this in Railway variables or locally for testing

# Placeholders to be bound at startup after model download
analyze_audio = None
process_video = None

def download_model_if_needed():
    """
    Download model from MODEL_URL if not already present.
    This is intentionally simple and prints progress. For very large models,
    you may want to add retry/backoff logic or perform chunked verification.
    """
    if os.path.exists(MODEL_PATH):
        print(f"[startup] Model already exists at {MODEL_PATH}")
        return

    if not MODEL_URL:
        print("[startup] MODEL_URL not provided; skipping download (ensure model is available in container).")
        return

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    print(f"[startup] Downloading model from {MODEL_URL} to {MODEL_PATH} ...")
    try:
        with requests.get(MODEL_URL, stream=True, timeout=60) as r:
            r.raise_for_status()
            total = r.headers.get("content-length")
            if total is None:
                # no content length header
                with open(MODEL_PATH, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
            else:
                total = int(total)
                downloaded = 0
                with open(MODEL_PATH, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            # simple progress print every ~5MB
                            if downloaded % (5 * 1024 * 1024) < len(chunk):
                                print(f"[startup] Downloaded {downloaded}/{total} bytes")
        print("[startup] Model download completed.")
    except Exception as e:
        # Clean up partial download
        if os.path.exists(MODEL_PATH):
            try:
                os.remove(MODEL_PATH)
            except Exception:
                pass
        raise RuntimeError(f"Failed to download model from MODEL_URL: {e}") from e

@app.on_event("startup")
def startup_event():
    """
    Startup event:
    - ensure model file exists (download if MODEL_URL provided)
    - lazy-import heavy utils and bind analyze_audio, process_video
    """
    # 1) Download model if MODEL_URL provided and model not present
    try:
        download_model_if_needed()
    except Exception as e:
        # If model download fails, we still start server but log the error.
        # You may instead want to raise here to prevent the app from starting.
        print(f"[startup] WARNING: model download failed: {e}")
        # Optionally, uncomment the next line to abort startup if model is required:
        # raise

    # 2) Lazy import utils after model is present (avoids importing heavy libraries too early)
    global analyze_audio, process_video
    try:
        from utils.audio_utils import analyze_audio as _analyze_audio
        from utils.video_utils import process_video as _process_video
        analyze_audio = _analyze_audio
        process_video = _process_video
        print("[startup] Successfully imported utils.audio_utils and utils.video_utils")
    except Exception as imp_err:
        # Import failed — log traceback
        print("[startup] Failed to import utils modules. Traceback follows:")
        traceback.print_exc()
        # Keep analyze_audio/process_video as None; endpoint will handle if they are not available.

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/grade")
async def grade_pronunciation(
    video: UploadFile = File(...),
    phoneme: str = Form(...),
):
    """
    Accepts:
    - video: file (mp4/mov)
    - phoneme: e.g., "ai", "y", "z"

    Returns:
    {
        "selected_phoneme": "y",
        "audio_score": 42,
        "audio_most_likely": "z",
        "video_score": 75
    }
    """
    if not phoneme or not phoneme.strip():
        raise HTTPException(status_code=400, detail="Missing 'phoneme'.")

    # Ensure utils are available
    if analyze_audio is None or process_video is None:
        raise HTTPException(status_code=503, detail="Server not ready: processing utils not available. Check logs.")

    # Read the uploaded file into memory
    try:
        video_bytes = await video.read()
        if not video_bytes:
            raise ValueError("Empty upload.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    try:
        # AUDIO processing
        audio_result = analyze_audio(video_bytes, phoneme)
        audio_score = audio_result.get("audio_score", 0)
        audio_most_likely = audio_result.get("audio_most_likely")

        # VIDEO processing
        video_score, video_most_likely = process_video(video_bytes, phoneme)

    except FileNotFoundError as fe:
        raise HTTPException(status_code=422, detail=str(fe))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    # Build response according to your rule
    result = {
        "selected_phoneme": phoneme,
        "audio_score": int(audio_score),
        "video_score": int(video_score)
    }

    if audio_score < 50 and audio_most_likely:
        result["audio_most_likely"] = audio_most_likely

    if video_score < 50 and video_most_likely:
        result["video_most_likely"] = video_most_likely

    return result
