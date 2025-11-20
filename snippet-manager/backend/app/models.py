from datetime import datetime
from app import db, bcrypt

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 关联片段
    snippets = db.relationship('Snippet', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        """设置密码"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """验证密码"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }

    def __repr__(self):
        return f'<User {self.username}>'


class Snippet(db.Model):
    """代码片段和提示词片段模型"""
    __tablename__ = 'snippets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    snippet_type = db.Column(db.String(20), nullable=False, index=True)  # 'code' 或 'prompt'
    language = db.Column(db.String(50))  # 编程语言（仅代码片段）
    tags = db.Column(db.String(500))  # 逗号分隔的标签
    is_favorite = db.Column(db.Boolean, default=False, index=True)  # 是否收藏
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'content': self.content,
            'description': self.description,
            'snippet_type': self.snippet_type,
            'language': self.language,
            'tags': self.tags.split(',') if self.tags else [],
            'is_favorite': self.is_favorite,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Snippet {self.title}>'
