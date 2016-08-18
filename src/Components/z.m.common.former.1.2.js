define(function(require, exports, module) {
	var opt = {};

	function Former(options) {
		var _this = this;
		!options && (options = {});
		for(var ele in _this.defaults){
			if(typeof options[ele] != 'undefined'){
				opt[ele] = options[ele];
			}else{
				opt[ele] = _this.defaults[ele];
			}
		}
		_this.init();
	};
	Former.prototype = {
		init: function() {
			var _this = this;
			_this.form = opt.form;
			if(!_this.form){return}

			_this.form.onsubmit = _this.submit.bind(_this);
			_this.form.delegate('.error', 'tap', function() {
				this.classList.remove('error');
			})
			if(opt.submitBtn){
				_this.form.submit = _this.submit.bind(_this);
				opt.submitBtn.addEventListener('tap',function(){
					_this.form.trigger('submit');
				});
			}
		},
		submit:function(e){
			var _this = this;
			
			if(opt.isAjaxPost){Event.preventDefault(e);}
			
			_this.data = new FormData(_this.form);
			
			
			if( _this.isSubmiting || !checkNull(_this.form.querySelectorAll('[required="required"],[required]')) || !checkReg(_this.form.querySelectorAll('[pattern]'))){
				return false;
			}

			if(typeof opt.onBeforeSubmit == 'function'){
				_this.data = opt.onBeforeSubmit.call(_this,_this.data);
			}

			if(!_this.data){
				return false;
			}

			if(opt.isAjaxPost){
				_this.isSubmiting = !0;
				$.ajax({
					url:_this.form.action || opt.url,
					data:_this.data,
					dataType:opt.dataType || 'jsonp',
					type:opt.method || _this.form.method || 'post',
					success:function(request){
						if(typeof opt.onSubmitSuccess == 'function'){
							typeof opt.onSubmitSuccess.call(_this,request);
						}
					},
					complete:function(request){
						if(typeof opt.onAjaxComplete == 'function'){
							typeof opt.onAjaxComplete.call(_this,request);
						}
						_this.isSubmiting = !1;
					}
				})
			}
		}
	};

	Former.prototype.defaults = {
		form:document.querySelector('form'),
		onBeforeSubmit:null,
		onSubmitSuccess:null,
		onAjaxComplete:null,
		messager:null,
		method:'',
		dataType:'',
		url:'',
		isAjaxPost:true,
		submitBtn:null
	};

	function checkNull(collection) {
		var flag = true,
			msg = [];
		[].forEach.call(collection, function(input) {
			if (!input.value.trim()) {
				flag = false;
				input.title && msg.push({
					title:input.title,
					name:input.name
				});
				input.classList.add('error');
				input.focus();
			}
		})
		if (!flag) {
			var str = '';
			msg.forEach(function(ele,index){
				str += (index ? ',' : '') + ele.title
				return str;
			});
			str += '\u4e0d\u80fd\u4e3a\u7a7a';
			if(opt.messager){
				opt.messager(str,msg);
			}else if($ && $.toast){
				$.toast(str);
			}else{
				alert(str);
			}
		}
		return flag;
	}

	function checkReg(collection) {
		var flag = true,
			msg = [];
		[].forEach.call(collection, function(input) {
			var pattern = input.getAttribute('pattern') && (new RegExp(input.getAttribute('pattern'), ''));
			if (!pattern.test(input.value.trim())) {
				flag = false;
				input.title && msg.push({
					title:input.title,
					name:input.name
				});
				input.classList.add('error');
				input.focus();
			}
		})
		if (!flag) {
			var str = '';
			msg.forEach(function(ele,index){
				str += ele.title
				index && (str = ',' + str)
				return str;
			});
			str += '\u683c\u5f0f\u4e0d\u6b63\u786e';
			if(opt.messager){
				opt.messager(str,msg);
			}else if($ && $.toast){
				$.toast(str);
			}else{
				alert(str);
			}
		}
		return flag;
	}
	exports.Former = Former;
});