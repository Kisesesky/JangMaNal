# launchd Jobs

## Files

- `com.hoya.jangmanal.crawler.all.plist`: 통합 실행(`all`) 매일 03:00
- `com.hoya.jangmanal.crawler.emart.plist`: 이마트 매일 03:10
- `com.hoya.jangmanal.crawler.lottemart.plist`: 롯데마트 매일 03:15
- `com.hoya.jangmanal.crawler.homeplus.plist`: 홈플러스 매일 03:20
- `com.hoya.jangmanal.crawler.marketkurly.plist`: 마켓컬리 매일 03:25
- `com.hoya.jangmanal.crawler.wisely.plist`: 와이즐리 매일 03:30

## Install

```bash
./install_launchd.sh all
./install_launchd.sh split
```

## Manual control examples

```bash
launchctl kickstart -k gui/$(id -u)/com.hoya.jangmanal.crawler.all
launchctl unload ~/Library/LaunchAgents/com.hoya.jangmanal.crawler.all.plist
```
