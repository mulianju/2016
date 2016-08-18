define(function (require, exports, module) {
    var $ = require('jquery');

    function Tab(options) {
        var _this = this;
        options = options || {};
        _this.opts = $.extend({}, _this.defaults, options)

        _this.init();
    }

    Tab.prototype = {
        init: function () {
            var _this = this;
            $(_this.opts.tabsCell).on(_this.opts.trigger, function () {
                if ($(this).is('.' + _this.opts.activeCell)) return;
                $(this).addClass(_this.opts.activeCell).siblings().removeClass(_this.opts.activeCell);
                var _for = $(this).data('for');
                _this.show(_for);
            })
            if (_this.opts.initIndex >= 0) {
                $(_this.opts.tabsCell).eq(_this.opts.initIndex).trigger(_this.opts.effect);
            }
        },
        show: function (_for) {
            var _this = this;
            $(_this.opts.tabsCell).each(function (index, ele) {
                var _for = $(ele).data('for');
                $(_for).hide();
            })
            $(_for)[_this.opts.effect]();
            _this.opts.onshow && _this.opts.onshow(_for);
        }
    }

    Tab.prototype.defaults = {
        tabsCell: '.tablist li',
        initIndex: 0,
        trigger: 'click',
        effect: 'show',
        onshow: null,
        activeCell:'on'
    }

    module.exports = function (opts) {
        return new Tab(opts);
    }
});