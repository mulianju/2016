define(function (require, exports, module) {
	var $ = exports, transform = $.transform, transition = $.transition, translate3d = $.translate3d && !/MiuiBrowser/i.test(navigator.userAgent)&& !/GT\-\w?\d+/i.test(navigator.userAgent);
	var instances = [], touchPreventDefault = false; //!Event.touchEnabled || Event.Touch.up === 'MSPointerUp';
	var totalDuration = .3, minMovedPx = 2;
	// iOS 7 不好支持 cloneNode
	var globalLoop = !$.os.ios || $.os.majorVersion < 7;
	var timeFunctions = {
		quadratic: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		circular: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
		easeOut: 'ease-out',
		back: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
	};
	function addTransition(element, duration, timefunction) {
		if (arguments.length === 1 || isNaN(duration) || duration < 0)
			duration = totalDuration;
		duration = Math.round(duration * 100) / 100;
		duration = Math.max(.01, duration);
		duration = Math.min(totalDuration, duration);
		timefunction = arguments.length < 3 ? timeFunctions.easeOut : timefunction;
		timefunction = timefunction ? (' ' + timefunction) : '';
		element.style[transition] = $.CSSTransform + timefunction + ' ' + duration + 's';
	}
	function removeTransition(element) {
		element.style[transition] = 'none';
	}
	function FlipView(selector, index) {
		if (!selector) return;
		if (typeof selector === 'string') {
			document.querySelectorAll(selector).forEach(function (element) { init(element); } );
			FlipView.refresh();
		} else if (selector instanceof HTMLElement) {
			init(selector, index);
		}
	}
	function init(container) {

		var loop = container.getAttribute('data-loop'), index = parseInt(arguments[1]), orientation = 'horizontal', left, top, lastIndex, firstCopy, lastCopy, items, itemsContainer, count, c, wrapper = container;
		loop = loop === 'cloned' ? 'cloned' : (globalLoop && loop !== 'false' && loop !== 'no' && loop !== '0');
		loop || wrapper.setAttribute('touch', 'false');
		isNaN(index) && (index = parseInt(container.getAttribute('data-initial-index')));
		if (c = container.querySelector('.container')) {
			container = c;
			
			if(c = wrapper.querySelector('.tabs')) {
				function setSelected() {
					if (c) {
						var e = c.querySelectorAll('.selected');
						e && [].forEach.call(e, function (tab) { tab.classList.remove('selected'); });
						(e = c.children[index]) && (e.className = 'selected', e.classList.add('selected'));
					}
				}
				container.addEventListener('changed', setSelected);
				if (isNaN(index)) {
					index = 0;
					c && [].forEach.call(c.children, function (tab, i) {
						tab.classList.contains('selected') && (index = i);
						tab.addEventListener(window.navigator.msPointerEnabled ? 'click' : 'tap', function (e) { go(i); e.preventDefault(); });
					});
				}
				setSelected();
			}
		}
		index = index || 0;
		itemsContainer = container;
		
		if (container.tagName === 'TABLE') {
			if (container.rows.length > 1) {
				items = container.rows;
			} else {
				items = (itemsContainer = container.rows[0]).cells;
			}
		} else {
			items = container.children;
		}
		
		count = items.length;
		if (count < 2) return;
		addTransition(container);
		
		
		
		if (loop) {
			if (loop === 'cloned') {
				firstCopy = items[count - 1];
				lastCopy = items[0];
			} else {
				firstCopy = items[0].cloneNode(true);
				lastCopy = items[count - 1].cloneNode(true);
				itemsContainer.insertBefore(lastCopy, itemsContainer.firstChild);
				itemsContainer.appendChild(firstCopy);
			}
		}
		wrapper.refresh = container.refresh = function () {
			itemsContainer = container;
			var children;
			if (container.tagName === 'TABLE') {
				if (container.rows.length > 1) {
					children = container.rows;
				} else {
					children = (itemsContainer = container.rows[0]).cells;
				}
			} else {
				children = container.children;
			}
			if (loop) {
				items = [];
				[].forEach.call(children, function (item) {
					item === firstCopy || item === lastCopy || items.push(item);
				});
			} else {
				items = children;
			}
			count = items.length;

			if (count < 2)
				return;
			var b1 = items[0].getBoundingClientRect(), b2 = items[1].getBoundingClientRect();
			orientation = b2.top >= b1.top + b1.height ? 'vertical' : 'horizontal';
			container.style.msTouchAction = orientation === 'vertical' ? 'pan-x' : 'pan-y';
			
			var containerBounds = container.getBoundingClientRect();
			if (loop && firstCopy && lastCopy) {
				var itemBounds = firstCopy.getBoundingClientRect();
				firstCopy.left = 0 - firstCopy.offsetLeft || containerBounds.left - itemBounds.left;
				firstCopy.top = 0 - firstCopy.offsetTop || containerBounds.top - itemBounds.top;
				itemBounds = lastCopy.getBoundingClientRect();
				lastCopy.left = 0 - lastCopy.offsetLeft || containerBounds.left - itemBounds.left;;
				lastCopy.top = 0 - lastCopy.offsetTop || containerBounds.top - itemBounds.top;;
			}
			var containerBounds = container.getBoundingClientRect();
			[].forEach.call(items, function (item) {
				var itemBounds = item.getBoundingClientRect();
				item.left = (0 - item.offsetLeft) || containerBounds.left - itemBounds.left;
				item.top = 0 - item.offsetTop || containerBounds.top - itemBounds.top;
			});
			go(index, false);
		};
		function go(i, t, f, e) {
			var data, event, timeout;
			//var containerBounds, itemBounds, offsetX, offsetY, offset;
			i = loop ? ((i % count) + count) % count : (i >= count ? count - 1 : (i < 0) ? 0 : i);

			if (i !== index && f !== false) {
				data = { currentIndex: i, lastIndex: index, current: items[i], changeType: e };
			}
			if (items[i]) {
				if (data && (event = container.fireEvent('beforeChange', data)) && (event.defaultPrevented || event.returnValue === false)) {
					container.back();
					return;
				}
				(arguments.length === 1 || t) ? (timeout = t || totalDuration, addTransition(container, timeout)) : removeTransition(container);
				container.scrollTo(items[i].left, items[i].top);
			}
			left = top = 0;
			timeout = Math.round(Math.min(timeout || 0, totalDuration) * 1000);
			
			if (i !== index) {
				index = i;
				lastIndex = index;
				data && (timeout ? setTimeout(function () { container.fireEvent('changed', data); }, timeout ) : container.fireEvent('changed', data));
			}
		};

		function beforeChange(i) {
			i = loop ? ((i % count) + count) % count : (i >= count ? count - 1 : (i < 0) ? 0 : i);
			if (i !== index) {
				var data = { currentIndex: i, lastIndex: index, current: items[i] }, event;
				if (data && (event = container.fireEvent('beforeChange', data)) && (event.defaultPrevented || event.returnValue === false)) {
					container.back();
					return false;
				}
			}
			return true;
		}
		if (!container.orientation) {
			var properties = {
				orientation: {
					get: function () {
						return orientation;
					},
					set: function () { }
				},
				go: {
					value: function (i, t, f) { go.call(this, i, t, f); }
					//set: function () { }
				},
				index: {
					get: function () { return index; },
					set: function (index) { go.call(this, index); }
				}
			};

			Object.defineProperties(container, properties);
			Object.defineProperties(wrapper, properties);
		}
		var fixElement = document.createElement('div');
		document.body.appendChild(fixElement);
		fixElement.style.cssText = 'width:10px;height:1px;color:#fff;overflow:hidden;pointer-events:none';
		wrapper.scrollTo = container.scrollTo = function (x, y, t) {
			t === false && removeTransition(container);
			orientation === 'vertical' ? (y = y ? (y + 'px') : 0, x = 0) : (x = x ? (x + 'px') : 0, y = 0);
			container.style[transform] = 'translate' + (translate3d ? '3d' : '') + '(' + x + ',' + y + (translate3d ? ',0' : '') + ')';
			fixElement.innerHTML = x + y + t;
		};
		wrapper.back = container.back = function () {
			//console.log('back to: ' + index);
			var itemBounds = items[index].getBoundingClientRect(),
				duration = Math.abs((orientation === 'vertical' ? ((items[index].top + itemBounds.top) / itemBounds.height) : ((items[index].left + itemBounds.left) / itemBounds.width)) * totalDuration);

			duration = Math.max(duration, .1);
			addTransition(container, duration, timeFunctions.back);
			container.scrollTo(items[index].left, items[index].top);
		};
		wrapper.previous = container.previous = function (duration, e) {
			var i = index - 1;
			if (!beforeChange(i)) return;
			if (i >= 0 || !firstCopy) { go(i, duration, 0, e); } else {
				removeTransition(container);
				container.scrollTo(firstCopy.left + left, firstCopy.top + top);
				setTimeout(function () {
					go(-1, duration, 0, e);
				}, 0);
			}
		};

		wrapper.next = container.next = function (duration, e) {
			var i = index + 1;
			if (!beforeChange(i)) return;
			if (i < count || !lastCopy) { go(i, duration, 0, e); } else {
				removeTransition(container);
				container.scrollTo(lastCopy.left + left, lastCopy.top + top);
				setTimeout(function () {
					go(0, duration, 0, e);
				}, 0);
			}
		};

		touchPreventDefault && container.addEventListener('click', function (e) { if (touchmove) { Event.preventDefault(e); return false; } });

		var touchmove, touched, startX, startY, lastTouch, moved;
		container.addEventListener(Event.Touch.down, function (e) {
			//return;
			if (!Event.Touch.isMsPrimary(e)) return;
			cancel();
			touchPreventDefault && Event.preventDefault(e);
			touchmove = moved = 0;
			if (e.touches) e = e.touches[0];
			if (!e) return;
			touched = 1;
			startX = e.pageX;
			startY = e.pageY;
			lastTouch = e;
			removeTransition(this);
			document.addEventListener(Event.Touch.up, onTouchUp);
			document.addEventListener(Event.Touch.move, onTouchMove);
			Event.Touch.cancel && document.addEventListener(Event.Touch.cancel, onTouchCancel);
		});
		function cancel() {
			document.removeEventListener(Event.Touch.up, onTouchUp);
			document.removeEventListener(Event.Touch.move, onTouchMove);
			document.removeEventListener(Event.Touch.cancel, onTouchCancel);
		}
		function onTouchMove(e) {
			if (!Event.Touch.isMsPrimary(e)) return;
			if (touched) {
				var t, v, x, y;
				if (t = e.touches) { t = t[0]; } else { t = e; }
				lastTouch = t;
				left = container.left = t.pageX - startX;
				top = container.top = t.pageY - startY;

				x = Math.abs(left);
				y = Math.abs(top);
				if (!moved) {
					if (orientation === 'vertical') {
						if (x > minMovedPx && x - y > 0) { touched = 0; return; }
						moved = y > minMovedPx && y - x > 0;
					} else {
						if (y > minMovedPx && y - x > 0) { touched = 0; return; }
						moved = x > minMovedPx && x - y > 0;
					}
				}
				if (moved) {
					container.scrollTo(left + items[index].left, top + items[index].top);
					if (x > 1 || y > 1) {
						touchmove = 1;
						Event.preventDefault(e);
					}
				}
			}
		};
		function onTouchUp(e) {
			if (!Event.Touch.isMsPrimary(e)) return;
			var t, x, y, v, w;
			if (touched && moved) {
				if (t = e.touches) { t = t[0]; } else { t = e; }
				t = t || lastTouch;
				x = t.pageX - startX; y = t.pageY - startY;
				v = orientation === 'vertical' ? y : x;
				w = items[index].offsetWidth;
				if (v > 20) { container.previous(Math.max(Math.min(totalDuration, (w - v) * totalDuration / w), .01), 'swipe-previous'); }
				else if (v < -20) { container.next(Math.max(Math.min(totalDuration, (w + v) * totalDuration / w), .01), 'swipe-next'); }
				else { container.back(); }
				touchmove = 1;
			}
			touched = 0; moved = 0;
			if (touchmove)
				Event.preventDefault(e);
			cancel();
		};

		function onTouchCancel() {
			container.back();
			cancel();
		}
		instances.push(container);
		return wrapper;
	}
	FlipView.refresh = function () {
		instances.forEach(function (item) { Function.isFunction(item.refresh) && item.refresh(); });
	};
	window.addEventListener('orientationchange', FlipView.refresh);
	window.addEventListener('resize', FlipView.refresh);
	window.addEventListener('load', FlipView.refresh);
	Object.defineProperties(FlipView, {
		instances: {
			value: instances,
			writable: false
		},
		duration: {
			get: function () { return totalDuration; },
			set: function (value) { if ((value = parseInt(value)) && value >= 0) totalDuration = value; }
		}
	});
	$.ready(function () {
		FlipView('.flipview');
	});
	$.FlipView = FlipView;
	return FlipView;
});