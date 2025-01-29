from flask import redirect, url_for, render_template, request, current_app as app, jsonify
from flask_login import login_required, login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from . import Session
from .models import User, Topic, Post


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/home')
@login_required
def home():
    session = Session()
    topics = session.query(Topic).filter_by(user_id=current_user.id).all()
    session.close()
    return render_template('home.html', topics=topics)

@app.route('/save_topic', methods=['POST'])
@login_required
def save_topic():
    data = request.json
    topic_name = data.get('topicName')

    if topic_name:
        session = Session()
        new_topic = Topic(name=topic_name, user_id=current_user.id)
        session.add(new_topic)
        session.commit()
        session.refresh(new_topic)
        session.close()

        return jsonify({"success": True, "topicName": topic_name, "topicId": new_topic.id})
    else:
        return jsonify({"success": False, "message": "Topic name is required"})


@app.route('/theme/<int:topic_id>')
@login_required
def theme(topic_id):
    session = Session()
    topic = session.query(Topic).filter_by(id=topic_id, user_id=current_user.id).first()
    posts = session.query(Post).filter_by(topic_id=topic_id).all()
    session.close()
    return render_template('theme.html', topic=topic, posts=posts)

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
