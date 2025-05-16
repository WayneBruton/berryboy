from flask import Blueprint, render_template, flash, redirect, url_for, request, current_app
from flask_login import current_user
from flask_mail import Message
from app import mail
from app.forms.contact import ContactForm
from app.models.product import Product, Category
import traceback

main = Blueprint('main', __name__)

@main.route('/image-test')
def image_test():
    """Test page for direct image testing"""
    return render_template('main/image_direct_test.html')

@main.route('/')
def index():
    try:
        featured_products = Product.query.filter_by(is_active=True).limit(4).all()
        categories = Category.query.all()
        return render_template('main/index.html', 
                             featured_products=featured_products,
                             categories=categories)
    except Exception as e:
        current_app.logger.error(f"Error in index route: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return "An error occurred", 500

@main.route('/about')
def about():
    try:
        current_app.logger.info("Rendering about page")
        return render_template('pages/about.html')
    except Exception as e:
        current_app.logger.error(f"Error in about route: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return "An error occurred", 500

# This route is commented out to resolve conflict with the one in pages.py
# @main.route('/contact', methods=['GET', 'POST'])
# def contact():
#     print(">>> MAIN BLUEPRINT CONTACT ROUTE ACCESSED")
#     try:
#         form = ContactForm()
#         if form.validate_on_submit():
#             try:
#                 msg = Message(
#                     subject=f"Contact Form: {form.subject.data}",
#                     recipients=[current_app.config['MAIL_USERNAME']],
#                     body=f"From: {form.name.data}\nEmail: {form.email.data}\n\nMessage:\n{form.message.data}",
#                     sender=form.email.data
#                 )
#                 mail.send(msg)
#                 flash('Your message has been sent successfully!', 'success')
#                 return redirect(url_for('main.contact'))
#             except Exception as e:
#                 current_app.logger.error(f"Failed to send email: {str(e)}")
#                 flash('Sorry, there was a problem sending your message. Please try again.', 'danger')
#         
#         return render_template('pages/contact.html', form=form)
#     except Exception as e:
#         current_app.logger.error(f"Error in contact route: {str(e)}")
#         flash('An unexpected error occurred. Please try again.', 'danger')
#         return redirect(url_for('main.index'))
