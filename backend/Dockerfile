# Use stable Python version that works with torch/transformers
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy all backend files into container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Render port
EXPOSE 10000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
