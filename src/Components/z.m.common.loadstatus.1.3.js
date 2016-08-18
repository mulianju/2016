define(function(require, exports, module) {

	function LoadStatus(ul, opts) {
		var _this = this;
		_this.loadUl = ul;
		_this.options = _this.defaults;

		if (opts) {
			for (var ele in opts) {
				_this.options[ele] = opts[ele];
			}
		}

		_this.init();
	}
	LoadStatus.prototype = {
		init: function() {
			var _this = this;

			if (!_this.loader) {
				_this.loader = _this.options.loader = document.createElement('div');
				_this.options.loader.classList.add(_this.options.loaderCell);
				_this.options.loader.innerHTML = _this.options.loaderText;
				if (_this.loadUl.nextElementSibling) {
					_this.loadUl.parentElement.insertBefore(_this.options.loader, _this.loadUl.nextElementSibling);
				} else {
					_this.loadUl.parentElement.appendChild(_this.options.loader);
				}
			} else if (typeof _this.defaults.loader == 'string') {
				_this.options.loader = document.querySelector(_this.defaults.loader);
			}

			switchClass.call(_this,_this.options.loader);

			_this.isLoaded = _this.loadUl.isLoaded = 0;

		},
		loading: function() {
			var _this = this;
			switchClass.call(_this,_this.options.loader, _this.options.loadingCell);
			_this.options.loader.innerHTML = _this.options.loadingRingHtml + _this.options.loadingText;
			
		},
		loaded: function() {
			var _this = this;
			_this.options.loader.innerHTML = _this.options.loaderText;
			_this.options.loader.classList.remove(_this.options.loadingCell);
		},
		complete: function() {
			var _this = this;
			
			switchClass.call(_this,_this.options.loader, _this.options.loadedCell);
			_this.options.loader.innerHTML = _this.options.completeText;
			_this.isLoaded = _this.loadUl.isLoaded = 1;

			if(typeof _this.options.onComplete == 'function'){
				_this.options.onComplete.call(_this);
			}
		}
	}

	//接受一个字符串参数，可不传，不传的时候默认是去掉loading和loadded状态;
	function switchClass(loader, className) {
		var _this = this;
		loader.classList.remove(_this.options.loadingCell);
		loader.classList.remove(_this.options.loadedCell);
		className && loader.classList.add(className);
	}

	LoadStatus.prototype.defaults = {
		loader: null,
		loadingCell:'loading-more',
		loadedCell:'loaded',
		loaderCell:'load-more',
		loaderText:'\u70b9\u51fb\u52a0\u8f7d\u66f4\u591a',
		loadingText:'\u52a0\u8f7d\u4e2d',
		completeText:'\u5df2\u52a0\u8f7d\u5168\u90e8',
		loadingRingHtml:'<span class="loading-ring"></span>',
		onComplete:null
	}
	exports.LoadStatus = LoadStatus;
})