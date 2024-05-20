# This project aims to show an example of an implementation of Passkey auth with nuxthub and Olso/Lucia Auth

I welcome contributions, tests and error handling

### The next step for me is to test it in production on cloudflare workers

### To deploy on CloudFlare :

1. Build

```
pnpm build
```

2. Create a D1 database

```
pnpm wrangler d1 create <DATABASE_NAME>
```

3. Bind Worker with D1 Database

```
----
filename : wrangler.toml
----
name = "nuxthub-cloudflare-lucia"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "<DATABASE_NAME>"
database_id = "<UNIQUE_ID_PROVIDED_BY_WRANGLER_CLI>"
```

4. execute migrations on your DB (with remote flag for production)

```
pnpm wrangler d1 execute <DATABASE_NAME> --remote --file server/database/migrations/0000_clean_nico_minoru.sql
pnpm wrangler d1 execyte <DATABASE_NAME> --remote --file server/database/migrations/0001_minor_ultimatum.sql
```

5. deploy

```
pnpm wrangler pages deploy
```
