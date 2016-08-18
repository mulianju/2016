define(function (require, exports) {
    var $ = require('jquery'),
        options,
        element;

    function syncStyle(type, to) {
        var styles;

        var styles = [
            'background-color',
            'opacity',
            'background-image',
            'font-size',
            'line-height',
            'font-weight',
            'font-style',
            'text-decoration',
            'text-align',
            'border-color',
            'border-style',
            'border-width',
            'border-radius',
            'width',
            'height',
            'top',
            'left',
            'rotate',
            'url'
        ];

        style_backgroundColor(to);

        function style_backgroundColor(to) {

            if (to == 'element') {

                var color = toRGBA($('[name="color"]').val(), $('name="alpha"').val());
                $(element).css('background-color', color);

            } else if (to == 'form') {

                var color = $(element).css('background-color');

                if (/rgba/ig.test(color)) {

                    $('[name="color"]').val(toRGB(color));
                    console.log(toRGB(color));
                    $('#slide-background-color').css({ 'background-color': toRGB(color) });
                    $('[name="alpha"]').val(/([^,]+)\)/.exec(color)[1] * 100);
                } else {
                    $('[name="color"]').val(color);
                    $('[name="alpha"]').val(100);
                    $('#slide-background-color').css({ 'background-color': color });
                }

            }

            function toRGBA(color, alp) {
                var rgba;

                if (/#[a-f]{6}/ig.test(color)) {
                    var r = parseInt("0x" + color.substr(1, 2)),
                        g = parseInt("0x" + color.substr(3, 2)),
                        b = parseInt("0x" + color.substr(5, 2)),
                        a = alp;//为透明度
                    rgba = "rgba(" + r + "," + g + "," + b + "," + a + ")";
                } else if (/rgb\(/ig.test(color)) {
                    rgba = color.replace(/\(/, 'a(').replace(/\)/, ',' + alp + ')');
                }

                return rgba;
            }

            function toRGB(color) {
                //注：rgba_color的格式为rgba(0,0,0,0.1)
                var BGcolur = 1;
                var arr = color.split("(")[1].split(")")[0].split(",");
                var a = arr[3];
                var r = BGcolur * (1 - a) + arr[0] * a;
                var g = BGcolur * (1 - a) + arr[1] * a;
                var b = BGcolur * (1 - a) + arr[2] * a;
                return "rgb(" + r + "," + g + "," + b + ")";
            }
        }
        function style_img() { }
        function style_text() { }
        function style_borderAndFill() { }
        function style_sizeAndPosition() { }
        function style_link() { }


    }

    $.fn.editForm = function (opts) {

        options = $.extend({}, opts);

        if (typeof type === 'string') {

        } else if (typeof type === 'undefined') {
            type = 'any';
        }

        element = this.get(0);

        syncStyle('text', 'form');

    }

    $.fn.editForm.defaults = {
        type: null
    }
})