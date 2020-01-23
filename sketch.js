
let capture;
let posenet;
let pose;
let skeleton;
let brain;

let state = 'waiting'

let targetLabel = 'C';

let notes = {
    C: 261.6256,
    D: 293.6648,
    E: 329.6276,
    F: 349.2282,
    G: 391.9954,
    A: 440.0000,
    B: 493.8833
}
let env, wave;

function delay(time) {
    return new Promise((resolve, reject) => {
        if (isNaN(time)) {
            reject(new Error("Time is invalid"));
        } else {
            setTimeout(resolve, time);
        }

    });
}

function setup() {
    createCanvas(640, 480);


    env = new p5.Envelope();
    env.setADSR(0.05, 0.1, 0.5, 1);
    env.setRange(1.2, 0);

    wave = new p5.Oscillator();
    wave.setType('sine');
    wave.freq(440);
    wave.amp(env);


    capture = createCapture(VIDEO)
    capture.hide();
    posenet = ml5.poseNet(capture, 'single', posenetLoaded);
    posenet.on('pose', gotPoses);

    const options = {
        inputs: 4,
        outputs: 1,
        activationHidden: 'relu',
        debug: true,
        type: 'regression'
    }

    brain = ml5.neuralNetwork(options);

}

function posenetLoaded() {
    console.log("Posenet Model Loaded")
}
function gotPoses(poses) {
    if (poses.length > 0) {
        pose = poses[0].pose;
        skeleton = poses[0].skeleton;

        if (state == 'collection') {
            let inputs = [];
            inputs.push(pose.rightWrist.x)
            inputs.push(pose.rightWrist.y)
            inputs.push(pose.rightElbow.x)
            inputs.push(pose.rightElbow.y)

            targetFrequency = notes[targetLabel];
            wave.freq(targetFrequency);
            env.play();
            brain.addData(inputs,[targetFrequency]);
        }
    }
}



function draw() {
    background(255);
    translate(capture.width, 0);
    scale(-1, 1);
    image(capture, 0, 0,capture.width,capture.height);
    if (pose) {
        for (let i = 0; i < pose.keypoints.length; i++) {
            let x = pose.keypoints[i].position.x;
            let y = pose.keypoints[i].position.y;
            fill(0, 0, 255);
            circle(x, y, 16);
        }
        for (let i = 0; i < skeleton.length; i++) {
            let a = skeleton[i][0].position;
            let b = skeleton[i][1].position;
            strokeWeight(4);
            stroke(255);
            line(a.x, a.y, b.x, b.y);
        }
    }
}
async function keyPressed() {
    if (key == 's') {
        brain.saveData();
    } else{
        //Data collection
        targetLabel = key.toUpperCase();
        console.log(targetLabel);
        await delay(3000);
        console.log('Collecting');
        state = 'collection';

        await delay(10000);
        console.log("Stopped Colecting");
        state = 'waiting';
    }
}
