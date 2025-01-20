# BerryBoy E-Commerce Website

A trendy, eye-catching e-commerce website for selling berries and related products built with Flask.

## Setup Instructions

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory and add:
```
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///berryboy.db
```

4. Initialize the database:
```bash
flask db init
flask db migrate
flask db upgrade
```

5. Run the application:
```bash
flask run
```

Visit http://localhost:5000 to view the website.

## Features

- Modern, responsive design
- User authentication system
- Product catalog with categories
- Shopping cart functionality
- Admin dashboard
- Blog section for recipes
- Newsletter signup
- Secure payment processing

## Project Structure

```
BerryBoy/
├── app/
│   ├── __init__.py
│   ├── models/
│   ├── routes/
│   ├── static/
│   └── templates/
├── migrations/
├── instance/
├── venv/
├── .env
├── .gitignore
├── requirements.txt
└── run.py
```
