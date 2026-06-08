FROM python:3.10-slim

WORKDIR /code

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app
COPY ./df_kmeans.csv /code/df_kmeans.csv

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]