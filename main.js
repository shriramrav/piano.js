import { Visualizer } from "./visualizer.js"

let visualizer;

window.init = () => {
    visualizer = new Visualizer(document.getElementById("canvas"));
    fixCanvasDims();
    visualizer.drawKeys();
    visualizer.runAnim();
    visualizer.tryMIDIAccess();
}

window.addEventListener('resize', () => {
    fixCanvasDims(); 
    visualizer.drawKeys();
}); 

/* Ensures that:
    * canvas fits in browser window
    * all white keys fit in canvas with an even number of pixels
    * the "+ 9" is for the horizontal border between the canvas edge and the white keys 
*/
function fixCanvasDims() {
    visualizer.resizeCanvas(
        (Math.floor((document.body.clientWidth - 20) / 52) * 52) + 9,
        document.body.clientHeight - 18,
        false
    );
}

