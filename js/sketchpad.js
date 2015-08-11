function getStartAndBounds(posFrom, posTo){
	var pos;
	var posOther;
	var bounds;

	pos = [Math.min(posFrom[0], posTo[0]), Math.min(posFrom[1], posTo[1])];
	posOther = [Math.max(posFrom[0], posTo[0]), Math.max(posFrom[1], posTo[1])];
	bounds = [posOther[0] - pos[0], posOther[1] - pos[1]];

	return [pos, bounds];
}

//rethink this one... start point should be fixed
function getStartAndSquareBounds(posFrom, posTo){
	var dist = Math.min(Math.abs(posFrom[0] - posTo[0]), Math.abs(posFrom[1] - posTo[1]));

	var x0 = posFrom[0];
	var x1 = posTo[0];
	var y0 = posFrom[1];
	var y1 = posTo[1];

	if(x1 < x0){
		if(y1 < y0){
			return getStartAndBounds(posFrom, [posFrom[0] - dist, posFrom[1] - dist]);
		}
		else{
			return getStartAndBounds(posFrom, [posFrom[0] - dist, posFrom[1] + dist]);
		}
	}
	else{
		if(y1 < y0){
			return getStartAndBounds(posFrom, [posFrom[0] + dist, posFrom[1] - dist]);
		}
		else{
			return getStartAndBounds(posFrom, [posFrom[0] + dist, posFrom[1] + dist]);
		}
	}
}

function hexToRgb(hex){
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
		o: 255 //always full opacity
	} : null;
}

//returns the number with the minimum abs value
function absMin(num1, num2){
	if(Math.abs(num1) < Math.abs(num2)){
		return num1;
	}
	else{
		return num2;
	}
}

var drawManager = {
	drawMethod: null,
	colorArray: null,
	colorWaiting: null,
	color: "#000000",
	alpha: 1,
	size: 8,
	filled: false,
	tol: 1,
	colorHistorySize: 0,

	init: function(){
		this.drawMethod = drawMethods.penDraw;
		this.drawMethod.init();
		this.colorArray = [];

		var index = 0;
		while($('#colorHistory' + (index+1)).length){
			index++;
		}
		this.colorHistorySize = index;

		this.color = "#000000";
		this.colorWaiting = null;
		this.alpha = 1;
		this.size = 8;
		this.filled = false;
		this.tol = 1;
	},

	drawStart: function(pos){
		if(this.colorWaiting == null){
			this.colorWaiting = this.color;
		}

		this.drawMethod.start(pos, this.color, this.alpha, this.size, this.filled, this.tol);
	},

	drawMove: function(pos){
		this.drawMethod.mid(pos, this.color, this.alpha, this.size, this.filled, this.tol);
	},

	passiveMove: function(pos){
		//nothing for now
	},

	drawEnd: function(pos){
		this.drawMethod.end(pos, this.color, this.alpha, this.size, this.filled, this.tol);
	},

	setDrawMethod: function(method){
		this.drawMethod.destroy();

		this.drawMethod = method;
		this.drawMethod.init();
	},

	setColor: function(color){
		if(color != undefined){
			var result = color.match(/[a-fA-f0-9]{6}/g);
			if(result == null || result.length == undefined || result.length <= 0)
			{
				return;
			}
			else{
				color = "#"+result[0];
			}
			if(this.color == color)
				return;

			this.color = color;
			this.addColorToUI(color);
		}
	},

	addColorToUI: function(color){
		if(this.colorWaiting != null){
			this.addToColorArray(this.colorWaiting);
			this.updateColorHistory();
		}
		this.colorWaiting = null;

		$('#colorPicker').css('background-color', color);
		$('#colorPicker')[0].color.fromString(color.substring(1,color.length));

		var inArray = this.inColorArray(color)

		if(inArray != false)
			this.colorWaiting = color;

		this.removeFromColorArray(inArray);
		this.updateColorHistory();
	},

	setColorFromHistory: function(index){
		//get color from the array and remove it
		var colorFromHistory = this.getColorFromHistory(index-1);

		if(colorFromHistory == null)
			return;

		this.setColor(colorFromHistory);
	},

	getColorFromHistory: function(index){
		if(this.colorArray.length <= index){
			return null;
		}
		else{
			return this.colorArray[index];
		}
	},

	updateColorHistory: function(){
		var index = 1;

		while($('#colorHistory'+index).length && this.colorArray.length >= index){
			$('#colorHistory'+index).attr('value', this.colorArray[index - 1]);
			$('#colorHistory'+index).css('background-color', this.colorArray[index - 1]);
			index++;
		}

		while($('#colorHistory'+index).length){
			$('#colorHistory'+index).attr('value', "#FFFFFF");
			$('#colorHistory'+index).css('background-color', "#FFFFFF");
			index++;
		}
	},

	addToColorArray: function(color){
		this.colorArray.unshift(color);
		if(this.colorArray.length > this.colorHistorySize - 1){
			this.colorArray.splice(this.colorHistorySize,
				this.colorArray.length - this.colorHistorySize);
		}
	},

	removeFromColorArray: function(index){
		if(index != undefined){
			if(index.length != undefined){
				for(var i = 0; i < index.length; i++)
					this.removeFromColorArray(index[i]);
			}
			else if(index){
				this.colorArray.splice(index, 1);
			}
		}

		//do nothing otherwise
	},

	inColorArray: function(color){
		var indexes = [];

		for(var i = 0; i < this.colorHistorySize; i++){
			if(this.colorArray[i] == color){
				indexes.push(i);
			}
		}

		if(indexes.length)
			return indexes;
		else
			return false;
	},

	setAlpha: function(alpha){
		this.alpha = alpha;
		$(canvasDraw.canvasArray[1]).css("opacity", this.alpha);
	},

	getAlpha: function(){
		return this.alpha;
	},

	setSize: function(pxSize){
		this.size = Number(pxSize);

		if(this.drawMethod.sizeUpdate != undefined){
			this.drawMethod.sizeUpdate(this.size);
		}
	},

	setFilled: function(filled){
		this.filled = filled;
	},

	setTol: function(tol){
		this.tol = tol;
	}
}

