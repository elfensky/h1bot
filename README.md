# h1bot

inspired by hellbot, this will notify users of helldiver 1 defense events

## Setup

1. Install dependencies

```bash
npm i
```

2. Create a `.env` file in the root directory of the project and add the following variables:

```conf
TOKEN=your-bot-token-here
CLIENT_ID=your-client-id-here
GUILD_ID=your-guild-id-here
```

3. Run `npm run dev` to start the bot
4. Run `npm run deploy` to deploy the commands to your server

## Docker

#### Build local

docker build -t elfensky/h1bot .

#### Build production

docker buildx build --platform linux/amd64 -t elfensky/h1bot:latest . --push
