KKO-Library
===========
**Current Version**: v1.0<br />
**Last Change**: 2016-04-08
```
v1.0 Change Logs
 - 크로스 브라우징 이슈 관련 버그 픽싱
 - 종속성 있는 라이브러리를 소스에 포함
 - 기타 사소한 버그 및 코드 리펙토링
```

간편하게 사용하는 카카오 톡, 스토리 라이브러리 입니다(이하 kko). IE >= 9 과 그외 최신 브라우저에서 동작합니다.

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

```html
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
**appId**: Kakako 개발자 페이지에서 등록한 Application ID

### Example
```javascript
	kko.init('your-app-id');
```

# kko.login(success, failed)
### Description
Kakao 계정으로 로그인 합니다.

### Parameters
**success**: 로그인 성공시 콜백 함수. 사용자 정보가 첫번째 인수로 전달됩니다.<br />
**failed**: 로그인 실패시 콜백 함수

### Example
```javascript
	kko.init('your-app-id');
	
	// id가 login-button인 html 엘리먼트에 클릭 이벤트를 추가합니다.
	document.getElementById('login-button').addEventListener('click', function () {
		// Kakao 로그인
  		kko.login(function (res) {
  			// 성공시 alert창에 메세지 표시
  			alert('로그인 했어요!');
  			
  			// 첫번째 인수인 res에서 사용자 정보를 확인할 수 있습니다.
  			console.log(res);
  		},
  		function (err) {
  			alert('로그인에 실패했어요!');
  			console.error(err);
  		});
	});
```

# kko.logout(success)
### Description
로그인 된 계정에서 로그아웃 합니다.

### Parameters
**success**: 로그 아웃 성공시 콜백 함수

### Example
```javascript
	kko.init('your-app-id');
	
	// id가 logout-button인 html 엘리먼트에 클릭 이벤트를 추가합니다.
	document.getElementById('logout-button').addEventListener('click', function () {
		// Kakao 로그아웃
  		kko.logout(function (res) {
  			if (res) {
  				alert('로그아웃 되었습니다.');
  			}
  		});
	});
```

# kko.on(event, handler)
### Description
이벤트 함수 입니다. 현재 사용할 수 있는 이벤트는 init과 login이며, init은 Kakao SDK가 초기화 되었을때, login은 카카오 계정으로 로그인 되었을 때 발생합니다.

### Parameters
**event**: 이벤트 명(init, login)<br />
**handler**: 이벤트 발생시 콜백 함수

### Example
```javascript
	kko.init('your-app-id');
	
	// Kakao SDK가 초기화 되면 init 이벤트가 발생합니다.
	kko.on('init', function () {
		// init 이벤트가 발생하면 kko.login() 함수가 실행되도록 합니다.
		kko.login(function (res){...})
	});
	
	// Kakako Login에 성공하면 login 이벤트가 발생합니다.
	kko.on('login', function () {
		// login 이벤트가 발생하면 doSomthing() 함수가 실행되도록 합니다.
		doSomething();
	})
```

# kko.getInfo
## kko.getInfo.status()
### Description
현재 라이브러리가 Access Token 및 사용자 정보를 가지고 있는지 확인합니다. 로그인 상태를 확인할 때 사용하며, 로그인되어 있으면 true, 아니면 false를 반환합니다.

## kko.getInfo.me()
### Description
사용자 정보를 반환합니다. 가지고 있는 사용자 정보가 없을 경우 false를 반환 합니다.

### Example
```javascript
	kko.init('your-app-id');
	
	// 로그인 상태를 가져옵니다.
	var isLogin = kko.getInfo.status();
	
	if (isLogin) {
		// 로그인 상태이면 사용자 정보를 콘솔에 표시합니다.
		console.log(kko.getInfo.me());
	} else {
		// 로그인 상태가 아니면 로그인 함수를 실행합니다.
		kko.login( function (res) {...});
	}
```

# kko.talk
## kko.talk.sendLink(params)
### Description
카카오 톡으로 링크 공유 메세지를 보냅니다. 카카오 톡을 설치할 수 있는 모바일 환경에서만 사용 가능합니다. 링크 공유에 사용되는 이미지는 가로, 세로 동일하게 80px 이상이어야 하며, 용량은 500kb 이하로 제한되어 있습니다.

### Parameters
**params**: 다음 항목을 갖는 오브젝트 입니다.
```
{
  label: 공유할 메세지(필수),
  image: {
    src: 공유할 이미지의 경로,
    width: 공유할 이미지의 폭(70이상, 기본값 400, 단위 px)
    height: 공유할 이미지의 높이(70이상, 기본값 300, 단위 px)
  },
  webButton: {
    text: 공유할 링크 버튼에 출력될 메세지,
    url: 공유될 링크 url
  }
}
```

### Example
```javascript
	// kko.talk.sendLink에 들어갈 값의 예시
	var parmas = {
		label: 'Kakao와 함께하는 이벤트에 참여하세요!',
		image: {
			src: 'your/image/directory/image.png',
			width: 400,
			height: 300
		},
		webButton: {
			text: '페이지로 이동하기',
			url: 'http://www.example.com/event'
		}
	};
	
	//  id가 share-button인 html 요소에 클릭 이벤트를 추가합니다.
	document.getElement('share-button').addEventListener('click' function () {
		// 카카오톡으로 링크를 공유합니다.
		kko.talk.sendLink(params);
	});
