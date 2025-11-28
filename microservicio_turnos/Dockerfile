# Usar una imagen de base con la version 3 de Python
FROM python:3-alpine

# Colocarse en el directorio /app dentro del contenedor
WORKDIR /app

# Copiar el archivo de requerimientos de la app
COPY requirements.txt .

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Instalar locales para fecha y hora
ENV MUSL_LOCPATH="/usr/share/i18n/locales/musl"
RUN apk add --no-cache --update musl-locales tzdata
ENV LANG=es_AR
ENV TZ=America/Buenos_Aires

# Copiar la aplicacion
COPY main.py .

# Abrir el puerto 8001
EXPOSE 8001

# Iniciar el servidor desde el archivo main con el objeto app de fastapi
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8001"]