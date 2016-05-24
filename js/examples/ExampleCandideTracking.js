if(nxtjs == null) {
	throw "ExampleCandideTracking.js needs a fully initialized Beyond Reality Face Nxt SDK. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(nxtjs.ExampleBase == null) {
	throw "ExampleCandideTracking.js uses ExampleBase as base class. Make sure to follow the implementation examples of the JS version of the SDK.";
}
if(createjs == null) {
	throw "ExampleCandideTracking.js uses CreateJS to display its content. Make sure to follow the implementation examples of the JS version of the SDK.";
}

/**
 * Called onload of body.
 */
function initExample() {
	
	// Setup CreateJS: uses the canvas with id '_stage'.
	// See ExampleBase.js
	
	var _stage = nxtjs.initCreateJS("_stage");
	_stage.addChild(new nxtjs.ExampleCandideTracking());
	//console.log(_stage);
}

(function(lib) {

	/**
	 * Uses super class ExampleBase to init BRF, Camera and GUI.
	 * 
	 * Sets tracking mode BRFMode.FACE_TRACKING and its params.
	 * Does update the candide properties (see onReadyBRF).
	 * 
	 * (And please, don't hide the BRF logo. If you need a 
	 * version without logo, just email us. Thanks!)
	 * 
	 * @author Marcel Klammer, Tastenkunst GmbH, 2014
	 */
	(lib.ExampleCandideTracking = function(
			cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput
			) {

		var _this = this;
		var _super = lib.ExampleCandideTracking._super;
		//console.log(_this);
		maskContainer = true;
		webcamInput = true;
		
		/**
		 * We use the Rectangles that are preselected in ExampleBase.
		 */
		_super.constructor.call(this, cameraResolution, brfResolution, brfRoi,
			faceDetectionRoi, screenRect, maskContainer, webcamInput);

		/**
		 * When BRF is ready, we can set its params and BRFMode.
		 * 
		 * In this example we want to do face tracking, 
		 * so we set tracking mode to BRFMode.FACE_TRACKING.
		 */
		_this.onReadyBRF = function(event) {

			// The following settings are completely optional.
			// BRF is by default set up to do the complete tracking
			// (including candide and its actionunits).
			_this._brfManager.setFaceDetectionVars(5.0, 1.0, 14.0, 0.06, 6, false);
			_this._brfManager.setFaceDetectionROI(_this._faceDetectionRoi.x, _this._faceDetectionRoi.y,
				_this._faceDetectionRoi.width, _this._faceDetectionRoi.height);
			_this._brfManager.setFaceTrackingVars(80, 500, 1);

			// If you don't need 3d engine support or don't want to use
			// the candide vertices, you can turn that feature off, 
			// which saves CPU cycles.
			// But actually we want to show this feature in this example:
			_this._brfManager.candideEnabled = true;
			_this._brfManager.candideActionUnitsEnabled = true;

			// Face Tracking? Face Tracking!
			_this._brfManager.mode = lib.BRFMode.FACE_TRACKING;

			// Set BRF ready and start, if camera is ready, too.
			_this._brfReady = true;
			_this.start();
		};
		
		/**
		 * We don't need to overwrite the updateInput and updateBRF, but we
		 * need to draw the results for BRFMode.FACE_TRACKING.
		 */

		var add =false;

		_this.updateGUI = function() {
			_this._draw.clear(); //如果註銷掉，每個frame人臉偵測的線都會一直存在
			//console.log(_this); //lib.ExampleCandideTracking
			//console.log(lib); //Object js/lib/brf
			// Get the current BRFState and faceShape.
			var state = _this._brfManager.state;
			var faceShape = _this._brfManager.faceShape;
			var animation = _this._animation._show;
			var i = _this._animation._position;
			var x = _this._animation._adjx;
			var y = _this._animation._adjy;

			// Draw BRFs region of interest, that got analysed:

			//lib.DrawingUtils.drawRect(_this._draw, _this._brfRoi, false, 1.0, "#acfeff", 1.0);//外圈藍色的筐

			if(state == lib.BRFState.FACE_DETECTION) {
				// Last update was face detection only,
				// draw the face detection roi and lastDetectedFace:
				lib.DrawingUtils.drawRect(_this._draw, _this._faceDetectionRoi, false, 1.0, "#ffff00", 1.0);//比較裡面的那個筐

				if(add) {
					_this._container.removeChild(animation);
					add = false;
				}

				switch(_this._num){
					case 1:
						animation = _this._giphy;
						break;
					case 2:
						animation = _this._pika;
						break;
					default:
						console.log(animation);
				}

				// And draw the ony result, that got calculated from lastDetectedFaces.
				var rect = _this._brfManager.lastDetectedFace;
				if(rect != null && rect.width != 0) {
					lib.DrawingUtils.drawRect(_this._draw, rect, false, 3.0, "#ff7900", 1.0);
				}
			} else if(state == lib.BRFState.FACE_TRACKING_START) {
				// FACE_TRACKING_START does not update the candide properties,
				// we only get faceShape vertices and bounds here.

				// The found face rectangle got analysed in detail
				// draw the faceShape and its bounds:

				//DrawingUtils.drawTriangles(_draw, faceShape.faceShapeVertices, faceShape.faceShapeTriangles);
				lib.DrawingUtils.drawTrianglesAsPoints(_this._draw, faceShape.faceShapeVertices);//畫出點
				lib.DrawingUtils.drawRect(_this._draw, faceShape.bounds);//以方形畫臉的輪廓

				animation.x = faceShape.candideShapeVertices[i]-x;
				animation.y = faceShape.candideShapeVertices[i+1]-y;
				_this._container.addChild(animation);
				add = true;
			} else if(state == lib.BRFState.FACE_TRACKING) {
				// FACE_TRACKING does update the candide properties.

				if(animation!=null){
					animation.x = faceShape.candideShapeVertices[i]-x;
					animation.y = faceShape.candideShapeVertices[i+1]-y;
				}

				//lib.DrawingUtils.drawTriangles(_this._draw, faceShape.candideShapeVertices, faceShape.candideShapeTriangles);//將點畫成線，形成面
				//lib.DrawingUtils.img(_this._draw, faceShape.candideShapeVertices);
				//lib.DrawingUtils.drawTrianglesAsPoints(_this._draw, faceShape.candideShapeVertices);//verticeLength=226
				//add = true;
			}
		};
	}).inheritsFrom(lib.ExampleBase);

})(nxtjs);