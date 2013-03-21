function number2Percent(v) {
	return (v*100).toFixed(1).replace(/\./g, ',')+' %';
}

function value2color(value, gradient) { // 	Convert value 0..1 to HTML color string
	gradient = gradient || [[255,255,255],[65,132,210]];

	if (value < 0) value = 0;
	if (value > 1) value = 1;
	
	value = value*(gradient.length-1);
	var index = Math.floor(value);
	
	if (index > (gradient.length-2)) index = gradient.length-2;
	value = value-index;
	
	var r = gradient[index][0]*(1-value) + gradient[index+1][0]*value;
	var g = gradient[index][1]*(1-value) + gradient[index+1][1]*value;
	var b = gradient[index][2]*(1-value) + gradient[index+1][2]*value;

	return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')';
} // value2color



function regionid2region(regionid) { // convert region code to path
	for (var i = 0; i < regions.length; i++) {
		if (regionid == regions[i].id) { // match found
			return regions[i];
		}
	}
}


/*function paintLegend(map, maximum, steps, gradient) {
	r = map.rect(330, 330, 25, 150);

	for (var i=1; i>0; i-=0.01) {
		r = map.rect(330, 480-i*150, 25, 1);
		r.attr("fill", value2color(i, gradient));
		r.attr("stroke", value2color(i, gradient));
	}

	for (var i=1; i>-0.1; i-=1/(steps-1)) {
		if (maximum < 10000) var x = 318;
			else var x = 305;
		if (Math.round(maximum*i)==0) x=318;
		map.text(x, 480-i*150, Math.round(maximum*i));
	}
}*/
function paintLegend(map, maximum, steps, gradient) {
	r = map.rect(330, 330, 25, 150);

	for (var i=1; i>0; i-=0.01) {
		r = map.rect(330, 480-i*150, 25, 1);
		r.attr("fill", value2color(i, gradient));
		r.attr("stroke", value2color(i, gradient));
	}

	var legendText={};
	for (var i=1; i>-0.1; i-=1/(steps-1)) {
		if (maximum < 10000) var x = 318;
			else var x = 305;
		if (Math.round(maximum*i)==0) x=318;
		legendText[Math.round(maximum*i)]=map.text(x, 480-i*150, Math.round(maximum*i));
	}
	$('#tabs').data('legendText',legendText);
}

/*function updateSchuelerTab(wettbewerb) {
	var r;
	var map;
	map = $('#sMap').data('map');

	$.each(database.schueler, function (index, schueler) { // iterate regions
		r = $('#sMap').data(schueler.regionId);

		if (schueler.regionId != "000000000000") { // not whole Schland
			// fill region:
			if (wettbewerb=="Mathe") {
				r.attr({
					fill: value2color(schueler.mathe/60)
				});
			} else {
				r.attr({
					fill: value2color(schueler.jufo/60)
				});
			}
			
			if (wettbewerb=="Mathe") {
				$(r).data("rel",schueler.mathe);
			} else {
				$(r).data("rel",schueler.jufo);
			}
		}
	});

} // updateSchuelerTab
*/

function updateSchuelerTab(wettbewerb) {
	var r;
	var map;
	map = $('#sMap').data('map');

	$.each(database.schueler, function (index, schueler) { // iterate regions
		r = $('#sMap').data(schueler.regionId);

		if (schueler.regionId != "000000000000") { // not whole Schland
			// fill region:
			if (wettbewerb=="Mathe") {
				r.attr({
					fill: value2color(schueler.matoly/150)
				});
				$(r).data("rel",schueler.matoly);
			} else {
				r.attr({
					fill: value2color(schueler.jufo/30)
				});
				$(r).data("rel",schueler.jufo);

			}
		}
	});
	if (wettbewerb=="Mathe") {
		$('#tabs').data('legendText')[1].attr('text',"50");
		$('#tabs').data('legendText')[2].attr('text',"100");
		$('#tabs').data('legendText')[3].attr('text',"150");
	} else {
		$('#tabs').data('legendText')[1].attr('text',"10");
		$('#tabs').data('legendText')[2].attr('text',"20");
		$('#tabs').data('legendText')[3].attr('text',"30");
	}

} // updateSchuelerTab

