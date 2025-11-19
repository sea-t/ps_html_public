from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 初始化扩展
    db.init_app(app)
    CORS(app)

    # 注册蓝图
    from app.routes import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # 创建数据库表
    with app.app_context():
        db.create_all()

    return app
