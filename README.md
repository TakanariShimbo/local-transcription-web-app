## About

Sample Local Transcription Web App

1. Create .env file

2. Build docker image

```bash
# build api server
cd ./api_server
docker build -t local-transcription-web-app-api-server .

# build worker
cd ./worker
docker build -t local-transcription-web-app-worker .
```

3. Start container

```bash
docker compose up -d
```

4. Open UI

```bash
# UI-SERVER-PORT: set at .env
http://localhost:UI-SERVER-PORT/
```

5. Check monitor of cache server

- Access the following url

```url
# CACHE-SERVER-MONITOR-PORT: set at .env
http://localhost:CACHE-SERVER-MONITOR-PORT/
```

- Click [Add Redis database]
- Enter the following items

```
Host: cache-server-container
Database Alias: Your optional name
Username: default
Password: CACHE_SERVER_PASSWORD set at .env
```
