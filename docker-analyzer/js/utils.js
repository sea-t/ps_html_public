// 工具函数模块

/**
 * 加载示例数据
 */
export function getExampleData() {
    return `CONTAINER ID   IMAGE                                       COMMAND                   CREATED             STATUS                       PORTS                                                                          NAMES
9df7471a0773   registry.fit2cloud.com/maxkb/maxkb:v2.2.1   "bash -c /usr/bin/st…"   25 minutes ago      Up 25 minutes (healthy)      5432/tcp, 6379/tcp, 0.0.0.0:9003->8080/tcp                                     maxkb
5f4497c0aaf6   registry.fit2cloud.com/maxkb/maxkb:v2.2.1   "bash -c /usr/bin/st…"   About an hour ago   Up About an hour (healthy)   5432/tcp, 8080/tcp, 127.0.0.1:6379->6379/tcp                                   redis
277b62894c09   registry.fit2cloud.com/maxkb/maxkb:v2.2.1   "bash -c /usr/bin/st…"   About an hour ago   Up About an hour (healthy)   6379/tcp, 127.0.0.1:5432->5432/tcp, 8080/tcp                                   pgsql
158e3410ffdb   nginx:latest                                "sh -c 'cp /docker-e…"   3 weeks ago         Up 3 weeks                   0.0.0.0:443->443/tcp, :::443->443/tcp, 0.0.0.0:9004->80/tcp, :::9004->80/tcp   docker-nginx-1
f6ba5cc935d8   langgenius/dify-api:1.7.1                   "/bin/bash /entrypoi…"   3 weeks ago         Up 3 weeks                   5001/tcp                                                                       docker-worker_beat-1
8812aa4c957c   langgenius/dify-api:1.7.1                   "/bin/bash /entrypoi…"   3 weeks ago         Up 3 weeks                   5001/tcp                                                                       docker-api-1
b0737800efa7   langgenius/dify-api:1.7.1                   "/bin/bash /entrypoi…"   3 weeks ago         Up 3 weeks                   5001/tcp                                                                       docker-worker-1
7ac888bf25d2   langgenius/dify-plugin-daemon:0.2.0-local   "/bin/bash -c /app/e…"   3 weeks ago         Up 3 weeks                   0.0.0.0:5003->5003/tcp, :::5003->5003/tcp                                      docker-plugin_daemon-1
ec2590773987   langgenius/dify-sandbox:0.2.12              "/main"                   3 weeks ago         Up 3 weeks (healthy)                                                                                        docker-sandbox-1
48d7292bd38c   langgenius/dify-web:1.7.1                   "/bin/sh ./entrypoin…"   3 weeks ago         Up 3 weeks                   3000/tcp                                                                       docker-web-1
12fccc32e7ec   redis:6-alpine                              "docker-entrypoint.s…"   3 weeks ago         Up 3 weeks (healthy)         6379/tcp                                                                       docker-redis-1
9c82aa0a8ec8   postgres:15-alpine                          "docker-entrypoint.s…"   3 weeks ago         Up 3 weeks (healthy)         5432/tcp                                                                       docker-db-1
666898bfea0f   semitechnologies/weaviate:1.19.0            "/bin/weaviate --hos…"   3 weeks ago         Up 3 weeks                                                                                                  docker-weaviate-1
1e1fbae690d8   ubuntu/squid:latest                         "sh -c 'cp /docker-e…"   3 weeks ago         Up 3 weeks                   3128/tcp                                                                       docker-ssrf_proxy-1
1108f2574317   xprobe/xinference:v0.16.3-cpu               "xinference-local -H…"   3 weeks ago         Up 3 weeks                   0.0.0.0:9997->9997/tcp, :::9997->9997/tcp                                      xinference`;
}

/**
 * 显示或隐藏元素
 */
export function toggleElement(element, show) {
    element.style.display = show ? 'block' : 'none';
}

/**
 * 设置元素HTML内容
 */
export function setHTML(element, html) {
    element.innerHTML = html;
}

/**
 * 清空元素内容
 */
export function clearElement(element) {
    element.innerHTML = '';
}