function loadSchuelerTab() {

	tooltip4Text('#ttIntMatheOlympiade');
	tooltip4Text('#ttJugendForscht');

	var qMathe = 'Mathematik-Olympiaden e.V.'; 
	var qJugend = 'Stiftung Jugend forscht e.V.';

	// +++ Blendet alle Teiltexte aus +++
	$('#schuelerTxtAll div').css({display:'none'});

	// +++ Texte bei Erst- und Wiedereintritt +++
	var currButtonId,newButtonId,currTxtId,newTxtId
	currButtonId = $('#matheJugendForscht input[name=radio]:checked').attr('id');
	switch(currButtonId){
		case 'sMathe': 
		currTxtId = 'schuelerTxtMathe'; 
		$('#schuelerQuelle').text(qMathe);
		break

		case 'sJugend': 
		currTxtId = 'schuelerTxtJugend'; 
		$('#schuelerQuelle').text(qJugend);
		break
	}
	$('#'+currTxtId).css({display:'block'});



	if ($('#schueler').data('loaded')) return;

	var map = Raphael($("#sMap")[0], 360, 500);
	
	$('#sMap').data('map', map);
	
	$.each(database.schueler,function(index, schueler) { // iterate regions
		region = regionid2region(schueler.regionId);
		// paint region
		
		if (schueler.regionId != "000000000000") { // not whole Schland
			r = map.path(region.path).attr({stroke:'none'});

			$('#sMap').data(schueler.regionId, r);
			$(r).data('name', region.name);

			r.hover(function(e) { // in
				tooltipIn('<h1>'+$(this).data("name")+'</h1>'+
					'<p>'+Math.round($(this).data("rel"))+' Gewinner</p>');
			},function() { // out
				tooltipOut();
			});
		}
	});


	// Draw borders
	$.each(database.schueler, function(index, schueler) { // iterate regions
		if (true) { // new region
			region = regionid2region(schueler.regionId);
			if (schueler.regionId == '000000000000') { // DLand or BLand
				map.path(region.path).attr({'stroke-width': 1, 'stroke-opacity': '0.3'});
			} else {
				map.path(region.path).attr({'stroke-width': 1, 'stroke-opacity': '0.2'});
			}
		}
	});
	
	/*// legend
	paintLegend(map,60,4);

	// +++ Radio Buttons +++
	$("#schueler form div div").buttonset();*/

	paintLegend(map,3,4);

	// +++ Radio Buttons +++
	$("#schueler #sMathe").attr('checked','checked');
	$("#schueler form div div").buttonset();

	
	$('#schueler input').change(function(){
		if (this.checked)
			if ($(this).attr('id') == 'sJugend')
				updateSchuelerTab('Jugend');
				else updateSchuelerTab('Mathe');

			// +++ Texte bei Nutzung der Button +++
			currButtonId = $('#matheJugendForscht input[name=radio]:checked').attr('id');
			switch(currButtonId){
				case 'sMathe': 
				newTxtId = 'schuelerTxtMathe'; 
				$('#schuelerQuelle').text(qMathe);
				break

				case 'sJugend': 
				newTxtId = 'schuelerTxtJugend'; 
				$('#schuelerQuelle').text(qJugend);
				break
			}
			$('#'+currTxtId).fadeOut('fast',function(){
				$('#'+newTxtId).fadeIn('fast');		
			});
			currTxtId = newTxtId;
	});

	updateSchuelerTab('Mathe');
	$('#schueler').data('loaded',true);

} // loadSchuelerTab

// ##################### Abiturienten ###############

