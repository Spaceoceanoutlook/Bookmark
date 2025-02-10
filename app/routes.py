import os

from flask import (
    redirect,
    url_for,
    render_template,
    request,
    current_app as app,
    jsonify,
)
from flask_login import login_required, login_user, logout_user, current_user
from sqlalchemy import desc
from werkzeug.security import generate_password_hash, check_password_hash
from . import SessionLocal
from .time_utils import get_local_time
from .models import User, Topic, Post
from werkzeug.utils import secure_filename


@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        hashed_password = generate_password_hash(password, method="pbkdf2:sha256")
        new_user = User(email=email, password=hashed_password)

        session = SessionLocal()
        try:
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            login_user(new_user)
        except Exception as e:
            session.rollback()
            return render_template(
                "register.html", error=f"Registration failed: {str(e)}"
            )
        finally:
            session.close()

        return redirect(url_for("home"))
    return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        session = SessionLocal()
        try:
            user = session.query(User).filter_by(email=email).first()
            if user and check_password_hash(user.password, password):
                login_user(user)
                return redirect(url_for("home"))
            else:
                return render_template("login.html", error="Invalid email or password")
        except Exception as e:
            return render_template("login.html", error=f"Login failed: {str(e)}")
        finally:
            session.close()

    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


@app.route("/home")
@login_required
def home():
    session = SessionLocal()
    try:
        topics = (
            session.query(Topic)
            .filter_by(user_id=current_user.id)
            .order_by(desc(Topic.id))
            .all()
        )
        pinned_posts = (
            session.query(Post)
            .filter_by(pinned=True, user_id=current_user.id)
            .order_by(desc(Post.pinned_at))
            .all()
        )
    except Exception as e:
        return render_template("home.html", error=f"Failed to load data: {str(e)}")
    finally:
        session.close()
    return render_template("home.html", topics=topics, pinned_posts=pinned_posts)


@app.route("/save_topic", methods=["POST"])
@login_required
def save_topic():
    data = request.json
    topic_name = data.get("topicName")

    if topic_name:
        session = SessionLocal()
        try:
            new_topic = Topic(name=topic_name, user_id=current_user.id)
            session.add(new_topic)
            session.commit()
            session.refresh(new_topic)
            return jsonify(
                {"success": True, "topicName": topic_name, "topicId": new_topic.id}
            )
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to save topic: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Topic name is required"})


@app.route("/edit_topic", methods=["POST"])
@login_required
def edit_topic():
    data = request.json
    topic_id = data.get("topicId")
    topic_name = data.get("topicName")

    if topic_id and topic_name:
        session = SessionLocal()
        try:
            topic = (
                session.query(Topic)
                .filter_by(id=topic_id, user_id=current_user.id)
                .first()
            )
            if topic:
                topic.name = topic_name
                session.commit()
                return jsonify({"success": True, "topicName": topic_name})
            else:
                return jsonify({"success": False, "message": "Topic not found"})
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to edit topic: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Topic ID and name are required"})


@app.route("/delete_topic", methods=["POST"])
@login_required
def delete_topic():
    data = request.json
    topic_id = data.get("topicId")

    if topic_id:
        session = SessionLocal()
        try:
            topic = (
                session.query(Topic)
                .filter_by(id=topic_id, user_id=current_user.id)
                .first()
            )
            if topic:
                session.delete(topic)
                session.commit()
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "message": "Topic not found"})
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to delete topic: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Topic ID is required"})


@app.route("/theme/<int:topic_id>")
@login_required
def theme(topic_id):
    session = SessionLocal()
    try:
        topic = (
            session.query(Topic).filter_by(id=topic_id, user_id=current_user.id).first()
        )
        posts = (
            session.query(Post)
            .filter_by(topic_id=topic_id)
            .order_by(desc(Post.id))
            .all()
        )
    except Exception as e:
        return render_template("theme.html", error=f"Failed to load data: {str(e)}")
    finally:
        session.close()
    return render_template("theme.html", topic=topic, posts=posts)


@app.route("/save_post", methods=["POST"])
@login_required
def save_post():
    post_content = request.form.get("postContent")
    topic_id = request.form.get("topicId")
    post_photo = request.files.get("postPhoto")

    if post_content or post_photo:
        session = SessionLocal()
        try:
            new_post = Post(
                text=post_content or "", topic_id=topic_id, user_id=current_user.id
            )
            if post_photo:
                upload_folder = app.config["UPLOAD_FOLDER"]
                if not os.path.exists(upload_folder):
                    os.makedirs(upload_folder)
                filename = secure_filename(post_photo.filename)
                post_photo.save(os.path.join(upload_folder, filename))
                new_post.photo = filename

            session.add(new_post)
            session.commit()
            session.refresh(new_post)
            return jsonify(
                {
                    "success": True,
                    "postId": new_post.id,
                    "postContent": new_post.text or "",
                    "photoFilename": new_post.photo,
                }
            )
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to save post: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify(
            {"success": False, "message": "Post content or photo is required"}
        )


@app.route("/delete_post", methods=["POST"])
@login_required
def delete_post():
    data = request.json
    post_id = data.get("postId")

    if post_id:
        session = SessionLocal()
        try:
            post = (
                session.query(Post)
                .filter_by(id=post_id, user_id=current_user.id)
                .first()
            )
            if post:
                if post.photo:
                    photo_path = os.path.join(app.config["UPLOAD_FOLDER"], post.photo)
                    if os.path.exists(photo_path):
                        os.remove(photo_path)
                session.delete(post)
                session.commit()
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "message": "Post not found"})
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to delete post: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Post ID is required"})


@app.route("/pin_post", methods=["POST"])
@login_required
def pin_post():
    data = request.json
    post_id = data.get("postId")

    if post_id:
        session = SessionLocal()
        try:
            post = (
                session.query(Post)
                .filter_by(id=post_id, user_id=current_user.id)
                .first()
            )
            if post:
                post.pinned = True
                post.pinned_at = get_local_time()
                session.commit()
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "message": "Post not found"})
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to pin post: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Post ID is required"})


@app.route("/unpin_post", methods=["POST"])
@login_required
def unpin_post():
    data = request.json
    post_id = data.get("postId")

    if post_id:
        session = SessionLocal()
        try:
            post = (
                session.query(Post)
                .filter_by(id=post_id, user_id=current_user.id)
                .first()
            )
            if post:
                post.pinned = False
                post.pinned_at = None
                session.commit()
                return jsonify({"success": True})
            else:
                return jsonify({"success": False, "message": "Post not found"})
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to unpin post: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Post ID is required"})


@app.route("/edit_post", methods=["POST"])
@login_required
def edit_post():
    data = request.get_json()
    post_id = data.get("postId")
    post_content = data.get("postContent")

    if post_id:
        session = SessionLocal()
        try:
            post = (
                session.query(Post)
                .filter_by(id=post_id, user_id=current_user.id)
                .first()
            )
            if post:
                if post_content is not None:
                    post.text = post_content
                session.commit()
                session.refresh(post)
                return jsonify(
                    {"success": True, "postId": post.id, "postContent": post.text or ""}
                )
            else:
                return jsonify({"success": False, "message": "Post not found"})
        except Exception as e:
            session.rollback()
            return jsonify(
                {"success": False, "message": f"Failed to edit post: {str(e)}"}
            )
        finally:
            session.close()
    else:
        return jsonify({"success": False, "message": "Post ID is required"})
