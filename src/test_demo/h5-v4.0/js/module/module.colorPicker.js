/*
 * jquery.colorPicker 1.2
 * author           mulianju 
 * create time      2016-06-20 14:35:07
 */
define(function (require, exports) {
    var $ = require('jquery'),
        options = {},
        container,
        element;

    if (!$('#z-color-picker').length) {
        var style = $('<style>', {
            html: '.clearfix:after {content:".";display:block;visibility:hidden;clear:both;height:0;font-size:0}\
                .clearfix {*zoom:1}\
                .zColorPicker{position:absolute;width:208px;margin: 7px 0 0 -164px;border:1px solid #ddd;box-shadow: 0 0 4px rgba(0,0,0,.2);background:#f6f6f6;background:-webkit-gradient(linear, 0 0, 0 100%, from(#fff), to(#eee));background:linear-gradient(#fff, #eee 100%);display:none;z-index:1001}\n\
                .zColorPicker:before { content: ""; display: block;  position: absolute; z-index: -1; pointer-events: none; top: -6px; left: 50%; margin-left: 55px; width: 10px; height: 10px; border-top:1px solid #ddd; border-left:1px solid #ddd; background: #fff; -webkit-transform: rotate(45deg); transform: rotate(45deg); }\
                #zColorPicker-data-color, #zColorPicker-data-value{height:20px;border:1px solid #e6e6e6;position:absolute;top:10px}\
                #zColorPicker-data-color{width:38px;left:4px}\
                #zColorPicker-data-value{width:143px;margin:0;padding:0 5px;font:12px/20px Tahoma;background:#fff;outline:none;right:4px}\
                .zColorPicker .zColorTitle, .zColorPicker .zColorBtn{font:14px/35px "Microsoft YaHei";padding:0 4px;color:#666}\
                .zColorPicker .zColorList a, .zColorPicker .zColorMore a{display:inline-block;width:16px;font:0/0 Arial;padding:0;cursor:pointer}\
                .zColorPicker .zColorList a:hover, .zColorPicker .zColorMore a:hover{border:1px solid #000; box-shadow: 1px 1px 0 #fff inset, -1px -1px 0 #fff inset; }\
                .zColorPicker .zColorList{padding:0 4px}\
                .zColorPicker .zColorList a{height:16px;margin:0 2px;float:left}\
                .zColorPicker .zColorList a:hover{width:14px;height:14px}\
                .zColorPicker .zColorMore{padding:0;height:12px;overflow:hidden;text-align:center}\
                .zColorPicker .zColorMore a{width:14px;height:12px;vertical-align:top;border-radius:0}\
                .zColorPicker .zColorMore:nth-child(n+14) a{border-radius:0}\
                .zColorPicker .zColorMore a:hover{width:12px;height:10px}\
                .zColorPicker .zColorBtn{font-size:12px;text-decoration:underline;border:0 none;background:none;cursor:pointer}',
            id: 'z-color-picker'
        }).appendTo('head').get(0);
    }
    $.fn.colorPicker = function (opts) {
        options = $.extend({}, $.fn.colorPicker.defaults, opts);
        element = this.get(0);
        colorPicker.createBox();
        colorPicker.show();
    }

    var colorPicker = {
        createBasic: function () {
            var currentColor = $(element).css('background-color');
            $(container).html(function () {
                var listStr = '<div id="zColorPicker-data-color" style="background-color:' + currentColor + '"></div><input id="zColorPicker-data-value" type="text" value="' + currentColor + '"><div class="zColorTitle">\u4E3B\u9898\u8272</div>';

                for (var i = 0; i < options.colorBasic.length; i++) {
                    if (i > 0)
                        listStr += '<div class="zColorTitle">\u6807\u51C6\u8272</div>';
                    listStr += '<div class="zColorList clearfix">';
                    for (var j = 0; j < options.colorBasic[i].length; j++) {
                        listStr += '<a href="javascript:void(0)" target="_self" style="background:' + options.colorBasic[i][j] + '" data-value="' + options.colorBasic[i][j] + '"></a>';
                    }
                    listStr += '</div>';
                }

                listStr += '<span class="zColorBtn" data-type="none">\u65e0\u989c\u8272\u586b\u5145</span><span class="zColorBtn" data-type="more">\u66F4\u591A\u989C\u8272</span>';

                listStr += "</div>";

                return listStr;

            }).css('padding-top', '31px');

            var as = container.getElementsByTagName('a'), colorInput = document.getElementById('zColorPicker-data-value');
            for (var i = 0; i < as.length; i++) {
                as[i].onmouseover = function (e) {
                    var target = e.target || e.srcElement;
                    if (target && target.getAttribute && (target = target.getAttribute('data-value'))) {
                        document.getElementById('zColorPicker-data-color').style.background = target;
                        colorInput.value = target;
                    }
                }
            }
            colorInput.addEventListener('change', function (e) {
                var c = colorInput.value;
                colorPicker.selectColor(c);
                setTimeout(function () {
                    colorPicker.createNone();
                }, 0);
            })
        },
        createMore: function () {

            $(container).html(function () {

                var listStr = '';
                var s = 0;
                for (var i = 0; i < 7; i++) {
                    listStr += '<div class="zColorMore">';
                    for (var j = 0; j < (i + 7) ; j++) {
                        listStr += '<a href="javascript:void(0)" target="_self" style="background:' + options.colorMore[0][s] + '" data-value="' + options.colorMore[0][s] + '"></a>';
                        s++;
                    }
                    listStr += '</div>';
                }
                for (var i = 5; i >= 0; i--) {
                    listStr += '<div class="zColorMore">';
                    for (var j = (i + 6) ; j >= 0; j--) {
                        listStr += '<a href="javascript:void(0)" target="_self" style="background:' + options.colorMore[0][s] + '" data-value="' + options.colorMore[0][s] + '"></a>';
                        s++;
                    }
                    listStr += '</div>';
                }
                var len = options.colorMore[1].length;
                for (var i = 0; i < len; i++) {
                    if (i % 13 == 0)
                        listStr += '<div class="zColorMore"' + (i < 13 ? 'style="padding-top:9px;"' : 'style="padding-bottom:9px;"') + '>';
                    listStr += '<a href="javascript:void(0)" target="_self" style="background:' + options.colorMore[1][i] + '" data-value="' + options.colorMore[1][i] + '"></a>';
                    if ((i + 1) % 13 == 0)
                        listStr += '</div>';
                }
                listStr += '<span class="zColorBtn" data-type="basic">\u57FA\u672C\u989C\u8272</span>';
                listStr += "</div>";
                return listStr;
            }).css('padding-top', '15px');

        },
        createBox: function () {
            var bounds = element.getBoundingClientRect(),
                _this = this;
            if (!(container = $('.zColorPicker').get(0))) {
                container = $('<div>', {
                    class: 'zColorPicker'
                }).appendTo('body').get(0);
                $(container).delegate('.zColorBtn', 'click', function (e) {
                    var ev = e || window.event,
                        type = $(this).data('type');
                    ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();

                    switch (type) {
                        case 'none':
                            _this.selectColor('transparent');
                            break;
                        case 'more':
                            _this.createMore();
                            break;
                        case 'basic':
                            _this.createBasic();
                            break;
                        default:
                            break;
                    }

                })
                .delegate('a', 'click', function (e) {
                    var ev = e || window.event,
                        color = $(this).data('value');
                    ev.preventDefault();
                    ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble();
                    _this.selectColor(color);
                })
            }
            $(container).css({
                left: (bounds.right + bounds.left) / 2,
                top: bounds.bottom + window.scrollY
            })
            _this.createBasic();
        },
        selectColor: function (color) {
            var _this = this;

            console.log(color)
            $(element).css({ 'background-color': color });
            $(element).data('value', color);
            if (element.previousElementSibling.tagName === 'INPUT') {
                element.previousElementSibling.value = color;
                $(element.previousElementSibling).trigger('change', { color: color });
            }
            typeof options.onSelect == 'function' && options.onSelect(color);
            _this.hide();
            return color;
        },
        hide: function () {
            $(container).hide();
            typeof options.onHide == 'function' && options.onHide();
            element = null;
        },
        show: function () {
            $(container).show();
            typeof options.onShow == 'function' && options.onShow();
        }
    };

    $.fn.colorPicker.defaults = {
        colorBasic: [["#FFFFFF", "#000000", "#E7E6E6", "#44546A", "#5B9BD5", "#ED7D31", "#A5A5A5", "#FFC000", "#4472C4", "#70AD47", "#F2F2F2", "#7F7F7F", "#D0CECE", "#D6DCE4", "#DEEBF6", "#FBE5D5", "#EDEDED", "#FFF2CC", "#D9E2F3", "#E2EFD9", "#D8D8D8", "#595959", "#AEABAB", "#ADB9CA", "#BDD7EE", "#F7CBAC", "#DBDBDB", "#FEE599", "#B4C6E7", "#C5E0B3", "#BFBFBF", "#3F3F3F", "#757070", "#8496B0", "#9CC3E5", "#F4B183", "#C9C9C9", "#FFD965", "#8EAADB", "#A8D08D", "#A5A5A5", "#262626", "#3A3838", "#323F4F", "#2E75B5", "#C55A11", "#7B7B7B", "#BF9000", "#2F5496", "#538135", "#7F7F7F", "#0C0C0C", "#171616", "#222A35", "#1E4E79", "#833C0B", "#525252", "#7F6000", "#1F3864", "#375623"], ["#C00000", "#FF0000", "#FFC000", "#FFFF00", "#92D050", "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0"]],
        colorMore: [["#003366", "#336699", "#3366CC", "#003399", "#000099", "#0000CC", "#000066", "#006666", "#006699", "#0099CC", "#0066CC", "#0033CC", "#0000FF", "#3333FF", "#333399", "#669999", "#009999", "#33CCCC", "#00CCFF", "#0099FF", "#0066FF", "#3366FF", "#3333CC", "#666699", "#339966", "#00CC99", "#00FFCC", "#00FFFF", "#33CCFF", "#3399FF", "#6699FF", "#6666FF", "#6600FF", "#6600CC", "#339933", "#00CC66", "#00FF99", "#66FFCC", "#66FFFF", "#66CCFF", "#99CCFF", "#9999FF", "#9966FF", "#9933FF", "#9900FF", "#006600", "#00CC00", "#00FF00", "#66FF99", "#99FFCC", "#CCFFFF", "#CCCCFF", "#CC99FF", "#CC66FF", "#CC33FF", "#CC00FF", "#9900CC", "#003300", "#009933", "#33CC33", "#66FF66", "#99FF99", "#CCFFCC", "#FFFFFF", "#FFCCFF", "#FF99FF", "#FF66FF", "#FF00FF", "#CC00CC", "#660066", "#333300", "#009900", "#66FF33", "#99FF66", "#CCFF99", "#FFFFCC", "#FFCCCC", "#FF99CC", "#FF66CC", "#FF33CC", "#CC0099", "#993399", "#336600", "#669900", "#99FF33", "#CCFF66", "#FFFF99", "#FFCC99", "#FF9999", "#FF6699", "#FF3399", "#CC3399", "#990099", "#666633", "#99CC00", "#CCFF33", "#FFFF66", "#FFCC66", "#FF9966", "#FF6666", "#FF0066", "#D60094", "#993366", "#A58800", "#CCCC00", "#FFFF00", "#FFCC00", "#FF9933", "#FF6600", "#FF0033", "#CC0066", "#660033", "#996633", "#CC9900", "#FF9900", "#CC6600", "#FF3300", "#FF0000", "#CC0000", "#990033", "#663300", "#996600", "#CC3300", "#993300", "#990000", "#800000", "#993333"], ['#FFFFFF', '#EBEBEB', '#D7D7D7', '#C3C3C3', '#AFAFAF', '#9B9B9B', '#878787', '#737373', '#5F5F5F', '#4B4B4B', '#373737', '#232323', '#0F0F0F', '#F5F5F5', '#E1E1E1', '#CDCDCD', '#B9B9B9', '#A5A5A5', '#919191', '#7D7D7D', '#696969', '#555555', '#414141', '#2D2D2D', '#191919', '#050505']],
        onSelect: null,
        onShow: null,
        onHide: null
    }

});