function updateAbiturientenTabMap() {
	var brdmdr;
	brdmdr = $('#aBrdmdr input:checked').val();

	var map;
	if (brdmdr=='brd') { // BRD
		$('#aMdrMap').hide();
		$('#aMap').show();
		map = $('#aMap').data('map');
	} else {
		$('#aMap').hide();
		$('#aMdrMap').show();
		map = $('#aMdrMap').data('map');
	}
	var year;
	year = $('#aBigYear').data('year');

	$.each(database.abiturienten2,function(index,abiturienten) { // iterate regions
		// if (!abiturienten) return;
		if (abiturienten.regionId=='00000') { // BRD
			$('#abiturienten').data('brd',abiturienten[year]);
		}

		if (brdmdr=='brd') { // BRD
			if (typeof abiturienten['r'] == 'undefined') return;
			r = abiturienten['r'];
		} else {
			if (typeof abiturienten['rMdr'] == 'undefined') return;
			r = abiturienten['rMdr'];
		}

		if(abiturienten[year]===undefined) {
			r.hide();
			return;
		}

		if (abiturienten.regionId=='00000') { // BRD
		} else if (abiturienten.regionId.substr(2,3) == '000') { // Land
			$('#aMap').data('land'+abiturienten.regionId.substring(0,2),abiturienten[year]);
			$('#aMdrMap').data('land'+abiturienten.regionId.substring(0,2),abiturienten[year]);
		}


		if (brdmdr=='brd') { // show BRD without regions of MDR-Region
			if (!$(r).data('regionId')) { // Land or BRD
				r.attr({'stroke-width': 1, 'stroke-opacity': '0.2', 'stroke': '#000'});
			} else { // Region
				r.hide();
				return;
			}
		} else { // show regions of MDR-Region
			if (abiturienten.regionId=='00000') { // BRD
				r.attr({'stroke-width': 1, 'stroke-opacity': '0.2', 'stroke': '#000'});
			} else if (!$(r).data('regionId')) { // Land
				if ($(r).data('mdrland')) {
					r.attr({'stroke-width': 1, 'stroke-opacity': '0.2', 'stroke': '#000'});
				} else {
					r.hide();
					return;
				}
			} else { // Region
				r.attr({'stroke-width': 1, 'stroke-opacity': '0.1', 'stroke': '#000'});
			}
		}

		r.show();
		if ((abiturienten.regionId!='00000') && !(($(r).data('mdrland')) && (brdmdr=='mdr'))) {
			r.attr({
				fill: value2color(abiturienten[year]/0.6)
			});
		} else if ((abiturienten.regionId=='00000') && (brdmdr=='mdr')) {
			r.attr({
				fill: value2color(abiturienten[year]/0.6)
			}); // Sloooooooow.
		} else {
			r.attr({
				fill: 'none'
			});
		}
		$(r).data("quote",abiturienten[year]);
	});
} // updateAbiturientenTabMap

function updateAbiturientenTabYear(year) {
	// +++ update Buttons +++
	year = parseInt(year);
	$('#aButtonsYear').text(year);
	if (year>2000) {
		$('#aButtonsYearPrev').text(year-1);
		$('#aButtonsYearPrev').data('year',year-1);
		$('#aButtonsPrev').data('year',year-1);
		$('#aButtonsPrev').removeAttr("disabled");
	} else {
		$('#aButtonsYearPrev').text('');
		$('#aButtonsYearPrev').data('year',0);
		$('#aButtonsPrev').data('year',0);
		$('#aButtonsPrev').attr("disabled", "disabled");
	}
	if (year<2010) {
		$('#aButtonsYearNext').text(year+1);
		$('#aButtonsYearNext').data('year',year+1);
		$('#aButtonsNext').data('year',year+1);
		$('#aButtonsNext').removeAttr("disabled");
	} else {
		$('#aButtonsYearNext').text('');
		$('#aButtonsYearNext').data('year',0);
		$('#aButtonsNext').data('year',0);
		$('#aButtonsNext').attr("disabled", "disabled");
	}

	$('#aBigYear').data('year',year).html(year);

	updateAbiturientenTabMap();
	// console.log(year);
} // updateAbiturientenTabYear

