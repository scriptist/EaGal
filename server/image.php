<?php

$aspect_ratio = 1.5;
$thumb_height = 50;


$path = urldecode($_SERVER['REQUEST_URI']);
if (strpos($path, '?') > -1)
	$path = substr($path, 0, strpos($path, '?'));
$path = substr($path, strrpos($path, '/')+1);

$w = isset($_GET['w']) ? $_GET['w'] : 1024;
if (isset($_GET['size'])) {
	$size = $_GET['size'];
	if ($size == 'thumb') {
		$w = $thumb_height * $aspect_ratio;
	}
}

$h = $w / $aspect_ratio;

// Get image
if (!($image = imagecreatefromjpeg($path))) {
	if (!($image = imagecreatefromgif($path))) {
		$image = imagecreatefrompng($path);
	}
}

// Process image
if ($image && $w && $h) {
	$sourceWidth = imagesx($image);
	$sourceHeight = imagesy($image);
	$sourceRatio = $sourceWidth/$sourceHeight;
	$ratio = $w/$h;
	
	$result = imagecreatetruecolor($w, $h);
	
	
	if ($ratio > $sourceRatio) {
		// Crop height
		$destH = intval($w/$sourceRatio);
		imagecopyresampled($result, $image, 0, ($h-$destH)/2, 0, 0, $w, $destH, $sourceWidth, $sourceHeight);
	} else {
		// Crop width
		$destW = intval($sourceRatio*$h);
		imagecopyresampled($result, $image, ($w-$destW)/2, 0, 0, 0, $destW, $h, $sourceWidth, $sourceHeight);
	}
	
	header('Content-Type: image/jpeg');
	header("Expires: Thu, 31 Dec 2020 12:00:00 GMT");

	imagejpeg($result, null, 90);
} else {
	// If it can't load the image, just fail
	header("HTTP/1.0 404 Not Found");
}

?>
