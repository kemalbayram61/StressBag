/*It is the module that performs the deep learning process 
of the movements that should be done according to the animations.*/

let video,
    poseNet,
    pose,
    skeleton,
    brain;

function setup(){
    createCanvas(640,480);
    video = createCapture(VIDEO);
    video.hide();

    poseNet = ml5.poseNet(video,modelLoaded);
    poseNet.on('pose',getPose);

    let options = {
        inputs: 10,
        outputs: 5,
        task: 'classification',
        debug: true
    }
    brain = ml5.neuralNetwork(options);

    const modelInfo = {
        model: 'PoseEstimation/TrainModel/model.json',
        metadata: 'PoseEstimation/TrainModel/model_meta.json',
        weights: 'PoseEstimation/TrainModel/model.weights.bin'
    };
    brain.load(modelInfo,brainLoaded);

    //Hides the video screen created by the p5 module
    var p5Canvas = document.getElementById('defaultCanvas0');
    p5Canvas.style.display = "none";
}

function getPose(poses){
    if(poses.length > 0){
        pose=poses[0].pose;
        if(pose){
            skeleton = poses[0].skeleton;
        }
    }
}

function brainLoaded(){
    console.log('Pose Classification Ready...');
    classifyPose();
}

function modelLoaded(){
    console.log('Posenet ready...');
}

function classifyPose(){
    if(pose){
        let inputs = [];
        let dist1=dist(pose.rightWrist.x,pose.rightWrist.y,pose.rightShoulder.x,pose.rightShoulder.y);
        let dist2=dist(pose.leftWrist.x,pose.leftWrist.y,pose.leftShoulder.x,pose.leftShoulder.y);
        let dist3=dist(pose.rightWrist.x,pose.rightWrist.y,pose.leftShoulder.x,pose.leftShoulder.y);
        let dist4=dist(pose.leftWrist.x,pose.leftWrist.y,pose.rightShoulder.x,pose.rightShoulder.y);
        let dist5=dist(pose.rightAnkle.x,pose.rightAnkle.y,pose.leftKnee.x,pose.leftKnee.y);
        let dist6=dist(pose.leftAnkle.x,pose.leftAnkle.y,pose.rightKnee.x,pose.rightKnee.y);
        let dist7=dist(pose.rightAnkle.x,pose.rightAnkle.y,pose.rightWrist.x,pose.rightWrist.y);
        let dist8=dist(pose.rightAnkle.x,pose.rightAnkle.y,pose.leftWrist.x,pose.leftWrist.y);
        let dist9=dist(pose.leftAnkle.x,pose.leftAnkle.y,pose.rightWrist.x,pose.rightWrist.y);
        let dist10=dist(pose.leftAnkle.x,pose.leftAnkle.y,pose.leftWrist.x,pose.leftWrist.y);

        inputs.push(dist1);
        inputs.push(dist2);
        inputs.push(dist3);
        inputs.push(dist4);
        inputs.push(dist5);
        inputs.push(dist6);
        inputs.push(dist7);
        inputs.push(dist8);
        inputs.push(dist9);
        inputs.push(dist10);

        //brain.classify(inputs,getResult);
        let est= brain.classify(inputs);
        return est;

    }else{
        setTimeout(classifyPose,100);
    }
}

function getResult(error,results){
    //console.log(results);
    counter='idle';
    if(results[0].confidence>0.94){
        if(results[0].label=='left_punch'){
            counter='L';

        }else if(results[0].label=='right_punch'){
            counter='R';
        }
    }
    console.log(counter);
    //console.log(getDistance());
    //console.log(results[0].label);
    //console.log(results[0].confidence);
    classifyPose();
}

function draw(){
    image(video,0,0)
    push();
    if(pose){
        for(let i=0;i<pose.keypoints.length;i++){
            let x=pose.keypoints[i].position.x;
            let y=pose.keypoints[i].position.y;
            fill(0,255,0);
            ellipse(x,y,16,16);
        }
        for(let i=0;i<skeleton.length;i++){
            let a=skeleton[i][0];
            let b=skeleton[i][1];
            strokeWeight(2);
            stroke(255);
            line(a.position.x,a.position.y,b.position.x,b.position.y);
        }
    }
    pop();
    fill(255,0,255);
    noStroke();
    //textSize(50);
    //textAlign(100,100);
    //text(counter,width/2,height/2);
}

function getDistance(){
    return pose.rightEye.x-pose.leftEye.x;
}

