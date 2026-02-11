FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000 8080

# Servir tanto la API como el frontend
CMD ["sh", "-c", "python3 -m http.server 8080 & python MINST.py"]
