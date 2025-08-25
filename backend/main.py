# from fastapi import FastAPI, UploadFile, File, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# import torch
# import torch.nn.functional as F
# import numpy as np
# import os
# import warnings
# from sklearn.preprocessing import LabelEncoder

# # Suppress sklearn version warnings
# warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

# from ai_models.audio_model.sound_model import PhonemeClassifier, Config
# from ai_models.audio_model.feature_extractor import WhisperFeatureExtractor,seed_everything
# from ai_models.audio_model.accuracy import grade_pronunciation_calibrated
# from ai_models.audio_model.extract import process_single_video
# from ai_models.video_model.reference_comparison import load_video_model
# from ai_models.video_model.reference_comparison import remove_audio, get_video_accuracy

# # ==== Initialize FastAPI ====
# app = FastAPI()

# # ==== Add CORS middleware ====
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allows all origins
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows all methods
#     allow_headers=["*"],  # Allows all headers
# )

# # ==== Set seeds for reproducibility ====
# import random


# seed_everything(42)

# # ==== Load Feature Extractor ====
# feature_extractor = WhisperFeatureExtractor()

# video_model_path = 'ai_models/video_model/Groups_best_model.pth'
# video_model = load_video_model(video_model_path, Config.device)


# # ==== Load Model ====
# model_path = "ai_models/audio_model/best_model.pth"
# checkpoint = torch.load(model_path, map_location=Config.device,weights_only=False)
# label_encoder: LabelEncoder = checkpoint["label_encoder"]

# model = PhonemeClassifier(
#     input_dim=768,
#     num_classes=len(label_encoder.classes_),
#     config=Config
# ).to(Config.device)


# model.load_state_dict(checkpoint["model_state_dict"])
# model.eval()




# print(f"🚀 Model loaded with {len(label_encoder.classes_)} classes.")
# print(f"🔠 Classes: {label_encoder.classes_}")

# # ==== Helper prediction function ====
# def predict_single_audio(feature_tensor):
#     try:
#         # Normalize features
#         feature_tensor = (feature_tensor - feature_tensor.mean(0)) / (feature_tensor.std(0) + 1e-7)
#         features = feature_tensor.unsqueeze(0).to(Config.device)
#         lengths = torch.tensor([feature_tensor.shape[0]]).to(Config.device)

#         with torch.no_grad():
#             logits = model(features, lengths)
#             probs = F.softmax(logits, dim=1).cpu().numpy().squeeze()

#         top_idx = np.argmax(probs)
#         top_label = label_encoder.inverse_transform([top_idx])[0]
#         top_prob = float(probs[top_idx])

#         # Console output
#         print(f"\n🎙️ Predicted phoneme: **{top_label}** with probability: {top_prob:.4f}")
        

#         return top_label

#     except Exception as e:
#         print(f"❌ Inference failed: {e}")
#         return None

# # ==== API Endpoint ====
# @app.post("/predict/")
# async def predict_audio(file: UploadFile = File(...), user_phenome: str=Form(...)):
#     try:
#         UPLOAD_DIR = "uploaded_audios"
#         os.makedirs(UPLOAD_DIR, exist_ok=True)

#         file_path = os.path.join(UPLOAD_DIR, file.filename)

#         with open(file_path, "wb") as f:
#             f.write(await file.read())

#         print(f"✅ File saved at: {file_path}")

#         audio_path=process_single_video(file_path)
       
#         # Feature extraction
#         features = feature_extractor.extract(audio_path)
#         print(f"✅ Features extracted. Shape: {features.shape}")

#         # Prediction
#         top_label = predict_single_audio(features)
#         print(f'top_label , {top_label}')

#         if top_label is None:
#             return JSONResponse(status_code=500, content={"error": "Model prediction failed."})

#         # Always process video and calculate scores, regardless of match
#         video_path = remove_audio(file_path)
#         print(f"Silent video saved at: {video_path}")

#         # Check if prediction matches user's selection
#         is_correct = (top_label.lower() == user_phenome.lower())
        
#         # Calculate scores based on the ACTUAL detected phoneme (not user's selection)
#         # This gives us the true accuracy of what was actually pronounced
#         detected_audio_score = grade_pronunciation_calibrated(features, top_label)
#         detected_video_score_raw = get_video_accuracy(video_path, top_label, video_model)
#         detected_video_score = round(detected_video_score_raw * 100)
        