//AN EXAMPLE DRAWMETHOD
//penDraw: {
//	init: function(){},
//	destroy: function(){},
//	start: function(pos, color, alpha, size, filled, tol){},
//	mid: function(pos, color, alpha, size, filled, tol){},
//	end: function(pos, color, alpha, size, filled, tol){}, 
//	construct: function(){}
//}

var drawMethods = {
	penDraw: {
		lastPos: null,

		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			canvasDraw.drawCircle(pos, color, alpha, size, 1);
			this.lastPos = pos;
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(this.lastPos)
				canvasDraw.drawLine(this.lastPos, pos, color, alpha, size, 1);

			this.lastPos = pos;
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.lastPos != null){
				canvasDraw.drawLine(this.lastPos, pos, color, alpha, size, 1);
				canvasDraw.save();
			}

			this.lastPos = null;
		}, 

		construct: function(){}
	},

	eraserDraw: {
		lastPos: null,

		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			canvasDraw.drawCircle(pos, "#FFFFFF", alpha, size, 1);
			this.lastPos = pos;
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(this.lastPos)
				canvasDraw.drawLine(this.lastPos, pos, "#FFFFFF", alpha, size, 1);

			this.lastPos = pos;
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.lastPos != null){
				canvasDraw.drawLine(this.lastPos, pos, "#FFFFFF", alpha, size, 1);
				canvasDraw.save();
			}

			this.lastPos = null;
		}, 

		construct: function(){}
	},

	lineDraw: {
		initPos: null,

		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			canvasDraw.drawCircle(pos, color, alpha, size, 1);
			this.initPos = pos;
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(this.initPos){
				canvasDraw.clearCanvas(1);
				canvasDraw.drawLine(this.initPos, pos, color, alpha, size, 1);
			}
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.initPos != null){
				canvasDraw.clearCanvas(1);
				canvasDraw.drawLine(this.initPos, pos, color, alpha, size, 1);
				canvasDraw.save();
			}

			this.initPos = null;
		}, 

		construct: function(){}
	},

	ellipseDraw: {
		initPos: null,

		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			this.initPos = pos;

			var drawArray = getStartAndBounds(pos, this.initPos);
			canvasDraw.drawEllipse(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(this.initPos){
				canvasDraw.clearCanvas(1);
		
				var drawArray = getStartAndBounds(pos, this.initPos);
				canvasDraw.drawEllipse(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
			}
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.initPos != null){
				canvasDraw.clearCanvas(1);

				var drawArray = getStartAndBounds(pos, this.initPos);
				canvasDraw.drawEllipse(drawArray[0], drawArray[1], color, alpha, size, filled, 1);

				canvasDraw.save();
			}

			this.initPos = null;
		},

		construct: function(){}
	},

	circleDraw: {
		initPos: null,

		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			this.initPos = pos;

			var drawArray = getStartAndSquareBounds(this.initPos, pos);
			canvasDraw.drawEllipse(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(this.initPos){
				canvasDraw.clearCanvas(1);
		
				var drawArray = getStartAndSquareBounds(this.initPos, pos);
				canvasDraw.drawEllipse(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
			}
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.initPos != null){
				canvasDraw.clearCanvas(1);

				var drawArray = getStartAndSquareBounds(this.initPos, pos);
				canvasDraw.drawEllipse(drawArray[0], drawArray[1], color, alpha, size, filled, 1);

				canvasDraw.save();
			}

			this.initPos = null;
		},

		construct: function(){}
	},

	rectangleDraw: {
		initPos: null,

		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			this.initPos = pos;

			var drawArray = getStartAndBounds(pos, this.initPos);
			canvasDraw.drawRectangle(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(this.initPos){
				canvasDraw.clearCanvas(1);
		
				var drawArray = getStartAndBounds(pos, this.initPos);
				canvasDraw.drawRectangle(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
			}
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.initPos != null){
				canvasDraw.clearCanvas(1);

				var drawArray = getStartAndBounds(pos, this.initPos);
				canvasDraw.drawRectangle(drawArray[0], drawArray[1], color, alpha, size, filled, 1);

				canvasDraw.save();
			}

			this.initPos = null;
		},

		construct: function(){}
	},

	squareDraw: {
		initPos: null,

		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			this.initPos = pos;

			var drawArray = getStartAndSquareBounds(this.initPos, pos);
			canvasDraw.drawRectangle(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(this.initPos){
				canvasDraw.clearCanvas(1);
		
				var drawArray = getStartAndSquareBounds(this.initPos, pos);
				canvasDraw.drawRectangle(drawArray[0], drawArray[1], color, alpha, size, filled, 1);
			}
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.initPos != null){
				canvasDraw.clearCanvas(1);

				var drawArray = getStartAndSquareBounds(this.initPos, pos);
				canvasDraw.drawRectangle(drawArray[0], drawArray[1], color, alpha, size, filled, 1);

				canvasDraw.save();
			}

			this.initPos = null;
		},

		construct: function(){}
	},

	gridDraw: {
		lastCellList: null,
		minSize: 4,

		init: function(){
			this.sizeUpdate(drawManager.size);
		},

		destroy: function(){
			canvasDraw.clearCanvas(2);
		},

		start: function(pos, color, alpha, size, filled, tol){
			if(size < this.minSize){
				this.start(pos, color, alpha, 4);
				return;
			}

			if(this.lastCellList == null){
				this.lastCellList = new Array();
			}

			var gridCell = this.getCell(pos, size);

			if(this.cellInCanvas(gridCell, size)){
				this.lastCellList.push(gridCell);
				var xPos = gridCell[0];
				var yPos = gridCell[1];
				canvasDraw.drawRectangle([xPos, yPos], [size,size], color, alpha, 1, true, 1);
			}
		},

		mid: function(pos, color, alpha, size, filled, tol){
			if(size < this.minSize){
				this.mid(pos, color, alpha, 4);
				return;
			}

			var gridCell = this.getCell(pos, size);
			
			//making sure we haven't visited this spot
			//jquery inArray function did not work for this case
			for(var i = 0; i < this.lastCellList.length; i++)
				if(gridCell[0] == this.lastCellList[i][0]
					&& gridCell[1] == this.lastCellList[i][1])
						return;

				this.start(pos, color, alpha, size);
			
		},

		end: function(pos, color, alpha, size, filled, tol){
			if(this.lastCellList != null && this.lastCellList.length > 0){
				canvasDraw.save();
			}

			this.lastCellList = null;
		},

		construct: function(){},

		sizeUpdate: function(size){
			if(size < this.minSize){
				this.sizeUpdate(4);
				return;
			}

			canvasDraw.clearCanvas(2);

			var dimensions = canvasDraw.getDimensions();

			for(var x = size; x < dimensions[0]; x += size){
				canvasDraw.drawLine([x,0],[x,dimensions[1]], "#888888", 1, 1, 2);
			}

			for(var y = size; y < dimensions[1]; y += size){
				canvasDraw.drawLine([0,y],[dimensions[0],y], "#888888", 1, 1, 2);
			}
		},

		getCell: function(pos, size){
			return [Math.floor(pos[0]/size)*size, Math.floor(pos[1]/size)*size];
		},

		cellInCanvas: function(gridCell){
			var dimensions = canvasDraw.getDimensions();

			return (gridCell[0] < dimensions[0]
				&& gridCell[1] < dimensions[1]);
		}
	},

	bucketDraw: {
		init: function(){},
		destroy: function(){},

		start: function(pos, color, alpha, size, filled, tol){
			canvasDraw.fill(pos, color, alpha, 1, tol);
			canvasDraw.save();
		},

		mid: function(pos, color, alpha, size, filled, tol){},

		end: function(pos, color, alpha, size, filled, tol){},

		construct: function(){}
	}
}

