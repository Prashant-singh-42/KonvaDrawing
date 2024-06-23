import Konva from "konva";
import {io} from 'socket.io-client';

const socket = io("http://localhost:3000")
socket.connect()
console.log(socket)

var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
  container: "container",
  width: width,
  height: height,
  listening: true,
});

// console.log(stage.isListening())
var drawTheLine = "line";
var drawTheCircle = "circle";
var putImage = "Image";
var currentMode = "";
var imageCount = 0;

var points = [];
var linepoints = [];
var colors = ["yellow", "blue", "green", "purple", "white", "black", "red"];
var currentCol = "";
var currStroke = 0;
var prevLine = [];

var isResizable


var layer1 = new Konva.Layer();
var layer2 = new Konva.Layer();
var layer3 = new Konva.Layer();
var background = new Konva.Layer();
var backgroundRect = new Konva.Rect({
  x: 0,
  y: 0,
  width: stage.width(),
  height: stage.height(),
  fill: "#c1adad",
});
background.add(backgroundRect)
stage.add(background)


var tr = new Konva.Transformer();
layer3.add(tr);


// function drawcircle() {
//   stage.listening(true);
//   if (stage.isListening()) {
//     stage.on("pointerdown", function () {
//       var pointerPos1 = stage.getPointerPosition();
//       console.log(pointerPos1)
//       points.push(pointerPos1);
//     });

//     stage.on("pointerup", function () {
//       var pointerPos2 = stage.getPointerPosition();
//       points.push(pointerPos2);
//       CalRdius(points);
//     });
//   }
// }

stage.on('click', function(e) {
  // console.log("in stage click event",e.target.attrs.name)
  if (e.target.attrs.name !== 'img'){
    tr.nodes([])
  }
})

function stagePointers() {
  stage.listening(true);
  if (stage.isListening()) {
    stage.on("pointerdown", function (e1) {
      e1.cancelBubble = true;
      
      console.log("im pointer down");
      var pointerPosDown = stage.getPointerPosition();
      console.log(pointerPosDown);
      if (currentMode === "circle") {
        points.push(pointerPosDown);
      }
      stage.on("pointermove", function (e2) {
        e2.cancelBubble = true;
        
        console.log("im pointer move");
        var pointerPosCurr = stage.getPointerPosition();
        // console.log(pointerPos1)
        if (currentMode === "line") {
          makeLine(pointerPosCurr);
        }
        // e2.evt.preventDefault()
      });
      // e1.evt.preventDefault()
    });

    stage.on("pointerup", function (e3) {
      // var pointerPos2 = stage.getPointerPosition();
      e3.cancelBubble = true;
      
      stage.off("pointermove");
      console.log("im pointer up");

      var pointerPosDown = stage.getPointerPosition();
      if (currentMode === "circle") {
        points.push(pointerPosDown);
        socket.emit('create a circle', {points,currentCol,currStroke})
        CalRdius(points,currentCol,currStroke);
      }

      if (currentMode === "line") {
        linepoints.splice(0, linepoints.length);
        socket.emit("make a line", prevLine[0])
        prevLine.splice(0, prevLine.length);
      }
      // e3.evt.preventDefault()
    });
  }
}

socket.on('draw the line', pline => {
  let socline = new Konva.Line(pline)
  if(currentMode === "delete"){
    socline.on('click', () => {
      this.destroy()
    })
  }

  layer1.add(socline)
})

// function drawline() {
//   // console.log(drawcircle,drawline)
//   console.log(stage.isListening());
//   stage.listening(true);
//   if (stage.isListening()) {
//     stage.on("pointerdown", function () {
//       stage.on("pointermove", function () {
//         var pointerPos1 = stage.getPointerPosition();
//         // console.log(pointerPos1)
//         makeLine(pointerPos1);
//       });
//     });

//     stage.on("pointerup", function () {
//       // var pointerPos2 = stage.getPointerPosition();
//       stage.off("pointermove");
//       linepoints.splice(0, linepoints.length);
//       prevLine.splice(0, prevLine.length);
//     });
//   }
// }

