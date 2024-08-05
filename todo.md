## auth.js 방식으로 인증 처리
* 콜백 URL을 API 서버로 등록해서 인증 처리 및 회원가입, 로그인
  - 또는 인증 완료 후 jwt 콜백에서 구글, 깃허브 등의 인증 데이터 추출해서 회원 등록 및 자동 로그인 처리

## 커뮤니티 앱에 추가
* 사용 기술 스택 : Typescript, Next.js, Tainwind CSS, Zustand, 나머지는 협의

구현하고 싶은 기능 : 커뮤니티 개설, 게시판, 실시간 채팅, 투표, 설문, 사다리, 출석체크, n빵, 신청곡, 주변 맛집 추천/후기 등 온/오프라인 커뮤니티에 필요한 기능들
지원 자격: 

### 커뮤니티
* 커뮤니티 단위로 모든 하위 서비스 동작

* 커뮤니티 개설
  - 활성화 할 서비스 선택
  - 게시판, 채팅, 투표, 설문, 사다리, 출석체크, 엔빵, 회의실 예약, 주변 맛집 추천/후기, 신청곡 재생
* 회원 자동/수동 등업
* 커뮤니티 관리자 지정
  - 메뉴별 관리 가능 여부 지정


### 회의실 예약
* extra로 팀 등록
  - 팀이 등록한 회의실 정보 조회 가능
* 회의실 시간을 상품으로 관리하고 수량 1개로 지정
  - 회의실 관리자가 요일, 시간 선택해서 일괄적으로 상품 등록
  

### 음악 재생
* 쉬는 시간에 미리 등록한 목록 자동으로 재생
* 신청자가 직접 검색해서 신청하면 자동으로 플레이 리스트에 추가
* DJ 계정과 일반 계정으로 구분
  - DJ 계정은 자신의 음악 구독 서비스 등록
* 접속한 모든 사용자에게 플레이
* DJ의 컴퓨터에서만 플레이
* DJ는 플레이리스트 관리 가능
