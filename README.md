# Fourchan Monitor
A NestJS microservices app using NATS that politely polls the 4chan API for all threads and posts in a board and dumps them in a SQLite database.

## Key Features
1. Modern. Uses the [NestJS](https://nestjs.com) framework for a fully modern, microservices approach, all in Typescript.
2. Fully asynchronous. Uses [NATS](https://nats.io) for async processing and communication.
3. Scalable. Uses [SQLite](https://sqlite.org) for storage with batch operations properly wrapped in transactions.
4. Polite. Properly uses ETag and Last-Modified headers with HEAD requests to reduce load and traffic to the API.
5. Stable. A tried-and-true stack that's easy to maintain. No surprises here.
6. Up-to-date and secure. [Renovate](https://www.whitesourcesoftware.com/free-developer-tools/renovate/) and [Bolt](https://www.whitesourcesoftware.com/free-developer-tools/bolt/) from WhiteSource keep dependencies updated and secure.
