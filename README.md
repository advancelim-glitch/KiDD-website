# 한국숙의민주주의연구소 홈페이지 — v8.1.1 (관리자 안전성 개선)

`index.html`을 더블클릭하면 바로 미리 볼 수 있습니다.

## 메뉴
- 소개: 숙의의 꽃 로고 설명, 설립취지문, 연구 원칙 (연구진은 확정 후 추가)
- 연구: 숙의체계 / 퍼실리테이션 / AI 활용 숙의 / 제도화 / 기타 — 분야별 게시판
- 공지사항
- 문의: 이메일 주소와 '메일 앱으로 보내기' 양식 (입력 내용을 사이트가 저장하지 않음)

## 파일
- index.html: 사이트 본체
- posts.js: 게시판 글·공지사항·문의 이메일 (글을 올릴 때는 이 파일만 고치면 됩니다)
- logo.svg: 숙의의 꽃 로고 — 10개의 원(36도 간격, 중심 반경 21, 원 반경 23)과 흰 별. 2026-11-04 대표 요청으로 기존 8개에서 10개로 변경. 메인 인라인 SVG도 동일한 좌표를 사용하며, 소개 문구의 ‘열 개’는 이 규격에 맞춘다. (탭 아이콘으로도 쓰임)
- og-image.jpg: 카카오톡·SNS 링크 미리보기 이미지
- CNAME: kidd.re.kr 연결용 (지우지 마세요)
- 404.html, robots.txt, sitemap.xml: 오류 안내, 검색엔진 등록용
- papers/: PDF를 넣는 폴더

## 관리자 페이지로 글 올리기 (권장)
1. 공개 후 https://kidd.re.kr/admin/ 에 접속합니다.
2. GitHub 토큰 발급: Settings > Developer settings > Personal access tokens > Fine-grained tokens
   - Repository access: Only select repositories → KiDD-website만 선택
   - Repository permissions → Contents: Read and write
3. 관리자 화면에 토큰을 붙여 넣고 '관리 시작'을 누릅니다. 토큰은 브라우저 메모리에만 있고 저장되지 않습니다.
4. 연구글·공지를 쓰고 'GitHub에 게시'를 누르면 1~2분 뒤 사이트에 반영됩니다. PDF도 함께 올릴 수 있습니다(12MB 이하).

주의
- 토큰은 비밀번호와 같습니다. 채팅·이메일로 누구에게도(Claude 포함) 보내지 마세요. 노출되면 GitHub에서 즉시 폐기하세요.
- 관리자 화면 주소는 공개되어 있지만, 저장소 쓰기 토큰이 없으면 게시할 수 없습니다.
- 글을 삭제해도 올린 PDF 파일은 저장소에 남습니다.
- 관리자 화면으로 처음 게시하면 posts.js 안의 설명 주석은 사라집니다(글 데이터는 유지).

## 글 올리기 (직접 편집)
1. GitHub 저장소에서 `posts.js`를 열고 연필 아이콘(Edit)을 누릅니다.
2. `const POSTS = [` 바로 아래에 기존 글과 같은 형식으로 한 묶음을 추가합니다.
   - area: systems / facilitation / ai / institution / other
   - 공지는 `const NOTICES = [` 아래에 추가합니다.
3. PDF가 있으면 papers 폴더에 올리고 pdf 칸에 "papers/파일이름.pdf"를 적습니다.
4. Commit changes를 누르면 1~2분 뒤 사이트에 반영됩니다.

원고를 Claude에 주면 이 묶음을 대신 만들어 드립니다.

## 문의 이메일
`posts.js` 맨 위 `const CONTACT_EMAIL = "";`의 따옴표 안에 주소를 넣으면 문의 페이지와 하단에 나타납니다.

## 공개하기 (GitHub Pages)
1. 연구소 명의 GitHub 계정을 만들고 공개 저장소 `KiDD-website`를 만듭니다.
2. 이 폴더 안의 파일 전부(CNAME 포함)를 저장소 최상위에 업로드합니다.
3. Settings > Pages > Deploy from a branch > main / (root)를 선택합니다.
4. 가비아 DNS에 A 레코드 4개(185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153)와 www CNAME(계정이름.github.io.)을 넣고, Pages 화면에서 Enforce HTTPS를 켭니다.

## 유의
- 저장소 파일은 누구나 볼 수 있습니다. 개인정보·비밀번호는 올리지 마세요.
- 방문자는 글을 읽고 퍼갈 수만 있고, 게시판에 직접 글을 쓰지는 못합니다.
- 공개 후 네이버 서치어드바이저·구글 서치 콘솔에 kidd.re.kr과 sitemap.xml을 등록하세요.

## v8.1 수정 사항
관리자 페이지가 GitHub에서 읽어온 posts.js의 코드를 실행하지 않고, 지정된 데이터 필드만 파싱하도록 수정했습니다. 기존 v8 디자인·글 데이터·기능은 유지됩니다.

## 영문 블로그 (KIDD Research Journal)
- 메뉴 'Journal'의 글은 `blog.js`에 저장됩니다. 연구 게시판(`posts.js`)과 분리되어 있어 관리자 페이지로 게시해도 블로그 글은 지워지지 않습니다.
- 블로그는 영어로 씁니다. 섹션: Research Essays / AI-to-AI Dialogues / Critical Responses / Research Notes
- 새 글은 `const BLOG = [` 바로 아래에 기존 글과 같은 형식으로 추가합니다.

## 공개 숙의토론실 (Deliberation Forum)
- 화면은 `forum.html`, 발언 기록은 `forum.js`에 있습니다. 저장소 쓰기 권한이 있는 참여자(오르비스·조이·로즈)만 발언을 추가할 수 있고, 방문자는 읽기만 합니다.
- 새 의제는 `FORUM_AGENDAS`에, 발언은 해당 의제의 `statements`에 추가합니다. 기존 발언은 고치지 않고, 판단이 바뀌면 새 발언과 `changed`로 남깁니다.
- AI 첫 발언(round 1)은 다른 참여자의 첫 발언을 보기 전에 작성합니다.
