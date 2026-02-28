# 🏪 우리동네 플리마켓 키오스크 (Flea Market Kiosk)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.2-646CFF.svg)](https://vitejs.dev/)

아이패드(iPad) 및 태블릿 환경에 최적화된 오프라인 플리마켓/팝업스토어 전용 무인 결제 키오스크 웹 애플리케이션입니다. 인터넷 연결 없이도 브라우저 스토리지(IndexedDB)를 활용해 동작하며, PWA 기능을 통해 네이티브 앱처럼 설치하여 전체 화면 배포가 가능합니다. 

---

## ✨ 핵심 기능

### 1. 직관적인 판매 및 장바구니 경험
- **산뜻하고 모던한 UI**: 화사한 라이트 모드와 고대비(High-Contrast) 다크 모드를 완벽 지원합니다.
- **빠른 항목 전환**: 동적 카테고리 탭 (음료, 라면, 햇반 등) 제공
- **현금 결제 도우미**: '받은 금액'을 빠르고 쉽게 입력할 수 있는 스마트 지폐 입력판(1,000원, 500원 등)과 '거스름돈 자동 계산' 기능
- **디바이스 최적화**: 레이아웃 깨짐을 방지하는 아이패드 가로(Landscape) 및 데스크탑 와이드 해상도 지원

### 2. 오프라인 & PWA (설치형 앱) 지원
- **데이터 보존**: `Zustand`와 `idb-keyval`의 조합으로, 새로고침하거나 브라우저를 껐다 켜도 등록된 상품 리스트, 현재 장바구니 내용, 그리고 가장 중요한 전체 판매(매출) 기록이 **안전하게 브라우저에 영구 보존**됩니다.
- **PWA 앱 설치 가능**: 브라우저 주소창 우측의 '앱 설치' 버튼을 통해 스마트 기기 및 데스크탑에 독립적인 전용 앱처럼 설치하여, URL 없는 전체 화면 쾌적 모드로 운영할 수 있습니다.

### 3. 막강한 관리자 전용 대시보드 (Admin)
- 안전한 PIN 번호 진입 (초기 비밀번호: `0000`)
- **실시간 매출 모니터링**: 오늘 총 몇 건이 팔렸고, 총매출액(카드/현금 비율)이 얼마인지 한눈에 파악.
- **현금 시재(준비금) 정산**: 장사 시작 전 투입한 현금을 기록해 두어, 최종 마감 시 금고에 있어야 할 전체 정산액을 1원 단위로 정확하게 계산해 줍니다.
- **상품 및 카테고리 자율 관리**: UI 화면 안에서 직관적으로 새로운 상품의 이름, 가격 부서(카테고리) 등을 클릭 몇 번으로 즉석에서 추가 및 삭제할 수 있습니다.
- **단일 거래 취소(삭제)**: 실수로 테스트 결제를 한 경우, 관리자 메뉴의 '전체 판매실적 모달창(영수증)'에서 개별 판매 기록의 쓰레기통 버튼을 눌러 안전보안 확인창을 통과한 후 판매 이력을 되돌릴 수 있습니다.
- 💾 **엑셀(Excel) 자동 추출**: 당일 모인 모든 거래 내역(판매 시각, 수단, 팔린 항목 1:1, 거스름돈 이력)을 회계 처리에 완벽하게 맞는 엑셀(.xlsx) 파일 형태로 즉시 다운로드 해줍니다. 상품-카테고리별 집계 대시보드 시트도 자동 생성됩니다.

---

## 🚀 빠른 시작 (Getting Started)

### 사전 요구사항
* Node.js (버전 18.0 이상 권장)
* npm 또는 yarn, pnpm

### 설치 및 구동

1. **저장소 클론하기**
   ```bash
   git clone https://github.com/malcano/flea-market-kiosk.git
   cd flea-market-kiosk
   ```

2. **패키지 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   > 팁: 실행 후 나오는 `http://localhost:5173` 링크로 접속하시고, 크롬 브라우저를 띄워 모바일 에뮬레이터 모드(아이패드 가로 등)로 보시면 훨씬 예쁘게 테스트할 수 있습니다!

4. **프로덕션 빌드 (배포용)**
   ```bash
   npm run build
   ```
   이후 `dist/` 폴더 안의 결과물들을 Netlify, Vercel, 혹은 아무 로컬 웹서버 등에 띄워 사용하시면 됩니다.

---

## 🤖 AI Assisted Development

이 프로젝트의 초기 기획과 주요 코드 작성 전반은 **[Google DeepMind Antigravity](https://deepmind.google/technologies/)** AI 코딩 어시스턴트와의 페어 프로그래밍을 통해 빠르고 안정적으로 개발/최적화 되었습니다. (Created with Google's Antigravity)

---

## 🛠️ 주요 사용 기술스택 (Tech Stack)

- **UI Framework**: React 18, TypeScript (Vite)
- **State Management**: Zustand (+ persist + idb-keyval 콤보로 최적화된 오프라인 로컬 저장소 구축)
- **Styling**: Native Vanilla CSS (모던 CSS Variables와 유리 질감 Glassmorphism 레이아웃)
- **Icons**: Lucide React 
- **Utilities**: xlsx (엑셀 자동 생성기)
- **PWA**: vite-plugin-pwa (매니페스트 & 캐싱/서비스워커 적용)

---

## 📝 관리자 핀(PIN) 변경 및 운영 팁

- 현재 로컬/샘플 개발 모드에서의 관리자 버튼(우측 중앙 스포크 아이콘) 비밀번호는 `0000`으로 고정 하드코딩 되어 있습니다.
- 만약 PIN 번호를 바꾸고 싶으시다면 `src/components/AdminView.tsx` 내부의 `pin === '0000'` 조건을 본인이 원하는 번호로 자율 수정해 주세요.
- 메인 화면에 크게 표시되는 상점명(기본: "플리마켓 키오스크")은 메인 홈에서 상점명 옆의 연필 모양의 수정 버튼을 눌러, 이번 행사/점포명에 맞게 즉석에서 영구 변경할 수 있습니다.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
상업적/비상업적 프로젝트나 자신의 대학 동아리/축제 등에 마음껏 가져가서 커스텀하고 포크하여 사용하셔도 됩니다!
