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
        print("Valeur renvoyée par le modèle :", prediction)


        # Calcul correct de la classe et de la confiance
        # Calcul correct de la classe et de la confiance
        if prediction.shape[1] == 1:  # binaire
            prob = float(prediction[0][0])
            # Clamp la valeur entre 0 et 1
            prob = min(max(prob, 0.0), 1.0)
            if prob >= 0.5:
                predicted_class = 'Parasitée'
                confidence = prob * 100
            else:
                predicted_class = 'Non infectée'
                confidence = (1 - prob) * 100
        else:  # multi-classes
            max_prob = float(np.max(prediction))
            max_prob = min(max(max_prob, 0.0), 1.0)
            predicted_class = classes[np.argmax(prediction)]
            confidence = max_prob * 100
        return jsonify({
            'prediction': predicted_class,
            'confidence': round(confidence, 2)  # arrondi à 2 décimales
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