function loadAbiturientenTab() {

	tooltip4Text('#ttDoppelterAbiJahrgang');

	// +++ Blendet alle Teiltexte aus +++
	$('#abiTxtAll div').css({display:'none'});

	// +++ Texte bei Erst- und Wiedereintritt +++
	var currButtonId,newButtonId,currTxtId,newTxtId
	currButtonId = $('#aBrdmdr input[name=brdmdr]:checked').attr('id');
	switch(currButtonId){
		case 'aBrdmdrBrd': currTxtId = 'abiTxtBRD'; break
		case 'aBrdmdrMdr': currTxtId = 'abiTxtMDR'; break
	}
	$('#'+currTxtId).css({display:'block'});

	if ($('#abiturienten').data('loaded')) return;

	// +++ Map +++
	var map = Raphael($("#aMap")[0], 360, 500);
	var mapMdr = Raphael($("#aMdrMap")[0], 360, 500);

	var region;

	$('#aMap').data('map',map);
	$('#aMdrMap').data('map',mapMdr);
	

	// convert abiturienten table to new table
	database['abiturienten2'] = {};
	
	$.each(database.abiturienten, function(index, abiturienten) { // iterate regions
		if (!abiturienten) return;
		if (database.abiturienten2[abiturienten.region] === undefined) { // new region
			region = regionid2region(abiturienten.region+'0000000');
			if (!region) { // region missing in geo.js
				// console.log('Region '+index+'0000000'+' missing in geo.js!');
				return;
			}


			if (abiturienten.region.substr(2,3) != '000') { // Region
				rMdr = mapMdr.path(region.path).attr({'stroke': 'none'});
				rMdr.scale(1.7,1.7,360,240);
				$(rMdr).data('regionId', abiturienten.region);
			}
			if ((abiturienten.region!='00000') &&
				(abiturienten.region.substr(2,3) == '000')) { // Land
				r = map.path(region.path).attr({'stroke': 'none'});
				rMdr = mapMdr.path(region.path).attr({'stroke': 'none'});
				rMdr.scale(1.7,1.7,360,240);
				$('#aMap').data('land'+abiturienten.region.substring(0,2)+'name',region.name);
				$('#aMdrMap').data('land'+abiturienten.region.substring(0,2)+'name',region.name);
			}
			if (abiturienten.region=='00000') { // Bundesrepublik
				r = map.path(region.path).attr({'stroke': 'none'});
			}

			// add region/land/brd to abiturienten2
			database.abiturienten2[abiturienten.region] = {
				regionId: abiturienten.region
			};
			if (typeof r!='undefined') {
				database.abiturienten2[abiturienten.region]['r'] = r;
				$(r).data('name', region.name);
				$(r).data('mdrland', abiturienten.mdrland);
				r.hover(
					function(e) { // in
						if ($(this).data('name') == 'Bundesrepublik Deutschland') {
						var tooltipText = '<table><tr>'
							+ '<td style="font-weight:bold;">Deutschland</td>'
							+ '<td>' + number2Percent($('#aMap').data('brd')) + '</td></tr></table>';
							tooltipIn(tooltipText);
							return;
						}

						var tooltipText='';
						// region's data:
						tooltipText += '<table><tr>'
							+ '<td style="font-weight:bold;">' + $(this).data("name") + '</td>'
							+ '<td>' + number2Percent($(this).data('quote')) + '</td></tr>';

						// Bundesrepublik:
						tooltipText += '<tr><td>Deutschland</td>'
							+ '<td>' + number2Percent($('#abiturienten').data('brd')) + '</td></tr></table>';
						if ((!$(this).data('mdrland')) || ($('#aBrdmdr input:checked').val()=='brd')) 					{
							tooltipIn(tooltipText);
						}
					},
					function() { // out
						tooltipOut();
					}
				);
			}
			if (typeof rMdr!='undefined') {
				database.abiturienten2[abiturienten.region]['rMdr'] = rMdr;
				$(rMdr).data('name', region.name);
				$(rMdr).data('mdrland', abiturienten.mdrland);

				rMdr.hover(
					function(e) { // in
						if ($(this).data('name') == 'Bundesrepublik Deutschland') {
						var tooltipText = '<table><tr>'
							+ '<td style="font-weight:bold;">Deutschland</td>'
							+ '<td>' + number2Percent($('#aMdrMap').data('brd')) + '</td></tr></table>';
							tooltipIn(tooltipText);
							return;
						}

						var tooltipText='';
						// region's data:
						tooltipText += '<table><tr>'
							+ '<td style="font-weight:bold;">' + $(this).data("name") + '</td>'
							+ '<td>' + number2Percent($(this).data('quote')) + '</td></tr>';
						if ($(this).data('regionId')) { // This is a small region of a Bundesland
							// identifier for the region's id and name in data object:
							var id = 'land'+$(this).data('regionId').substring(0,2);
							tooltipText += '<tr><td>'+$('#aMdrMap').data(id+'name')+'</td>'
								+ '<td>' + number2Percent($('#aMdrMap').data(id)) + '</td></tr>';
						}
						// Bundesrepublik:
						tooltipText += '<tr><td>Deutschland</td>'
							+ '<td>' + number2Percent($('#abiturienten').data('brd')) + '</td></tr></table>';
						if ((!$(this).data('mdrland')) || ($('#aBrdmdr input:checked').val()=='brd')) {
							tooltipIn(tooltipText);
						}
					},
					function() { // out
						tooltipOut();
					}
				);

			}
		}
		// Add quote to region
		database.abiturienten2[abiturienten.region][abiturienten.jahr] = abiturienten.quote;
	});

	// legend
	paintLegend(map, 60, 4);
	paintLegend(mapMdr, 60, 4);

	$("#aBrdmdr div").buttonset();
	$('#aBrdmdr input').change(function(){
		if (this.checked) {
			if ($('#aBrdmdr input:checked').val()=='brd') { // BRD
			} else { // MDR
			}
			updateAbiturientenTabMap();

			// +++ Texte bei Nutzung der Button +++
			currButtonId = $('#aBrdmdr input[name=brdmdr]:checked').attr('id');
			switch(currButtonId){
				case 'aBrdmdrBrd': newTxtId = 'abiTxtBRD'; break
				case 'aBrdmdrMdr': newTxtId = 'abiTxtMDR'; break
			}
			$('#'+currTxtId).fadeOut('fast',function(){
				$('#'+newTxtId).fadeIn('fast');		
			});
			currTxtId = newTxtId;
		}
	});

	// detect touch device:
	if (!!('ontouchstart' in window))
		var touch=true;
		else var touch=false;

	// +++ Buttons +++
	if (touch) {
		$('#aSlider').hide();
		$('#aMap').data('year',2000);
		$('#aMdrMap').data('year',2000);
		$("#aButtonsYearNext, #aButtonsYearPrev").click(function(){
			if ($(this).data('year')) {
				updateAbiturientenTabYear($(this).data('year'));
			}
		});

		var timeout;
		$('#aButtonsNext, #aButtonsPrev').mousedown(function(){
			if ($(this).data('year')) {
				updateAbiturientenTabYear($(this).data('year'));
			}
			var button=$(this).attr('id');
			timeout = setInterval(function(){
				if ($('#'+button).data('year')) {
					updateAbiturientenTabYear($('#'+button).data('year'));
				} else {
					clearInterval(timeout);
				}
			}, 500);
			return false;
		});
		$('#aButtonsNext, #aButtonsPrev').mouseup(function () {
			clearInterval(timeout);
			return false;
		});
		$('#aButtonsNext, #aButtonsPrev').mouseout(function () {
			clearInterval(timeout);
			return false;
		});
	}


	// +++ Slider +++
	if (!touch) {
		$('#aButtons').hide();
		$( "#aSliderSlider" ).slider({
			value:2000,
			min: 2000,
			max: 2010,
			step: 1,
			slide: function( event, ui ) {
				updateAbiturientenTabYear(ui.value);
			}
		});
	}

	updateAbiturientenTabYear('2000');

	$('#abiturienten').data('loaded',true);
} // loadAbiturientenTab



