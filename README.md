## About

Sample Local Transcription Web App

![sample](./README/sample.gif)

## Required

- docker
- nvidia-driver
- nvidia-container-toolkit

## How to use

1. Create .env file

2. Start container

```bash
docker compose up -d
```

3. Open UI

```bash
# UI-SERVER-PORT: set at .env
http://localhost:UI-SERVER-PORT/
```

4. Check monitor of cache server

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
