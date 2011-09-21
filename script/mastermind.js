/*
 * Mastermind mit MooTools
 *
 *
 */
// Unabhaengig von der Ausgabe
Mastermind = function( rows, lines, colors  ) {

	var maxLines   = lines;
	var maxRows    = rows;
	var maxColors  = colors;

	var ColorNames = [ 'blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'magenta', 'brown' ];
	var Solution;
	var activeLine;

	this.getLines = function() { return maxLines; }
	this.getRows = function() { return maxRows; }
	this.getColors = function() { return maxLines; }
	this.getColorNames = function() { return ColorNames; }
	this.getActiveLine = function() { return activeLine; }

	this.initSolution = function() {
		
		var S = new Array();

		for( var i = 0; i < maxColors; i++ ) 
			S[i] = Math.round( Math.random() * ( maxColors - 1 ) );			

		//alert( "ME: " + S[0] + ", " + S[1] + ", " + S[2] + ", " + S[3] );
	
		return S;
	}


	// <= [ Richtige, Falscher Platz ]
	this.checkLine = function( Line ) {

		var TmpSolution = Solution.copy();
		var rightPlace = 0, 
		    wrongPlace = 0;
	
		// Richtige
		for ( var i = 0; i < maxRows; i++ ) {

			if ( Line[i] == TmpSolution[i] ) {
				Line[i] = -1;
				TmpSolution[i] = -2;
				rightPlace++;
			}
		}
		
		// Falscher Platz
		for ( var i = 0; i < maxRows; i++ ) {

			for ( var j = 0; j < maxRows; j++ ) {
	
				if ( Line[i] == TmpSolution[j] ) {
					Line[i] = -1;
					TmpSolution[j] = -2;
					wrongPlace++;
					break;
				}	
			}
		}

		return new Array( rightPlace, wrongPlace );
	}


	this.newLine = function() {

		if( activeLine < maxLines - 1 ) {
			activeLine++
			return true;
		} 

		return false;
	}

	this.init = function() {

		activeLine = 0;
		Solution = this.initSolution();
	}

	this.init();
}


Masterplay = function( mastermind ) {

	var master = new Mastermind( 4, 8, 8 );

	this.checkLine = function() {

		var Line = new Array();
		var lineIdx = 0;
		var emptyStones = master.getRows();
		var activeLine = master.getActiveLine();

		// Klassen => Ids
		$( 'line'+activeLine ).getChildren().each( function(el) {

			var colorId = 0;
			master.getColorNames().each( function( color ) {
				if( el.hasClass( color ) ) {
					Line[ lineIdx ] = colorId;
					emptyStones--;
				}
				colorId++;
			} );

			lineIdx++;
		} );
	
		if( emptyStones == 0 ) { 
			var Sol = master.checkLine( Line );
			var win = ( Sol[0] == master.getRows() ) ? true : false;
		
			// Bewertung 
			$( 'line'+activeLine ).getElement('div').getElements('span').each( function(el) {
				if( Sol[0]-- > 0 ) el.addClass('found');
				else if( Sol[1]-- > 0 ) el.addClass('false');
			} );

			if( win )
		      		alert( ( ( activeLine == 0 ) 
				   	   ? "Gewonnen im 1. Versuch." 
				    	   : "Gewonnen in " + ( activeLine + 1 ) + " Versuchen." ) );
			else {
				// Naechste Zeile freigeben
				$( 'line'+activeLine ).removeClass('isactive');
				$( 'line'+activeLine ).addClass('ishistory');
				if( master.newLine() )
					$( 'line'+master.getActiveLine() ).addClass('isactive');
				else alert( "Leider Verloren!" );
			}
		}		
	
		else alert( ( ( emptyStones == 1 ) 
				   ? "Es ist noch 1 Feld unbesetzt." 
				   : "Es sind noch " + emptyStones + " Felder unbesetzt." ) );
	}

	var draggableOptions = {
		'snap': 1,
		'container' : 'mastermind',

		'onStart': function(el) {
			this.elementOrg = this.element;
			var x = this.element.getLeft();
			var y = this.element.getTop();
			var now = {'x': x, 'y': y };
			this.element = this.element.clone().setStyles( {
				'position': 'absolute',
				'left': '0',
				'top': '0',
				'opacity': '0.7'
			}).injectInside( this.element );
			this.value.now = now;
		},
	
		'onComplete': function(el) {
			this.element.remove();
			this.element = this.elementOrg;
			this.elementOrg = null;
		}
	}

	var droppableOptions = {
		'over': function( el ) {
			if( this.getParent().hasClass('isactive') ) {
				this.addClass( 'drophover' ); 
			}
		},
			'leave': function( el ) {
			this.removeClass('drophover');
		},
			'drop': function( el ) {
			if( this.getParent().hasClass('isactive') ) {
				var me = this;
				me.removeClass('drophover');
			
				master.getColorNames().each( function( color ) {
					me.removeClass( color );
						if( el.hasClass( color ) ) 
						me.addClass( color );
				} );
			}
		}
	};

	var drags = $$('.drags');
	var drops = $$('.drops');
	draggableOptions.droppables = drops;
	
	drops.each(function(el) { el.addEvents( droppableOptions ); } );
	drags.each( function(el) { 
			el.makeDraggable( draggableOptions );
			el.addEvent('drop', function(drag) {
			var elm = drag.element.clone().setStyles({
				'top': drag.value.now.y+'px', 
				'left': drag.value.now.x+'px',
				'position': 'absolute',
				'opacity': '0.7'
			}).injectInside( drag.element );
	
			var eff = new Fx.Styles(elm,{duration: 250, onComplete: function(){elm.remove()}});
			eff.start({
				'top': [ drag.value.now.y, 0 ],
				'left': [ drag.value.now.x, 0 ]
			});
		});	
		
	});

}

