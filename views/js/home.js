$(document).ready(function () {
  alignEveryThing();
function alignEveryThing () {
  var profileImageWidth = $('#wallPaintingContainer').width();
  $('#profileContainer').css('height', profileImageWidth/3+70+'px');
  $('#wallPaintingContainer').css('height', profileImageWidth/3+'px');
  $('#profileImage').css('left', $('#profileContainerFooter').width()/2-80+'px');
}
  $(window).resize(function () {
    alignEveryThing();
  });
  loadProfilePic($('#profileImage'), $('#profileContainer').attr('user-id'), $('#profileContainer').attr('username'));
  loadWallPainting($('#wallPaintingContainer'), $('#profileContainer').attr('user-id'), $('#profileContainer').attr('username'));

//////////////////////////////////////profile pic////////////////////////////////////////

var globalStream;
var ProfilePicCanvas = function (p) {
    //setting up variables;
    var mode = '';
    // var canvas;
    var startCameraButton;
    var drawButton;
    var image;
    var camera;
    var drawingMode;
    var canvasDrawing;
    var canvasDrawingHistory = [];
    p.setup = function () {
      // initialising canvas
      p.createCanvas(400, 300);
      p.background(255);
      // canvas.id('canvas');
      // initialising buttons
      startCameraButton = p.createDiv('Take pic');
      startCameraButton.class('btn btn-primary');
      startCameraButton.id('profilePicStartCameraButton');
      startCameraButton.parent('profilePicPrimaryControlsContainer');

      drawButton = p.createDiv('Draw');
      drawButton.class('btn btn-primary');
      drawButton.id('profilePicDrawButton');
      drawButton.parent('profilePicPrimaryControlsContainer');

      // initialising events
      startCameraButton.mousePressed(startCameraButtonEvent);
      drawButton.mousePressed(drawButtonEvent);

      drawingMode = false;
    }

    p.draw = function () {
      p.background(255);
      if(mode == 'video') {
        p.image(video, 0, 0, 450, 300);
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
        canvasDrawing.input(p.mouseX, p.mouseY);
      }
    }
    p.mouseReleased = function () {
      if(drawingMode == true && p.mouseX < 450 && p.mouseX >= 0 && p.mouseY < 300 && p.mouseY >= 0) {
        canvasDrawing.inputFinished();
      }
    }
    function startCameraButtonEvent () {
      camera = new LiveVideo();
      camera.startVideo(function () {
        video = camera.getVideoForCanvas();
        mode = 'video';
        startCameraButton.hide();
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
        captureButton.parent('profilePicSecondaryControlsContainer');
        captureButton.mousePressed(takeSnapshot);
        captureButton.class('btn btn-secondary');

        cancelButton = p.createButton('cancel photo');
        cancelButton.parent('profilePicSecondaryControlsContainer');
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
      var pencil = new Pencil(this);
      var circle = new Circle(this);
      var drawingTool;
      this.drawingToolHistory = [];
      this.completeDrawingHistory = [];
      // pencil
      // circle
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
      }
      function initiateSecondaryComponents () {
        pencilButton = p.createDiv('pencil');
        pencilButton.parent('profilePicSecondaryControlsContainer');
        pencilButton.mousePressed(pencilButtonEvent);
        pencilButton.class('btn btn-secondary');
        pencilButton.id('profilePicPencilButton');

        finishDrawingButton = p.createDiv('finish drawing');
        finishDrawingButton.parent('profilePicSecondaryControlsContainer');
        finishDrawingButton.mousePressed(finishDrawingButtonEvent);
        finishDrawingButton.class('btn btn-success');

        cancelDrawingButton = p.createDiv('cancel drawing');
        cancelDrawingButton.parent('profilePicSecondaryControlsContainer');
        cancelDrawingButton.mousePressed(cancelDrawingButtonEvent);
        cancelDrawingButton.class('btn btn-warning');
      }
      function pencilButtonEvent () {
        drawingTool = pencil;
      }
      function finishDrawingButtonEvent () {
        // drawingMode = false;
      }
      function cancelDrawingButtonEvent () {
        // drawingMode = false;
      }
      this.input = function (x, y) {
        if(drawingTool)
        drawingTool.input(x, y);
      }
      this.inputFinished = function () {
        if(drawingTool)
        drawingTool.inputFinished();
      }
    }
    var Pencil = function (parent) {
      this.input = function (x, y) {
        var coord = [x, y];
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
          p.line(pencilDrawing[i][0], pencilDrawing[i][1], pencilDrawing[i+1][0], pencilDrawing[i+1][1]);
        }
      }
    }
    var Circle = function () {
      this.input = function (x, y) {

      }
    }
}
//////////////////////////////////////////////////////////////////////

//////////////////////////////////////wall painting////////////////////////////////////////

var wallPaintingGlobalStream;
var WallPaintingCanvas = function (p) {
    //setting up variables;
    var mode = '';
    // var canvas;
    var startCameraButton;
    var drawButton;
    var image;
    var camera;
    var drawingMode;
    var canvasDrawing;
    var canvasDrawingHistory = [];
    p.setup = function () {
      // initialising canvas
      p.createCanvas(760, 250);
      p.background(255);
      // canvas.id('canvas');
      // initialising buttons
      startCameraButton = p.createDiv('Take pic');
      startCameraButton.class('btn btn-primary');
      startCameraButton.id('wallPaintingStartCameraButton');
      startCameraButton.parent('wallPaintingPrimaryControlsContainer');

      drawButton = p.createDiv('Draw');
      drawButton.class('btn btn-primary');
      drawButton.id('wallPaintingDrawButton');
      drawButton.parent('wallPaintingPrimaryControlsContainer');

      // initialising events
      startCameraButton.mousePressed(startCameraButtonEvent);
      drawButton.mousePressed(drawButtonEvent);

      drawingMode = false;
    }

    p.draw = function () {
      p.background(255);
      if(mode == 'video') {
        p.image(video, 0, 0, 760, 570);
      } else if(mode == 'image') {
        p.image(image, 0, 0, 760, 570);
      }
      if(drawingMode == true) {
        for( var i = 0 ; i < canvasDrawingHistory.length ; i++ ) {
          canvasDrawingHistory[i].display();
        }
      }
    }
    p.mouseDragged = function () {
      if(drawingMode == true) {
        canvasDrawing.input(p.mouseX, p.mouseY);
      }
    }
    p.mouseReleased = function () {
      if(drawingMode == true && p.mouseX < 760 && p.mouseX >= 0 && p.mouseY < 250 && p.mouseY >= 0) {
        canvasDrawing.inputFinished();
      }
    }
    function startCameraButtonEvent () {
      camera = new LiveVideo();
      camera.startVideo(function () {
        video = camera.getVideoForCanvas();
        mode = 'video';
        startCameraButton.hide();
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
      var image = p.createImage(760, 570);
      var captureButton;
      var cancelButton;

      this.startVideo = function (successFunction) {
        video = p.createCapture(p.VIDEO, function(stream) {
          initiateSecondaryComponents();
          localStream = stream;
          wallPaintingGlobalStream = stream;
          video.hide();
          successFunction();
        });
      }

      this.getVideoForCanvas = function () {
        if(video) return video;
      }

      function initiateSecondaryComponents() {

        captureButton = p.createButton("capture");
        captureButton.parent('wallPaintingSecondaryControlsContainer');
        captureButton.mousePressed(takeSnapshot);
        captureButton.class('btn btn-secondary');

        cancelButton = p.createButton('cancel photo');
        cancelButton.parent('wallPaintingSecondaryControlsContainer');
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
      var pencil = new Pencil(this);
      var circle = new Circle(this);
      var drawingTool;
      this.drawingToolHistory = [];
      this.completeDrawingHistory = [];
      // pencil
      // circle
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
      }
      function initiateSecondaryComponents () {
        pencilButton = p.createDiv('pencil');
        pencilButton.parent('wallPaintingSecondaryControlsContainer');
        pencilButton.mousePressed(pencilButtonEvent);
        pencilButton.class('btn btn-secondary');
        pencilButton.id('profilePicPencilButton');

        finishDrawingButton = p.createDiv('finish drawing');
        finishDrawingButton.parent('wallPaintingSecondaryControlsContainer');
        finishDrawingButton.mousePressed(finishDrawingButtonEvent);
        finishDrawingButton.class('btn btn-success');

        cancelDrawingButton = p.createDiv('cancel drawing');
        cancelDrawingButton.parent('wallPaintingSecondaryControlsContainer');
        cancelDrawingButton.mousePressed(cancelDrawingButtonEvent);
        cancelDrawingButton.class('btn btn-warning');
      }
      function pencilButtonEvent () {
        drawingTool = pencil;
      }
      function finishDrawingButtonEvent () {
        // drawingMode = false;
      }
      function cancelDrawingButtonEvent () {
        // drawingMode = false;
      }
      this.input = function (x, y) {
        if(drawingTool)
        drawingTool.input(x, y);
      }
      this.inputFinished = function () {
        if(drawingTool)
        drawingTool.inputFinished();
      }
    }
    var Pencil = function (parent) {
      this.input = function (x, y) {
        var coord = [x, y];
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
          p.line(pencilDrawing[i][0], pencilDrawing[i][1], pencilDrawing[i+1][0], pencilDrawing[i+1][1]);
        }
      }
    }
    var Circle = function () {
      this.input = function (x, y) {

      }
    }
}
//////////////////////////////////////////////////////////////////////










  $('#editProfile').on('click', function () {
      var profilePicCanvas = new p5(ProfilePicCanvas, profilePicCanvasContainer);
      $('#profilePicModal').modal('show');
      var canvas2 = $('#profilePicCanvasContainer').find('canvas');
      canvas2.attr('id', 'profilePicCanvas');
  });
  $('#profilePicModal').on('hidden.bs.modal', function () {
    $('#profilePicCanvas').remove();
    $('#profilePicSecondaryControlsContainer').find('div').remove();
    $('#profilePicSecondaryControlsContainer').find('button').remove();
    $('#profilePicPrimaryControlsContainer').find('div').remove();
    $('#profilePicPrimaryControlsContainer').find('button').remove();
    if(globalStream)
    globalStream.stop();
  });
  $('#profilePicForm').on('submit', function (event) {
      event.preventDefault();

      var can = $('#profilePicCanvas');
      var profilePicImageData = can.get(0).toDataURL('image/png');
      var profilePicText = $('#profilePicTextArea').val();

      $.ajax({
          url: '/new-profile-pic',
          type: 'POST',
          data: {
              profilePicText: profilePicText,
              profilePicImageData: profilePicImageData
          },
          success: function (data) {
              // change profile pic image source.
              if(data == 'unsuccessfull') {
                  alert('write something about sketch');
              } else if(data == 'successfull') {
                  $('#profilePicTextArea').val('');
                  $('#profilePicModal').modal('toggle');
                  alert('successfully updated profilepic');
                  loadProfilePic($('#profileImage'), $('#profileContainer').attr('user-id'), $('#profileContainer').attr('username'));
              }
          }
      });
  });
  $('#editWallPainting').on('click', function () {
      var profilePicCanvas = new p5(WallPaintingCanvas, wallPaintingCanvasContainer);
      $('#wallPaintingModal').modal('show');
      var canvas2 = $('#wallPaintingCanvasContainer').find('canvas');
      canvas2.attr('id', 'wallPaintingCanvas');
  });
  $('#wallPaintingModal').on('hidden.bs.modal', function () {
    $('#wallPaintingCanvas').remove();
    $('#wallPaintingSecondaryControlsContainer').find('div').remove();
    $('#wallPaintingSecondaryControlsContainer').find('button').remove();
    $('#wallPaintingPrimaryControlsContainer').find('div').remove();
    $('#wallPaintingPrimaryControlsContainer').find('button').remove();
    if(wallPaintingGlobalStream)
    wallPaintingGlobalStream.stop();
  });
  $('#wallPaintingForm').on('submit', function (event) {
      event.preventDefault();

      var can = $('#wallPaintingCanvas');
      var wallPaintingImageData = can.get(0).toDataURL('image/png');
      var wallPaintingText = $('#wallPaintingTextArea').val();

      $.ajax({
          url: '/new-wall-painting',
          type: 'POST',
          data: {
              wallPaintingText: wallPaintingText,
              wallPaintingImageData: wallPaintingImageData
          },
          success: function (data) {
              // change profile pic image source.
              if(data == 'unsuccessfull') {
                  alert('write something about sketch');
              } else if(data == 'successfull') {
                  $('#wallPaintingTextArea').val('');
                  $('#wallPaintingModal').modal('toggle');
                  alert('successfully updated wallPainting');
                  loadWallPainting($('#wallPaintingContainer'), $('#profileContainer').attr('user-id'), $('#profileContainer').attr('username'));
              }
          }
      });
  });
});
