from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import io
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://ton-front.vercel.app", "*"]}})
# Charger le meilleur modèle entraîné
model = tf.keras.models.load_model("Model/best_model.h5")

# Liste des classes selon ton dataset
classes = ['Parasitée', 'Non infectée']

@app.route('/')
def home():
    return "✅ API Flask pour classification de cellules prête !"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Vérifie si une image a été envoyée
        if 'file' not in request.files:
            return jsonify({'error': 'Aucun fichier envoyé'}), 400
        
        file = request.files['file']
        
        # Lecture et prétraitement de l'image
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((64, 64))  # adapte à la taille d’entrée de ton modèle
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0  # normalisation comme à l'entraînement

        # Prédiction
        prediction = model.predict(img_array)
        predicted_class = classes[int(prediction[0][0] < 0.5)] if prediction.shape[1] == 1 else classes[np.argmax(prediction)]

        return jsonify({
            'prediction': predicted_class,
            'confidence': float(np.max(prediction))
        })

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
