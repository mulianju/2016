define(function(require,exports,module){
	function LoadList(options){
		var _this = this;
		_this.opt = {}
		if(options){
			for(var ele in _this.defaults){
				_this.opt[ele] = typeof options[ele] == 'undefined' ? _this.defaults[ele] : options[ele];
			}
		}else{
			_this.opt = _this.defaults;
		}
		if(typeof _this.opt.list == 'string'){
			_this.list = document.querySelector(_this.opt.list);
		}else if(_this.opt.list instanceof HTMLElement){
			_this.list = _this.opt.list
		}
		_this.init();
	}

	LoadList.prototype = {
		init: function(){
			var _this = this;
			if(!_this.list){return};

			_this.currentPage = _this.opt.initPage;
			_this.scrollLoad = scrollLoad.bind(_this);
			switch(_this.opt.loadAction){
				case 'scroll':
					window.addEventListener('scroll',_this.scrollLoad);
					break;
				default:
					break;
			}

		},
		load:function(){
			var _this = this,
				url = _this.opt.loadUrl || _this.list.getAttribute('data-loadurl') || _this.list.loadUrl,
				data = {
					page:_this.currentPage + 1
				}

			if(_this.isLoading || _this.isLoaded || _this.list.isLoaded){return;}
			
			if(typeof _this.opt.onBeforeLoad == 'function'){
				data = _this.opt.onBeforeLoad.call(_this,data);
			}
			_this.isLoading = !0;
			$.ajax({
				url:url,
				dataType:_this.opt.dataType,
				data:data,
				success:function(request){
					if(typeof _this.opt.onAfterLoad == 'function'){
						_this.opt.onAfterLoad.call(_this,request);
						if(request.code == 200){
							_this.currentPage += 1;
						}
					}
				},
				complete:function(){
					setTimeout(function(){
						_this.isLoading = !1;
					},300);
					if(typeof _this.opt.onLoadedEnd == 'function'){
						_this.opt.onLoadedEnd.call(_this);
					}
				}
			})

		}
	};
	function scrollLoad(){
		var _this = this;
		if(_this.preScrollLoad){return}
		if(_this.list.getBoundingClientRect().bottom < (window.innerHeight + 50)){
			_this.load();
		}
	}
	LoadList.prototype.defaults = {
		list:'.scrollLoadList', // 需要加载的list[dom/class一类的选择器]
		initPage:1,//初始化的页面
		loadUrl:'',//加载的接口
		dataType:'jsonp',//ajax请求的数据类型
		loadAction:'scroll',//是否滚动加载
		onBeforeLoad:null,
		onAfterLoad:null,
		onLoadedAll:null,
		onLoadedEnd:null
	};

	exports.LoadList = LoadList;
});