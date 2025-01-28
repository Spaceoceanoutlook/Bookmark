from flask import render_template, request, current_app as app
from werkzeug.security import generate_password_hash

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
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
        # hashed_password = generate_password_hash(password, method='sha256')
        # new_user = User(email=email, password=hashed_password)
        # db.session.add(new_user)
        # db.session.commit()
        # flash('Registration successful! You can now log in.', 'success')
        print(email)
        print(password)
        return render_template('home.html')
    return render_template('register.html')

@app.route('/theme')
def theme():
    return render_template('theme.html')
