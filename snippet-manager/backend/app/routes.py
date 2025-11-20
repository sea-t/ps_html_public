from flask import Blueprint, request, jsonify
from app import db
from app.models import Snippet

bp = Blueprint('api', __name__)

@bp.route('/snippets', methods=['GET'])
def get_snippets():
    """获取所有片段，支持搜索和过滤"""
    snippet_type = request.args.get('type')
    search = request.args.get('search')
    tag = request.args.get('tag')

    query = Snippet.query

    # 按类型过滤
    if snippet_type:
        query = query.filter_by(snippet_type=snippet_type)

    # 搜索功能
    if search:
        search_pattern = f'%{search}%'
        query = query.filter(
            db.or_(
                Snippet.title.like(search_pattern),
                Snippet.content.like(search_pattern),
                Snippet.description.like(search_pattern)
            )
        )

    # 按标签过滤
    if tag:
        query = query.filter(Snippet.tags.like(f'%{tag}%'))

    snippets = query.order_by(Snippet.updated_at.desc()).all()
    return jsonify([snippet.to_dict() for snippet in snippets])

@bp.route('/snippets/<int:id>', methods=['GET'])
def get_snippet(id):
    """获取单个片段"""
    snippet = Snippet.query.get_or_404(id)
    return jsonify(snippet.to_dict())

@bp.route('/snippets', methods=['POST'])
def create_snippet():
    """创建新片段"""
    data = request.get_json()

    if not data.get('title') or not data.get('content'):
        return jsonify({'error': '标题和内容不能为空'}), 400

    snippet = Snippet(
        title=data['title'],
        content=data['content'],
        description=data.get('description', ''),
        snippet_type=data.get('snippet_type', 'code'),
        language=data.get('language', ''),
        tags=','.join(data.get('tags', [])) if isinstance(data.get('tags'), list) else data.get('tags', '')
    )

    db.session.add(snippet)
    db.session.commit()

    return jsonify(snippet.to_dict()), 201

@bp.route('/snippets/<int:id>', methods=['PUT'])
def update_snippet(id):
    """更新片段"""
    snippet = Snippet.query.get_or_404(id)
    data = request.get_json()

    snippet.title = data.get('title', snippet.title)
    snippet.content = data.get('content', snippet.content)
    snippet.description = data.get('description', snippet.description)
    snippet.snippet_type = data.get('snippet_type', snippet.snippet_type)
    snippet.language = data.get('language', snippet.language)

    if 'tags' in data:
        snippet.tags = ','.join(data['tags']) if isinstance(data['tags'], list) else data['tags']

    db.session.commit()

    return jsonify(snippet.to_dict())

@bp.route('/snippets/<int:id>', methods=['DELETE'])
def delete_snippet(id):
    """删除片段"""
    snippet = Snippet.query.get_or_404(id)
    db.session.delete(snippet)
    db.session.commit()

    return '', 204

@bp.route('/tags', methods=['GET'])
def get_tags():
    """获取所有标签"""
    snippets = Snippet.query.all()
    tags = set()

    for snippet in snippets:
        if snippet.tags:
            tags.update(snippet.tags.split(','))

    return jsonify(sorted(list(tags)))

@bp.route('/stats', methods=['GET'])
def get_stats():
    """获取统计信息"""
    total = Snippet.query.count()
    code_count = Snippet.query.filter_by(snippet_type='code').count()
    prompt_count = Snippet.query.filter_by(snippet_type='prompt').count()

    return jsonify({
        'total': total,
        'code': code_count,
        'prompt': prompt_count
    })
