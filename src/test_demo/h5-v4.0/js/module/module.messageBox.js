define(function (require, exports, module) {
	if(!$){
		 var $ = require('jquery')
	}
    var   options = {},
        box;

    function MessageBox(opts) {
        var _this = this;
        if (typeof opts == 'string') {
            options = MessageBox.prototype.defaults;
            options.text = opts;
        } else {
            opts = opts || {};
            options = $.extend({}, MessageBox.prototype.defaults, opts);
        }
        _this.init && _this.init();
    }
    MessageBox.prototype = {
        init: function () {
            var _this = this;

            _this.box = box = (function () {
                if (!$(options.boxCell).length) {
                    if (options.boxCell.indexOf('#') >= 0) {
                        options.boxCell = options.boxCell.substr(0, options.boxCell.length)
                    }
                    return $('<div>', {
                        id: options.boxCell,
                        class: 'toast'
                    }).appendTo('body');
                } else {
                    return $(options.boxCell);
                }
            })().get(0);

            $(box).html('<div class="container">\
                <span class="close iconfont"></span>\
                <div class="message">\
                </div>\
                <div class="buttons"></div>\
            </div>').find('.message').html(options.text)
            .siblings('.buttons').html(function () {
                var str = '';
                $(options.buttons).each(function (index, ele) {
                    str += '<a class="' + (options.buttonsClassName[ele] ? options.buttonsClassName[ele] + ' ' : '') + 'btn" data-role="' + ele + '">' + options.buttonsText[ele] + '</a>';
                });
                return str;
            });

            $(box).find('.container')
                .delegate('.btn,.close', 'click', _this.hide)
                .delegate('[data-role="confirm"]', 'click', function () {
                    options.onConfirm && options.onConfirm.call(_this);
                })
                .delegate('[data-role="cancel"]', 'click', function () {
                    options.onCancel && options.onCancel.call(_this);
                });

            _this.show();
        },
        show: function () {
            var _this = this;
            options.addClass && $(box).addClass(options.addClass);
            $(box).fadeIn();
            options.onShow && options.onShow.call(_this);
            if (/\d+/.test(options.timeout) && +options.timeout > 0) {
                setTimeout(function() {
                    options.ontimeOut && options.ontimeOut.call(_this);
                    _this.hide();
                }, parseInt(options.timeout));
            }
        },
        hide: function () {
            var _this = this;
            $(box).fadeOut();
            options.onHide && options.onHide.call(_this);
            options.addClass && $(box).removeClass(options.addClass);
        }
    };
    MessageBox.prototype.defaults = {
        boxCell: 'messagebox',                       //只接受id
        text: '\u786e\u5b9a\u6267\u884c\u6b64\u64cd\u4f5c',
        buttons: ['confirm', 'cancel'],
        buttonsText: {
            confirm: '\u786e\u5b9a',
            cancel: '\u53d6\u6d88'
        },
        buttonsClassName: {
            confirm: 'btn-green',
            cancel: 'btn-red'
        },
        onConfirm: null,
        onCancel: null,
        timeout: 0,
        addClass:'',
        onShow: null,
        onHide: null
    };

    $.extend({
        messageBox: function (opts) {
            return new MessageBox(opts);
        }
    });
    
    window.messageBox=module.exports = function (opts) {
        return new MessageBox(opts);
    }
});