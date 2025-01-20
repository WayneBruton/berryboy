from flask import Blueprint, render_template, flash, redirect, url_for, request, current_app
from flask_login import current_user
from flask_mail import Message
from app import mail
from app.forms.contact import ContactForm
from app.models.product import Product, Category
import traceback

main = Blueprint('main', __name__)

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

@main.route('/contact', methods=['GET', 'POST'])
def contact():
    try:
        form = ContactForm()
        if form.validate_on_submit():
            try:
                # Send email
                msg = Message(
                    subject=f"Contact Form: {form.subject.data}",
                    sender=form.email.data,
                    recipients=["info@berryboy.com"],  # Replace with your email
                    body=f"""
                    From: {form.name.data} <{form.email.data}>
                    Subject: {form.subject.data}
                    
                    Message:
                    {form.message.data}
                    """
                )
                mail.send(msg)
                flash('Thank you for your message! We will get back to you soon.', 'success')
                return redirect(url_for('main.contact'))
            except Exception as e:
                current_app.logger.error(f"Error sending email: {str(e)}")
                flash('Sorry, there was an error sending your message. Please try again later.', 'danger')
        
        return render_template('pages/contact.html', form=form)
    except Exception as e:
        current_app.logger.error(f"Error in contact route: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return "An error occurred", 500
