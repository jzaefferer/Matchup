(function( $ ) {

$.widget( "quiz.termQuiz", {
	options: {
		terms: null
	},

	_create: function() {
		var i, length, term,
			terms = this.options.terms;

		this.element.addClass( "termquiz" );

		// create terms and definitions
		// delay initializing draggable and droppable until the elements are in the DOM
		// delay inserting into the DOM to reduce rerenders
		this.terms = $( "<div>", {
			"class": "termquiz-terms"
		});
		this.definitions = $( "<div>", {
			"class": "termquiz-definitions"
		});
		for ( i = 0, length = terms.length; i < length; i++ ) {
			term = terms[ i ].term;
			this._renderTerm( term )
				.data( "term", term )
				.css( "zIndex", i + 1 )
				.appendTo( this.terms );

			if ( terms[ i ].definition ) {
				this._renderDefinition( terms[ i ].definition )
					.data( "term", term )
					.appendTo( this.definitions );
			}
		}

		this.terms
			.appendTo( this.element )
			// randomize order of terms
			.children()
				.sort(function() {
					return Math.random() > .5 ? 1 : -1;
				})
				.appendTo( this.terms )
				.each(function() {
					$( this ).data( "offset", $( this ).offset() )
				})
				.draggable();

		this.definitions
			.appendTo( this.element )
			.children()
				.droppable({
					accept: ".termquiz-term"
				});

		this._bind( this._events );
	},

	check: function() {
		return this.definitions
			// all definitions
			.children()
			// filter to incorrect guesses
			.filter(function() {
				var definition = $( this ),
					term = definition.data( "guess" );

				if ( !term ) {
					return true;
				}

				return term.data( "term" ) !== definition.data( "term" );
			})
			// map to incorrect terms
			.map(function() {
				return $( this ).droppable( "enable" ).data( "guess" )
			})
			// move back to original position
			.each(function() {
				var term = $( this );
				term.add( term.data( "guess" ) ).removeData( "guess" );
				term.offset( $.extend({
					using: function( position ) {
						term.animate( position, 400 );
					}
				}, term.data( "offset" ) ) );
			})
			// return number of incorrect guesses
			.end().length;
	},

	_events: {
		"dragstart .termquiz-term": function( event ) {
			var term = $( event.target ),
				guess = term.data( "guess" );
			if ( guess ) {
				term.add( guess ).removeData( "guess" );
			}
			this._setZindex( event );
		},
		"dragstop .termquiz-term": function( event ) {
			var term = $( event.target );
			setTimeout(function() {
				if ( !term.data( "guess" ) ) {
					term.offset( $.extend({
						using: function( position ) {
							$( this ).animate( position, 200 );
						}
					}, term.data( "offset" ) ) );
				}
			}, 1 );
		},
		"dropover .termquiz-definition": function( event ) {
			$( event.target ).addClass( "termquiz-definition-hover" );
		},
		"dropout .termquiz-definition": function( event ) {
			$( event.target ).removeClass( "termquiz-definition-hover" );
		},
		"drop .termquiz-definition": function( event, ui ) {
			var droppable = $( event.target );
			droppable
				.data( "guess", ui.draggable )
				.removeClass( "termquiz-definition-hover" )
				.droppable( "disable" );
			ui.draggable
				.data( "guess", droppable )
				.one( "dragstart", function() {
					droppable.droppable( "enable" );
				})
				.offset( $.extend( droppable.offset(), {
					using: function( position ) {
						$( this ).animate( position, 100 );
					}
				}));
		}
	},

	_renderTerm: function( term ) {
		return $( "<div>", {
			"class": "termquiz-term",
			text: term
		});
	},

	_renderDefinition: function( definition ) {
		return $( "<div>", {
			"class": "termquiz-definition",
			text: definition
		});
	},

	// move the active draggable to the top of all draggables
	_setZindex: function( event ) {
		var terms = this.terms.children(),
			active = $( event.target ),
			activeZindex = +active.css( "zIndex" );
		terms.each(function() {
			var current = $( this ),
				currentZindex = +current.css( "zIndex" );
			if ( currentZindex > activeZindex ) {
				current.css( "zIndex", currentZindex - 1 );
			}
		});
		active.css( "zIndex", terms.length );
	}
});

})( jQuery );
