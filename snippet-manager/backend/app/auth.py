from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token
from app import db
from app.models import User
import re

bp = Blueprint('auth', __name__)

def validate_email(email):
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """验证密码强度：至少8个字符"""
    return len(password) >= 8

@bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.get_json()

    # 验证必需字段
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'error': '用户名、邮箱和密码不能为空'}), 400

    # 验证用户名长度
    if len(username) < 3 or len(username) > 80:
        return jsonify({'error': '用户名长度必须在3-80个字符之间'}), 400

    # 验证邮箱格式
    if not validate_email(email):
        return jsonify({'error': '邮箱格式不正确'}), 400

    # 验证密码强度
    if not validate_password(password):
        return jsonify({'error': '密码长度至少为8个字符'}), 400

    # 检查用户名是否已存在
    if User.query.filter_by(username=username).first():
        return jsonify({'error': '用户名已存在'}), 409

    # 检查邮箱是否已存在
    if User.query.filter_by(email=email).first():
        return jsonify({'error': '邮箱已被注册'}), 409

    # 创建新用户
    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # 生成token
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        'message': '注册成功',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': '用户名和密码不能为空'}), 400

    # 查找用户
    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': '用户名或密码错误'}), 401

    # 生成token
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        'message': '登录成功',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@bp.route('/refresh', methods=['POST'])
def refresh():
    """刷新访问token"""
    from flask_jwt_extended import jwt_required, get_jwt_identity

    @jwt_required(refresh=True)
    def _refresh():
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        return jsonify({'access_token': new_access_token}), 200

    return _refresh()

@bp.route('/me', methods=['GET'])
def get_current_user():
    """获取当前用户信息"""
    from flask_jwt_extended import jwt_required, get_jwt_identity

    @jwt_required()
    def _get_current_user():
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({'error': '用户不存在'}), 404

        return jsonify(user.to_dict()), 200

    return _get_current_user()
