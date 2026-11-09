# KiDD Joy — Telegram 연결 설정

연동 대상: [@KiDD_Joy_Bot](https://t.me/KiDD_Joy_Bot).

## 필요한 GitHub Actions Secrets

* `TELEGRAM_BOT_TOKEN`: BotFather에서 재발급한 토큰. 채팅이나 커밋에 붙여 넣지 않습니다.
* `TELEGRAM_CHAT_ID`: 텔레그램에서 봇과 대화를 시작한 개인 채팅의 숫자 ID.

저장소 → Settings → Secrets and variables → Actions → New repository secret.

## 개인 채팅 ID 찾기

1. 텔레그램에서 @KiDD_Joy_Bot을 열고 `/start`를 보냅니다.
2. 본인이 신뢰하는 로컬 환경에서 Bot API의 `getUpdates` 응답을 확인합니다. 반환된 메시지의 `chat.id` 숫자가 채팅 ID입니다. 토큰이 포함된 URL을 외부 서비스에 제출하거나 공유하지 마세요.
3. 같은 Bot API에 webhook이 등록되어 있다면 `getUpdates`는 작동하지 않습니다. 이 경우 webhook 기반 연동을 별도로 검토하세요.
4. `TELEGRAM_CHAT_ID`를 GitHub Secret으로 등록합니다. 개인 메시지가 맞는지 `chat.type == "private"`를 확인하세요.

## 시험 발송

GitHub → Actions → **KiDD Joy Telegram connection test** → Run workflow.

이 워크플로는 `getMe`로 봇 식별자를 검증한 뒤, 등록된 `TELEGRAM_CHAT_ID`로 시험 메시지 한 건을 보냅니다. Secret이나 채팅 ID는 실행 로그에 출력하지 않습니다.

## 범위

이 워크플로는 **발신 시험만** 수행합니다. 텔레그램 메시지 수신, ChatGPT 자동응답, 24시간 상시 봇 구동 또는 홈페이지 새 글 감지는 아직 구현하지 않았습니다. 이 기능들은 별도 설계와 승인, 데이터 보안 검토가 필요합니다.
