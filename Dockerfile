FROM python:3.14-rc-slim

WORKDIR /app

COPY requirements.txt .

RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && pip install psycopg2 

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV VAULT_ADDR="https://vault.tchowdhury.org"

EXPOSE 50000

CMD ["python", "api.py"]