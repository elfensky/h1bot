# h1bot

inspired by hellbot, this will notify users of helldiver 1 defense events

## Setup local environment

1. Install dependencies

```bash
npm i
```

2. Create a `.env` file in the root directory of the project and add the following variables:

```conf
TOKEN=your-bot-token-here
CLIENT_ID=your-client-id-here
GUILD_ID=your-guild-id-here
CHANNEL_ID=your-guild-channel-id-here
```

3. Run `npm run dev` to start the bot with nodemon, which will restart the bot on file changes
4. Run `npm run deploy` to deploy the commands to your server
5. Run `npm run start` to start the bot with node in production mode

## Docker

#### Build local

docker build -t elfensky/h1bot:latest .

#### Build production

docker buildx build --platform linux/amd64,linux/arm64 -t elfensky/h1bot:latest . --push

#### Run in production

1. docker pull elfensky/h1bot:latest
2. create an .env file with the same variables as above and note its path
3. create a docker-compose.yml file with the following content:

```yml
services:
    h1bot:
        image: elfensky/h1bot:latest # Replace with the correct image name and tag
        container_name: h1bot # Optional: name your container
        env_file:
            - .env # Replace with the path to your .env file
        volumes:
            - /path/on/host:/app/data
        restart: unless-stopped # Automatically restart the container unless it is explicitly stopped
```

4. run `docker-compose up -d` to start the bot

#### Updates

1. `docker pull elfensky/h1bot:latest` to pull the latest version
2. `docker-compose up -d` to recreate and restart the container
