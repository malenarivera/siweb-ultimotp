FROM python:3-alpine

WORKDIR /app

COPY requirements.txt .

# Install build dependencies including g++
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    g++ \
    python3-dev \
    musl-dev \
    postgresql-dev


RUN apk add --no-cache libpq

RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8002

CMD ["uvicorn", "main:app",  "--reload", "--host", "0.0.0.0", "--port", "8002"]
