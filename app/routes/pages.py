from flask import Blueprint, render_template, request, flash
from flask_mail import Message
from app import mail

pages = Blueprint('pages', __name__)

@pages.route('/about')
def about():
    return render_template('pages/about.html')

@pages.route('/recipes')
def recipes():
    recipes_list = [
        {
            'title': 'Berry Smoothie Bowl',
            'description': 'Start your day with this nutritious and delicious smoothie bowl packed with fresh berries.',
            'image': 'img/recipes/smoothie-bowl.jpg',
            'prep_time': '10 mins',
            'difficulty': 'Easy'
        },
        {
            'title': 'Mixed Berry Pie',
            'description': 'A classic dessert featuring a blend of fresh seasonal berries in a flaky homemade crust.',
            'image': 'img/recipes/berry-pie.jpg',
            'prep_time': '45 mins',
            'difficulty': 'Medium'
        },
        {
            'title': 'Berry Jam',
            'description': 'Make your own preserves with this simple recipe for homemade berry jam.',
            'image': 'img/recipes/berry-jam.jpg',
            'prep_time': '30 mins',
            'difficulty': 'Easy'
        }
    ]
    return render_template('pages/recipes.html', recipes=recipes_list)

@pages.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        try:
            msg = Message('New Contact Form Submission',
                        sender=email,
                        recipients=['your-email@berryboy.com'])
            msg.body = f"""
            From: {name}
            Email: {email}
            Message:
            {message}
            """
            mail.send(msg)
            flash('Thank you for your message! We will get back to you soon.', 'success')
        except Exception as e:
            flash('Sorry, there was an error sending your message. Please try again later.', 'error')
            
    return render_template('pages/contact.html')
