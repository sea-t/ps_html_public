from datetime import datetime
from app import db

class Snippet(db.Model):
    """代码片段和提示词片段模型"""
    __tablename__ = 'snippets'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    snippet_type = db.Column(db.String(20), nullable=False)  # 'code' 或 'prompt'
    language = db.Column(db.String(50))  # 编程语言（仅代码片段）
    tags = db.Column(db.String(500))  # 逗号分隔的标签
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'description': self.description,
            'snippet_type': self.snippet_type,
            'language': self.language,
            'tags': self.tags.split(',') if self.tags else [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self):
        return f'<Snippet {self.title}>'
