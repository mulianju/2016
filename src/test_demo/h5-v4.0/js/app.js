!(function(){
	var share = document.querySelector('.share');
	if(share){
		var weibo = share.querySelector('.weibo'),
			qqzone = share.querySelector('.qqzone'),
			// qqweibo = share.querySelector('.qqweibo'),
			wechat = share.querySelector('.wechat');

		weibo && (weibo.href = 'http://service.weibo.com/share/share.php?url=' + location.href + '&title=' + WeixinShareData.icon + '&appkey=4028615622&ralateUid=1951621751&pic=' + WeixinShareData.icon + '&searchPic=false&refer=' + location.href);
		qqzone && (qqzone.href = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + location.href + '&desc=' + WeixinShareData.title + '&pics=' + WeixinShareData.icon + '&summary=');
		// qqweibo && (qq.href = 'http://share.v.t.qq.com/index.php?c=share&a=index&url=' + location.href + '&title=' + WeixinShareData.title + '&appkey=99d207b90670adceaaa416b63528d92c&pic=' + WeixinShareData.icon);
	}
})();

viewport.querySelector(".container").addEventListener("changed", function (e) {
	var lastSlide = viewport.querySelector(".container > .current");
	lastSlide && (lastSlide.classList.remove("current"));
	this.children[this.index] && this.children[this.index].classList.add("current");
	this.children.forEach(function(ele,index){
		if(ele != e.current){
			ele.querySelectorAll('[data-animate]').forEach(function(item){
				item.style.animation = item.style.webkitAnimation = 'none';
			})
		}
	});
	e.current && e.current.querySelectorAll('[data-animate]').forEach(function(ele,index){
		doAnimateList(ele);
	})
});

function doAnimateList(obj) {
	var list = JSON.parse(obj.getAttribute('data-animate'));
	if (list instanceof Array && list.length) {
		obj.aniIndex = 0;
		doAni(obj,list);
	}
}
function doAni(active,list) {
	active.style.animation = active.style.webkitAnimation = 'none';
	requestAnimationFrame(function(){
		active.style.animation = active.style.webkitAnimation = list[active.aniIndex] + ' forwards';
		active.aniIndex++;
		if(!list[active.aniIndex] || active.isSeted){return;}
		active.addEventListener('animationend',function () {
			list[active.aniIndex] && doAni(active,list);
			active.isSeted = 1;
		});
		active.addEventListener('webkitAnimationend',function () {
			list[active.aniIndex] && doAni(active,list);
			active.isSeted = 1;
		});
	});
}

window.addEventListener("load", function () {
	if(viewport.refresh){
		viewport.querySelector(".container").trigger("changed");
	}else{
		viewport.querySelector('.slide').classList.add('current');
	}
	var firstBox = viewport.querySelector('.edit-box-container');
	firstBox && firstBox.querySelectorAll('[data-animate]').forEach(function(ele,index){
		doAnimateList(ele);
	})
});