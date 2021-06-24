export default class Key {
    props; // Key properties
    timestamp = -1;
    note;

    static _INCREMENT = 2;

    constructor() {}

    init(props) {
        this.props = props;
    }
   
    press(timestamp) {

        const INCREMENT = Key._INCREMENT;

        this.timestamp = timestamp;

        let note = {
            X: this.props.X,
            Y: this.props.Y - 1, //The " - 1" is the prevent the rendered note from erasing part of the rendered key 
            width: this.props.width,
            height: 0,
            isBlack: this.props.isBlack,
            released: false
        };

        note.update = () => {

            if (note.Y > 0) {
                note.Y = Math.max(0, note.Y - INCREMENT);
            } 

            if ((note.Y + note.height < this.props.Y) && (note.Y + note.height + INCREMENT <=  this.props.Y) && (!note.released)) {
                note.height += INCREMENT;
            } 

            if (!this.isPressed()) {
                note.released = true;
            }
            
            if ((note.released) && (note.Y == 0) && (note.height > 0)) {
                note.height = Math.max(0, note.height - INCREMENT);
            }
        };

        note.isFinished = () => {
            return ((note.released) && (note.Y == 0) && (note.height == 0));
        }

        return note;
    }

    isPressed() {
        return (this.timestamp != -1);
    }

    release(timestamp) {
        let noteData = {
            startTime: this.timestamp,
            duration: timestamp - this.timestamp
        };
        this.timestamp = -1; //used to check if key is being pressed or not
        return noteData;
    }

    // Sets the note increment in terms of pixels
    setNoteSpeed(num) {
        Key._INCREMENT = Math.round(num); // Animation is smooth with only whole numbers
    }

    getProperties() {
        return this.props;
    }
}