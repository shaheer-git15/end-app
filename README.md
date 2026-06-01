 Jholly_Phonics — Local Setup & Test Instructions

Hi! 🎉 This README will walk **a non-technical person** step-by-step through running the backend locally and testing the app. Put this `README.md` inside the top-level `Jholly_Phonics` folder before zipping and sharing.

---

> ✅ **Goal:** Unzip the folder, follow a few simple steps, and you’ll have the backend server running on your PC. The mobile/front-end can talk to it at `http://<your-computer-ip>:8000`.

---

## Quick summary (one-liner)
1. Unzip the folder.  
2. Install Python 3.10 (recommended).  
3. Open a terminal in `Jholly_Phonics/backend`.  
4. Run:
   - create & activate a virtual environment,  
   - `pip install -r requirements.txt`,  
   - `python -m uvicorn main:app --host 0.0.0.0 --port 8000`  
5. Set your mobile app `API_BASE_URL` to `http://<your-pc-ip>:8000` and test.

---

## Prerequisites (what the tester needs)

- **A PC** with Windows / macOS / Linux.
- **Python 3.8 – 3.10** installed (we recommend **Python 3.10**).  
  > Do **not** use Python 3.11+ for this project — some packages require <3.11.
- **FFmpeg** installed and available in your SYSTEM PATH (MoviePy uses it).
  - Windows: either install FFmpeg and add to PATH, or `choco install ffmpeg` if using Chocolatey.
  - macOS: `brew install ffmpeg` (if Homebrew is installed).
  - Linux: `sudo apt install ffmpeg` (Debian/Ubuntu).
- Sufficient RAM/disk space — recommended **8 GB RAM** available for inference, and a few hundred MB free disk for temporary files.

---

## Files included (what you will see in the zip)

```
Jholly_Phonics/
├─ backend/
│  ├─ main.py
│  ├─ requirements.txt
│  ├─ start_backend.bat  (optional helper)
│  ├─ ai_models/         ← IMPORTANT: this folder must exist (contains model files)
│  └─ ... (other server files)
└─ frontend/             (if provided)
```

> **Important:** Make sure the `ai_models` folder (or `ai_models.zip` extracted into `backend/`) is present. Without it, the server will fail trying to load models.

---

## Step-by-step instructions for Windows (PowerShell)

1. **Unzip** `Jholly_Phonics.zip` and open **PowerShell**.

2. Change directory to the backend folder:
   ```powershell
   cd path\to\Jholly_Phonics\backend
   ```

3. Install Python 3.10 if not installed (download from python.org). Ensure `python` command works:
   ```powershell
   python --version
   ```

4. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

   If PowerShell blocks scripts, run (as admin) `Set-ExecutionPolicy RemoteSigned` and try again.

5. Upgrade pip and install dependencies:
   ```powershell
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

   > If `pip install` errors on packages like `mediapipe` or `torch`, copy the error and ask for help — or try installing Visual C++ Build Tools (Windows) and retry.

6. Ensure `ai_models` folder is present inside `backend/`. If you have `ai_models.zip`, extract it here so path `backend/ai_models/...` exists.

7. Start the server (recommended):
   ```powershell
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Or run the included `start_backend.bat` (it should activate venv then run uvicorn).

8. Find your PC local IP (so the mobile app can reach it):
   ```powershell
   ipconfig
   ```
   Look for `IPv4 Address` under your active network adapter, e.g. `192.168.100.217`.

9. In the mobile/frontend app (network config), set:
   ```
   API_BASE_URL = "http://<your-ip>:8000"
   ```
   Example: `http://192.168.100.217:8000`

10. Test health endpoint from another device (mobile/computer) or from the same PC:
    ```powershell
    curl http://127.0.0.1:8000/health
    ```
    Expected response:
    ```json
    {"status":"healthy","message":"Backend is running"}
    ```

11. Test `predict/` endpoint (example using curl — replace `video.mp4` and phoneme):
    ```powershell
    curl -X POST "http://127.0.0.1:8000/predict/" -F "file=@C:\path\to\video.mp4" -F "user_phenome=ai"
    ```

---

## Step-by-step instructions for macOS / Linux (Terminal)

1. Unzip `Jholly_Phonics.zip`. Open Terminal.

2. `cd` into backend:
   ```bash
   cd /path/to/Jholly_Phonics/backend
   ```

3. Create & activate venv:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. Upgrade pip and install dependencies:
   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. Ensure `ai_models/` folder exists in `backend/`. If you have `ai_models.zip`, unzip it here:
   ```bash
   unzip ai_models.zip -d .
   ```

6. Start server:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

7. Find local IP (so frontend can reach server):
   - macOS: `ipconfig getifaddr en0` (or `ifconfig`)
   - Linux: `hostname -I` or `ifconfig`

8. Update `API_BASE_URL` in the frontend config to `http://<your-ip>:8000`.

9. Test endpoints (same curl examples shown above).

---

## Common issues & troubleshooting

- **FFMPEG errors** → install ffmpeg and ensure it's in PATH.
- **pip install errors** → check Python version (must be <3.11), install build tools if Windows.
- **Model files missing** → ensure `ai_models/` exists with `.pth` model files.
- **Server returns 500** → keep filenames simple and ensure `.mp4` extension.
- **Mobile app can’t connect** → use PC local IP, same Wi-Fi network, disable VPN/firewall.

---

## Final tips

- Zip the **entire Jholly_Phonics folder** (including backend/ai_models/).  
- Include this README.md and `start_backend.bat`.  
- Tell the tester: “Unzip → run backend/start_backend.bat → open app with correct API_BASE_URL.”

