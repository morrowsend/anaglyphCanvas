//reference: https://stackoverflow.com/a/32618526  


/*
red/blue Anaglyph using Fabric.js freedraw and shadows.
The key is to use the globalCompositeOperation = 'multiply';  to get the red and blue to make black when they overlap


To Add:
- Get depth working correctly
- radio button to allow automatically making further objects lighter  colors

--Allow you to make geometric solids.... and rotate them?

-- Add ability to create keyframes, then animate them with tweens

- allow change of dept of already drawn thing? This would include both the opacity as well as the shadow offset which I'm not sure I can do either of those with a freebrush
- Add text boxes
- add circles, squares, etc.
- Undo/Redo button
- save images to computer
- Better interface (overlay? Vertical sliders?)


Would Be Neat:
- IMGUR gallery like other guy's code?

- Import images and manually clip/mask areas for different distances within that image (mountains in bkgnd far away, midground and foreground close up)

- "painting inside of tube" where center of canvas is furthest vanishing point and the firther you are from it the closer things are, allowing you to 3D look into the vanishing point automatically?
*/
var opacity = 1;
var color = "rgba(255,0,0,1)";
var eraseNow = false;

var debug = false
// Fabric.js Canvas object
var canvas;
var state; // current unsaved state         
var undo = []; // past states         
var redo = []; // reverted states
var scrollable = true
/**
 * Push the current state into the undo stack and then capture the current state
 */
function save() {
    // clear the redo stack
    redo = [];

    // initial call won't have a state
    if (state) {
        undo.push(state);
    }
    state = JSON.stringify(canvas);
}

/**
 * Save the current state in the redo stack, reset to a state in the undo stack, and enable the buttons accordingly.
 * Or, do the opposite (redo vs. undo)
 * @param playStack which stack to get the last state from and to then render the canvas as
 * @param saveStack which stack to push current state into
 * @param buttonsOn jQuery selector. Enable these buttons.
 * @param buttonsOff jQuery selector. Disable these buttons.
 */
function replay(playStack, saveStack) {
    saveStack.push(state);
    state = playStack.pop();
    canvas.clear();
    canvas.loadFromJSON(state, function() {
        canvas.renderAll();
    });
} //end replay



// Set up the canvas
canvas = new fabric.Canvas('canvas', {
    isDrawingMode: true,
     backgroundColor: "white"
});
var windowWidth = window.innerWidth;
canvas.setWidth(windowWidth * .60);
canvas.setHeight(500);

canvas.freeDrawingBrush.width = 10;
canvas.freeDrawingBrush.color = color;
canvas.freeDrawingBrush.setShadow('5px 0px cyan')

// save initial state
save();



// register event listener for user's actions
canvas.on('object:modified', function() {
    save();
});

canvas.on('object:added', function() {
    if (debug) save(); //must save after every addition of a part...?
});




canvas.on('path:created', function(opt) {
     opt.path.globalCompositeOperation = 'multiply';   

     canvas.renderAll();
    save();  //must save after every addition of a part.

});


// Button callback
var imageSaver = document.getElementById("saveImage");
imageSaver.addEventListener("click", saveImage, false);



//Toggle erase mode
var eraseMode = document.getElementById('eraser');
eraseMode.onclick = function() {


    if (eraseNow) {
        eraseMode.innerHTML = 'Erase';
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.setShadow('5px 0px cyan')
        opacity = document.getElementById('drawing-line-opacity').value / 100;
        color = "rgba(255,0,0," + opacity + ")";
        canvas.freeDrawingBrush.color = color;
        canvas.on('path:created', function(opt) {
            opt.path.globalCompositeOperation = 'multiply';
            canvas.renderAll();
            save();
        });
    } else {
        eraseMode.innerHTML = 'Draw';
        var white = "rgba(255,255,255,1)";
        canvas.freeDrawingBrush.color = white;
        canvas.freeDrawingBrush.setShadow('0px 0px white')
        canvas.on('path:created', function(opt) {
            opt.path.globalCompositeOperation = 'destination-out';
            canvas.renderAll();
            save();
        });
    } //end else
    eraseNow = !eraseNow
};



// reference: https://www.sanwebe.com/snippet/downloading-canvas-as-image-dataurl-on-button-click
function saveImage(e) {
    image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    var link = document.createElement('a');
    link.download = "my-image.png";
    link.href = image;
    link.click();
}



//Clear canvas
$('#clear-canvas').click(function() {
    canvas.clear();
})




