<?php
require_once '../../Config/WebConfig.php';
include("../../Zdweb/Common/page.class.new.php");
$dao = new Dao_ThemeModel_ThemeDao();
$getSumpages = $dao->getSumpages("scene");
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>H5页面制作工具</title>
	<link rel="stylesheet" href="../css/main.css">
	<link rel="stylesheet" href="../css/hint.min.css">

<script src="http://icon.zol-img.com.cn/js/jquery-1.9.1.min.js"></script>
<script src="../js/sea.js"></script>
<!--<script src="../js/module/module.messageBox.js"></script>-->
<script>
        seajs.config({
            base: "../js/",
            alias: {
                "jquery": "jquery/jquery/1.10.1/jquery.js"
            }
        });
        seajs.use('../js/module/module.messageBox.js',function(){
        });
</script>
<script>
	
</script>
<script src="../js/jquery/jquery-form.js"></script>

</head>
<body>
<div class="header">
	<div class="wrapper clearfix">
		<div class="login-info"><span class="iconfont">&#xe61d;</span> 管理员 <i id="myself"></i> 您好 <span href="" class="btn" id="click_logout">退出</span></div>
		<img src="../images/logo1.png" alt="">
	</div>
</div>

<div class="wrapper">
	<p class="create-add"><span class="iconfont">&#xe60d;</span> 新建项目</p>
	<div id="create-li" class="float-up clearfix" style="display: none;" select_status="0">
		<form id="create-app" action="/H5-API/AjaxTheme.php?action=addScene" method="post" enctype="multipart/form-data" novalidate="novalidate">	
			<input type="hidden" name="id" value="0">		
			<div class="upload" id="upload-icon">
			<span class="iconfont" style="position:absolute;left:110px;top:-20px;">&#xe60d;</span>
	    	<input onchange="previewImage(this)" name="attach[]"  type="file" accept=".png,.gif,.jpg" id="app-icon"/>
	      	<div id="preview">
			<img id="imghead" width="300px;" height="300px" src="<?php if(isset($OneDetailF)){ echo $OneDetailF['obj']['OneFiles']['filethumbsrc_varchar'];} ?>" alt="" />
			<span  style="position:absolute;left:70px;top:170px;">300*300上传分享图片</span>
			</div>
	    	</div>
	        <div class="controls" id="pic-group">
	    	<div class="pic"><span class="delete"></span></div>
	  	    </div>
			<div class="app-detail">
				<input type="text" id="app-title" name="scenename_varchar" placeholder="标题(专题标题，不超过20字)" required="请填写标题" maxlength="20"><div id="titleNotice"></div>
				<textarea id="app-description" rows="2" name="desc_varchar" required="请填写描述" placeholder="描述（用于在微信分享时描述该专题，不超过30字）" maxlength="30"></textarea><div id="descNotice"></div>
				<button class="btn" id="subTheme"><span class="iconfont">&#xe611;</span> 保存</button><button class="btn" id="cancleTheme"><span class="iconfont">&#xe61c;</span> 取消</button>
			    <div id="picNotice"></div>
			    <div id= "picWrongSize"  style="color:red;padding-top:10px;padding-left:10px;display:none">图片不符合300*300</div>
			</div>
			
		</form>
	</div>
	<ul class="app-lists clearfix" id="themelists">
	<input type="hidden" value="" id="isupdate"/> 
	<div id="test" name="test" style="display:none"> 