var canvasDraw = {
	canvasArray: null,
	contextArray: null,
	drawHistory: null,
	undoPos: -1,

	init: function(canvas0, canvas1, canvas2){
		this.canvasArray = new Array();
		this.canvasArray[0] = canvas0;
		this.canvasArray[1] = canvas1;
		this.canvasArray[2] = canvas2;

		this.contextArray = new Array();
		for(var i = 0; i < this.canvasArray.length; i++)
			this.contextArray[i] = this.canvasArray[i].getContext('2d');

		this.undoPos = -1;

		this.drawHistory = new Array();
		this.clear();
		this.save();
	},

	drawCircle: function(pos, color, alpha, size, canvasNum){
		if(canvasNum == undefined)
			canvasNum = 1;

		var context = this.contextArray[canvasNum];
		
		context.strokeStyle = color;
		context.lineCap = "round";
		context.fillStyle = color;

		context.beginPath();
		context.arc(pos[0], pos[1], size/2, 0, Math.PI*2, true);
		context.closePath();
		context.fill();
	},

	drawEllipse: function(pos, bounds, color, alpha, size, filled, canvasNum){
		if(canvasNum == undefined)
			canvasNum = 1;

		var kappa = .5522848;
		var offset = [(bounds[0]/2)*kappa, (bounds[1]/2)*kappa];
		var endCoords = [pos[0]+bounds[0], pos[1]+bounds[1]];
		var midCoords = [pos[0]+bounds[0]/2, pos[1]+bounds[1]/2];

		var context = this.contextArray[canvasNum];

		context.fillStyle = color;
		context.strokeStyle = color;
		context.lineCap = "round";
		context.lineWidth = size;

		context.beginPath();
		
		context.moveTo(pos[0], midCoords[1]);
		context.bezierCurveTo(pos[0], midCoords[1] - offset[1], midCoords[0] - offset[0], pos[1], midCoords[0], pos[1]);
		context.bezierCurveTo(midCoords[0] + offset[0], pos[1], endCoords[0], midCoords[1] - offset[1], endCoords[0], midCoords[1]);
		context.bezierCurveTo(endCoords[0], midCoords[1] + offset[1], midCoords[0] + offset[0], endCoords[1], midCoords[0], endCoords[1]);
		context.bezierCurveTo(midCoords[0] - offset[0], endCoords[1], pos[0], midCoords[1] + offset[1], pos[0], midCoords[1]);

		if(filled){
			context.fill();	
		}
		else{
			context.stroke();
		}
	},

	drawLine: function(posFrom, posTo, color, alpha, size, canvasNum){
		if(canvasNum == undefined)
			canvasNum = 1;

		//console.log("drawing line");

		if(posFrom[0] == posTo[0] && posFrom[1] == posTo[1]){
			this.drawCircle(posTo, color, alpha, size, canvasNum);
		}
		else{
			var context = this.contextArray[canvasNum];

			context.fillStyle = color;
			context.strokeStyle = color;
			context.lineCap = "round";

			context.beginPath();
			context.moveTo(posFrom[0], posFrom[1]);
			context.lineTo(posTo[0], posTo[1]);
			context.lineWidth = size;
			context.stroke();
		}
	},

	fill: function(pos, color, alpha, canvasNum, tol){
		if(canvasNum == undefined)
			canvasNum = 1;
		if(tol == undefined)
			tol = 1;

		var drawCanvas = this.canvasArray[canvasNum];
		var drawContext = this.contextArray[canvasNum];
		var baseCanvas = this.canvasArray[0];
		var baseContext = this.contextArray[0];

		var canvasWidth = drawCanvas.width;
		var canvasHeight = drawCanvas.height;

		var drawImgData = drawContext.getImageData(0, 0, canvasWidth, canvasHeight);
		var baseImgData = baseContext.getImageData(0, 0, canvasWidth, canvasHeight);

		var fillColor = hexToRgb(color);
		var baseColor = getColor(pos, baseImgData);

		var pixelQueue = [pos];
		while(pixelQueue.length > 0){
			var currentPos = pixelQueue.pop();

			if(colorEquals(getColor(currentPos, baseImgData),baseColor, tol) 
				&& !colorEquals(getColor(currentPos, drawImgData), fillColor, 1.0)){
				var y = currentPos[1];
				var xWest = currentPos[0];
				var xEast = currentPos[0];

				xWest--;
				while(isInBounds([xWest, y]) && colorEquals(getColor([xWest, y], baseImgData), baseColor, tol)){
					xWest--;
				}
				xWest++;

				xEast++;
				while(isInBounds([xEast, y]) && colorEquals(getColor([xEast, y], baseImgData), baseColor, tol)){
					xEast++;
				}
				xEast--;

				for(var x = xWest; x <= xEast; x++){
					setColor([x, y], drawImgData, fillColor);
					if(isInBounds([x, y-1]) && colorEquals(getColor([x, y-1], baseImgData), baseColor, tol) 
						&& !colorEquals(getColor([x, y-1], drawImgData), fillColor, 1.0)){
						pixelQueue.push([x, y-1]);
					}

					if(isInBounds([x, y+1]) && colorEquals(getColor([x, y+1], baseImgData), baseColor, tol) 
						&& !colorEquals(getColor([x, y+1], drawImgData), fillColor, 1.0)){
						pixelQueue.push([x, y+1]);
					}
				}
			}
		}
		drawContext.putImageData(drawImgData, 0, 0);


		function getColor(pos, imgData){
			var loc = toArrayLocation(pos);
			return {
				r: imgData.data[loc],
				g: imgData.data[loc+1],
				b: imgData.data[loc+2],
				o: imgData.data[loc+3]
			};
		}

		function setColor(pos, imgData, color){
			var loc = toArrayLocation(pos);
			imgData.data[loc] = color.r;
			imgData.data[loc+1] = color.g;
			imgData.data[loc+2] = color.b;
			imgData.data[loc+3] = color.o;
		}

		function colorEquals(color1, color2, tol){
			return (color1.r == color2.r &&
			        color1.g == color2.g &&
			        color1.b == color2.b);
		}

		//muxt be called after canvasWidth is defined above
		function toArrayLocation(pos){
			//this is 2d array to 1d array conversion, but in this
			//array the pixel data starts at every 4th index
			return (pos[1]*canvasWidth + pos[0])*4;
		}

		function isInBounds(pos){
			return (
				pos[0] >= 0 &&
				pos[0] < canvasWidth &&
				pos[1] >= 0 &&
				pos[1] < canvasHeight
			);
		}
	},

	drawRectangle: function(pos, bounds, color, alpha, size, filled, canvasNum){
		if(canvasNum == undefined)
			canvasNum = 1;

		var context = this.contextArray[canvasNum];
		context.lineWidth = size;

		context.fillStyle = color;
		context.strokeStyle = color;

		if(filled){
			context.fillRect(pos[0], pos[1], bounds[0], bounds[1]);
		}
		else{
			context.strokeRect(pos[0], pos[1], bounds[0], bounds[1]);
		}
	},

	drawImage: function(pos, img, alpha){
		//TODO
		Console.log("canvasDraw.drawImage() not implemented");
	},

	save: function(){
		this.cutToBaseCanvas();
		this.clearCanvas(1);

		this.undoPos++;
		if(this.undoPos < this.drawHistory.length){
			this.drawHistory.length = this.undoPos;
		}

		this.drawHistory.push(this.canvasArray[0].toDataURL());
	},

	undo: function(){
		if(this.undoPos > 0){
			this.undoPos--;
			var canvasImage = new Image();
			canvasImage.src = this.drawHistory[this.undoPos];
			canvasImage.onload = function(){
				canvasDraw.clearCanvas(0);
				canvasDraw.clearCanvas(1);
				canvasDraw.contextArray[0].drawImage(canvasImage, 0, 0);
			};
		}
	},

	redo: function(){
		if(this.undoPos < this.drawHistory.length-1){
			this.undoPos++;
			var canvasImage = new Image();
			canvasImage.src = this.drawHistory[this.undoPos];
			canvasImage.onload = function(){
				canvasDraw.clearCanvas(0);
				canvasDraw.clearCanvas(1);
				canvasDraw.contextArray[0].drawImage(canvasImage, 0, 0);
			};
		}
	},

	//clears canvas 0 with white color. Used to clear the drawing pad.
	clear: function(){
		var canvas = this.canvasArray[0];
		var context = this.contextArray[0];

		context.strokeStyle = "#FFFFFF";
		context.fillStyle = "#FFFFFF";
		context.fillRect(0,0,canvas.width, canvas.height);

		this.clearCanvas(1);

		this.save();
	},

	//clears with "clear" color, default canvas 1. Used for utility.
	clearCanvas: function(canvasNum){
		if(canvasNum == undefined)
			canvasNum = 1;
		else{
			var canvas = this.canvasArray[canvasNum];
			var context = this.contextArray[canvasNum];

			context.clearRect(0, 0, canvas.width, canvas.height);
		}
	},

	cutToBaseCanvas: function(){
		var context = this.contextArray[0];

		context.globalAlpha = drawManager.getAlpha();
		context.drawImage(this.canvasArray[1], 0, 0);
		context.globalAlpha = 1;
		this.clearCanvas(1);
	},

	getDimensions: function(){
		return [this.canvasArray[0].width, this.canvasArray[1].height];
	}
}

