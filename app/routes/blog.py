from flask import Blueprint, render_template

blog = Blueprint('blog', __name__)

@blog.route('/blog')
def index():
    return render_template('blog/index.html')

@blog.route('/blog/post/<int:post_id>')
def post(post_id):
    return render_template('blog/post.html')
