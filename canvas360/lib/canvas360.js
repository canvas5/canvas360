/**
 * Filename: canvas360.js
 * 
 * Creates a 360 view using an array of images using a canvas element.
 * 
 * Copyright 2012 Canvas5.com under the MIT License.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */

function canvas360(params){
    
    params = params || {};
    params.canvasID = params.canvasID || false;
    params.canvasWidth = params.canvasWidth || 640;
    params.canvasPerspective = params.canvasPerspective || '16:9';
    params.framesPath = params.framesPath || 'frames/';
    params.framesFile = params.framesFile || '';
    params.framesCount = params.frameCount || 36;
    params.imagesPath = params.imagesPath || 'canvas360/img/';
    params.logoImagePath = params.logoImagePath || 'html5badge.png';
    params.loaderBarColor = params.loaderBarColor || '#ffffff';
    params.loaderFillColor = params.loaderFillColor || '#e44d26';
    params.loaderFillGradient = params.loaderFillGradient || false;
    params.loaderFillColor2 = params.loaderFillColor2 || '#ffffff';
    params.serverSideImageSize = params.serverSideImageSize || false;
    params.serverSideImagePath = params.serverSideImagePath || 'canvas360/image.php';
    
    // Canvas ID should match the ID of the div where the canvas will be added.
    var canvasID = params.canvasID || false;
    
    // canvasWidth is the width of the canvas element.
    var canvasWidth = params.canvasWidth || 640;
    
    /* canvasPerspective should match the perspective of the images. If the images
     * are in HD then the perspective will be 16:9. It is important to maintain
     * the perspective as the images will be adjusted to fill the canvas which
     * in most situations means they will be reduced in size. */
    
    var canvasPerspective = params.canvasPerspective || '16:9';
    
    // framesPath is the location where the frames can be found.
    var framesPath = params.framesPath || 'frames/';
    
    var framesFile = params.framesFile || '';
    
    // framesCount is the number of frames that will exist.
    var framesCount = params.frameCount || 36;
    
    
    
    /* imagesPath is the location where images such as the logo and preloader 
     * can be found. */
    var imagesPath = params.imagesPath || 'canvas360/img/';
    
    /* logoImagePath is the filename of the logo which will show up during
     * loading. */
    var logoImagePath = params.logoImagePath || 'html5badge.png';
    
    /* loaderBarColor should be an HTML color code matching the color you wish
     * to be used to frame in the progress bar when loading images and data. */    
    var loaderBarColor = params.loaderBarColor || '#ffffff';
    
    /* loaderFillColor should be an HTML color code matching the color you wish
     * to be used to fill the progress bar. */
    var loaderFillColor = params.loaderFillColor || '#e44d26';
    
    /* loaderFillGradient set's canvas360 to use a gradient fill on the progress
     * bar. If false it will use loaderFillColor. If true it will draw a 
     * gradient from loaderFillColor to loaderFillColor2. */
    var loaderFillGradient = params.loaderFillGradient || false;
    
    /* loaderFillColor2 is the second color for the progressbar if 
     * loaderFillGradient is set to true. */
    var loaderFillColor2 = params.loaderFillColor2 || '#ffffff';
    
    
    var frameImages = [];
    
    var strokeX = 0;
    var strokeY = 0;
    var strokeWidth = 0;
    var strokeHeight = 15;
    var countFrames = 0;
    var loadPercent = 0;
    var curFrame = 0;
    var frameCount = 0;
    var animDirection = 0;
    var countFrames = 0;
    var animatingFrames = false;
    
    var imagePositionX = 0;
    var imagePositionY = 0;
    
    //***** Swipe Detection Code
    
    var HORIZONTAL = 1;
    var VERTICAL = 2;
    var AXIS_THRESHOLD = 30;
    var GESTURE_DELTA = 50;
    
    var direction = HORIZONTAL;
        
   
    
    /* Extend the window with a custom function that works off of either the
     * new requestAnimationFrame functionality which is available in many modern
     * browsers ot utilizes the setTimeout function where not available. */
    
    window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame        || // Chromium
	window.webkitRequestAnimationFrame  || // WebKit
	window.mozRequestAnimationFrame     || // Mozilla
	window.oRequestAnimationFrame       || // Opera
	window.msRequestAnimationFrame      || // IE
	function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

	    window.setTimeout( callback, 17 );

	};
    })();
    
     var onswiperight = function(delta){
	deltaDif = Math.ceil(delta / (GESTURE_DELTA / 2));
	//deltaDif = 1;
	countFrames += deltaDif;
	animDirection = 1;
	if (!animatingFrames){
	    animatingFrames = true;
	    animateFrames();
	}
    }
    
    var onswipeleft = function(delta){
	deltaDif = deltaDif = Math.ceil(delta / (GESTURE_DELTA / 2));
	countFrames += deltaDif;
	animDirection = 2;
	countFrames += deltaDif;
	
	if (!animatingFrames){
	    animatingFrames = true;
	    animateFrames();
	}
    }
    
    
    var inGesture = false;
    
    var _originalX = 0;
    var _originalY = 0;
    
    var mousedown = function(event){
	event.preventDefault();
	inGesture = true;
	_originalX = (event.touches) ? event.touches[0].pageX : event.pageX;
	_originalY = (event.touches) ? event.touches[0].pageY : event.pageY;
	
	// Only iphone
	if (event.touches && event.touches.length!=1){
	    inGesture = false;
	}
    }
    
    var mouseup = function(){
	inGesture = false;
    }
    
    var mousemove = function(event){
	event.preventDefault();
	var delta = 0;
	var currentX = (event.touches) ? event.touches[0].pageX : event.pageX;
	var currentY = (event.touches) ? event.touches[0].pageY : event.pageY;
	
	if (inGesture){
	    
	    if (direction == HORIZONTAL){
		delta = Math.abs(currentY - _originalY);
	    } else {
		delta = Math.abs(currentX - _originalX);
	    }
	    if (delta > AXIS_THRESHOLD){
		//inGesture = false;
	    }
	}
	
	if (inGesture){
	    if (direction == HORIZONTAL){
		delta = Math.abs(currentX - _originalX);		
		if (currentX > _originalX){
		    vDirection = 0;
		} else {
		    vDirection = 1;
		}
	    } else {
		delta = Math.abs(currentY - _originalY);
		if (currentY > _originalY){
		    vDirection = 2;
		} else {
		    vDirection = 3;
		}
	    }
	    
	    if (delta >= GESTURE_DELTA){
		
		var handler = null;
		switch(vDirection){
		    case 0:
			handler = onswiperight;
			break;
		    case 1:
			handler = onswipeleft;
			break;
		}
		if (handler != null){
		    handler(delta);
		}
		_originalX = (event.touches) ? event.touches[0].pageX : event.pageX;
		_originalY = (event.touches) ? event.touches[0].pageY : event.pageY;
		//inGesture = false;
	    }
	}
    }
    
    //***** End swipe detection Code
            
    var canvas = null;
    var context = null;
    
    var self = this;

    var aboutMessage = 'Using Canvas360 Free';
    
    var number_format = function(number, decimals) {
	
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
	prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
	dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
	s = '',
	toFixedFix = function (n, prec) {
	    var k = Math.pow(10, prec);
	    return '' + Math.round(n * k) / k;
	};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
	    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
	    s[1] = s[1] || '';
	    s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
    }
    
    /* Start the preload method rendering the
       the logo and filling the canvas. The logo
       should be tiny to ensure a near instant
       load. */
    startPreload = function(){
	
	
	imageLogo = new Image();
	imageLogo.src = imagesPath + logoImagePath;
	imageLogo.onload = function(){
	    logoWidth = imageLogo.width;
	    logoHeight = imageLogo.height;
	    
	    logoX = ((canvasWidth - logoWidth) / 2);
	    logoY = ((canvasHeight - logoHeight) / 2);
	    
	    var canvasCentreX = canvas.width/2;
	    var canvasCentreY = canvas.height/2;
	    var gradient = context.createRadialGradient(canvasCentreX, canvasCentreY, 250, canvasCentreX, canvasCentreY, 0);
	    gradient.addColorStop(0, "rgb(0, 0, 0)");
	    gradient.addColorStop(1, "rgb(125, 125, 125)");
	    context.save();
	    context.fillStyle = gradient;
	    context.fillRect(0, 0, canvas.width, canvas.height);
	    context.restore();

	    
	    context.drawImage(imageLogo, logoX, logoY);
	    context.strokeStyle = loaderBarColor;
	    
	    strokeX = logoX - 20;
	    strokeY = logoY + logoHeight + 10;
	    strokeWidth = logoWidth + 40;
		
	    context.strokeRect(strokeX, strokeY, strokeWidth, strokeHeight);
	    for(i = 0; i < framesCount; i++){
		//console.log(framesPath + framesFile.replace('{col}', (i+1)));
		frameImages[i] = new Image();
		//frameImages[i].onload = preloadImages();
	    
		var repVal = ((i < 9) ? '0' : '') + (i+1);
		frameImages[i].src = framesPath + framesFile.replace('{col}', repVal);
	    }
	    setTimeout(function(){
		preloadImages();
	    },20);
	}
	
	
    }
    
    var preloadImages = function(){
	
	
	for (i = 0; i < framesCount; i++){
	    
	    if (frameImages[i].complete){
		loadPercent++;
	    }
	    loaderWidth = Math.ceil((strokeWidth - 2) * (loadPercent / 100));
	
	}
	if (!loaderFillGradient){
	    context.fillStyle = loaderFillColor;
	} else {
	    
	    gradient = context.createLinearGradient(strokeX + 1, strokeY + 1, loaderWidth, strokeHeight - 2);
	    gradient.addColorStop(0, loaderFillColor);
	    gradient.addColorStop(1, loaderFillColor2);
	    context.save();
	    context.fillStyle = gradient;
	}
	
	context.clearRect(strokeX+1, strokeY + 1, loaderWidth, strokeHeight - 2);
	context.fillRect(strokeX+1, strokeY + 1, loaderWidth, strokeHeight - 2);
	self = this;
	
	if (loadPercent >= framesCount){
	    // Done so draw and exit;
	    drawFrame();
	    return;
	} else {
	    setTimeout(function(){
		preloadImages();
	    },20);
	}
	
	
    }
    
    var animateFrames = function(){
	
	if(animDirection == 1){
	    curFrame++;
	}
	
	if (animDirection == 2){
	    curFrame--;
	}
	
	frameCount++;
	if (curFrame < 0){
	    curFrame = framesCount -1;
	}
	if (curFrame > (framesCount - 1)){
	    curFrame = 0;
	}
	drawFrame();
	if (frameCount < countFrames){
	    
	    requestAnimFrame(function(){
		animateFrames();
	    });
	    
	} else {
	    animDirection = 0;
	    countFrames = 0;
	    frameCount = 0;
	    animatingFrames = false;
	}
	
    }
    
    var drawFrame = function(){
	if (curFrame > (framesCount - 1)){
	    curFrame = 0;
	}
	if (curFrame < 0){
	    curFrame = (framesCount - 1);
	}
	
	currentImage = frameImages[curFrame];
	
	if (curFrame >= 0 && curFrame < (framesCount - 1)){
	    context.drawImage(currentImage, imagePositionX, imagePositionY);
	}
	
    }
    
    if (canvasID){
	// Set the variable elem to the object with the specified canvasID
	var elem = document.getElementById(canvasID);
	
	// If the element is not an object then show a message letting the user know.
	if (!elem){
	    alert('Invalid element ID.');
	    return;
	} else {
	    // Create a canvas object.
	    canvas = document.createElement("canvas");
	    
	    // Set the canvas width to the width defined in the parameters.
	    canvas.width = canvasWidth;
	    
	    // Split the perspective paramater on the colon to get the perspective.
	    perspective = canvasPerspective.split(':');
	    
	    // Get the perspective ratio
	    multiplier = number_format((perspective[0] / perspective[1]),2);
	    
	    // Set the canvas height using the width divided by the multiplier.
	    canvasHeight = Math.round(canvasWidth / multiplier)
	    
	    // Set the actual height of the canvas object
	    canvas.height = canvasHeight;
	    
	    // Add a class to the element where the canvas will be placed.
	    elem.className += ' canvas360Wrapper';
	    
	    // Set the width of the div to match the width of the canvas.
	    elem.style.width = ((canvas.width) + 'px');
	    
	    // Set the height of the div to match the height of the canvas.
 	    elem.style.height = ((canvas.height) + 'px');
	    
	    // Remove the existing HTML in the container element.
	    elem.innerHTML = '';
	    
	    // Append the canvas to the element.
	    elem.appendChild(canvas);
	    
	    // Define a context from the canvas.
	    context = canvas.getContext('2d');
	    
	    // Set a mousedown event on the canvas.
	    canvas.onmousedown = mousedown;
	    
	    // Set a mousemove event on the canvas.
	    window.onmousemove = mousemove;
	    
	    // Set a mouseup event on the canvas.
	    window.onmouseup = mouseup;
	    
	    // Start the preload method.
	    startPreload();
	    
	    
	}
	
    }
    
    
    
}