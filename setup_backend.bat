@echo off
echo Setting up Django backend...

cd backend

echo Installing Python dependencies...
pip install -r requirements.txt

echo Running migrations...
python manage.py migrate

echo Populating initial data...
python manage.py populate_data

echo Backend setup complete!
echo.
echo To start the backend server, run:
echo cd backend
echo python manage.py runserver 8000
echo.
echo To use the API-connected frontend, replace AppProvider with ApiAppProvider in main.tsx

pause