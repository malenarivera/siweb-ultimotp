FROM python:3-alpine

WORKDIR /app

COPY requirements.txt .

# Dependencias para levantar y trabajar con postgres en python
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    g++ \
    python3-dev \
    musl-dev \
    postgresql-dev

RUN apk add --no-cache libpq

# Install curl
RUN apk add --no-cache curl

RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8003

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8003"]
