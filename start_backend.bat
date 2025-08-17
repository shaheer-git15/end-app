@echo off
echo Starting Phonics Backend Server...
echo.

cd backend

echo.
echo Activating virtual environment...
call ..\backend\venv\Scripts\activate

echo.
echo Starting FastAPI server...
python run.py

pause