```

# kko.story
## kko.story.sendLink(url, text, success, failed)
### Description
카카오 스토리에 url 링크를 공유합니다. 별도의 공유창이 생성되지 않습니다.

### Parameters
**url**: 공유할 url<br />
**text**: 사용자 입력란에 들어갈 텍스트 내용<br />
**success**: 공유 성공시 콜백 함수. 콜백 함수의 첫번째 인수로 게시된 게시물의 상세 정보가 전달됩니다.<br />
**failed**: 공유 실패시 콜백 함수

## kko.story.openSharer(url, text)
### Description
카카오 스토리에 url 링크를 공유합니다. 공유 팝업창이 생성됩니다.

### Parameters
**url**: 공유할 url(필수)<br />
**text**: 사용자 입력란에 들어갈 텍스트 내용<br />

## kko.story.openApp(host, url, text, urlFirst)
### Description
카카오 스토리에 url 링크를 공유합니다. 카카오 스토리 앱을 호출하며 카카오 스토리 앱을 사용할 수 있는 모바일 환경에서만 동작합니다.

### Parameters
**host**: 공유하는 웹 사이트의 최상위 도메인(필수)<br />
**url**: 공유할 모바일 웹사이트 주소(필수)<br />
**text**: 사용자 입력란에 들어갈 텍스트 내용(옵션)<br />
**urlFirst**: 공유할 url이 삽입될 위치입니다. 기본값을 false입니다(옵션). true일 경우 url + text 형태가 되며, false 일경우 text + url 이 됩니다.

### Example
```javascript
	var sendLink   = document.getElementById('button-send-link'),
		openSharer = document.getElementById('button-open-sharer'),
		openApp    = document.getElementById('button-open-app'),
		url        = 'http://www.example.com/article/1',
		host       = 'http://www.example.com',
		text       = '칼퇴를 부르고 야근을 무찌르는 방법!';
		
	sendLink.addEventListener('click', function () {
		// 별도의 공유창을 띄우지 않고 url과 text를 공유하기
		kko.story.sendLink(
			url, 
			text,
			function (res) {
				alert('공유하였습니다.');
				// 링크 공유에 성공하면 res에서 게시물의 정보를 확인할 수 있습니다.
				console.log(res);
			},
			function (err) {
				console.error(err);
			}
		);
	});
	
	openSharer.addEventListener('click', function () {
		// 공유창을 띄우고 url을 공유하기(팝업 크기 430px x 500px)
		kko.story.openSharer(url, 430, 500);
	});
	
	openApp.addEventListener('click', function () {
		/** 
		  * 카카오 스토리를 사용할 수 있는 모바일 환경에서만 작동합니다.
		  * 카카오 스토리 앱이 설치되어 있지 않은 경우 기기별 스토어로 이동합니다.
		  */
		kko.story.openApp(appId, url, text, true); 
	});
```

## kko.story.getStory(id, successCallback, failedCallback)
### Description
카카오 스토리에서 사용자 스토리(포스팅) 정보를 불러옵니다.

### Parameters
**id**: 카카오 스토리의 스토리 ID입니다. 특별히 지정하지 않을 경우 모든 스토리 정보를 불러옵니다.<br />
id를 지정하지 않을 경우 첫번째 파라미터는 성공시 콜백 함수가 됩니다.<br />
**successCallback**: 스토리 정보 불러오기 성공시 콜백 함수. 스토리 정보가 첫번째 파라미터로 전달됩니다.<br />
id를 지정하지 않은 경우 두번째 파라미터는 실패시 콜백 함수가 됩니다.<br />
**failedCallback**: 스토리 정보 불러오기 실패시 콜백 함수.<br />
id를 지정하지 않은 경우 생략됩니다.

### Example
```javascript
  // 하나의 스토리 정보만을 불러오는 경우

  kko.story.getStory('STORY-ID', function (res) {
    ... do something ...
  }, function (err) {
    console.error(err);
  });

  // 전체 스토리 정보를 불러오는 경우

  kko.story.getStory(function (res) {
    ... do somthing ...
  }, function (err) {
    console.error(err);
  });
