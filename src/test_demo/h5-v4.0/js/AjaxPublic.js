
/**
 * 异步请求的公共文件
 */
//获取url参数
$(function () {
  (function ($) {
   $.getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
   }
  })(jQuery);
  page = $.getUrlParam('page');
 });
//验证登录获取登录信息
$(function(){
	$.ajax({   
		     url:'/H5-API/AjaxUser.php?action=checklLogin',   
		     type:'get',   
		     data:'',   
		     async : true, //默认为true 异步   
		     dataType:'jsonp',
		     error:function(){   
		        alert('error');   
		     },   
		     success:function(data){
		    	 if(data.code == "200"){
		    		 $('#myself').html(data.obj.zol_admin_suid);
		    		 if(page == null){
		    			 page = 1;
		    		 }
		    		 $.ajax({   
		    		     url:'/H5-API/AjaxTheme.php?action=getMySceneList&page='+page,   
		    		     type:'get',
		    		     dataType:'jsonp',
		    		     error:function(e){ 
		    		    	 //alert('error');
		    		    	 console.log(e);
		    		     },   
		    		     success:function(data1){
		    		    	 if(data1.code == "200"){
		    		    		 $.each(data1.obj,function(key,value){
		    		    			 if(value.showstatus_int == 1){status='已发布';
		    		    			 	$('#themelists').append('<li><div class="pic"><form action="/H5-API/AjaxTheme.php?action=updateSceneBasicPic&sceneid_bigint='+value.sceneid_bigint+'" method="post" enctype="multipart/form-data" class="updateSharePic"><input type="file" name="attach[]" accept=".png,.gif,.jpg" class="app-icon" onchange="javascript: submitform(this)"></form><img src="'+value.thumbnail_varchar+'" alt="" width="150" height="150"><span class="pic-info">'+status+'</span></div><div class="app-detail"><h3 contenteditable="true" style="height:75px;" class="scenetitle" data-sceneid="'+value.sceneid_bigint+'">'+value.scenename_varchar+'</h3><p contenteditable="true" class="scenedesc" style="width:280px;"  data-sceneid="'+value.sceneid_bigint+'">'+value.desc_varchar+'</p><p class="sets"><a href="http://h5x.zol.com.cn/H5-v4.0/html/preview.html?sub_link=http://m.zol.com.cn' + value.themeUrl+'"><span class="iconfont">&#xe613;</span> 预览</a><a href="/H5-v4.0/html/create.html?sceneid_bigint='+value.sceneid_bigint+'"><span class="iconfont">&#xe624;</span> 编辑</a><!--<a href=""><span class="iconfont">&#xe622;</span> 详情</a>--><a href="javascript:void(0)" class="unpublish" data-sceneid="'+value.sceneid_bigint+'"><span class="iconfont">&#xe626;</span>不发布</a><a href="javascript:void(0)" class="deleteTheme" data-sceneid="'+value.sceneid_bigint+'"><span class="iconfont">&#xe61f;</span> 删除</a></p></div></li>');
		    		    			 }else{status = '待发布';
		    		    			 	$('#themelists').append('<li><div class="pic"><form action="/H5-API/AjaxTheme.php?action=updateSceneBasicPic&sceneid_bigint='+value.sceneid_bigint+'" method="post" enctype="multipart/form-data" class="updateSharePic" ><input type="file" name="attach[]" accept=".png,.gif,.jpg" class="app-icon" onchange="javascript: submitform(this)"></form><img src="'+value.thumbnail_varchar+'" alt="" width="150" height="150"><span class="pic-info">'+status+'</span></div><div class="app-detail"><h3 contenteditable="true" style="height:75px;" class="scenetitle" data-sceneid="'+value.sceneid_bigint+'">'+value.scenename_varchar+'</h3><p contenteditable="true" class="scenedesc" style="width:280px;" data-sceneid="'+value.sceneid_bigint+'">'+value.desc_varchar+'</p><p class="sets"><a href="http://h5x.zol.com.cn/H5-v4.0/html/preview.html?sub_link=' + value.themeUrl+'" style="display:none"><span class="iconfont">&#xe613;</span> 预览</a><a href="/H5-v4.0/html/create.html?sceneid_bigint='+value.sceneid_bigint+'"><span class="iconfont">&#xe624;</span> 编辑</a><!--<a href=""><span class="iconfont">&#xe622;</span> 详情</a>--><a href="javascript:void(0)" class="publish" data-sceneid="'+value.sceneid_bigint+'"><span class="iconfont">&#xe626;</span> 发布</a><a href="javascript:void(0)" class="deleteTheme" data-sceneid="'+value.sceneid_bigint+'"><span class="iconfont">&#xe61f;</span> 删除</a></p></div></li>');
		    		    			 }
		    		               }) 
		    		    	 }else{
		    		    		 messageBox({
					    			 text:'<p style="text-align:center">'+data.msg+'</p>',
					    			 buttonsText: {
					    		            confirm: '',
					    		            cancel: ''
					    		        },
					    		     addClass:'opacityBox',
					    		     timeout:3000,
					    		     onHide:function(){
					    		    	 window.location.href="/H5-v4.0/html/list.php"; 
					    		     }
					    			 
					    		 });
		    		    	 }
		    		     }
		    		 }); 
		    	 }else{
		    		 alert(data.msg);
		 			 window.location.href="http://admin.zol.com.cn/login.php?url=http://h5x.zol.com.cn/H5-v4.0/html/list.php";
/*
		    		 messageBox({
		    			 text:'<p style="text-align:center">'+data.msg+'</p>',
		    			 buttonsText: {
		    		            confirm: '',
		    		            cancel: ''
		    		        },
		    		     timeout:3000,
		    		     addClass:'opacityBox',
		    		     onHide:function(){
				 			 window.location.href="http://admin.zol.com.cn/login.php?url=http://zhangsj.h5.zol.com.cn/H5-v4.0/html/list.php";
		    		     }
		    			 
		    		 });
		    		 */
		    	}
		     }
		 });   
});
/*
function ok() 
{ 
	$("#isupdate").val("1");
    $("#test").css('display','none');
} 
function cancle() 
{ 
	$("#isupdate").val("0");
	$("#test").css('display','none');
} 
*/
//失去焦点修改信息
$(document).delegate('.scenetitle','blur',function(){
	/*
	 $("#test").css('display','block');
	 if(parseInt(isupdate)==parseInt(1)){
		 alert('sfdsf');
	 }else{
		 alert(isupdate);
	 }
	*/
	var _name  = $(this).html();
	var sceneid_bigint = $(this).attr('data-sceneid');
	messageBox({
		text:'确定要修改专题标题么?',
		onConfirm:function(){
			 if(_name.length>21){
				alert('标题长度不能超过20个字！'); 
				window.location.href="/H5-v4.0/html/list.php";
			 }else{
				 $.ajax({   
				     url:'/H5-API/AjaxTheme.php?action=updateSceneBasicDetail',   
				     type:'get',   
				     data:{'sceneid_bigint':sceneid_bigint,'scenename_varchar':_name},   
				     async : false, //默认为true 异步   
				     dataType:'jsonp',
				     error:function(e){
				    	 console.log(e);
				        //alert('error');   
				     },   
				     success:function(data){
				    	 if(data.code == "200"){
				    		 messageBox({
				    			 text:'<p style="text-align:center">'+data.msg+'</p>',
				    			 buttonsText: {
				    		            confirm: '',
				    		            cancel: ''
				    		        },
				    		     addClass:'opacityBox',
				    		     timeout:3000,
				    		     onHide:function(){
				    		    	 window.location.href="/H5-v4.0/html/list.php"; 
				    		     }
				    			 
				    		 });
				    	 }
				     }
				 });   
			 }
		},
		onCancel:function(){
			window.location.href="/H5-v4.0/html/list.php";
			return false;
		}
	}); 
	/*
	if(confirm('确定要修改专题标题么?')) {
		 var sceneid_bigint = $(this).attr('data-sceneid');
		 var name  = $(this).html();
		 if(name.length>21){
			alert('标题长度不能超过20个字！'); 
			window.location.href="/H5-v4.0/html/list.php";
		 }else{
			 $.ajax({   
			     url:'/H5-API/AjaxTheme.php?action=updateSceneBasicDetail',   
			     type:'get',   
			     data:{'sceneid_bigint':sceneid_bigint,'scenename_varchar':name},   
			     async : false, //默认为true 异步   
			     dataType:'jsonp',
			     error:function(e){
			    	 console.log(e);
			        //alert('error');   
			     },   
			     success:function(data){
			    	 if(data.code == "200"){
			    		 alert(data.msg);
			 			 window.location.href="/H5-v4.0/html/list.php";
			    	 }
			     }
			 });   
		 }
	}else{
		window.location.href="/H5-v4.0/html/list.php";
		return false;
	}
	 */
});
//失去焦点修改信息
$(document).delegate('.scenedesc','blur',function(){
	var desc  = $(this).html();
	var sceneid_bigint = $(this).attr('data-sceneid');
	messageBox({
		text:'确定要修改专题描述么?',
		onConfirm:function(){
			if(desc.length>31){
				alert('描述长度不能超过30个字！');
				window.location.href="/H5-v4.0/html/list.php";
		 }else{
			 $.ajax({   
			     url:'/H5-API/AjaxTheme.php?action=updateSceneBasicDetail',   
			     type:'get',   
			     data:{'sceneid_bigint':sceneid_bigint,'desc_varchar':desc},   
			     async : false, //默认为true 异步   
			     dataType:'jsonp',
			     error:function(e){
			    	 console.log(e);
			        //alert('error');   
			     },   
			     success:function(data){
			    	 if(data.code == "200"){
			    		 messageBox({
			    			 text:'<p style="text-align:center">'+data.msg+'</p>',
			    			 buttonsText: {
			    		            confirm: '',
			    		            cancel: ''
			    		        },
			    		     timeout:3000,
			    		     addClass:'opacityBox',
			    		     onHide:function(){
			    		    	 window.location.href="/H5-v4.0/html/list.php"; 
			    		     }
			    			 
			    		 });
			    		 //alert(data.msg);
			 			 //window.location.href="/H5-v4.0/html/list.php";
			    	 }
			     }
			 });   
		  }
		},
		onCancel:function(){
			window.location.href="/H5-v4.0/html/list.php";
			return false;
		}
	}); 
	
	/*
	if(confirm('确定要修改专题描述么?')) {
		 if(desc.length>31){
				alert('描述长度不能超过30个字！');
				window.location.href="/H5-v4.0/html/list.php";
		 }else{
			 $.ajax({   
			     url:'/H5-API/AjaxTheme.php?action=updateSceneBasicDetail',   
			     type:'get',   
			     data:{'sceneid_bigint':sceneid_bigint,'desc_varchar':desc},   
			     async : false, //默认为true 异步   
			     dataType:'jsonp',
			     error:function(e){
			    	 console.log(e);
			        //alert('error');   
			     },   
			     success:function(data){
			    	 if(data.code == "200"){
			    		 alert(data.msg);
			 			 window.location.href="/H5-v4.0/html/list.php";
			    	 }
			     }
			 });   
		 }
	}else{
		window.location.href="/H5-v4.0/html/list.php";
		return false;
	}
	*/
}); 
//取消发布
$('#themelists').delegate('.unpublish','click',function(){
	var sceneid =  $(this).attr("data-sceneid");
	messageBox({
		text:'确定要取消发布么?',
		onConfirm:function(){
			$.ajax({   
			     url:'/H5-API/AjaxTheme.php?action=unpublish&sceneid_bigint='+sceneid,   
			     type:'get',   
			     data:'',   
			     async : false, //默认为true 异步   
			     dataType:'jsonp',
			     error:function(){   
			        alert('error');   
			     },   
			     success:function(data){
			    	 if(data.code == "200"){
			    		 messageBox({
			    			 text:'<p style="text-align:center">'+data.msg+'</p>',
			    			 buttonsText: {
			    		            confirm: '',
			    		            cancel: ''
			    		        },
			    		     addClass:'opacityBox',
			    		     timeout:3000,
			    		     onHide:function(){
			    		    	 window.location.href="/H5-v4.0/html/list.php"; 
			    		     }
			    			 
			    		 });
			    	 }
			     }
			 });   
		},
		onCancel:function(){
			window.location.href="/H5-v4.0/html/list.php";
			return false;
		}
	}); 
	/*
	if(confirm('确定要取消发布么?')) {
		$.ajax({   
		     url:'/H5-API/AjaxTheme.php?action=unpublish&sceneid_bigint='+sceneid,   
		     type:'get',   
		     data:'',   
		     async : false, //默认为true 异步   
		     dataType:'jsonp',
		     error:function(){   
		        alert('error');   
		     },   
		     success:function(data){
		    	 if(data.code == "200"){
		    		 alert(data.msg);
		 			 window.location.href="/H5-v4.0/html/list.php";
		    	 }
		     }
		 });   
	}else{
		return false;
	}
	*/
})
//发布
$('#themelists').delegate('.publish','click',function(){
	var sceneid =  $(this).attr("data-sceneid");
	messageBox({
		text:'确定要发布么?',
		onConfirm:function(){
			$.ajax({   
			     url:'/H5-API/AjaxTheme.php?action=publish&sceneid_bigint='+sceneid,   
			     type:'get',   
			     data:'',   
			     async : false, //默认为true 异步   
			     dataType:'jsonp',
			     error:function(){   
			        alert('error');   
			     },   
			     success:function(data){
			    	 if(data.code == "200"){
			    		 messageBox({
			    			 text:'<p style="text-align:center">'+data.msg+'</p>',
			    			 buttonsText: {
			    		            confirm: '',
			    		            cancel: ''
			    		        },
			    		     addClass:'opacityBox',
			    		     timeout:3000,
			    		     onHide:function(){
			    		    	 window.location.href="/H5-v4.0/html/list.php"; 
			    		     }
			    			 
			    		 });
			    	 }
			     }
			 });   
		},
		onCancel:function(){
			window.location.href="/H5-v4.0/html/list.php";
			return false;
		}
	}); 
	/*
	if(confirm('确定要发布么?')) {
		
		$.ajax({   
		     url:'/H5-API/AjaxTheme.php?action=publish&sceneid_bigint='+sceneid,   
		     type:'get',   
		     data:'',   
		     async : false, //默认为true 异步   
		     dataType:'jsonp',
		     error:function(){   
		        alert('error');   
		     },   
		     success:function(data){
		    	 if(data.code == "200"){
		    		 alert(data.msg);
		 			 window.location.href="/H5-v4.0/html/list.php";
		    	 }
		     }
		 });   
		} else {
		return false;
		}
		*/
})
//删除
$('#themelists').delegate('.deleteTheme','click',function(){
	var sceneid =  $(this).attr("data-sceneid");
	messageBox({
		text:'<p style="text-align:center">确定要删除么?<br>删除后将无法恢复</p>',
		buttonsText: {
            confirm: '删除',
            cancel: '取消'
        },
        buttonsClassName: {
            confirm: 'btn-red',
            cancel: 'btn-white'
        },
		onConfirm:function(){
			$.ajax({   
			     url:'/H5-API/AjaxTheme.php?action=deleteTheme&sceneid_bigint='+sceneid,   
			     type:'get',   
			     data:'',   
			     async : false, //默认为true 异步   
			     dataType:'jsonp',
			     error:function(){   
			        alert('error');   
			     },   
			     success:function(data){
			    	 if(data.code == "200"){
			    		 messageBox({
			    			 text:'<p style="text-align:center">'+data.msg+'</p>',
			    			 buttonsText: {
			    		            confirm: '',
			    		            cancel: ''
			    		        },
			    		     addClass:'opacityBox',
			    		     timeout:3000,
			    		     onHide:function(){
			    		    	 window.location.href="/H5-v4.0/html/list.php"; 
			    		     }
			    			 
			    		 });
			    	 }
			     }
			 });   
		},
		onCancel:function(){
			window.location.href="/H5-v4.0/html/list.php";
			return false;
		}
	}); 
	/*
	if(confirm('确定要删除么?')) {
		$.ajax({   
		     url:'/H5-API/AjaxTheme.php?action=deleteTheme&sceneid_bigint='+sceneid,   
		     type:'get',   
		     data:'',   
		     async : false, //默认为true 异步   
		     dataType:'jsonp',
		     error:function(){   
		        alert('error');   
		     },   
		     success:function(data){
		    	 if(data.code == "200"){
		    		 alert(data.msg);
		 			 window.location.href="/H5-v4.0/html/list.php";
		    	 }
		     }
		 });   
		} else {
		return false;
		}
		*/
})
//退出登录
$("#click_logout").click(function(){
	$.ajax({   
	     url:'/H5-API/AjaxUser.php?action=loginout',   
	     type:'get',   
	     data:'',   
	     async : false, //默认为true 异步   
	     dataType:'jsonp',
	     error:function(){   
	        alert('error');   
	     },   
	     success:function(data){
	    	 if(data.code == "200"){
	    		 messageBox({
	    			 text:'<p style="text-align:center">'+data.msg+'</p>',
	    			 buttonsText: {
	    		            confirm: '',
	    		            cancel: ''
	    		        },
	    		     timeout:3000,
	    		     addClass:'opacityBox',
	    		     onHide:function(){
	    	 			 window.location.href="http://admin.zol.com.cn/login.php?url=http://h5x.zol.com.cn/H5-v4.0/html/list.php";
	    		     }
	    			 
	    		 });
	    	 }
	     }
	 });   
});
//退出登录
$(".create-add").click(function(){
	//$('#create-li').css('display':'auto');
	if($("#create-li").attr("select_status")==1){
		$("#create-li").css('display','none');
		$("#create-li").attr("select_status", 0);
	}else{
		$("#create-li").css('display','block');
		$("#create-li").attr("select_status", 1);
	}
});
//新建专题
$('#subTheme').on('click', function() {
	var scenename = $('input[name=scenename_varchar]').val(),
	desc = $('textarea').val(),scenePic = $('#app-icon').val();
	$('#titleNotice').html('');
	$('#descNotice').html('');
	$('#picNotice').html('');
	if(scenePic == ''){
		$('#picNotice').html('<span style="color:red">图片不能为空!</span>');
		return false;
	}
	if(scenename == ''){
		$('#titleNotice').html('<span style="color:red">标题不能为空!</span>');
		return false;
	}
	if(desc == ''){
		$('#descNotice').html('<span style="color:red">描述不能为空!</span>');
		return false;
	}
	$('#create-app').submit();
	/*
    $('form').on('submit', function() {
        var scenename = $('input[name=scenename_varchar]').val(),
        	desc = $('textarea').val();
        $(this).ajaxSubmit({
            type: 'post', // 提交方式 get/post
            url: '/H5-API/AjaxTheme.php?action=addScene', // 需要提交的 url
            data: {
                'title': scenename,
                'content': desc
            },
            success: function(data) { // data 保存提交后返回的数据，一般为 json 数据
                // 此处可对 data 作相关处理
                alert('提交成功！');
            }
            //$(this).resetForm(); // 提交后重置表单
          
        	
        });
        return false; // 阻止表单自动提交事件
    });
    */
});
//取消新建
$('#cancleTheme').on('click', function() {
	$('#create-li').css('display','none');
	return false;
});
function submitform(obj){
	$(obj).closest('form').submit(); 
} 
//图片预览
/****************图片上传预览    IE是用了滤镜。*************************/
function previewImage(file)
{
  var MAXWIDTH  = 300; 
  var MAXHEIGHT = 300;
  var div = document.getElementById('preview');
  if (file.files && file.files[0])
  {
      div.innerHTML ='<i></i><img id=imghead>';
      var img = document.getElementById('imghead');
      $('#picWrongSize').css('display','none');
      img.onload = function(){
     if(img.width != 300 && img.height != 300){
  	      	$('#picWrongSize').css('display','block');
  	      	div.innerHTML ='';
  	      	return false;
  	  }
        var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
        //img.width  =  rect.width;
        //img.height =  rect.height;
        
		img.width  =  300;
		img.height  =  300;
//         img.style.marginLeft = rect.left+'px';
        //img.style.marginTop = rect.top+'px';
      }
      var reader = new FileReader();
      reader.onload = function(evt){img.src = evt.target.result;}
      reader.readAsDataURL(file.files[0]);
  }
  else //兼容IE
  {
	var sFilter='filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="';
    file.select();
    var src = document.selection.createRange().text;
    div.innerHTML = '<i></i><img id=imghead>';
    var img = document.getElementById('imghead');
    img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
    var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
    status =('rect:'+rect.top+','+rect.left+','+rect.width+','+rect.height);
    div.innerHTML = "<div id=divhead style='width:"+rect.width+"px;height:"+rect.height+"px;margin-top:"+rect.top+"px;"+sFilter+src+"\"'></div>";
  }
 
 	var colse = div.getElementsByTagName('i');
 	console.log(colse)
}
function previewImage2(file)
{
  var MAXWIDTH  = 300; 
  var MAXHEIGHT = 300;
  var div = document.getElementById('preview2');
  

  if (file.files && file.files[0])
  {
      div.innerHTML ='<i></i><img id=imghead2>';
      var img = document.getElementById('imghead2');
      img.onload = function(){
        var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
        //img.width  =  rect.width;
        //img.height =  rect.height;
		img.width  =  300;
		img.height  =  300;
//         img.style.marginLeft = rect.left+'px';
        //img.style.marginTop = rect.top+'px';
      }
      var reader = new FileReader();
      reader.onload = function(evt){img.src = evt.target.result;}
      reader.readAsDataURL(file.files[0]);
  }
  else //兼容IE
  {
    var sFilter='filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="';
    file.select();
    var src = document.selection.createRange().text;
    div.innerHTML = '<i></i><img id=imghead2>';
    var img = document.getElementById('imghead2');
    img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
    var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
    status =('rect:'+rect.top+','+rect.left+','+rect.width+','+rect.height);
    div.innerHTML = "<div id=divhead2 style='width:"+rect.width+"px;height:"+rect.height+"px;margin-top:"+rect.top+"px;"+sFilter+src+"\"'></div>";
  }
 
}

function clacImgZoomParam( maxWidth, maxHeight, width, height ){
    var param = {top:0, left:0, width:width, height:height};
    if( width>maxWidth || height>maxHeight )
    {
        rateWidth = width / maxWidth;
        rateHeight = height / maxHeight;
        
        if( rateWidth > rateHeight )
        {
            param.width =  maxWidth;
            param.height = Math.round(height / rateWidth);
        }else
        {
            param.width = Math.round(width / rateHeight);
            param.height = maxHeight;
        }
    }
    
    param.left = Math.round((maxWidth - param.width) / 2);
    param.top = Math.round((maxHeight - param.height) / 2);
    return param;
}
/****************图片上传预览    IE是用了滤镜。*************************/