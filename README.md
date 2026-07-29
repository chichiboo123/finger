# 핑거피플 (Finger People)

> 손가락에서 시작하는 나만의 인물 상상

핑거피플은 손가락 하나를 하나의 인물로 상상해 이름, 특징, 좋아하는 것과 목표를 기록하고 직접 그림을 그려 인물 카드로 완성하는 교육용 웹 애플리케이션입니다. 기본 오른손 5명으로 시작하며 필요하면 양손 10명까지 확장할 수 있습니다.

## 주요 기능

### 손가락 기반 인물 만들기

- 손 그림 또는 접근성용 손가락 목록에서 만들 손가락을 선택합니다.
- 인물의 이름, 생김새, 좋아하는 것, 싫어하는 것, 목표와 말버릇을 기록합니다.
- 작업 내용은 브라우저에 자동 저장됩니다.
- `완성하기`로 초안을 완성 상태로 전환하고 완성 카드만 따로 모아볼 수 있습니다.
- 오른손 5명에서 양손 10명으로 확장할 수 있습니다.

### 디지털 드로잉

- 펜, 지우개, 페인트통 도구를 제공합니다.
- 기본 색상 팔레트 또는 사용자 지정 색상을 사용할 수 있습니다.
- 펜과 지우개의 굵기를 조절할 수 있습니다.
- 실행 취소, 다시 실행, 전체 지우기를 지원합니다.
- 페인트통은 선으로 막힌 연결 영역을 한 번에 채웁니다.
- 모바일에서는 화면 공간을 확보하기 위해 그림 도구를 하단 시트로 표시합니다.

### 카드 갤러리

- 전체 인물 또는 완성된 인물만 필터링할 수 있습니다.
- 격자 보기와 한 장씩 보기를 지원합니다.
- 각 카드를 PNG로 저장하거나 이미지로 클립보드에 복사할 수 있습니다.
- 저장된 인물을 다시 편집하거나 삭제할 수 있습니다.

### 내보내기와 공유

- 인물 카드 또는 손 모양 결과물을 PNG 이미지로 저장할 수 있습니다.
- A4 PDF로 내보낼 수 있으며, 내용이 길면 여러 페이지로 나뉩니다.
- 현재 미리보기 이미지를 클립보드에 복사할 수 있습니다.

## 사용 방법

1. 첫 화면의 손에서 원하는 손가락을 선택합니다.
2. **정보** 화면에서 인물의 이름과 특징을 입력합니다.
3. **그림** 화면에서 펜, 색상 팔레트, 페인트통 등을 이용해 모습을 그립니다.
4. 상단의 **완성하기** 버튼을 누릅니다.
5. 완성 안내에서 다음 손가락을 만들거나 **인물 카드 보기**로 이동합니다.
6. **내보내기** 메뉴에서 출력 형태와 배치를 선택한 뒤 PNG, PDF 또는 클립보드 복사 기능을 사용합니다.

## 데이터와 개인정보

핑거피플은 별도의 로그인 없이 동작합니다. 인물 정보와 그림은 브라우저의 IndexedDB(`fingerpeople-db`)에 저장되며 서버로 자동 전송되지 않습니다.

- 같은 기기와 같은 브라우저 프로필에서만 저장 내용이 유지됩니다.
- 시크릿 모드 종료, 사이트 데이터 삭제 또는 앱의 **모두 지우기**를 실행하면 데이터가 사라질 수 있습니다.
- 다른 기기로 앱 주소만 전달하면 인물 데이터는 따라가지 않습니다.
- 인물을 전달하려면 내보내기 화면에서 PNG/PDF로 저장하거나 이미지를 클립보드에 복사해야 합니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프런트엔드 | React 19, TypeScript, Vite |
| 스타일 | Tailwind CSS 4, shadcn/ui, Radix UI |
| 라우팅 | Wouter |
| 로컬 저장 | IndexedDB, `idb` |
| 드로잉 | Canvas API, Pointer Events |
| 이미지 내보내기 | `html-to-image` |
| PDF 내보내기 | jsPDF |
| 상태 동기화 | `useSyncExternalStore`, TanStack Query 기반 앱 셸 |
| API | Express (현재 핵심 사용자 데이터에는 사용하지 않음) |
| 패키지 관리 | pnpm workspace |

## 프로젝트 구조

```text
.
├── artifacts/
│   ├── finger-people/          # React 웹 애플리케이션
│   │   ├── public/             # 손 이미지, 파비콘 등 정적 파일
│   │   └── src/
│   │       ├── components/     # 손 캔버스, 드로잉 도구, 카드, 공통 UI
│   │       ├── hooks/          # 반응형 및 UI 훅
│   │       ├── lib/            # IndexedDB, 전역 저장소, 내보내기 유틸
│   │       └── pages/          # 홈, 편집기, 카드, 내보내기 화면
│   └── api-server/             # Express API와 상태 확인 엔드포인트
├── lib/
│   ├── api-client-react/       # 생성된 API 클라이언트
│   ├── api-zod/                # API 스키마
│   └── db/                     # Drizzle/PostgreSQL 공용 패키지
├── scripts/                    # 워크스페이스 스크립트
├── package.json
└── pnpm-workspace.yaml
```

