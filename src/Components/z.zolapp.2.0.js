!(function () {
    var ua = navigator.userAgent,
		ios = /iPhone|iPad|iPod|iTouch/i.test(ua),
		webkit = /webkit/i.test(ua),
		android = /android/i.test(ua) || (webkit && !ios),
		platform = ios ? 'iphone' : (android ? 'android' : 'windows'),
        closeTime = 7 * 24 * 60 * 60 * 1000,//关闭顶部标签后
        wechat = /MicroMessenger/i.test(ua),
        site = 'article',
        text = {
            t: {
            	m:'\u770b\u6700\u6709\u7206\u201c\u6599\u201d\u7684\u79d1\u6280\u65b0\u95fb',//看最有爆“料”的科技新闻
            	wap:'\u6570\u7801\u8bc4\u6d4b,\u62a5\u4ef7\u5b9e\u65f6\u8ddf\u8e2a',//数码评测,报价跟踪,客户端更方便
                bbs:'\u901b\u8bba\u575b,\u73a9\u6570\u7801,\u770b\u7f8e\u56fe'//逛论坛,玩数码,看美图
            },
            b: '<b>\u4e00\u4ebf\u7528\u6237\u4e13\u5c5e\u79d1\u6280\u5708\u4ea7\u54c1</b><i>\u79d1\u6280\u7f8e\u5973\u56fe\u96c6,\u6bcf\u65e5\u9001\u798f\u5229</i>'//一亿用户专属科技圈产品  科技美女图集,每日送福利
        },
        topText = text.t.m,
        midPageUrl = 'http://m.zol.com.cn/help.html',
        tips = document.getElementById('wechat-tips');

    /wap.zol.com.cn/.test(location.href) && (topText = text.t.wap) && (site = 'wap');
    /(zol.com.cn\/bbs\/)|(zol.com.cn\/sjbbs\/)/.test(location.href) && (topText = text.t.bbs);

    // 在端里不显示下载按钮 2016-07-27 10:21:34
    if(/(zol)|(shopApp)/i.test(ua)){return}

    radomClassName = randomString(20),
    styleText = '.' + radomClassName + '-top { height: 50px; overflow: hidden; background-color: #e3e3e5; }'
        + '.' + radomClassName + '-top::before { position: relative; top: 50%; margin-left: 10px; margin-right: 10px; -webkit-transform: translateY(-50%); -ms-transform: translateY(-50%); -o-transform: translateY(-50%); transform: translateY(-50%); -moz-transform: translateY(-50%) ;-ms-transform:translateY(-50%) ;-o-transform:translateY(-50%) ;transform:translateY(-50%); pointer-events: none; content: ""; display: block; float: left; width: 34px; height: 34px; border-radius: 5px; padding: 0; vertical-align: top; background: #fff url(http://icon.zol-img.com.cn/m/images/app/logo-opacity.png) no-repeat 50% 50%; -webkit-background-size: 26px 26px; background-size: 26px 26px; }'
        + '.' + radomClassName + '-top a { display: block; height: 50px; line-height: 50px; font-weight: normal; white-space: nowrap; overflow: hidden; text-align: center; -ms-text-overflow: ellipsis; -o-text-overflow: ellipsis; text-overflow: ellipsis; color: #000000; font-size: 16px; }'
        + '.' + radomClassName + '-top a::before,.' + radomClassName + '-bottom > a::before { content: "\u7acb\u5373\u6253\u5f00"; float: right; height: 30px; line-height: 30px; color: #fff; background-color: #507bbf; border-radius: 3px; font-size: 14px; padding: 0 8px; margin: 10px 10px 0; }'
        + '.' + radomClassName + '-top .close { position: absolute; top: -19px; left: -19px; height: 40px; width: 40px; background-color: rgba(0,0,0,0.5); border-radius: 20px; }'
        + '.' + radomClassName + '-top .close::before,' + '.' + radomClassName + '-top .close::after { content: ""; position: absolute; background-color: #fff; -moz-transform: rotate(45deg); -ms-transform: rotate(45deg); -o-transform: rotate(45deg); -webkit-transform: rotate(45deg); transform: rotate(45deg); }'
        + '.' + radomClassName + '-top .close::before { height: 11px; width: 1px; bottom: 7px; right: 12px; }'
        + '.' + radomClassName + '-top .close::after { height: 1px; width: 11px; bottom: 12px; right: 7px; }'
        + '.' + radomClassName + '-bottom > a { display: block; position: relative; clear: both; margin: 10px; height: 50px; padding-left: 50px; font-size: 12px; border: 1px solid #e6e6e6; border-radius: 2px; background: #fff url(http://icon.zol-img.com.cn/m/images/app/logo-opacity.png) no-repeat 7px 7px; -webkit-background-size: 34px 34px; background-size: 34px 34px; }'
        + '.' + radomClassName + '-bottom > a b { display: block; color: #000; font-size: 14px; line-height: 18px; font-weight: 700; margin-top: 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
        + '.' + radomClassName + '-bottom > a i { display: block; color: #636363; font-size: 10px; line-height: 12px; margin-top: 4px; font-style: normal; }'
        + '.wechat-' + radomClassName + '-tips { position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 999; overflow: hidden; background: rgba(0,0,0,.85); opacity: 0; -webkit-transition: opacity .4s; -moz-transition: opacity .4s; -o-transition: opacity .4s; transition: opacity .4s; }'
        + '.wechat-' + radomClassName + '-tips span { display: block; pointer-events: none; position: absolute; right: 57px; top: 129px; min-width: 177px; font-size: 14px; line-height: 20px; color: #40a3ff; text-align: left; white-space: nowrap; }'
        + '.wechat-' + radomClassName + '-tips:after { content: ""; display: block; pointer-events: none; position: absolute; top: 3px; right: 18px; width: 283px; height: 220px; background: url(http://icon.zol-img.com.cn/m/images/app/wechat-tips.png) no-repeat 50% 50%; -webkit-background-size: 283px 220px; background-size: 283px 220px; }'

    topButton = document.createElement('div'),
    bottomButton = document.createElement('div'),
    style = document.createElement('style'),
    isShowTopAd = (typeof window.isShowTopAd !== 'undefined' ? window.isShowTopAd : getLocalStorage());

    if (
        /^http:\/\/m.zol.com.cn\/article\/\d+.html#p\d+$/i.test(location.href) || //文章图赏，带hash的时候，默认不显示顶部下载按钮
		/^http:\/\/m.zol.com.cn\/slide\/\d+.html/i.test(location.href) //图赏文章页，直接干掉
    ) {
        isShowTopAd = 0;
    }

    function init() {
        style.innerHTML = styleText;
        style.id = 'zol-app-style';
        document.head.appendChild(style);

        isShowTopAd && initTopAd();
        initBottomAd();

        [].forEach.call(document.querySelectorAll('.' + radomClassName + '-top a,.' + radomClassName + '-bottom a,.download a,.download-top a, #footer .download, body > footer .download,.zolapp-download,.zolapp'), function (a) {
            a.addEventListener('click', function (e) {
                var href = a.href,
                    role = a.getAttribute('data-role')
                e.preventDefault();
                statistics('zolapp-' + (role ? role : topButton.contains(a) ? 'top' : bottomButton.contains(a) ? 'bottom' : 'content') + '-click', 'clickurl=' + encodeURIComponent(href), false);

                if(wechat){
                    wechatTips()
                }else{
                    location.href = (wechat && (ios || android)) ? 'http://a.app.qq.com/o/simple.jsp?pkgname=com.zol.android' : (ios ? 'https://itunes.apple.com/cn/app/zhong-guan-cun-zai-xianiphone/id539824445?mt=8' : (android ? 'http://sj.zol.com.cn/down.php?softid=20061&subcateid=106&site=11&server=111&w=1&m=0' : 'http://www.windowsphone.com/zh-cn/store/app/%E4%B8%AD%E5%85%B3%E6%9D%91%E5%9C%A8%E7%BA%BF/cbff8656-4fcc-4052-a5f1-6eab30f59570'));
                };
            });

        });
    };

    function wechatTips() {

        !wechatTips.tips && (wechatTips.tips = document.querySelector('.wechat-' + radomClassName + '-tips'));
        if (!wechatTips.tips) {
            wechatTips.tips = document.createElement('div');
            wechatTips.tips.className = 'wechat-' + radomClassName + '-tips';
            wechatTips.tips.addEventListener('touchstart', function () {
                this.touchstart = 1;
            });
            wechatTips.tips.addEventListener('touchmove', function (e) {
                e.preventDefault();
            });
            wechatTips.tips.addEventListener('touchend', function () {
                if (this.touchstart) {
                    this.style.opacity = 0;
                    setTimeout(function () {
                        wechatTips.tips.style.display = 'none';
                    }, 400);
                }
            });
            document.addEventListener('touchmove', function () {
                wechatTips.tips.touchstart = 0;
            });
            document.addEventListener('touchcancel', function () {
                wechatTips.tips.touchstart = 0;
            });
            wechatTips.tips.innerHTML = '<span>\u5728' + (/iPhone|iPad|iPod|iTouch/i.test(window.navigator.userAgent) ? ' Safari ' : '\u6d4f\u89c8\u5668') + '\u4e2d\u6253\u5f00</span>';
            document.body.appendChild(wechatTips.tips);
        }
        setTimeout(function () {
            wechatTips.tips.style.display = 'block';
            setTimeout(function () {
                wechatTips.tips.style.opacity = 1;
            }, 0);
        }, 200);
    }

    function initTopAd() {
        topButton.classList.add(radomClassName + '-top');
        topButton.innerHTML = '<a href="' + midPageUrl + '">' + topText + '</a><span class="close">\u5173\u95ed</span>';
        document.body.insertBefore(topButton, document.body.firstElementChild);
        topButton.addEventListener('click', function (e) {
            e.target.classList.contains('close') && close();
        })
    }
    function initBottomAd() {
        bottomButton.classList.add(radomClassName + '-bottom');
        bottomButton.innerHTML = '<a class="' + radomClassName + '" href="' + midPageUrl + '">' + text.b + '</a>';

        var footer = document.getElementById('footer') || document.querySelector('body > footer') || document.querySelector('body > .footer'),
            fadeBack = footer && footer.querySelector('.feedback');

        if(fadeBack){
            if(fadeBack.nextElementSibling){
                fadeBack.parentNode.insertBefore(bottomButton, fadeBack.nextElementSibling);
            }else{
                fadeBack.parentNode.appendChild(bottomButton);
            }
        }
    }

    function randomString(len) {
        len = len || 32;
        var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var maxPos = $chars.length;
        var pwd = '';
        for (i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }

    function close() {
        statistics('zolapp-close');
        topButton.remove();
        setLocalStorage();
    }

    //获取本地存储，判断用户是否关闭了顶部广告，或者关闭后是否超过七天
    function getLocalStorage() {
        var flag = true,
            now = new Date(),
            temp;
        try {
            if (window.localStorage) {
                temp = window.localStorage.getItem('zol-app-closed');
                'string' == typeof temp && (temp = JSON.parse(temp));

                if (temp.t && (now.getTime() - (new Date(+temp.t)).getTime() <= closeTime)) {
                    flag = false;
                } else {
                    window.localStorage.removeItem('zol-app-closed');
                }
            }

            return flag;
        } catch (e) {
            return flag;
        }

    }

    //设置本地存储，用户关闭顶部广告后，七天内不再显示
    function setLocalStorage() {
        var now = new Date(),
            temp = {};
        try {
            if (window.localStorage) {
                temp.t = now.getTime();
                window.localStorage.setItem('zol-app-closed', JSON.stringify(temp));
            }
        } catch (e) { }
    }

    //统计事件
    function statistics(eventName, params) {
        var ip_ck = document.cookie.match(/ip_ck=([^;]*)/);
        ip_ck && ip_ck[1] && (ip_ck = ip_ck[1]);
        if (!statistics.container) {
            statistics.container = document.createElement('div');
            statistics.container.style.cssText = 'position: absolute; z-index: -1; pointer-events: none; width: 0; height: 0; overflow: hidden; top: -10px; left: -10px;';
            document.body.appendChild(statistics.container);
        }
        var url = 'http://pvtest.zol.com.cn/images/pvevents.gif?t=' + (new Date().getTime()) + '&event=' + site + '-' + eventName + '-' + platform;

        if(site == 'wap'){
            var eventFrom = '';
            if(typeof subPageType !== 'undefined'){
                eventFrom = subPageType;
            } else if(typeof pageType !== 'undefined'){
                eventFrom = pageType;
            } else if(typeof __PRO__.pageType !== 'undefined'){
                eventFrom = __PRO__.pageType;
            }
            eventFrom && (url += ('-' + eventFrom));
        }
        if (params)
            url += '&' + params;
        url += '&ip_ck=' + (ip_ck || '') + '&url=' + document.URL;
        statistics.container.innerHTML = '<img src="' + url + '" width="0" height="0" alt="trace-code" />';
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();