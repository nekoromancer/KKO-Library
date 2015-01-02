KKO-Library
===========

간편하게 사용하는 카카오 톡, 스토리 라이브러리 입니다(이하 kko).

# 설치

bower를 사용하면 간편하게 설치할 수 있습니다.
```
bower install kko
```

혹은 git을 이용하거나,
```
git clone https://github.com/nekoromancer/KKO-Library.git
```

우측의 Download ZIP을 통해 수동으로 다운로드 할 수 있습니다.

kko는 다음 라이브러리의 종속성을 갖고 있습니다.<br />
[daumcorp/web2app](https://github.com/daumcorp/web2app)<br />
[daumcorp/ua_parser](https://github.com/daumcorp/ua_parser)

위 두가지 라이브러리는 bower를 이용해 설치한 경우 bower_components 디렉토리에 같이 설치되며, git을 통해 내려받으신 경우 lib 폴더에서 찾으실 수 있습니다.

```html
	<script src="your/directory/web2app.js"></script>
	<script src="your/directory/userAgent.js"></script>
	<script src="your/directory/kko.js"></script>
```
위의 예제와 같이 kko.js를 포함한 라이브러리를 html에서 로드합니다.

```html
  <script src="https://developers.kakao.com/sdk/js/kakao.min.js"></script>
```
마지막으로 Kakao SDK를 로드합니다. 위의 경로를 사용해도 좋고, 직접 다운로드 받아서 사용하셔도 됩니다.<br />
Kakao SDK를 로드하지 않은 경우 라이브러리가 알아서 로드하기 때문에 생략하셔도 됩니다.

# kko.init(appId)
### Description
Kakao SDK를 초기화 합니다. 

### Parameters
appId: Kakako 개발자 페이지에서 등록한 Application ID

# kko.login(success, failed)
### Description
Kakao 계정으로 로그인 합니다.

### Parameters
success: 로그인 성공시 콜백 함수. 사용자 정보가 첫번째 인수로 전달됩니다.<br />
failed: 로그인 실패시 콜백 함수

# kko.logout(success)
### Description
로그인 된 계정에서 로그아웃 합니다.

### Parameters
success: 로그 아웃 성공시 콜백 함수

# kko.on(event, handler)
### Description
이벤트 함수 입니다. 현재 사용할 수 있는 이벤트는 init과 login이며, init은 Kakao SDK가 초기화 되었을때, login은 카카오 계정으로 로그인 되었을 때 발생합니다.

### Parameters
event: 이벤트 명(init, login)<br />
handler: 이벤트 발생시 콜백 함수

# kko.getInfo
## kko.getInfo.status()
### Description
현재 라이브러리가 Access Token 및 사용자 정보를 가지고 있는지 확인합니다. 로그인 상태를 확인할 때 사용하며, 로그인되어 있으면 true, 아니면 false를 반환합니다.

## kko.getInfo.me()
### Description
사용자 정보를 반환합니다. 가지고 있는 사용자 정보가 없을 경우 false를 반환 합니다.

# kko.talk
## kko.talk.sendLink(params)
### Description
카카오 톡으로 링크 공유 메세지를 보냅니다. 카카오 톡을 설치할 수 있는 모바일 환경에서만 사용 가능합니다.

### Parameters
params: 다음 항목을 갖는 오브젝트 입니다.
```
{
  label: 공유할 메세지(필수),
  image: {
    src: 공유할 이미지의 경로,
    width: 공유할 이미지의 폭(70이상, 기본값 300, 단위 px)
    height: 공유할 이미지의 높이(70이상, 기본값 400, 단위 px)
  },
  webButton: {
    text: 공유할 링크 버튼에 출력될 메세지,
    url: 공유될 링크 url
  }
}
```

# kko.story
## kko.story.sendLink(url, text, success, failed)
### Description
카카오 스토리에 url 링크를 공유합니다. 별도의 공유창이 생성되지 않습니다.

### Parameters
url: 공유할 url<br />
text: 사용자 입력란에 들어갈 텍스트 내용<br />
success: 공유 성공시 콜백 함수. 콜백 함수의 첫번째 인수로 게시된 게시물의 상세 정보가 전달됩니다.<br />
failed: 공유 실패시 콜백 함수

## kko.story.openSharer(url, width, height)
### Description
카카오 스토리에 url 링크를 공유합니다. 공유 팝업창이 생성됩니다.

### Parameters
url: 공유할 url(필수)<br />
width: 팝업창 너비(px), 기본 값은 400px 입니다(옵션)<br />
height: 팝업창 높이(px), 기본 값을 480px 입니다(옵션)

## kko.story.openApp(appId, url, text, urlFirst)
### Description
카카오 스토리에 url 링크를 공유합니다. 카카오 스토리 앱을 호출하며 카카오 스토리 앱을 사용할 수 있는 모바일 환경에서만 동작합니다.

### Parameters
appId: 공유하는 웹 사이트의 최상위 도메인(필수, 개발자 페이지에서 등록하는 appId가 아닙니다)<br />
url: 공유할 모바일 웹사이트 주소(필수)<br />
text: 사용자 입력란에 들어갈 텍스트 내용(옵션)<br />
urlFirst: 공유할 url이 삽입될 위치입니다. 기본값을 false입니다(옵션). true일 경우 url + text 형태가 되며, false 일경우 text + url 이 됩니다.
