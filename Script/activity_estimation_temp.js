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

function keyPressed(){
    if(key == 's'){
        brain.saveData();
    }else{
        if(key == 'q'){poseLabel = 'idle';}
        else if(key == 'w'){poseLabel = 'right_punch';}
        else if(key == 'e'){poseLabel = 'left_punch';}
        else if(key == 'r'){poseLabel = 'right_kick';}
        else if(key == 't'){poseLabel = 'left_kick';}
        console.log(poseLabel);

        setTimeout(function(){
            console.log('collecting train data');
            saveState = 'collecting';
            setTimeout(function(){
                console.log('collecting complate');
                saveState = 'waiting';
            },20000);
        },7000);
    }
}

function setup(){
    createCanvas(640,480);
    video = createCapture(VIDEO);
    video.hide();

    poseNet = ml5.poseNet(video,modelLoaded);
    poseNet.on('pose',gotPoses);

    let options = {
        inputs: 4,
        outputs: 3,
        task: 'classification',
        debug: true
    }
    brain = ml5.neuralNetwork(options);

    const modelInfo = {
        model: 'PoseEstimation/TrainModel/model.json',
        metadata: 'PoseEstimation/TrainModel/model_meta.json',
        weights: 'PoseEstimation/TrainModel/model.weights.bin'
    };
    //brain.load(modelInfo,brainLoaded);
    //brain.loadData('PoseEstimation/TrainData/train_data.json',dataReady);

}

function dataReady(){
    brain.normalizeData();
    brain.train({epochs: 150},finishedTrain);
}

function finishedTrain(){
    console.log('Model Trained...');
    brain.save();
}

function brainLoaded(){
    console.log('Pose Classification Ready...');
    classifyPose();
}

function modelLoaded(){
    console.log('Posenet ready...');
}

function gotPoses(poses){
    
    if(poses.length > 0){
        pose=poses[0].pose;
        if(pose){
            skeleton=poses[0].skeleton;
            //let dist1=dist(pose.rightKnee.x,pose.rightKnee.y,pose.rightShoulder.x,pose.rightShoulder.y);
            //let dist1=pose.rightWrist.x;
            //counter=dist1;

            if(saveState=='collecting'){
                let inputs = [];
                let dist1=dist(pose.rightWrist.x,pose.rightWrist.y,pose.rightShoulder.x,pose.rightShoulder.y);
                let dist2=dist(pose.leftWrist.x,pose.leftWrist.y,pose.leftShoulder.x,pose.leftShoulder.y);
                let dist3=dist(pose.rightWrist.x,pose.rightWrist.y,pose.rightAnkle.x,pose.rightAnkle.y);
                let dist4=dist(pose.leftWrist.x,pose.leftWrist.y,pose.leftAnkle.x,pose.leftAnkle.y);

                inputs.push(dist1);
                inputs.push(dist2);
                inputs.push(dist3);
                inputs.push(dist4);

                let target=[targetLabel];
                brain.addData(inputs,target);
        }
    }
    }
}

function classifyPose(){
    if(pose){
        let inputs = [];
        let dist1=dist(pose.rightWrist.x,pose.rightWrist.y,pose.rightShoulder.x,pose.rightShoulder.y);
        let dist2=dist(pose.leftWrist.x,pose.leftWrist.y,pose.leftShoulder.x,pose.leftShoulder.y);
        let dist3=dist(pose.rightWrist.x,pose.rightWrist.y,pose.rightAnkle.x,pose.rightAnkle.y);
        let dist4=dist(pose.leftWrist.x,pose.leftWrist.y,pose.leftAnkle.x,pose.leftAnkle.y);

        inputs.push(dist1);
        inputs.push(dist2);
        inputs.push(dist3);
        inputs.push(dist4);

        //brain.classify(inputs,gotResult);
        let est= brain.classify(inputs);
        return est;

    }else{
        setTimeout(classifyPose,100);
    }
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