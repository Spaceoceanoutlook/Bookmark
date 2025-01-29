from flask import redirect, url_for, render_template, request, current_app as app
from flask_login import login_required, login_user, logout_user
from werkzeug.security import generate_password_hash, check_password_hash
from . import Session
from .models import User


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/home')
@login_required
def home():
    return render_template('home.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(email=email, password=hashed_password)

        session = Session()
        session.add(new_user)
        session.commit()
        session.close()

        return render_template('home.html')
    return render_template('register.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        session = Session()
        user = session.query(User).filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            session.close()
            return redirect(url_for('home'))
        else:
            session.close()

    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/theme')
def theme():
    return render_template('theme.html')
