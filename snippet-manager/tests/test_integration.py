"""
集成测试 - 测试完整的用户场景和工作流
"""
import pytest
import requests
import time
import os


# 从环境变量获取测试URL，默认为本地
BACKEND_URL = os.getenv('TEST_BACKEND_URL', 'http://localhost:5000')
FRONTEND_URL = os.getenv('TEST_FRONTEND_URL', 'http://localhost:80')


class TestBackendIntegration:
    """后端集成测试"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """等待服务启动"""
        max_retries = 30
        for i in range(max_retries):
            try:
                response = requests.get(f'{BACKEND_URL}/api/stats', timeout=2)
                if response.status_code == 200:
                    break
            except requests.exceptions.RequestException:
                if i == max_retries - 1:
                    pytest.skip('后端服务未运行')
                time.sleep(1)

    def test_backend_health(self):
        """测试后端服务健康检查"""
        response = requests.get(f'{BACKEND_URL}/api/stats')
        assert response.status_code == 200
        assert 'total' in response.json()

    def test_full_crud_workflow(self):
        """测试完整的CRUD工作流"""
        # 1. 创建片段
        snippet_data = {
            'title': '集成测试片段',
            'content': 'def test(): return True',
            'description': '自动化测试创建',
            'snippet_type': 'code',
            'language': 'python',
            'tags': ['test', 'integration']
        }

        create_response = requests.post(
            f'{BACKEND_URL}/api/snippets',
            json=snippet_data
        )
        assert create_response.status_code == 201
        snippet_id = create_response.json()['id']

        # 2. 读取片段
        get_response = requests.get(f'{BACKEND_URL}/api/snippets/{snippet_id}')
        assert get_response.status_code == 200
        assert get_response.json()['title'] == '集成测试片段'

        # 3. 更新片段
        update_data = {
            'title': '更新后的集成测试片段',
            'content': 'def test(): return False'
        }
        update_response = requests.put(
            f'{BACKEND_URL}/api/snippets/{snippet_id}',
            json=update_data
        )
        assert update_response.status_code == 200
        assert update_response.json()['title'] == '更新后的集成测试片段'

        # 4. 验证列表中存在
        list_response = requests.get(f'{BACKEND_URL}/api/snippets')
        assert list_response.status_code == 200
        snippet_ids = [s['id'] for s in list_response.json()]
        assert snippet_id in snippet_ids

        # 5. 删除片段
        delete_response = requests.delete(f'{BACKEND_URL}/api/snippets/{snippet_id}')
        assert delete_response.status_code == 204

        # 6. 验证已删除
        get_deleted = requests.get(f'{BACKEND_URL}/api/snippets/{snippet_id}')
        assert get_deleted.status_code == 404

    def test_search_and_filter(self):
        """测试搜索和过滤功能"""
        # 创建测试数据
        test_snippets = [
            {
                'title': 'Python测试1',
                'content': 'print("test1")',
                'snippet_type': 'code',
                'language': 'python',
                'tags': ['python']
            },
            {
                'title': 'JavaScript测试',
                'content': 'console.log("test")',
                'snippet_type': 'code',
                'language': 'javascript',
                'tags': ['js']
            },
            {
                'title': 'AI提示词',
                'content': '请帮我写代码',
                'snippet_type': 'prompt',
                'tags': ['ai']
            }
        ]

        created_ids = []
        for snippet in test_snippets:
            response = requests.post(f'{BACKEND_URL}/api/snippets', json=snippet)
            if response.status_code == 201:
                created_ids.append(response.json()['id'])

        try:
            # 测试类型过滤
            code_response = requests.get(f'{BACKEND_URL}/api/snippets?type=code')
            assert code_response.status_code == 200
            code_snippets = [s for s in code_response.json() if s['id'] in created_ids]
            assert len(code_snippets) == 2

            # 测试搜索
            search_response = requests.get(f'{BACKEND_URL}/api/snippets?search=Python')
            assert search_response.status_code == 200
            search_results = [s for s in search_response.json() if s['id'] in created_ids]
            assert len(search_results) >= 1

            # 测试标签过滤
            tag_response = requests.get(f'{BACKEND_URL}/api/snippets?tag=python')
            assert tag_response.status_code == 200
            tag_results = [s for s in tag_response.json() if s['id'] in created_ids]
            assert len(tag_results) >= 1

        finally:
            # 清理测试数据
            for snippet_id in created_ids:
                requests.delete(f'{BACKEND_URL}/api/snippets/{snippet_id}')

    def test_tags_endpoint(self):
        """测试标签端点"""
        response = requests.get(f'{BACKEND_URL}/api/tags')
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_stats_endpoint(self):
        """测试统计端点"""
        response = requests.get(f'{BACKEND_URL}/api/stats')
        assert response.status_code == 200
        data = response.json()
        assert 'total' in data
        assert 'code' in data
        assert 'prompt' in data
        assert isinstance(data['total'], int)


class TestFrontendIntegration:
    """前端集成测试"""

    @pytest.fixture(autouse=True)
    def setup(self):
        """等待前端服务启动"""
        max_retries = 30
        for i in range(max_retries):
            try:
                response = requests.get(FRONTEND_URL, timeout=2)
                if response.status_code == 200:
                    break
            except requests.exceptions.RequestException:
                if i == max_retries - 1:
                    pytest.skip('前端服务未运行')
                time.sleep(1)

    def test_frontend_accessible(self):
        """测试前端可访问"""
        response = requests.get(FRONTEND_URL)
        assert response.status_code == 200
        assert 'text/html' in response.headers.get('Content-Type', '')

    def test_frontend_static_resources(self):
        """测试前端静态资源"""
        response = requests.get(FRONTEND_URL)
        assert response.status_code == 200

        # 检查HTML包含必要的元素
        html = response.text
        assert 'snippet' in html.lower() or 'app' in html.lower()


class TestEndToEnd:
    """端到端测试"""

    def test_backend_frontend_connectivity(self):
        """测试后端和前端连接性"""
        # 检查后端
        try:
            backend_response = requests.get(f'{BACKEND_URL}/api/stats', timeout=5)
            backend_ok = backend_response.status_code == 200
        except:
            backend_ok = False

        # 检查前端
        try:
            frontend_response = requests.get(FRONTEND_URL, timeout=5)
            frontend_ok = frontend_response.status_code == 200
        except:
            frontend_ok = False

        assert backend_ok or frontend_ok, "后端或前端至少一个应该可访问"

        if backend_ok and frontend_ok:
            print("\n✓ 后端和前端都正常运行")
        elif backend_ok:
            print("\n✓ 后端正常运行")
        elif frontend_ok:
            print("\n✓ 前端正常运行")


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