//Toggle drawing or selecting mode
var drawingModeEl = document.getElementById('drawing-mode');
drawingModeEl.onclick = function() {
    canvas.isDrawingMode = !canvas.isDrawingMode;

    if (canvas.isDrawingMode) {
        drawingModeEl.innerHTML = 'Click Here to Move Lines';
    } else {
        drawingModeEl.innerHTML = 'Click Here to Draw!';
    }
};


//Toggle drawing or selecting mode
var scrollMode = document.getElementById('scrolling');
scrollMode.onclick = function() {

    if (scrollable) {
        scrollMode.innerHTML = 'Scroll Page';
      disableScroll();
    } else {
        scrollMode.innerHTML = 'Tablet Mode';
      enableScroll();
    }
};


// undo and redo buttons
$('#redo').click(function() {
    replay(redo, undo);
    console.log("redo stack =", redo.length)
})


$('#undo').click(function() {
    replay(undo, redo);
    console.log("undo  stack =", undo.length)
});




document.getElementById('drawing-line-opacity').addEventListener('click', function(e) {
    opacity = e.target.value / 100;
    // Change opacity of selected object
    var currentlySelected = canvas.getActiveObject()
    if (currentlySelected != null) {
        canvas.getActiveObject().setOpacity(opacity)
        var context = canvas.getContext("2d"); // returns the 2d context object
        context.globalAlpha = 2; // full opacity

        canvas.renderAll();
        save();
    } else {
        opacity = document.getElementById('drawing-line-opacity').value / 100;
        color = "rgba(255,0,0," + opacity + ")";
        canvas.freeDrawingBrush.color = color;
    }
    this.previousSibling.innerHTML = this.value;
});




canvas.on('mouse:down', function(options) {
    /* if (options.target) {
    console.log('an object was clicked! ', options.target.type);
    } */
    // if(document.getElementById('drawing-shadow-offset').value == '0'){
    //  opacity = document.getElementById('drawing-line-opacity').value/100;
    //  color = "rgba(0,0,0,"+opacity+")";
    //  }
    //  else{
    // opacity = document.getElementById('drawing-line-opacity').value/100;
    // color = "rgba(255,0,0,"+opacity+")";
    //  }

    // opacity = document.getElementById('drawing-line-opacity').value/100;
    //             color = "rgba(255,0,0,"+opacity+")";
    //             canvas.freeDrawingBrush.color = color;
});

document.getElementById('drawing-line-width').addEventListener('click', function(e) {
    // console.log(e.target.value);
    canvas.freeDrawingBrush.width = e.target.value;
    this.previousSibling.innerHTML = this.value;
});




document.getElementById('drawing-shadow-offset').addEventListener('click', function(e) {
    //console.log(e.target.value); 
    var offset = e.target.value;
    if (offset == 0) offset++;


    var currentlySelected = canvas.getActiveObject()
    if (currentlySelected != null) {
        canvas.getActiveObject().shadow.offsetX = offset;
        canvas.renderAll();
        save();
    }
    canvas.freeDrawingBrush.shadow.offsetX = offset;
    this.previousSibling.innerHTML = this.value;
});



var ctrlDown = false;
var shiftKeyDown = false;



document.addEventListener("keydown", function(event) {
    // event.preventDefault();  //prevents default browser keyboard shortcuts

    //Delete currently selected object when the "delete" key is pressed on the keyboard
    var keyPressed = event.keyCode;
    if (keyPressed === 17) { //If ctrl is pressed, set ctrlDown to true
        ctrlDown = true;
    }


    if (ctrlDown && shiftKeyDown && keyPressed === 90) { //handle ctrl+shift+z (90 = z) 
        replay(redo, undo);
        // console.log("K redo  stack =", redo.length)

    }

    if (ctrlDown && !shiftKeyDown && keyPressed === 90) { //handle ctrl+z (90 = z) 
        replay(undo, redo);
        // console.log("K undo stack =", undo.length)          
    }

    if (keyPressed === 16) { // handle Shift key

        shiftKeyDown = true;
    }
}); //end keydown eventListener



//Set ctrlDown to false when we release the ctrl key
document.addEventListener("keyup", function(event) {
    var keyReleased = event.keyCode;

    if (keyReleased == 17) { //ctrl key
        ctrlDown = false;
    }

    if (keyReleased === 16) { //shift key
        shiftKeyDown = false;
    }
}); //end keyup Event Listener

function disableScroll() {
  scrollable = false
    // Get the current page scroll position
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
  
        // if any scroll is attempted, set this to the previous value
        window.onscroll = function() {
            window.scrollTo(scrollLeft, scrollTop);
        };
}
  
function enableScroll() {
  scrollable = true
    window.onscroll = function() {};
}