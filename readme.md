# EaGal - a Responsive Gallery that Flies

**EaGal** is a simple responsive gallery for images with a fixed aspect ratio.

It includes a PHP image resizing mechanism, and a JavaScript gallery.

## Features

- Intelligently resizes images server-side to prevent wasted data on smaller screens
- Automatically preloads the next image to minimise waiting time
- Crops all images to the same aspect ratio
- Includes keyboard controls (arrow keys, Home, End, PgUp and PgDown)

## Compatibility

Markdown is built for all modern browsers and IE8+.

## Installation

1. Copy the contents of the 'server' folder to the folder containing your images
2. Check it is working by appending ?size=thumb to the URL of one of your images - a thumbnail should be generated
3. Copy the demo code to set up your gallery
4. Enjoy your new image gallery

##Options##

You can initialise EaGal with the following options (their defaults are shown):

	$('#gallery').eagal({
		aspectRatio: 1.5,			// You must change this in the PHP script too
		maxWidth: 1024,
		minWidth:0,
		namespace: 'eagal-',
		thumbHeight: 50,			// You must change this in the PHP script too
		callbacks: {
			change: undefined,
			load: undefined
		},
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
		}
	);

