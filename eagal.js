(function( $ ){
	$.fn.eagal = function( options ) {

		var eagal = function() {
			var $gallery = $(this),
				$thumbWraps = $gallery.find(settings.selectors.thumbWraps),
				$thumbs = $thumbWraps.find(settings.selectors.thumbs);

			if ($thumbWraps.filter('a').length != $thumbWraps.length || $thumbWraps.length == 0)
				return eagal.error('Children of the gallery element must all be \'a\' tags');

			if ($thumbs.filter('img').length != $thumbs.length || $thumbs.filter(':firstchild').length == $thumbWraps.length)
				return eagal.error('Links must all contain images');

			// Set up base structure
			var $container = $('<div>').addClass(settings.namespace + settings.classes.container),
				$thumbsContainer = $('<div>').addClass(settings.namespace + settings.classes.thumbsContainer).append($thumbWraps),
				$rightArrow = $('<div>').addClass(settings.namespace + settings.classes.rightArrow).appendTo($gallery),
				$leftArrow = $('<div>').addClass(settings.namespace + settings.classes.leftArrow).appendTo($gallery);
			$thumbs.height(settings.thumbHeight).width(settings.thumbHeight * settings.aspectRatio).addClass(settings.namespace + settings.classes.thumbs);
			$gallery.prepend($container).append($thumbsContainer).addClass(settings.namespace + settings.classes.gallery);
			
			// Bind events
			$thumbs.bind('click.eagal', function(e) {
				e.preventDefault();
				eagal.setImage.call($gallery, $(this));
			});

			$leftArrow.bind('click.eagal', function(e) {
				eagal.setIndex.call($gallery, '-1');
			});

			$rightArrow.bind('click.eagal', function(e) {
				eagal.setIndex.call($gallery, '+1');
			});

			$(document).bind('keydown.eagal', function(e) {
				if (e.which == 39) // Right
					eagal.setIndex.call($gallery, '+1');
				if (e.which == 37) // Left
					eagal.setIndex.call($gallery, '-1');
				if (e.which == 36) // Home
					eagal.setIndex.call($gallery, 0);
				if (e.which == 35) // End
					eagal.setIndex.call($gallery, $thumbs.length-1);
				if (e.which == 33) // PgUp
					eagal.setIndex.call($gallery, '-10');
				if (e.which == 34) // PgDown
					eagal.setIndex.call($gallery, '+10');
			});

			$(window).bind('resize.eagal', function(e) {
				eagal.checkSize.call($gallery);
			});

			// Set up data
			var data = {
				initialised:true,
				index:-1,
				settings: settings,
				width:0,
				thumbsInset: 12,
				objects: {
					container: $container,
					thumbs: $thumbs,
					thumbsContainer: $thumbsContainer
				}
			};
			$gallery.data('eagal', data);

			eagal.checkSize.call($gallery);
			eagal.setIndex.call($gallery, 0);
		};

		eagal.checkSize = function() {
			var $gallery = $(this),
				data = $gallery.data('eagal'),
				w = Math.max(Math.min($gallery.parent().width(), data.settings.maxWidth), data.settings.minWidth),
				h = w / data.settings.aspectRatio;
			$gallery.width(w).height(h);
			data.width = w;
			$gallery.data('eagal', data);
			eagal.setThumbOffset.call($gallery, false);
		};

		eagal.getIndex = function() {
			var data = $(this).data('eagal');
			return data.index;
		};

		eagal.hideLoader = function() {
			var data = this.data('eagal');
			this
				.find('.' + data.settings.namespace + data.settings.classes.loader)
				.stop()
				.fadeOut( function() {
					$(this).remove();
				});
		};

		eagal.preload = function(url) {
			$('<img/>')[0].src = url;
		};

		eagal.setImage = function(image) {
			var $image = image,
				src = $image.parent().attr('href'),
				$gallery = $(this),
				data = $gallery.data('eagal'),
				$container = data.objects.container,
				index = $image.parent().index(),
				f = data.settings.callbacks.change;
			if (!data)
				return;
			if ($image.length < 1)
				return $gallery;
			if (data.index == index)
				return $gallery;
			data.index = index;
			$gallery.data('eagal', data);

			if (typeof f == 'function')
				if (f($image, $gallery) === false)
					return $gallery;

			// Display the image
			eagal.showLoader.call($gallery);
			$container.children(':not(:first-child, :animated)').remove();  // Delete other images that haven't yet loaded
			var onload = function() {
				var data = $gallery.data('eagal');
				if (index != data.index || $(this).data('eagal-loaded'))
					return;
				$(this).data('eagal-loaded', true);

				var $this = $(this);
				var f = data.settings.callbacks.load;
				if (typeof f == 'function')
					f($this, $gallery);
				$this.removeAttr('height').fadeIn();
				$container.children().not($newImg).fadeOut(function() {
							$(this).remove();
				});
				eagal.hideLoader.call($gallery);
				var next = data.objects.thumbs.eq(index+1);
				if (next.length)
					eagal.preload(next.parent().attr('href') + '?w=' + data.width);
			};
			$newImg = $('<img>').attr('src', src + '?w=' + data.width).hide().appendTo($container).load(onload).error(function() {
				alert('Error: could not load image');
			});
			if($newImg.complete || (jQuery.browser.msie && parseInt(jQuery.browser.version) < 9))
				$newImg.trigger("load");

			// Move the thumbnails
			eagal.setThumbOffset.call($gallery);

			return $gallery;
		};

		eagal.setIndex = function(index) {
			var data = $(this).data('eagal');
			if (typeof index == 'string' && !index[0].match(/[0-9]/))
				index = eval(data.index.toString() + index);
			if (index >= data.objects.thumbs.length)
				index = data.objects.thumbs.length - 1;
			if (index < 0)
				index = 0;
			return eagal.setImage.call(this, data.objects.thumbs.eq(index));
		};

		eagal.setThumbOffset = function(animate) {
			if (arguments.length < 1)
				animate = true;


			var data = this.data('eagal'),
				index = data.index,
				w = data.objects.thumbs.first().parent().outerWidth(),
				offset = - w * index,
				margin = w - data.objects.thumbs.first().outerWidth(),
				min = data.width - (data.objects.thumbs.length) * w + margin - data.thumbsInset * 2;
			offset += (data.width - w - margin)/2;

			if (offset < min)
				offset = min;
			if (offset > 0)
				offset = 0;

			if (animate)
				data.objects.thumbsContainer.stop().animate({'text-indent': offset});
			else
				data.objects.thumbsContainer.stop().css({'text-indent': offset});
		};

		eagal.showLoader = function() {
			var data = this.data('eagal');
			$('<div>')
				.addClass(data.settings.namespace + data.settings.classes.loader)
				.hide()
				.appendTo(this)
				.fadeIn();
		};
		
		eagal.log = function() {
			var args = Array.prototype.slice.call( arguments, 0 );
			args.unshift('Eagal:');
			if (console && console.log)
				console.log.apply(console, args);
		};
		
		eagal.error = function() {
			var args = Array.prototype.slice.call( arguments, 0 );
			args.unshift('Eagal error:');
			if (console && console.error)
				console.error.apply(console, args);
		};

		// Which action are we performing?
		if (typeof arguments[0] == 'string') { // Getters and setters
			if (arguments.length == 1) { // Getters
				switch(arguments[0]) {
					case 'index':
						return eagal.getIndex.call(this);
					default:
						return;
				}
			} else { // Setters
				switch(arguments[0]) {
					case 'index':
						return eagal.setIndex.call(this, arguments[1]);
					default:
						return;
				}
			}
		} else { // Init
			var defaults = {
				aspectRatio: 1.5,
				namespace: 'eagal-',
				thumbHeight: 50,
				maxWidth: 1024,
				minWidth:0,
				selectors: {
					thumbWraps: '>a',
					thumbs: '>img'
				},
				classes: {
					gallery: 'gallery',
					container: 'container',
					thumbsContainer: 'thumbsContainer',
					thumbs: 'thumb',
					loader: 'loader',
					rightArrow: 'rightArrow',
					leftArrow: 'leftArrow'
				},
				callbacks: {
					change: undefined,
					load: undefined
				}
			};
			var settings = $.extend({}, defaults, options);

			return this.each(eagal);
		}
	};
})( jQuery );