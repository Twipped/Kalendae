
Kalendae.Input = function (targetElement, options) {
	var $input = this.input = util.$(targetElement),
		overwriteInput;

	if (!$input || $input.tagName !== 'INPUT') throw "First argument for Kalendae.Input must be an <input> element or a valid element id.";
	
	var self = this,
		classes = self.classes
		opts = self.settings = util.merge(self.defaults, options);
	
	//force attachment to the body
	opts.attachTo = window.document.body;

	//if no override provided, use the input's contents
	if (!opts.selected) opts.selected = $input.value;
	else overwriteInput = true;
	
	//call our parent constructor
	Kalendae.call(self, opts);
	
	//create the close button
	if (opts.closeButton) {
		var $closeButton = util.make('a', {'class':classes.closeButton}, self.container)
		util.addEvent($closeButton, 'click', function () {
			$input.blur();
		});
	}
	
	if (overwriteInput) $input.value = self.getSelected();
	
	var $container = self.container,
		noclose = false;
	
	$container.style.display = 'none';
	util.addClassName($container, classes.positioned);
	
	util.addEvent($container, 'mousedown', function (event, target) {
		noclose = true; //IE8 doesn't obey event blocking when it comes to focusing, so we have to do this shit.
	});
	util.addEvent(window.document, 'mousedown', function (event, target) {
		noclose = false;
	});

	util.addEvent($input, 'focus', function () {
		self.setSelected(this.value);
		self.show();
	});
	
	util.addEvent($input, 'blur', function () {
		if (noclose) {
			noclose = false;
			$input.focus();
		}
		else self.hide();
	});
	util.addEvent($input, 'keyup', function (event) {
		self.setSelected(this.value);
	});
	
	self.subscribe('change', function () {
		$input.value = self.getSelected();
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
			pos = util.getPosition($input);
		
		style.display = '';
		switch (opts.side) {
			case 'left':
				style.left = (pos.left - util.getWidth($container) + this.settings.offsetLeft) + 'px';
				style.top  = (pos.top + this.settings.offsetTop) + 'px';
				break;
			case 'right':
				style.left = (pos.left + util.getWidth($input)) + 'px';
				style.top  = (pos.top + this.settings.offsetTop) + 'px';
				break;
			case 'top':
				style.left = (pos.left + this.settings.offsetLeft) + 'px';
				style.top  = (pos.top - util.getHeight($container) + this.settings.offsetTop) + 'px';
				break;
			case 'bottom':
				/* falls through */
			default:
				style.left = (pos.left + this.settings.offsetLeft) + 'px';
				style.top  = (pos.top + util.getHeight($input) + this.settings.offsetTop) + 'px';
				break;
		}
		
		style.position = util.isFixed($input) ? 'fixed' : 'absolute';
				
	},
	
	hide : function () {
		this.container.style.display = 'none';
	}
	
});

