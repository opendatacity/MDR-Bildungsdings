
function getLinePath(points) {
	var x = [], y = [];
	
	for (var i = 0; i < points.length; i++) {
		x[i] = points[i][0];
		y[i] = points[i][1];
	}
	
	var r = ['M'+x[0]+','+y[0]];
	
	for (var i = 0; i < points.length-1; i++) {
		r.push('L'+x[i+1]+','+y[i+1]);
	}
	
	return r.join('');
} // getLinePath

// Array of all dot-objects: {x, y, node, text}
var lineChartDots = [];
var lineChartDotsDeutschland = [];

function updateHFTab(mapId, num1, num2, unit) {

	//console.log('hochschulen ...');

	var map;
	map = $('#'+mapId).data('map');
	map.clear();

	// generate the data
	var data = {
		'Sachsen': [],
		'Sachsen-Anhalt': [],
		'Thüringen': [],
		'Deutschland': []
	};
	var maxValue = 0;

	$.each(database.hochschulen, function(index, value) {
		var num;
		switch (num2) {
			case '1': num = value[num1]; break;
			case '100': num = value[num1]/100; break;
			default: num = value[num1]/value[num2];
		}
		if (unit == '%') num *= 100;
		data[value.land].push(num);
		if (value.land != 'Deutschland') { // <-- Deutschland disabled
			if (num > maxValue) maxValue = num;
		}
	});


	var maxValueLength = Math.ceil(Math.log(maxValue)/Math.LN10);
	var maxValueFirstDigit = Math.floor(maxValue/Math.pow(10, maxValueLength-1));

	var precision = 0;
	var factor = Math.pow(10, maxValueLength-1);
	var captions;

	switch (maxValueFirstDigit) { // first digit of max
		case 1:
			captions = [2,1.5,1,0.5,0];
			precision = 1;
			break;
		case 2:
			captions = [3,2,1,0];
			break;
		case 3:
			captions = [4,3,2,1,0];
			break;
		case 4:
		case 5:
			captions = [6,4,2,0];
			break;
		case 6:
		case 7:
			captions = [8,6,4,2,0];
			break;
		case 8:
		case 9:
			captions = [10,7.5,5,2.5,0];
			precision = 1;
			break;
	}
	
	maxValue = captions[0]*factor;

	var suffix = '';
	if (maxValueLength > 9) {
		suffix = ' Mrd';
		factor /= 1e9;
	} else if (maxValueLength > 6) {
		suffix = ' Mio'
		factor /= 1e6;
	}
	if (unit != '') suffix += ' ' + unit;

	if (factor > 1) {
		precision = 0;
	} else {
		precision -= Math.floor(Math.log(factor)/Math.LN10);
	}

	for (var i = 0; i < captions.length; i++) {
		if (captions[i] == 0) {
			captions[i] = '0';
		} else {
			captions[i] = formatNumber(captions[i]*factor, precision);
		}
		captions[i] += suffix;
	}


	// legend
	for (var i = 0; i < 11; i++) { // horizontal
		map.path('M'+(i*35+65.5)+' 300.5L'+(i*35+65.5)+' 306.5');
		if (Math.round(i/2) == (i/2)) map.text(i*35+65.5, 317.5, i+2000);
	}
	for (var i = 0; i < captions.length; i++) { // vertical
		map.path('M60.5 '+(Math.round(i*285/(captions.length-1))+15.5)+'L65.5 '+(Math.round(i*285/(captions.length-1))+15.5));
		map.text(57.5, i*285/(captions.length-1) + 15.5, captions[i]).attr({'text-anchor': 'end'});
	}
	map.path('M65.5 300.5L415.5 300.5'); // horizontal line
	map.path('M65.5 15.5L65.5 300.5'); // vertical line

	lineChartDots = [];
	lineChartDotsDeutschland = [];

	// paint the four graphs:
	$.each(data, function(index, value) {
		switch (index) {
			case "Sachsen":        var color = "#219511"; break;
			case "Sachsen-Anhalt": var color = "#B38910"; break;
			case "Thüringen":      var color = "#A10F0B"; break;
			case "Deutschland":    var color = "#000000"; break;
		}

		var graph = [];
		for (var i = 0; i < 11; i++) {
			graph.push([(65+i*35), Math.round(300-(value[i]/maxValue)*285)]);
		}

		if (index!="Deutschland") {
			map.path(getLinePath(graph)).attr({'stroke':color,'stroke-width':2});
		}

		for (var i = 0; i < 11; i++) { // dots
			var dataVar = value[i];
			if (maxValue < 10) {
				dataVar = formatNumber(value[i], 2);
			} else if (maxValue < 100) {
				dataVar = formatNumber(value[i], 1);
			} else {
				dataVar = formatNumber(value[i], 0);
			}

			if (index != "Deutschland") {
				r = map.circle(graph[i][0], graph[i][1], 3);
				r.attr({'fill':color, 'stroke-opacity':0.001, 'stroke-width':3});

				$(r).data('data', dataVar);
				$(r).data('year', i+2000);
			}

			if (index != "Deutschland") {
				var dotDescription = {
					x: graph[i][0],
					y: graph[i][1],
					node: r,
					text:   '<p style="color:'+color+'">'
						    + '<span style="font-weight:bold; margin-right:5px;">'+index+'</span> '+$(r).data('year')+'<br>'
						    + ' &nbsp; &nbsp; ' + $(r).data('data') + ' ' + unit
						    + '</p>'
				}
				lineChartDots.push(dotDescription);
			} else {
				var dotDescription = {
					x: graph[i][0],
					y: 0,
					text:   '<p style="color:'+color+'">'
						    + '<span style="font-weight:bold; margin-right:5px;">'+index+'</span> '+(i+2000)+'<br>'
						    + ' &nbsp; &nbsp; ' + dataVar + ' ' + unit
						    + '</p>'
				}
				lineChartDotsDeutschland.push(dotDescription);
			}
		}
	});
} // updateHFTab


