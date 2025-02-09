// SEMI WORKING ALPHA , Made by Lucky Dee designwaffle@gmail.com

// MAIN
function elCanvas(container, props) {

	"use strict";

	var me = this;

	// ctx command chainer
	this._chain_ctx = function(obj) {

		var _this = this;
		this.passthrough = [
		 "createImageData", "createLinearGradient", "createPattern", "createRadialGradient", "getImageData", "getLineDash", "isPointInPath", "isPointInStroke", "measureText"
		]
		this.obj = obj;
		var _loop = function(method) {
			if (typeof obj[method] === 'function') {
				_this[method] = function() {
					_this.obj[method].apply(_this.obj, arguments);
					if (_this.passthrough.indexOf(method) > -1) {
						return _this.obj[method].apply(_this.obj, arguments);
					} else {
						return _this;
					}
				};
			}
		};
		for (var method in obj) {
			_loop(method);
		}
		_this.set = function(prop, val) {
			this.obj[prop] = val;
			return this;
		};

	}

	// if no props have been supplied create an empty container for future props instead
	if(!props){props={images:{}}}
	// supply an empty image object in case none is specified
	if(!props.images){props.images={}}

	// allows chaining
	this.ctx = new this._chain_ctx(container.getContext('2d'))
	this.ctx.canvas = container;

	// setup custom canvas properties
	this.width = props.width ? props.width : container.offsetWidth;
	this.height = props.height ? props.height : container.offsetHeight;

	this.center = {
		x: this.width / 2,
		y: this.height / 2
	}

	this.images = props ? props.images : {};
	// if you want to start animating from the center turn this on
	this.AlignToCenter = props ? props.AlignToCenter : false;

	// container for keeping objects which will loop
	this.objects = [];
	this.objectsCount = 0;
	this.firstFrame = true;

	// list of custom shapes you can push a custom shape key into
	this.customShapes = {};

	// utility function container
	this._util = {};

	// declaration of all objects on stage, must add to this array to create future ones
	this.objectTypes = ['rect', 'circle', 'line', 'quadLine','image', 'shape', 'text', 'sprite'];

	// fall back styling for when no shape_styles are made
	this.defaultStyles = {
		fallback: {

			lineWidth: 0.001,
			fillStyle: '#' + Math.floor(Math.random() * 16777215).toString(16),
			strokeStyle: "#ffffff"
		},
		rect: {

			fillStyle: '#' + Math.floor(Math.random() * 16777215).toString(16),

		},
		text: {
			fillStyle: '#' + Math.floor(Math.random() * 16777215).toString(16),
			font: "30px museo300",
			fillStyle: '#ff0000',
			textAlign: "center"
		},
		line: {
			strokeStyle: "#ff0000",
			lineWidth: 5,
			lineCap: 'round'
		},
		quadLine: {
			strokeStyle: "#ff0000",
			lineWidth: 5,
			lineCap: 'round'
		},
		image: {
			src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAA+CAMAAABeI7j4AAAAkFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADDIYgjAAAAL3RSTlMA+/kEUo+SouQeRw3FBvLhpjOfl3EWq3NMJNzCjIRa0bpOQy8rCep+ZmM5LtLMs4FqBYIAAAHLSURBVEjH5dTbcoIwEIDh3YRa1FKqFOr5rLXadt//7bqs6KqDSfS2/zgchG8Ckyg80LrpLQew56QVx2nsiq++X5qIAqqMEvRkTkYJf8zNiEiNEl9qlMTDl/qGP+bCKMmgXR+sYsKD+SiNkhHcKk/5uholDbC1JdCXUdScyBPUZ6EpRI2f6ChqgkZRsw0hKRmU2CAVIQ/2Suc9+wiXj966ZdkMCYOItjBk7iIWWveSxEWsBc2GjFIDfARWHb0tX4hzEJmHQdzhnRwnBX2JcRFYfRMNxCSQvBEZNm6ynJIxYipBZusmybD8WowI5GPcgXUQmLweTLoHEXwpa3veZS4GaToTIVesm0CvMufCSawY5O+QVNwgauab6neowrtgouODdcvZCSFJRhLSdAngJ/YwH9W7pB3vg6kgUuMZZX0URjal8ZC2CL40jja8E+MmtiBkIedRtXbivXuNjfismkFZB3zy0ncT+NQZPKy3Ye5eY1bMiA+Oa2eWB6yxcUN2spkUzZA1JhvNv8b0Ls1Pwv/66vsPBB8hDbCJdbWG3hUZg7fd1bv8tiJPi/EVwYDkRiXBKUFzFpq65FmOxGBwQiZ0VwWTZda4o2wCj/QHW46eA37RLLEAAAAASUVORK5CYII=",
			object: {}
		}
	}
	// fallback properties for when drawing shapes
	this.defaultProps = {
		fallback: {
			globalCompositeOperation: "source-over",
			transformOrigin: "50% 50%",
			x: 0,
			y: 0,
			xOffset: me.AlignToCenter ? me.center.x : 0,
			yOffset: me.AlignToCenter ? me.center.y : 0,
			scaleX: 1,
			scaleY: 1,
			scale: 1,
			opacity: 1,
			rotation: 0,
			zIndex: 0,
			parent: {
				id: "dummyParent"
			}
		},
		circle: {
			radius: 50
		},
		line: {
			x1: 0,
			y1: 0,
			x2: 100,
			y2: 100
		},
		quadLine: {
			x1: 0,
			y1: 0,
			qx:0,
			qy:50,
			x2: 100,
			y2: 100
		},
		rect: {
			width: 100,
			height: 100
		},
		image: {
			rounded: false
		},
		sprite: {
			width: 32,
			height: 32,
			framesArray: [],
			playing: 'on',
			frameIn: 0,
			frameCurrent: 0,
			frameOut: false,
			fps: 24,
			thenTick: Date.now()
		}
	};
	// 0 -  self execututing on init function, this will create all of the dynamic functions to create shapes
	this.constructor = function() {
		// -- DRAW SHAPE BASED OFF PROPS --

		me.objectTypes.forEach(function(item) {

			// if theres no default props for me yet, make an empty object for them
			me.defaultProps[item] = me.defaultProps[item] ? me.defaultProps[item] : me.defaultProps.fallback;

			// same with styling
			me.defaultStyles[item] = me.defaultStyles[item] ? me.defaultStyles[item] : me.defaultStyles.fallback;

			me[item] = function(props, arrayPosition) {
				props = me._util.init_check_props_push(props, item);
				return props;
			}
		});
	}();
	// 1 - apply styling to item
	this.styleShape = function(shape_styles, type) {
		Object.keys(shape_styles).forEach(function(key) {
			me.ctx.set(key, shape_styles[key])
		});
	};
	// loop trough all the parent levels and translate based of that
	this.recursiveLoop_checkForParent = function(props) {
		var parentExists = props.parent.id != 'dummyParent';
		if (parentExists) {
			me.recursiveLoop_checkForParent(props.parent);
			me.translateScaleRotate(props.parent);
		}
	};
	// apply this to this, all the parents first! , the context translation doesn't need to be reset yet
	this.translateScaleRotate = function(props,parentLevel) {
		var tO = props.transformOrigin.replace(/%/g, "").split(' ');
		me.ctx.translate(props.x, props.y)
		// scale and rotaton
			.translate(props.width * (Number(tO[0]) / 100), props.height * (Number(tO[1]) / 100))
			.scale(props.scaleX, props.scaleY)
			.rotate(props.rotation * Math.PI / 180)
			.translate(-props.width * (Number(tO[0]) / 100), -props.height * (Number(tO[1]) / 100))
	};
	// 2 - Draw item
	this.drawShape = function(props) {
		// save current context 
		me.ctx.save();

		me.ctx.set("globalCompositeOperation", props.globalCompositeOperation)
		// loop trough parents and apply their transformations first, this is for parenting
		// center things if center's on!
		me.ctx.translate(me.defaultProps.fallback.xOffset , me.defaultProps.fallback.yOffset);


		me.recursiveLoop_checkForParent(props);
		me.translateScaleRotate(props);
	};
	// 3 - fill/stroke item
	this.fillAndStroke = function(style, opacity) {
		me.ctx.set("globalAlpha", opacity);
		if (style.fillStyle) {
			me.ctx.fill();
		}
		if (style.strokeStyle) {
			me.ctx.stroke();
		}
	};
	// SHAPE functions
	this.shapes = {
		rect: function(p) {

			me.drawShape(p);

			if (p.radius) {
				me._util.shapes.roundRect(0, 0, p.width, p.height, p.radius)
			} else {
				me._util.shapes.normalRect(0, 0, p.width, p.height)
			};
			me.fillAndStroke(p.style, p.opacity);

		},
		circle: function(p) {
			me.drawShape(p);
			me._util.shapes.circle(0, 0, p.radius);
			me.fillAndStroke(p.style, p.opacity);

		},
		line: function(p) {
			p.x = p.x1;
			p.y = p.y1;

			me.drawShape(p);
			// translate back
			me.ctx.beginPath()
				.moveTo(0, 0)
				.lineTo(p.x2 - p.x1, p.y2 - p.y1);
			me.fillAndStroke(p.style, p.opacity);

		},
		quadLine: function(p) {

				p.x = p.x1;
				p.y = p.y1;
			me.drawShape(p);
			// translate back
			me.ctx.beginPath()
				.moveTo(0, 0)
				.quadraticCurveTo( p.qx,p.qy,p.x2 - p.x1,p.y2 - p.y1);
			me.fillAndStroke(p.style, p.opacity);

		},
		image: function(p) {
			// if there is an image in the array use it, otherwise use the fallback
			var image = me.images[p.id] || me.defaultStyles.image.object;
			// if there are no predefined width/height use the image ones
			p.width = p.width ? p.width : image.width;
			p.height = p.height ? p.height : image.height;
			me.drawShape(p);
			me.fillAndStroke('empty', p.opacity);
			// rounded image addition
			if (p.rounded) {
				me._util.shapes.roundRect(0, 0, p.width, p.height, p.rounded)
				me.ctx.clip();
			}
			me.ctx.drawImage(image, 0, 0, p.width, p.height)
			me.fillAndStroke(p.style, 'empty');

		},
		sprite: function(p) {
			// if there is an image in the array use it, otherwise use the fallback
			var image = me.images[p.id] ? me.images[p.id] : me.defaultStyles.image.object;

			// me.ctx.drawImage(image, frames[currentFrame].x,frames[currentFrame].y, p.width, p.height,0, 0, p.width, p.height);
			//
			// if there are no frames set them up
			if (p.framesArray.length == 0) {
				var frames_W = image.width / p.width,
					frames_H = image.height / p.height,
					frameCount = frames_W * frames_H;

				p.frameCurrent = p.frameIn;
				// if the end frame is smaller than the beginning frame(or i haven't defined it) make it the length of the sprite animation
				if (p.frameOut < p.frameIn) {
					p.frameOut = frameCount;
				}
				for (var i = 0; i < frames_W; i++) {
					for (var y = 0; y < frames_H; y++) {
						p.framesArray.push({
							x: p.width,
							y: y * p.height
						})
					}
				}
			}
			me.drawShape(p);
			me.fillAndStroke('empty', p.opacity);
			me.ctx.drawImage(image, p.framesArray[p.frameCurrent].x, p.framesArray[p.frameCurrent].y, p.width, p.height, 0, 0, p.width, p.height);
			me.fillAndStroke(p.style, 'empty');
			if (p.playing == 'on') {
				var timestep = 1000 / p.fps;
				var now = Date.now();
				var delta = now - p.thenTick;
				if (delta > timestep) {
					p.thenTick = now - (delta % timestep);
					p.frameCurrent == p.frameOut ? p.frameCurrent = p.frameIn : p.frameCurrent++;
				}
			}
			var currentFrame = p.frame_tick;
		},
		text: function(p) {
			me.drawShape(p);

			// its here on purpose to be before every other command since filltext behaves difernetly
			me.fillAndStroke('empty', p.opacity);

			// if theres a limiter for text width scale down text to fit it
			if (p.maxWidth) {
				var textWidth = me.ctx.measureText(p.text).width;
				if (p.maxWidth < textWidth) {
					var yScale = p.maxWidth / textWidth;
					me.ctx.scale(1, yScale);
				}
				if (p.style.strokeStyle) {
					me.ctx.strokeText(p.text, 0, 0, p.maxWidth);
				}
				me.ctx.fillText(p.text, 0, 0, p.maxWidth)
			} else {
				if (p.style.strokeStyle) {
					me.ctx.strokeText(p.text, 0, 0);
				}
				me.ctx.fillText(p.text, 0, 0)
			}
		},
		shape: function(p) {
			me.drawShape(p)
			/* it can either take the function directly
			or if it's a string it can check if it matches to
			any of the pre built shapes id and fire it
			*/
			if (typeof p.customShape === "function") {
				p.customShape(this);
			}else if(el.customShapes[p.customShape]){
				el.customShapes[p.customShape]();
			}
			me.fillAndStroke(p.style, p.opacity);
		}
	};
	// UPDATE loop function
	this.update = function() {
		// rearange zindex on first loop
		if (me.firstFrame) {
			me._util.addParents(me.objects);
			me.objects.sort(function(a, b) {
				return (b.zIndex - a.zIndex) * -1;
			});

		}
		// clear stage
		me.ctx.clearRect(0, 0, me.width, me.height);
		// loop through objects and draw them, objects have been defined  and pushed to array in the _util.init_check_props_push functiton
		for (var update_i = 0; update_i < me.objectsCount; update_i++) {

			var activeObject = me.objects[update_i];
			// scale object
			me._util.setObjectScale(activeObject);
			// style object
			me.styleShape(me.objects[update_i].style, me.objects[update_i].type);
			// draw object
			me.shapes[activeObject.type](activeObject);
			//restore to what the canvas was, most object functions contain a .save so this resets them
			me.ctx.restore();
		}

		me.firstFrame = false;
	};
	// resorts objects in the Update loop
	this.resetZIndex = function(){
		me.objects.sort(function(a, b) {
			return (b.zIndex - a.zIndex) * -1;
		});
	}
	// REMOVE function, removes object and cleans the stage up for future loops from object
	this.remove = function(obj){
		var objectIndex = this.objects.indexOf(obj);
		if(obj instanceof Array){
			for(var i=0;i<obj.length;i++){
				this.remove(obj[i])
			}
		}else if(objectIndex<0){
			console.warn("EL: Object you're trying to remove is not in elCanvas");
		} else{
			// remove children
			if(obj.childNodes){
				for(var i=0;i<obj.childNodes.length;i++){
					var childObject = obj.childNodes[i]
					var childIndex = this.objects.indexOf(childObject);
					this.objects.splice(childIndex, 1);
					this.objectsCount--;
				}
			}
			// then parent
			this.objects.splice(objectIndex, 1);
			this.objectsCount--;
		}
	}
	// utlitiy funcitons
	// on creating an object e.g. el.rect it this will check its propertiers innitially and it to the objects array
	this._util = {
		shapes: {
			circle: function(x, y, r) {
				return me.ctx.beginPath().arc(x, y, r, 0, 2 * Math.PI, false).closePath();
			},
			normalRect: function(x, y, w, h) {
				return me.ctx.beginPath().rect(x, y, w, h).closePath();
			},
			roundRect: function(x, y, w, h, r) {
        var cornerRadius={ tl: r, tr: r, bl: r, br: r };
        if(typeof r=='object'){
          cornerRadius=r;
        }
        return me.ctx.beginPath()
              .moveTo(x + cornerRadius.tl, y)
              .lineTo(x + w - cornerRadius.tr, y)
              .quadraticCurveTo(x + w, y, x + w, y + cornerRadius.tr)
              .lineTo(x + w, y + h - cornerRadius.br)
              .quadraticCurveTo(x + w, y + h, x + w - cornerRadius.br, y + h)
              .lineTo(x + cornerRadius.bl, y + h)
              .quadraticCurveTo(x, y + h, x, y + h - cornerRadius.bl)
              .lineTo(x, y + cornerRadius.tl)
              .quadraticCurveTo(x, y, x + cornerRadius.tl, y)
              .closePath();
			}
		},
		init_check_props_push: function(props, type, count) {
			// check if any custom values are written, if not use the default props
			if (!props) {
				props = {}
			}
			if (!props.style) {
				props.style = {}
			}
			props.type = type;
			// check for missing props, swap with default props
			me._util.replaceIfDoesntExist(props, me.defaultProps.fallback);
			// check for missing props unique to this object type
			me._util.replaceIfDoesntExist(props, me.defaultProps[type]);
			me._util.replaceIfDoesntExist(props.style, me.defaultStyles[type]);

			// SAFARI FIX
			if (type == 'text') {
				if (props.style['textBaseline'] == 'safari') {
					delete props.style['textBaseline'];
				}
			};

			if (type == 'image' || type == 'sprite') {

				if (!me.images[props.id]) {
					// if there is a missing image create a backup image
					var img = new Image();
					img.src = me.defaultStyles.image.src;
					img.id = 'backup';
					me.defaultStyles.image.object = img;
				}
			};
			me.objects.push(props);
			me.objectsCount = me.objects.length;
			return props;
		},
		replaceIfDoesntExist: function(providedObject, newObject) {
			Object.keys(newObject).forEach(function(key, value) {
				if (!providedObject[key] && providedObject[key] !== 0) {
					providedObject[key] = newObject[key];
				}
			})
		},
		setObjectScale: function(props) {
			if (props.scale != 1) {
				props.scaleX = props.scale;
				props.scaleY = props.scale;
			}
		},
		shuffleArray: function(array) {
			for (var i = array.length - 1; i > 0; i--) {
				var j = Math.floor(Math.random() * (i + 1));
				var temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
		},
		addParents: function(objects) {
			// go through every object searching for objects that have parents
			for (var i = 0; i < objects.length; i++) {

				//if there isnt a childnodes object add one
				if (objects[i].parent.id != "dummyParent") {
					// the children inherit its parent's z
					objects[i].zIndex += objects[i].parent.zIndex;
					if (!objects[i].parent.childNodes) {
						objects[i].parent.childNodes = []
					}
					//  push all new kids into its object
					objects[i].parent.childNodes.push(objects[i]);
				}
			}
		},
		/*  Generate an Image for a radial gradient, with the given inner and outer colour stops.
             Useful to generate quick sprite images of blurred spheres for explosions, particles etc.
       */
		generateRadialGradientBitmap: function(id, size, innerColour, outerColour) {
			var buffer = document.createElement('canvas'),
				width = size << 1;
			buffer.width = buffer.height = width;
			var ctx = buffer.getContext('2d'),
				radgrad = ctx.createRadialGradient(size, size, size >> 1, size, size, size);
			radgrad.addColorStop(0, innerColour);
			radgrad.addColorStop(1, outerColour);
			ctx.fillStyle = radgrad;
			ctx.fillRect(0, 0, width, width);
			var img = new Image();
			img.src = buffer.toDataURL("image/png");
			me.images[id] = img;
		}
	};
};
//utility solely for testing, will never be called in the game but will be used in testing
function el_imageLoad(imageURL, completeFunction) {
	if (imageURL.length == 0) {
		// ('no images');
		completeFunction([]);
	}
	var imagesLoaded = 0;
	var imageOBJ = {};
	[].forEach.call(imageURL, function(imageURL, index) {
		var img = new Image();
		img.src = imageURL.url;
		img.id = imageURL.id;
		img.addEventListener('load', imageLoad_check, false);
	});

	function imageLoad_check() {
		imageOBJ[this.id] = this;
		imagesLoaded++;
		if (imagesLoaded == imageURL.length) {
			completeFunction(imageOBJ);
			return imageOBJ;
		}
	}
}
