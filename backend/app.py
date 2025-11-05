# from flask import Flask, request, jsonify
# import numpy as np
# import tensorflow as tf
# from tensorflow.keras.preprocessing import image
# import io
# from PIL import Image
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# # Liste des classes selon ton dataset
# classes = ['Parasitée', 'Non infectée']

# # Lazy loading du modèle
# model = None
# def get_model():
#     global model
#     if model is None:
#         model = tf.keras.models.load_model("Model/best_model.h5")
#     return model

# @app.route('/')
# def home():
#     return "✅ API Flask pour classification de cellules prête !"

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         if 'file' not in request.files:
#             return jsonify({'error': 'Aucun fichier envoyé'}), 400
        
#         file = request.files['file']
#         img = Image.open(io.BytesIO(file.read())).convert('RGB')
#         img = img.resize((64, 64))
#         img_array = image.img_to_array(img)
#         img_array = np.expand_dims(img_array, axis=0)
#         img_array = img_array / 255.0

#         model = get_model()
#         prediction = model.predict(img_array)

#         predicted_class = classes[int(prediction[0][0] < 0.5)] if prediction.shape[1] == 1 else classes[np.argmax(prediction)]

#         return jsonify({
#             'prediction': predicted_class,
#             'confidence': float(np.max(prediction))
#         })
#     except Exception as e:
#         return jsonify({'error': str(e)})

# if __name__ == '__main__':
#     app.run(debug=True)

import os
from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import io
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Liste des classes du dataset
classes = ['Parasitée', 'Non infectée']

# Lazy loading du modèle
model = None
def get_model():
    global model
    if model is None:
        model = tf.keras.models.load_model("Model/best_model.h5")
    return model

@app.route('/')
def home():
    return "✅ API Flask pour classification de cellules prête !"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Aucun fichier envoyé'}), 400
        
        file = request.files['file']
        img = Image.open(io.BytesIO(file.read())).convert('RGB')
        img = img.resize((64, 64))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0

        model = get_model()
        prediction = model.predict(img_array)
        prob = float(prediction[0][0])

        # Seuils de confiance
        seuil_incertitude = 0.4  # entre 0.4 et 0.6 = doute
        if 0.4 < prob < 0.6:
            return jsonify({
                'prediction': 'Inconnue',
                'message': "⚠️ L'image ne semble pas correspondre à une cellule connue par le modèle.",
                'confidence': round(prob * 100, 2)
            }), 200
        
        # Si le modèle est sûr
        if prob >= 0.5:
            predicted_class = 'Parasitée'
            confidence = prob * 100
        else:
            predicted_class = 'Non infectée'
            confidence = (1 - prob) * 100

        return jsonify({
            'prediction': predicted_class,
            'confidence': round(confidence, 2)
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)