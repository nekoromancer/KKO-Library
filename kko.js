/* jshint browser: true */

/**
 Copyright (c) 2013 Daum Communications Corp.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

(function (exports) {
	'use strict';

	var userAgent = exports.userAgent = function (ua) {
		ua = (ua || window.navigator.userAgent).toString().toLowerCase();
		function checkUserAgent(ua) {
			var browser = {};
			var match = /(dolfin)[ \/]([\w.]+)/.exec( ua ) ||
				/(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
				["","unknown"];
			if (match[1] === "webkit") {
				match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
					/(android)[ \/]([\w._\-]+);/.exec(ua) || [match[0], "safari", match[2]];
			} else if (match[1] === "mozilla") {
				if (/trident/.test(ua)) {
					match[1] = "msie";
				} else {
					match[1] = "firefox";
				}
			} else if (/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)) {
				match[1] = "polaris";
			}

			browser[match[1]] = true;
			browser.name = match[1];
			browser.version = setVersion(match[2]);

			return browser;
		}

		function setVersion(versionString) {
			var version = {};

			var versions = versionString ? versionString.split(/\.|-|_/) : ["0","0","0"];
			version.info = versions.join(".");
			version.major = versions[0] || "0";
			version.minor = versions[1] || "0";
			version.patch = versions[2] || "0";

			return version;
		}

		function checkPlatform (ua) {
			if (isPc(ua)) {
				return "pc";
			} else if (isTablet(ua)) {
				return "tablet";
			} else if (isMobile(ua)) {
				return "mobile";
			} else {
				return "";
			}
		}
		function isPc (ua) {
			if (ua.match(/linux|windows (nt|98)|macintosh/) && !ua.match(/android|mobile|polaris|lgtelecom|uzard|natebrowser|ktf;|skt;/)) {
				return true;
			}
			return false;
		}
		function isTablet (ua) {
			if (ua.match(/ipad/) || (ua.match(/android/) && !ua.match(/mobi|mini|fennec/))) {
				return true;
			}
			return false;
		}
		function isMobile (ua) {
			if (!!ua.match(/ip(hone|od)|android.+mobile|windows (ce|phone)|blackberry|bb10|symbian|webos|firefox.+fennec|opera m(ob|in)i|polaris|iemobile|lgtelecom|nokia|sonyericsson|dolfin|uzard|natebrowser|ktf;|skt;/)) {
				return true;
			} else {
				return false;
			}
		}

		function checkOs (ua) {
			var os = {},
				match = /(iphone|ipad|ipod)[\S\s]*os ([\w._\-]+) like/.exec(ua) ||
					/(android)[ \/]([\w._\-]+);/.exec(ua) ||
					(/android/.test(ua)? ["", "android", "0.0.0"] : false) ||
					(/polaris|natebrowser|([010|011|016|017|018|019]{3}\d{3,4}\d{4}$)/.test(ua)? ["", "polaris", "0.0.0"] : false) ||
					/(windows)(?: nt | phone(?: os){0,1} | )([\w._\-]+)/.exec(ua) ||
					(/(windows)/.test(ua)? ["", "windows", "0.0.0"] : false) ||
					/(mac) os x ([\w._\-]+)/.exec(ua) ||
					(/(linux)/.test(ua)? ["", "linux", "0.0.0"] : false) ||
					(/webos/.test(ua)? ["", "webos", "0.0.0"] : false) ||
					/(bada)[ \/]([\w._\-]+)/.exec(ua) ||
					(/bada/.test(ua)? ["", "bada", "0.0.0"] : false) ||
					(/(rim|blackberry|bb10)/.test(ua)? ["", "blackberry", "0.0.0"] : false) ||
					["", "unknown", "0.0.0"];

			if (match[1] === "iphone" || match[1] === "ipad" || match[1] === "ipod") {
				match[1] = "ios";
			} else if (match[1] === "windows" && match[2] === "98") {
				match[2] = "0.98.0";
			}
			os[match[1]] = true;
			os.name = match[1];
			os.version = setVersion(match[2]);
			return os;
		}

		function checkApp (ua) {
			var app = {},
				match = /(crios)[ \/]([\w.]+)/.exec( ua ) ||
					/(daumapps)[ \/]([\w.]+)/.exec( ua ) ||
					["",""];

			if (match[1]) {
				app.isApp = true;
				app.name = match[1];
				app.version = setVersion(match[2]);
			} else {
				app.isApp = false;
			}

			return app;
		}

		return {
			ua: ua,
			browser: checkUserAgent(ua),
			platform: checkPlatform(ua),
			os: checkOs(ua),
			app: checkApp(ua)
		};
	};

	if (typeof window === 'object' && window.navigator.userAgent) {
		window.ua_result = userAgent(window.navigator.userAgent) || null;
	}

	if (window) {
		window.util = window.util || {};
		window.util.userAgent = userAgent;
	}

})((function (){
	// Make userAgent a Node module, if possible.
	if (typeof exports === 'object') {
		exports.daumtools = (typeof exports.daumtools === 'undefined') ? {} : exports.daumtools;
		return exports.daumtools;
	} else if (typeof window === 'object') {
		window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools;
		return window.daumtools;
	}
})());

/**
 Copyright (c) 2013 Daum Communications Corp.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */

