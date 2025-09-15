FROM python:3.10.14-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && rm -rf /var/lib/apt/lists/*

#clean apt caches to keep the image small
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

#Set the working directory for all following commands and the running app
WORKDIR /app

# deps (from requirements.txt)
COPY api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy application code into the image
COPY api/ /app/

#Start the FastAPI server (module main, app object app), listening on all interfaces.
# the port the app listens on (Uvicorn default)
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

#apple silicon potential problems
#docker buildx build --platform linux/amd64 -t itcm-api ./api
# or in compose:
#  platform: linux/amd64