<table> 
<tr> 
<td> 
<input type="button" value="确定" onclick="ok();"/> 
</td> 
<td> 
<input type="button"  value="取消" onclick="cancle();"/> 
</td> 
</tr> 
</table> 
</div>	
		<!--<li>
			<div class="pic"><img src="http://m.fd.zol-img.com.cn/g5/M00/00/0B/ChMkJlZqo1SIWTdBAAzodQCbVVcAAGCKwN0AbwADOiN227.jpg" alt="" width="150" height="150"><span class="pic-info">未发布</span></div>
			<div class="app-detail">
				<h3 contenteditable="true">OPPO R7新品发布会</h3>
				<p contenteditable="true" class="txt">OPPO R9 Plus前后1600万像素摄像头，极致美颜4.0，自拍美得很自然，全金属机身!</p>
				<p class="sets">
					<a href=""><span class="iconfont">&#xe613;</span> 预览</a>
					<a href=""><span class="iconfont">&#xe624;</span> 编辑</a>
					<a href=""><span class="iconfont">&#xe622;</span> 详情</a>
					<a href=""><span class="iconfont">&#xe626;</span> 发布</a>
					<a href=""><span class="iconfont">&#xe61f;</span> 删除</a>
				</p>
			</div>
		</li>
		<li>
			<div class="pic"><img src="http://m.fd.zol-img.com.cn/g5/M00/00/0B/ChMkJlZqo1SIWTdBAAzodQCbVVcAAGCKwN0AbwADOiN227.jpg" alt="" width="150" height="150"><span class="pic-info">未发布</span></div>
			<div class="app-detail">
				<h3 contenteditable="true">OPPO R7新品发布会</h3>
				<p contenteditable="true" class="txt">OPPO R9 Plus前后1600万像素摄像头，极致美颜4.0，自拍美得很自然，全金属机身!</p>
				<p class="sets">
					<a href=""><span class="iconfont">&#xe613;</span> 预览</a>
					<a href=""><span class="iconfont">&#xe624;</span> 编辑</a>
					<a href=""><span class="iconfont">&#xe622;</span> 详情</a>
					<a href=""><span class="iconfont">&#xe626;</span> 发布</a>
					<a href=""><span class="iconfont">&#xe61f;</span> 删除</a>
				</p>
			</div>
		</li>
		<li>
			<div class="pic"><img src="http://m.fd.zol-img.com.cn/g5/M00/00/0B/ChMkJlZqo1SIWTdBAAzodQCbVVcAAGCKwN0AbwADOiN227.jpg" alt="" width="150" height="150"><span class="pic-info">未发布</span></div>
			<div class="app-detail">
				<h3 contenteditable="true">OPPO R7新品发布会</h3>
				<p contenteditable="true" class="txt">OPPO R9 Plus前后1600万像素摄像头，极致美颜4.0，自拍美得很自然，全金属机身!</p>
				<p class="sets">
					<a href=""><span class="iconfont">&#xe613;</span> 预览</a>
					<a href=""><span class="iconfont">&#xe624;</span> 编辑</a>
					<a href=""><span class="iconfont">&#xe622;</span> 详情</a>
					<a href=""><span class="iconfont">&#xe626;</span> 发布</a>
					<a href=""><span class="iconfont">&#xe61f;</span> 删除</a>
				</p>
			</div>
		</li>
		<li>
			<div class="pic"><img src="http://m.fd.zol-img.com.cn/g5/M00/00/0B/ChMkJlZqo1SIWTdBAAzodQCbVVcAAGCKwN0AbwADOiN227.jpg" alt="" width="150" height="150"><span class="pic-info">未发布</span></div>
			<div class="app-detail">
				<h3 contenteditable="true">OPPO R7新品发布会</h3>
				<p contenteditable="true" class="txt">OPPO R9 Plus前后1600万像素摄像头，极致美颜4.0，自拍美得很自然，全金属机身!</p>
				<p class="sets">
					<a href=""><span class="iconfont">&#xe613;</span> 预览</a>
					<a href=""><span class="iconfont">&#xe624;</span> 编辑</a>
					<a href=""><span class="iconfont">&#xe622;</span> 详情</a>
					<a href=""><span class="iconfont">&#xe626;</span> 发布</a>
					<a href=""><span class="iconfont">&#xe61f;</span> 删除</a>
				</p>
			</div>
		</li>
		<li>
			<div class="pic"><img src="http://m.fd.zol-img.com.cn/g5/M00/00/0B/ChMkJlZqo1SIWTdBAAzodQCbVVcAAGCKwN0AbwADOiN227.jpg" alt="" width="150" height="150"><span class="pic-info">未发布</span></div>
			<div class="app-detail">
				<h3 contenteditable="true">OPPO R7新品发布会</h3>
				<p contenteditable="true" class="txt">OPPO R9 Plus前后1600万像素摄像头，极致美颜4.0，自拍美得很自然，全金属机身!</p>
				<p class="sets">
					<a href=""><span class="iconfont">&#xe613;</span> 预览</a>
					<a href=""><span class="iconfont">&#xe624;</span> 编辑</a>
					<a href=""><span class="iconfont">&#xe622;</span> 详情</a>
					<a href=""><span class="iconfont">&#xe626;</span> 发布</a>
					<a href=""><span class="iconfont">&#xe61f;</span> 删除</a>
				</p>
			</div>
		</li>
		<li>
			<div class="pic"><img src="http://m.fd.zol-img.com.cn/g5/M00/00/0B/ChMkJlZqo1SIWTdBAAzodQCbVVcAAGCKwN0AbwADOiN227.jpg" alt="" width="150" height="150"><span class="pic-info">未发布</span></div>
			<div class="app-detail">
				<h3 contenteditable="true">OPPO R7新品发布会</h3>
				<p contenteditable="true" class="txt">OPPO R9 Plus前后1600万像素摄像头，极致美颜4.0，自拍美得很自然，全金属机身!</p>
				<p class="sets">
					<a href=""><span class="iconfont">&#xe613;</span> 预览</a>
					<a href=""><span class="iconfont">&#xe624;</span> 编辑</a>
					<a href=""><span class="iconfont">&#xe622;</span> 详情</a>
					<a href=""><span class="iconfont">&#xe626;</span> 发布</a>
					<a href=""><span class="iconfont">&#xe61f;</span> 删除</a>
				</p>
			</div>
		</li>-->
	</ul>

	<p class="pages">
	  <?php foreach ($getSumpages['obj']['page_content'] as $k=>$v): ?>
	            <?php $v['page'] =  iconv('GBK', 'UTF-8', $v['page']);?>
		        <?php if($v['pageUrl']=='cur'): ?>
		        <a class="now"><?php echo $v['page']; ?></a>
		        <?php elseif ($v['pageUrl']=='...'): ?>
		        <span class="dot">...</span>
		        <?php elseif ($v['page']=='上一页'): ?>
		        <a class="prev" href="<?php echo $v['pageUrl']; ?>">&lt;</a>
		        <?php elseif ($v['page']=='下一页'): ?>
		        <a href="<?php echo $v['pageUrl']; ?>">&gt;</a>
		        <?php else : ?>
		        <a href="<?php echo $v['pageUrl']; ?>">
		        <?php $page =  iconv('GBK', 'UTF-8', $v['page']);?>
		        <?php if ($page=='上一页'): ?>&lt;
		        <?php elseif ($page=='下一页'): ?>&gt;
		        <?php endif; ?>
		        <?php $page =  iconv('GBK', 'UTF-8', $v['page']); echo $page; ?></a>
		        <?php endif; ?>
	   <?php endforeach; ?>
	</p>
</div>
<script src="../js/AjaxPublic.js"></script>
</body>
</html>