// ##################### Studienanfaenger ###############

function updateStudienanfaengerTabMap() {
	var map;
	map = $('#tMap').data('map');
	var year;
	year = $('#tBigYear').data('year');

	$.each(database.studienanfaenger2,function(index,studienanfaenger) { // iterate regions
		if (!studienanfaenger['r']) return; // Deutschland
		r = studienanfaenger['r'];
		$(r).data('landQuote',studienanfaenger[year]);

		r.attr({'stroke-width': 1, 'stroke-opacity': '0.1', 'stroke': '#000'});

		r.attr({
				fill: value2color(studienanfaenger[year]/10)
		}); // Sloooooooow.
	});
} // updateStudienanfaengerTabMap

function updateStudienanfaengerTabYear(year) {
	// +++ update Buttons +++
	year = parseInt(year);
	$('#tButtonsYear').text(year);
	if (year>2000) {
		$('#tButtonsYearPrev').text(year-1);
		$('#tButtonsYearPrev').data('year',year-1);
		$('#tButtonsPrev').data('year',year-1);
		$('#tButtonsPrev').removeAttr("disabled");
	} else {
		$('#tButtonsYearPrev').text('');
		$('#tButtonsYearPrev').data('year',0);
		$('#tButtonsPrev').data('year',0);
		$('#tButtonsPrev').attr("disabled", "disabled");
	}
	if (year<2010) {
		$('#tButtonsYearNext').text(year+1);
		$('#tButtonsYearNext').data('year',year+1);
		$('#tButtonsNext').data('year',year+1);
		$('#tButtonsNext').removeAttr("disabled");
	} else {
		$('#tButtonsYearNext').text('');
		$('#tButtonsYearNext').data('year',0);
		$('#tButtonsNext').data('year',0);
		$('#tButtonsNext').attr("disabled", "disabled");
	}

	$('#tBigYear').data('year',year).html(year);

	updateStudienanfaengerTabMap();
	// console.log(year);
} // updateAbiturientenTabYear

