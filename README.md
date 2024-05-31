# Chat Room
- _Framework:_ NestJS
- _DatabaseORM:_ Prisma
- _npm version:_ 10.5.2
- _node version:_ v20.13.1
- _yarn version:_ 1.22.22

## Architecture
- RESTful API
- MySQL
- socket.io
- redis

## Features
- User authentication with basic username/password login. The credentials can be hardcoded. 
- Creation of a single chat room upon server startup. No need to create multiple rooms. 
- Persistent storage of chat messages in a Database. 
- Sending and receiving messages in the chat room. The client must be able to fetch the room messages 
- RESTful endpoints for message sending, and message retrieval. 
- Unit testing 
- WebSocket support for real-time chat communication.
- Deletion of messages by clients. 
- CI/CD skeleton 
- Server scalability 

## Installation

```bash
$ yarn install
```

## Migration
```bash
# Apply migration
$ yarn prisma migrate deploy
# create migration 
$ yarn prisma migrate dev --name="<your_migration_name>"
```

## Environment

| Name          | Description                     | Data type                                        |
| ------------- | ------------------------------- | ------------------------------------------------ |
| NODE_ENV      | The node environment            | `development`, `production`, `test`, `provision` |
| PORT          | The service port                | Number                                           |
| DATABASE_URL  | The database URL, Prisma format | String                                           |
| JWT_SECRET    | The JWT Secret                  | String                                           |
| JWT_ISSUER    | The JWT Issuer                  | String                                           |
| JWT_EXPIRE_IN | The Time expires in JWT         | Number                                           |
| REDIS_URL     | The redis URL                   | String                                           |

## Running the app

### Running on local

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### Running on docker

```bash
# Start your application by running: 
$ docker compose up --build
```

#### Docker expose 3 services listen on:
1. http://localhost:8081
2. http://localhost:8082
3. http://localhost:8083

## Test

```bash
# unit tests
$ yarn run test
```

## Source code structure

```
├── README.md
├── nest-cli.json
├── yarn.lock
├── package.json
├── prisma
├── src
│   ├── app.module.ts
│   ├── main.ts
│   ├── config
│       ├── configuration.interface.ts
│       ├── configuration.ts
│       └── validation.ts
│   ├── core (for common using)
│   │   ├── base (for base abstract class)
│   │   ├── constants (for service constants)
│   │   ├── decorators (for some decorators)
│   │   ├── enums (for enums)
│   │   ├── exceptions (custom exception model)
│   │   ├── filters (exception filter for error handler)
│   │   ├── guards (guards for authorization handler)
│   │   ├── interceptors (service interceptors)
│   │   ├── interfaces (for the service interfaces)
│   │   ├── middlewares (service middlewares)
│   │   ├── models (some service common models)
│   │   ├── types (for common types)
│   │   ├── ultils (for ultils function)
│   ├── modules
│       ├── auth
│       ├── chat
│       ├── health
│       ├── prisma (prisma service)
│       ├── pubsub (redis pubsub service)
│       ├── user
│       └── ...
├── test
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── Dockerfile
├── compose.yml
├── Dockerfile
└── tsconfig.json
```
