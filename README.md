## Getting Started

**Dev workflow:**
```bash
yarn install        # install deps + runs postinstall (nuxt prepare + prisma generate)
yarn db:migrate     # create + apply a new migration after schema changes
yarn dev            # start dev server at http://localhost:3000
yarn db:studio      # open Prisma Studio GUI to inspect/edit data
yarn db:seed        # seed the database (runs prisma/seed.ts)
yarn lint:fix       # fix lint issues before committing
```

**After pulling changes:**
```bash
yarn install        # postinstall → nuxt prepare + prisma generate
yarn db:migrate     # apply any new migrations
```

**Deploy (Node.js server):**
```bash
yarn install        # installs deps + generates Prisma client
yarn db:deploy      # apply pending migrations (safe for prod, no prompts)
yarn build          # outputs to .output/
node .output/server/index.mjs
```

`db:migrate` — dev only, creates migration files interactively  
`db:deploy` — production only, applies existing migrations silently

## Local database (Docker)

```bash
docker-compose -p postgres up -d --build
```
