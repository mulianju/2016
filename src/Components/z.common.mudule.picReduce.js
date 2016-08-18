/*
* @Description: 图片裁剪压缩插件 v1.0
* @Author:      穆连举
* @Create:      2016-08-10 10:42:39
*/
define(function (require, exports, module) {

    //canvasWidth: 300,//图片需要压缩到的宽度（需开放裁切）
    //canvasHeight: 300,//图片需要压缩到的高度（需开放裁切，暂时只支持正方形的裁切）
    //fileInput: document.getElementById('userAvatarInput'),//input[type="file"]表单域
    //onChanged: null,//input表单域changed，并且处理完图片后的回调
    //isSplice: false,//是否进行裁切
    //cssSheet: 'http://icon.zol-img.com.cn/m/css/module/plugin/z.common.module.picSplice.css'

    var options = {},
        img,
        figure,
        originPostion,
        pointerPosition,
        originScale,
        container = document.querySelector('.pic-split-container'),
        transformValue;

    var PicSplice = function (opts) {
        var _this = this;
        if (!opts) opts = {};
        for (var ele in _this.default) {
            options[ele] = (typeof opts[ele] !== 'undefined' ? opts[ele] : _this.default[ele]);
        }

        _this.init();
    }
    PicSplice.prototype = {
        init: function () {
            var _this = this;


            if (options.fileInput.onchange) return;

            if (options.isSplice && options.cssSheet) {
                var style = document.createElement('link');
                style.rel = "stylesheet";
                style.href = options.cssSheet;
                document.head.appendChild(style);
            }

            options.fileInput.onchange = function (e) {

                loading();

                var file = e.target.files[0],
                    reader = new FileReader();

                if (options.isSplice) {
                    transformValue = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

                    window.addEventListener(Event.Touch.move, Event.preventDefault);
                    document.body.addEventListener(Event.Touch.move, Event.preventDefault);

                    initSpliceContainer();
                    container.style.display = 'block';

                    figure.style.width = figure.style.height = window.innerWidth + 'px';
                    figure.style['margin-top'] = (window.innerHeight - window.innerWidth - 60) / 2 + 'px';

                    figure.addEventListener(Event.Touch.up, figureTouchUp);
                    figure.addEventListener(Event.Touch.cancel, figureTouchUp);

                    img = document.createElement('img');
                    reader.onload = (function (aImg) {
                        return function (e) {
                            var temp = document.createElement('img');
                            temp.src = e.target.result;
                            figure.querySelector('img') && figure.querySelector('img').remove();
                            figure.appendChild(aImg);
                            try {
                                aImg.onload = function () {
                                    aImg.style.width = window.innerWidth + 'px';
                                    aImg.style.top = (window.innerWidth - aImg.clientHeight) / 2 + 'px';
                                    loading.loaded();
                                }
                                temp.onload = function () {
                                    loadScript(window.EXIF, 'http://icon.zol-img.com.cn/m/js/personalCenter/exif.js', function () {
                                        EXIF.getData(temp, function () {
                                            EXIF.getAllTags(this);
                                            Orientation = EXIF.getTag(this, 'Orientation');
                                            switch (Orientation) {
                                                case 6://需要顺时针（向左）90度旋转
                                                    aImg.src = rotateImg(this, 'left');
                                                    break;
                                                case 8://需要逆时针（向右）90度旋转
                                                    aImg.src = rotateImg(this, 'right');
                                                    break;
                                                case 3://需要180度旋转
                                                    rotateImg(this, 'right');//转两次 
                                                    aImg.src = rotateImg(this, 'right');
                                                    break;
                                                default:
                                                    aImg.src = rotateImg(this);
                                                    break;
                                            }
                                        });
                                    });
                                }
                            } catch (e) {

                            }
                        };
                    })(img);
                } else {
                    reader.onload = function (e) {
                        var temp = document.createElement('img')
                        temp.src = e.target.result;
                        temp.onload = function () {
                            options.onChanged(rotateImg(this));
                        }
                        
                    }
                }
                reader.readAsDataURL(file);
            };

            document.body.delegate('.pic-split-container .select', 'tap', function () {
                if (typeof options.onChanged == 'function') {
                    options.onChanged(picClip());
                }
            });
            document.body.delegate('.pic-split-container .cancel', 'tap', PicSplice.prototype.close);
        },
        close: function () {
            container.style.display = 'none';
            options.fileInput.value = null;
            window.removeEventListener(Event.Touch.move, Event.preventDefault);
            document.body.removeEventListener(Event.Touch.move, Event.preventDefault);
        }
    }
    PicSplice.prototype.default = {
        canvasWidth: 300,
        canvasHeight: 300,
        fileInput: document.getElementById('userAvatarInput'),
        onChanged: null,
        isSplice: false,
        cssSheet: 'http://icon.zol-img.com.cn/m/css/module/plugin/z.common.module.picSplice.css'
    };

    function initSpliceContainer() {
        // init container
        if (!container) {
            container = document.createElement('div');
            container.classList.add('pic-split-container');
            container.innerHTML = '<figure>\
                    <span></span>\
                </figure>\
                <footer>\
                    <span class="cancel">\u53d6\u6d88</span>\
                    <span class="select">\u9009\u62e9</span>\
                </footer>';
            document.body.appendChild(container);
            figure = container.querySelector('figure');
            figure.addEventListener(Event.Touch.down, figureTouchDown);
        }
    }

    function figureTouchDown(e) {
        Event.preventDefault(e);
        if (!e.touches[0]) return;
        pointerPosition = [];
        [].forEach.call(e.touches, function (ele) {
            pointerPosition.push({
                left: ele.pageX,
                top: ele.pageY
            });
        });
        if (e.touches.length <= 1) {
            originPostion = getTransformValue(img);
            figure.addEventListener(Event.Touch.move, move);
            figure.removeEventListener(Event.Touch.move, scale);
        } else {
            figure.addEventListener(Event.Touch.move, scale);
            figure.removeEventListener(Event.Touch.move, move);
        }
        originScale = transformValue[0];
        return false;
    }

    function figureTouchUp(e) {
        window.removeEventListener(Event.Touch.move, Event.preventDefault);
        document.body.removeEventListener(Event.Touch.move, Event.preventDefault);
        originPostion = pointerPosition = [];
    }

    function scale(e) {
        Event.preventDefault(e);
        var touch_1 = e.touches[0],
            touch_2 = e.touches[1],
            originDistance = Math.sqrt(Math.pow(pointerPosition[0].left - pointerPosition[1].left, 2) + Math.pow(pointerPosition[0].top - pointerPosition[1].top, 2)),
            distance = Math.sqrt(Math.pow(touch_1.pageX - touch_2.pageX, 2) + Math.pow(touch_1.pageY - touch_2.pageY, 2)),
            scale = originScale * (distance / originDistance);
        scale = (scale > 3 ? 3 : scale < 0.3 ? 0.3 : scale);

        transformValue[0] = transformValue[5] = scale;
        setTransformValue(transformValue);
        return false;
    }

    function move(e) {
        Event.preventDefault(e);
        var touch = e.touches[0];

        transformValue[12] = touch.pageX - pointerPosition[0].left + parseInt(originPostion[12]);
        transformValue[13] = touch.pageY - pointerPosition[0].top + parseInt(originPostion[13]);
        setTransformValue(transformValue);
        return false;
    }

    function getTransformValue() {
        var transformValue = window.getComputedStyle(img)[$.transform];

        if (transformValue == 'none') {
            img.transformValue = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        } else {
            transformValue = transformValue.substr(7, transformValue.length - 8).split(',');
            img.transformValue[0] = transformValue[0];
            img.transformValue[5] = transformValue[3];
            img.transformValue[12] = transformValue[4];
            img.transformValue[13] = transformValue[5];

        }
        return img.transformValue;
    }

    function setTransformValue(value) {
        value.forEach(function (ele, index) {
            value[index] = +ele;
        })
        var str = JSON.stringify(value);
        str = str.substr(1, str.length - 2);
        img.style[$.transform] = 'matrix3d(' + str + ')';
    }

    function picClip() {
        loading();
        var canvas = document.getElementById('user-avatar-data');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'user-avatar-data';
            document.body.appendChild(canvas);
            canvas.style.display = 'none';
        }
        canvas.width = options.canvasWidth;
        canvas.height = options.canvasHeight;

        var ctx = canvas.getContext("2d"),
            relScale = transformValue[0],
            canvasRate = canvas.width / figure.clientWidth,
            canvasStartX = (figure.clientWidth - transformValue[0] * img.clientWidth) / 2 + transformValue[12],
            canvasStartY = (figure.clientHeight - transformValue[0] * img.clientHeight) / 2 + transformValue[13],
            canvasEndX = (figure.clientWidth + transformValue[0] * img.clientWidth) / 2 + transformValue[12] - canvasStartX,
            canvasEndY = (figure.clientHeight + transformValue[0] * img.clientHeight) / 2 + transformValue[13] - canvasStartY;

        ctx.fillRect(0, 0, options.canvasWidth, options.canvasHeight);

        ctx.drawImage(
            img,
            0,
            0,
            img.naturalWidth,
            img.naturalHeight,
            canvasStartX * canvasRate,
            canvasStartY * canvasRate,
            canvasEndX * canvasRate,
            canvasEndY * canvasRate
        );

        PicSplice.prototype.close();

        return canvas.toDataURL();
    }

    function loading() {
        !loading.cover && (loading.cover = document.querySelector('.opacity-cover'));
        if (!loading.cover) {
            loading.cover = document.createElement('div');
            loading.cover.classList.add('opacity-cover');
            document.body.appendChild(loading.cover)
        };
        !loading.loader && (loading.loader = document.querySelector('body > div.loading'));
        if (!loading.loader) {
            loading.loader = document.createElement('div');
            loading.loader.innerHTML = '<span class="loading-ring"></span>';
            loading.loader.classList.add('loading');
            document.body.appendChild(loading.loader);
        }
        document.body.classList.add('loading-page');
        document.body.addEventListener(Event.Touch.move, Event.preventDefault);
    }
    loading.loaded = function () {
        document.body.removeEventListener(Event.Touch.move, Event.preventDefault);
        document.body.classList.remove('loading-page');
    }
    function loadScript(modName, src, callback) {
        if (!modName) {
            var script = document.createElement('script');
            document.body.appendChild(script); script
            script.src = src;
            callback && (script.onload = callback);
        } else {
            callback && callback();
        }
    }
    function rotateImg(img, direction) {
        //最小与最大旋转方向，图片旋转4次后回到原方向    
        var min_step = 0;
        var max_step = 3;

        if (img == null) return;
        //img的高度和宽度不能在img元素隐藏后获取，否则会出错
        var rate = Math.floor(img.naturalHeight / 800)
        height = img.naturalHeight,
        width = img.naturalWidth;

        rate > 1 && (height = height / rate) && (width = width / rate)

        var step = 2;
        if (direction == 'right') {
            step++;
            //旋转到原位置，即超过最大值
            step > max_step && (step = min_step);
        } else if (direction == 'left') {
            step--;
            step < min_step && (step = max_step);
        } else if (!direction) {
            step = min_step;
        }

        var canvas = document.getElementById("rotate-img");
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'rotate-img';
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
        }

        //旋转角度以弧度值为参数    
        var degree = step * 90 * Math.PI / 180,
            ctx = canvas.getContext('2d'),
            x,
            y;

        switch (step) {
            case 0:
                canvas.width = width;
                canvas.height = height;
                x = 0;
                y = 0;
                break;
            case 1:
                x = 0;
                canvas.width = height;
                canvas.height = width;
                y = -height;
   
                ctx.rotate(degree);
                break;
            case 2:
                canvas.width = width;
                canvas.height = height;
                ctx.rotate(degree);
                x = -width;
                y = -height;
                break;
            case 3:
                canvas.width = height;
                canvas.height = width;
                ctx.rotate(degree);
                x = -width;
                y = 0;
                break;
        }

        var w = img.naturalWidth,
            h = img.naturalHeight;

        if (rate > 1) {
            w = w / rate;
            h = h / rate;
        }

        img.remove();

        ctx.drawImage(img, x, y, w, h);

        return canvas.toDataURL();
    }

    exports.PicSplice = PicSplice;

});