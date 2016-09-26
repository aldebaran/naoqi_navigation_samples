/**
 * Extended by Praneet Loke(http://codejournal.wordpress.com/2012/02/26/ios-style-scroller-for-phonegap-app/).
 * Added showSlotValuesAfter and hideSlotValuesAfter for use with validating dates. See global/ScrollWheel.custom.js -> updateDates()
 * Added setScrollEndAction to allow setting a callback when a slot is scrolled (fired onScrollEnd)
 */

/**
 * 

 * Find more about the Spinning Wheel function at
 * http://cubiq.org/spinning-wheel-on-webkit-for-iphone-ipod-touch/11
 *
 * Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
 * Released under MIT license
 * http://cubiq.org/dropbox/mit-license.txt
 * 
 * Version 1.4 - Last updated: 2009.07.09
 * 
 */

var SpinningWheel = {
	cellHeight: 60,
	friction: 0.003,
	slotData: [],


	/**
	 *
	 * Event handler
	 *
	 */

	handleEvent: function (e) {
		if (e.type == 'touchstart') {
			this.calculateSlotsWidth();
			this.lockScreen(e);
			if (e.currentTarget.id == 'sw-frame') {
				this.scrollStart(e);
			}
		} else if (e.type == 'touchmove') {
			this.lockScreen(e);
			 if (e.currentTarget.id == 'sw-frame') {
				this.scrollMove(e);
			}
		} else if (e.type == 'touchend') {
			if (e.currentTarget.id == 'sw-frame') {
				this.scrollEnd(e);
				var self = this;
				setTimeout(function () {
					self.scrollEndAction.apply(self, [self.activeSlot])
				}, 100);
			}
		} else if (e.type == 'webkitTransitionEnd') {
			this.backWithinBoundaries(e);
		}
	},


	/**
	 *
	 * Global events
	 *
	 */

	lockScreen: function (e) {
		e.preventDefault();
		e.stopPropagation();
	},


	/**
	 *
	 * Initialization
	 *
	 */

	reset: function () {
		this.slotEl = [];

		this.activeSlot = null;
		
		this.swWrapper = undefined;
		this.swSlotWrapper = undefined;
		this.swSlots = undefined;
		this.swFrame = undefined;
	},

	calculateSlotsWidth: function () {
		var div = this.swSlots.getElementsByTagName('div');
		for (var i = 0; i < div.length; i += 1) {
			this.slotEl[i].slotWidth = div[i].offsetWidth;
		}
	},

	create: function () {
		var i, l, out, ul, div;

		this.reset();	// Initialize object variables

		// Create the Spinning Wheel main wrapper

		document.getElementById('sw-container').innerHTML = ''; // reset the container
		
		container = document.createElement('div') // create the container
		container.innerHTML = '<div id="sw-slots-wrapper"> <div id="sw-slots"></div> </div> <div id="sw-frame"></div> </div>'
		container.style.webkitTransitionProperty = '-webkit-transform';
		document.body.appendChild(container) // add it to the body temporary

		this.swWrapper = container; // The SW wrapper
		this.swSlotWrapper = document.getElementById('sw-slots-wrapper');		// Slots visible area
		this.swSlots = document.getElementById('sw-slots');						// Pseudo table element (inner wrapper)
		this.swFrame = document.getElementById('sw-frame');						// The scrolling controller

		// Create HTML slot elements
		for (l = 0; l < this.slotData.length; l += 1) {
			// Create the slot
			ul = document.createElement('ul');
			out = '';
			for (i in this.slotData[l].values) {
				out += '<li id="' + l + "_" + this.slotData[l].values[i] + 'LI">' + this.slotData[l].values[i] + '<' + '/li>';
			}
			ul.innerHTML = out;

			div = document.createElement('div');		// Create slot container
			div.className = this.slotData[l].style;		// Add styles to the container
			div.appendChild(ul);
	
			// Append the slot to the wrapper
			this.swSlots.appendChild(div);
			
			ul.slotPosition = l;			// Save the slot position inside the wrapper
			ul.slotYPosition = 0;
			ul.slotWidth = 0;
			ul.slotMaxScroll = this.swSlotWrapper.clientHeight - ul.clientHeight - 24;  // add offset to fix the last element
			ul.style.webkitTransitionTimingFunction = 'cubic-bezier(0, 0, 0.2, 1)';		// Add default transition
			
			this.slotEl.push(ul);			// Save the slot for later use
			
			// Place the slot to its default position (if other than 0)
			if (this.slotData[l].defaultValue) {
				this.scrollToValue(l, this.slotData[l].defaultValue);
			}
		}
		
		document.getElementById('sw-container').innerHTML = '';
		document.getElementById('sw-container').appendChild(container)

		// Add scrolling to the slots
		this.swFrame.addEventListener('touchstart', this, false);
	},

	open: function () {
		this.create();
	},
	
	
	/**
	 *
	 * Unload
	 *
	 */

	destroy: function () {
		try{
			this.swWrapper.removeEventListener('webkitTransitionEnd', this, false);
			this.swFrame.removeEventListener('touchstart', this, false);
		}catch(e){
			
		}

		document.removeEventListener('touchstart', this, false);
		document.removeEventListener('touchmove', this, false);
		
		this.slotData = [];
		this.cancelAction = function () {
			return false;
		};
		
		this.cancelDone = function () {
			return true;
		};
		
		this.scrollEndAction = function () {
			return false;
		};
		
		this.selectedItemAction = function(){
			return false;
		}
		
		this.reset();
		
		//document.body.removeChild(document.getElementById('sw-wrapper'));
	},
	
	/**
	 *
	 * Generic methods
	 *
	 */

	addSlot: function (values, style, defaultValue) {
		if (!style) {
			style = '';
		}
		
		style = style.split(' ');

		for (var i = 0; i < style.length; i += 1) {
			style[i] = 'sw-' + style[i];
		}
		
		style = style.join(' ');

		var obj = { 'values': values, 'style': style, 'defaultValue': defaultValue };
		this.slotData.push(obj);
	},

	getSelectedValues: function () {
		var index, count,
		    i, l,
			keys = [], values = [];

		for (var i = 0 ; i < this.slotEl.length ; i++) {
			// Remove any residual animation
			this.slotEl[i].removeEventListener('webkitTransitionEnd', this, false);
			this.slotEl[i].style.webkitTransitionDuration = '0';

			if (this.slotEl[i].slotYPosition > 0) {
				this.setPosition(i, 0);
			} else if (this.slotEl[i].slotYPosition < this.slotEl[i].slotMaxScroll) {
				this.setPosition(i, this.slotEl[i].slotMaxScroll);
			}

			index = -Math.round(this.slotEl[i].slotYPosition / this.cellHeight);

			count = 0;
			for (l in this.slotData[i].values) {
				if (count == index) {
					keys.push(l);
					values.push(this.slotData[i].values[l]);
					break;
				}
				
				count += 1;
			}
		}

		return { 'keys': keys, 'values': values };
	},

	getSlotValue: function(slot) {
		if(slot < 0 || slot >= this.slotEl.length){
			return { 'keys': null, 'values': null };
		}
		var index, count,
	    l,
		keys = [], values = [];

		index = -Math.round(this.slotEl[slot].slotYPosition / this.cellHeight);
		index += 1;
		keys.push(index);
		values.push(this.slotData[slot].values[index]);
	
		return { 'keys': keys, 'values': values };
	},
	
	hideSlotValuesAfter: function(slot, lastKey, length) {
		if(typeof length === 'undefined' || length == null){
			console.log("did you forget to pass the length of this slot to hideSlotValuesAfter?");
			return false;
		}
		lastKey++;
		var thisSlot = null;
		//console.log("slot ul slotMaxScroll: " + this.slotEl[slot].slotMaxScroll);
		while(lastKey <= length){
			thisSlot = document.getElementById(slot + "_" + lastKey + "LI");
			this.slotEl[slot].removeChild(thisSlot);
			lastKey += 1;
		}
		this.slotEl[slot].slotMaxScroll = this.swSlotWrapper.clientHeight - this.slotEl[slot].clientHeight - 86;
		//console.log("UPDATED slot ul slotMaxScroll: " + this.slotEl[slot].slotMaxScroll);
		thisSlot = null;
	},
	
	showSlotValuesAfter: function(slot, lastKey, length) {
		if(typeof length === 'undefined' || length == null){
			console.log("did you forget to pass the length of this slot to showSlotValuesAfter?");
			return false;
		}
		lastKey++;
		//console.log("slot ul slotMaxScroll: " + this.slotEl[slot].slotMaxScroll);
		while(lastKey <= length){
			//'<li id="' + slot + "_" + lastKey + 'LI">' + lastKey + '</li>';
			var existingLI = document.getElementById(slot + "_" + lastKey + "LI");
			if(typeof existingLI === 'undefined' || existingLI == null){
				var LI = document.createElement("LI");
				LI.id = slot + "_" + lastKey + "LI";
				LI.textContent = lastKey;
				this.slotEl[slot].appendChild(LI);
				LI = null;
			}
			lastKey += 1;
		}
		this.slotEl[slot].slotMaxScroll = this.swSlotWrapper.clientHeight - this.slotEl[slot].clientHeight - 86;
		//console.log("UPDATED slot ul slotMaxScroll: " + this.slotEl[slot].slotMaxScroll);
		thisSlot = null;
	},

	/**
	 *
	 * Rolling slots
	 *
	 */

	setPosition: function (slot, pos) {
		this.slotEl[slot].slotYPosition = pos;
		this.slotEl[slot].style.webkitTransform = 'translate3d(0, ' + pos + 'px, 0)';
	},
	
	scrollStart: function (e) {
		// Find the clicked slot
		var xPos = e.targetTouches[0].clientX -  this.swSlots.getBoundingClientRect().left ;	// Clicked position minus left offset (should be 11px)

		// Find tapped slot
		var slot = 0;
		for (var i = 0; i < this.slotEl.length; i += 1) {
			slot += this.slotEl[i].slotWidth;
			
			if (xPos < slot) {
				this.activeSlot = i;
				break;
			}
		}

		// If slot is readonly do nothing
		if (this.slotData[this.activeSlot].style.match('readonly')) {
			this.swFrame.removeEventListener('touchmove', this, false);
			this.swFrame.removeEventListener('touchend', this, false);
			return false;
		}

		this.slotEl[this.activeSlot].removeEventListener('webkitTransitionEnd', this, false);	// Remove transition event (if any)
		this.slotEl[this.activeSlot].style.webkitTransitionDuration = '0';		// Remove any residual transition
		
		// Stop and hold slot position
		var theTransform = window.getComputedStyle(this.slotEl[this.activeSlot]).webkitTransform;
		theTransform = new WebKitCSSMatrix(theTransform).m42;
		if (theTransform != this.slotEl[this.activeSlot].slotYPosition) {
			this.setPosition(this.activeSlot, theTransform);
		}
		
		this.startY = e.targetTouches[0].clientY;
		this.scrollStartY = this.slotEl[this.activeSlot].slotYPosition;
		this.scrollStartTime = e.timeStamp;

		this.swFrame.addEventListener('touchmove', this, false);
		this.swFrame.addEventListener('touchend', this, false);
		
		return true;
	},

	scrollMove: function (e) {
		var topDelta = e.targetTouches[0].clientY - this.startY;

		if (this.slotEl[this.activeSlot].slotYPosition > 0 || this.slotEl[this.activeSlot].slotYPosition < this.slotEl[this.activeSlot].slotMaxScroll) {
			topDelta /= 2;
		}
		
		this.setPosition(this.activeSlot, this.slotEl[this.activeSlot].slotYPosition + topDelta);
		this.startY = e.targetTouches[0].clientY;

		// Prevent slingshot effect
		if (e.timeStamp - this.scrollStartTime > 80) {
			this.scrollStartY = this.slotEl[this.activeSlot].slotYPosition;
			this.scrollStartTime = e.timeStamp;
		}
	},
	
	scrollEnd: function (e) {
		this.swFrame.removeEventListener('touchmove', this, false);
		this.swFrame.removeEventListener('touchend', this, false);

		// If we are outside of the boundaries, let's go back to the sheepfold
		if (this.slotEl[this.activeSlot].slotYPosition > 0 || this.slotEl[this.activeSlot].slotYPosition < this.slotEl[this.activeSlot].slotMaxScroll) {
			this.scrollTo(this.activeSlot, this.slotEl[this.activeSlot].slotYPosition > 0 ? 0 : this.slotEl[this.activeSlot].slotMaxScroll);
			return false;
		}

		// Lame formula to calculate a fake deceleration
		var scrollDistance = this.slotEl[this.activeSlot].slotYPosition - this.scrollStartY;

		// The drag session was too short
		if (scrollDistance < this.cellHeight / 1.5 && scrollDistance > -this.cellHeight / 1.5) {
			if (this.slotEl[this.activeSlot].slotYPosition % this.cellHeight) {
				this.scrollTo(this.activeSlot, Math.round(this.slotEl[this.activeSlot].slotYPosition / this.cellHeight) * this.cellHeight, '100ms');
			}

			return false;
		}

		var scrollDuration = e.timeStamp - this.scrollStartTime;

		var newDuration = (2 * scrollDistance / scrollDuration) / this.friction;
		var newScrollDistance = (this.friction / 2) * (newDuration * newDuration);
		
		if (newDuration < 0) {
			newDuration = -newDuration;
			newScrollDistance = -newScrollDistance;
		}

		var newPosition = this.slotEl[this.activeSlot].slotYPosition + newScrollDistance;

		if (newPosition > 0) {
			// Prevent the slot to be dragged outside the visible area (top margin)
			newPosition /= 2;
			newDuration /= 3;

			if (newPosition > this.swSlotWrapper.clientHeight / 4) {
				newPosition = this.swSlotWrapper.clientHeight / 4;
			}
		} else if (newPosition < this.slotEl[this.activeSlot].slotMaxScroll) {
			// Prevent the slot to be dragged outside the visible area (bottom margin)
			newPosition = (newPosition - this.slotEl[this.activeSlot].slotMaxScroll) / 2 + this.slotEl[this.activeSlot].slotMaxScroll;
			newDuration /= 3;
			
			if (newPosition < this.slotEl[this.activeSlot].slotMaxScroll - this.swSlotWrapper.clientHeight / 4) {
				newPosition = this.slotEl[this.activeSlot].slotMaxScroll - this.swSlotWrapper.clientHeight / 4;
			}
		} else {
			newPosition = Math.round(newPosition / this.cellHeight) * this.cellHeight;
		}

		this.scrollTo(this.activeSlot, Math.round(newPosition), Math.round(newDuration) + 'ms');
		return true;
	},

	scrollTo: function (slotNum, dest, runtime) {
		this.slotEl[slotNum].style.webkitTransitionDuration = runtime ? runtime : '100ms';
		this.setPosition(slotNum, dest ? dest : 0);
		
		// If we are outside of the boundaries go back to the sheepfold
		if (this.slotEl[slotNum].slotYPosition > 0 || this.slotEl[slotNum].slotYPosition < this.slotEl[slotNum].slotMaxScroll) {
			this.slotEl[slotNum].addEventListener('webkitTransitionEnd', this, false);
		}
		
		this.setSelectedItem(slotNum);
	},
	
	setSelectedItem: function(slot){
		index = -Math.round(this.slotEl[slot].slotYPosition  / this.cellHeight);
		for(var c in this.slotEl[slot].childNodes){
			this.slotEl[slot].childNodes[c].className = (c == index)? 'selected ' : '';
		}
		
		try{
			this.onValueSelectedAction(slot, index);
		}catch(e){ }
	},
	
	scrollToValue: function (slot, value) {
		var yPos, count, i;

		if (!this.slotEl)  return; // if  the spinning wheel is not initialized yet.

		this.slotEl[slot].removeEventListener('webkitTransitionEnd', this, false);
		this.slotEl[slot].style.webkitTransitionDuration = '200ms';
		
		count = 0;
		for (i in this.slotData[slot].values) {
			if (i == value) {
				yPos = count * this.cellHeight;
				this.setPosition(slot, yPos);
				break;
			}
			
			count -= 1;
		}

		this.setSelectedItem(slot);
	},
		
	backWithinBoundaries: function (e) {
		e.target.removeEventListener('webkitTransitionEnd', this, false);
		
		this.scrollTo(e.target.slotPosition, e.target.slotYPosition > 0 ? 0 : e.target.slotMaxScroll, '150ms');
		return false;
	},


	/**
	 *
	 * Buttons
	 *
	 */

	tapDown: function (e) {
		e.currentTarget.addEventListener('touchmove', this, false);
		e.currentTarget.addEventListener('touchend', this, false);
		e.currentTarget.className = 'sw-pressed';
	},

	tapCancel: function (e) {
		e.currentTarget.removeEventListener('touchmove', this, false);
		e.currentTarget.removeEventListener('touchend', this, false);
		e.currentTarget.className = '';
	},
	
	tapUp: function (e) {
		this.tapCancel(e);

		if (e.currentTarget.id == 'sw-cancel') {
			this.cancelAction();
		} else {
			this.doneAction();
		}
		
		this.close();
	},

	setCancelAction: function (action) {
		this.cancelAction = action;
	},

	setDoneAction: function (action) {
		this.doneAction = action;
	},
	
	setSlotScrollEndAction: function(action) {
		this.scrollEndAction = action;
	},
	
	onValueSelected: function(action){
		this.onValueSelectedAction = action
	},
	
	//default handlers
	cancelAction: function () {
		return false;
	},

	cancelDone: function () {
		return true;
	},
	
	scrollEndAction: function () {
		return false;
	}
};