var globalStream;
var s1 = function (p) {
    //setting up variables;
    var mode = '';
    // var canvas;
    var startCameraButton;
    var drawButton;
    var clearAllDrawingButton;
    var ctracker;
    var image;
    var camera;
    var drawingMode;
    var canvasDrawing;
    var canvasDrawingHistory = [];
    p.setup = function () {
      // initialising canvas
      p.createCanvas(450, 300);
      p.background(255);
      // canvas.id('canvas');
      // initialising buttons

      startCameraButton = p.createDiv('Take pic');
      startCameraButton.class('btn btn-primary');
      startCameraButton.id('startCameraButton');
      startCameraButton.parent('primaryControlsContainer');

      drawButton = p.createDiv('Draw');
      drawButton.class('btn btn-primary');
      drawButton.id('drawButton');
      drawButton.parent('primaryControlsContainer');

      // initialising events
      startCameraButton.mousePressed(startCameraButtonEvent);
      drawButton.mousePressed(drawButtonEvent);

      clearAllDrawingButton = p.createDiv('clear draw');
      clearAllDrawingButton.class('btn btn-primary');
      clearAllDrawingButton.id('clearAllDrawing');
      clearAllDrawingButton.parent('primaryControlsContainer');
      clearAllDrawingButton.mousePressed(clearAllDrawingButtonEvent);

      drawingMode = false;
    }

    function clearAllDrawingButtonEvent () {
        canvasDrawingHistory = [];
    }

    p.draw = function () {
      p.background(255);
      if(mode == 'video') {
        p.image(video, 0, 0, 450, 300);

        var positions = ctracker.getCurrentPosition();

        for (var i=0; i<positions.length; i++) {
          // set the color of the ellipse based on position on screen
          p.fill(p.map(positions[i][0], width*0.33, width*0.66, 0, 255), p.map(positions[i][1], height*0.33, height*0.66, 0, 255), 255);
          // draw ellipse at each position point
          p.ellipse(positions[i][0], positions[i][1], 8, 8);
        }


      } else if(mode == 'image') {
        p.image(image, 0, 0, 450, 300);
      }
      if(drawingMode == true) {
        for( var i = 0 ; i < canvasDrawingHistory.length ; i++ ) {
          canvasDrawingHistory[i].display();
        }
      }
    }
    p.mouseDragged = function () {
      if(drawingMode == true) {
          var slider = p.select('#toolWidthSlider');
          var sliderValue = slider.value();
          var colorInput = p.select('#colorInput');
          var colorValue = colorInput.value();
          if(colorValue == '' || colorValue == 'no') colorValue = '#000000';
          else {
              var pattern = /#[0-9a-f]{6}/;
              if(!pattern.test(colorValue)) {
                  colorValue = '#000000';
              }
          }
        canvasDrawing.input(p.mouseX, p.mouseY, sliderValue, colorValue, "drag");
      }
    }
    p.mouseReleased = function () {
      if(drawingMode == true && p.mouseX < 450 && p.mouseX >= 0 && p.mouseY < 300 && p.mouseY >= 0) {
        canvasDrawing.inputFinished();
      }
    }
    p.mousePressed = function () {
        if(drawingMode == true) {
            var slider = p.select('#toolWidthSlider');
            var sliderValue = slider.value();
            var colorInput = p.select('#colorInput');
            var colorValue = colorInput.value();
            if(colorValue == '' || colorValue == 'no') colorValue = '#000000';
            else {
                var pattern = /#[0-9a-f]{6}/;
                if(!pattern.test(colorValue)) {
                    colorValue = '#000000';
                }
            }
            canvasDrawing.input(p.mouseX, p.mouseY, sliderValue, colorValue, "click");
        }
    }
    function startCameraButtonEvent () {
      camera = new LiveVideo();
      camera.startVideo(function () {
        video = camera.getVideoForCanvas();
        startCameraButton.hide();
        console.log('here');
        ctracker = new clm.tracker();
        console.log(ctracker);
        ctracker.init(pModel);
        ctracker.start(video.elt);
        mode = 'video';
      });
    }

    function drawButtonEvent() {
      drawingMode = true;
      canvasDrawing = new CanvasDrawing();
      canvasDrawingHistory.push(canvasDrawing);
      canvasDrawing.start();
    }
    function imageCaptured (image_) {
      image = image_;
      mode = 'image';
    }

    var LiveVideo = function () {

      var video;
      var localStream;
      var image = p.createImage(450, 300);
      var captureButton;
      var cancelButton;

      this.startVideo = function (successFunction) {
        video = p.createCapture(p.VIDEO, function(stream) {
          initiateSecondaryComponents();
          localStream = stream;
          globalStream = stream;
          video.hide();
          successFunction();
        });
      }

      this.getVideoForCanvas = function () {
        if(video) return video;
      }

      function initiateSecondaryComponents() {

        captureButton = p.createButton("capture");
        captureButton.parent('secondaryControlsContainer');
        captureButton.mousePressed(takeSnapshot);
        captureButton.class('btn btn-secondary');

        cancelButton = p.createButton('cancel photo');
        cancelButton.parent('secondaryControlsContainer');
        cancelButton.mousePressed(cancelSnapshot);
        cancelButton.class('btn btn-warning');

      }

      function removeSecondaryComponents() {

        captureButton.remove();
        cancelButton.remove();

      }

      function takeSnapshot () {
        image = video.get();
        removeSecondaryComponents();
        stopVideo();
        recoverPrimaryComponents();
        imageCaptured(image);
      }

      function cancelSnapshot () {
        mode = '';
        stopVideo();
        recoverPrimaryComponents();
        removeSecondaryComponents();
      }

      function recoverPrimaryComponents () {
        startCameraButton.style('display', 'inline-block');
      }

      function hidePrimaryComponents() {
        startCameraButton.hide();
      }

      function stopVideo () {
        localStream.stop();
      }
    }

    var CanvasDrawing = function () {
      var pencilButton;
      var finishDrawingButton;
      var cancelDrawingButton;
      var circleButton;
      var colorInput;
      var toolWidthSlider;
      var pencil = new Pencil(this);
      var circle = new Circle(this);
      var drawingTool;
      this.drawingToolHistory = [];
      this.completeDrawingHistory = [];

      this.display = function () {
        for( var i  = 0 ; i < this.completeDrawingHistory.length ; i++ ) {
          if(this.completeDrawingHistory[i][0] == 'pencil') {
            pencil.draw(this.completeDrawingHistory[i]);
          } else if(this.completeDrawingHistory[i][0] == 'circle') {
            circle.draw(this.completeDrawingHistory[i]);
          }
        }
      }
      this.start = function () {
        hidePrimaryComponents();
        initiateSecondaryComponents();
      }
      function hidePrimaryComponents () {
        drawButton.hide();
        clearAllDrawingButton.hide();
      }
      function initiateSecondaryComponents () {
        pencilButton = p.createDiv('pencil');
        pencilButton.parent('secondaryControlsContainer');
        pencilButton.mousePressed(pencilButtonEvent);
        pencilButton.class('btn btn-secondary');
        pencilButton.id('pencilButton');

        circleButton = p.createDiv('circle');
        circleButton.parent('secondaryControlsContainer');
        circleButton.mousePressed(circleButtonEvent);
        circleButton.class('btn btn-secondary');
        circleButton.id('circleButton');

        colorInput = p.createInput();
        colorInput.parent('secondaryControlsContainer');
        colorInput.id('colorInput');

        finishDrawingButton = p.createDiv('finish drawing');
        finishDrawingButton.parent('secondaryControlsContainer');
        finishDrawingButton.mousePressed(finishDrawingButtonEvent);
        finishDrawingButton.class('btn btn-success');

        cancelDrawingButton = p.createDiv('cancel drawing');
        cancelDrawingButton.parent('secondaryControlsContainer');
        cancelDrawingButton.mousePressed(cancelDrawingButtonEvent);
        cancelDrawingButton.class('btn btn-warning');

        toolWidthSlider = p.createSlider(5, 30, 15);
        toolWidthSlider.parent('secondaryControlsContainer');
        toolWidthSlider.id('toolWidthSlider');
      }

      function pencilButtonEvent () {
        drawingTool = pencil;
      }
      function finishDrawingButtonEvent () {
        finishDrawing();
      }
      function cancelDrawingButtonEvent () {
        removeSecondaryComponents();
        recoverPrimaryComponents();
        canvasDrawingHistory.pop();
      }
      function circleButtonEvent () {
          drawingTool = circle;
      }
      function finishDrawing () {
          removeSecondaryComponents();
          recoverPrimaryComponents();
      }
      function removeSecondaryComponents() {
          pencilButton.remove();
          circleButton.remove();
          colorInput.remove();
          finishDrawingButton.remove();
          cancelDrawingButton.remove();
          toolWidthSlider.remove();
      }
      function recoverPrimaryComponents () {
          drawButton.style('display', 'inline-block');
          clearAllDrawingButton.style('display', 'inline-block');
      }
      this.input = function (x, y, stroke, color, type) {
          if( drawingTool && drawingTool instanceof Pencil && type == 'drag')
            drawingTool.input(x, y, stroke, color);
          else if( drawingTool && drawingTool instanceof Circle && type== 'click') {
            //   console.log("here");
              drawingTool.input(x, y, stroke, color);
          }
      }
      this.inputFinished = function () {
        if(drawingTool)
        drawingTool.inputFinished();
      }
    }
    var Pencil = function (parent) {
      this.input = function (x, y, stroke, color) {
        var coord = [x, y, stroke, color];
        console.log(coord);
        if(parent.drawingToolHistory.length == 0) {
          parent.completeDrawingHistory.push(parent.drawingToolHistory);
          parent.drawingToolHistory.push('pencil');
        }
        parent.drawingToolHistory.push(coord);
      }
      this.inputFinished = function () {
        parent.drawingToolHistory = [];
      }
      this.draw = function (pencilDrawing) {
        for(var i = 1 ; i < pencilDrawing.length -1 ; i++) {
            p.strokeWeight(pencilDrawing[i][2]);
            p.stroke(pencilDrawing[i][3]);
            // console.log(pencilDrawing[i][2]);
          p.line(pencilDrawing[i][0], pencilDrawing[i][1], pencilDrawing[i+1][0], pencilDrawing[i+1][1]);
        }
      }
    }
    var Circle = function (parent) {
      this.input = function (x, y, stroke, color) {
          var coord = [x, y, stroke, color];
          if(parent.drawingToolHistory.length == 0) {
            parent.completeDrawingHistory.push(parent.drawingToolHistory);
            parent.drawingToolHistory.push('circle');
          }
          parent.drawingToolHistory.push(coord);
          console.log(parent.drawingToolHistory);
      }
      this.inputFinished = function () {
        parent.drawingToolHistory = [];
      }
      this.draw = function (circleDrawing) {
        for(var i = 1 ; i < circleDrawing.length ; i++) {
            p.strokeWeight(circleDrawing[i][2]);
            p.stroke(circleDrawing[i][3]);
          p.ellipse(circleDrawing[i][0], circleDrawing[i][1], 5, 5);
        }
      }
    }
}
$(document).ready(function () {
  $('#newPost').on('click', function () {
    var canvas1 = new p5(s1, 'canvasContainer');
    var c = $('#canvasContainer').find('canvas');
    c.attr('id', 'canvas');
  });
  $('#postModal').on('hidden.bs.modal', function () {
    $('#canvas').remove();
    $('#secondaryControlsContainer').find('div').remove();
    $('#secondaryControlsContainer').find('button').remove();
    $('#primaryControlsContainer').find('div').remove();
    $('#primaryControlsContainer').find('button').remove();
    if(globalStream)
    globalStream.stop();
  });
  $('#postForm').on('submit', function (event) {
    event.preventDefault();
    var can = $('#canvas');
    var dataURL = can.get(0).toDataURL('image/png');
    var postText = $('#postTextArea').val();
    $.ajax({
      type: 'POST',
      url: '/new-post',
      data: {
        postText: postText,
        canvasFile: dataURL
      },
      success: function (data) {
        if(data == 'successfull') {
          $('#postTextArea').val('');
          $('#postModal').modal('toggle');
          alert('posted successfully');
        } else {
          alert('Tell something about the sketch');
        }
      }
    });
  });
});
