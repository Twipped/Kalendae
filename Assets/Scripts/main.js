require.config({ 
	catchError: {
		define: true
	}
});

require(["ErrorHandler/errors"], function (handler) {
	require.onError = handler;
});

require(["kalendae"], function (Kalendae) {

	// Highlight a day the company is closed
	var k1 = new Kalendae(document.body, {
		months:1,
		selected:'2/2/2012',
		mode:'single',
		blackout: function (date) {
			return Kalendae.moment(date).date() % 2; //blackout every other day
		},
		dateClassMap: {
			'2012-02-22':'closed'
		}
	});

	// Display a double calendar with multi-day selection
	var k2 = new Kalendae({
		attachTo:document.body,
		months:2,
		selected:'2/3/2012 - 3/15/2012',
		mode:'range',
		blackout: function (date) {
			return [1,0,0,0,0,0,1][Kalendae.moment(date).day()]; //blackout weekends
		}
	});
	
	// Display a triple calendar with multiple days selected and a formular for blacking out every other week
	var k3 = new Kalendae({
		attachTo:document.body,
		months:3,
		selected:'2/3/2012, 3/15/2012, 4/2/2012',
		mode:'multiple',
		blackout: function (date) {
			return Kalendae.moment(date).format('w') % 2;  //blackout every other week
		},
		direction: 'past'
	});
	
	// This <input> calendar had to be instantiated (the other one was auto-instantiated)
	var k4 = new Kalendae.Input('input1', {
		months:2
	});

});