window.addEventListener('keydown', function(e) {
  // console.log(e)
  if (e.key === 't'){
    // console.log("keydown")
    isResizable = !isResizable
  }

  if(!isResizable){
    tr.nodes([])
  }

  console.log(isResizable);
  e.preventDefault()
})

// window.addEventListener('keyup', function(e) {
//   if (e.key === 't'){
//     tr.nodes([])
//     console.log("keyup")
//     isResizable = false
//   }
//   e.preventDefault()
// })

// console.log(e.evt.shiftKey)

window.addEventListener("resize", function () {
  // viewport and full window dimensions will change
  width = window.innerWidth;
  height = window.innerHeight;

  stage.width(width);
  stage.height(height);

  layer2.destroy();
  layer2 = new Konva.Layer();
  MakeUI();
  stage.add(layer2);
});

// function writeMessage(message) {
//   text.text(message);
// }

socket.on('draw the circle', ({points,currentCol,currStroke}) => {
  console.log("in the socket function")
  console.log(points,currStroke)
  CalRdius(points,currentCol,currStroke)
})

function CalRdius(points,currentCol,currStroke) {

  console.log(points);
  var p1 = points[0];
  var p2 = points[1];
  // console.log(points)
  var dis = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  // console.log(dis);
  var circle = new Konva.Circle({
    x: p1.x,
    y: p1.y,
    radius: dis,
    fill: currentCol || "pink",
    stroke: "black",
    strokeWidth: currStroke || 9,
    listening: true,
  });
  circle.on("click", function () {
    if (currentMode === "delete") {
      this.destroy();
    }
  });
  layer1.add(circle);
  points.pop();
  points.pop();
}

function makeLine(PofLine) {
  // console.log(drawcircle,drawline)
  points = [...linepoints, PofLine.x, PofLine.y];
  linepoints = points;
  console.log(points);
  var poly = new Konva.Line({
    points: points,
    stroke: currentCol,
    strokeWidth: currStroke,
    lineCap: "round",
    lineJoin: "round",
  });
  prevLine.push(poly);
  if (prevLine.length > 2) {
    var prevln = prevLine.shift();
    prevln.destroy();
  }
  poly.on("click", function () {
    if (currentMode === "delete") {
      this.destroy();
    }
  });

  layer1.add(poly);
}

function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// if (drawcircle) {
//   stage.on("pointerdown", function () {
//     var pointerPos1 = stage.getPointerPosition();
//     points.push(pointerPos1);
//   });

//   stage.on("pointerup", function () {
//     var pointerPos2 = stage.getPointerPosition();
//     points.push(pointerPos2);
//     CalRdius(points);
//   });
// }

// if (drawline) {
//   // console.log(drawcircle,drawline)
//   stage.on("pointerdown", function () {
//     stage.on("pointermove", function () {
//       var pointerPos1 = stage.getPointerPosition();
//       // console.log(pointerPos1)
//       makeLine(pointerPos1);
//     });
//   });

//   stage.on("pointerup", function () {
//     // var pointerPos2 = stage.getPointerPosition();
//     stage.off("pointermove");
//     linepoints.splice(0, linepoints.length);
//   });
// }



