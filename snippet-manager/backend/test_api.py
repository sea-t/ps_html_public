"""
后端API接口完整测试套件
测试所有API端点的功能
"""
import pytest
import json
from app import create_app, db
from app.models import Snippet


@pytest.fixture
def app():
    """创建测试应用"""
    from config import Config

    class TestConfig(Config):
        TESTING = True
        SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """创建测试客户端"""
    return app.test_client()


@pytest.fixture
def sample_snippet(app):
    """创建示例片段"""
    with app.app_context():
        snippet = Snippet(
            title='测试代码片段',
            content='print("Hello World")',
            description='一个简单的Python代码',
            snippet_type='code',
            language='python',
            tags='测试,python'
        )
        db.session.add(snippet)
        db.session.commit()
        return snippet.id


class TestSnippetsAPI:
    """测试片段CRUD接口"""

    def test_get_snippets_empty(self, client):
        """测试获取空片段列表"""
        response = client.get('/api/snippets')
        assert response.status_code == 200
        assert response.json == []

    def test_create_snippet(self, client):
        """测试创建片段"""
        data = {
            'title': '新片段',
            'content': 'console.log("test")',
            'description': 'JavaScript测试',
            'snippet_type': 'code',
            'language': 'javascript',
            'tags': ['js', 'test']
        }
        response = client.post(
            '/api/snippets',
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        assert response.json['title'] == '新片段'
        assert response.json['language'] == 'javascript'
        assert 'id' in response.json

    def test_create_snippet_missing_required_fields(self, client):
        """测试创建片段缺少必需字段"""
        data = {'description': '缺少标题和内容'}
        response = client.post(
            '/api/snippets',
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert 'error' in response.json

    def test_get_snippets_with_data(self, client, sample_snippet):
        """测试获取片段列表（有数据）"""
        response = client.get('/api/snippets')
        assert response.status_code == 200
        assert len(response.json) == 1
        assert response.json[0]['title'] == '测试代码片段'

    def test_get_single_snippet(self, client, sample_snippet):
        """测试获取单个片段"""
        response = client.get(f'/api/snippets/{sample_snippet}')
        assert response.status_code == 200
        assert response.json['title'] == '测试代码片段'
        assert response.json['language'] == 'python'

    def test_get_nonexistent_snippet(self, client):
        """测试获取不存在的片段"""
        response = client.get('/api/snippets/9999')
        assert response.status_code == 404

    def test_update_snippet(self, client, sample_snippet):
        """测试更新片段"""
        data = {
            'title': '更新后的标题',
            'content': 'print("Updated")',
            'language': 'python3'
        }
        response = client.put(
            f'/api/snippets/{sample_snippet}',
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 200
        assert response.json['title'] == '更新后的标题'
        assert response.json['content'] == 'print("Updated")'
        assert response.json['language'] == 'python3'

    def test_update_nonexistent_snippet(self, client):
        """测试更新不存在的片段"""
        data = {'title': '不存在'}
        response = client.put(
            '/api/snippets/9999',
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_delete_snippet(self, client, sample_snippet):
        """测试删除片段"""
        response = client.delete(f'/api/snippets/{sample_snippet}')
        assert response.status_code == 204

        # 验证已删除
        response = client.get(f'/api/snippets/{sample_snippet}')
        assert response.status_code == 404

    def test_delete_nonexistent_snippet(self, client):
        """测试删除不存在的片段"""
        response = client.delete('/api/snippets/9999')
        assert response.status_code == 404


class TestFilterAndSearch:
    """测试搜索和过滤功能"""

    @pytest.fixture
    def multiple_snippets(self, app):
        """创建多个测试片段"""
        with app.app_context():
            snippets = [
                Snippet(
                    title='Python代码',
                    content='def hello(): pass',
                    snippet_type='code',
                    language='python',
                    tags='python,function'
                ),
                Snippet(
                    title='JavaScript代码',
                    content='function hello() {}',
                    snippet_type='code',
                    language='javascript',
                    tags='javascript,function'
                ),
                Snippet(
                    title='提示词模板',
                    content='请帮我写一个函数',
                    snippet_type='prompt',
                    language='',
                    tags='ai,prompt'
                )
            ]
            for snippet in snippets:
                db.session.add(snippet)
            db.session.commit()

    def test_filter_by_type(self, client, multiple_snippets):
        """测试按类型过滤"""
        # 代码类型
        response = client.get('/api/snippets?type=code')
        assert response.status_code == 200
        assert len(response.json) == 2

        # 提示词类型
        response = client.get('/api/snippets?type=prompt')
        assert response.status_code == 200
        assert len(response.json) == 1
        assert response.json[0]['snippet_type'] == 'prompt'

    def test_search_by_title(self, client, multiple_snippets):
        """测试按标题搜索"""
        response = client.get('/api/snippets?search=Python')
        assert response.status_code == 200
        assert len(response.json) == 1
        assert 'Python' in response.json[0]['title']

    def test_search_by_content(self, client, multiple_snippets):
        """测试按内容搜索"""
        response = client.get('/api/snippets?search=hello')
        assert response.status_code == 200
        assert len(response.json) >= 2

    def test_filter_by_tag(self, client, multiple_snippets):
        """测试按标签过滤"""
        response = client.get('/api/snippets?tag=python')
        assert response.status_code == 200
        assert len(response.json) == 1
        assert 'python' in response.json[0]['tags']

    def test_combined_filters(self, client, multiple_snippets):
        """测试组合过滤条件"""
        response = client.get('/api/snippets?type=code&search=hello')
        assert response.status_code == 200
        assert all(s['snippet_type'] == 'code' for s in response.json)


class TestTagsAPI:
    """测试标签接口"""

    def test_get_tags_empty(self, client):
        """测试获取空标签列表"""
        response = client.get('/api/tags')
        assert response.status_code == 200
        assert response.json == []

    def test_get_tags(self, client, sample_snippet):
        """测试获取标签列表"""
        response = client.get('/api/tags')
        assert response.status_code == 200
        assert 'python' in response.json
        assert '测试' in response.json
        assert len(response.json) == 2


class TestStatsAPI:
    """测试统计接口"""

    def test_get_stats_empty(self, client):
        """测试获取空统计"""
        response = client.get('/api/stats')
        assert response.status_code == 200
        assert response.json == {
            'total': 0,
            'code': 0,
            'prompt': 0
        }

    def test_get_stats_with_data(self, app, client):
        """测试获取统计信息"""
        # 创建测试数据
        with app.app_context():
            db.session.add(Snippet(
                title='Code 1',
                content='test',
                snippet_type='code'
            ))
            db.session.add(Snippet(
                title='Code 2',
                content='test',
                snippet_type='code'
            ))
            db.session.add(Snippet(
                title='Prompt 1',
                content='test',
                snippet_type='prompt'
            ))
            db.session.commit()

        response = client.get('/api/stats')
        assert response.status_code == 200
        assert response.json['total'] == 3
        assert response.json['code'] == 2
        assert response.json['prompt'] == 1


class TestDataPersistence:
    """测试数据持久性"""

    def test_snippet_persistence(self, app, client):
        """测试片段数据持久化"""
        # 创建片段
        data = {
            'title': '持久化测试',
            'content': 'test content',
            'snippet_type': 'code'
        }
        create_response = client.post(
            '/api/snippets',
            data=json.dumps(data),
            content_type='application/json'
        )
        snippet_id = create_response.json['id']

        # 在新的请求中获取
        get_response = client.get(f'/api/snippets/{snippet_id}')
        assert get_response.status_code == 200
        assert get_response.json['title'] == '持久化测试'


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
