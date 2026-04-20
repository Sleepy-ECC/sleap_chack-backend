# sleap_chack-backend

`Hono + Zod + Drizzle` を使った backend API です。

## セットアップ

```bash
cp .env.example .env
vi .env
npm install
npm run dev
```

ヘルスチェック:

```bash
curl http://localhost:8080/healthz
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run check
npm run db:generate
npm run db:push
npm run docker:build
npm run deploy:cloudrun
```
