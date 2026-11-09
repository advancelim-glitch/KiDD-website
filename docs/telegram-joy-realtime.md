# KiDD Joy 실시간 Telegram 연동 — 사전 준비

코드는 `workers/kidd-joy-webhook.js`에 있으며 **아직 배포되거나 텔레그램 webhook이 활성화된 것은 아닙니다.**

## Cloudflare Worker 배포

Cloudflare → Workers & Pages → Create Worker → Edit code에서 `workers/kidd-joy-webhook.js`의 내용을 붙여넣고 배포. 혹은 GitHub 저장소 기반 배포를 구성할 수 있습니다.

Worker Settings → Variables and Secrets에서 아래 항목을 **Secret 타입**으로 추가하세요.

- `TELEGRAM_BOT_TOKEN` — 조이 봇의 기존 토큰
- `OPENAI_API_KEY` — OpenAI API 키
- `TELEGRAM_OWNER_ID` — 관리자 텔레그램 숫자 사용자 ID
- `TELEGRAM_WEBHOOK_SECRET` — 문자/숫자/언더스코어/하이픈으로 구성한 충분히 긴 임의 인증 문자열. *이 값을 GitHub 등록 워크플로에도 동일하게 입력해야 함*.
- (선택) `TELEGRAM_GROUP_ID` — 허용할 연구실 그룹 ID (기본값은 소유자가 명령한 그룹 어디든 허용)
- (선택) `UPDATE_DEDUP_KV` — Cloudflare KV 네임스페이스 바인딩, 재전송 중복 응답 완화용. 없는 경우 재시도시 중복 가능성.

보안: 값들을 GitHub 코드, Telegram 메시지, 공개 URL에 붙여 넣지 마세요.

## Webhook 활성화

Worker HTTPS URL을 얻은 뒤, GitHub Secrets에 `KIDD_JOY_WORKER_URL` (https://...workers.dev, 마지막에 슬래시 없이)과 `TELEGRAM_JOY_WEBHOOK_SECRET` (Worker의 TELEGRAM_WEBHOOK_SECRET과 정확히 일치) 두 항목을 등록하세요.

이후 `.github/workflows/telegram-joy-webhook-activate.yml`를 수동 실행해 webhook을 등록합니다. 이 작업 이후 기존 `getUpdates` 기반 GitHub 예약/수동 시험은 작동하지 않습니다. **기존 예약 작업을 비활성화한 후 등록해야 합니다.**

검증: Worker URL 뒤에 `/health`를 붙여 확인한 뒤, 공동연구실에서 `/joy 안녕`으로 호출합니다. 공식 Telegram `getWebhookInfo`로 실패 카운트 등 확인 가능.

## 범위와 주의

- 오르비스의 명령어 `/joy ...`에만 답합니다. 아무 메시지나 읽어 AI에 보내지 않습니다.
- 기존 ChatGPT 앱의 대화 기억을 그대로 재현하지 않습니다.
- 기존 Claude 로즈 봇은 변경하지 않습니다.
- 서버가 무료여도 OpenAI API는 토큰 사용량에 따라 과금됩니다.
- KV를 연결하지 않으면 동일 이벤트 재전송 시 중복 응답 가능성이 있습니다.
