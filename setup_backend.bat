@echo off
echo Setting up Ama Sarees Backend with Authentication...

cd backend

echo Installing Python dependencies...
pip install -r requirements.txt

echo Setting up authentication system...
python setup_auth.py

echo Populating initial data...
python manage.py populate_data

echo.
echo Backend setup complete!
echo.
echo Login Credentials:
echo    Admin: admin@amarees.com / admin123
echo    Customer: customer@example.com / customer123
echo.
echo To start the backend server, run:
echo cd backend
echo python manage.py runserver 8000
echo.
echo API will be available at: http://localhost:8000
echo Admin panel: http://localhost:8000/admin
echo.
pause