## Getting Started

First, run the development server:

```bash
yarn run dev
# or
yarn dev
# or
pnpm dev
```
## Prisma commands:

```bash
npx prisma generate dev
npx prisma migrate dev
npx prisma db seed
```

## Docker commands:

```bash
docker-compose -p postgres up  -d --build
```

## Prod prisma env variables:

binaries:
https://github.com/gek64/prisma-engines-freebsd

```bash
export PRISMA_QUERY_ENGINE_BINARY="/home/sergiisoftware/prisma-engines/query-engine"
export PRISMA_QUERY_ENGINE_LIBRARY="/home/sergiisoftware/prisma-engines/libquery_engine-freebsd13.so.node"
export PRISMA_SCHEMA_ENGINE_BINARY="/home/sergiisoftware/prisma-engines/schema-engine"
export PRISMA_CLI_QUERY_ENGINE_TYPE="library"
export PRISMA_CLIENT_ENGINE_TYPE="library"
```