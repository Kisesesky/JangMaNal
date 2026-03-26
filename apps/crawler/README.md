# Mart Crawler (Python)

이마트, 롯데마트, 홈플러스, 마켓컬리, 와이즐리 상품 정보를 크롤링해서 PostgreSQL에 저장합니다.

## 프로젝트 구조

```text
apps/crawler/
├── mart_crawler/
│   ├── cli.py                 # CLI 엔트리포인트
│   ├── core/                  # 설정/DB 연결
│   ├── domain/                # 도메인 규칙(카테고리, 스키마)
│   ├── crawlers/              # 마트별 크롤러
│   ├── persistence/           # ORM 모델/저장소
│   └── services/              # 크롤링/스케줄/정리 서비스
├── scripts/                   # 실행 스크립트
└── logs/                      # 실행 로그
```

## 설치

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## DB 초기화

```bash
python -m mart_crawler init-db
```

## 1회 실행

전체 마트:

```bash
python -m mart_crawler crawl --mart all
```

특정 마트:

```bash
python -m mart_crawler crawl --mart emart
python -m mart_crawler crawl --mart lottemart
python -m mart_crawler crawl --mart homeplus
python -m mart_crawler crawl --mart marketkurly
python -m mart_crawler crawl --mart wisely
```

## 스케줄 실행 (매일 03:00)

전체 마트:

```bash
python -m mart_crawler schedule --mart all
```

## 스크립트 실행 (권장)

통합 스크립트(인자만 바꿔 재사용):

```bash
./scripts/run_crawler_daily.sh all
./scripts/run_crawler_daily.sh emart
./scripts/run_crawler_daily.sh lottemart
./scripts/run_crawler_daily.sh homeplus
./scripts/run_crawler_daily.sh marketkurly
./scripts/run_crawler_daily.sh wisely
```

마트별 래퍼 스크립트:

```bash
./scripts/run_emart_daily.sh
./scripts/run_lottemart_daily.sh
./scripts/run_homeplus_daily.sh
./scripts/run_marketkurly_daily.sh
./scripts/run_wisely_daily.sh
```

로그 파일:

```text
logs/{mart}-crawler.log
logs/launchd-{mart}.out.log
logs/launchd-{mart}.err.log
```

예시 `{mart}`: `emart`, `lottemart`, `homeplus`, `marketkurly`, `wisely`, `all`

## launchd 등록

루트에서 아래를 실행하면 `infra/launchd`의 plist 파일을 `~/Library/LaunchAgents`로 복사하고 로드합니다.

```bash
cd ../../infra/launchd
./install_launchd.sh all
```

## 참고

- 홈플러스는 검색 API + 상세 API(`item/getItemDetail.json`)를 조합해 image_url을 수집합니다.
- 마켓컬리는 sitemap 기반으로 상품 URL을 수집하고 상세 페이지에서 가격/이미지를 파싱합니다.
