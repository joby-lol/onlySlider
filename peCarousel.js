/** @license
* peCarousel - MIT License
* Copyright (c) 2013 Joby Elliott
* http://go.byjoby.net/peCarousel
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*/

function peCarousel(obj,options) {
	this.setDefaults({
		preload_forward:1,
		preload_backward:0,
		loop:true,
		timer:3000
	});
	this.setOptions(options);
	this.obj = obj;
	this.obj.setAttribute("class","peCarousel");
	//load slides
	this.slides = [];
	if (this.obj.children.length == 1 && this.obj.children[0].tagName == "NOSCRIPT") {
		var container = document.createElement('DIV');
		container.innerHTML = this.obj.children[0].textContent||this.obj.children[0].innerHTML;
		console.log('noscript found');
		console.log(container.innerHTML);
	}else {
		var container = this.obj;
	}
	console.log(container);
	for (var i = 0; i < container.children.length; i++) {
		console.log('extracting child '+i);
		this.slides.push(this.extractSlide(container.children[i]));
	}
	console.log(this.slides);
	this.obj.innerHTML = "";
	//add content container
	this.contentContainer = document.createElement("DIV");
	this.contentContainer.setAttribute("class","peCarousel-contentContainer");
	this.obj.appendChild(this.contentContainer);
	//add nodes to content container
	for (var i = 0; i < this.slides.length; i++) {
		this.contentContainer.appendChild(this.slides[i].node);
	}
	//add loading message
	this.loadingMessage = document.createElement("DIV");
	this.loadingMessage.setAttribute("class","peCarousel-loadingMessage peCarousel-loadingMessage-active");
	this.obj.appendChild(this.loadingMessage);
	//add controls
	this.controls = document.createElement("DIV");
	this.controls.setAttribute("class","peCarousel-controls");
	this.obj.appendChild(this.controls);
	//start at slide 0
	this.currentSlide = -1;
	this.setSlide(0);
	//debugging
	console.log(this);
}
peCarousel.prototype.startTimer = function () {
	if (this.options.timer > 0) {
		var pe = this;
		this.timer = setTimeout(function(){
			pe.setSlide(pe.nextSlide(pe.currentSlide));
		},this.options.timer);
	}
}
peCarousel.prototype.extractSlide = function (obj) {
	if (obj.tagName == "NOSCRIPT") {
		var html = obj.textContent||obj.innerHTML;
	}else {
		var html = obj.outerHTML||new XMLSerializer().serializeToString(node);
	}
	return {
		node:document.createElement("DIV"),
		html:html
	};
}
peCarousel.prototype.render = function () {
	//set appropriate slide classes
	for (var i = 0; i < this.slides.length; i++) {
		if (this.slides[i].node) {
			var slideClass = "peCarousel-slide";
			if (i == this.currentSlide) {
				slideClass = "peCarousel-slide peCarousel-slide-current"
			}else {
				if (i == this.prevSlide(this.currentSlide)) {
					slideClass = "peCarousel-slide peCarousel-slide-prev";
				}
				if (i == this.nextSlide(this.currentSlide)) {
					slideClass = "peCarousel-slide peCarousel-slide-next";
				}
				if (i == 0 && this.currentSlide == -1) {
					slideClass = "peCarousel-slide peCarousel-slide-next peCarousel-slide-first";
				}
				if (i > this.currentSlide) {
					slideClass += " peCarousel-slide-after peCarousel-slide-after-by-"+(i-this.currentSlide);
				}
				if (i < this.currentSlide) {
					slideClass += " peCarousel-slide-before peCarousel-slide-before-by-"+(this.currentSlide-i);
				}
			}
			this.slides[i].node.setAttribute('class',slideClass);
		}
	}
	//draw controls
}
peCarousel.prototype.setSlide = function (slideNumber) {
	this.render();
	this.displaySlide(slideNumber);
	this.preloadAround(slideNumber);
}
peCarousel.prototype.displaySlide = function (slideNumber) {
	//preload slide
	this.preloadSlide(slideNumber);
	//display slide once it is loaded
	var slide = this.slides[slideNumber];
	var pe = this;
	var display = function(){
		if (slide.loaded) {
			clearInterval(timer);
			pe.loadingMessage.setAttribute('class','peCarousel-loadingMessage');
			//set which slide is active, set height, and animate
			pe.currentSlide = slideNumber;
			pe.obj.style.height = slide.node.offsetHeight+'px';
			pe.render();
			//start timer
			pe.startTimer();
		}else {
			pe.loadingMessage.setAttribute('class','peCarousel-loadingMessage peCarousel-loadingMessage-active');
		}
	}
	var timer = setInterval(function(){display()},50);
	display();
}
peCarousel.prototype.clearOldSlides = function () {

}
peCarousel.prototype.preloadSlide = function (slideNumber) {
	console.log('preloading slide '+slideNumber);
	var slide = this.slides[slideNumber];
	if (!slide.loaded && !slide.loading) {
		slide.node.innerHTML = slide.html;
		slide.loading = true;
		//find preloadables
		slide.preloadables = [];
		slide.preloadables = slide.preloadables.concat(this.getElementsByTagName(slide.node,"IMG"));
		slide.preloadables = slide.preloadables.concat(this.getElementsByTagName(slide.node,"SCRIPT"));
		slide.preloadables = slide.preloadables.concat(this.getElementsByTagName(slide.node,"IFRAME"));
		slide.preloadables = slide.preloadables.concat(this.getElementsByTagName(slide.node,"LINK"));
		slide.preloadables = slide.preloadables.concat(this.getElementsByTagName(slide.node,"SCRIPT"));
		slide.preloadables = slide.preloadables.concat(this.getElementsByTagName(slide.node,"STYLE"));
		//set up listeners to wait for everything to load
		//only if there are things to preload
		if (slide.preloadables.length > 0) {
			slide.preloadsRemaining = slide.preloadables.length;
			for (var i = 0; i < slide.preloadables.length; i++) {
				if (slide.preloadables[i].complete) {
					slide.preloadsRemaining--;
				}else {
					slide.preloadables[i].addEventListener('load',function(){
						console.log('preload element complete');
						slide.preloadsRemaining--;
					});
				}
			}
			slide.preloadWatcher = setInterval(function(){
				if (slide.preloadsRemaining <= 0) {
					slide.loaded = true;
					clearInterval(slide.preloadWatcher);
				}
			},50);
		}else {
			//nothing to preload, just display
			slide.loaded = true;
		}
	}
}
peCarousel.prototype.getElementsByTagName = function (obj,tagName) {
	var n = obj.getElementsByTagName(tagName);
	if (!n) {
		return [];
	}
	var r = [];
	for (var i = 0; i < n.length; i++) {
		r.push(n[i]);
	}
	return r;
}
peCarousel.prototype.preloadAround = function (slideNumber) {
	//preload forward
	var slideToPreload = slideNumber;
	for (var i = 0; i < this.options.preload_forward; i++) {
		slideToPreload = this.nextSlide(slideToPreload);
		if (slideToPreload != -1) {
			this.preloadSlide(slideToPreload);
		}
	}
	//preload backward
	var slideToPreload = slideNumber;
	for (var i = 0; i < this.options.preload_backward; i++) {
		slideToPreload = this.prevSlide(slideToPreload);
		if (slideToPreload != -1) {
			this.preloadSlide(slideToPreload);
		}
	}
}
peCarousel.prototype.nextSlide = function (slideNumber) {
	var loop = this.options.loop;
	slideNumber++;
	if (slideNumber >= this.slides.length) {
		slideNumber = loop?0:-1;
	}
	return slideNumber;
}
peCarousel.prototype.prevSlide = function (slideNumber) {
	var loop = this.options.loop;
	slideNumber--;
	if (slideNumber < 1) {
		slideNumber = loop?this.slides.length-1:-1;
	}
	return slideNumber;
}

/*
	options control, shouldn't need changing from one project to the next
*/
peCarousel.prototype.setOptions = function (options) {
	this.options = this.options?this.options:{};
	if (typeof(options) == 'object') {
		for (var prop in options) {
			if (options.hasOwnProperty(prop)) {
				this.options[prop] = options[prop];
			}
		}
	}
}
peCarousel.prototype.setDefaults = function (options) {
	this.options = this.options?this.options:{};
	if (typeof(options) == 'object') {
		for (var prop in options) {
			if (options.hasOwnProperty(prop) && !this.options.hasOwnProperty(prop)) {
				this.options[prop] = options[prop];
			}
		}
	}
}
/*
	Note to self, don't debounce in prototype methods, objects need their
	own debounced methods set up during construction
*/
peCarousel.prototype.debounce = function (func, threshold, execAsap) {
	var timeout;
	return function debounced () {
		var obj = this;
		var args = arguments;
		function delayed () {
			if (!execAsap) {
				func.apply(obj,args);
			}
			timeout = null;
		}
		if (timeout) {
			clearTimeout(timeout);
		}else if (execAsap) {
			func.apply(obj,args);
		}
		timeout = setTimeout(delayed,threshold||100);
	};
}