/*jshint devel: true */
(function (exports) {
	"use strict";

	exports.web2app = (function () {

		var TIMEOUT_IOS_SHORT = 1 * 1000,
			TIMEOUT_IOS_LONG = 2 * 1000,
			TIMEOUT_ANDROID = 3 * 100,
			INTERVAL = 100,
			ua = daumtools.userAgent(),
			os = ua.os,
			intentNotSupportedBrowserList = [
				'firefox',
				'opr'
			];

		function moveToStore (storeURL) {
			window.location.href = storeURL;
		}

		function web2app (context) {
			var willInvokeApp = (typeof context.willInvokeApp === 'function') ? context.willInvokeApp : function(){},
				onAppMissing  = (typeof context.onAppMissing === 'function')  ? context.onAppMissing  : moveToStore,
				onUnsupportedEnvironment = (typeof context.onUnsupportedEnvironment === 'function') ? context.onUnsupportedEnvironment : function(){};

			willInvokeApp();

			if (os.android) {
				if (isIntentNotSupportedBrowser() || !!context.useUrlScheme) {
					if (context.storeURL) {
						web2appViaCustomUrlSchemeForAndroid(context.urlScheme, context.storeURL, onAppMissing);
					}
				} else if (context.intentURI){
					web2appViaIntentURI(context.intentURI);
				}
			} else if (os.ios && context.storeURL) {
				web2appViaCustomUrlSchemeForIOS(context.urlScheme, context.storeURL, onAppMissing);
			} else {
				setTimeout(function () {
					onUnsupportedEnvironment();
				}, 100);
			}
		}

		function isIntentNotSupportedBrowser () {
			var blackListRegexp = new RegExp(intentNotSupportedBrowserList.join('|'), "i");
			return blackListRegexp.test(ua.ua);
		}

		function web2appViaCustomUrlSchemeForAndroid (urlScheme, storeURL, fallback) {
			deferFallback(TIMEOUT_ANDROID, storeURL, fallback);
			launchAppViaHiddenIframe(urlScheme);
		}

		function deferFallback(timeout, storeURL, fallback) {
			var clickedAt = new Date().getTime();
			return setTimeout(function () {
				var now = new Date().getTime();
				if (isPageVisible() && now - clickedAt < timeout + INTERVAL) {
					fallback(storeURL);
				}
			}, timeout);
		}

		function web2appViaIntentURI (launchURI) {
			setTimeout(function () {
				top.location.href = launchURI;
			}, 100);
		}

		function web2appViaCustomUrlSchemeForIOS (urlScheme, storeURL, fallback) {
			var tid;
			if (parseInt(ua.os.version.major, 10) < 8) {
				tid = deferFallback(TIMEOUT_IOS_LONG, storeURL, fallback);
				bindPagehideEvent(tid);
			} else {
				// to avoid ios store alert
				if (moveToStore === fallback) {
					tid = deferFallback(TIMEOUT_IOS_SHORT, storeURL, fallback);
				} else {
					tid = deferFallback(TIMEOUT_IOS_LONG, storeURL, fallback);
				}
				bindVisibilityChangeEvent(tid);
			}
			launchAppViaHiddenIframe(urlScheme);
		}

		function bindPagehideEvent (tid) {
			window.addEventListener('pagehide', function clear () {
				if (isPageVisible()) {
					clearTimeout(tid);
					window.removeEventListener('pagehide', clear);
				}
			});
		}

		function bindVisibilityChangeEvent (tid) {
			document.addEventListener('visibilitychange', function clear () {
				if (isPageVisible()) {
					clearTimeout(tid);
					document.removeEventListener('visibilitychange', clear);
				}
			});
		}

		function isPageVisible () {
			var attrNames = ['hidden', 'webkitHidden'];
			for(var i=0, len=attrNames.length; i<len; i++) {
				if (document[attrNames[i]] !== 'undefined') {
					return !document[attrNames[i]];
				}
			}
			return true;
		}

		function launchAppViaHiddenIframe (urlScheme) {
			setTimeout(function () {
				var iframe = createHiddenIframe('appLauncher');
				iframe.src = urlScheme;
			}, 100);
		}

		function createHiddenIframe (id) {
			var iframe = document.createElement('iframe');
			iframe.id = id;
			iframe.style.border = 'none';
			iframe.style.width = '0';
			iframe.style.height = '0';
			iframe.style.display = 'none';
			iframe.style.overflow = 'hidden';
			document.body.appendChild(iframe);
			return iframe;
		}

		/**
		 * app.을 실행하거나 / store 페이지에 연결하여 준다.
		 * @function
		 * @param context {object} urlScheme, intentURI, storeURL, appName, onAppMissing, onUnsupportedEnvironment, willInvokeApp
		 * @example daumtools.web2app({ urlScheme : 'daumapps://open', intentURI : '', storeURL: 'itms-app://...', appName: '다음앱' });
		 */
		return web2app;

	})();

})(window.daumtools = (typeof window.daumtools === 'undefined') ? {} : window.daumtools);

