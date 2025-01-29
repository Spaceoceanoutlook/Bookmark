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
    posts = session.query(Post).filter_by(topic_id=topic_id).all()  # Получаем все записи для данной темы
    session.close()
    return render_template('theme.html', topic=topic, posts=posts)  # Передаем записи в шаблон


from flask import request, jsonify
from werkzeug.utils import secure_filename
import os

@app.route('/save_post', methods=['POST'])
@login_required
def save_post():
    post_content = request.form.get('postContent')
    topic_id = request.form.get('topicId')
    post_photo = request.files.get('postPhoto')  # Получаем файл

    if post_content:
        session = Session()
        new_post = Post(text=post_content, topic_id=topic_id)

        # Если есть изображение, сохраняем его
        if post_photo:
            upload_folder = app.config['UPLOAD_FOLDER']
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)

            # Сохранение файла с безопасным именем
            filename = secure_filename(post_photo.filename)
            post_photo.save(os.path.join(upload_folder, filename))
            new_post.photo = filename  # Сохраняем имя файла в базе данных

        try:
            session.add(new_post)
            session.commit()
            session.refresh(new_post)
            return jsonify({"success": True, "postId": new_post.id, "postContent": post_content, "photoFilename": new_post.photo})
        except Exception as e:
            session.rollback()  # Откат транзакции в случае ошибки
            return jsonify({"success": False, "message": "Database error: " + str(e)})
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Post content is required"})


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
