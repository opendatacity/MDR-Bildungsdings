function getSplinePath(points) {
	function computeControlPoints(K) {
		var p1 = new Array();
		var p2 = new Array();
		var n = K.length-1;

		var a = [0];
		var b = [2];
		var c = [1];
		var r = [K[0]+2*K[1]];
		
		for (var i = 1; i < n - 1; i++) {
			a[i] = 1;
			b[i] = 4;
			c[i] = 1;
			r[i] = 4 * K[i] + 2 * K[i+1];
		}
				
		a[n-1] = 2;
		b[n-1] = 7;
		c[n-1] = 0;
		r[n-1] = 8*K[n-1]+K[n];
		
		for (var i = 1; i < n; i++) {
			m = a[i]/b[i-1];
			b[i] = b[i] - m * c[i-1];
			r[i] = r[i] - m * r[i-1];
		}
	 
		p1[n-1] = r[n-1]/b[n-1];
		
		for (var i = n - 2; i >= 0; --i) p1[i] = (r[i] - c[i] * p1[i+1]) / b[i];
			
		for (var i = 0; i < n-1; i++) p2[i] = 2*K[i+1] - p1[i+1];
		
		p2[n-1] = 0.5*(K[n]+p1[n-1]);
		
		return {p1:p1, p2:p2};
	}
	
	var x = [], y = [];
	
	for (var i = 0; i < points.length; i++) {
		x[i] = points[i][0];
		y[i] = points[i][1];
	}
	
	px = computeControlPoints(x);
	py = computeControlPoints(y);
	
	var r = ['M'+x[0]+','+y[0]];
	
	for (var i = 0; i < points.length-1; i++) {
		r.push('C'+px.p1[i]+','+py.p1[i]+','+px.p2[i]+','+py.p2[i]+','+x[i+1]+','+y[i+1]);
	}
	
	return r.join('');
} // getSplinePath

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

function updateHFTab(mapId, num1, num2, unit) {
	var map;
	map = $('#'+mapId).data('map');
	map.clear();

	// generate the data
	var data = {
//		'MDR-Land': [], // <-- MDR disabled
		'Sachsen': [],
		'Sachsen-Anhalt': [],
		'Thüringen': []
	};
	var maxPermill = 0;
	var maxPermillStringLength = 0;

	$.each(database.hochschulen, function(index, value) {
		if (num2=='1') var num = value[num1];
			else var num = value[num1]/value[num2];
		if (value.land!="MDR-Land") { // <-- MDR disabled
			data[value.land].push(num);
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
		if (((maxPermill.toString()[0] > 2) && (maxPermillStringLength > 12)) || (maxPermillStringLength > 13)) { // Billions
			caption[i] = (caption[i] * Math.pow(10, maxPermillStringLength - 13));
			caption[i] = formatNumber(caption[i], 0);
			caption[i] = caption[i] + ' Mrd';
		} else if (((maxPermill.toString()[0] > 2) && (maxPermillStringLength > 9)) || (maxPermillStringLength > 10)) { // Millions
			caption[i] = (caption[i] * Math.pow(10, maxPermillStringLength - 10));
			caption[i] = formatNumber(caption[i], 0);
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

	// paint the four graphs:
	$.each(data, function(index, value) {
		var graph = [];
		for (var i = 0; i < 11; i++) {
			graph.push([(65+i*35), Math.round(300-(value[i]/maxPermill*1000)*285)]);
		}
		switch (index) {
			case "Sachsen":        var color = "#219511"; break;
			case "Sachsen-Anhalt": var color = "#B38910"; break;
			case "Thüringen":      var color = "#A10F0B"; break;
			case "MDR-Land":       var color = "#000000"; break;
		}
		map.path(getLinePath(graph)).attr({'stroke':color,'stroke-width':2});

		for (var i = 0; i < 11; i++) { // dots
			r = map.circle(graph[i][0], graph[i][1], 3);
			
			r.attr({'fill':color, 'stroke-opacity':0.001, 'stroke-width':3});

			if (maxPermillStringLength > 4) // 21.452
				$(r).data('data', formatNumber(value[i], 0) );
			else if (maxPermillStringLength > 2) // 26,7
				$(r).data('data', formatNumber(value[i]*100, 1));
			else // 3,24
				$(r).data('data', formatNumber(value[i]*100, 2));

			$(r).data('year', i+2000);

			
			lineChartDots.push({
				x: graph[i][0],
				y: graph[i][1],
				node: r,
				text:   '<p style="color:'+color+'">'
				      + '<span style="font-weight:bold; margin-right:5px;">'+index+'</span> '+$(r).data('year')+'<br>'
				      + ' &nbsp; &nbsp; ' + $(r).data('data') + ' ' + unit
				      + '</p>'
			});
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
				tooltipIn(text);
			} else {
				tooltipOut();
			}
		})
	});
}

function loadHochschulenTab() {
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
		$('#hLegend').text(
			$('#hValue label[for='+$('#hValue input:checked').attr('id')+']').attr('title')
		);
	});

	$('#hVal1').attr('checked',true).button("refresh");
	updateHFTab('hMap', 'ausg', 'stud', '€');
	$('#hochschulen').data('loaded', true);
	$('#hLegend').text(
		$('#hValue label[for='+$('#hValue input:checked').attr('id')+']').attr('title')
	);
} // loadHochschulenTab






function loadFinanzenTab() {
	if ($('#finanzen').data('loaded')) return;
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
		$('#fLegend').text(
			$('#fValue label[for='+$('#fValue input:checked').attr('id')+']').attr('title')
		);
	});

	$('#fVal1').attr('checked',true).button("refresh");
	updateHFTab('fMap', 'bip', 'ew', '€');
	$('#finanzen').data('loaded', true);
	$('#fLegend').text(
		$('#fValue label[for='+$('#fValue input:checked').attr('id')+']').attr('title')
	);
} // loadFinanzenTab
