(function (exports) {
	'use strict';

	// 브라우저에 CustomEvent 함수가 없을 경우 새로 정의합니다.
	if (typeof window.CustomEvent !== 'function') {
	  window.CustomEvent = function(type, eventInitDict) {
	    var newEvent = document.createEvent('CustomEvent');
	    newEvent.initCustomEvent(type,
	                             !!(eventInitDict && eventInitDict.bubbles),
	                             !!(eventInitDict && eventInitDict.cancelable),
	                             (eventInitDict ? eventInitDict.details : null));
	    return newEvent;
	  };
	}

	var kko = exports.kko = function () {
		// 내부 변수 선언
		var app         = {},
		    status      = {},
		    baseUrl     = 'storylink://posting?',
		    apiver      =  '1.0',
		    store       = {
		    	android: 'market://details?id=com.kakao.story',
		    	ios: 'http://itunes.apple.com/app/id486244601'
		    },
			  packageName = 'com.kakao.story',
			  isInit      = false,
		    $emit       = document.dispatchEvent,
				$on         = document.addEventListener;

		// Custom Event		    
		var initEvent   = new CustomEvent('init'),
		    loginEvent  = new CustomEvent('login');

		$on('init', function () {
			isInit = true;
		}, false);

		var serialized = function (params) {
		  var stripped = [];

		  for (var k in params) {
		    if (params.hasOwnProperty(k)) {
		      stripped.push(k + "=" + encodeURIComponent(params[k]));
		    }
		  }

		  return stripped.join('&');
		};

		var initialize = function(appId) {
			Kakao.init(appId);
			$emit(initEvent);
		};

		/**
		 * @description: Kakao SDK 를 초기화 합니다.
		 * @param string appId: Kakao 개발자 페이지에서 등록한 Application ID
		 *
		 * @return void
		 */
		app.init = function (appId) {
			if (window.Kakao) {
				initialize(appId);
			} else {
				var body   = document.getElementsByTagName('body')[0],
				    script = document.createElement('script');

				script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
				script.addEventListener('load', function () {
					initialize(appId);
				});

				body.insertBefore(script, body.lastChild);
			}
		};

		/**
		 * @description: 간단한 이벤트 리스너 입니다.
		 * @param string event: 이벤트 이름(위에서 정의한 Custom events)
		 * @param function handler: 이벤트 핸들러
		 *
		 * @return void
		 */
		app.on = function (event, handler) {
			$on(event, handler);
		};

		/**
		 * @description: Kakao 계정으로 로그인 합니다.
		 *   - 로그인에 성공하면 유저 정보를 함께 가져옵니다.
		 *   - 로그인에 성공하면 유저 정보 획득 후 'login' 이벤트가 발생합니다.
		 *
		 * @param function successCallback: 로그인 성공시 콜백 함수
		 *   - 콜백 함수의 첫번째 인자로 인증 정보가 전달됩니다.
		 * @param function failedCallback: 로그인 실패시 콜백 함수
		 *
		 * @return void
		 */
		app.login = function (successCallback, failedCallback) {
			Kakao.Auth.login({
				success: function (obj) {
					Kakao.Auth.getStatus(function (obj) {
						status = obj;

						Kakao.API.request({
							url: '/v1/api/story/isstoryuser'
						})
						.then(function (res) {
							status.isStoryUser = res.isStoryUser;

							if (status.isStoryUser) {
								return Kakao.API.request({
									url: '/v1/api/story/profile'
								});
							}
						})
						.then(function (res) {
							status.kakaoStoryProfile = res;
							$emit(loginEvent);
						});
					});

					if (successCallback) {
						successCallback.call(null, obj);
					}
				},
				fail: function (err) {
					if (failedCallback) {
						failedCallback.call(null, err);
					}
				}
			});
		};

		// 정보 얻기
		app.getInfo = {
			/**
			 * @description: Kakao 로그인 상태를 체크 합니다.
			 *
			 * @return Boolean: Kakao 로그인 중일 경우 true, 아니면 false
			 */
			status: function () {
				if (status.status === 'connected') {
					return true;
				} else {
					return false;
				}
			},

			/**
			 * @description: 로그인시 획득한 유저 정보를 가져 옵니다.
			 *
			 * @return Object or Boolean: 
			 *   - 유저 정보가 있으면 JSON 객체를 반환하고,
			 *   - 유저 정보가 없으면 false를 반환합니니다
			 */
			me: function () {
				if (status.status === 'connected' && status.user) {
					var user = {};
					
					user.id = status.user.id;
					user.kakaoStoryUser = status.isStoryUser;
					
					if (user.kakaoStoryUser && status.kakaoStoryProfile !== undefined) {
						user.kakaoStoryProfile = status.kakaoStoryProfile;
					}

					Object.keys(status.user.properties).map(function ($key) {
						user[$key] = status.user.properties[$key];
					});
					
					return user;
				} else {
					return false;
				}
			}
		};

		// 카카오 톡 관련 함수
		app.talk = { 
			/**
			 * @description: 카카오 톡으로 링크 공유 메세지를 보냅니다.
			 *	  - 카카오을 설치할 수 있는 모바일 환경에서만 사용 가능합니다.
			 *
			 * @params object params: {
			 *    label: 공유할 메세지(필수),
			 *    image: {
	     *      src: 공유할 이미지의 경로,
	     *      width: 공유할 이미지의 폭(70이상, 기본값 300, 단위 px)
	     *      height: 공유할 이미지의 높이(70이상, 기본값 400, 단위 px)
			 *    },
			 *    webButton: {
	     *			text: 공유할 링크 버튼에 출력될 메세지,
	     *      url: 공유될 링크 url
			 *    }
			 * }
			 * @return void
			 */
			sendLink: function (params) {
				if (params.image !== undefined) {
					params.image.width = params.image.width || '300';
					params.image.height = params.image.height || '400';
				}

				Kakao.Link.sendTalkLink(params);
			}
		};

		// 카카오 스토리 관련 함수
		app.story = {
			/**
			 * @description: 카카오 스토리에 url 링크를 공유합니다.
			 *   - 별도의 공유창이 생성되지 않습니다
			 *
			 * @param string url: 공유할 url 
			 * @param string text: 사용자 입력란에 들어간 내용
			 * @param function successCallback: 공유 성공시 콜백 함수
			 *   - 콜백 함수의 첫번째 인수로 링크된 게시물의 상세 정보가 전달됩니다.
			 * @param function faliedCallback: 공유 실패시 콜백 함수
			 *
			 * @return void
			 */
			sendLink: function (url, text, successCallback, failedCallback) {
				Kakao.Auth.login({
					success: function() {
						Kakao.API.request({
							url: '/v1/api/story/linkinfo',
							data: {
								url: url
							}
						})
						.then(function (res) {
							var data = {};
							data.link_info = res;

							if (text !== undefined) {
								data.content = text;
							}

							return Kakao.API.request({
								url: '/v1/api/story/post/link',
								data: data
							});
						})
						.then(function (res) {
							return Kakao.API.request({
								url: '/v1/api/story/mystory',
								data: {
									id: res.id
								}
							});
						})
						.then(function (res) {
							if (successCallback) {
								successCallback.call(null, res);	
							}
						});
					},
					fail: function(err) {
						if (failedCallback) {
							failedCallback.call(null, err);
						}
					}
				});
			},

			/**
			 * @description: 카카오 스토리에 url 링크를 공유합니다.
			 *   - 공유를 위한 새로운 윈도우 창이 생성됩니다.
			 *
			 * @param string url: 공유할 url 
			 * @param number width: 팝업창의 폭(기본 400, 단위 px)
			 * @param number height: 팝업창의 높이(기본 480, 단위 px)
			 *   - 콜백 함수의 첫번째 인수로 링크된 게시물의 상세 정보가 전달됩니다.
			 * @param function faliedCallback: 공유 실패시 콜백 함수
			 *
			 * @return void
			 */
			openSharer: function(url, width, height) {
				var linkUrl = 'https://story.kakao.com/share?url=%url';
				url = encodeURIComponent(url);
				width = width || 400;
				height = height || 480;

				linkUrl = linkUrl.replace(/%url/, url);

				window.open(linkUrl, '', 'width=' + width + ',height=' + height);
			},

			/**
			 * @description: 카카오 스토리에 url 링크를 공유합니다.
			 *   - 카카오 스토리 앱을 호출 합니다.
			 *   - 카카오 스토리를 사용할 수 있는 모바일 환경에서만 작동합니다.
			 *
			 * @param string appId: 공유하는 모바일 웹 사이트의 루트 주소(필수)
			 * @param string url: 실제 공유 할 url(필수)
			 * @param string text: 사용자 입력란에 들어간 임의의 문장
			 * @param boolean urlFirst: 공유 할 url이 삽입될 위치(기본 false)
			 *   - true: url + text
			 *   - false: text + url
			 *
			 * @return void
			 */
			openApp: function(appId, url, text, urlFirst) {
				var params = {};
				params.appId = appId;
		    params.apiver = apiver;

		    if (urlFirst && urlFist === true) {
		    	params.post = url + ' ' + text;
		    } else {
		    	params.post = text + ' ' + url;
		    }

			  var urlScheme = baseUrl + serialized(params);
			  var intentURI = 'intent:' + urlScheme + '#Intent;package=' + packageName + ';end;';
			  var appStoreURL = daumtools.userAgent().os.android ? store.android : store.ios;

			  daumtools.web2app({
			    urlScheme: urlScheme,
			    intentURI: intentURI,
			    storeURL : appStoreURL,
			    appName : 'KakaoStory'
			  });
			}
		};

		return app;
	}();

	if (typeof window === 'object' && window.kko === undefined) {
		window.kko = kko;
	}

})(window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools);