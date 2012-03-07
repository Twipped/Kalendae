
//auto-initializaiton code
Kalendae.util.domReady(function () {
	var els = util.$$('.auto-kal'),
		i = els.length,
		e;

	while (i--) {
		e = els[i];
		if (e.tagName === 'INPUT') {
			//if element is an input, bind a popup calendar to the input.
			new Kalendae.Input(e);
		} else {
			//otherwise, insert a flat calendar into the element.
			new Kalendae({attachTo:e});
		}
		
	}
});