주요 파일은 다음과 같습니다.

- `artifacts/finger-people/src/pages/home.tsx`: 손 선택과 진행 현황
- `artifacts/finger-people/src/pages/character-editor.tsx`: 인물 편집, 자동 저장, 완성 처리
- `artifacts/finger-people/src/components/FingerDrawingCanvas.tsx`: Canvas 드로잉과 페인트통
- `artifacts/finger-people/src/components/DrawingToolbar.tsx`: 도구와 색상 팔레트
- `artifacts/finger-people/src/pages/cards.tsx`: 인물 카드 갤러리
- `artifacts/finger-people/src/pages/export.tsx`: 미리보기와 내보내기 화면
- `artifacts/finger-people/src/lib/db.ts`: IndexedDB 스키마와 CRUD 함수
- `artifacts/finger-people/src/lib/useCharacters.ts`: 화면 간 인물 상태 동기화
- `artifacts/finger-people/src/lib/exportUtils.ts`: PNG, PDF, 클립보드 내보내기

## 개발 환경 준비

### 요구 사항

- Node.js 20 이상 권장
- pnpm

이 저장소는 pnpm 사용을 강제합니다. npm이나 Yarn으로 의존성을 설치하지 마세요.

```bash
pnpm install
```

Vite 설정은 실행 환경에서 `PORT`와 `BASE_PATH`를 요구합니다. 로컬 루트 경로에서 실행할 때는 다음 값을 사용할 수 있습니다.

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/finger-people dev
```

브라우저에서 `http://localhost:5173/`을 엽니다.

### 프로덕션 빌드

```bash
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/finger-people build
```

빌드 결과는 `artifacts/finger-people/dist/public`에 생성됩니다.

### 빌드 결과 미리보기

```bash
PORT=4173 BASE_PATH=/ pnpm --filter @workspace/finger-people serve
```

### 검사 명령

```bash
# 전체 워크스페이스 타입 검사
pnpm typecheck

# 웹 앱만 타입 검사
pnpm --filter @workspace/finger-people typecheck

# 전체 빌드
PORT=4173 BASE_PATH=/ pnpm build
```

## API 서버

핵심 인물 데이터는 API 서버가 아니라 브라우저 IndexedDB에 저장됩니다. API 서버에는 현재 상태 확인용 `GET /api/healthz`가 준비되어 있습니다.

```bash
PORT=3000 pnpm --filter @workspace/api-server dev
```

`@workspace/db`를 사용하는 서버 기능을 추가할 경우 `DATABASE_URL` 환경 변수가 필요합니다.

## 브라우저 호환성과 권한

- 기본 작성과 로컬 저장에는 IndexedDB가 필요합니다.
- 드로잉에는 Canvas API와 Pointer Events가 필요합니다.
- 이미지 클립보드 복사는 HTTPS 또는 localhost 같은 보안 컨텍스트와 클립보드 권한이 필요할 수 있습니다.
- 클립보드 복사를 지원하지 않는 환경에서는 PNG 저장을 사용하세요.

## 배포

GitHub Pages처럼 하위 경로에 배포할 경우 `BASE_PATH`에 저장소 경로를 지정해야 합니다.

```bash
PORT=4173 BASE_PATH=/finger/ pnpm --filter @workspace/finger-people build
```

SPA 라우팅을 사용하는 정적 호스팅에서는 모든 화면 요청이 `index.html`로 돌아오도록 fallback 또는 `404.html`을 설정해야 합니다. 정적 자산은 Vite의 `BASE_URL`을 기준으로 참조해야 하므로 코드에 루트 절대경로를 직접 추가하지 않는 것이 좋습니다.

## 문제 해결

### `PORT environment variable is required` 오류

명령 앞에 포트 환경 변수를 지정합니다.

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/finger-people dev
```

### `BASE_PATH environment variable is required` 오류

로컬 개발은 `/`, 하위 경로 배포는 `/finger/`처럼 앞뒤 슬래시를 포함한 경로를 사용합니다.

### 완성한 카드가 보이지 않을 때

- 카드 갤러리에서 **완성된 것만** 필터가 선택되었는지 확인합니다.
- 편집 화면에서 이름을 입력하고 **완성하기**를 눌렀는지 확인합니다.
- 같은 브라우저 프로필에서 앱을 열었는지 확인합니다.

### 클립보드 복사가 되지 않을 때

- HTTPS 또는 localhost에서 실행 중인지 확인합니다.
- 브라우저의 이미지 클립보드 쓰기 권한을 확인합니다.
- 지원하지 않는 브라우저에서는 PNG 저장을 이용합니다.

## 접근성

- 손 이미지 외에 키보드와 스크린 리더로 사용할 수 있는 손가락 목록을 제공합니다.
- 주요 아이콘 버튼에 접근 가능한 이름을 지정합니다.
- 본문 바로가기 링크와 현재 메뉴 상태를 제공합니다.
- 터치 환경을 고려해 충분한 크기의 버튼과 모바일 전용 도구 시트를 사용합니다.

## 라이선스

루트 패키지에 명시된 라이선스는 MIT입니다.