#         # Now calculate scores for the user's intended phoneme to show how far off they were
#         intended_audio_score = grade_pronunciation_calibrated(features, user_phenome)
#         intended_video_score_raw = get_video_accuracy(video_path, user_phenome, video_model)
#         intended_video_score = round(intended_video_score_raw * 100)
        
#         # If the prediction doesn't match user's selection, the scores should reflect the mismatch
#         if not is_correct:
#             # Use the intended phoneme scores as the main scores (these should be low for mismatches)
#             audio_score = intended_audio_score
#             video_score = intended_video_score
            
#             # The detected phoneme becomes the "top match" since it's what was actually pronounced
#             audio_top_match = top_label
#             video_top_match = top_label
            
#             # For mismatches, ensure scores are appropriately low
#             # If the intended scores are higher than they should be for a mismatch, penalize them
#             if intended_audio_score > 25:  # If intended score is too high for a mismatch
#                 audio_score = max(0, intended_audio_score - 50)  # Heavy penalty
#             if intended_video_score > 25:  # If intended score is too high for a mismatch
#                 video_score = max(0, intended_video_score - 50)  # Heavy penalty
                
#             # Additional penalty for clear mismatches
#             if audio_score > 20:
#                 audio_score = max(0, audio_score - 20)
#             if video_score > 20:
#                 video_score = max(0, video_score - 20)
#         else:
#             # If prediction matches, use the detected scores (which should be the same as intended)
#             audio_score = detected_audio_score
#             video_score = detected_video_score
#             audio_top_match = None
#             video_top_match = None
        
#         print(f"User selected phoneme: {user_phenome}")
#         print(f"Predicted phoneme: {top_label}")
#         print(f"Intended audio score: {intended_audio_score}")
#         print(f"Intended video score: {intended_video_score}")
#         print(f"Detected audio score: {detected_audio_score}")
#         print(f"Detected video score: {detected_video_score}")
#         print(f"Final audio score: {audio_score}")
#         print(f"Final video score: {video_score}")
#         print(f"Is correct: {is_correct}")

#         # Prepare result with complete information
#         result = {
#             "predicted_phoneme": top_label,
#             "user_phoneme": user_phenome,
#             "audio_score": audio_score,
#             "video_score": video_score,
#             "is_correct": is_correct,
#             "audio_top_match": audio_top_match,
#             "video_top_match": video_top_match,
#             "detected_phoneme": top_label
#         }
        
#         # Add mismatch message if prediction was wrong
#         if not is_correct:
#             result["mismatch_message"] = f"You selected '{user_phenome}' but your pronunciation was more similar to '{top_label}'"
#             print(f"❌ Mismatch: Expected '{user_phenome}', got '{top_label}'")

#         return JSONResponse(content=result)

#     except Exception as e:
#         print(f"❌ Error: {e}")
#         return JSONResponse(status_code=500, content={"error": str(e)})

# # ==== Health Check Endpoint ====
# @app.get("/health")
# async def health_check():
#     return {"status": "healthy", "message": "Backend is running"}

# # ==== Run the app ====
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)





























# main.py (robust Google Drive downloader + app)
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn.functional as F
import numpy as np
import os
import warnings
import requests
import zipfile
import shutil
import sys
from pathlib import Path
from sklearn.preprocessing import LabelEncoder

# Suppress sklearn warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

# -------------------------
# Config: Google Drive file id and paths
# -------------------------
GDRIVE_FILE_ID = "1vQiJlSlusEVNkk6Y466m12_xsZDH7vfr"  # confirm this is correct & file is "Anyone with link (Viewer)"
MODEL_DIR = "ai_models"
ZIP_PATH = os.path.join(os.getcwd(), "models.zip")
EXTRACT_TMP = os.path.join(os.getcwd(), "models_extracted_tmp")

# -------------------------
# Utilities for download & extraction
# -------------------------
def models_valid(path: str) -> bool:
    """Return True if 'audio_model' and 'video_model' exist inside path."""
    return os.path.isdir(os.path.join(path, "audio_model")) and os.path.isdir(os.path.join(path, "video_model"))

