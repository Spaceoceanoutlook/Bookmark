from flask import render_template, request, flash, current_app as app
from flask_login import login_required
from werkzeug.security import generate_password_hash
from . import db
from .models import User


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
@login_required
def home():
    return render_template('home.html')

@app.route('/auth')
def auth():
    return render_template('auth.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful! You can now log in.', 'success')
        return render_template('home.html')
    return render_template('register.html')

@app.route('/theme')
def theme():
    return render_template('theme.html')
