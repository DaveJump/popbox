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
					height: 320,
					center: true,
					draggable: false,
					animation: {
						enabled: true,
						type: 'zoom-fade',
						duration: 400
					},
					header: {
						enabled: true,
						height: 40,
						color: null,
						title: {
							text: 'POPBOX TITLE',
							size: null,
							color: null
						},
						closeButton: {
							enabled: true,
							color: null,
							beforeClose: null,
							afterClose: null
						}
					},
					content: {
						height: 230,
						color: null
					},
					footer: {
						enabled: true,
						height: 50,
						color: null,
						buttonGroup: {
							confirm: {
								enabled: true,
								text: 'confirm',
								color: [],
								handler: null
							},
							cancel: {
								enabled: true,
								text: 'cancel',
								color: [],
								handler: null
							}
						}
					}
				},
				config = $.extend(true, defaults, options || {}),
				randomId = (Math.abs(Math.random() - 0.01) + '').replace('.', ''),
				content = $(this).attr('data-content') == 'popbox' ? $(this).html() : '';

			$(this).attr('data-content') == 'popbox' && $(this).hide();

			function resetStyle(boxWrap, els) {
				/* mainBox */
				els.box.css({
					width: config.width + 'px',
					height: config.height + 24 + 'px',
					left: config.center && '50%',
					top: config.center && '50%',
					marginLeft: config.center && (-(config.width / 2) + 'px'),
					marginTop: config.center && (-((config.height + 24) / 2) + 'px')
				});

				/* header */
				!config.header.enabled && els.header.hide();
				!config.header.closeButton.enabled && els.close.hide();
				els.header.css({
					lineHeight: config.header.height + 'px',
					backgroundColor: config.header.color && config.header.color
				});
				els.title.css({
					fontSize: config.header.title.size && (config.header.title.size + 'px'),
					color: config.header.title.color && config.header.title.color
				});
				els.close.css({
					color: config.header.closeButton.color && config.header.closeButton.color
				});
				//box close
				var stopped;
				els.close.off('click').on('click', function(e) {
					var beforeHandler = config.header.closeButton.beforeClose,
						afterHandler = config.header.closeButton.afterClose;
					if (beforeHandler && typeof beforeHandler === 'function') {
						//box closing should be stopped manually?
						$.fn.stopClosing = function(stop) {
							if ($(this)[0] === boxWrap[0]) {
								stopped = stop;
							}
						}
						beforeHandler.call(boxWrap[0]);
						if (stopped) {
							return;
						} else {
							boxWrap.hide();
						}
					}
					if (!stopped && afterHandler && typeof afterHandler === 'function') {
						afterHandler.call(boxWrap[0]);
					}
					e.stopPropagation();
				});
				boxWrap.off('click').on('click', function(e) {
					e.target == e.currentTarget && els.close.trigger('click');
				});

				/* content */
				els.content.css({
					height: config.content.height + 'px',
					backgroundColor: config.content.color && config.content.color
				});

				/* footer */
				var confirm = config.footer.buttonGroup.confirm,
						cancel = config.footer.buttonGroup.cancel;

				!config.footer.enabled && els.footer.hide();
				els.footer.css({
					height: config.footer.height + 'px',
					backgroundColor: config.footer.color && config.footer.color 
				});
				if(config.footer.enabled){
					!confirm['enabled'] && els.confirm.hide();
					!confirm['enabled'] && els.cancel.hide();
					els.confirm.text(confirm['text']);
					els.cancel.text(cancel['text']);
					if(confirm['color'] instanceof Array && confirm['color'].length){
						els.confirm.css({
							backgroundColor: confirm['color'][0],
							color: confirm['color'][1]
						});
					}
					if(cancel['color'] instanceof Array && cancel['color'].length){
						els.cancel.css({
							backgroundColor: cancel['color'][0],
							color: cancel['color'][1]
						});
					}
				}
				if(confirm.handler && typeof confirm.handler === 'function'){
					els.confirm.off('click').on('click',function(){
						confirm.handler.call(boxWrap[0]);
					});
				}
				if(cancel.handler && typeof cancel.handler === 'function'){
					els.cancel.off('click').on('click',function(){
						cancel.handler.call(boxWrap[0]);
					});
				}

				return boxWrap;
			}

			return (function() {
				var htmlstr = '<div id="popbox' + randomId + '" class="popbox-mask">' +
					'<div class="popbox-main">' +
					'<div class="popbox-header">' +
					'<span class="popbox-title">' + config.header.title.text + '</span>' +
					'<span class="popbox-close">X</span>' +
					'</div>' +
					'<div class="popbox-content">' + content + '</div>' +
					'<div class="popbox-footer">' +
					'<span class="popbox-cancel">' + config.footer.buttonGroup.cancel.text + '</span>' +
					'<span class="popbox-confirm">' + config.footer.buttonGroup.confirm.text + '</span>' +
					'</div>' +
					'</div>' +
					'</div>';
				$(document.body).append(htmlstr);
				var boxWrap = $('#popbox' + randomId + ''),
						els = {
							box: boxWrap.find('.popbox-main'),
							header: boxWrap.find('.popbox-header'),
							title: boxWrap.find('.popbox-title'),
							close: boxWrap.find('.popbox-close'),
							content: boxWrap.find('.popbox-content'),
							footer: boxWrap.find('.popbox-footer'),
							confirm: boxWrap.find('.popbox-confirm'),
							cancel: boxWrap.find('.popbox-cancel')
						};
				return resetStyle(boxWrap, els);
			})();
		} catch (e) {
			throw new Error(e);
		}
	}

});