def download_file_from_google_drive(file_id: str, dest: str, timeout: int = 60):
    """
    Download a file from Google Drive handling large-file confirm tokens.
    Writes the file to `dest`.
    Raises RuntimeError on failure.
    """
    URL = "https://docs.google.com/uc?export=download"
    session = requests.Session()
    print(f"➡️ Starting download for Google Drive file id={file_id}")
    res = session.get(URL, params={"id": file_id}, stream=True, timeout=timeout)
    # Look for confirmation token in cookies (for large files)
    token = None
    for k, v in res.cookies.items():
        if k.startswith("download_warning"):
            token = v
            break
    if token:
        print("⚠️ Large-file confirm token detected; doing second request with confirm token.")
        res = session.get(URL, params={"id": file_id, "confirm": token}, stream=True, timeout=timeout)

    content_type = res.headers.get("Content-Type", "")
    if "text/html" in content_type and res.status_code == 200:
        # It's likely an HTML page (permissions/quota/redirect) — provide diagnostic
        raise RuntimeError(
            "Download returned HTML (not a binary file). Check Drive file permissions (set to 'Anyone with the link (Viewer)') "
            "and ensure it is a direct zip file. Also Google may block automated downloads when quota is exceeded."
        )

    # Stream to file
    with open(dest, "wb") as f:
        total = 0
        for chunk in res.iter_content(32768):
            if chunk:
                f.write(chunk)
                total += len(chunk)
    mb = total / (1024 * 1024)
    print(f"⬇️ Downloaded {mb:.2f} MB to {dest}")

def find_models_folder(base_dir: str) -> str | None:
    """
    Search base_dir recursively for a directory that contains audio_model and video_model.
    Returns the path to that directory or None.
    """
    base = Path(base_dir)
    # check base itself
    if models_valid(str(base)):
        return str(base)
    # walk
    for p in base.rglob("*"):
        if p.is_dir():
            if models_valid(str(p)):
                return str(p)
    return None

def download_and_extract_models():
    """
    Ensure MODEL_DIR exists and contains expected subfolders.
    If not present, download zip from Google Drive, validate, extract,
    find the ai_models folder, and move it to MODEL_DIR.
    """
    if os.path.exists(MODEL_DIR) and models_valid(MODEL_DIR):
        print(f"✅ '{MODEL_DIR}' already present and valid. Skipping download.")
        return

    # Clean old artifacts
    if os.path.exists(ZIP_PATH):
        try:
            os.remove(ZIP_PATH)
        except Exception:
            pass
    shutil.rmtree(EXTRACT_TMP, ignore_errors=True)

    try:
        print("📥 Downloading models from Google Drive...")
        download_file_from_google_drive(GDRIVE_FILE_ID, ZIP_PATH)

        # Validate zip
        if not zipfile.is_zipfile(ZIP_PATH):
            raise RuntimeError(f"Downloaded file {ZIP_PATH} is not a valid zip file (corrupt or HTML).")

        # Extract to tmp dir
        print(f"🗜 Extracting {ZIP_PATH} to temporary directory...")
        with zipfile.ZipFile(ZIP_PATH, "r") as z:
            z.extractall(EXTRACT_TMP)

        # Find the folder containing audio_model & video_model
        found = find_models_folder(EXTRACT_TMP)
        if not found:
            top_entries = [p.name for p in Path(EXTRACT_TMP).iterdir()] if Path(EXTRACT_TMP).exists() else []
            raise RuntimeError(f"Could not find 'audio_model' and 'video_model' inside the zip. Top-level entries: {top_entries}")

        # Move found folder to MODEL_DIR (replace if exists)
        if os.path.exists(MODEL_DIR):
            print(f"🗑 Removing existing '{MODEL_DIR}' before moving new models.")
            shutil.rmtree(MODEL_DIR, ignore_errors=True)

        print(f"📂 Moving '{found}' -> '{MODEL_DIR}'")
        shutil.move(found, MODEL_DIR)

        # Clean up
        try:
            os.remove(ZIP_PATH)
        except Exception:
            pass
        shutil.rmtree(EXTRACT_TMP, ignore_errors=True)

        if not models_valid(MODEL_DIR):
            raise RuntimeError(f"Models extracted but '{MODEL_DIR}' doesn't contain expected subfolders after move.")

        print("✅ Models downloaded and extracted successfully.")

    except Exception as e:
        # cleanup and re-raise for Render logs
        print(f"❌ Model download / extraction failed: {e}")
        if os.path.exists(ZIP_PATH):
            try:
                os.remove(ZIP_PATH)
            except Exception:
                pass
        shutil.rmtree(EXTRACT_TMP, ignore_errors=True)
        raise

# Make sure current working dir is importable (so ai_models becomes importable after extraction)
sys.path.insert(0, os.getcwd())

# Attempt to download/extract models BEFORE importing modules that depend on them
download_and_extract_models()

