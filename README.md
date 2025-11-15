# Synos
Synos is a web-base art gallery platform that allows user to create, buy and sell arts focus on contemporary art.


## Local Installation

### Prerequisites

- Docker
- Docker Compose
- Git

### Installation

```bash
# Clone the repository
$ git clone https://github.com/thep1ckaxe91/synos.git

# Navigate to the project directory
$ cd synos

# Build and run the containers
$ docker-compose up --build
```

### Accessing the Application

Once the containers are up and running, you can access the application at:

- Frontend Gallery: http://localhost:3001
- Frontend Admin: http://localhost:3000
- Backend: http://localhost:8080

### Stopping the Application

To stop the containers, you can use the following command:

```bash
$ docker-compose down
```
