from flask import Blueprint, render_template

test_routes = Blueprint('test_routes', __name__)

@test_routes.route('/image-test')
def image_test():
    """Test page for checking if images are loading correctly"""
    return render_template('main/image_test.html')
