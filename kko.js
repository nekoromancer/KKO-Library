(function (exports) {
	'use strict';

	// CustomEvent 에서 정의한 이벤트를 배열에 저장합니다.
	var customEvents = [];
  
  // 브라우저에 CustomEvent 함수가 없을 경우 새로 정의합니다.
	if (typeof window.CustomEvent !== 'function') {
	  window.CustomEvent = function (eventName, eventInitDict) {
	  	var newEvent;

	  	customEvents.push(eventName);

	  	if (typeof window.createEvent === 'function') {
	  		newEvent = document.createEvent('CustomEvent');
	  		newEvent.initCustomEvent(eventName,
	  		                         !!(eventInitDict && eventInitDict.bubbles),
	  		                         !!(eventInitDict && eventInitDict.cancelable),
	  		                         (eventInitDict ? eventInitDict.details : null));
	  		return newEvent;
	  	} else {
	  		document.documentElement['eventProperty' + eventName] = false;
	  	}
	  };
	}

	var kko = function (userAgent, web2app) {
		// 내부 변수 선언
		var app           = {},
		    status        = {},
		    baseUrl       = 'storylink://posting?',
		    apiver        =  '1.0',
		    store         = {
		    	android: 'market://details?id=com.kakao.story',
		    	ios: 'http://itunes.apple.com/app/id486244601'
		    },
			  packageName   = 'com.kakao.story',
			  isInit        = false,
			  isEvtListener = typeof document.addEventListener === 'function' ? true : false;

		// 임의의 이벤트를 발생시키는 내부 함수
		var $emit = function (event, name) {
			if (typeof document.dispatchEvent === 'function') {
				document.dispatchEvent(event);
			} else {
				document.documentElement['eventProperty' + name] = true;			
			}
		};

		// 리스너 함수
		var $on = function (targetObject, eventName, callBackFunction) {
			if (isEvtListener === true) {
				targetObject.addEventListener(eventName, callBackFunction);
			} else {
				if (eventName === 'load') {
					eventName = 'onreadystatechange';
				} else if (customEvents.indexOf(eventName) === -1) {
					eventName = 'on' + eventName;
				} else {
					return document.documentElement.attachEvent('onpropertychange', function () {
						var value = document.documentElement['eventProperty' + eventName];
						if (value === true) {
							callBackFunction.call(null);
						}
					});
				}

				targetObject.attachEvent(eventName, callBackFunction);
			}
		};

		// Custom Event		    
		var initEvent   = new CustomEvent('init'),
		    loginEvent  = new CustomEvent('login');

		$on(document, 'init', function () {
			isInit = true;
		});

		// JSON to Query String
		var serialized = function (params) {
		  var stripped = [];

		  for (var k in params) {
		    if (params.hasOwnProperty(k)) {
		      stripped.push(k + '=' + encodeURIComponent(params[k]));
		    }
		  }

		  return stripped.join('&');
		};

		var initialize = function (appId) {
			Kakao.init(appId);
			$emit(initEvent, 'init');
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
				$on(script, 'load', function () {
					if (isEvtListener === true) {
						initialize(appId);
					} else {
						if (script.readyState === 'loaded' || script.readyState === 'complete') {
							initialize(appId);
						}
					}
				});

				if (body === undefined) {
					$on(document, 'load', function() {
						body = document.getElementsByTagName('body')[0];
						body.insertBefore(script, body.lastChild);
					});
				} else {
					body.insertBefore(script, body.lastChild);
				}
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
			$on(document, event, handler);
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
							status.status = 'connected';
							
							$emit(loginEvent, 'login');

							if (successCallback) {
								successCallback.call(null, obj);
							}
						});
					});
				},
				fail: function (err) {
					if (failedCallback) {
						failedCallback.call(null, err);
					}
				}
			});
		};

		/**
		 * @description: Kakao 로그아웃 합니다.
		 *
		 * @param function successCallback: 로그아웃 성공시 콜백 함수
		 */
		app.logout = function (successCallback) {
			Kakao.Auth.logout(function (res) {
				status.status = false;

				if (successCallback) {
					successCallback.call(null, res);
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
					user.iskakaoStoryUser = status.isStoryUser;
					
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
	     *      width: 공유할 이미지의 폭(70이상, 기본값 400, 단위 px)
	     *      height: 공유할 이미지의 높이(70이상, 기본값 300, 단위 px)
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
					params.image.width = params.image.width || '400';
					params.image.height = params.image.height || '300';
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
			 * @param function failedCallback: 공유 실패시 콜백 함수
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
			 * @param function failedCallback: 공유 실패시 콜백 함수
			 *
			 * @return void
			 */
			openSharer: function (url, width, height) {
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
			 * @param string host: 공유하는 모바일 웹 사이트의 Host 주소(필수)
			 * @param string url: 실제 공유 할 url(필수)
			 * @param string text: 사용자 입력란에 들어간 임의의 문장
			 * @param boolean urlFirst: 공유 할 url이 삽입될 위치(기본 false)
			 *   - true: url + text
			 *   - false: text + url
			 *
			 * @return void
			 */
			openApp: function (host, url, text, urlFirst) {
				var params = {};
				params.appId = host;
		    params.apiver = apiver;

		    if (urlFirst && urlFist === true) {
		    	params.post = url + ' ' + text;
		    } else {
		    	params.post = text + ' ' + url;
		    }

			  var urlScheme = baseUrl + serialized(params);
			  var intentURI = 'intent:' + urlScheme + '#Intent;package=' + packageName + ';end;';
			  var appStoreURL = userAgent().os.android ? store.android : store.ios;

			  web2app({
			    urlScheme: urlScheme,
			    intentURI: intentURI,
			    storeURL : appStoreURL,
			    appName : 'KakaoStory'
			  });
			},

			/**
			 * @description: 카카오 스토리에서 사용자의 스토리 정보를 불러옵니다.
			 *   - 첫번째 파라미터에 스토리 ID를 입력하면 해당 스토리 정보를 불러옵니다.
			 *   - 첫번째 파라미터가 함수인 경우 전체 스토리 정보를 불러옵니다.
			 *
			 * @param string or function idOrSuccessCallback: 
			 *   스토리 ID 혹은 로드 성공시 콜백 함수
			 * @param function successOrFailed:
			 *   - 스토리 ID가 있는 경우 성공시 콜백 함수
			 *   - 스토리 ID를 입력하지 않은 경우 실패시 콜백함수
			 * @param function or null failedOrNot:
			 *   - 스토리 ID가 있는 경우 실패시 콜백 함수
			 *   - 스토리 ID를 입력하지 않은 경우 미사용(null)
			 *
			 * @return void or object
			 */
			getStory: function (idOrSuccessCallback, successOrFailed, failedOrNot) {
				var storyId, 
						successCallback, 
						failedCallback,
						params = {};

				if (typeof idOrSuccessCallback === 'function') {
					// 첫번째 parameter가 function 일 경우
					successCallback = idOrSuccessCallback;
					failedCallback = successOrFailed;

					params.url = '/v1/api/story/mystories';
				} else if(typeof idOrSuccessCallback === 'string') {
					// 첫번째 parameter가 string(storyId)일 경우
					storyId = idOrSuccessCallback;
					successCallback = successOrFailed;
					failedCallback = failedOrNot;

					params.url = '/v1/api/story/mystory';
					params.data = {
						id: storyId
					};
				} else {
					// Error
					return {
						error: 'invaild parameters'
					};
				}

				Kakao.Auth.login({
					success: function () {
						Kakao.API.request(params)
						.then(function (res) {
							successCallback.call(null, res);
						});
					},
					fail: function (err) {
						failedCallback.call(null, err);
					}
				});
			},

			/**
			 * @description: 카카오 스토리의 특정 아이디 이전의 스토리 정보를 불러옵니다.
			 *   - 지정된 아이디는 포함되지 않습니다.
			 *
			 * @param string lastId: 스토리 ID
			 * @param function successCallback: 로드 성공시 콜백 함수
		 	 *   - 콜백 함수의 첫번째 인자로 스토리 정보(배열)이 전달 됩니다.
		   * @param function failedCallback: 로드 실패시 콜백 함수
			 *
			 * @return void
			 */
			getStoriesBefore: function (lastId, successCallback, failedCallback) {
				Kakao.Auth.login({
					success: function () {
						Kakao.API.request({
							url: '/v1/api/story/mystories',
							data: {
								last_id: lastId
							}
						})
						.then(function (res) {
							successCallback.call(null, res);
						});
					},
					fail: function (err) {
						failedCallback.call(null, err);
					}
				});
			}
		};

		/**
		* HTML Kakao Social Buttons
		*/

		var setBgStyle = function (target, width, height, path) {
			target.style.width = width + 'px';
			target.style.height = height + 'px';
			target.style.backgroundImage = 'url(\'' + path + '\')';
		};

		var assetPath = 'https://developers.kakao.com/assets/img/about/';

		$on(window, 'load', function () {
			/**
			* Login Button
			*/
			var loginButtons = document.getElementsByClassName('kko-login-button');

			for (var i = 0, button; button = loginButtons[i]; i++) {
				var lang = button.getAttribute('data-lang'),
						text = button.getAttribute('data-text'),
						size = button.getAttribute('data-size'),
						imgPath = assetPath + 'logos/login/';

				button.style.backgroundColor = 'transparent';
				button.style.backgroundRepeat = 'no-repeat';
				button.style.border = 'none';
				button.style.cursor = 'pointer';

				if (lang === 'kr') {
					imgPath += 'kr/';
				}
				else if (lang === 'en') {
					imgPath += 'en/';
				}

				if (text === 'short') {
					imgPath += 'kakao_login_btn_';

					if (size === 'small') {
						imgPath += 'small.png';

						setBgStyle(button, 70, 31, imgPath);
					}
					else if (size === 'medium') {
						imgPath += 'medium.png';

						setBgStyle(button, 121, 49, imgPath);
					}
					else if (size === 'large') {
						imgPath += 'large.png';

						setBgStyle(button, 249, 98, imgPath);
					}
				}
				else if (text === 'long') {
					imgPath += 'kakao_account_login_btn_';

					if (size === 'medium-narrow') {
						imgPath += 'medium_narrow.png';

						setBgStyle(button, 222, 49, imgPath);
					}
					else if (size === 'medium-wide') {
						imgPath += 'medium_wide.png';

						setBgStyle(button, 300, 49, imgPath);
					}
					else if (size === 'large-narrow') {
						imgPath += 'large_narrow.png';

						setBgStyle(button, 452, 98, imgPath);
					}
					else if (size === 'large-wide') {
						imgPath += 'large_wide.png';

						setBgStyle(button, 600, 98, imgPath);
					}
				}

				$on(button, 'click', app.login);
			}
		});

		$on(window, 'load', function () {
			/**
			* Kakao Talk Send Link Button
			*/

			var kakaoTalkLinkButton = document.getElementsByClassName('kko-talk-link-button');
			var sendLinkHandler = function (params) {
				return function () {
					Kakao.Link.sendTalkLink(params);
				};
			};

			for (var i = 0, button; button = kakaoTalkLinkButton[i]; i++) {
				var label   = button.getAttribute('data-label'),
						src     = button.getAttribute('data-src'),
						width   = button.getAttribute('data-width'),
						height  = button.getAttribute('data-height'),
						text    = button.getAttribute('data-text'),
						url     = button.getAttribute('data-url'),
						size    = button.getAttribute('data-size'),
						imgPath = assetPath + 'logos/kakaolink/kakaolink_btn_',
						params  = {};

				button.style.backgroundColor = 'transparent';
				button.style.backgroundRepeat = 'no-repeat';
				button.style.border = 'none';
				button.style.cursor = 'pointer';

				params.label = label;

				if (src) {
					params.image = {};
					params.image.src = src;
					params.image.width = width || '400';
					params.image.height = height || '300';
				}

				if (text || url) {
					params.webButton = {};

					if (text) {
						params.webButton.text = text;
					}

					if (url) {
						params.webButton.url = url;
					}
				}

				if (size === 'small') {
					imgPath += 'small.png';

					setBgStyle(button, 34, 35, imgPath);
				}
				else if (size === 'medium') {
					imgPath += 'medium.png';

					setBgStyle(button, 68, 69, imgPath);
				}

				var handler = sendLinkHandler(params);

				$on(button, 'click', handler);
				handler = null;
			}
		});

		$on(window, 'load', function () {
			/**
			* Kakao Story Share Button
			*/

			var kakaoStoryShare = document.getElementsByClassName('kko-story-share-button');
			var shareHandler = function (url, width, height) {
				return function () {
					app.story.openSharer(url, width, height);
				};
			};

			for (var i = 0, button; button = kakaoStoryShare[i]; i++) {
				var url       = button.getAttribute('data-url'),
						type      = button.getAttribute('data-type'),
						size      = button.getAttribute('data-size'),
						btnWidth  = '',
						width     = button.getAttribute('data-width'),
						height    = button.getAttribute('data-height'),
						imgPath   = assetPath + 'buttons/kakaostory/button/';

				var handler = shareHandler(url, width, height);

				if (type === 'logotype_kr' || type === 'logotype_en') {
					imgPath += 'logotype/';

					if (type === 'logotype_kr') {
						imgPath += 'kr/story_logotype_kr_' + size + '.png';
					}
					else if (type === 'logotype_en') {
						imgPath += 'en/story_logotype_en_' + size + '.png';
					}

					switch (size) {
						case '64':
							btnWidth = 222;
							break;

						case '96':
							btnWidth = 333;
							break;

						case '128':
							btnWidth = 444;
							break;

						case '256':
							btnWidth = 888;
							break;
					}
				}
				else if (type === 'icon_text') {
					imgPath += 'icon_text/story_icon_text_' + size + '.png';

					switch (size) {
						case '64':
							btnWidth = 338;
							break;

						case '96':
							btnWidth = 507;
							break;

						case '128':
							btnWidth = 676;
							break;

						case '256':
							btnWidth = 1352;
							break;
					}
				}
				else if (type === 'web') {
					imgPath += 'web/kakaostory_web_56x20.png';
					size = 20;
					btnWidth = 56;
				}

				button.style.backgroundColor = 'transparent';
				button.style.backgroundRepeat = 'no-repeat';
				button.style.border = 'none';
				button.style.cursor = 'pointer';

				setBgStyle(button, btnWidth, parseInt(size), imgPath);

				$on(button, 'click', handler);
				handler = null;
			}
		});

		return app;
	}(userAgent, web2app);

	var dependencyError = function(list) {
		list = list.join(', ');

		throw 'dependency error: module not found(' + list + ')';
 	};

	var depList = [];

	if (typeof exports.daumtools !== undefined) {
		var userAgent = (exports.daumtools.userAgent !== undefined) ? exports.daumtools.userAgent : null,
				web2app   = (exports.daumtools.web2app !== undefined) ? exports.daumtools.web2app : null;

		if (userAgent === null) {
			depList.push('userAgent');
		}

		if (web2app === null) {
			depList.push('web2app');
		}

		if (depList.length > 0) {
			dependencyError(depList);
		}
	}
	else {
		depList.push('userAgent');
		depList.push('web2app');

		dependencyError(depList);
	}

	if (typeof define === 'function' && define.amd) {
		define(['kko', 'userAgent', 'web2app', 'exports'], function(kko, userAgent, web2app, exports) {
			exports.kko = kko;
		});
	}
	else {
		exports.kko = kko;
	}
})(window);