```

## kko.story.getStoriesBefore(lastId, successCallback, failedCallback)
### Description
카카오 스토리에서 지정된 ID(lastId) 이전에 작성된 사용자 스토리(포스팅) 정보를 불러옵니다. 지정된 ID에 해당하는 스토리 정보는 불러오는 데이터에 포함되지 않습니다.

### Parameters
**lastId**: 카카오 스토리의 스토리 ID입니다. <br />
**successCallback**: 스토리 정보 불러오기 성공시 콜백 함수. 스토리 정보가 첫번째 파라미터로 전달됩니다. <br />
**failedCallback**: 스토리 정보 불러오기 실패시 콜백 함수.

## kko.story.followStory(container, storyName, showFollowCounter, type)
### Description
카카오 스토리의 스토리 팔로우 버튼을 생성합니다.

### Parameters
**container**: 버튼 컨테이너 엘레먼트<br />
**storyName**: 카카오 스토리의 스토리 이름<br />
**showFollowCounter**: 팔로워 수 표시 여부(true / false). 기본값 true<br />
**type**: 팔로워 수 표시 위치(horizontal, vertical). 기본값 horizontal

### Example
```html
	<div id="follow-button"></div>
```
```javascript
	kko.story.followStory('#follow-button', 'kakaostory', true, 'vertical');
```

# kko HTML Buttons
## Description
HTML 코딩만으로 카카오 로그인, 카카오 토크 링크 보내기, 카카오 스토리 공유 버튼을 쉽게 만들 수 있습니다. 이하 항목명들은 HTML tag의 class 이름입니다.

### kko-login-button
로그인 버톤을 생성합니다. 로그인 시 login 이벤트가 발생하며 이벤트 객체의 userInfo에 로그인 정보를 전달합니다.

```html
<button class="kko-login-button" 
				data-lang="kr" 
				data-text="long" 
				data-size="large-narrow"></button>
```
**lang**: 로그인 버튼의 언어 입니다(kr, en). <br/>
**text**: long 일때는 '카카오 계정으로 로그인', short 일때는 '로그인'으로 버튼 텍스트가 표시됩니다.<br/>
**size**: 버튼의 사이즈를 지정합니다. size 값은 [이곳](https://developers.kakao.com/buttons)의 Login Buttons 항목에서 확인할 수 있습니다.<br />

### kko-talk-link-button
[카카오 링크 보내기](#kkotalksendlinkparams) 버튼을 생성합니다.

```html
<button class="kko-talk-link-button"
				data-label="Kakao Talk Link"
				data-src="https://www.some-image-path.com/image.png"
				data-width="400"
				data-height="300"
				data-text="Link Button"
				data-url="https://www.example.com"
				data-size="medium"></button>
```
각각의 항목은 [kko.talk.sendLink()](#kkotalksendlinkparams) 함수의 매개 변수와 1:1 대응합니다.

**label**: label <br/>
**src**: image.src <br/>
**width**: image.width <br/>
**height**: image.height <br/>
**text**: webButton.text <br/>
**url**: webButton.url <br />
**size**: 버튼 크기로 medium(68px x 69px)과 small(34px x 35px) 두 종류입니다.

### kko-story-share
[카카오 스토리에 공유하기](#kkostoryopensharerurl-width-height) 팝업 버튼을 생성합니다.

```html
	<button class="kko-story-share-button"
					data-url="http://www.example.com"
					data-type="logotype_kr"
					data-size="64"
					data-text="example text"></button>
```

**url**: 공유할 URL 주소 입니다.<br />
**type**: logotype_kr, logotype_en, icon_text, web(버튼 이미지는 [이곳](https://developers.kakao.com/buttons)에 KakaoStory Buttons의 Button Type을 참조)<br />
**size**: 버튼의 사이즈 입니다. 위 링크의 Button Size를 참조 하시기 바랍니다. type이 web일 경우 size는 없어도 됩니다.<br />
**text**: 사용자 입력란에 들어갈 텍스트

### kko-follow-story
카카오 스토리의 스토리 팔로우 버튼을 생성합니다. 이 엘레먼트는 반드시 id를 가져야 하며, block 엘레먼트로 생성할 것을 권장합니다.

```html
	<div class="kko-follow-story"
			 id="kko-follow-button"
			 data-story="kakaostory"
			 data-counter="true"
			 data-type="horizontal"></div>

```

**story**: 팔로우 할 스토리의 이름<br />
**counter**: 팔로워 수 표시 여부(true / false). 기본값 true<br />
**type**: 팔로워 수 표시 위치(horizontal, vertical). 기본값 horizontal
