from flask import Flask, Blueprint, render_template, request, session, jsonify
from model import User
from prediction import predict_department


views = Blueprint('views', __name__)

@views.route('/')
def index():
    return render_template('welcome.html')

@views.route('/test')
def test():
    user_new = session.get('user')
    email = user_new.get('email')
    user = User.get_data(email)
    return render_template('test.html', user=user)
@views.route('/home')
def home():
    return render_template('home.html')

@views.route('/predict', methods=['POST','GET'])
def predict():
    if request.method=='POST':
        query = request.form.get('query')
        department = predict_department("Delhi", query)
        return render_template('home.html', department=department)
    return render_template('home.html', department='write your query...')

@views.route('/speak', methods=['POST','GET'])
def speak():
    if request.method=='POST':
        query = request.form.get('query')
        if(query):
            return render_template('home.html', query=query)
    return render_template('speaker.html')


