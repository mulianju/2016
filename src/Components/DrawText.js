function DrawText(options) {
    var _this = this;
    _this.opts = {}

    for (var ele in _this.defaults) {
        if (typeof options[ele] !== 'undefined') {
            _this.opts[ele] = options[ele];
        } else {
            _this.opts[ele] = _this.defaults[ele];
        }
    }
    var allWords = _this.opts.message.split('');

    _this.nowLine = 0;

    _this.cutWords(allWords, _this.opts.maxWidth);
}
DrawText.prototype = {
    cutWords: function(allWords, maxWidth) {
        var _this = this,
            tempText = '',
            shiftWord = '',
            ctx = _this.opts.canvas.getContext('2d');
        ctx.font = _this.opts.fontSize + 'px ' + _this.opts.fontFamily;
        ctx.fillStyle = _this.opts.color;
        // p = document.getElementById('q'); if (!p) {     p = document.createElement('p');     p.id = 'canvasTextTemp';     p.style.cssText = 'opacity:0;position:absolute;top:0;visibility:hidden;left:0;pointer-event:none;z-index:-1;font-size:' +
        // this.opts.fontSize + 'px;white-space:nowrap'     document.body.appendChild(p); } p.innerText = '';

        for (var i = 0; i < allWords.length; i--) {
            if (!allWords.length)
                return;

            if (ctx.measureText(tempText).width < maxWidth) {
                shiftWord = allWords.shift()
                // p.innerHTML += shiftWord;
                tempText += shiftWord;
                if (!allWords.length) {
                    // tempText = p.innerHTML;
                    _this.drawWords(tempText);
                    // p.remove();
                }
            } else {
                allWords.unshift(shiftWord);
                // p.innerHTML = p.innerHTML.substr(0, p.innerHTML.length - 1); tempText = p.innerHTML;
                if (_this.nowLine + 1 == _this.opts.maxLine && allWords.length) {
                    tempText = tempText.substr(0, tempText.length - 1) + '...';
                }
                _this.drawWords(tempText);
                _this.nowLine += 1;

                if (_this.nowLine < _this.opts.maxLine) {
                    _this.cutWords(allWords, _this.opts.maxWidth)
                }
                // p.remove();
                return;
            }
        }
    },
    drawWords: function(tempText) {
        var _this = this,
            ctx = _this.opts.canvas.getContext('2d');

        ctx.fillText(tempText, _this.opts.left, _this.opts.top + _this.nowLine * _this.opts.lineHeight * _this.opts.fontSize, _this.opts.maxWidth);
        ctx.closePath();
    }
}
Object.defineProperty(DrawText.prototype, 'defaults', {
    value: {
        canvas: document.getElementById('canvas'),
        message: 'Please enter your text~',
        maxWidth: 520,
        top: 0,
        left: 20,
        lineHeight: 1.5,
        fontSize: 32,
        maxLine: 4,
        color: '#000',
        fontFamily: window.getComputedStyle(document.documentElement)['font-family']
    }
})
