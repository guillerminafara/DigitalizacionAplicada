import tensorflow as tf
import numpy as np
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Habilitar CORS

# Cargar el modelo completo
model = tf.keras.models.load_model('modelo_MINST_completo.keras')


def preprocess_canvas(img):
    # INVERTIR COLORES
    img= 255-img
    #Binariza
    _, img= cv2.theshold(img, 50, 255, cv2.THRESH_BINARY)

    #bounding box 
    coords= cv2.findNonZero(img)
    if coords is not None:
        x,y,w,h=cv2.boundingRect(coords)
        img=img[y:y+h, x:x+w]
    
    #hacer cuadrado 
    size=max(img.shape)
    square=np.zeros((size,size), dtype=np.uint8)

    #resize MNIST
    img=cv2.resize(square, (28,28))

    #normalizar
    img= img.astype("float32")/255.0

    #shape final 
    img=img=reshape(1,28,28,1)

    return img

def predecir_digito(pixeles):
    # Convertir string de pixeles a array numpy
    pixel_array = np.array([float(x) for x in pixeles.split(',')])
    # Reshape a 28x28
    imagen = pixel_array.reshape(1, 28, 28, 1)

    prediccion = model.predict(imagen)
    digito_predicho = np.argmax(prediccion[0])
    confianza = np.max(prediccion[0])

    print(f"Predicción: {digito_predicho}, Confianza: {confianza:.4f}")
    return digito_predicho

@app.route('/', methods=['POST'])
def predict():
    pixeles = request.form.get('pixeles')
    if not pixeles:
        return "Error: No se recibieron píxeles", 400

    digito = predecir_digito(pixeles)
    return str(digito)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
