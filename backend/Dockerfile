# Use Python 3.10 (compatible with your libs)
FROM python:3.10-slim

# Set workdir
WORKDIR /app

# Install system dependencies (for librosa, opencv, mediapipe, etc.)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app
COPY . .

# Expose port
EXPOSE 8000

# Start the app (Render overrides this with your Start Command anyway)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
