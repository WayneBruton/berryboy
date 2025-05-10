from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, Length, EqualTo

class LoginForm(FlaskForm):
    """
    Form for user login
    Validates email and password
    """
    email = StringField('Email', validators=[
        DataRequired(),
        Email()
    ])
    password = PasswordField('Password', validators=[
        DataRequired()
    ])

class RegisterForm(FlaskForm):
    """
    Form for user registration
    Validates name, email, and password
    """
    name = StringField('Name', validators=[
        DataRequired(),
        Length(min=2, max=50, message="Name must be between 2 and 50 characters")
    ])
    email = StringField('Email', validators=[
        DataRequired(),
        Email(message="Please enter a valid email address")
    ])
    password = PasswordField('Password', validators=[
        DataRequired(),
        Length(min=6, message="Password must be at least 6 characters")
    ])
