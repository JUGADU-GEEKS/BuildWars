from flask import Flask, request, render_template, Blueprint, session, jsonify
from views import views
from auth import auth
import os
from dotenv import load_dotenv


def create_app():
    app = Flask(__name__)
    load_dotenv()
    SECRET_KEY = os.getenv("SECRET_KEY")
    app.secret_key = SECRET_KEY

    #registering the blueprints
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    @app.route('/')
    def home():
        return render_template('home.html')

    @app.route('/get-gemini-key')
    def get_gemini_key():
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return jsonify({'error': 'Gemini API key not found in environment variables'}), 500
        return jsonify({'key': api_key})

    return app

