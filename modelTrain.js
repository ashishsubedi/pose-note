let notes = {
    C: 261.6256,
    D: 293.6648,
    E: 329.6276,
    F: 349.2282,
    G: 391.9954,
    A: 440.0,
    B: 493.8833
};
let brain;
function setup() {
    let options = {
        inputs: 4,
        outputs: 1,
        task: 'regression',
        debug: true
    };

    brain = ml5.neuralNetwork(options);

    brain.loadData("http://localhost:3000/pose_notes.json", dataLoaded);
}
function dataLoaded(){
    brain.normalizeData();
    console.log("training Started")
    brain.train({epochs: 30}, finished);

}
function finished(){
    console.log("Model trained")
    brain.save();
}