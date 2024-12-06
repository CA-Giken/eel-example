#!/usr/bin/env python
# mypy: ignore-errors

import os
import sys
import eel
from jinja2 import Environment, FileSystemLoader
import rospkg
import argparse
import rospy

# Actionsをインポートして、このファイルにバンドルする
from eel_ros1.actions import *  # noqa: F403
from eel_ros1.models import ros_service, rosparam

Config = ros_service.Config
OPTIONS = {
    "host": "0.0.0.0",
    "port": 8000,
    'cmdline_args': ["--no-sandbox"],
    'size': (800, 600),
    # "block": False
}

# Jinja2の設定
rospack = rospkg.RosPack()
package_path = rospack.get_path(Config['package_name'])
abs_path = os.path.join(package_path, 'templates')
os.makedirs(os.path.join(package_path, 'dist/web'), exist_ok=True)
env = Environment(loader=FileSystemLoader(abs_path))

# コマンドライン引数の処理
argv = rospy.myargv(argv=sys.argv)
parser = argparse.ArgumentParser(description="EEL Example")
parser.add_argument("--html_dir", help="HTML directory path")
parser.add_argument("--port", help="Port number")
args = parser.parse_args(argv[1:])
if args.html_dir:
    abs_path = args.html_dir
if args.port:
    OPTIONS['port'] = args.port

# HTMLのレンダリング関数
def render_template(template_name, **context):
    template = env.get_template(template_name)
    rendered = template.render(**context)

    # 生成したHTMLをdist/web/フォルダに保存
    with open(os.path.join(package_path, f'dist/web/{template_name}'), 'w', encoding='utf-8') as f:
        f.write(rendered)

def copy_js(js_path):
    with open(os.path.join(abs_path, js_path), 'r', encoding='utf-8') as f:
        js = f.read()
        with open(os.path.join(package_path, f'dist/web/{js_path}'), 'w', encoding='utf-8') as f:
            f.write(js)

def copy_css(css_path):
    with open(os.path.join(abs_path, css_path), 'r', encoding='utf-8') as f:
        css = f.read()
        with open(os.path.join(package_path, f'dist/web/{css_path}'), 'w', encoding='utf-8') as f:
            f.write(css)

if __name__ == '__main__':
    # templatesフォルダ直下のHTMLファイルをdist/web/に保存
    files = os.listdir(abs_path)
    for file in files:
        if file.endswith('.html'):
            render_template(file)
        if file.endswith('.js'):
            copy_js(file)
        if file.endswith('.css'):
            copy_css(file)
        

    dist_path = os.path.join(package_path, 'dist/web')
    print("Starting Eel app...")
    print("  dist path: ", dist_path)
    print("  hosted at:", f"http://{OPTIONS['host']}:{OPTIONS['port']}")
    eel.init(dist_path)
    rosparam.run_getparam_loop()
    eel.start('index.html', **OPTIONS)

    rosparam.break_getparam_loop()
    print("[CA] App quitted.")
    sys.exit()