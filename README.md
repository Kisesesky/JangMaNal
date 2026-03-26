# JangMaNal Monorepo

## Structure

```text
JangMaNal/
├── apps/
│   ├── web/        # Next.js
│   ├── api/        # NestJS
│   └── crawler/    # Python crawler
├── packages/
│   ├── types/
│   └── utils/
├── infra/
│   ├── docker/
│   ├── db/
│   └── launchd/
├── .env
├── docker-compose.yml
└── README.md
```

## Apps

Web:

```bash
cd apps/web
npm run dev
```

API:

```bash
cd apps/api
npm run start:dev
```

Crawler:

```bash
cd apps/crawler
source .venv/bin/activate
python -m mart_crawler crawl --mart all
```

## Crawler Scripts

```bash
apps/crawler/scripts/run_crawler_daily.sh all
apps/crawler/scripts/run_emart_daily.sh
apps/crawler/scripts/run_lottemart_daily.sh
apps/crawler/scripts/run_homeplus_daily.sh
apps/crawler/scripts/run_marketkurly_daily.sh
apps/crawler/scripts/run_wisely_daily.sh
```

## launchd

launchd plist 파일은 `infra/launchd`에 있습니다.

```bash
cd infra/launchd
./install_launchd.sh all
```
