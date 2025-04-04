from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
print(f"Loaded MONGO_URI: {MONGO_URI}")
client = MongoClient(MONGO_URI)
db = client['Student-Community']
users_collection = db['users']

class User:
    def __init__(self, data):
        self.full_name = data.get('full_name')
        self.email = data.get('email')
        self.contact = data.get('contact')
        self.password = generate_password_hash(data.get('password'))
        self.otp = None
        self.isVerified = False

    def save_to_db(self):
        if users_collection.find_one({"email": self.email}):
            return False, "Email already exists!"
        users_collection.insert_one(self.__dict__)
        return True, "Account created! Please verify your email."

    @staticmethod
    def verify_user(email, otp):
        user = users_collection.find_one({"email": email})
        if user and user['otp'] == otp:
            users_collection.update_one({"email": email}, {"$set": {"is_verified": True}})
            return True
        return False

    @staticmethod
    def check_password(email, password):
        user = users_collection.find_one({"email": email})
        return user and check_password_hash(user['password'], password)
    
    def upload_image(self, image_address):
        self.profile_photo=image_address

    @staticmethod
    def get_data(email):
       return users_collection.find_one({"email": email})
    
    def update_otp(self, otp):
        self.otp = otp
        users_collection.update_one({"email": self.email}, {"$set": {"otp": otp}})

    @staticmethod
    def update_password(email, password):
        users_collection.update_one({"email":email}, {"$set":{"password": generate_password_hash(password)}})