function initDotHover(nodes) {
	$.each(nodes, function (index, nodeName) {
		$(nodeName).mousemove(function (e) {
			var maxR = 5;
			var mapOffset = $(nodeName).offset();
			var x = e.pageX - mapOffset.left;
			var y = e.pageY - mapOffset.top;
			var text = '';
			for (var i = 0; i < lineChartDots.length; i++) {
				var dot = lineChartDots[i];
				r = Math.sqrt(Math.pow(dot.x-x, 2) + Math.pow(dot.y-y, 2));
				if (r < maxR) text += dot.text;
			}
			if (text != '') {
				for (var i = 0; i < lineChartDotsDeutschland.length; i++) {
					var dot = lineChartDotsDeutschland[i];
					r = Math.sqrt(Math.pow(dot.x-x,2));
					if (r < maxR) text += dot.text;
				}

				tooltipIn(text);
			} else {
				tooltipOut();
			}
		})
	});
}

function loadHochschulenTab() {

	// +++ Blendet alle Teiltexte aus +++
	$('#hTxtAll div').css({display:'none'});
	//$('#hTxtAll #hTxt8').css({display:'block'});

	tooltip4Text('#ttBevoelkerungszahl');
	tooltip4Text('#ttStudentenSachsenAnhalt');
	tooltip4Text('#ttStudentenThueringen');
	tooltip4Text('#ttStudentenSachsen');

	tooltip4Text('#ttAbsolventenSachsenAnhalt');
	tooltip4Text('#ttAbsolventenThueringen');
	tooltip4Text('#ttAbsolventenSachsen');

	tooltip4Text('#ttStudentendichteDeutschland');
	tooltip4Text('#ttAbsolventenDeutschland');
	tooltip4Text('#ttGrundmittel1');
	tooltip4Text('#ttGrundmittel2');
	//tooltip4Text('#ttGrundmittel3');
	tooltip4Text('#ttDrittmittel');
	tooltip4Text('#ttBIP1');

	// +++ Texte bei Erst- und Wiedereintritt +++
	var currButtonId,newButtonId,currTxtId,newTxtId
	currButtonId = $('#hValue input[name=hValue]:checked').attr('id');
	currTxtId = currButtonId.replace('Val','Txt');
	$('#'+currTxtId).css({display:'block'});

	//console.log(currButtonId);

	if ($('#hochschulen').data('loaded')) return;

	// +++ Map +++
	$('#hMap').data('map', Raphael($("#hMap")[0], 430, 325));


	// +++ Buttons +++
	$("#hValue div div").buttonset();
	$('#hValue input').change(function() {
		if (!this.checked) return; // should never happen
		var values;
		values = $('#hValue input[name=hValue]:checked').val();
		values = values.split('/');
		updateHFTab('hMap', values[0], values[1], values[2]);

		//Diagrammlegende wird deaktiviert
/*
		$('#hLegend').text(
			$('#hValue label[for='+$('#hValue input:checked').attr('id')+']').attr('title')
		);
*/
		// +++ Texte bei Nutzung der Button +++
		newButtonId = $('#hValue input[name=hValue]:checked').attr('id');
		newTxtId = newButtonId.replace('Val','Txt');
		$('#'+currTxtId).fadeOut('fast',function(){
			$('#'+newTxtId).fadeIn('fast');		
		});
		currTxtId = newTxtId;
	});

	$('#hVal1').attr('checked',true).button("refresh");
	updateHFTab('hMap', 'stud', '1', '');
	$('#hochschulen').data('loaded', true);

//Diagrammlegende wird deaktiviert
/*
	$('#hLegend').text(
		$('#hValue label[for='+$('#hValue input:checked').attr('id')+']').attr('title')
	);
*/

} // loadHochschulenTab


