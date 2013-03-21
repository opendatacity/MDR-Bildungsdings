function tooltipIn(text, color) {
	if (color === undefined) var color='#555'; // border color
	$('#tooltip')
		.html(text)
		.stop(true, false)
		.css({display:'block'/*,
			'border-color':color,
			'-moz-box-shadow':'1px 1px 5px '+color,
			'-webkit-box-shadow':'1px 1px 5px '+color,
			'box-shadow':'1px 1px 5px '+color*/
			})
		.animate({opacity:1}, 200);
}
function tooltipOut() {
	$('#tooltip')
		.stop(true, false)
		.animate({opacity:0}, 200)
		.promise().done(function () {	$('#tooltip').css({display:'none'})	});
}


// function to format a number with separators. returns formatted number.
// num - the number to be formatted
// decpoint - the decimal point character. if skipped, "." is used
// thousandSep - the separator character. if skipped, "," is used
function formatNumber(num, precision, decpoint, thousandSep) {
	if (decpoint === undefined) decpoint = ',';
	if (thousandSep === undefined) thousandSep = '.';

	var parts = num.toFixed(precision).split('.');
	var s0 = parts[0];
	var s = '';
	while (s0.length > 3) {
		s += thousandSep + s0.substr(s0.length-3);
		s0 = s0.substr(0, s0.length-3);
	}
	s = s0 + s;
	if (parts.length > 1) s += decpoint + parts[1];
	return s;
} // formatNumber



function loadTabContent() { // Put content of active tab in DOM on tab change
	var activeTab = $('#tabs ul li.ui-state-active a').attr('href');
	activeTab = activeTab.substring(1);

	switch (activeTab) {
		case 'schueler': loadSchuelerTab(); break;
		case 'abiturienten': loadAbiturientenTab(); break;
		case 'studienanfaenger': loadStudienanfaengerTab(); break;
		case 'hochschulen': loadHochschulenTab(); break;
		case 'wanderung': loadWanderungTab(); break;
		case 'finanzen': loadFinanzenTab(); break;
		default:console.log("Could not find tab");
	}
} // loadTabContent


$(function() {
	// ### Read parameters and start page ###

	var startTab = window.location.hash.substring(0,window.location.hash.length-2);
	// strip leading # characters:
	while (startTab.charAt(0)=='#')
		startTab=startTab.substring(1);
	// map given hash to default tab:
	switch (startTab) {
		case 'schueler':     startTab = 0; break;
		case 'abiturienten': startTab = 1; break;
		case 'studienanfaenger': startTab = 2; break;
		case 'hochschulen':  startTab = 3; break;
		case 'wanderung':    startTab = 4; break;
		case 'finanzen':     startTab = 5; break;
		default:startTab='schueler';
	}
	var showNavi = window.location.hash.substr(window.location.hash.length-1,1);
	switch (showNavi) {
		case '1': showNavi = 1; break;
		case '0': showNavi = 0; break;
		default:  showNavi = 1;
	}
	$("#tabs").tabs({
		selected:startTab,
		'heightStyle':'fill',
		activate: function( event, ui ) {
			loadTabContent();
		}
	});
	if (!showNavi) $('#tabs ul').hide();


	$('#sMap,#hMap,#aMap,#wMap,#fMap,#tMap').mousemove(function (e) {
		$('#tooltip').css({
			left:(e.pageX+10)+"px",
			top: (e.pageY+10)+"px"
		});
	});
	
	initDotHover(['#hMap','#fMap']);

	loadTabContent();
});
