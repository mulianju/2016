// Toast 通知
define(function (require, exports) {
	var toast;
	exports.toast = function (c, t, s, h) {

		exports.toast.dismiss = function () {
			if (Function.isFunction(h)) {
				h.call(toast);
			} else {
				toast.classList.remove('visible');
			}
			c.timeout = setTimeout(function () {
				toast.style.display = 'none';
			}, 400);
			exports.toast.dismiss = function () { };
			return toast;
		}
		if (typeof c === 'string') {
			if (!toast) {
				toast = document.createElement('div');
				toast.className = 'toast';
				document.body.appendChild(toast);
				toast.addEventListener('tap', exports.toast.dismiss);
				toast.lastTop = toast.currentStyle['top'];
				toast.moveTo = exports.toast.moveTo;
				toast.dismiss = exports.toast.dismiss;
			}
			toast.innerHTML = c;
			c = toast;
		}
		if (toast.lastTop) {
			toast.style.top = toast.lastTop;
		}
		if (Function.isFunction(s)) {
			s.call(c);
		} else {
			c.classList.add('visible');
		}
		if (c.timeout) {
			clearTimeout(c.timeout);
		}
		toast.style.display = 'block';
		if (t !== Infinity) {
			t = parseInt(t) || 0;
			if (t < 1)
				t = 2000;
			c.timeout = setTimeout(exports.toast.dismiss, t);
		}
		return c;
	};
	exports.toast.moveTo = function (target) {
		var y, bounds;
		if (toast && target && target.getBoundingClientRect && (bounds = target.getBoundingClientRect())) {
			y = bounds.top - toast.offsetHeight + 55;
			if (y < 0)
				y = bounds.bottom + 10;
			toast.style.top = y + 'px';
		}
		return toast;
	};
});