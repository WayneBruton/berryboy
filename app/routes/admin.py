from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app.models.product import Product, Category
from app.models.user import User
from app import db
from functools import wraps

admin_blueprint = Blueprint('admin_panel', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('You need to be an admin to access this page.', 'danger')
            return redirect(url_for('main.index'))
        return f(*args, **kwargs)
    return decorated_function

@admin_blueprint.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    products_count = Product.query.count()
    users_count = User.query.count()
    categories_count = Category.query.count()
    return render_template('admin/dashboard.html',
                         products_count=products_count,
                         users_count=users_count,
                         categories_count=categories_count)

@admin_blueprint.route('/admin/products')
@login_required
@admin_required
def admin_products():
    products = Product.query.all()
    return render_template('admin/products.html', products=products)

@admin_blueprint.route('/admin/product/new', methods=['GET', 'POST'])
@login_required
@admin_required
def new_product():
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        price = float(request.form.get('price'))
        stock = int(request.form.get('stock'))
        category_id = int(request.form.get('category_id'))
        
        product = Product(
            name=name,
            description=description,
            price=price,
            stock=stock,
            category_id=category_id
        )
        
        if 'image' in request.files:
            file = request.files['image']
            if file.filename:
                # Handle image upload
                pass
        
        db.session.add(product)
        db.session.commit()
        
        flash('Product created successfully!', 'success')
        return redirect(url_for('admin_panel.admin_products'))
    
    categories = Category.query.all()
    return render_template('admin/new_product.html', categories=categories)

@admin_blueprint.route('/admin/product/<int:id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_product(id):
    product = Product.query.get_or_404(id)
    
    if request.method == 'POST':
        product.name = request.form.get('name')
        product.description = request.form.get('description')
        product.price = float(request.form.get('price'))
        product.stock = int(request.form.get('stock'))
        product.category_id = int(request.form.get('category_id'))
        
        if 'image' in request.files:
            file = request.files['image']
            if file.filename:
                # Handle image upload
                pass
        
        db.session.commit()
        flash('Product updated successfully!', 'success')
        return redirect(url_for('admin_panel.admin_products'))
    
    categories = Category.query.all()
    return render_template('admin/edit_product.html', product=product, categories=categories)

@admin_blueprint.route('/admin/product/<int:id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted successfully!', 'success')
    return redirect(url_for('admin_panel.admin_products'))