function loadArbeitsmarktTab() {

	// +++ Blendet alle Teiltexte aus +++
	$('#fTxtAll div').css({display:'none'});

	tooltip4Text('#ttBIP2');
	tooltip4Text('#ttBevoelkerungsschwund');
	tooltip4Text('#ttErwerbstaetigeInFuE');

	var qBfa = 'Bundesagentur für Arbeit'; 
	var qStatAmt = 'Statistische Ämter des Bundes und der Länder Sachsen, Sachsen-Anhalt und Thüringen';

	// +++ Texte bei Erst- und Wiedereintritt +++
	var currButtonId,newButtonId,currTxtId,newTxtId
	currButtonId = $('#fValue input[name=fValue]:checked').attr('id');
	currTxtId = currButtonId.replace('Val','Txt');
	$('#'+currTxtId).css({display:'block'});

	// +++ Quellenangabe bei Erst- und Wiedereintritt +++
	if(currButtonId == 'fVal1' || currButtonId == 'fVal2' || currButtonId == 'fVal5' || currButtonId == 'fVal4') {$('#aQuelle').text(qBfa)};
	if(currButtonId == 'fVal7' || currButtonId == 'fVal8') {$('#aQuelle').text(qStatAmt)};

	//console.log(currButtonId);

	if ($('#arbeitsmarkt').data('loaded')) return;

	// +++ Map +++
	$('#fMap').data('map',Raphael($("#fMap")[0], 430, 325));

	// +++ Buttons +++
	$("#fValue div div").buttonset();
	$('#fValue input').change(function() {
		if (!this.checked) return; // should never happen

		var values;
		values = $('#fValue input[name=fValue]:checked').val();
		values = values.split('/');
		updateHFTab('fMap', values[0], values[1], values[2]);

/*
		$('#fLegend').text(
			$('#fValue label[for='+$('#fValue input:checked').attr('id')+']').attr('title')
		);
*/
		// +++ Texte bei Nutzung der Button +++
		newButtonId = $('#fValue input[name=fValue]:checked').attr('id');
		newTxtId = newButtonId.replace('Val','Txt');
		$('#'+currTxtId).fadeOut('fast',function(){
			$('#'+newTxtId).fadeIn('fast');		
		});
		currTxtId = newTxtId;

		// +++ Quellenangabe bei Nutzung der Button +++
		if(newButtonId == 'fVal1' || newButtonId == 'fVal2' || newButtonId == 'fVal5' || newButtonId == 'fVal4') {$('#aQuelle').text(qBfa)};
		if(newButtonId == 'fVal7' || newButtonId == 'fVal8') {$('#aQuelle').text(qStatAmt)};

	});

	$('#fVal1').attr('checked',true).button("refresh");
	updateHFTab('fMap', 'svpb', '1', '');
	$('#arbeitsmarkt').data('loaded', true);
/*
	$('#fLegend').text(
		$('#fValue label[for='+$('#fValue input:checked').attr('id')+']').attr('title')
	);
*/

} // loadArbeitsmarktTab