function loadStudienanfaengerTab() {
	if ($('#studienanfaenger').data('loaded')) return;

	// +++ Map +++
	var map = Raphael($("#tMap")[0], 360, 500);
	var region;
	
	$('#tMap').data('map',map);
	
	// add Deutschland to table of Studienanfaenger by calculating sum of all Bundeslaender
	var deutschland = [
		[2000,'Deutschland',0,0],
		[2001,'Deutschland',0,0],
		[2002,'Deutschland',0,0],
		[2003,'Deutschland',0,0],
		[2004,'Deutschland',0,0],
		[2005,'Deutschland',0,0],
		[2006,'Deutschland',0,0],
		[2007,'Deutschland',0,0],
		[2008,'Deutschland',0,0],
		[2009,'Deutschland',0,0],
		[2010,'Deutschland',0,0]
	];
	$.each(database.studienanfaenger, function(index, studienanfaenger) { // iterate regions
		if (!studienanfaenger) return;
		for (var i=0;i<deutschland.length;i++) {
			if (deutschland[i][0]==studienanfaenger[0]) {
				deutschland[i][2]+=studienanfaenger[2];
				deutschland[i][3]+=studienanfaenger[3];
			}
		}
	});
	database.studienanfaenger = database.studienanfaenger.concat(deutschland);

	// convert abiturienten table to new table
	database['studienanfaenger2'] = { 'Deutschland':{} };
	
	$.each(database.studienanfaenger, function(index, studienanfaenger) { // iterate regions
		if (!studienanfaenger) return;
		if (database.studienanfaenger2[studienanfaenger[1]] === undefined) { // new region
			for (var i = 0; i < regions.length; i++) {
				if (studienanfaenger[1] == regions[i].name) { // match found
					var region = regions[i];
					break;
				}
			}

			r = map.path(region.path).attr({
				'stroke': 'none'
			});

			$(r).data('landName', studienanfaenger[1]);

			// add region/land/brd to abiturienten2
			database.studienanfaenger2[studienanfaenger[1]] = {
				r: r
			};

			r.hover(
				function(e) { // in
					var tooltipText='';
					// region's data:
					tooltipText += '<table><tr>'
						+ '<td style="font-weight:bold;">' + $(this).data("landName") + '</td>'
						+ '<td>' + Math.round($(this).data('landQuote')*10)/10 + '</td></tr>'
						+ '<tr><td>Deutschland</td>'
						+ '<td>'+Math.round(
							database.studienanfaenger2['Deutschland'][$('#tBigYear').data('year')]
							*10)/10+'</td>'
						+ '</table>';
					tooltipIn(tooltipText);
				},
				function() { // out
					tooltipOut();
				}
			);
		}
		// Add quote to region
		database.studienanfaenger2[studienanfaenger[1]][studienanfaenger[0]] =
		studienanfaenger[2]*1000/studienanfaenger[3]; // Studienanfaenger je 1000 Einwohner
	});
	// legend
	paintLegend(map, 10, 4);

	// detect touch device:
	if (!!('ontouchstart' in window))
		var touch=true;
		else var touch=false;

	// +++ Buttons +++
	if (touch) {
		$('#tSlider').hide();
		$('#tMap').data('year',2000);
		$("#tButtonsYearNext, #tButtonsYearPrev").click(function(){
			if ($(this).data('year')) {
				updateStudienanfaengerTabYear($(this).data('year'));
			}
		});

		var timeout;
		$('#tButtonsNext, #tButtonsPrev').mousedown(function(){
			if ($(this).data('year')) {
				updateStudienanfaengerTabYear($(this).data('year'));
			}
			var button=$(this).attr('id');
			timeout = setInterval(function(){
				if ($('#'+button).data('year')) {
					updateStudienanfaengerTabYear($('#'+button).data('year'));
				} else {
					clearInterval(timeout);
				}
			}, 500);
			return false;
		});
		$('#tButtonsNext, #tButtonsPrev').mouseup(function () {
			clearInterval(timeout);
			return false;
		});
		$('#tButtonsNext, #tButtonsPrev').mouseout(function () {
			clearInterval(timeout);
			return false;
		});
	}


	// +++ Slider +++
	if (!touch) {
		$('#tButtons').hide();
		$( "#tSliderSlider" ).slider({
			value:2000,
			min: 2000,
			max: 2010,
			step: 1,
			slide: function( event, ui ) {
				updateStudienanfaengerTabYear(ui.value);
			}
		});
	}

	updateStudienanfaengerTabYear('2000');

	$('#studienanfaenger').data('loaded',true);
} // loadStudienanfaengerTab


