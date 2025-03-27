import joblib
import os

# Define the model path
MODEL_DIR = "model/"

# Load the trained model and necessary encoders
model = joblib.load(os.path.join(MODEL_DIR, "rti_department_model.pkl"))
location_encoder = joblib.load(os.path.join(MODEL_DIR, "location_encoder.pkl"))
department_encoder = joblib.load(os.path.join(MODEL_DIR, "department_encoder.pkl"))
vectorizer = joblib.load(os.path.join(MODEL_DIR, "vectorizer.pkl"))

def predict_department(location, query):
    """Predicts the department based on location and query."""
    location_encoded = location_encoder.transform([location])
    query_transformed = vectorizer.transform([query])

    # Make prediction
    prediction = model.predict(query_transformed)
    predicted_department = department_encoder.inverse_transform(prediction)[0]

    return predicted_department

print(predict_department("Delhi", "How can I access land records online?"))