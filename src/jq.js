if (typeof jQuery !== 'undefined' && (typeof document.addEventListener === 'function' || util.isIE8())) {
	jQuery.fn.kalendae = function (options) {
		this.each(function (i, e) {
			if (e.tagName === 'INPUT') {
				//if element is an input, bind a popup calendar to the input.
				jQuery(e).data('kalendae', new Kalendae.Input(e, options));
			} else {
				//otherwise, insert a flat calendar into the element.
				jQuery(e).data('kalendae', new Kalendae(jQuery.extend({}, {attachTo:e}, options)));
			}
		});
		return this;
	};
}

