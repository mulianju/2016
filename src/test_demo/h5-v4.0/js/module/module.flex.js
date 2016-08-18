define(function (require, exports, module) {
    var $ = require('jquery');
    var Flex = function (opt) {
        var _this = this;
        !opt && (opt = {});
        _this.opt = {};
        for (var ele in _this.options) {
            _this.opt[ele] = opt[ele] || _this.options[ele];
        }
        _this.dismiss();
    };
    Flex.prototype = {
        show: function (name) {
            var _this = this, tabIndex = $("#" + name), tabMenu = $(_this.opt.flex).find('.JS_tab li[data-id=' + name + ']');
            if (!tabMenu.length) {
                tabMenu = $(_this.opt.flex).find('.JS_tab li').eq(0);
                tabIndex = $(_this.opt.flex).find('.JS_tab').children(":first")
            }
            $(_this.opt.flex).addClass('visible');
            tabIndex.siblings().removeClass('on');
            tabIndex.addClass('on');
            $(_this.opt.flex).find('.JS_tab li').removeClass('on');
            tabMenu.addClass('on');

            typeof _this.opt.onshow == 'function' && _this.opt.onshow(name);
        },
        hide: function () {
            var _this = this;
            $(_this.opt.flex).removeClass('visible');
            if(typeof _this.opt.onHide == 'function'){
                _this.opt.onHide.call(_this);
            }
        },
        dismiss: function () {
            var _this = this, close = $(_this.opt.flex).find('.close');
            close && close.on('click', function (e) {
                _this.hide();
            })
        },
        viewpop: function (url) {
            var _this = this, tabMenu = $(_this.opt.flex), veiwiframe = tabMenu.find('iframe');
            $(_this.opt.flex).addClass('visible');
            veiwiframe.attr('src', url);
        }
    }
    Flex.prototype.options = {
        flex: '#flexbg',
        close: '.close',
        onshow: null,
        onHide: null
    }
    module.exports = Flex;
});