# -------------------------
# Imports that depend on ai_models being present
# -------------------------
from ai_models.audio_model.sound_model import PhonemeClassifier, Config
from ai_models.audio_model.feature_extractor import WhisperFeatureExtractor, seed_everything
from ai_models.audio_model.accuracy import grade_pronunciation_calibrated
from ai_models.audio_model.extract import process_single_video
from ai_models.video_model.reference_comparison import load_video_model, remove_audio, get_video_accuracy

# -------------------------
# App init
# -------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# reproducibility
seed_everything(42)

# Feature extractor and models
feature_extractor = WhisperFeatureExtractor()

video_model_path = os.path.join(MODEL_DIR, "video_model", "Groups_best_model.pth")
video_model = load_video_model(video_model_path, Config.device)

model_path = os.path.join(MODEL_DIR, "audio_model", "best_model.pth")
checkpoint = torch.load(model_path, map_location=Config.device, weights_only=False)
label_encoder: LabelEncoder = checkpoint["label_encoder"]

model = PhonemeClassifier(
    input_dim=768,
    num_classes=len(label_encoder.classes_),
    config=Config
).to(Config.device)

model.load_state_dict(checkpoint["model_state_dict"])
model.eval()

print(f"🚀 Model loaded with {len(label_encoder.classes_)} classes.")
print(f"🔠 Classes: {label_encoder.classes_}")

# Helper
def predict_single_audio(feature_tensor):
    try:
        feature_tensor = (feature_tensor - feature_tensor.mean(0)) / (feature_tensor.std(0) + 1e-7)
        features = feature_tensor.unsqueeze(0).to(Config.device)
        lengths = torch.tensor([feature_tensor.shape[0]]).to(Config.device)

        with torch.no_grad():
            logits = model(features, lengths)
            probs = F.softmax(logits, dim=1).cpu().numpy().squeeze()

        top_idx = np.argmax(probs)
        top_label = label_encoder.inverse_transform([top_idx])[0]
        top_prob = float(probs[top_idx])

        print(f"\n🎙️ Predicted phoneme: {top_label} (p={top_prob:.4f})")
        return top_label

    except Exception as e:
        print(f"❌ Inference failed: {e}")
        return None

# API endpoint (kept unchanged)
@app.post("/predict/")
async def predict_audio(file: UploadFile = File(...), user_phenome: str = Form(...)):
    try:
        UPLOAD_DIR = "uploaded_audios"
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        print(f"✅ File saved at: {file_path}")

        audio_path = process_single_video(file_path)
        features = feature_extractor.extract(audio_path)
        print(f"✅ Features extracted. Shape: {features.shape}")

        top_label = predict_single_audio(features)
        print(f"top_label: {top_label}")

        if top_label is None:
            return JSONResponse(status_code=500, content={"error": "Model prediction failed."})

        video_path = remove_audio(file_path)
        print(f"Silent video saved at: {video_path}")

        is_correct = (top_label.lower() == user_phenome.lower())

        detected_audio_score = grade_pronunciation_calibrated(features, top_label)
        detected_video_score_raw = get_video_accuracy(video_path, top_label, video_model)
        detected_video_score = round(detected_video_score_raw * 100)

        intended_audio_score = grade_pronunciation_calibrated(features, user_phenome)
        intended_video_score_raw = get_video_accuracy(video_path, user_phenome, video_model)
        intended_video_score = round(intended_video_score_raw * 100)

        if not is_correct:
            audio_score = intended_audio_score
            video_score = intended_video_score
            audio_top_match = top_label
            video_top_match = top_label

            if intended_audio_score > 25:
                audio_score = max(0, intended_audio_score - 50)
            if intended_video_score > 25:
                video_score = max(0, intended_video_score - 50)

            if audio_score > 20:
                audio_score = max(0, audio_score - 20)
            if video_score > 20:
                video_score = max(0, video_score - 20)
        else:
            audio_score = detected_audio_score
            video_score = detected_video_score
            audio_top_match = None
            video_top_match = None

        result = {
            "predicted_phoneme": top_label,
            "user_phoneme": user_phenome,
            "audio_score": audio_score,
            "video_score": video_score,
            "is_correct": is_correct,
            "audio_top_match": audio_top_match,
            "video_top_match": video_top_match,
            "detected_phoneme": top_label
        }

        if not is_correct:
            result["mismatch_message"] = f"You selected '{user_phenome}' but your pronunciation was more similar to '{top_label}'"

        return JSONResponse(content=result)

    except Exception as e:
        print(f"❌ Error in /predict/: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