(function (exports) {
	"use strict";

	/* package version info */
	exports.daumtools = (typeof exports.daumtools === "undefined") ? {} : exports.daumtools;
	if(typeof exports.daumtools.web2app !== "undefined") {
		exports.daumtools.web2app.version = "1.0.4";
	}
}(window));

/**
 Copyright (c) 2014 Lee Seungyeop Aka Nekoromancer

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */

(function (exports) {
	'use strict';

	// CustomEvent 에서 정의한 이벤트를 배열에 저장합니다.
	var customEvents = [];

 	// 브라우저에 CustomEvent 함수가 없을 경우 새로 정의합니다.
	if (typeof window.CustomEvent !== 'function') {
		window.CustomEvent = function (eventName, eventInitDict) {
			var newEvent;

			customEvents.push(eventName);

			if (typeof document.createEvent === 'function') {
				newEvent = document.createEvent('CustomEvent');
				newEvent.initCustomEvent(eventName,
					!!(eventInitDict && eventInitDict.bubbles),
					!!(eventInitDict && eventInitDict.cancelable),
					(eventInitDict ? eventInitDict.details : null));
				return newEvent;
			}
			else {
				document.documentElement['eventProperty' + eventName] = false;
			}
		};
	}

	var kko = function (userAgent, web2app) {
		// 내부 변수 선언
		var app           = {},
		    status        = {},
		    baseUrl       = 'storylink://posting?',
		    apiver        = '1.0',
		    store         = {
		    	android: 'market://details?id=com.kakao.story',
		    	ios: 'http://itunes.apple.com/app/id486244601'
		    },
			  packageName   = 'com.kakao.story',
			  isInit        = false,
			  isEvtListener = (typeof document.addEventListener === 'function');

		// 임의의 이벤트를 발생시키는 내부 함수
		var $emit = function (event, name) {
			if (typeof document.dispatchEvent === 'function') {
				document.dispatchEvent(event);
			} 
			else {
				document.documentElement['eventProperty' + name] = true;			
			}
		};

		// 리스너 함수
		var $on = function (targetObject, eventName, callBackFunction) {
			if (isEvtListener === true) {
				targetObject.addEventListener(eventName, callBackFunction);
			} 
			else {
				if (eventName === 'load') {
					eventName = 'onreadystatechange';
				} 
				else if (customEvents.indexOf(eventName) === -1) {
					eventName = 'on' + eventName;
				} 
				else {
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
		var initEvent     = new CustomEvent('init'),
		    loginEvent    = new CustomEvent('login'),
			sdkReadyEvent = new CustomEvent('sdkReady');

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
					$emit(sdkReadyEvent, 'sdkEmit');

					if (isEvtListener === true) {
						initialize(appId);
					} 
					else {
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
				} 
				else {
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

							if (typeof successCallback !== 'undefined') {
								$emit(loginEvent, 'login');
								successCallback.call(null, obj);
							}
							else {
								loginEvent.userProfile = obj;
								$emit(loginEvent, 'login');
							}
						});
					});
				},
				fail: function (err) {
					if (typeof failedCallback !== 'undefined') {
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

				if (typeof successCallback !== 'undefined') {
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
				} 
				else {
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
				} 
				else {
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
							if (typeof successCallback !== undefined) {
								successCallback.call(null, res);	
							}
						});
					},
					fail: function(err) {
						if (typeof failedCallback !== undefined) {
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
			 * @param string text: 사용자 입력란에 들어간 내용
			 *
			 * @return void
			 */
			openSharer: function (url, text) {
				Kakao.Story.share({
					url: url,
					text: text
				});
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
							if (typeof successCallback !== 'undefined') {
								successCallback.call(null, res);	
							}
						});
					},
					fail: function (err) {
						if (typeof failedCallback !== 'undefined') {
							failedCallback.call(null, err);
						}
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
							if (typeof successCallback !== 'undefined') {
								successCallback.call(null, res);
							}
						});
					},
					fail: function (err) {
						if (typeof failedCallback !== 'undefined') {
							failedCallback.call(null, err);
						}
					}
				});
			},

			/**
			 * @description: 카카오 스토리 팔로잉 버튼을 생성합니다.
			 *
			 * @param string container: 컨테이너 DOM id
			 * @param string storyId: 카카오 스토리 스토리 이름
			 * @param boolean showFollowerCounter: 팔로워 수 표시 여부(기본 true)
			 * @param string type: 팔로워 수 표시 위치(horizontal(기본), vertical)
			 *
			 * @return void
			 */
			followStory: function (container, storyId, showFollowerCount, type) {
				showFollowerCount = showFollowerCount || true;
				type = type || 'horizontal';

				var makeButton = function () {
					Kakao.Story.createFollowButton({
						container: container,
						id: storyId,
						showFollowerCount: showFollowerCount,
						type: type
					});
				};

				if (typeof window.Kakao !== 'undefined') {
					makeButton();
				} else {
					$on(document, 'init', makeButton);
				}
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
			var loginHandler = function () {
				return function () {
					app.login();
				};
			};

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

				var handler = loginHandler();

				$on(button, 'click', handler);
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
			var shareHandler = function (url, text) {
				return function () {
					app.story.openSharer(url, text);
				};
			};

			for (var i = 0, button; button = kakaoStoryShare[i]; i++) {
				var url       = button.getAttribute('data-url'),
						type      = button.getAttribute('data-type'),
						size      = button.getAttribute('data-size'),
						btnWidth  = 0,
						text      = button.getAttribute('data-text'),
						imgPath   = assetPath + 'buttons/kakaostory/button/';

				var handler = shareHandler(url, text);

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

		$on(window, 'load', function () {
			/**
			* Kakao Story Follow Button
			*/

			var followButtons = document.getElementsByClassName('kko-follow-story');

			for (var i = 0, button; button = followButtons[i]; i++) {
				var story   = button.getAttribute('data-story'),
						counter = button.getAttribute('data-counter') || true,
						type    = button.getAttribute('data-type') || 'horizontal',
						domId   = button.getAttribute('id');

				if (counter === 'true') {
					counter = true;
				}
				else if(counter === 'false') {
					counter = false;
				}

				app.story.followStory('#' + domId, story, counter, type);
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