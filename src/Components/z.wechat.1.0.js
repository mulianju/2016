/MicroMessenger/i.test(navigator.userAgent) &&
function() {
    var a = document.getElementById("wechat-tips"),
    c = document.querySelectorAll('.share .weixin,.share .wechat,a[href$="#wechat"],a[href$="#weixin"]');
    if (!a && c.length) {
        a = document.createElement("div");
        a.id = "wechat-tips";
        var f = document.querySelector('meta[name="viewport"]');
        f && /width=640/.test(f.content) ? (a.style.cssText = "display: none;position: fixed;z-index: 999;left: 0;top: 0;width: 100%;height: 100%;background: rgba(0,0,0,.9) url(http://icon.zol-img.com.cn/m/images/wechat-tips.png) no-repeat 100% 0;", a.innerHTML = '<span role="button" onclick="this.parentNode.style.display=\'none\';" style="position: relative;display: block;width: 382px;height: 64px;line-height: 64px;margin: 0 auto;top: 624px;border: 2px solid #fff;color: #fff;font-size: 30px;text-align: center;">\u6211\u77e5\u9053\u4e86 </span>') : (a.style.cssText = "display: none;position: fixed;z-index: 999;left: 0;top: 0;width: 100%;height: 100%;background: rgba(0,0,0,.9) url(http://icon.zol-img.com.cn/m/images/wechat-tips.png) no-repeat 100% 0;-webkit-background-size: 320px 416px;background-size: 320px 416px;", a.innerHTML = '<span role="button" onclick="this.parentNode.style.display=\'none\';" style="position: relative;display: block;width: 192px;height: 32px;line-height: 32px;margin: 0 auto;top: 312px;border: 1px solid #fff;color: #fff;font-size: 15px;text-align: center;">\u6211\u77e5\u9053\u4e86 </span>');
        document.body.appendChild(a)
    } [].forEach.call(c,
    function(d) {
        var e = d.nextElementSibling || d.previousElementSibling,
        c = "inline-block";
        e && (c = (e.currentStyle || document.defaultView.getComputedStyle(e)).display);
        d.style.display = c;
        d.addEventListener("click",
        function(b) {
            b && (b.preventDefault && b.preventDefault(), b.preventManipulation && b.preventManipulation(), b.preventMouseEvent && b.preventMouseEvent(), b.returnValue = !1);
            a.style.display = "block"
        })
    })
} ();
var onSendAppMessageSuccess, onSendAppMessageCancel, onShareTimelineSuccess, onShareTimelineCancel, onShareQQSuccess, onShareQQCancel;
if (window.WeixinShareData) 
	WeixinShareData.title || (WeixinShareData.title = document.title || ""),
	WeixinShareData.icon || (meta = document.querySelector('link[rel="apple-touch-icon"]'), 
	WeixinShareData.icon = "http://icon.zol-img.com.cn/m/images/share-default.png"),
	WeixinShareData.description || (WeixinShareData.description = "\u6211\u627e\u5230\u4e86\u5e72\u8d27\uff0c\u5206\u4eab\u7ed9\u4f60\u54c1\u54c1\uff01"),
	WeixinShareData.url || (WeixinShareData.url = location.href || "");
else {
    window.WeixinShareData = {
        title: "",
        icon: "",
        description: "",
        url: "",
        type: "link",
        dataUrl: ""
    };
    if (meta = document.querySelector('meta[name="wechat-title"]')) WeixinShareData.title = meta.getAttribute("content") || document.title || "";
    if (meta = document.querySelector('meta[name="wechat-icon"]')) WeixinShareData.icon = meta.getAttribute("content") || "";
    else if (meta = document.querySelector('link[rel="apple-touch-icon"]')) WeixinShareData.icon = meta.getAttribute("href") || "";
    if (meta = document.querySelector('meta[name="wechat-content"]')) WeixinShareData.description = meta.getAttribute("content") || "";
    else if (meta = document.querySelector('meta[name="description"]')) WeixinShareData.description = meta.getAttribute("content") || "";
    if (meta = document.querySelector('meta[name="wechat-url"]')) WeixinShareData.url = meta.getAttribute("content") || location.href || "";
    WeixinShareData.url = location.href || ""
} ! window.baseJsApiList || Array.isArray(window.baseJsApiList) && 0 === baseJsApiList.length ? window.WeixinShareData.jsApiList = ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ"] : window.WeixinShareData.jsApiList = window.baseJsApiList.concat(["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ"]);
//wx.config(window.WeixinShareData);
"function" !== typeof onShareTimelineSuccess && (onShareTimelineSuccess = function() {});
"function" !== typeof onShareTimelineCancel && (onShareTimelineCancel = function() {});
"function" !== typeof onSendAppMessageSuccess && (onSendAppMessageSuccess = function() {});
"function" !== typeof onSendAppMessageCancel && (onSendAppMessageCancel = function() {});
"function" !== typeof onShareQQSuccess && (onShareQQSuccess = function() {});
"function" !== typeof onShareQQCancel && (onShareQQCancel = function() {});
wx.ready(function() {
    wx.onMenuShareTimeline({
        title: WeixinShareData.sTitle || WeixinShareData.title,
        link: WeixinShareData.url,
        imgUrl: WeixinShareData.icon,
        success: onShareTimelineSuccess,
        cancel: onShareTimelineCancel
    });
    wx.onMenuShareAppMessage({
        title: WeixinShareData.title,
        desc: WeixinShareData.description,
        link: WeixinShareData.url,
        imgUrl: WeixinShareData.icon,
        type: WeixinShareData.type,
        dataUrl: WeixinShareData.dataUrl,
        success: onSendAppMessageSuccess,
        cancel: onSendAppMessageCancel
    });
    wx.onMenuShareQQ({
        title: WeixinShareData.title,
        desc: WeixinShareData.description,
        link: WeixinShareData.url,
        imgUrl: WeixinShareData.icon,
        success: onShareQQSuccess,
        cancel: onShareQQCancel
    })
});
/ZOL/i.test(navigator.userAgent) &&
function() {
    if (WeixinShareData.icon) {
        var a = document.createElement("img");
        a.src = WeixinShareData.icon;
        a.style.cssText = "display:block;position:absolute;pointer-events:none;width:300px;height:300px;opacity:0;z-index:-2";
        a.width = 300;
        a.height = 300;
        document.body.insertBefore(a, document.body.firstChild)
    }
    WeixinShareData.title && WeixinShareData.title !== document.title && window.addEventListener("load",
    function() {
        setTimeout(function() {
            document.title = WeixinShareData.title
        },
        1E3)
    })
} ();