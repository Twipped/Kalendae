Kalendae.Input = function (targetElement, options) {
	if (typeof document.addEventListener !== 'function'  && !util.isIE8()) return;

	var $input = this.input = util.$(targetElement),
		overwriteInput,
		$closeButton,
		changing = false;

	if (!$input || $input.tagName !== 'INPUT') throw "First argument for Kalendae.Input must be an <input> element or a valid element id.";

	var self = this,
		classes = self.classes,
		opts = self.settings = util.merge(self.defaults, options);

	this._events = {};

	//force attachment to the body
	opts.attachTo = window.document.body;

	//if no override provided, use the input's contents
	if (!opts.selected) opts.selected = $input.value;
	else overwriteInput = true;

	//call our parent constructor
	Kalendae.call(self, opts);

	//create the close button
	if (opts.closeButton) {
		$closeButton = util.make('a', {'class':classes.closeButton}, self.container);
		util.addEvent($closeButton, 'click', function () {
			$input.blur();
		});
	}

	if (overwriteInput) $input.value = self.getSelected();

	var $container = self.container,
		noclose = false;

	$container.style.display = 'none';
	util.addClassName($container, classes.positioned);

	this._events.containerMouseDown = util.addEvent($container, 'mousedown', function (event, target) {
		noclose = true; //IE8 doesn't obey event blocking when it comes to focusing, so we have to do this shit.
	});

	this._events.documentMousedown = util.addEvent(window.document, 'mousedown', function (event, target) {
		noclose = false;
	});

	this._events.inputFocus = util.addEvent($input, 'focus', function () {
		changing = true; // prevent setSelected from altering the input contents.
		self.setSelected(this.value);
		changing = false;
		self.show();
	});

	this._events.inputBlur = util.addEvent($input, 'blur', function () {
		if (noclose && util.isIE8()) {
			noclose = false;
			$input.focus();
		}
		else self.hide();
	});

	this._events.inputKeyup = util.addEvent($input, 'keyup', function (event) {
		changing = true; // prevent setSelected from altering the input contents.
		self.setSelected(this.value);
		changing = false;
	});

	var $scrollContainer = util.scrollContainer($input);

	if( $scrollContainer ) {

		// Hide calendar when $scrollContainer is scrolled
		util.addEvent($scrollContainer, 'scroll', function (event) {
			$input.blur();
		});
	}

	self.subscribe('change', function () {
		if (changing) {
			// the change event came from an internal modification, don't update the field contents
			return;
		}
		$input.value = self.getSelected();
		util.fireEvent($input, 'change');
	});

};

Kalendae.Input.prototype = util.merge(Kalendae.prototype, {
	defaults : util.merge(Kalendae.prototype.defaults, {
		format: 'MM/DD/YYYY',
		side: 'bottom',
		closeButton: true,
		offsetLeft: 0,
		offsetTop: 0
	}),
	classes : util.merge(Kalendae.prototype.classes, {
		positioned : 'k-floating',
		closeButton: 'k-btn-close'
	}),

	show : function () {
		var $container = this.container,
			style = $container.style,
			$input = this.input,
			pos = util.getPosition($input),
			$scrollContainer = util.scrollContainer($input),
			scrollTop = $scrollContainer ? $scrollContainer.scrollTop : 0,
			opts = this.settings;

		style.display = '';
		switch (opts.side) {
			case 'left':
				style.left = (pos.left - util.getWidth($container) + opts.offsetLeft) + 'px';
				style.top  = (pos.top + opts.offsetTop - scrollTop) + 'px';
				break;
			case 'right':
				style.left = (pos.left + util.getWidth($input)) + 'px';
				style.top  = (pos.top + opts.offsetTop - scrollTop) + 'px';
				break;
			case 'top':
				style.left = (pos.left + opts.offsetLeft) + 'px';
				style.top  = (pos.top - util.getHeight($container) + opts.offsetTop - scrollTop) + 'px';
				break;
			case 'bottom':
				/* falls through */
			default:
				style.left = (pos.left + opts.offsetLeft) + 'px';
				style.top  = (pos.top + util.getHeight($input) + opts.offsetTop - scrollTop) + 'px';
				break;
		}

		style.position = util.isFixed($input) ? 'fixed' : 'absolute';

		this.publish('show', this);
	},

	hide : function () {
		this.container.style.display = 'none';
		this.publish('hide', this);
	},

	destroy : function() {
		var $container = this.container;
		var $input = this.input;

		util.removeEvent($container, 'mousedown', this._events.containerMousedown);

		util.removeEvent(window.document, 'mousedown', this._events.documentMousedown);

		util.removeEvent($input, 'focus', this._events.inputFocus);

		util.removeEvent($input, 'blur', this._events.inputBlur);

		util.removeEvent($input, 'keyup', this._events.inputKeyup);

		$container.remove();
	}
});

