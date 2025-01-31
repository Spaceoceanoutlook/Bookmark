import os
from datetime import timedelta


class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "bookmark_db.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.urandom(24)

    # Настройки сессии
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = True
    SESSION_FILE_DIR = os.path.join(BASE_DIR, 'flask_session')  # Папка для хранения файлов сессий
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)  # Сессия будет активна 7 дней

    # Настройки для загрузки файлов
    UPLOAD_FOLDER = os.path.join('app', 'static', 'uploads')
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5 МБ

    # Создаём папку для хранения файлов сессий, если её нет
    try:
        os.makedirs(SESSION_FILE_DIR, exist_ok=True)
    except OSError as e:
        print(f"Ошибка при создании папки для сессий: {e}")

    # Создаём папку для загрузки файлов, если её нет
    try:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    except OSError as e:
        print(f"Ошибка при создании папки для загрузки файлов: {e}")

