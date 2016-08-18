/*
	v1.2取消原来在dom加载完成后才进行字体设置，改为执行就设置，避免加载时闪烁的问题
*/

! function(W) {
	/* 
	    dpr         设备像素比
	    scale       缩放倍数
	    timer       延迟对象 
	    rootElement 根元素
	    viewport    meta > viewport
	*/
	var dpr,
		scale,
		timer,
		rootElement = document.documentElement,
		viewport = document.querySelector('meta[name="viewport"]'),
		initFontSize = parseInt(window.getComputedStyle(rootElement)["font-size"]),
		zolDesignParams = document.querySelector('meta[name="zol-rem-params"]'),
		defaultDesignWidth = 640,
		fontStyle = document.getElementById('zol-rem-font-style'),
		rootStyle = document.getElementById('zol-rem-root-style'),
		ua = navigator.userAgent,
		blacklist = [
			{device:'android',browsers:['ucbrowser']},//所有安卓下的uc浏览器
			{device:'mi[\s]+2',browsers:['miuibrowser','mqqbrowser']},//小米2 自带浏览器
			{device:'mi[\s]+note',browsers:['mqqbrowser']},//小米note uc||qq 浏览器
			{device:'iphone',browsers:['zol'],deviceVer:['iphone os 9_\\d+_\\d+']}
		];

	function setZolParams(params){
		if(!params)return;
		if(params = params.content){
			var width = /width=(\d+)/.exec(params);
			width && width[1] && (defaultDesignWidth = width[1]);
			
			var fonts = /fonts=([^;]+)/.exec(params);
			fonts && fonts[1] && (fonts = fonts[1].split(','));
			
			var str = 'body{font-size:' + initFontSize * dpr + 'px}';

			fonts && fonts.forEach(function(size){
				str += '[data-dpr="1"] .f' + size + '{font-size:' + size / 2 + 'px!important}'
				str += '[data-dpr="2"] .f' + size + '{font-size:' + size + 'px!important}'
				str += '[data-dpr="3"] .f' + size + '{font-size:' + size / 2 * 3 + 'px!important}'
			});
			
			if(fonts && !fontStyle){
				fontStyle = document.createElement('style');
				fontStyle.id = 'zol-rem-font-style';
				fontStyle.innerHTML = str;
				document.getElementsByTagName('head')[0].appendChild(fontStyle);
				document.documentElement.setAttribute('data-dpr',dpr);
			}
		};
	};
	
	// 初始化REM，现阶段设计稿依然以640为主，按照取整数的原则，以64来划分刚好得到10，便于换算
	function initialRem() {
		var width = rootElement.getBoundingClientRect().width; // 文档宽度
		width / dpr > defaultDesignWidth && (width = defaultDesignWidth * dpr);
		initialRem.rem = width * 100 / defaultDesignWidth ; // 将页面划分64份，1rem为页面的1/64;
		//rootElement.style.fontSize = initialRem.rem + 'px' // 为根元素设置font-size;
		
		if(!rootStyle){
			rootStyle = document.createElement('style');
			rootStyle.id = 'zol-rem-root-style';
			document.getElementsByTagName('head')[0].appendChild(rootStyle);
		}
		rootStyle.innerHTML = 'html{font-size:' + initialRem.rem + 'px;-webkit-text-size-adjust: 100%;}';
	};

	// 平台暂只支持iPhone和Android,Windows Phone由于用户基数少暂不考虑
	// 规则只取整数，：3倍，2倍，1倍
	if (!dpr && !scale) {
		var platform = (W.navigator.appVersion.match(/android/gi) || W.navigator.appVersion.match(/iphone/gi));
		dpr = Math.round(W.devicePixelRatio);
		dpr = platform ? dpr > 3 ? 3 : dpr : 1;

		blacklist.forEach(function(ele,index){
			var deviceReg = new RegExp(ele.device,'ig');
			deviceReg.test(ua) && (ele.browsers.length && ele.browsers.forEach(function(browser,i){
				var browserReg = new RegExp(browser,'ig');
				browserReg.test(ua) && (dpr = 1);
			})) && (ele.deviceVer.length) && ele.deviceVer.forEach(function(deviceVer){
				var ver = new RegExp(deviceVer,'ig');
				ver.test(ua) && (dpr = 1)
			});
		})
		
		scale = 1 / dpr;
	}

	// 经测试，发现ZOL安卓客户端的UIWebview处理起来会有问题，需添加target-densitydpi进行处理
	if (!viewport) {
		viewport = document.createElement('meta');
		viewport.setAttribute('name', 'viewport');
		viewport.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no' + (/android/i.test(ua) && /zol/i.test(ua) ? ', target-densitydpi=device-dpi' : ''));
		rootElement.firstElementChild.appendChild(viewport);
	} else {
		// 如果已有viewport 将根据初始化缩放比例来；没有按照计算的来
		var initScale = viewport.getAttribute('content').match(/initial\-scale=([^\,$]+)/);
		initScale && (scale = parseFloat(initScale[1]), dpr = parseInt(1 / scale))
	}

	// 将window.dpr设为只读
	Object.defineProperty(window, 'dpr', {
		value: dpr,
		writable: !1
	});

	// 处理resize的情况
	W.addEventListener('resize', function() {
		clearTimeout(timer), timer = setTimeout(initialRem, 300)
	}, false);

	// 处理bfcache的情况,UC等浏览器下存在
	W.addEventListener('pageshow', function(e) {
		e.persisted && (clearTimeout(timer), timer = setTimeout(initialRem, 300))
	}, false);


	// 重置字体方法，主要用于初始化处理和通过ajax动态写入部分的字体处理，只接受一个参数，即需要处理模块，缺省默认为body；
	// 这个方法只是一个临时性的，以后将全部采用react的方式，不在使用此方式进行处理
	W.setupFontSize = function(a) {
		2 !== W.dpr && (a || (a = document.body), a = a.querySelectorAll("[data-changed]"), [].forEach.call(a, function(a) {
			if (!a.style.fontSize) {
				var b = +getComputedStyle(a)["font-size"].replace(/px/, "");
				a.style.fontSize = b / 2 * window.dpr + "px"
			}
		}))
	};
	setZolParams(zolDesignParams);
	initialRem();
	
	var ondocumentReady = function() {
		setupFontSize();
	}
	// 设置字体大小
	document.readyState === 'complete' ? ondocumentReady() : document.addEventListener('DOMContentLoaded',ondocumentReady , false);
}(window);