// ##################### Wanderung ###############


function wanderungAddRegion(map,region,land,fill,fillopacity,mdr) {
		// mdr: bool if it is Sachsen, Sachsen-Anhalt or Thüringen
		var param = {
			stroke:'none',
			fill:fill,
			'fill-opacity':fillopacity };
		r = map.path(region.path).attr(param);
		$(r).data({
			'name': region.name,
			'ausMDR': land.ausMDR,
			'nachMDR': land.nachMDR,
			'saldo': land.saldo
		});

		r.hover(
			function(e) { // in
				var tooltipText='';
				// region's data:
				tooltipText +=
					'<table>'+
					'<tr><th colspan="2">';
					if (
						($(this).data("name")=='Sachsen') ||
						($(this).data("name")=='Sachsen-Anhalt') ||
						($(this).data("name")=='Thüringen')
					) tooltipText +='MDR-Region';
					else tooltipText +=$(this).data("name");
					tooltipText +='</th></tr>'+
					'<tr><td>'+(mdr ? 'Aus MDR-Region' : 'Aus MDR-Region')+'</td>'+
					'<td style="text-align:right;">'+(mdr ? '- ' : '+ ')+formatNumber($(this).data("ausMDR"),0)+'</td></tr>'+
					'<tr><td>'+(mdr ? 'Nach MDR-Region' : 'Nach MDR-Region')+'</td>'+
					'<td style="text-align:right;">'+(mdr ? '+ ' : '- ')+formatNumber($(this).data("nachMDR"),0)+'</td></tr>'+
					'<tr><td>Saldo</td>'+
					'<td style="text-align:right;">'+(mdr ? '- ' : '+ ')+formatNumber($(this).data("saldo"),0)+'</td></tr>'+
					'</table>';
				tooltipIn(tooltipText);
			},
			function() { // out
				tooltipOut();
			}
		);
} // wanderungAddRegion


function loadWanderungTab() {
	
	tooltip4Text('#tt-wanderung-1');
	
	if ($('#wanderung').data('loaded')) return;
	// +++ Map +++
	var map = Raphael($("#wMap")[0], 360, 500);
	//map.path(regions[0].path).attr({'stroke-opacity': '0.2'}); // Bundesrepublik. Slow!
	map.image("style/mdr-region-arrows.png", 120, 110, 235, 251);

	$.each(database.wanderung, function(i, land){
		if (land.regionId == 'MDR') {
			// paint Sachen, Sachsen-Anhalt, Thüringen (MDR-Region):
			$.each(['140000000000','150000000000','160000000000'],function(index,value) {
				var region = regionid2region(value);
				wanderungAddRegion(map,region,land,'#fff',0.5,true);
			});
		} else { // every other Bundesland
			if ((land.regionId!=140000000000) &&
				(land.regionId!=150000000000) &&
				(land.regionId!=160000000000)) {
				var region = regionid2region(land.regionId);
				var fill = value2color((land.saldo+15000)/115000); // absolute
				wanderungAddRegion(map, region, land, fill,1, false);
			}
		}
	});

	
	map.path(regions[0].path).attr({'stroke-opacity': '0.3'}); // Bundesrepublik. Slow!

	// Draw borders
	$.each(database.wanderung, function(index, land) { // iterate regions
		var region = regionid2region(land.regionId);
		if (region !== undefined) {
			map.path(region.path).attr({'stroke-width': 1, 'stroke-opacity': '0.2'});
		}
	});

	// legend
	paintLegend(map, 100000, 2);
	
	$('#wanderung').data('loaded', true);
} // loadWanderungTab

