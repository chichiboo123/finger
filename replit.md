# 핑거피플 (Finger People)

손가락에서 시작하는 나만의 인물 상상 — 초등학생용 교육 웹앱. 손가락 5~10개에 각각 인물을 만들고, 드로잉하고, 디지털 인물 카드로 완성해 이미지/PDF로 내보내는 앱.

## Run & Operate

- `pnpm --filter @workspace/finger-people run dev` — 핑거피플 앱 실행 (workflow: `artifacts/finger-people: web`)
- `pnpm --filter @workspace/api-server run dev` — API 서버 실행 (현재 핵심 기능에는 미사용)
- `pnpm run typecheck` — 전체 타입 검사

## Stack

- React + Vite (react-vite artifact at `/`)
- IndexedDB via `idb` — 모든 인물 데이터 로컬 저장
- Canvas API + Pointer Events — 손가락 드로잉
- `html-to-image` + `jspdf` — 이미지/PDF 내보내기
- `framer-motion` — 애니메이션
- Pretendard 폰트 + Google Material Symbols (CDN)
- Tailwind CSS v4 + shadcn/ui

## Where things live

- `artifacts/finger-people/src/pages/` — 라우트별 페이지 (home, character-editor, cards, export)
- `artifacts/finger-people/src/components/` — 재사용 컴포넌트
- `artifacts/finger-people/src/lib/db.ts` — IndexedDB 스키마 및 헬퍼
- `artifacts/finger-people/src/lib/useCharacters.ts` — 전역 characters 상태 훅
- `artifacts/finger-people/src/lib/exportUtils.ts` — 이미지/PDF/클립보드 내보내기 유틸
- `artifacts/finger-people/index.html` — 폰트·아이콘 CDN 링크 포함

## Architecture decisions

- **No backend**: 모든 데이터를 IndexedDB에 로컬 저장. 로그인 없이 즉시 사용 가능.
- **Two canvas layers**: 손가락 실루엣(배경, 불변) + 사용자 드로잉(투명 레이어) 분리
- **Export only**: 결과물은 PNG/PDF 저장 또는 이미지 클립보드 복사로 전달함
- **Character ID**: `"left-1"` ~ `"left-5"`, `"right-1"` ~ `"right-5"` 형태로 고정
- **Shared character store**: `useCharacters`는 모듈 레벨 스토어 + `useSyncExternalStore`. 헤더·홈·편집기가 같은 목록을 본다
- **Finger hotspots**: `HandCanvas`는 손 PNG와 히트영역을 하나의 SVG(`viewBox`) 안에 넣어 좌표계를 공유. 손가락마다 실루엣을 스캔해 맞춘 tapered capsule 경로를 쓰므로 틀(프레임) 없이 손가락 모양 그대로 강조·채색된다
- **One drawing, three places**: `FingerSilhouette`(320×480)가 그리기 화면·인물 카드·완성 다이얼로그의 공통 원본. `HandCanvas`는 `drawingTransform()`으로 이 박스를 손가락 축에 회전·스케일해 얹으므로, 아이가 그린 그림이 어디서나 같은 손가락 위에 보인다
- **Deploy**: `.github/workflows/deploy.yml`이 main 푸시마다 GitHub Pages로 배포. `BASE_PATH`는 리포 이름 기준(`/finger/`)이며 SPA 딥링크용으로 `index.html`을 `404.html`로 복사한다

## User preferences

- 주 사용자: 초등학생 (직관적이고 단순한 UX 우선)
- 폰트: Pretendard GOV (body), 타이틀용 display 폰트 허용
- 아이콘: Google Material Symbols Outlined만 사용
- 이모지 UI 사용 금지
- KRDS 접근성 가이드라인 준수
- 푸터: "Created by. 교육뮤지컬 꿈꾸는 치수쌤" → https://litt.ly/chichiboo

## Gotchas

- `index.css`의 모든 CSS 변수는 HSL 공백구분 형식 (예: `248 80% 60%`). `hsl()` 래퍼 없음.
- `index.html`에 폰트·Material Symbols CDN `<link>` 태그 있어야 함.
- idb, html-to-image, jspdf는 `dependencies`에 설치됨 (devDependencies 아님).
- PointerEvents에서 setPointerCapture/releasePointerCapture 사용 시 `(e.target as Element)` 캐스팅 필요.
- `HandCanvas`의 손가락 좌표는 hand-right.png 기준(1414×2000 viewBox). 왼손은 x축 미러링으로 생성하므로 오른손 값만 고치면 된다. 손 이미지를 바꾸면 좌표를 다시 측정해야 함.
- `vite build`/`vite dev`는 `PORT`, `BASE_PATH` 환경변수가 있어야 config가 로드된다.
- `FingerDrawingCanvas`는 캐릭터가 바뀔 때 `key={charData.id}`로 리마운트해야 앞 인물의 그림이 남지 않는다.
- 편집기의 모바일/데스크톱 레이아웃은 CSS(`hidden md:flex`)가 아니라 `useIsMobile()`로 **하나만** 렌더한다. 둘 다 렌더하면 드로잉 캔버스가 2개 마운트돼 플로팅 버튼이 두 번 뜨고 undo 스택이 충돌한다.
- 이미지·정적 자산은 절대경로(`/foo.png`) 금지. 서브패스 배포에서 404가 난다. `import.meta.env.BASE_URL`를 붙일 것.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
