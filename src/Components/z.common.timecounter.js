define(function(require,exports,module){
	var Countdown = function(opt){
		var _this = this;
		!opt && (opt = {});
		_this.opt = {};
		for(var ele in _this.options){
			_this.opt[ele] = opt[ele] || _this.options[ele];
		}
		_this.init();
	}
	Countdown.prototype = {
		init : function(){
			var _this = this;
				opt = _this.opt;
			opt.container && (opt.container.innerHTML = opt.duration);
			opt.autoCount && _this.start();//如果有autoCount 就执行计时器
		},
		start : function(obj){//开始
			var _this = this,
				opt = _this.opt,
				time;
				
			if(obj && typeof obj.countTime !== 'undefined'){
				time = obj.countTime;
			}else{
				time = opt.duration;
			}
			if(time <= 0){
				_this.stop();
			}else{
				_this.timer = setInterval(function(){
					time--;
					_this.nowTime = time;
					if(time <= 0){
						opt.container && (opt.container.innerHTML = '00');
						_this.stop();
					}else if(time < 10){
						time = '0' + time;
					}
					opt.container && (opt.container.innerHTML = time);
					
					if(typeof _this.opt.onCounting === 'function'){
						_this.opt.onCounting.call(_this,_this.nowTime,time);
					}
				},opt.interval*1000);
			}
			
		},
		stop : function(){//结束
			var _this = this;
			clearInterval(_this.timer);
			if(typeof _this.opt.ontimeover === 'function'){
				_this.opt.ontimeover.call(_this);
			}
		},
		pause : function(){//暂停
			var _this = this;
			_this.stop();
			if(typeof _this.opt.onPause === 'function'){
				_this.opt.onPause.call(_this);
			}
		},
		goOn : function(){//继续
			var _this = this;
			
			var time = _this.nowTime;
			_this.start({
				countTime : time
			})
			if(typeof _this.opt.ongoOn === 'function'){
				_this.opt.ongoOn.call(_this);
			}
		}
	}
	Countdown.prototype.options = {
		duration : 99,//总时长
		interval : 1,//每次用时
		container: document.querySelector('.countdown'),
		autoCount: false,//是否开始计时
		ontimeover : null,//时间用完回调
		ongoOn : null,//继续回调
		onCounting : null,//计时中回调
		onPause : null//暂停回调
	}
	
	exports.Countdown = Countdown;
});
