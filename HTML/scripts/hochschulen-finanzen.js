
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
	var maxPermill = 0;
	var maxPermillStringLength = 0;

	$.each(database.hochschulen, function(index, value) {
		if (num2=='1') var num = value[num1];
			else var num = value[num1]/value[num2];
			data[value.land].push(num);
		if (value.land!="Deutschland") { // <-- Deutschland disabled
			if (num*1000 > maxPermill) maxPermill = num*1000;
		}
	});


	maxPermill = Math.floor(maxPermill);
	maxPermillStringLength = maxPermill.toString().length;

	var precision = 0;

	switch (maxPermill.toString()[0]) { // first digit of max
		case '1':
			var caption = [2,1.5,1,0.5,0];
			maxPermill = 2*Math.pow(10, maxPermillStringLength-1);
			precision = 1;
			break;
		case '2':
			var caption = [3,2,1,0];
			maxPermill = 3*Math.pow(10, maxPermillStringLength-1);
			break;
		case '3':
			var caption = [4,3,2,1,0];
			maxPermill = 4*Math.pow(10, maxPermillStringLength-1);
			break;
		case '4':
		case '5':
			var caption = [6,4,2,0];
			maxPermill = 6*Math.pow(10, maxPermillStringLength-1);
			break;
		case '6':
		case '7':
			var caption = [8,6,4,2,0];
			maxPermill = 8*Math.pow(10, maxPermillStringLength-1);
			break;
		case '8':
		case '9':
			var caption = [10,7.5,5,2.5,0];
			maxPermill = 1*Math.pow(10, maxPermillStringLength);
			precision = 1;
			break;
	}

	for (var i = 0; i < caption.length; i++) {
		if (caption[i] == 0) precision = 0; // last value always 0 and not 0,0
		if (((maxPermill.toString()[0] > 2) && (maxPermillStringLength > 12)) || (maxPermillStringLength > 12)) { // Billions
			caption[i] = (caption[i] * Math.pow(10, maxPermillStringLength - 13));
			caption[i] = formatNumber(caption[i], 1);
			caption[i] = caption[i] + ' Mrd';
		} else if (((maxPermill.toString()[0] > 2) && (maxPermillStringLength > 9)) || (maxPermillStringLength > 9)) { // Millions
			caption[i] = (caption[i] * Math.pow(10, maxPermillStringLength - 10));
			caption[i] = formatNumber(caption[i], (maxPermill.toString()[0] > 2 ? 0 : 1));
			caption[i] = caption[i]+' Mio';
		} else if (((maxPermill.toString()[0] > 2) && (maxPermillStringLength > 5)) || (maxPermillStringLength > 6)) { // Hundreds
			caption[i] = (caption[i] * Math.pow(10, maxPermillStringLength - 4));
			caption[i] = formatNumber(caption[i], 0);
		} else if (((maxPermill.toString()[0] > 2) && (maxPermillStringLength > 3)) || (maxPermillStringLength > 4)) { // 1
			caption[i] = (caption[i] * Math.pow(10, maxPermillStringLength - 4));
			caption[i] = formatNumber(caption[i], precision);
		} else if (((maxPermill.toString()[0] > 2) && (maxPermillStringLength > 1)) || (maxPermillStringLength > 2)) { // Permill
			caption[i] = (caption[i] * Math.pow(10, maxPermillStringLength - 2));
			caption[i] = formatNumber(caption[i], precision);
			caption[i] = caption[i];
		} else {
			if (i == 0 && maxPermillStringLength == 1) precision++;
			caption[i] = (caption[i]*Math.pow(10, maxPermillStringLength - 2));
			caption[i] = formatNumber(caption[i], precision);
			caption[i] = caption[i];
		}
		caption[i] += ' ' + unit;
	}


	// legend
	for (var i = 0; i < 11; i++) { // horizontal
		map.path('M'+(i*35+65.5)+' 300.5L'+(i*35+65.5)+' 306.5');
		if (Math.round(i/2) == (i/2)) map.text(i*35+65.5, 317.5, i+2000);
	}
	for (var i = 0; i < caption.length; i++) { // vertical
		map.path('M60.5 '+(Math.round(i*285/(caption.length-1))+15.5)+'L65.5 '+(Math.round(i*285/(caption.length-1))+15.5));
		map.text(57.5, i*285/(caption.length-1) + 15.5, caption[i]).attr({'text-anchor': 'end'});
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
			graph.push([(65+i*35), Math.round(300-(value[i]/maxPermill*1000)*285)]);
		}

		if (index!="Deutschland") {
			map.path(getLinePath(graph)).attr({'stroke':color,'stroke-width':2});
		}

		for (var i = 0; i < 11; i++) { // dots
			if (maxPermillStringLength > 4) // 21.452
				var dataVar = formatNumber(value[i], 0);
			else if (maxPermillStringLength > 2) // 26,7
				var dataVar = formatNumber(value[i]*100, 1);
			else // 3,24
				var dataVar = formatNumber(value[i]*100, 2);

			if (index!="Deutschland") {
				r = map.circle(graph[i][0], graph[i][1], 3);
				r.attr({'fill':color, 'stroke-opacity':0.001, 'stroke-width':3});

				$(r).data('data', dataVar);
				$(r).data('year', i+2000);
			}

			if (index!="Deutschland") {
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
