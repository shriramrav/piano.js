import colorScheme from "./colors.js"
import Key from "./key.js"

export class Visualizer {
    canvas;
    ctx;
    keys = [];
    notes = [];
    isRecording = false;
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        for (let i = 0; i < 88; i++) {
            this.keys.push(new Key());
        }
    }

    setCanvas(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.ctx;
    }

    resizeCanvas(x, y, addedValues) {
        this.canvas.width = addedValues ? this.canvas.width + x : x;
        this.canvas.height = addedValues ? this.canvas.height + y : y;
    }

    getKey(index) {
        return this.keys[index];
    }

    // Draws keys on canvas
    drawKeys() {
    
        // Clears canvas
        this.ctx.fillStyle = colorScheme.background;
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        let whiteKeyWidth = Math.floor(this.canvas.width / 52);
        let keyHeight = Math.floor(this.canvas.height * 0.85);
        let keyList = [];

        /*
         * Used to generate alternating white and black key pattern
         * Creates "props" object which contains location, type, and other information about the key
         * After key properties have been created, they get sorted in a list named "keyList", which ensures that white keys are rendered before black keys
         * ^ This is to prevent white keys overlapping black keys
         * A border of 5 pixels should be maintained vertically and horizontally inside the canvas between the canvas edge and the keys
        */
        let drawPattern = (initPos, numKeys, keyCtr, _keyList) => {
            
            let pos = JSON.parse(JSON.stringify(initPos));

            for (let i = 0; i < numKeys; i++) {

                // Defaults to white key properties
                let props = {
                    X: pos * whiteKeyWidth + 5,
                    Y: keyHeight,
                    width: whiteKeyWidth - 1, // the "- 1" is show the shadowing appears between white keys
                    height: this.canvas.height - keyHeight - 5,
                    isBlack: false
                };

                // If key is black, changes properties
                if (i % 2 != 0) {
                    props.width = Math.floor(whiteKeyWidth / 4) * 2;
                    props.height = Math.floor(props.height * 0.7);
                    props.X = props.X - (props.width / 2);
                    props.isBlack = true;

                    // _keyList is sorted so white keys will appear first in the list
                    _keyList.push(props);
                } else {
                    _keyList.unshift(props);
                }

                console.log("index: " + keyCtr);
                this.getKey(keyCtr).init(props);

                // The pixel position only after a white key
                pos += (i % 2 != 0) ? 0 : 1;
                keyCtr++;
            }
        
            return { pos: pos, keyCtr: keyCtr };
        };


        let result = drawPattern(0, 3, 0, keyList);
        for (let i = 0; i < 7; i++) {
            result = drawPattern(result.pos, 5, result.keyCtr, keyList);
            result = drawPattern(result.pos, 7, result.keyCtr, keyList);
        }
        drawPattern(result.pos, 1, result.keyCtr, keyList);

        this.ctx.shadowColor = "black"; 
        this.ctx.shadowBlur = 2;
        
        // Rendering all the keys
        for (let i = 0; i < keyList.length; i++) {
            this.ctx.fillStyle = keyList[i].isBlack ? colorScheme.blackKey : colorScheme.whiteKey;
            this.ctx.fillRect(
                keyList[i].X, 
                keyList[i].Y,      
                keyList[i].width,
                keyList[i].height
            )
        }

        this.ctx.shadowBlur = 0;
    }
    
    tryMIDIAccess() {

        // Web MIDI API
        navigator.requestMIDIAccess({
            sysex: true

        // If connection worked, runs success function
        }).then((access) => {
            console.log('Connection established');
            for (let input of access.inputs.values()) {
                // Runs on update from Web MIDI API
                input.onmidimessage = (event) => {
                    // When no new input was created through the MIDI device, event.data.length = 1
                    if ((event.data.length > 1) && (event.data[0] != 176)) {
                        this.toggleKey(event.data[1] - 21, event.timeStamp);
                    }
                };
            }
        }, () => {
            if (confirm("Connection failed, please check browser support. Would you like to retry connecting?") == true) {
                this.tryMIDIAccess();
            }
        });
    }

    toggleKey(index, timestamp) {

        if (this.getKey(index).isPressed()) {

            let note = this.getKey(index).release(timestamp);

            if (this.isRecording) {
                this.events.get(note.start_time.toString()).duration = note.duration;
            }

        } else {
            if (this.isRecording) {
                this.events.set(timestamp.toString(), {
                    index: index
                });
                this.timestamps.push(timestamp);
            }
            this.notes.push(this.getKey(index).press(timestamp));
            // this.notes.sort((a, b) => {
            //     return a.isBlack - b.isBlack;
            // });
            this.notes.sort((a, b) => a.isBlack - b.isBlack);
        }

    }

    // Starts animation loop to display notes being played
    runAnim() {
        let step = () => {

            // console.log(this.notes.length);
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = colorScheme.background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.getKey(0).getProperties().Y);
            this.ctx.shadowBlur = 1;

            for (let i = 0; i < this.notes.length; i++) {

                this.notes[i].update();

                if (this.notes[i].isFinished()) {
                    this.notes.splice(i, 1); 
                    i--;
                } else {
                    this.ctx.fillStyle = this.notes[i].isBlack ? colorScheme.blackNote : colorScheme.whiteNote ;
                    this.ctx.fillRect(
                        this.notes[i].X,
                        this.notes[i].Y,
                        this.notes[i].width,
                        this.notes[i].height
                    );
                }

            }

            window.requestAnimationFrame(step);
        }
          
        window.requestAnimationFrame(step);
    }
}