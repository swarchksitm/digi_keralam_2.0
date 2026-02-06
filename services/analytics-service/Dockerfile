FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
# Install system dependencies
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     libpq-dev \
#     && rm -rf /var/lib/apt/lists/*
# Skipped for speed + using binary wheels


# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn psycopg2-binary djangorestframework_simplejwt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Command
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
