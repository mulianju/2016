define(function (require, exports) {

    var options = {},
        $ = require('jquery'),
        box = $('#image-resize-hanlders').get(0),
        element,
        isMoved = 0,
        childDocument,
        browserCssHead,
        temp,
        isChanged = 0;


    //获取浏览器的厂商头部
    !(function () {
        if ($('html').css('transform')) {
            browserCssHead = '';
        } else {
            $(['-webkit-', '-moz-', '-ms-', '-o-']).each(function (index, ele) {
                if ($('html').css(ele + 'transform')) {
                    browserCssHead = ele;
                }
            })
        }

    })();

    //阻止编辑区域的冒泡
    !(function ($slides, $slide_settings) {
        $slides.click(preBubble);
        $slide_settings.click(preBubble);

        function preBubble(e) {
            var ev = e || window.event;
            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();
        }
    })($('.page > .slides'), $('.page > .slide-settings'))

    //同步样式
    var syncStyle = {
        toBox: function () {
            var position = getSizeAndPosition(element.container),
                transform = browserCssHead + 'transform',
                css = {
                    left: position.center.x - position.width / 4 + $(options.iframeCell).offset().left,
                    top: position.center.y - position.height / 4 + $(options.iframeCell).offset().top,
                    width: position.width / 2,
                    height: position.height / 2
                };

            css[transform] = $(element.container).css('transform');
            $(box).css(css);
        },
        toElement: function () {
            var transform = browserCssHead + 'transform',
                marginTop=parseFloat($(element.container).css('margin-top')),
                left = parseFloat($(box).css('left')) - $(options.iframeCell).offset().left,
                top = parseFloat($(box).css('top')) - $(options.iframeCell).offset().top,
                width = parseFloat($(box).css('width')) * 2,
                height = parseFloat($(box).css('height')) * 2;

            $(element).css({
                width: width,
                height: height
            });

            $(element.container).css({
                left: left * 2,
                top: top * 2 - marginTop,
                width: width,
                height: height,
                '-webkit-transform': $(box).css(transform),
                'transform': $(box).css(transform)
            })
        }
    }

    //插件主体
    $.fn.editBox = function (opts) {
        var _this = this;
        if (isMoved) { return; }
        options = $.extend({}, $.fn.editBox.defaults, opts);

        !box && creatElement();
        box.styleChanged = {};

        element = _this[0];

        temp = element;
        element.flag = 1;

        childDocument = $(options.iframeCell).contents().get(0);

        $(options.iframeCell).css({ 'pointer-events': 'none' });

        init();

        box.position = getSizeAndPosition(box);

        $(box).on('mousedown', function (e) {
            var ev = e || window.event;
            box.downPosition = {
                x: ev.pageX,
                y: ev.pageY,
                left: parseFloat($(box).css('left')),
                top: parseFloat($(box).css('top'))
            }

            $(window).on('mousemove', boxMove);
            $(window).on('mouseup', boxMove.up);

        }).children('div').each(function (index, ele) {
            $(ele).on('mousedown', function (e) {
                var ev = e || window.event;
                ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();
                ev.preventDefault();

                box.downSize = {
                    x: ev.pageX,
                    y: ev.pageY,
                    width: parseFloat($(box).css('width')),
                    height: parseFloat($(box).css('height')),
                    top: parseFloat($(box).css('top')),
                    left: parseFloat($(box).css('left'))
                }

                boxReSize.holdHandler = ele;
                $(window).on('mousemove', boxReSize);
                $(window).on('mouseup', boxReSize.up);
            });
        })

        //阻止iframe内部内容滑动的时候触发点击事件
        !(function (container) {
            if (childDocument.hadInit) return;
            $(childDocument).on('mousedown', function () {
                $(childDocument).on('mousemove', setMoved);
            })
            $(childDocument).on('mouseup', function () {
                $(childDocument).off('mousemove', setMoved);
            })
            function setMoved() {
                isMoved = 1;
                setTimeout(function () {
                    isMoved = 0;
                }, 50);
            }
            container.addEventListener('changed', function () {
                $('#image-resize-hanlders').length && $.fn.editBox.hide && $.fn.editBox.hide();
            });
            childDocument.hadInit = 1;
        })($(childDocument).find('#viewport .container').get(0))
    };

    //初始化
    function init() {
        if (element.parentNode.classList.contains('edit-box-container')) {
            element.container = element.parentNode;
        }
        if (!element.container) {

            var position = {
                top: $(element).css('top'),
                left: $(element).css('left'),
                width: $(element).css('width'),
                height: $(element).css('height'),
                margin: $(element).css('margin')
            }

            element.container = $('<div>', {
                class: 'edit-box-container'
            }).css({
                position: 'absolute',
                top: position.top,
                left: position.left,
                width: position.width,
                height: position.height,
                margin: position.margin
            }).get(0);

            $(element.container).appendTo($(element).parent()).append($(element).css({ margin: 0 }));
        }


        syncStyle.toBox();
        $.fn.editBox.show();
    }

    //移动目标
    function boxMove(e) {
        isChanged = 1;
        var ev = e || window.event;
        ev.preventDefault();
        $(box).css({
            left: box.downPosition.left + ev.pageX - box.downPosition.x,
            top: box.downPosition.top + ev.pageY - box.downPosition.y
        })
        box.styleChanged.left = ev.pageX - box.downPosition.x
        box.styleChanged.top = ev.pageY - box.downPosition.y
    }
    boxMove.up = function (e) {
        var ev = e || window.event;
        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();
        ev.preventDefault();

        $(window).off('mousemove', boxMove);
        $(window).off('mouseup', boxMove.up);

        syncStyle.toElement();
        syncStyle.toBox();

        if (isChanged && 'function' === typeof options.onchange) {
            options.onchange();
        }
        isChanged = 0;
    }

    //设置目标大小
    function boxReSize(e) {
        isChanged = 1;
        element.isSizing = 1;

        if (!boxReSize.holdHandler) { return }
        var ev = e || window.event,
            type = boxReSize.holdHandler.id.substr(13),
            dx, dy;

        ev.preventDefault();
        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();

        if (/^(nw|n|ne|e|se|s|sw|w)$/.test(type)) {

            if (type.indexOf('w') >= 0) {
                dx = -1;
            } else if (type.indexOf('e') >= 0) {
                dx = 1;
            }
            if (type.indexOf('n') >= 0) {
                dy = -1;
            } else if (type.indexOf('s') >= 0) {
                dy = 1;
            }

            $(box).css({
                top: box.downSize.top + (dy < 0 ? dy * (box.downSize.y - ev.pageY + (ev.view.parent == ev.view ? 0 : $(options.iframeCell).offset().top)) : 0),
                left: box.downSize.left + (dx < 0 ? dx * (box.downSize.x - ev.pageX + (ev.view.parent == ev.view ? 0 : $(options.iframeCell).offset().left)) : 0),
                width: box.downSize.width + (dx ? dx * (ev.pageX - box.downSize.x + (ev.view.parent == ev.view ? 0 : $(options.iframeCell).offset().left)) : 0),
                height: box.downSize.height + (dy ? dy * (ev.pageY - box.downSize.y + (ev.view.parent == ev.view ? 0 : $(options.iframeCell).offset().top)) : 0)
            });


        } else if (/^v$/i.test(type)) {

            var a = ev.pageX - box.position.center.x + (ev.view.parent == ev.view ? 0 : $(options.iframeCell).offset().left),
                b = ev.pageY - box.position.center.y + (ev.view.parent == ev.view ? 0 : $(options.iframeCell).offset().top),
                c = Math.atan(b / a) * 180 / Math.PI,
                transform = browserCssHead + 'transform';

            c += 90;

            if (a < 0) {
                c += 180;
            }

            $(box).css({
                transform: 'rotate(' + c + 'deg)'
            })
        }

        $(document.body).css('cursor', $(boxReSize.holdHandler).css('cursor'));

    }
    boxReSize.up = function (e) {
        var ev = e || window.event;
        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();
        ev.preventDefault();
        $(window).off('mousemove', boxReSize);
        $(window).off('mouseup', boxReSize.up);
        $(document.body).css('cursor', 'auto');

        syncStyle.toElement();
        syncStyle.toBox();

        setTimeout(function () {
            element.isSizing = 0;
        }, 0);


        if (isChanged && 'function' === typeof options.onchange) {
            options.onchange();
        }
        isChanged = 0;

    }

    //获取元素位置信息
    function getSizeAndPosition(element) {
        var rect = $(element).get(0).getBoundingClientRect(),
            center = {
                x: (rect.left + rect.right) / 2,
                y: (rect.top + rect.bottom) / 2
            },
            width = parseFloat($(element).css('width')),
            height = parseFloat($(element).css('height'));

        return {
            width: width,
            height: height,
            center: center
        }
    }

    //创建box元素
    function creatElement() {
        box = $('<div>', {
            id: "image-resize-hanlders",
            html: '<div id="image-resize-vn"></div>\
                <div id="image-resize-v"></div>\
                <div id="image-resize-n"></div>\
                <div id="image-resize-ne"></div>\
                <div id="image-resize-e"></div>\
                <div id="image-resize-se"></div>\
                <div id="image-resize-s"></div>\
                <div id="image-resize-sw"></div>\
                <div id="image-resize-w"></div>\
                <div id="image-resize-nw"></div>'
        }).appendTo('body').hide().get(0);
        $(box).click(function (e) {
            var ev = e || window.event;
            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();
        });
    }

    //插件方法
    //显示
    $.fn.editBox.show = function () {
         
        $(box).fadeIn();
        $(window).on('click', $.fn.editBox.hide);
        if ('function' === typeof options.onshow) {
            options.onshow();
        }
    }
    //隐藏（移出）
    $.fn.editBox.hide = function (e) {
        if ((e&&e.target == box )||element.isSizing) return;
        $(box).remove();
        box = null;
        $(window).off('click', $.fn.editBox.hide);
        $(options.iframeCell).css({ 'pointer-events': 'all' });

        if ('function' === typeof options.onhide) {
            options.onhide();
        }
    }

    //插件参数
    $.fn.editBox.defaults = {
        iframeCell: '#phone-shell',
        onshow: null,
        onhide: null,
        onchange:null
    };

});