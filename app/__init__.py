import os
from flask import Flask
from flask_login import LoginManager
from flask_session import Session as FlaskSession  # Переименуем, чтобы не путать с SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from config import Config
from .models import Base, User

app = Flask(__name__)
app.config.from_object(Config)

# Подключаем Flask-Session (управляет сессиями Flask)
FlaskSession(app)

# Папка для загрузки файлов
app.config['UPLOAD_FOLDER'] = os.path.join('app', 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 МБ

# Создаём папку для загрузки, если её нет
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# База данных (SQLAlchemy)
engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False})
SessionLocal = scoped_session(sessionmaker(bind=engine))  # Это SQLAlchemy-сессия

# Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    """Загружает пользователя по ID для Flask-Login."""
    session = SessionLocal()
    user = session.get(User, int(user_id))
    session.close()  # Закрываем сессию после запроса
    return user

# Импортируем маршруты
with app.app_context():
    from . import routes
