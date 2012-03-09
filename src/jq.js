
if (typeof jQuery !== 'undefined') {
	jQuery.fn.kalendae = function (options) {
		this.each(function (i, e) {
			if (e.tagName === 'INPUT') {
				//if element is an input, bind a popup calendar to the input.
				$(e).data('kalendae', new Kalendae.Input(e, options));
			} else {
				//otherwise, insert a flat calendar into the element.
				$(e).data('kalendae', new Kalendae($.extend({}, {attachTo:e}, options)));
			}
		});
		return this;
	}
}

