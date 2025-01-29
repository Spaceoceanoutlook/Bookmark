from flask import Flask
from flask_login import LoginManager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import Config
from .models import Base, User

app = Flask(__name__)
app.config.from_object(Config)

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
Session = sessionmaker(bind=engine)

login_manager = LoginManager()

def create_app():
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        session = Session()
        return session.query(User).get(int(user_id))

    with app.app_context():
        from . import routes

    return app
