define(function (require, exports, module) {
    var box,
        $ = require('jquery');

    function Pager(opts) {
        var _this = this;
        _this.options = $.extend(_this.defaults, opts);
        if (!_this.options.allPage) return;
        _this.init();
    }

    Pager.prototype = {
        init: function () {
            var _this = this;

            box = $(_this.options.container).find('.' + _this.options.pagerCell).get(0);

            !box && (box = $('<div>', {
                class: _this.options.pagerCell
            })[_this.options.insertMethod]($(_this.options.container)).get(0));

            $(box).html(function () {
                var str = '<a href="javascript:;" target="_self" data-page="1" class="' + _this.options.activeCell + '">1</a>';
                for (var i = 2; i <= _this.options.allPage; i++) {
                    str += '<a href="javascript:;" target="_self" data-page="' + i + '">' + i + '</a>';
                }
                return str;
            });

            if (_this.options.allPage > 1) {
                _this.nextBtn = $('<a>', {
                    class: _this.options.nextCell,
                    href: 'javascript:;',
                    target:'_self',
                    html: _this.options.nextText
                }).appendTo(box).click(function () {
                    _this.next();
                }).get(0);
                _this.prevBtn = $('<a>', {
                    class: _this.options.prevCell+' disabled',
                    href: 'javascript:;',
                    target: '_self',
                    html: _this.options.prevText
                }).prependTo(box).click(function () {
                    _this.prev();
                }).get(0);
            }
            _this.nowPage = 1;
            $(box).delegate('a[data-page]', 'click', function () {
                _this.nowPage = $(this).data('page');
                _this.nowPage && _this.go(_this.nowPage);
            });
        },
        go: function (i) {
            var _this = this;
            'function' == typeof onchanged && onchanged(i);

            _this.prevBtn && $(_this.prevBtn)[i == 1?'addClass':'removeClass']('disabled');
            _this.nextBtn && $(_this.nextBtn)[i == _this.options.allPage?'addClass':'removeClass']('disabled');

            _this.nowPage = i;
            $('a[data-page]').eq(i - 1).addClass(_this.options.activeCell).siblings().removeClass(_this.options.activeCell);

            'function' == typeof _this.options.onchanged && _this.options.onchanged(i);

            if(typeof _this.options.onchange == 'function'){
                _this.options.onchange.call(_this);
            }
        },
        next: function () {
            var _this = this,
                page = _this.nowPage;
            page += 1;
            if (page > _this.options.allPage){
                return;
            }
            _this.go(page);
        },
        prev: function () {
            var _this = this,
                page = _this.nowPage;
            page -= 1;
            if (page <= 0){
                return;
            }
            _this.go(page);
        }
    }

    Pager.prototype.defaults = {
        prevCell: 'prev',
        nextCell: 'next',
        prevText: '<',
        nextText:'>',
        pagerCell: 'pages',
        activeCell: 'on',
        allPage: 3,
        maxVisPage: 0,
        container: document.body,
        onchanged: null,
        insertMethod:'appendTo'
    }

    module.exports = function (opts) {
        return new Pager(opts)
    };
})