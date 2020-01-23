let video;
let poseNet;
let pose;
let skeleton;

let brain;

let env, wave;

let resultNote = 440;

function setup() {
	createCanvas(640, 480);

	env = new p5.Envelope();
	env.setADSR(0.05, 0.1, 0.5, 1);
	env.setRange(1.2, 0);

	wave = new p5.Oscillator();

	wave.setType('sine');
	wave.start();
	wave.freq(440);
	wave.amp(env);

	video = createCapture(VIDEO);
	video.hide();
	poseNet = ml5.poseNet(video, modelLoaded);
	poseNet.on('pose', gotPoses);

	let options = {
		inputs: 4,
		outputs: 1,
		task: 'regression',
		debug: true
	}
	brain = ml5.neuralNetwork(options);
	const modelInfo = {
		model: 'http://localhost:3000/model/model.json',
		metadata: 'http://localhost:3000/model/model_meta.json',
		weights: 'http://localhost:3000/model/model.weights.bin',
	};
	brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
	console.log('brain ready!');
	predictNote();


}

function gotPoses(poses) {
	// console.log(poses); 
	if (poses.length > 0) {
		pose = poses[0].pose;
		skeleton = poses[0].skeleton;
	}
}


function modelLoaded() {
	console.log('poseNet ready');
}

function draw() {
	push();
	translate(video.width, 0);
	scale(-1, 1);
	image(video, 0, 0, video.width, video.height);

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
		textSize(32);
		text(resultNote, 10, 10,0,0)

	}
	pop();

}

function predictNote() {
	if (pose) {
		let inputs = [];
		inputs.push(pose.rightWrist.x)
		inputs.push(pose.rightWrist.y)
		inputs.push(pose.rightElbow.x)
		inputs.push(pose.rightElbow.y)

		brain.predict(inputs, gotResult);
	} else {
		setTimeout(predictNote, 100);
	}
}
function gotResult(error, results) {
	if (error) {
		console.error(error);
		return;
	}

	resultNote = results[0].value;
	wave.freq(resultNote);
	console.log(resultNote);
	env.play();
	predictNote();

}