function MakeUI() {
  for (let i = 0; i < colors.length; i++) {
    var circle = new Konva.Circle({
      x: width - 70,
      y: height - 70 - i * 60,
      radius: 15,
      fill: colors[i],
      stroke: "black",
      strokeWidth: 2,
      listening: true,
    });
    circle.on("click", function () {
      currentCol = `${this.fill()}`;
      // console.log(currentCol);
    });
    layer2.add(circle);
    circle.tween = new Konva.Tween({
      node: circle,
      scaleX: 1.5,
      scaleY: 1.5,
      easing: Konva.Easings.EaseInOut,
      duration: 0.3,
    });
  }

  for (let i = 0; i < 3; i++) {
    var line = new Konva.Line({
      x: width - 100,
      y: i * 30 - 10,
      points: [5, 70, 50, 70],
      stroke: "black",
      strokeWidth: 3 * (i + 1),
      lineCap: "round",
      lineJoin: "round",
    });

    line.on("click", function () {
      currStroke = this.strokeWidth();
      // console.log(currStroke);
    });
    layer2.add(line);
    line.tween = new Konva.Tween({
      node: line,
      scaleX: 1.4,
      // scaleY: 1.1,
      easing: Konva.Easings.EaseInOut,
      duration: 0.3,
    });
  }

  var imageObj = new Image();
  imageObj.onload = function () {
    var pen = new Konva.Image({
      x: 30,
      y: height - 70,
      image: imageObj,
      width: 50,
      height: 50,
    });
    pen.on("click", function () {
      stage.listening(false);
      currentMode = drawTheLine;
      stagePointers();
    });
    // add the shape to the layer
    layer2.add(pen);
    pen.tween = new Konva.Tween({
      node: pen,
      scaleX: 1.1,
      scaleY: 1.1,
      easing: Konva.Easings.EaseInOut,
      duration: 0.3,
    });
  };
  imageObj.src = "/pen1.png";

  var imageObj1 = new Image();
  imageObj1.onload = function () {
    var cir = new Konva.Image({
      x: 130,
      y: height - 70,
      image: imageObj1,
      width: 50,
      height: 50,
    });
    cir.on("click", function () {
      stage.listening(false);
      currentMode = drawTheCircle;
      stagePointers();
    });
    // add the shape to the layer
    layer2.add(cir);
    cir.tween = new Konva.Tween({
      node: cir,
      scaleX: 1.1,
      scaleY: 1.1,
      easing: Konva.Easings.EaseInOut,
      duration: 0.3,
    });
  };
  imageObj1.src = "/cir2.png";



  var imageObj2 = new Image();
  imageObj2.onload = function () {
    var img = new Konva.Image({
      x: 230,
      y: Math.round(height - 70),
      image: imageObj2,
      width: 50,
      height: 50,
    });
    img.on("click", function () {
      // stage.listening(false);
      currentMode = putImage;
      var imgSrc = prompt("Image URL?");
      // console.log(imgSrc);
      var customImg = new Image();
      customImg.crossOrigin = 'Anonymous';
      customImg.onload = function () {
        console.log(customImg.width)
        var userImg = new Konva.Image({
          x: 130,
          y: 130,
          image: customImg,
          width: customImg.width,
          height: customImg.height,
          draggable: false,
          name: 'img',
        });
        userImg.on("click", function () {
          // console.log(isResizable)
          if(isResizable){
            this.draggable(true)
            tr.nodes([this])
          }else {
            this.draggable(false)
          }
          if(tr.nodes().length>2){
            tr.nodes.shift()
          }
          console.log(tr.nodes())
          if (currentMode === "delete") {
            tr.nodes([])
            this.destroy();
          }
        });
        // add the shape to the layer
        layer3.add(userImg);
      };
      customImg.src = imgSrc;

      // stagePointers()
    });
    // add the shape to the layer
    layer2.add(img);
    img.tween = new Konva.Tween({
      node: img,
      scaleX: 1.1,
      scaleY: 1.1,
      easing: Konva.Easings.EaseInOut,
      duration: 0.3,
    });
  };
  imageObj2.src = "/img1.png";




  var imageObj3 = new Image();
  imageObj3.onload = function () {
    var del = new Konva.Image({
      x: 330,
      y: height - 70,
      image: imageObj3,
      width: 50,
      height: 50,
    });
    del.on("click", function () {
      currentMode = "delete";
    });
    // add the shape to the layer
    layer2.add(del);
    del.tween = new Konva.Tween({
      node: del,
      scaleX: 1.1,
      scaleY: 1.1,
      easing: Konva.Easings.EaseInOut,
      duration: 0.3,
    });
  };
  imageObj3.src = "/delete1.png";



  var imageObj4 = new Image();
  imageObj4.onload = function () {
    var expo = new Konva.Image({
      x: width - 98,
      y: 150,
      image: imageObj4,
      width: 50,
      height: 50,
    });
    expo.on("click", function () {
      layer2.destroy();
      var dataURL = stage.toDataURL({ pixelRatio: 3 });
      downloadURI(dataURL, `stage${imageCount}.png`);
      imageCount += 1;
      layer2 = new Konva.Layer();
      MakeUI();
      stage.add(layer2);
    });
    // add the shape to the layer
    layer2.add(expo);
    expo.tween = new Konva.Tween({
      node: expo,
      scaleX: 1.1,
      scaleY: 1.1,
      easing: Konva.Easings.EaseInOut,
      duration: 0.3,
    });
  };
  imageObj4.src = "/export1.png";
  /////////////////////////////////////////////////////////////////////////////////////////////

  // function writeMessage(message) {
  //   text.text(message);
  // }

  // function loadImages(sources, callback) {
  //   var images = {};
  //   var loadedImages = 0;
  //   var numImages = 0;
  //   for (var src in sources) {
  //     numImages++;
  //   }
  //   for (var src in sources) {
  //     images[src] = new Image();
  //     images[src].onload = function () {
  //       if (++loadedImages >= numImages) {
  //         callback(images);
  //       }
  //     };
  //     images[src].src = sources[src];
  //   }
  // }
  // function buildStage(images) {
  //   var monkey = new Konva.Image({
  //     image: images.monkey,
  //     x: 30,
  //     y: height - 70,
  //     width: 70,
  //     height: 50,
  //   });

  //   var lion = new Konva.Image({
  //     image: images.lion,
  //     x: 130,
  //     y: height - 70,
  //     width: 50,
  //     height: 50,
  //   });

  //   monkey.on("mouseover", function () {
  //     console.log('hey')
  //     writeMessage("mouseover monkey");
  //   });

  //   monkey.on("mouseout", function () {
  //     console.log('hey')
  //     writeMessage("");
  //   });

  //   lion.on("mouseover", function () {
  //     console.log('hey')
  //     writeMessage("mouseover lion");
  //   });

  //   lion.on("mouseout", function () {
  //     console.log('hey')
  //     writeMessage("");
  //   });

  //   layer2.add(monkey);
  //   layer2.add(lion);
  //   layer2.add(text);
  //   stage.add(layer2);
  // }
  // var stage = new Konva.Stage({
  //   container: 'container',
  //   width: 578,
  //   height: 200,
  // });

  // var layer = new Konva.Layer();

  //   var text = new Konva.Text({
  //     x: 10,
  //     y: 10,
  //     fontFamily: "Calibri",
  //     fontSize: 24,
  //     text: "",
  //     fill: "black",
  //   });

  //   var sources = {
  //     lion: "/pen2.png",
  //     monkey: "/cir1.png",
  //   };

  //   loadImages(sources, buildStage);
  // }

  // var text = new Konva.Text({
  //   x: 10,
  //   y: 10,
  //   fontFamily: "Calibri",
  //   fontSize: 24,
  //   text: "",
  //   fill: "black",
  // });

  //////////////////////////////////////////////////////////////////////////////////////

  // circle.on("pointerdown", function () {
  //   var pointerPos = stage.getPointerPosition();
  //   var x = pointerPos.x - 190;
  //   var y = pointerPos.y - 40;
  //   writeMessage("x: " + x + ", y: " + y);
  // });

  // circle.on("pointerup", function () {
  //   var pointerPos = stage.getPointerPosition();
  //   var x = pointerPos.x - 190;
  //   var y = pointerPos.y - 40;
  //   writeMessage("x: " + x + ", y: " + y);
  // });

  // layer1.add(text);

  // add the layer to the stage
}
layer2.on('mouseover touchstart', function (evt) {
  evt.target.tween.play();
});

layer2.on('mouseout touchend click', function (evt) {
  evt.target.tween.reverse();
});


stage.add(layer3);
stage.add(layer1);
MakeUI();
stage.add(layer2);
console.log(stage.getChildren());
