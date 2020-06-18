/*It is the module that performs the deep learning process 
of the movements that should be done according to the animations.*/

let video,
    poseNet,
    pose,
    skeleton,
    currentPose='idle',
    poseConfidence=0,
    brain,
    saveState='waiting',
    poseLabel;

function setup(){

    let options = {
        inputs: 4,
        outputs: 3,
        task: 'classification',
        debug: true
    }
    brain = ml5.neuralNetwork(options);

    brain.loadData('PoseEstimation/TrainData/train_data.json',dataReady);

}

function dataReady(){
    console.log('Data ready...')
    brain.normalizeData();
    brain.train({epochs: 150},finishedTrain);
}

function finishedTrain(){
    console.log('Model Trained...');
    brain.save();
}

function modelLoaded(){
    console.log('Posenet ready...');
}