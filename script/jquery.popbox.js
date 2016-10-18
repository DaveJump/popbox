(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		//AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		//CommonJS
		module.exports = factory(require('jquery'));
	} else {
		//Browser globals
		root.popbox = factory(root.jQuery);
	}
})(this, function(jQuery) {
	var $ = jQuery;
	$.fn.popbox = function(options) {
		try {
			var defaults = {
					width: 520,
					height: undefined,
					center: true,
					draggable: false,
					animation: ['pop', 300],
					header: {
						enabled: true,
						height: 40,
						color: [],
						title: {
							text: 'POPBOX TITLE',
							size: undefined
						},
						close: {
							enabled: true,
							color: [],
							beforeClose: undefined,
							afterClose: undefined
						}
					},
					content: {
						height: 230
					},
					footer: {
						enabled: true,
						height: 50,
						color: undefined,
						buttons: [{
							text: 'confirm',
							color: [],
							handler: undefined
						}, {
							text: 'cancel',
							color: [],
							handler: undefined
						}]
					}
				},
				config = $.extend(true, defaults, options || {}),
				randomId = (Math.abs(Math.random() - 0.01) + '').replace('.', ''),
				content = $(this).attr('data-content') === 'popbox' ? $(this).html() : '';

			$(this).attr('data-content') === 'popbox' && $(this).hide();

			function init(boxWrap, els) {
				var aniType;
				if (config.animation instanceof Array) {
					switch (config.animation[0]) {
						case 'pop':
							aniType = 'pop';
							boxWrap.children('.popbox-main').addClass('pop-default');
							break;
						case 'fade':
							aniType = 'fade';
							boxWrap.children('.popbox-main').addClass('fade-default');
							break;
					}
				}

				var Methods = function(aniType) {
					this.box = boxWrap;
					this.aniType = aniType;
					if (this.aniType) {
						this.transitionDur = {
							transition: 'all ' + (config.animation[1] / 1000) + 's',
							webkitTransition: 'all ' + (config.animation[1] / 1000) + 's'
						}
					}
					Methods.prototype.popboxShow = function() {
						if (!this.aniType) {
							this.box.css({
								visibility: 'visible',
								opacity: 1,
								transition: 'all 0s',
								webkitTransition: 'all 0s'
							}).show();
							this.box.children('.popbox-main').css({
								visibility: 'visible',
								opacity: 1,
								transition: 'all 0s',
								webkitTransition: 'all 0s'
							});
						} else {
							this.box.show();
							var _thisbox = this.box,
								_this = this;
							window.setTimeout(function() {
								_thisbox.css(_this.transitionDur);
								_thisbox.children('.popbox-main').css(_this.transitionDur);
								_thisbox.addClass('in');
								if (_this.aniType == 'pop') {
									_thisbox.children('.popbox-main').removeClass('pop-default').addClass('pop-in');
								} else {
									_thisbox.children('.popbox-main').addClass('in');
								}
							}, 30);
						}
					};
					Methods.prototype.popboxHide = function() {
						if (!this.aniType) {
							this.box.hide();
						} else {
							this.box.removeClass('in');
							if (this.aniType == 'pop') {
								this.box.children('.popbox-main').css(this.transitionDur).removeClass('pop-in').addClass('pop-default');
							} else {
								this.box.children('.popbox-main').removeClass('in');
							}
							var _this = this.box;
							window.setTimeout(function() {
								_this.hide();
							}, config.animation[1] || 430);
						}
					};
				};

				var newMethod = new Methods(aniType);

				/* header */
				els.header.css({
					height: config.header.height + 'px',
					lineHeight: config.header.height + 'px',
					backgroundColor: config.header.color[0] && config.header.color[0],
					color: config.header.color[1] && config.header.color[1]
				});
				els.title.css({
					fontSize: config.header.title.size && (config.header.title.size + 'px')
				});
				els.close.css({
					color: config.header.close.color && config.header.close.color
				});
				//box close
				var stopped;
				boxWrap.off('click').on('click', function(e) {
					if (e.target == e.currentTarget) {
						var beforeHandler = config.header.close.beforeClose,
							afterHandler = config.header.close.afterClose;
						if (beforeHandler && typeof beforeHandler === 'function') {
							//box closing should be stopped manually?
							var shouldClose = beforeHandler.call(newMethod, newMethod.box, e);
							if (shouldClose === false || shouldClose === 0)
								return;
							else
								newMethod.popboxHide();
						}
						if (!stopped && afterHandler && typeof afterHandler === 'function') {
							window.setTimeout(function() {
								afterHandler.call(newMethod, newMethod.box, e);
							}, config.animation[1] || 50);
						}
						e.stopPropagation();
					}
				});
				els.close.off('click').on('click', function(e) {
					boxWrap.trigger('click');
				});

				/* content */
				els.content.css({
					height: config.content.height + 'px'
				});

				/* footer */
				var buttons = config.footer.buttons;
				els.footer.css({
					height: config.footer.height + 'px',
					backgroundColor: config.footer.color && config.footer.color
				});
				if (buttons.length) {
					$.each(els.buttons, function(index) {
						$(this).css({
							backgroundColor: buttons[index].color[0],
							color: buttons[index].color[1]
						});
						if (buttons[index].handler && typeof buttons[index].handler === 'function') {
							$(this).off('click').on('click', function(e) {
								buttons[index].handler.call(newMethod, newMethod.box, e);
							});
						}
					});
				}

				/* mainBox */
				var totalHeight = config.height || (els.header.innerHeight() + els.content.innerHeight() + els.footer.innerHeight());
				els.box.css({
					width: config.width + 'px',
					height: totalHeight + 'px',
					left: config.center && '50%',
					top: config.center && '50%',
					marginLeft: config.center && (-(config.width / 2) + 'px'),
					marginTop: config.center && (-(totalHeight / 2) + 'px')
				});

				if (config.draggable) {
					boxWrap.children('.popbox-main').off('mousedown').on('mousedown', function(e) {
						var downX = e.pageX,
							downY = e.pageY,
							downLeft = e.pageX - $(this).offset().left,
							downTop = e.pageY - $(this).offset().top,
							box = $(this);
						$(document).on('mousemove', function(e) {
							var moveLeft = e.pageX - downLeft,
								moveTop = e.pageY - downTop;
							box.css({
								top: moveTop + 'px',
								left: moveLeft + 'px',
								marginTop: 0,
								marginLeft: 0,
								transition: 'all 0s',
								webkitTransition: 'all 0s'
							});
							e.preventDefault();
							return false;
						}).on('mouseup', function(e) {
							$(this).off('mousemove').off('mouseup');
							e.stopPropagation();
						});
					});
				}

				return newMethod;
			}

			return (function() {
				var buttons = config.footer.buttons,
					buttonsStr = '';
				for (var i = 0; i < buttons.length; i++) {
					buttonsStr += '<span>' + buttons[i].text + '</span>';
				}
				var closeStr = config.header.close.enabled ? '<span class="popbox-close iconfont icon-close"></span>' : '',
					headerStr = config.header.enabled ? '<div class="popbox-header">' + '<span class="popbox-title">' + config.header.title.text + '</span>' + closeStr +
					'</div>' : '',
					footerStr = config.footer.enabled ? '<div class="popbox-footer">' + buttonsStr + '</div>' : '',
					mainStr = '<div id="popbox' + randomId + '" class="popbox-mask">' +
					'<div class="popbox-main">' + headerStr +
					'<div class="popbox-content">' + content + '</div>' + footerStr +
					'</div>' +
					'</div>';

				$(document.body).append(mainStr);
				var boxWrap = $('#popbox' + randomId + ''),
					els = {
						box: boxWrap.find('.popbox-main'),
						header: boxWrap.find('.popbox-header'),
						title: boxWrap.find('.popbox-title'),
						close: boxWrap.find('.popbox-close'),
						content: boxWrap.find('.popbox-content'),
						footer: boxWrap.find('.popbox-footer'),
						buttons: boxWrap.find('.popbox-footer > span')
					};
				return init(boxWrap, els);
			})();
		} catch (e) {
			throw new Error(e);
		}
	}
});