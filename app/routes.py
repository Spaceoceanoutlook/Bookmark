from flask import render_template, current_app as app

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/auth')
def auth():
    return render_template('auth.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/theme')
def theme():
    return render_template('theme.html')