var resourceLocation = '';

var images = {};

var mousedown = false;

function getMousePos(e){
	var mouseX=0;
	var mouseY=0;

	if(!e)
		var e = event;

	if(e.offsetX){
		mouseX = e.offsetX;
		mouseY = e.offsetY;
	}
	else if(e.originalEvent.layerX){
		mouseX = e.originalEvent.layerX;
		mouseY = e.originalEvent.layerY;
	}
	else{
		//console.log("can't read mouse location")
		return null;
	}

	return [mouseX, mouseY];
}

function initSketchpad(){
	if(!$('#sketchpad0').length){
		return;
	}

	var canvas0 = $('#sketchpad0').first();
	var canvas1 = $('#sketchpad1').first();
	var canvas2 = $('#sketchpad2').first();

	var drawArea = $('#sketchpad2').first();

	jscolor.init();

	if(canvas0[0].getContext){
		canvasDraw.init(canvas0[0], canvas1[0], canvas2[0]);
		
		for(var index in drawMethods){
			drawMethods[index].construct();
		}

		drawManager.init();

		drawArea.on('mousedown', function(e){
			mousedown = true;
			drawManager.drawStart(getMousePos(e));
		});

		$(window).on('mouseup', function(e){
			drawManager.drawEnd(getMousePos(e));
			mousedown = false;
		});

		drawArea.on('mousemove', function(e){
			if(mousedown){
				drawManager.drawMove(getMousePos(e));
			}
			else{
				drawManager.passiveMove(getMousePos(e));
			}
		});

		$('#penTool').click(function(){
			drawManager.setDrawMethod(drawMethods.penDraw);
		});

		$('#lineTool').click(function(){
			drawManager.setDrawMethod(drawMethods.lineDraw);
		});

		$('#eraserTool').click(function(){
			drawManager.setDrawMethod(drawMethods.eraserDraw);
		});

		$('#gridTool').click(function(){
			drawManager.setDrawMethod(drawMethods.gridDraw);
		});

		$('#bucketTool').click(function(){
			drawManager.setDrawMethod(drawMethods.bucketDraw);
		});		

		$('#ellipseTool').click(function(){
			drawManager.setDrawMethod(drawMethods.ellipseDraw);
		});

		$('#circleTool').click(function(){
			drawManager.setDrawMethod(drawMethods.circleDraw);
		});

		$('#rectangleTool').click(function(){
			drawManager.setDrawMethod(drawMethods.rectangleDraw);
		});

		$('#squareTool').click(function(){
			drawManager.setDrawMethod(drawMethods.squareDraw);
		});	

		$('#clearSketchpad').click(function(){
			canvasDraw.clear();
		});

		$('#undo').click(function(){
			canvasDraw.undo();
		});

		$('#redo').click(function(){
			canvasDraw.redo();
		});

		$(".sizeSelector").click(function(){
			drawManager.setSize($(this).attr("value"));
		});

		var colors = [
			["Navy","#001F3F"],
			["Blue","#0074D9"],
			["Aqua","#7FDBFF"],
			["Teal","#39CCCC"],
			["Olive","#3D9970"],
			["Green","#2ECC40"],
			["Lime","#01FF70"],
			["Yellow","#FFDC00"],
			["Beige", "#F5F5DC"],
			["Brown", "#8B4513"],
			["Orange","#FF851B"],
			["Red","#FF4136"],
			["Maroon","#85144B"],
			["Pink","#F012BE"],
			["Purple","#B10DC9"],
			["Black","#000000"],
			["Gray","#AAAAAA"],
			["Silver","#DDDDDD"],
			["White","#FFFFFF"]
		];

		var colorString = '<li><a href="javascript:;" class="colorSelector" >&nbsp;&nbsp;&nbsp;</a></li>';

		for(var i = 0; i < colors.length; i++){
			var colorElement = $(colorString);
			//colorElement.children().first().html("    ");
			colorElement.children().first().attr("value", colors[i][1]);
			colorElement.children().first().css("background-color", colors[i][1]);
			colorElement.appendTo('#colorContainer');
		}

		//next section sets up animations for any sliders
		$(".colorSelector").on("click", function(){
			drawManager.setColor($(this).attr("value"));
		});

		$(".colorHistorySelector").on("click", function(){
			drawManager.setColorFromHistory($(this).attr("num"));
		});

		$("#colorPicker").on("change", function(){
			drawManager.setColor("#"+$(this).val());
		});

		var sliderIdArray = $('input.slider').map(function(){
			return $(this).attr('id');
		}).get();

		for(var i = 0; i < sliderIdArray.length; i++){
			$('#'+sliderIdArray[i]).on("change mousemove", function(){
				var id = $(this).attr("id");
				$("div[for='"+id+"']").html($(this).val()+"%");	
			});
		}

		//handlers for changing transparency
		$("#alpha").on("change", function(){
			drawManager.setAlpha($(this).val()/100);
		});

		$("#filled").on("change", function(){
			drawManager.setFilled($("#filled").is(":checked"));
		});

		$("#download").on("click", function(){
			$("#download").attr('href', canvsDraw.canvasArray[0].toDataURL());
		});

		$(".selectable").click(function(){
			$(".selected").removeClass("selected");
			$(this).addClass("selected");
		});

		$(".selectableSize").click(function(){
			$(".selectableSize").removeClass("selectedSize");
			$(this).addClass("selectedSize");
		});


		$("#shapeList").hide();

		$("#shapes").click(function(){
			if($("#shapeList").is(":visible")){
				$(this).parent().removeClass("shapesSelected");
				$("#shapeList").hide();
			}
			else{
				$(this).parent().addClass("shapesSelected");
				$("#shapeList").show();
			}
		});
	}
}

$(document).ready(function(){
	initSketchpad();
});

function getSketchpadImage(){
	if($('#sketchpad0').length){
		var canvas = $('#sketchpad0')[0];
		return canvas.toDataURL();
	}
	else{
		return undefined;
	}
}