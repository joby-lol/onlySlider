/** @license
* onlySlider - MIT License
* Copyright (c) 2013 Joby Elliott
* http://go.byjoby.net/onlySlider
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

function onlySlider(obj,options) {
	this.setDefaults({
		preload_forward:0,
		preload_backward:0,
		loop:true,
		timer:5000,
		fixedHeight:false
	});
	this.setOptions(options);
	this.obj = obj;
	this.obj.setAttribute("class","onlySlider");
	//load slides
	this.slides = [];
	if (this.obj.children.length == 1 && this.obj.children[0].tagName == "NOSCRIPT") {
		var container = document.createElement('DIV');
		container.innerHTML = this.obj.children[0].textContent||this.obj.children[0].innerHTML;
	}else {
		var container = this.obj;
	}
	for (var i = 0; i < container.children.length; i++) {
		var slide = this.extractSlide(container.children[i]);
		if (slide) {
			this.slides.push(slide);
		}
	}
	this.obj.innerHTML = "";
	//add content container
	this.contentContainer = document.createElement("DIV");
	this.contentContainer.setAttribute("class","onlySlider-contentContainer");
	var pe = this;
	this.obj.appendChild(this.contentContainer);
	//add nodes to content container
	for (var i = 0; i < this.slides.length; i++) {
		this.contentContainer.appendChild(this.slides[i].node);
	}
	//add loading message
	this.loadingMessage = document.createElement("DIV");
	this.loadingMessage.setAttribute("class","onlySlider-loadingMessage onlySlider-loadingMessage-active");
	this.obj.appendChild(this.loadingMessage);
	//add controls
	this.dotControls = document.createElement("DIV");
	this.dotControls.setAttribute("class","onlySlider-dotControls");
	this.obj.appendChild(this.dotControls);
	this.arrowControls = document.createElement("DIV");
	this.arrowControls.setAttribute("class","onlySlider-arrowControls");
	this.obj.appendChild(this.arrowControls);
	var arrowControlClass = "onlySlider-arrowControl";
	this.arrowControls.prevArrow = document.createElement("A");
	this.arrowControls.prevArrow.innerHTML = "previous";
	this.arrowControls.prevArrow.setAttribute("class",arrowControlClass+" "+arrowControlClass+"-previous "+arrowControlClass+"-disabled");
	this.arrowControls.appendChild(this.arrowControls.prevArrow);
	this.arrowControls.nextArrow = document.createElement("A");
	this.arrowControls.nextArrow.innerHTML = "next";
	this.arrowControls.nextArrow.setAttribute("class",arrowControlClass+" "+arrowControlClass+"-next "+arrowControlClass+"-disabled");
	this.arrowControls.appendChild(this.arrowControls.nextArrow);
	//arrow event listeners
	this.addEvent(this.arrowControls.prevArrow,'click',function(){pe.setSlide(pe.prevSlide(pe.currentSlide))});
	this.addEvent(this.arrowControls.nextArrow,'click',function(){pe.setSlide(pe.nextSlide(pe.currentSlide))});
	//start at slide 0
	this.timer = false;
	this.currentSlide = -1;
	this.setSlide(0);
}
onlySlider.prototype.startTimer = function () {
	if (this.options.timer > 0) {
		//console.log('starting timer');
		if (this.timer) {
			//console.log('timer already exists ('+this.timer+')');
			this.stopTimer();
		}
		var pe = this;
		this.timer = setTimeout(function(){
			//console.log('timer ended');
			pe.stopTimer();
			pe.setSlide(pe.nextSlide(pe.currentSlide));
		},this.options.timer);
		//console.log('timer set ('+this.timer+')');
	}
}
onlySlider.prototype.stopTimer = function () {
	if (this.timer) {
		//console.log('clearing '+this.timer);
		clearTimeout(this.timer);
		this.timer = false;
	}
}
onlySlider.prototype.extractSlide = function (obj) {
	if (obj.tagName == "NOSCRIPT") {
		var html = obj.textContent||obj.innerHTML;
	}else {
		var html = obj.outerHTML||new XMLSerializer().serializeToString(node);
	}
	if (!html || /^<\!--.*-->$/.test(html)) {
		return false
	}
	return {
		node:document.createElement("DIV"),
		html:html
	};
}
onlySlider.prototype.render = function () {
	//set appropriate slide classes
	for (var i = 0; i < this.slides.length; i++) {
		if (this.slides[i].node) {
			var slideClassName = "onlySlider-slide";
			var slideClass = [slideClassName];
			if (i == this.currentSlide) {
				slideClass.push(slideClassName+"-current");
			}else {
				if (i == 0 && this.currentSlide == -1) {
					slideClass.push(slideClassName+"-next "+slideClassName+"-first");
				}else if (i == this.prevSlide(this.currentSlide)) {
					slideClass.push(slideClassName+"-prev");
				}else if (i == this.nextSlide(this.currentSlide)) {
					slideClass.push(slideClassName+"-next");
				}
				if (i > this.currentSlide) {
					slideClass.push(slideClassName+"-after "+slideClassName+"-after-by-"+(i-this.currentSlide));
				}
				if (i < this.currentSlide) {
					slideClass.push(slideClassName+"-before "+slideClassName+"-before-by-"+(this.currentSlide-i));
				}
			}
			this.slides[i].node.setAttribute('class',slideClass.join(" "));
		}
	}
	//set arrow control styles
	var arrowControlClass = "onlySlider-arrowControl";
	var nextSlide = this.nextSlide(this.currentSlide);
	if (nextSlide == -1) {
		this.arrowControls.nextArrow.setAttribute('class',''+arrowControlClass+' '+arrowControlClass+'-next '+arrowControlClass+'-disabled');
	}else {
		this.arrowControls.nextArrow.setAttribute('class',''+arrowControlClass+' '+arrowControlClass+'-next');
	}
	var prevSlide = this.prevSlide(this.currentSlide);
	if (prevSlide == -1) {
		this.arrowControls.prevArrow.setAttribute('class',''+arrowControlClass+' '+arrowControlClass+'-previous '+arrowControlClass+'-disabled');
	}else {
		this.arrowControls.prevArrow.setAttribute('class',''+arrowControlClass+' '+arrowControlClass+'-previous');
	}
	//draw dot controls
	this.dotControls.innerHTML = "";
	for (var i = 0; i < this.slides.length; i++) {
		var dot = document.createElement("A");
		dot.setAttribute('data-slideID',i);
		dot.innerHTML = i+1;
		//set dot's CSS class
		var dotClassName = "onlySlider-dot";
		var dotClass = [dotClassName];
		if (i == this.currentSlide) {
			dotClass.push(dotClassName+"-current");
		}else {
			if (i == 0 && this.currentSlide == -1) {
				dotClass.push(dotClassName+"-next "+dotClassName+"-first");
			}else if (i > this.currentSlide) {
				dotClass.push(dotClassName+"-after "+dotClassName+"-after-by-"+(i-this.currentSlide));
			}else if (i < this.currentSlide) {
				dotClass.push(dotClassName+"-before "+dotClassName+"-before-by-"+(this.currentSlide-i));
			}
		}
		dot.setAttribute('class',dotClass.join(' '));
		//set dot's event listener and append it
		var pe = this;
		this.addEvent(dot,'click',function(event){
			if (this.getAttribute) {
				pe.setSlide(this.getAttribute('data-slideID'));
			}else {
				pe.setSlide(event.srcElement.getAttribute('data-slideID'));
			}
		});
		this.dotControls.appendChild(dot);
	}
}
onlySlider.prototype.setSlide = function (slideNumber) {
	if (slideNumber >= 0) {
		this.render();
		this.displaySlide(slideNumber);
		this.preloadAround(slideNumber);
	}
}
onlySlider.prototype.displaySlide = function (slideNumber) {
	//preload slide
	this.preloadSlide(slideNumber);
	//display slide once it is loaded
	var loadingMessageClassName = "onlySlider-loadingMessage";
	var slide = this.slides[slideNumber];
	var pe = this;
	var display = function(){
		if (slide.loaded) {
			clearInterval(timer);
			pe.loadingMessage.setAttribute('class',loadingMessageClassName);
			//set which slide is active, set height, and animate
			if (pe.options.fixedHeight) {
				pe.obj.style.height = pe.options.fixedHeight+'px';
			}else {
				pe.obj.style.height = slide.node.offsetHeight+'px';
			}
			pe.currentSlide = slideNumber;
			pe.render();
			//start timer
			pe.startTimer();
		}else {
			pe.loadingMessage.setAttribute('class',loadingMessageClassName+' '+loadingMessageClassName+'-active');
		}
	}
	var timer = setInterval(function(){display()},50);
	display();
}
onlySlider.prototype.preloadSlide = function (slideNumber) {
	var slide = this.slides[slideNumber];
	if (!slide.loaded && !slide.loading) {
		slide.node.innerHTML = slide.html;
		slide.loading = true;
		//find preloadables
		var preloadables = [];
		preloadables = preloadables.concat(this.getElementsByTagName(slide.node,"IMG"));
		preloadables = preloadables.concat(this.getElementsByTagName(slide.node,"SCRIPT"));
		preloadables = preloadables.concat(this.getElementsByTagName(slide.node,"IFRAME"));
		preloadables = preloadables.concat(this.getElementsByTagName(slide.node,"LINK"));
		preloadables = preloadables.concat(this.getElementsByTagName(slide.node,"SCRIPT"));
		preloadables = preloadables.concat(this.getElementsByTagName(slide.node,"STYLE"));
		slide.preloadables = preloadables;
		//set up listeners to wait for everything to load
		//only if there are things to preload
		if (slide.preloadables.length > 0) {
			slide.preloadsRemaining = slide.preloadables.length;
			for (var i = 0; i < slide.preloadables.length; i++) {
				if (slide.preloadables[i].complete) {
					slide.preloadsRemaining--;
				}else {
					this.addEvent(slide.preloadables[i],'load',function(){
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
onlySlider.prototype.getElementsByTagName = function (obj,tagName) {
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
onlySlider.prototype.preloadAround = function (slideNumber) {
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
onlySlider.prototype.nextSlide = function (slideNumber) {
	var loop = this.options.loop;
	slideNumber++;
	if (slideNumber >= this.slides.length) {
		slideNumber = loop?0:-1;
	}
	return slideNumber;
}
onlySlider.prototype.prevSlide = function (slideNumber) {
	var loop = this.options.loop;
	slideNumber--;
	if (slideNumber < 0) {
		slideNumber = loop?this.slides.length-1:-1;
	}
	return slideNumber;
}

/*
	event listener compatibility polyfill
*/
onlySlider.prototype.addEvent = function (object,event,action) {
	if (!object.addEventListener) {
		return object.attachEvent("on"+event,action);
	}else {
		return object.addEventListener(event,action);
	}
}
/*
	options control, shouldn't need changing from one project to the next
*/
onlySlider.prototype.setOptions = function (options) {
	this.options = this.options?this.options:{};
	if (typeof(options) == 'object') {
		for (var prop in options) {
			if (options.hasOwnProperty(prop)) {
				this.options[prop] = options[prop];
			}
		}
	}
}
onlySlider.prototype.setDefaults = function (options) {
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
onlySlider.prototype.debounce = function (func, threshold, execAsap) {
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