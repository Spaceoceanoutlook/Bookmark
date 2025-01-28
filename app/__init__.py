from flask import Flask
from flask_login import LoginManager

login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    login_manager.init_app(app)

    with app.app_context():
        from . import routes

    @login_manager.user_loader
    def load_user(user_id):
        # return User.query.get(int(user_id)) !!!!!!!!!!!!!!!!!!!!!!!!!!!
        return 'OK'

    return app
