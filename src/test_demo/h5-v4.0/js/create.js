define(function (require, exports, module) {
    // 用于记录撤销操作的数组。
    var undoList = []
    var $ = require('jquery'),
		messageBox = require('../js/module/module.messageBox.js'),
		Flex = require('../js/module/module.flex.js'),
		subjectId = /sceneid_bigint=(\d+)/.exec(location.href);

    subjectId && (subjectId = parseInt(subjectId[1]));

    // 编辑枚举类型。
    var editTypes = {
        add: 1,
        remove: 2,
        className: 4,
        style: 8,
        attribute: 16,
        content: 32
    }
    var nicescroll = $('.niceScroll'), slidelist = $('#slidelist'), container,
		mouseMoved = 0, mouseDown = 0,
		activeElement,
		childDocument = $('#phone-shell').contents().get(0);

    childDocument.currentPage = $(childDocument).find('.slide-container').get(0);

    // 模版相关
    !(function () {
        var allTemplatelist = $('.slides .slides-con .slide-moddles-list').get(0),
			siggleTemplatelist = $(allTemplatelist).siblings('.slide-moddles-list').get(0);

        allTemplatelist.nowPage = 0;
        siggleTemplatelist.nowPage = 0;

        getTemplates(allTemplatelist, 'getSysThemeTpl');
        getTemplates(siggleTemplatelist, 'getSysPageTpl');

        $('.slide-moddles-list').eq(1).delegate('a', 'click', function (e) {
            e.preventDefault();
            var flex = new Flex({ flex: '#viewPop' }),
				_this = this,
				pageid = $(_this).closest('li').data('pageid');

            $.ajax({
                url: '/H5-API/AjaxTheme.php?action=getOnePageDetail',
                data: { pageid_bigint: pageid },
                dataType: 'jsonp',
                success: function (data) {
                    if (data.code == 200) {
                        if ($(_this).hasClass('preview')) {
                            flex.viewpop('/H5-v4.0/html/generator.html');
                            $('#viewPop iframe').show().on('load', function () {
                                var viewDoc = $('#viewPop iframe').contents().get(0);
                                $(viewDoc).find('style').remove().end().find('link').attr('href', '/H5-v4.0/css/app.css');
                                $('#viewPop iframe').show()
                            })
                        } else if ($(_this).hasClass('apply')) {
                            if (!!$.trim($(childDocument.currentPage).html())) {
                                messageBox({
                                    text: '使用该模版会覆盖当前正在编辑的页面，是否继续？',
                                    buttonsText: {
                                        cancel: '取消',
                                        confirm: '使用'
                                    },
                                    onConfirm: function () {
                                        childDocument.currentPage.outerHTML = data.obj.content_text;
                                        $('.settings [data-todo="view"').trigger('click');
                                    }
                                });
                            } else {
                                childDocument.currentPage.outerHTML = data.obj.content_text;
                                $('.settings [data-todo="view"').trigger('click');
                            }

                        }
                    } else {
                        messageBox('对不起，加载失败，请稍后重试');
                    }

                }
            })
        });
        $('.slide-moddles-list').eq(0).delegate('.preview', 'click', function (e) {
            e.preventDefault()
            var url = $(this).attr('data-viewurl'),
				flex = new Flex({ flex: '#viewPop' }),
				_this = this;

            if (url) {
                !/http:\/\//.test(url) && (url = 'http://m.zol.com.cn' + url);
                flex.viewpop(url);
            }
        });
        $('.slide-moddles-list').eq(0).delegate('.apply', 'click', function (e) {
            e.preventDefault();
            var _this = this;
            templeteid = $(_this).closest('li').data('templeteid');

            if (!templeteid) {
                messageBox('对不起，参数错误，请重试');
            }
            applyTemplates(templeteid, function (data) {

                var isNull = false;

                $(childDocument).find('.slide-container').each(function () {
                    if (!!$.trim($(this).html())) {
                        isNull = true;
                    }
                })
                if (isNull) {
                    messageBox({
                        text: '确定要用选中的模板覆盖整个专题吗？',
                        onConfirm: function () {
                            callback(data);
                        }
                    })
                } else {
                    callback(data);
                }

            });
        });
        $('.slides .slide-moddles-list').each(function (index) {
            var actions = ['getSysThemeTpl', 'getSysPageTpl'];
            this.onscroll = function (e) {
                if (e.target.scrollHeight - ($(e.target).height() + e.target.scrollTop) < 20) {
                    getTemplates(this, actions[index]);
                }
            }
        });

        function applyTemplates(id, fn) {
            $.ajax({
                url: '/H5-API/AjaxTheme.php?action=getOneThemeDetail',
                data: { sceneid_bigint: id },
                dataType: 'jsonp',
                success: function (data) {
                    if (data.code == 200) {
                        fn && fn(data)
                    } else {
                        !fn && messageBox('对不起，加载失败，请稍后重试');
                    }
                }
            })
        }
        function callback(data) {
            var str = '';
            for (var ele in data.obj.pageDetail) {
                var temp = /\"slide-container\"/.test(data.obj.pageDetail[ele].content_text) ? data.obj.pageDetail[ele].content_text : '<td class="slide-container">' + data.obj.pageDetail[ele].content_text + '</td>';
                str += '<div class="slide">\
					<table>\
						<tbody>\
							<tr>' + temp + '</tr>\
						</tbody>\
					</table>\
				</div>';
            }

            var viewport = $(childDocument).find('.container').html(str).parent().get(0);
            exports.pageChanged && exports.pageChanged();
            setTimeout(function () {
                if (!viewport.refresh) {
                    childDocument.defaultView.$.FlipView(viewport);
                }
                viewport.refresh && viewport.refresh();
                viewport.trigger('changed');

                childDocument.currentPage = $(childDocument).find('.slide-container').get(0);

                var firstPage = $(childDocument).find('.slide').get(0);
                $(firstPage).find('[data-animate]').each(function (index, ele) {
                    exports.doAnimateList(ele);
                })

                $(firstPage).addClass('current');
                $('.slidelist li').eq(0).addClass('on').trigger('click');
                exports.syncBackground && exports.syncBackground(childDocument.currentPage);

            }, 10);
        }

        //获取当前专题的内容
        applyTemplates(subjectId, function (data) {
            if (!data.obj.pageDetail) {
                if (!$('#slidelist li').length) {
                    $('#slidelist').html('<li class="on"><div class="slide"></div><div class="prev"></div><div class="next"></div></li>')
                }
            } else {
                callback(data);
            }
            initSubjectShareData(data);

            exports.subjectName = data.obj.basicThemedetail.thumbnail_varchar;
            var script = $('<script>', {
                html: "window.WeixinShareData = {\
						icon: '" + data.obj.basicThemedetail.thumbnail_varchar + "',\
						title: '" + data.obj.basicThemedetail.scenename_varchar + "'\
					};"
            }).appendTo(childDocument.head).get(0);
            childDocument.title = data.obj.basicThemedetail.scenename_varchar;

            var base = $('<base>', {
                href: 'http://' + location.host
            }).prependTo(childDocument.head).get(0);
        });

        function initSubjectShareData(data) {
        }

        function getTemplates(list, action) {
            if (list.isLoading) return;
            list.isLoading = !0;
            $.ajax({
                url: '/H5-API/AjaxTheme.php',
                data: { page: list.nowPage + 1, action: action },
                dataType: 'jsonp',
                success: function (data) {
                    if (data.code == 200) {
                        if (data.obj.length) {
                            var str = '';
                            $(data.obj).each(function (index, ele) {
                                var img = ele.fengmian_varchar || '/H5-v4.0/images/placeholder.jpg';
                                str += '<li data-templeteid="' + ele.sceneid_bigint + '"' + (ele.pageid_bigint ? ' data-pageid="' + ele.pageid_bigint + '"' : '') + '>\
				                    <img src="' + img + '" width="135" height="200" alt="">\
				                    <p><a target="_self" class="preview" href="javasctript:;"' + (ele.themeUrl ? ' data-viewurl="' + ele.themeUrl + '"' : '') + '>预览</a> | <a class="apply" href="javasctript:;">使用</a></p>\
				                </li>'
                            });
                            if (list.nowPage == 0) {
                                $(list).html(str);
                            } else {
                                $(list).html(function (index, html) {
                                    return html + str;
                                });
                            }
                            list.nowPage += 1;
                        }
                    }
                },
                complete: function () {
                    setTimeout(function () {
                        list.isLoading = !1;
                    }, 100);
                }
            })
        }
    })();

    // 保存发布
    !(function () {
        $('.page .header [data-action]').on('click', function () {
            var _this = this,
				action = $(_this).data('action'),
				data = makeData();

            if (!data.arrPageList) {
                messageBox('还没有添加任何数据哦~');
            }

            switch (action) {
                case 'preview':
                    publish(data, action);
                    break;
                case 'publish':
                    messageBox({
                        text: '是否确定发布当前专题',
                        buttons: ['cancel', 'confirm'],
                        buttonsText: {
                            cancel: '取消',
                            confirm: '发布'
                        },
                        buttonsClassName: {
                            cancel: 'btn-red',
                            confirm: 'btn-green'
                        },
                        onConfirm: function () {
                            publish(data, action);
                        }
                    })

                    break;
                case 'save':
                    exports.saveSubject(data, function () {
                        messageBox('保存成功');
                        action != 'save' && request.themeUrl && (location.href = request.themeUrl);
                    });
                    break;
            }
        })

        $('.page .tools a:last-child').on('click', function (e) {
            e.preventDefault();
            var link = this.href;
            messageBox({
                text: '当前正在编辑，是否保存并退出',
                onShow: function () {
                    $(this.box).find('[data-role="abort"]').on('click', function () {
                        location.href = link;
                    });
                },
                buttons: ['cancel', 'abort', 'confirm'],
                buttonsText: {
                    cancel: '取消',
                    abort: '不保存',
                    confirm: '保存'
                },
                onConfirm: function () {
                    exports.saveSubject(makeData(), function () {
                        location.href = link;
                    });
                }
            })
        });

        function publish(data, action) {
            var temp = $(childDocument.documentElement).clone();
            temp.find('style').remove();
            temp.find('body').append($('<script>', {
                src: 'http://js.zol.com.cn/wappv.js'
            })).append($('<div>', {
                id: 'iptj'
            }));
            data.themAllDetail = '<!DOCTYPE html><html>' + temp.html().replace(/app-create.css/i, 'app.css') + '</html>';
            $.ajax({
                url: '/H5-API/AjaxTheme.php?action=publish&is_tpl=0',
                data: data,
                dataType: 'jsonp',
                type: 'post',
                success: function (data) {
                    if (data.code == 200) {
                        var link = data.themeUrl;
                        !/http:\/\//.test(link) && (link = 'http://h5x.zol.com.cn' + link);
                        if (action == 'publish') {
                            //messageBox({
                            //    text: '发布成功，10秒后可以预览',
                            //    onConfirm: function () {
                            //        link && (location.href = 'http://h5x.zol.com.cn/H5-v4.0/html/preview.html?sub_link=' + link);
                            //    },
                            //    onShow: function () {
                            //        var box = this.box;
                            //        $(box).find('.btn-green.btn').css({ 'pointer-events': 'none' }).addClass('disabled');
                            //        var content = $(this.box).find('.message').get(0);
                            //        content.timer = setInterval(function () {
                            //            $(content).html(function (i, h) {
                            //                var time = /[\d]+/.exec(h)[0];

                            //                if (time > 1) {
                            //                    return '发布成功，' + (/[\d]+/.exec(h)[0] - 1) + '秒后可以预览'
                            //                } else {
                            //                    clearInterval(content.timer);
                            //                    $(box).find('.btn-green.btn').css({ 'pointer-events': 'all' }).removeClass('disabled');
                            //                    return '是否跳转到预览页面';
                            //                }
                            //            })
                            //        }, 1e3);
                            //    }
                            //});
                        } else {
                            link && window.open('http://h5x.zol.com.cn/H5-v4.0/html/preview.html?sub_link=' + link);
                        }

                    } else {
                        messageBox('发布失败--!')
                    }
                }
            })
        }

        function makeData() {
            var data = {
                basicThemedetail: {
                    sceneid_bigint: subjectId
                },
                sceneid_bigint: subjectId
            };

            if (!subjectId) {
                messageBox('参数错误，请重试');
                return;
            }

            $(childDocument).find('.slide').each(function (index, page) {
                var obj = {
                    sceneid_bigint: subjectId,
                    pagecurrentnum_int: index + 1,
                    content_text: $(page).find('.slide-container').get(0).outerHTML
                }
                if (!data.arrPageList) {
                    data.arrPageList = {}
                }
                data.arrPageList[index + 1] = obj;
            });

            return data;
        }

        function saveSubject(data, fn) {
            $.ajax({
                url: '/H5-API/AjaxTheme.php?action=saveTheme&is_tpl=0',
                data: data,
                type: 'post',
                dataType: 'jsonp',
                success: function (request) {
                    if (request.code == 200) {
                        fn && fn(request);
                    } else {
                        messageBox({
                            text: '保存失败',
                            buttonsText: {
                                confirm: '重试',
                                cancel: '取消'
                            },
                            onConfirm: function () {
                                $(_this).trigger('click');
                            }
                        })
                    }
                }
            })
        }
        exports.saveSubject = saveSubject;
    })();

    /**
	* 创建新的 Slide。
	* @param object layout 新 Slide 使用的布局类型。
	*/
    function newSlide(layout) {
        container = $(childDocument).find('.container');
        if (!layout) {
            layout = {}
        }
        layout.html = '<table><tr><td class="slide-container"></td></tr></table>'

        var slideitem = $('<li></li>'),
			_html = '<div class="slide">' + layout.html + '</div>',
			slide = $(_html),
			current = $('#slidelist li.on');
        slideitem.html(_html + '<div class="prev"></div><div class="next"></div>')
        if (current.length) {
            slideitem.insertAfter(current)
            slide.insertAfter(childDocument.currentPage)
        } else {
            slidelist.append(slideitem)
            container.append(slide)
        }
        setTimeout(function () {
            if (!container.get(0).refresh) {
                childDocument.defaultView.$.FlipView($(childDocument).find('#viewport').get(0))
            }
            container.get(0).refresh();
            slideitem.trigger('click');
        }, 100)
    }

    function newPage(isClone) {
        var slide;
        if (childDocument.currentPage) {
            var nowItem = $(childDocument.currentPage).closest('.slide').get(0);
            if (isClone) {
                slide = $('<div>', {
                    class: 'slide',
                    html: '<table><tbody><tr>' + childDocument.currentPage.outerHTML + '</tr></tbody></table>'
                }).get(0);
                $(slide).insertAfter(nowItem);
            } else {
                slide = $('<div>', {
                    class: 'slide',
                    html: '<table><tbody><tr><td class="slide-container"></td></tr></tbody></table>'
                }).get(0);
                $(slide).appendTo($(nowItem).parent());
            }

        } else {
            slide = $('<div>', {
                class: 'slide',
                html: '<table><tbody><tr><td class="slide-container"></td></tr></tbody></table>'
            }).get(0);

            $(childDocument).find('.container').eq(0).append(slide);
        }


        syncPageToSide();
        setTimeout(function () {
            if (!viewport.refresh) {
                childDocument.defaultView.$.FlipView(viewport);
            }
            viewport.refresh && viewport.refresh();
            viewport.next(1000);
        }, 0)
    }

    function syncPageToSide() {
        var str = '',
			viewport = $(childDocument).find('#viewport').get(0);

        $(viewport).find('.slide').each(function (index, ele) {
            str += '<li' + ($(ele).is('.current') ? ' class="on"' : '') + '>\
				<div class="slide">' + $(ele).html() + '</div>\
				<div class="prev"></div>\
				<div class="next"></div>\
			</li>';
        });


        $('.slidelist .niceScroll').html(str);
    }

    exports.pageChanged = syncPageToSide

    $(slidelist).on('click', function (e) {
        e.stopPropagation()
        var demo = e.target, numbers = $(slidelist).children().length
        container = $('#phone-shell').contents().find('.container')
        con = container.get(0)
        lastSelectedPage = $('#slidelist > li.on')
        if (demo && demo.tagName === 'LI' && lastSelectedPage !== demo && demo.parentNode === $(slidelist).get(0)) {
            var li = demo
            lastSelectedPage && lastSelectedPage.removeClass('on')
            $(li).addClass('on')

            var bounds = li.getBoundingClientRect(), listBounds = $(slidelist).get(0).getBoundingClientRect(), offsetTop = bounds.top - listBounds.top
            // 滚动列表到合适的位置，如果选中的 Slide 没有被完全显示在屏幕中的话。
            if (bounds.bottom > document.documentElement.clientHeight) {
                $(slidelist).get(0).scrollTop = offsetTop
            } else if (bounds.top < listBounds.top) {
                $(slidelist).get(0).scrollTop = offsetTop - 10
            }

            // 找到模拟器中的 Slide。
            var index = $(slidelist).children().index(li)
            var slide = $(container).find('.slide').eq(index)
            var layout = li.getAttribute('data-layout')
            if (index != con.index)
                con.index = index
        } else if (demo && demo.className === 'prev' && demo.parentNode.parentNode === $(slidelist).get(0)) { // 向上调换	
            var li = demo.parentNode
            var currentIndex = $(slidelist).children().index(li)
            var prevIndex = currentIndex - 1
            if (currentIndex > 0) {
                $(container).children().eq(currentIndex).insertBefore($(container).children().eq(prevIndex))
                $(li).insertBefore($(slidelist).children().eq(prevIndex))
                setTimeout(function () {
                    con.refresh()
                    con.go(prevIndex)
                    setTimeout(function () {
                        selectOnly($(container).children().eq(prevIndex), 'current')
                    }, 0)
                }, 0)
            }
        } else if (demo && demo.className === 'next' && demo.parentNode.parentNode === $(slidelist).get(0)) { // 向下调换	
            var li = demo.parentNode
            var index = $(slidelist).children().index(li)
            var nextIndex = index + 1
            if (index < (numbers - 1)) {
                var slide = $(container).children().eq(index), nextSlide = $(container).children().eq(nextIndex)
                slide.insertAfter(nextSlide)
                $(li).insertAfter($(slidelist).children().eq(nextIndex))
                setTimeout(function () {
                    con.refresh()
                    con.go(nextIndex)
                    setTimeout(function () {
                        selectOnly(slide, 'current')
                    }, 0)
                }, 0)
            }
        }
    })

    /*
	*处理单页操作命令
	*撤销恢复删除复制预览新增锁定
	*/
    var sections = {
        'revoke': function (e) {
            // body...
        },
        'recover': function (e) {
            // body...
        },
        'delete': function (e) {
            container = $('#phone-shell').contents().find('.container')
            var slideItem = $('#slidelist > li.on'), index, next;
            if (!slideItem || $(slidelist).children().length < 2) {
                messageBox('至少要保留一个页面哦~');
                return;
            }
            index = $(slidelist).children().index(slideItem);
            next = slideItem.next() || slideItem.prev();
            messageBox({
                text: '确认是否删除当前正在编辑的页面？',
                onConfirm: function () {
                    slideItem.remove();
                    container.children().eq(index).remove();
                    container.get(0).refresh();
                    next.trigger('click');
                }
            })
        },
        'copy': function (e) {
            var layout = {}, slideitem;
            container = $('#phone-shell').contents().find('.container');
            slideitem = container.find('.current');
            if (!slideitem || !$(slidelist).children().length) return;
            layout.html = slideitem.html();
            newPage(true);
        },
        'view': function (e) {

            var items = $(childDocument.currentPage).find('[data-animate]').each(function (index, ele) {
                exports.doAnimateList && exports.doAnimateList(ele);
            });
        },
        'lock': function (e) {
            // body...
        },
        'add': function (e) {
            newPage(false);
            // newSlide({})
        }
    }

    $('.settings a:nth-child(1)').click(function () {
        $('#editorTitle').trigger('click');
    });

    // 自适应尺寸，匹配高度，加入滚动条
    function onResize() {
        var _h = $('.slides-con').height()
        $('.slidelist').css('height', _h - 40)
        $('#slidelist').css('height', _h - 90)
        seajs.use('../js/jquery.nicescroll.min.js', function () {
            nicescroll.each(function () {
                this.nicescroll = $(this).niceScroll();
            })
        });
    }
    $(window).resize(onResize)

    // 页面载入完成后进行初始化处理。
    function Reload() {
        // 登录验证
        $.ajax({
            url: '/H5-API/AjaxUser.php?action=checklLogin',
            dataType: 'jsonp',
            success: function (data) {
                if (data.code != 200) {
                    messageBox({
                        text: '还没有登录系统，请登录',
                        onConfirm: function () {
                            location.href = 'http://admin.zol.com.cn/login.php?url=' + location.href;
                        }, onCancel: function () {
                            location.href = 'http://admin.zol.com.cn/login.php?url=/H5-v4.0/html/list.php';
                        }
                    })
                }
            }
        });

        // 关闭加载动画。
        // f.loading.dismiss();				
        slidelist = $('#slidelist').get(0);
        onResize();
        seajs.use('../js/jquery.nicescroll.min.js', function () {
            nicescroll.niceScroll();
        })
        // 为手机模拟器添加事件以支持点击编辑和切换同步
        container = $('#phone-shell').contents().find('.container').get(0)

        // 切换同步。
        $(container).parent().on('changed', function (e) {
            var _i = $(container).get(0).index
            $(slidelist).children().eq(_i).trigger('click');
        })

        // 向模拟器中填充内容数据。
        $(container).children().each(function (index, slide) {
            var _ison = (index == 0) ? 'class="on"' : '';
            var slideitem = $('<li ' + _ison + '>\
				 <div class="slide">' + slide.innerHTML + '</div>\
				<div class="prev"></div>\
				<div class="next"></div>\
			</li>');
            //$(slidelist).append(slideitem);
        })

        var startX, startY
        // 先处理滑动事件，以避免和点击和滑动切换 Slide 冲突。
        $(container).on('mousedown', function (e) {
            mouseMoved = 0
            if (!e) return
            startX = e.pageX
            startY = e.pageY
            mouseDown = 1
        })
        $(container).on('mousemove', function (e) {
            if (!e) return
            if (mouseDown && !mouseMoved) {
                if (startX !== e.pageX || startY !== e.pageY) {
                    mouseMoved = 1
                }
            }
        })
        $(container).on('mouseup', function (e) {
            mouseDown = 0;
            startX = 0;
            startX = 0;
            setTimeout(function () {
                mouseMoved = 0;
            }, 0);
        })

        // 更新可编辑元素状态。		
        // if (!$(slidelist).children().length) { // 如果没有 Slide，则默认添加一个。
        // 	newPage();
        // } else { // 否则，刷新 FlipView 以支持滑动切换 Slide。			
        // 	setTimeout(function () {
        // 		$(container).get(0).refresh && container.get(0).refresh();
        // 	}, 100);
        // 	$($(slidelist).children().eq(0)).trigger('click');
        // }
        var containerLength = $(container).children().length;
        if (containerLength == 1) $(container).children().get(0).classList.add('current');
        // 点击切换
        $('.JS_tab li').on('click', function (e) {
            var self = $(this), _i = self.index(), tabCon = self.parent('.JS_tab').siblings('.JS_con')
            if (self.hasClass('on')) return;
            self.siblings().removeClass('on');
            self.addClass('on');
            if (!tabCon) return;
            tabCon.children().removeClass('on');
            tabCon.children().eq(_i).addClass('on');
        })

        // 单页操作绑定
        $('[data-todo]').on('click', function (e) {
            e.preventDefault()
            var todo = $(this).attr('data-todo')
            todo && $.isFunction(sections[todo]) && sections[todo].call($(this), e);
        })

        // 显示组件菜单
        var menuCom = $('#JS_components')
        menuCom.t = 0; menuCom.menu = menuCom.children('div')

        menuCom.on('mouseover', function (e) {
            menuCom.addClass('on')
            menuCom.t && clearTimeout(menuCom.t)
        })
        menuCom.on('mouseout', function (e) {
            menuCom.t = setTimeout(function () {
                menuCom.removeClass('on')
            }, 500)
        })
        menuCom.menu.on('mouseover', function (e) {
            menuCom.addClass('on')
            menuCom.t && clearTimeout(menuCom.t)
        })
        menuCom.menu.on('mouseout', function (e) {
            menuCom.removeClass('on')
        })
    }

    $(window).load(Reload);


    /**
	* 为元素添加指定的选择 class，并清除同级兄弟元素的这个 class（如果有的话）。
	* @param HTMLElement 要添加 class 的元素。
	* @param string className 要添加的 class。
	*/
    function selectOnly(current, className) {
        className = className || 'on'
        if ($(current) && !$(current).hasClass(className)) {
            $(current).parent().children().removeClass(className)
            $(current).addClass(className)
        }
    }

    // 素材相关
    !(function () {
        var pageSize = 18,
			pager = require('../js/module/module.pager.js'),
			tab = require('../js/module/module.tabs.js'),
			toDom = '',
			filesTab = tab({
			    tabsCell: '#flexbg .tablist li',
			    initIndex: -1,
			    onshow: function (a) {
			        toDom = a;
			        var domEle = $(toDom).get(0),
						btype = $(domEle).data('btype'),
						action = $(domEle).data('action')

			        if ($(domEle).find('.cons').html()) {
			            return
			        }
			        action && getFiles({ action: action })
			        btype && getCatis(domEle, btype, function () {
			            getFiles({ btype: btype })
			        })
			    }
			}),
			flex = new Flex({
			    onshow: function (toDom) {
			        $('#flexbg .tablist li[data-for="#' + toDom + '"]').trigger('click');
			    },
			    onHide: function () {
			        $('#flexbg .cons li.on').removeClass('on');
			        exports.pageChanged && exports.pageChanged();
			    }
			})

        // 顶部菜单
        $('[edit-btn]').on('click', function (e) {
            toDom = $(this).attr('edit-btn')
            flex.show(toDom)
            $('#flexbg .tablist [data-for="' + toDom + '"]').trigger('click');
        })

        // 添加文本
        $('.header .btns li:first').click(function () {
            var pageIndex = $('#slidelist .on').index(),
				nowWebPage = $('#phone-shell').contents().find('#viewport .slide-container').get(pageIndex);
            var p = $('<p>', {
                html: '请输入内容',
                style: 'font-size:48px'
            }).appendTo(nowWebPage).trigger('click').get(0);
        });

        // 添加链接
        $('#interactions').delegate('[data-control="link"]', 'click', function () {
            var pageIndex = $('#slidelist .on').index(),
				nowWebPage = $('#phone-shell').contents().find('#viewport .slide-container').get(pageIndex);
            var a = $('<a>', {
                href: 'javascript:;',
                html: '<p>请输入内容</p>',
                class: 'block-link edit-box-container'
            }).appendTo(nowWebPage).get(0);
            $(a).find('p').trigger('click');
            flex.hide();
        })

        $('#interactions').delegate('span[data-control]', 'click', function () {
            var pageIndex = $('#slidelist .on').index(),
				nowWebPage = $('#phone-shell').contents().find('#viewport .slide-container').get(pageIndex),
				_this = this,
				control = $(_this).attr('data-control');

            if (control == 'link') return;
            var a = $('<a>', {
                html: '<p class="' + $(_this).attr('class') + '" data-control="' + $(_this).data('control') + '">' + $(_this).html() + '</p>',
                class: 'edit-box-container'
            }).appendTo(nowWebPage).get(0);
            $(a).find('p').trigger('click');
            flex.hide();
        });

        $('#interactions').delegate('img[data-control]', 'click', function () {
            var pageIndex = $('#slidelist .on').index(),
				nowWebPage = $('#phone-shell').contents().find('#viewport .slide-container').get(pageIndex),
				_this = this;

            var p = $('<p>', {
                html: '<a href="javascript:;" class="weibo"></a>\
					<a href="javascript:;" class="qqzone"></a>\
					<a href="javascript:;" class="wechat"></a>',
                class: $(_this).data('control') + ' share'
            }).appendTo(nowWebPage).get(0);

            $(p).trigger('click');
            flex.hide();
        });

        // 选择标签分类
        $('#flexbg').delegate('.tab.tags li', 'click', function () {
            var container = $(this).parent().parent().get(0),
				btype = $(container).data('btype'),
				tag = $(this).data('id')
            $(this).addClass('on').siblings('.on').removeClass('on')
            getFiles({
                btype: btype,
                tag: tag,
                page: 1,
                isSetPager: true
            })
        })

        //翻页
        $('#flexbg').delegate('.pages a', 'click', function (e) {
            var ev = e || window.event,
				container = $(this).closest('.elements-footer').parent().get(0),
				action = $(container).data('action'),
				btype = $(container).data('btype'),
				tag = $(container).find('.tab.tags .on').data('id'),
				page;

            ev.preventDefault();

            setTimeout(function () {
                page = container.pager.nowPage;
                getFiles({
                    action: action,
                    btype: btype,
                    tag: tag,
                    page: page,
                    toDom: container
                });
            }, 0);
        })

        // 选择控制
        $('#flexbg').delegate('.cons li', 'click', function (e) {
            if ($(this).is('.uploadfile')) return;
            $(this).toggleClass('on');
            !exports.imgToChange && !e.ctrlKey && $(this).siblings().removeClass('on');
        })

        $('#flexbg').delegate('.cons li', 'dblclick', function (e) {
            var ev = e || window.event,
				pageIndex = $('#slidelist .on').index(),
				nowWebPage = $('#phone-shell').contents().find('#viewport .slide-container').get(pageIndex),
				_this = this,
				img = $(_this).find('img').get(0);

            ev.preventDefault()
            ev.cancelBubble ? ev.cancelBubble() : ev.stopPropagation()

            if (exports.imgToChange) {
                var width = img.naturalWidth,
					height = img.naturalHeight;

                $(exports.imgToChange).attr('src', $(img).attr('src')).css({
                    width: width,
                    height: height
                }).trigger('click').parent().css({
                    width: width,
                    height: height
                });
                $('#image-resize-hanlders').css({
                    width: $(exports.imgToChange).css('width') / 2,
                    height: $(exports.imgToChange).css('height') / 2
                })
                var slider = $(exports.imgToChange).closest('.lit-slide').get(0),
					changed = slider && slider.changed;
                changed && changed();
            } else {
                $('<img>', {
                    src: $(_this).find('img').attr('src')
                }).appendTo(nowWebPage).trigger('click');
            }

            flex.hide();
            exports.imgToChange = null;
        })

        // 使用图片 || 应用背景
        $('#flexbg').delegate('.btn', 'click', function (e) {
            if ($(this).is('disabled')) return

            var ev = e || window.event,
				pageIndex = $('#slidelist .on').index(),
				nowWebPage = $('#phone-shell').contents().find('#viewport .slide-container').get(pageIndex),
				images = $(this).closest('.elements-footer').siblings('.cons').find('.on img')
            ev.preventDefault()
            ev.cancelBubble ? ev.cancelBubble() : ev.stopPropagation()

            if ($(this).is('.btn-green')) {
                $(nowWebPage).css({
                    'background-image': 'url(' + images.attr('src') + ')'
                })
                exports.syncBackground(nowWebPage)
            } else {
                if (exports.imgToChange) {
                    $(images.get(0)).closest('li').trigger('dblclick');
                } else {
                    images.each(function (index, img) {
                        $('<img>', {
                            src: img.src
                        }).appendTo(nowWebPage).trigger('click')
                    })
                }
            }
            flex.hide()
        })

        //创建组图
        $('.pic-slide').click(function () {
            var messager = messageBox({
                text: '请设置数量：<input type="number" step="1" value="2" min="2" max="20" name="num" />',
                onShow: function () {
                    var _this = this,
						input = $(_this.box).find('input').get(0),
						subBtn = $(_this.box).find('.btn-green').get(0);

                    $(input).on('keyup change', function () {
                        var value = parseInt($(this).val());

                        if (value < 2 || value > 20) {
                            $(subBtn).addClass('disabled');
                        } else {
                            $(subBtn).removeClass('disabled');
                        }
                    })
                },
                onConfirm: function () {
                    var _this = this,
						num = parseInt($(_this.box).find('input').val()),
						str = '',
						slider = $('<div>', {
						    class: 'flipview lit-slide',
						    html: '<ul class="lit-slide-container container"></ul>'
						}).appendTo(childDocument.currentPage).get(0);



                    for (var i = num; i > 0; i--) {
                        str += '<li class="edit-box-container"><img class="list-img" src="http://h5x.zol.com.cn/H5-v4.0/images/add.png" alt="" /></li>';
                    }
                    $(slider).find('.lit-slide-container').html(str);

                    slider.changed = function () {
                        exports.picSlide(slider);
                    }

                    exports.pageChanged && exports.pageChanged();
                }
            })
        });

        function getCatis(domEle, bigType, fn) {
            if (domEle.Allcatis) {
                fn && fn(domEle.Allcatis)
                return
            }
            $.ajax({
                url: '/H5-API/AjaxCates.php?action=getCates',
                data: { bigType: bigType },
                dataType: 'jsonp',
                success: function (request) {
                    if (request.code == 200) {
                        $(domEle).find('.tab.tags').html('<li class="on"><a href="javascript:;">全部</a></li>')
                        domEle.Allcatis = request.obj
                        $(request.obj).each(function (index, ele) {
                            $(domEle).find('.tab.tags').html(function (i, html) {
                                html += '<li data-id="' + ele.id + '"><a href="javascript:;">' + ele.title + '</a></li>'
                                return html
                            })
                        })
                        fn && fn(request.obj)
                    } else {
                        messageBox({
                            text: request.msg
                        })
                    }
                },
                error: function (request) {
                    messageBox('网络开小差啦，请稍后重试~')
                }
            })
        }

        function getFiles(opts) {
            var btype = opts.btype,
				tag = opts.tag,
				page = opts.page,
				action = opts.action,
				domEle = $(/#/.test(toDom) ? toDom : ('#' + toDom)).get(0) || $(opts.toDom).get(0);

            var data = { bigType: btype, page: page, biztype_int: tag, action: action || 'getFiles' };

            if (action) {
                domEle && (domEle.pageSize = 17);
                data.sceneid_bigint = subjectId;
            } else {
                domEle && (domEle.pageSize = 18);
            }

            $.ajax({
                url: '/H5-API/AjaxFiles.php',
                data: data,
                dataType: 'jsonp',
                success: function (request) {
                    if (request.code == 200) {
                        var cons = $(domEle).find('.cons').html('').get(0)
                        if (action) {
                            $(domEle).find('.cons').html('<li class="uploadfile"></li>')
                        }
                        if (!request.obj.length == 0) {
                            $(request.obj).each(function (index, e) {
                                $(cons).html(function (i, h) {
                                    return h += '<li><img src="' + e.filesrc_varchar + '"/></li>'
                                })
                            })
                        } else {
                            !action && $(cons).html(function (i, h) {
                                return '<li class="empty">这里空空如也~</li>'
                            })
                        }
                        if (opts.isSetPager || !$(domEle).find('.pages').length) {
                            $(domEle).find('.pages').remove();

                            var totalPage = Math.ceil(request.count / domEle.pageSize);
                            domEle.pager = pager({
                                container: $(domEle).find('.elements-footer').get(0),
                                activeCell: 'now',
                                allPage: totalPage,
                                insertMethod: 'appendTo'
                            })
                        }
                    } else {
                        messageBox({
                            text: request.msg
                        })
                    }
                }, error: function () {
                    messageBox('网络开小差啦，请稍后重试~')
                }
            })
        }

        $('#elementMy').delegate('.cons .uploadfile', 'click', function () {
            var input = $('#uploader').contents().find('form [name="sceneid_bigint"]').get(0);
            if (!input) {
                input = $('<input>', {
                    type: 'hidden',
                    value: subjectId,
                    name: 'sceneid_bigint'
                }).appendTo($('#uploader').contents().find('form'));
            }
            $('#uploader').contents().find('form')
            $('#uploader').contents().find('form input[type="file"]').trigger('click');
        })

        window.uploadSuccess = function () {
            getFiles({ action: 'myFiles', isSetPager: true });
            $('#uploader').attr('src', 'uploader.html');
        }

        // $('#elementMy').find('form input[type="file"]').on('change',function(e){
        // 	var reader = new FileReader(),
        // 		ev = e || window.event;
        // 		target = ev.target,
        // 		file = target.files[0];


        // 	reader.readAsDataURL(file);  
        // 	reader.onload = function(file){
        // 		if(file.currentTarget.result.length >= 3145728){
        // 			messageBox('图片不能大于3M');
        // 			return;
        // 		}
        // 	}
        // 	$(this).closest('form').trigger('submit');
        // })
        // $('#elementMy').find('form').on('submit',function(e){
        // 	var data = new FormData(this),
        // 		ev = e || window.event;
        // 	ev.preventDefault();
        // 	$.ajax({
        // 		url: '/H5-API/AjaxFiles.php?action=uploadMyFiles&bigType=bgType',
        // 		data: data,
        // 		dataType: 'jsonp',
        // 		type:'post',
        // 		success: function (request) {
        // 		}
        // 	})
        // })
    })()

    // 键盘事件/右键菜单绑定
    !(function () {

        var copyNode = null,
			container = null,
			copyAnimate = ''

        // 键盘事件
        $(window).on('keyup', edit)
        $(childDocument).on('keyup', edit)

        // 鼠标右键菜单
        $(window).on('contextmenu', function (e) {
            var ev = e || window.event
            ev.preventDefault()
            ev.cancelBubble ? ev.cancelBubble() : ev.stopPropagation()
            if (ev.target.id == 'image-resize-hanlders') {
                var type = 'element';
                if ($(activeElement).closest('.lit-slide').length) {
                    type = 'list-img';
                }
                edit.bind(null, ev)(type)
            }
        })
        $(childDocument).on('contextmenu', function (e) {
            var ev = e || window.event,
				_this = ev.target;
            ev.preventDefault();
            ev.cancelBubble ? ev.cancelBubble() : ev.stopPropagation();
            if ($(_this).is('.list-img')) {
                $(_this).trigger('click');
                edit.bind(null, ev)('list-img')
            } else if (/^(p|(img))$/i.test(_this.tagName)) {
                $(_this).trigger('click');
                edit.bind(null, ev)('element')
            } else if (/^td$/i.test(_this.tagName)) {
                container = _this
                edit.bind(null, ev)('background')
            } else if ($(_this).is('.lit-slide ul')) {
                $(_this).closest('.lit-slide').trigger('click');
                edit.bind(null, ev)('element')
            }
        })

        function edit(e, type) {
            var ev = e || window.event
            ev.preventDefault()
            switch (ev.type) {
                case 'contextmenu':
                    contextmenu.bind(this, ev)(type)
                    break
                case 'keyup':
                    if (activeElement) {
                        switch (ev.keyCode) {
                            case 27:
                                // edit.close()
                                edit.zIndexUp()
                                break;
                            case 67:
                                if (ev.ctrlKey) {
                                    edit.copy()
                                }
                                break;
                            case 86:
                                if (ev.ctrlKey) {
                                    edit.paste()
                                }
                                break;
                            case 46:
                                if ($(activeElement).prop('contenteditable') != 'true') {
                                    edit.remove();
                                }
                                break;
                            case 38:
                                if (ev.ctrlKey) {
                                    ev.shiftKey ? edit.zIndexTop() : edit.zIndexUp()
                                }
                                break;
                            case 40:
                                if (ev.ctrlKey) {
                                    ev.shiftKey ? edit.zIndexEnd() : edit.zIndexDown()
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    if (edit.isPreventDefault) {
                        ev.cancelBubble ? ev.cancelBubble() : ev.stopPropagation()
                    }
                    break;
                default:
                    break;
            }
        }

        edit.remove = function () {
            $(activeElement).parent().remove()
            edit.close()
        }
        edit.copy = function () {
            if ($(activeElement).prop('contenteditable')) {
                return;
            }
            copyNode = $(activeElement).clone().get(0);
            container = $(activeElement).parent().parent().get(0);
            edit.isPreventDefault = 1;
        }
        edit.paste = function () {
            if ($(activeElement).prop('contenteditable')) {
                return;
            }
            $(container).append(copyNode);
            $(copyNode).css({
                top: function (i, top) {
                    return parseInt(top) + 50
                }
            }).trigger('click');
            copyNode = $(copyNode).clone().get(0);
            edit.isPreventDefault = 1;
        }
        edit.close = function () {
            $.fn.editBox.hide()
        }
        edit.zIndexUp = function () {
            var nextSibling,
				box = $(activeElement).parent().is('.edit-box-container') ? $(activeElement).parent().get(0) : activeElement

            nextSibling = $(box).next().get(0)
            $(box).insertAfter($(nextSibling))
        }
        edit.zIndexDown = function () {
            var prevSibling,
				box = $(activeElement).parent().is('.edit-box-container') ? $(activeElement).parent().get(0) : activeElement

            prevSibling = $(box).prev().get(0)

            $(box).insertBefore($(prevSibling))
        }
        edit.zIndexEnd = function () {
            var firstSibling,
				box = $(activeElement).parent().is('.edit-box-container') ? $(activeElement).parent().get(0) : activeElement

            firstSibling = $(box).parent().children().eq(0).get(0)
            $(box).insertBefore($(firstSibling))
        }
        edit.zIndexTop = function () {
            var lastSibling,
				box = $(activeElement).parent().is('.edit-box-container') ? $(activeElement).parent().get(0) : activeElement

            lastSibling = $(box).parent().children(':last').get(0)
            $(box).insertAfter($(lastSibling))
        }

        function contextmenu(ev, type) {
            if (!contextmenu.menu) {
                contextmenu.menu = $('<div>', {
                    id: 'contextmenu'
                }).appendTo('body').fadeIn().get(0)
            } else {
                $(contextmenu.menu).fadeIn()
            }

            $(window).one('click', function () {
                $(contextmenu.menu).fadeOut()
            })
            $(childDocument).one('click', function () {
                $(contextmenu.menu).fadeOut()
            })

            switch (type) {
                case 'background':
                    $(contextmenu.menu).html(function () {
                        return '<span data-todo="paste" class="menu-item' + (!copyNode ? ' disabled' : '') + '">\u7c98\u8d34</span>'
                    })
                    break;
                case 'element':
                    $(contextmenu.menu).html(function () {
                        return '<div class="menu-item' + (!$(activeElement).is('p') && !$(activeElement).is('.lit-slide') ? ' disabled' : '') + '" data-todo="edit">\u7f16\u8f91</div>\
                        <div class="menu-item" data-todo="animate">\u52a8\u753b</div>\
                        <div class="menu-item" data-todo="copy">\u590d\u5236</div>\
                        <div class="menu-item' + (!copyNode ? ' disabled' : '') + '" data-todo="paste">\u7c98\u8d34</div>\
                        <div class="menu-item' + (!$(activeElement).data('animate') ? ' disabled' : '') + '" data-todo="copy_animate">\u590d\u5236\u52a8\u753b</div>\
                        <div class="menu-item' + (!copyAnimate ? ' disabled' : '') + '" data-todo="apply_animate">\u5e94\u7528\u52a8\u753b</div>\
                        <div class="menu-item">\u987a\u5e8f\
                            <div class="child-menu">\
                                <div class="menu-item" data-todo="move_top">\u7f6e\u4e8e\u9876\u5c42</div>\
                                <div class="menu-item" data-todo="move_end">\u7f6e\u4e8e\u5e95\u5c42</div>\
                                <div class="menu-item" data-todo="move_up">\u4e0a\u79fb\u4e00\u5c42</div>\
                                <div class="menu-item" data-todo="move_down">\u4e0b\u79fb\u4e00\u5c42</div>\
                            </div>\
                        </div>\
                        <div class="menu-item" data-todo="delete">\u5220\u9664</div>'
                    })
                    break
                case 'list-img':
                    $(contextmenu.menu).html(function () {
                        return '<div class="menu-item" data-todo="edit">\u7f16\u8f91</div>';
                    })
                    break;
                default:
                    break
            }
            $(contextmenu.menu).find('.menu-item[data-todo]').on('click', function (e) {
                var ev = e || window.event,
					todo = $(this).data('todo')

                if ($(this).hasClass('disable')) {
                    return
                }
                ev.preventDefault();
                ev.cancelBubble ? ev.cancelBubble() : ev.stopPropagation();
                switch (todo) {
                    case 'edit':
                        if ($(activeElement).is('p')) {
                            editText();
                        } else if ($(activeElement).is('img')) {
                            var flex = new Flex({
                                onshow: function (toDom) {
                                    $('#flexbg .tablist li[data-for="#elementMy"]').trigger('click')
                                },
                                onHide: function () {
                                    $('#flexbg .cons li.on').removeClass('on');
                                    exports.pageChanged && exports.pageChanged();
                                }
                            });
                            exports.imgToChange = activeElement;
                            flex.show('elementMy');
                        } else if ($(activeElement).is('.lit-slide')) {
                            exports.picSlide(activeElement);
                        }

                        break;
                    case 'copy':
                        edit.copy();
                        break;
                    case 'paste':
                        edit.paste();
                        break;
                    case 'move_top':
                        edit.zIndexTop();
                        break;
                    case 'move_end':
                        edit.zIndexEnd();
                        break;
                    case 'move_up':
                        edit.zIndexUp();
                        break;
                    case 'move_down':
                        edit.zIndexDown();
                        break;
                    case 'animate':
                        $('#isAnimationBtn').trigger('click');
                        break;
                    case 'delete':
                        edit.remove();
                        break;
                    case 'copy_animate':
                        copyAnimate = $(activeElement).data('animate');
                        break;
                    case 'apply_animate':
                        $(activeElement).attr('animate', copyAnimate);
                        $(activeElement).data('animate', copyAnimate);
                        exports.setAnimate();
                        exports.doAnimateList(activeElement);
                        break;
                    default:
                        break;
                }

                $(contextmenu.menu).fadeOut()
                exports.pageChanged && exports.pageChanged();
            })

            var x = ev.pageX,
				y = ev.pageY
            if (ev.view.parent != ev.view) {
                x += $('#phone-shell').offset().left
                y += $('#phone-shell').offset().top
            }
            if (y + 310 >= $(window).height()) {
                $(contextmenu.menu).css({
                    left: x,
                    top: y - 250
                })

            } else {
                $(contextmenu.menu).css({
                    left: x,
                    top: y
                })
            }

        }

        function editText() {
            $(activeElement).prop('contenteditable', true);
            $('#image-resize-hanlders').css('pointer-events', 'none');
            activeElement.focus();
            $(activeElement).one('blur', function () {
                $('#image-resize-hanlders').css('pointer-events', 'all');
                $(activeElement).prop('contenteditable', false);
            });
            $('#textEditor').trigger('click');

            if ($(activeElement).html() == '请输入内容') {
                $(activeElement).css({
                    height: $(activeElement).css('height'),
                    width: $(activeElement).css('width')
                })
                $(activeElement).html('');
                $(activeElement).attr('placeholder', '请输入内容');
            }
        }


        //双击编辑
        $('body').delegate('#image-resize-hanlders', 'dblclick', function () {
            editText();
        })
    })()

    //组图编辑
    !(function () {
        slide.container = $('.slide-settings').get(0)

        function slide(obj) {
            if (!slide.container) { return; }
            slide.forUl = obj;
            if (!slide.box) {
                slide.box = $('<div>', {
                    class: 'pic-slide-settings',
                    html: '<ul class="tablist">\
							<li class="on">组图</li>\
						</ul>\
						<div class="slide-settings-container">\
							<div class="on" id="pic-slide-container"></div>\
						</div>\
						<div class="slide-add" data-todo="add">+</div>'
                }).appendTo(slide.container).css({
                    'display': 'none',
                    'position': 'absolute',
                    'height': '100%',
                    'width': '100%',
                    'top': 0,
                    'left': 0
                }).get(0);
                var flex = new Flex({
                    onHide: function () {
                        $('#flexbg .cons li.on').removeClass('on');
                        exports.pageChanged && exports.pageChanged();
                    }
                });
                $(slide.box).delegate('.items-container', 'click', function () {
                    var index = $(this).closest('.items').index();
                    exports.imgToChange = $(slide.forUl).find('li').eq(index).find('img').get(0);
                    $.fn.editBox.hide();
                    flex.show('materials');
                    $('#flexbg [data-for="#materials"]').trigger('click');
                });
                $(slide.box).delegate('.slide-add', 'click', function () {
                    var li = $('<li>', {
                        class: 'edit-box-container',
                        html: '<img class="list-img" src="http://h5x.zol.com.cn/H5-v4.0/images/add.png" alt="">'
                    }).appendTo($(slide.forUl).find('ul')).get(0);
                    slide.forUl.changed();
                })
                $(slide.box).delegate('.forward,.backoff,.delete', 'click', function () {
                    var _this = this,
						index = $(_this).closest('.items').index(),
						li = $(slide.forUl).find('li').eq(index).get(0),
						prev = $(slide.forUl).find('li').eq(index - 1).get(0),
						next = $(slide.forUl).find('li').eq(index + 1).get(0);

                    if ($(_this).is('.forward')) {
                        if (prev) {
                            $(li).insertBefore(prev);
                        } else {
                            $(li).prependTo($(slide.forUl).find('ul'))
                        }
                    } else if ($(_this).is('.backoff')) {
                        if (next) {
                            $(li).insertAfter(next);
                        } else {
                            $(li).appendTo($(slide.forUl).find('ul'));
                        }
                    } else if ($(_this).is('.delete')) {
                        $(li).remove();
                    }
                    slide.forUl.changed();
                });
            }
            seajs.use('../js/jquery.nicescroll.min.js', function () {
                $(slide.box).find('.slide-settings-container').niceScroll()
            });
            slide.show(obj);
        }
        slide.show = function (obj) {
            var str = '';
            $(obj).find('li').each(function (index, ele) {
                str += '<div class="items"><div class="items-container"><img src="' + $(ele).find('img').attr('src') + '" alt=""></div><a href="javascript:;" class="forward"></a><a href="javascript:;" class="backoff"></a><a href="javascript:;" class="delete iconfont">&#xe61f;</a></div>';
            })
            $(slide.box).show().find('#pic-slide-container').html(str);
        }
        slide.add = function () {

        }
        slide.hide = function () {
            $(slide.box).hide()
        }

        exports.picSlide = slide;
    })();

    // 样式编辑
    !(function () {

        seajs.use('../js/module/module.editBox.js', function () {
            $(childDocument).find('#viewport').delegate('.lit-slide,p,img,.block-link', 'click', function (e) {
                var ev = e || window.event;
                ev.preventDefault();
                ev.cancelBubble ? ev.cancelBubble() : ev.stopPropagation();

                var _this = this;

                if ($(_this).prop('contenteditable') == 'true') { return }

                $(_this).editBox({
                    onshow: function (ev) {
                        activeElement = _this;
                        styleSync_toForm('text');
                        exports.setAnimate && exports.setAnimate();
                        if ($(_this).parent().is('a')) {
                            $('[name="url"').prop('disabled', false);
                        } else {
                            $('[name="url"').prop('disabled', true);
                        }

                        if ($(_this).is('p')) {
                            $('#slide-text dl:first-child input').prop('disabled', false);
                        } else {
                            $('#slide-text dl:first-child input').prop('disabled', true);
                        }

                        if ($(_this).is('.lit-slide')) {
                            exports.picSlide(_this);
                        }
                        $('#textEditor').show().trigger('click');
                        $('#isAnimationBtn').show();
                        $('#editorTitle').hide();
                    },
                    onchange: function () {
                        styleSync_toForm('text');
                        exports.pageChanged && exports.pageChanged();
                        !(function () {
                            if (!$(activeElement).is('img')) return;
                            var left = $(activeElement).parent().offset().left,
								top = $(activeElement).parent().offset().top,
								right = left + $(activeElement).parent().width() / 2,
								bottom = top + $(activeElement).parent().height() / 2,
								windowWidth = $(childDocument.defaultView).width(),
								windowHeight = $(childDocument.defaultView).height(),
								warning = $('.content .warning').get(0);

                            if (left < 0 || top < 0 || right > windowWidth || bottom > windowHeight) {
                                if (warning.timer) {
                                    clearTimeout(warning.timer);
                                }
                                $(warning).fadeIn();
                                warning.timer = setTimeout(function () {
                                    $('.content .warning').fadeOut();
                                }, 3e3);
                            }
                        })();
                    },
                    onhide: function () {
                        $(activeElement).css({
                            '-webkit-animation': 'none',
                            'animation': 'none'
                        });

                        if (!$(activeElement).html()) {
                            var placeholder = $(activeElement).attr('placeholder');
                            placeholder && $(activeElement).html(placeholder);
                        }
                        activeElement = null;
                        $('#slide-animate .niceScroll').empty();
                        exports.picSlide.hide();
                        $('#textEditor').hide();
                        $('#isAnimationBtn').hide();
                        $('#editorTitle').show().trigger('click');
                    }
                })

            })
        })

        !(function () {
            // 文本
            $('#slide-text dl').eq(0).find('input').on('change', function () {
                styleSync_toElement('text');
            })

            // 边框+填充
            $('#slide-text dl').eq(1).find('input,select').on('change', function () {
                styleSync_toElement('border')
            })
            $('#slide-text dl').eq(1).find('[name="background-alpha"]').on('change', function () {
                styleSync_toElement('background')
            })

            // 位置
            $('#slide-text dl').eq(2).find('input').on('change', function () {
                styleSync_toElement('size')
            })

            // 页面背景
            var viewport = childDocument.getElementById('viewport');

            viewport.addEventListener('changed', function (e) {
                childDocument.currentPage = $(e.current).find('.slide-container').get(0);
                if ($(childDocument.currentPage).find('[data-animate]').length) {
                    $('.settings [data-todo="view"]').addClass('true');
                } else {
                    $('.settings [data-todo="view"]').removeClass('true');
                }
                pageStyleSync_toForm(childDocument.currentPage);
            })
            window.viewport = viewport;

            var slideBackground = $('#slide-background').get(0)
            $(slideBackground).find('input').on('change', function () {
                pageStyleSync_toPage(childDocument.currentPage)
            })

            seajs.use('../js/module/module.colorPicker.js', function () {
                $('.slide-settings').delegate('.color-box', 'click', function () {
                    var _this = this;
                    $(this).colorPicker({
                        onSelect: function (color) {
                            if (color == 'transparent') {
                                $(_this).addClass('color-none')
                            } else {
                                $(_this).removeClass('color-none')
                            }
                        }
                    })
                })
                $('#font-color').click(function () {
                    $(this).find('.color-box').colorPicker();
                });
            })
        })()
        $('[type="range"]').each(function (index, range) {
            $(range).on('change', function () {
                $(range).siblings('output').val($(range).val())
            })
        })

        $('#slide-background .setting-bg').on('click', function () {
            var flex = new Flex({
                onHide: function () {
                    $('#flexbg .cons li.on').removeClass('on');
                    exports.pageChanged && exports.pageChanged();
                }
            });
            flex.show('elementMy');
            $('[data-for="#elementMy"]').trigger('click');
        });

        function toRGBA(color, alp) {
            var rgba = color
            if (/#[0-9a-f]{6}/ig.test(color)) {
                var r = parseInt('0x' + color.substr(1, 2)),
					g = parseInt('0x' + color.substr(3, 2)),
					b = parseInt('0x' + color.substr(5, 2)),
					a = alp; // 为透明度
                rgba = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
            } else if (/rgb\(/ig.test(color)) {
                rgba = color.replace(/\(/, 'a(').replace(/\)/, ',' + alp + ')')
            } else if (/rgba/i.test(color)) {
                rgba = color.replace(/[^,]+\)/, alp + ')')
            }

            return rgba
        }

        function toRGB(color) {
            if (/rgba/i.test(color)) {
                return color.replace(/rgba\(/i, 'rgb(').replace(/,[^,]+\)/, ')')
            } else {
                return color
            }

        }

        function styleSync_toForm(type) {
            if (!activeElement) {
                messageBox('\u6ca1\u6709\u9009\u4e2d\u5143\u7d20')
                return
            }

            switch (type) {
                case 'link':
                    link(activeElement)
                case 'text':
                    fontSize(activeElement)
                    border(activeElement)
                    sizeAndPosition(activeElement)
                    break
                case 'pic':
                    pic(activeElement)
                    border(activeElement)
                    sizeAndPosition(activeElement)
                    break
            }

            // 字体
            function fontSize(ele) {
                var fontSize = parseInt($(ele).css('font-size')),
					lineHeight = parseInt($(ele).css('line-height')) / fontSize * 100,
					fontWeight = $(ele).css('font-weight'),
					textDecoration = $(ele).css('text-decoration'),
					color = $(ele).css('color'),
					textAlign = $(ele).css('text-align'),
					fontStyle = $(ele).css('font-style'),
					dl = $('#slide-text dl').eq(0)

                if ((/^\d+$/.test(fontWeight) && fontWeight <= 500) || fontWeight == ('normal' || 'thin')) {
                    dl.find('[name="font-weight"]').prop('checked', false)
                } else {
                    dl.find('[name="font-weight"]').prop('checked', true)
                }

                if (fontStyle == 'italic') {
                    dl.find('[name="font-style"]').prop('checked', true)
                } else {
                    dl.find('[name="font-style"]').prop('checked', false)
                }

                if (textDecoration == 'underline') {
                    dl.find('[name="text-decoration"]').prop('checked', true)
                } else {
                    dl.find('[name="text-decoration"]').prop('checked', false)
                }

                textAlign = /(auto)|(start)/i.test(textAlign) ? 'left' : textAlign

                dl.find('[name="size"]').val(fontSize)
                dl.find('[name="lineheight"]').val(lineHeight)

                dl.find('[name="color"]').val(color).siblings('.color-box').css({ 'background-color': color })

                dl.find('[name="text-align"][value="' + textAlign + '"]').prop('checked', true)
            }

            // 边框
            function border(ele) {
                var borderColor = $(ele).css('border-color'),
					borderStyle = $(ele).css('border-style'),
					borderWidth = parseInt($(ele).css('border-width')),
					borderRadius = parseInt($(ele).css('border-radius')),
					dl = $('#slide-text dl').eq(1),
					backgroundColor = $(ele).css('background-color'),
					backgroundAlpha,
					backgroundRepeat = $(ele).css('background-repeat'),
					backgroundSize = $(ele).css('background-size'),
					backgroundPosition = $(ele).css('background-position')

                backgroundAlpha = /rgba/i.test(backgroundColor) ? parseInt(/([^,]+)\)/.exec(backgroundColor)[1] * 100) : /rgb\(/i.test(backgroundColor) ? 100 : 0;

                borderStyle = borderStyle == 'none' ? '' : borderStyle;

                dl.find('#slide-border-color').css({
                    'background-color': function () {
                        if (/transparent/i.test(backgroundColor)) {
                            $(this).addClass('color-none');
                        } else {
                            $(this).removeClass('color-none');
                        }
                        toRGB(backgroundColor);
                    }
                })
                dl.find('[name="bordercolor"]').val(borderColor);
                dl.find('[name="radius"]').val(borderRadius);
                dl.find('[name="borderstyle"]').val(borderStyle);
                dl.find('[name="bordersize"]').val(borderWidth);

                dl.find('#slide-textbg-color').removeClass('color-none');

                dl.find('#slide-textbg-color').css({
                    'background-color': function () {
                        if (/transparent/i.test(backgroundColor)) {
                            $(this).addClass('color-none');
                        } else {
                            $(this).removeClass('color-none');
                        }
                        toRGB(backgroundColor);
                    }
                })
                dl.find('[name="background-alpha"]').val(backgroundAlpha);
                dl.find('[name="bgcolor"]').val(backgroundColor);

                dl.find('[name="color"]').val(backgroundColor);
                dl.find('[type="range"]').trigger('change');
            }

            // 尺寸位置
            function sizeAndPosition(ele) {
                var width = parseInt($(ele).parent().css('width')),
					height = parseInt($(ele).parent().css('height')),
					top = parseInt($(ele).parent().css('top')),
					left = parseInt($(ele).parent().css('left')),
					rotate = $(ele).parent().css('transform'),
					dl = $('#slide-text dl').eq(2);

                if (rotate == 'none') {
                    rotate = 0;
                } else {
                    var sin, cos, fixed = 0;
                    rotate = rotate.substr(7, rotate.length - 8).split(',');

                    sin = rotate[1];
                    cos = rotate[0];

                    rotate = Math.round(Math.asin(sin) * 180 / Math.PI);

                    if (cos < 0) {
                        rotate = 180 - rotate;
                    } else if (sin < 0) {
                        rotate = 360 + rotate;
                    }
                }

                dl.find('[name="width"]').val(width);
                dl.find('[name="height"]').val(height);
                dl.find('[name="y"]').val(top);
                dl.find('[name="x"]').val(left);
                dl.find('[name="rotate"]').val(rotate);
            }

            // 链接
            function link(ele) {
                var url = $(ele).attr('href'),
					dl = $('#slide-text dl').eq(3);
                dl.find('[name="url"]').val(url);
            }
            $('[name="url"]').on('change', function () {
                if (!activeElement) return;
                $(activeElement).parent().attr('href', $(this).val());
            });
        }

        function styleSync_toElement(type) {
            if (!activeElement) {
                messageBox('\u6ca1\u6709\u9009\u4e2d\u5143\u7d20');
                return;
            }

            switch (type) {
                case 'background':
                    break;
                case 'text':
                    fontSize(activeElement);
                    break;
                case 'border':
                    border(activeElement);
                    break;
                case 'size':
                    sizeAndPosition(activeElement);
                    break;
            }
            function backgroundColor(ele) {
                var dl = $('#slide-background');

                toRGBA(dl.find('[name="color"]').val(), dl.find('[name="alpha"]').val() / 100);

                $(ele).css({
                    backgroundColor: toRGBA(dl.find('[name="color"]').val(), dl.find('[name="alpha"]').val() / 100)
                })
            }
            function fontSize(ele) {
                var dl = $('#slide-text dl').eq(0),
					fontWeight = dl.find('[name="font-weight"]').prop('checked') ? 'bold' : 'normal',
					fontStyle = dl.find('[name="font-style"]').prop('checked') ? 'italic' : 'normal',
					textDecoration = dl.find('[name="text-decoration"]').prop('checked') ? 'underline' : 'none',
					textAlign = dl.find('[name="text-align"]:checked').val();

                $(ele).css({
                    'font-size': dl.find('[name="size"]').val() + 'px',
                    'line-height': dl.find('[name="lineheight"]').val() / 100 + 'em',
                    'font-weight': fontWeight,
                    'color': dl.find('[name="color"]').val(),
                    'font-style': fontStyle,
                    'text-decoration': textDecoration,
                    'text-align': textAlign
                })
            }
            function border(ele) {
                var dl = $('#slide-text dl').eq(1)
                borderColor = dl.find('[name="bordercolor"]').val(),
					borderStyle = dl.find('[name="borderstyle"]').val(),
					borderWidth = dl.find('[name="bordersize"]').val(),
					borderRadius = dl.find('[name="radius"]').val() + 'px',
					backgroundAlpha = dl.find('[name="background-alpha"]').val() / 100,
					backgroundColor = dl.find('[name="bgcolor"]').val()

                $(ele).css({
                    'border-color': borderColor,
                    'border-style': borderStyle,
                    'border-width': borderWidth,
                    '-webkit-border-radius': borderRadius,
                    'border-radius': borderRadius,
                    'background-color': toRGBA(backgroundColor, backgroundAlpha)
                })
            }
            function sizeAndPosition(ele) {
                var dl = $('#slide-text dl').eq(2),
					top = dl.find('[name="y"]').val(),
					left = dl.find('[name="x"]').val(),
					width = dl.find('[name="width"]').val(),
					height = dl.find('[name="height"]').val(),
					rotate = 'rotate(' + dl.find('[name="rotate"]').val() + 'deg)'

                $(ele).parent().css({
                    'top': top,
                    'left': left,
                    'width': width,
                    'height': height,
                    '-webkit-transform': rotate,
                    'transform': rotate
                })
                $('#image-resize-hanlders').css({
                    'top': top + $('#phone-shell').offset().top,
                    'left': left + $('#phone-shell').offset().left,
                    'width': width / 2,
                    'height': height / 2,
                    '-webkit-transform': rotate,
                    'transform': rotate
                })
            }
            function link(ele) {
                var dl = $('#slide-text dl').eq(3),
					link = dl.find('[name="url"]').val();

                link == '' && (link = 'javascript:;');

                $(ele).attr('href', link);
            }

            exports.pageChanged && exports.pageChanged();
        }

        function pageStyleSync_toForm(page) {
            if (!page) return
            var color = $(page).css('background-color'),
				alpha = 0,
				image = $(page).css('background-image'),
				position = $(page).css('background-position'),
				size = $(page).css('background-size'),
				opacity = $(page).css('opacity') * 100,
				repeat = $(page).css('background-repeat'),
				type,
				rgb,
				slideBackground = $('#slide-background').get(0);

            alpha = /rgba/i.test(color) ? parseInt(/([^,]+)\)/i.exec(color)[1] * 100) : /rgb\(/i.test(color) ? 100 : 0;
            rgb = toRGB(color);

            if (image == 'none') {
                type = 'none'
            } else if (size == 'cover') {
                type = 'cover'
            } else if (repeat == 'repeat') {
                type = 'repeat'
            } else if (position == '50% 50%' || position == 'center center') {
                type = 'center'
            }

            $(slideBackground).find('.setting-bg .page').css({
                'background-color': color,
                'background-image': image,
                'background-repeat': repeat,
                'background-position': position,
                'background-size': size,
                'opacity': opacity
            });

            type && $(slideBackground).find('[value="' + type + '"]').prop('checked', true);

            $(slideBackground).find('[name="color"]').val(color);
            $(slideBackground).find('#slide-background-color').css({
                backgroundColor: rgb
            });

            $(slideBackground).find('dl').eq(0).find('[type="range"]').val(alpha).siblings('output').html(alpha);
            $(slideBackground).find('dl').eq(1).find('[name="alpha"]').val(opacity).siblings('output').html(opacity);
        }

        function pageStyleSync_toPage(page) {
            if (!page) return;
            var slideBackground = $('#slide-background').get(0),
				color = $(slideBackground).find('[name="color"]').val(),
				alpha = $(slideBackground).children('dl').eq(0).find('[name="alpha"]').val(),
				image = $(slideBackground).find('.setting-bg .page').css('background-image'),
				opacity = $(slideBackground).children('dl').eq(1).find('[name="alpha"]').val(),
				type = $(slideBackground).find('.setting-bg-icon input:checked').val(),
				repeat = 'no-repeat',
				position = '0 0',
				size = 'auto';

            color = toRGBA(color, alpha / 100);
            opacity = opacity / 100;
            if (image == 'none') {
                type = 'none';
                $(slideBackground).find('.setting-bg .page').css({
                    'background-color': color,
                    'opacity': opacity
                })

                $(page).css({
                    'background-color': color,
                    'opacity': opacity
                })

                setTimeout(function () {
                    pageStyleSync_toForm(page);
                }, 0)
            } else {
                if (type != 'none' && page.hisBgImg) {
                    image = page.hisBgImg;
                    page.hisBgImg = '';
                }

                getImgSize(image, function (imageNSize) {
                    switch (type) {
                        case 'center':
                            position = 'center center';
                            repeat = 'no-repeat';
                            size = imageNSize.w + 'px ' + imageNSize.h + 'px';
                            break;
                        case 'cover':
                            position = 'center center';
                            size = 'cover';
                            repeat = 'no-repeat';
                            break;
                        case 'repeat':
                            position = 'left top';
                            repeat = 'repeat';
                            size = imageNSize.w + 'px ' + imageNSize.h + 'px';
                            break;
                        case 'none':
                            page.hisBgImg = image;
                            image = 'none';
                            break;
                    }

                    $(slideBackground).find('.setting-bg .page').css({
                        'background-color': color,
                        'background-image': image,
                        'background-repeat': repeat,
                        'background-position': position,
                        'background-size': size,
                        'opacity': opacity
                    })

                    $(page).css({
                        'background-color': color,
                        'background-image': image,
                        'opacity': opacity,
                        'background-repeat': repeat,
                        '-webkit-background-size': size,
                        'background-size': size
                    })
                })
            }

            exports.pageChanged && exports.pageChanged();
        }

        function getImgSize(str, fn) {
            var url = /url/.test(str) ? str.replace(/url\(/i, '').replace(/\)/, '') : str,
				img = new Image(),
				size;

            img.onload = function () {
                size = {
                    w: img.naturalWidth,
                    h: img.naturalHeight
                }
                fn && fn(size);
            }
            url = url.replace(/"/g, '');
            img.src = url.trim();
        }
        exports.syncBackground = pageStyleSync_toForm;

    })()

    // 动画
    !(function () {
        var slide = document.getElementById('slide-animate');
        if (!slide) return;

        var addBtn = $(slide).find('.btn.item-add').get(0),
			animate,
			allAnimation = [
				'slideIn', // 飞入
				'fadeIn', // 浮入
				'fadeIn', // 出现
				'zoomIn', // 放大
				'wobble', // 摇摆
				'rotateIn', // 旋转
				'slideOut', // 飞出
				'fadeOut' // 浮出
			],
			allDirection = [
				'Left',
				'Right',
				'Up',
				'Down'
			];

        $(addBtn).on('click', function (e) {
            var ev = e || window.event,
				index = $(slide).find('.niceScroll > dl').length
            ev.preventDefault()

            if (!activeElement) {
                messageBox('\u8fd8\u6ca1\u6709\u9009\u4e2d\u5143\u7d20\u54e6')
                return
            }

            var dl = initDl(index, 0, 1, 1, 0, 1),
				_animateItem

            $(dl).delegate('input,select', 'change', function () {
                var max = $(this).attr('max');
                if (max && parseFloat($(this).val()) > parseFloat(max)) {
                    $(this).val(max);
                }
                doAnimate(dl, true);
            })

            // doAnimate(dl);
        })
        $(slide).delegate('.view', 'click', function () {
            doAnimate($(this).closest('dl'));
        })

        $(slide).delegate('dl .delete', 'click', function () {
            $(this).closest('dl').remove();
            $('#slide-animate dl').each(function (index, dl) {
                $(dl).attr('data-index', index + 1);
                $(dl).data('index', index + 1);
                $(dl).find('dt').html(function (i, html) {
                    return html.replace(/动画(\d+)/ig, '动画' + (index + 1))
                });

            })
        })

        $('#slide-animate').delegate('.btn.btn-red', 'click', function () {
            messageBox({
                text: '确定要删除所有动画？',
                onConfirm: function () {
                    $('#slide-animate .niceScroll').html('');
                    $(activeElement).data('animate', '');
                    $(activeElement).attr('data-animate', '');
                    $(activeElement).css({
                        '-webkit-animation': 'none',
                        'animation': 'none'
                    });
                }
            })
        });

        function doAnimate(dl, isInitAnimate) {
            var index = $(dl).data('index'),
				_name,
				animationIndex = $(dl).find('[name="animation_' + index + '"]').val(),
				direction = $(dl).find('[name="direction_' + index + '"]').val(),
				_animateItem

            switch (parseInt(animationIndex)) {
                case 0:
                    _name = 'none'
                    break
                case 1:
                case 2:
                case 7:
                case 8:
                    _name = allAnimation[animationIndex - 1] + allDirection[direction - 1]
                    break
                default:
                    _name = allAnimation[animationIndex - 1]
                    break
            }


            _animateItem = [
				_name,
				$(dl).find('[name="duration_' + index + '"]').val() + 's',
				$(dl).find('[name="delay_' + index + '"]').val() + 's',
				$(dl).find('[name="count_' + index + '"]').val()
            ];

            // 同步动画列表到到元素存储
            animate = $(activeElement).data('animate')
            !animate && (animate = [])

            if (isInitAnimate) {
                animate[index - 1] ? animate[index - 1] = _animateItem.join(' ') : animate.push(_animateItem.join(' '))

                $(activeElement).attr({
                    'data-animate': JSON.stringify(animate)
                })
                $(activeElement).data('animate', animate);
            }
            $(activeElement).css({
                '-webkit-animation': 'none',
                'animation': 'none'
            })

            setTimeout(function () {
                $(activeElement).css({
                    '-webkit-animation': _animateItem.join(' '),
                    'animation': _animateItem.join(' ')
                })
            }, 10)
        }

        function setAnimate() {
            var animateList = $(activeElement).data('animate'),
				index = 0

            $(slide).find('.niceScroll').html('')

            animateList instanceof Array && animateList.forEach(function (ele) {
                ele = ele.split(' ')

                var direction = /(left)|(right)|(up)|(down)/i.exec(ele[0]),
					animation = ele[0],
					duration = parseInt(ele[1]),
					delay = parseInt(ele[2]),
					count = parseInt(ele[3])

                direction = direction && direction[0]

                if (ele[0]) {
                    if (/^fadeIn$/i.test(ele[0])) {
                        var fadeInIndex = 2
                    }
                    animation = animation.replace(/(left)|(right)|(up)|(down)/i, '')
                    animation = fadeInIndex ? allAnimation.lastIndexOf(animation) : allAnimation.indexOf(animation)
                    animation += 1
                } else {
                    animation = 0
                }

                if (direction) {
                    direction = allDirection.indexOf(direction) + 1
                } else {
                    direction = 1
                }

                initDl(index, animation, direction, duration, delay, count);
            })
        }

        function doAnimateList(obj) {
            var list = $(obj).data('animate');
            if (list instanceof Array && list.length) {
                doAni(obj, list);
            }
        }
        function doAni(active, list) {
            if ('undefined' == typeof active.aniIndex) { active.aniIndex = 0; }
            $(active).css({
                '-webkit-animation': 'none',
                'animation': 'none'
            })
            setTimeout(function () {
                $(active).css({
                    '-webkit-animation': list[active.aniIndex],
                    'animation': list[active.aniIndex]
                }).one('animationend webkitAnimationEnd', function () {
                    $(active).off('aimationEnd')
                    active.aniIndex++;
                    if (!list[active.aniIndex]) {
                        active.aniIndex = 0
                    } else {
                        doAni(active, list);
                    }
                })
            }, 0);
        }

        function initDl(index, animation, direction, duration, delay, count) {
            typeof animation == 'undefined' && (animation = 0);
            typeof direction == 'undefined' && (direction = 1);
            typeof duration == 'undefined' && (duration = 1);
            typeof delay == 'undefined' && (delay = 0);
            typeof count == 'undefined' && (count = 1);

            var dl = $('<dl>', {
                html: '<dt>\
		            <div class="icon"><span class="iconfont delete hint--left" data-hint="删除动画"></span><span class="iconfont view hint--left" data-hint="预览动画"></span></div>\
		            动画' + (index + 1) +
						'</dt>\
			        <dd>\
			            <em>方式</em>\
			            <select name="animation_' + (index + 1) + '" id="">\
			                <option value="0">无</option>\
			                <optgroup label="进入">\
			                    <option value="1">飞入</option>\
			                    <option value="2">浮入</option>\
			                </optgroup>\
			                <optgroup label="强调">\
			                    <option value="3">出现</option>\
			                    <option value="4">放大</option>\
			                    <option value="5">摇摆</option>\
			                    <option value="6">旋转</option>\
			                </optgroup>\
			                <optgroup label="退出">\
			                    <option value="7">飞出</option>\
			                    <option value="8">浮出</option>\
			                </optgroup>\
			            </select>\
			        </dd>\
			        <dd>\
			            <em>方向</em>\
			            <select name="direction_' + (index + 1) + '" id="">\
			                <option value="1">从左到右</option>\
			                <option value="2">从右到左</option>\
			                <option value="3">从上到下</option>\
			                <option value="4">从下到上</option>\
			            </select>\
			        </dd>\
			        <dd>\
			            <em>时间</em>\
			            <input type="number" max="10" min="0" name="duration_' + (index + 1) + '" value="' + duration + '"> s\
			        </dd>\
			        <dd>\
			            <em>延迟</em>\
			            <input type="number" max="10" min="0" name="delay_' + (index + 1) + '" value="' + delay + '"> s\
			        </dd>\
			        <dd>\
			            <em>循环</em>\
			            <input type="number" max="10" min="0" name="count_' + (index + 1) + '" value="' + count + '">\
			        </dd>',
                'data-index': index + 1
            }).appendTo($(slide).find('.niceScroll')).get(0);

            $(dl).find('[name="animation_' + (index + 1) + '"]').val(animation + '');
            $(dl).find('[name="direction_' + (index + 1) + '"]').val(direction + '');

            return dl
        }

        exports.setAnimate = setAnimate;
        exports.doAnimateList = doAnimateList;
    })()
})
