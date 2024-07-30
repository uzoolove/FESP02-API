# Front-End School Plus Project API Server
* GitHub URL: (https://github.com/uzoolove/FESP02-API.git)

## 오픈마켓 API 서버
* 제공되는 API 서버를 사용해서 FrontEnd를 완성하면 됩니다.
* API 서버의 주제는 오픈마켓이며 회원 관리, 상품 관리, 구매 관리, 후기 관리 등의 기능이 제공됩니다.
* 제공되는 API 기능을 잘 검토해서 어떤 종류의 쇼핑몰을 만들지는 각 팀에서 결정하면 됩니다.
	- 티셔츠 판매
  - 신발 판매
  - 중고제품 판매 등
* 최대한 제공되는 API만 이용해서 개발하고 제공되는 API 이외에 추가하고 싶은 기능이 있을 경우 요청하면 검토후 추가해 드릴수 있습니다.(단, 다만 새로운 API로 인해 기존 API에 변경이 발생하거나 요청한 API 구현이 복잡할 경우에는 추가가 어려울 수도 있습니다.)

## API 서버 구현 기술
* Application Server: Node.js + Express
* Database: MongoDB

## DB 초기화
* 기본으로 제공되는 샘플 데이터로 DB 초기화
```
npm run dbinit
```

## API 서버 테스트
### 자체 제공 API 문서
* https://localhost/apidocs
  - 브라우저에서 "연결이 비공개로 설정되어 있지 않습니다." 메세지가 나올 경우 "고급" 버튼을 누른 후 "localhost(안전하지 않음)" 클릭

### Postman
* https://www.postman.com/downloads 접속 후 다운로드
- 본인의 OS에 맞는 버전 다운로드 후 기본 설정으로 설치

### Postman 사용
#### Workspace 생성
* Workspaces > Create Workspace
  - Blank Workspace > Next
  - Name: FESP > Create

#### 환경 변수 추가
* Environments > + 버튼(Create new environment)
  - "New Environment" -> "API Server"로 수정
  - Variable: url
  - Type: default
  - initial value: https://localhost/api
  - Ctrl + S 눌러서 저장

#### Collection 추가
* Collections > + 버튼(Create new collection) > Blank collection
  - "New Collection" -> "Sample"로 수정

#### API Server 환경 변수 지정
* 우측 상단의 "No Environment" 클릭 후 Api Server 선택

#### Collection에 API 요청 추가(상품 상세 조회)
* 컬렉션 목록에 있는 Sample 컬렉션위에 마우스 올린 후 ··· 클릭해서 Add request 선택
  - "New Request" -> "상품 상세 조회"로 수정
  - "Enter URL or paste text" 항목에 {{url}}/products/4 입력 후 Send
  - 정상 응답 결과 확인

#### Collection에 API 요청 추가(회원 정보 조회)
* 컬렉션 목록에 있는 Sample 컬렉션위에 마우스 올린 후 ··· 클릭해서 Add request 선택
  - "New Request" -> "회원 정보 조회"로 수정
  - "Enter URL or paste text" 항목에 {{url}}/users/4 입력 후 Send
  - 401 응답 결과 확인("authorization 헤더가 없습니다.")

#### Collection에 API 요청 추가(로그인)
* 컬렉션 목록에 있는 Sample 컬렉션위에 마우스 올린 후 ··· 클릭해서 Add request 선택
  - "New Request" -> "로그인"로 수정
  - "GET" -> "POST"로 수정
  - "Enter URL or paste text" 항목에 {{url}}/users/login 입력
  - Body > raw > "Text" -> "JSON"으로 변경 후 아래처럼 입력 후 Send
  ```
  {
    "email": "u1@market.com",
    "password": "11111111"
  }
  ```
  - 정상 응답 결과 확인

##### 로그인 응답 결과로 받은 토큰을 환경 변수에 세팅
* Collections > 로그인 > Tests
  - 다음처럼 입력 후 Send
  ```
  if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    const accessToken = jsonData.item.token.accessToken;
    const refreshToken = jsonData.item.token.refreshToken;
    pm.environment.set("accessToken", accessToken);
    pm.environment.set("refreshToken", refreshToken);
  }
  ```
* Environments > API Server 환경 변수에 accessToken과 refreshToken 추가 되었는지 확인

##### 요청 헤더에 토큰 인증 정보 추가
* Collections > 회원 정보 조회 > Authorization(또는 Auth) 선택
  - Type: Bearer Token
  - Token: {{accessToken}}
  - Send
  - 정상 응답 결과 확인

#### 나머지 API
* FESP 워크스페이스 > Import > https://raw.githubusercontent.com/uzoolove/FES09-API/main/api/samples/OpenMarket.postman_collection.json
  - OpenMarket 컬렉션이 생성되고 테스트용 API가 import됨

