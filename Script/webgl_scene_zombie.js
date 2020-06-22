
//set our main variables
let scene,
    modelHealth=100,
    lastPose = 'idle',
    humanDistanceBar,
    humanDistanceText,
    humanDistanceTextLabel='Ditance Status',
    humanHealthBar,
    characterHealthText,
    humanPose,
    distance = 0,
    renderer,
    camera,
    model,
    possibleAnims,
    mixer,
    idle,
    punchSound=new Audio('Sounds/punch.mp3'),
    clock = new THREE.Clock(),
    currentlyAnimating = false,
    raycaster = new THREE.Raycaster(),
    loaderAnim = document.getElementById('js-loader');


init();

function init(){
    model_path = 'CharacterData/Zombie/zombieFull.glb';
    const canvas = document.querySelector('#scene');
    const backgroundColor = 0xf1f1f1;

    //init the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, 60, 100);

    //init the renderer
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    //add a camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.x = 0;
    camera.position.y = -3;
    camera.position.z = 30;

    var loader = new THREE.GLTFLoader();
    loader.load(
        model_path,
        function(gltf){
            model = gltf.scene;
            let fileAnimations = gltf.animations;

            model.traverse(o => {
                if(o.isMesh){
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
            });
            model.scale.set(7,7,7);
            model.position.y = -11;
            scene.add(model);

            loaderAnim.remove();

            mixer = new THREE.AnimationMixer(model);

            let idleAnimation='Armature.001|mixamo.com|Layer0';//animation code for idle animation
            let rightPunchAnimation='Armature.002|mixamo.com|Layer0';//animation code for right punch animation
            let leftPunchAnimation='Armature.003|mixamo.com|Layer0';//animation code for left punch animation
            let kickAnimation='Armature.004|mixamo.com|Layer0';//animation code for kick animation
            let dieAnimation='Armature.005|mixamo.com|Layer0';//animation code for die animation
            let standUpAnimation='Armature.006|mixamo.com|Layer0';//animation code for stand up animation
            
            let clips = fileAnimations.filter(val => val.name !== idleAnimation);
            
            possibleAnims = clips.map(val => {
                let clip = THREE.AnimationClip.findByName(clips, val.name);
                
                clip.tracks.splice(3,3);
                clip.tracks.splice(9,3);
                
                clip = mixer.clipAction(clip);
                return clip;
            });

            let idleAnim = THREE.AnimationClip.findByName(fileAnimations,idleAnimation);

            idleAnim.tracks.splice(3,3);
            idleAnim.tracks.splice(9,3);

            idle = mixer.clipAction(idleAnim);
            idle.play();
        },
        undefined,
        function(error){
            console.log(error)
        }
    );

    //add lights
    let hemiLight = new THREE.HemisphereLight(0xFFC695, 0xFFC695, 0.61);
    hemiLight.position.set(0,50,0);
    scene.add(hemiLight);

    //add directional light
    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xFFC695, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);    

    // Floor
    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        shininess: 0,
    });

    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);
    
    // add human distance bar
    var geometry = new THREE.CircleBufferGeometry( 2, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    humanDistanceBar = new THREE.Mesh( geometry, material );
    humanDistanceBar.position.x = -15;
    humanDistanceBar.position.y = 5;
    humanDistanceBar.position.z = -10;
    scene.add( humanDistanceBar );

    //add character health bar
    var geometry = new THREE.RingGeometry( 0.5, 2, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    humanHealthBar = new THREE.Mesh( geometry, material );
    humanHealthBar.position.x = 15;
    humanHealthBar.position.y = 5;
    humanHealthBar.position.z = -10;
    scene.add( humanHealthBar );

    //add distance status label
    var textLoaderDistance = new THREE.FontLoader();
    textLoaderDistance.load('fonts/optimer_regular.typeface.js',function(font){
        var textGeometry = new THREE.TextGeometry( humanDistanceTextLabel, {
            font: font,
            size: 1,
            height: 0,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            
        } );
        var textMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000, specular: 0xffffff
        });
        humanDistanceText = new THREE.Mesh(textGeometry,textMaterial);
        humanDistanceText.position.x = -14;
        humanDistanceText.position.y = 6;
        humanDistanceText.position.z = 1;
        scene.add(humanDistanceText);
    });

    //add human health label
    var textLoaderHealth = new THREE.FontLoader();
    textLoaderHealth.load('fonts/optimer_regular.typeface.js',function(font){
        var textGeometryHlt = new THREE.TextGeometry( 'Character Health', {
            font: font,
            size: 1,
            height: 0,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            
        } );
        var textMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000, specular: 0xffffff
        });
        characterHealthText = new THREE.Mesh(textGeometryHlt,textMaterial);
        characterHealthText.position.x = 6;
        characterHealthText.position.y = 6;
        characterHealthText.position.z = 1;
        scene.add(characterHealthText);
    });
    healthEffect();
}

//if the distance between the two eyes is between 14-17 pixels, the distance is sufficient
function isDistanceEnaught(value){
    if(value>=8 && value<=17){
        return true;
    }else{
        return false;
    }
}

function healthEffect(){
    if(modelHealth>=90){
        humanHealthBar.material.color.setHex(0x41FF00);
    }
    else if(modelHealth>=80){
        humanHealthBar.material.color.setHex(0x00FFE0);
    }
    else if(modelHealth>=70){
        humanHealthBar.material.color.setHex(0x00C9FF);
    }
    else if(modelHealth>=60){
        humanHealthBar.material.color.setHex(0x002CFF);
    }
    else if(modelHealth>=50){
        humanHealthBar.material.color.setHex(0x5400FF);
    }
    else if(modelHealth>=40){
        humanHealthBar.material.color.setHex(0xC100FF);
    }
    else if(modelHealth>=30){
        humanHealthBar.material.color.setHex(0xFF00F6);
    }
    else if(modelHealth>=20){
        humanHealthBar.material.color.setHex(0xFF00AF);
    }
    else if(modelHealth>=10){
        humanHealthBar.material.color.setHex(0xFF0000);
    }
}

function update(){
    if(mixer){
        mixer.update(clock.getDelta());
    }
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      
    renderer.render(scene, camera);
    requestAnimationFrame(update);
    
    //Receiving pose data by communicating with the activity estimation module
    humanPose = classifyPose();

    if(humanPose){
        distance =Math.abs(getDistance()); //retrieving the distance data of the user to act from the activity_estimation module
        humanPose.then(function(result){
            
            if(result[0].confidence>0.95 && isDistanceEnaught(Math.abs(distance))){
                console.log(result[0].label);
                if(result[0].label!='idle' && lastPose!=result[0].label){
                    //health effect for health bar
                    modelHealth=modelHealth-10;
                    healthEffect();
                    if(result[0].label == 'right_punch'){
                        punchEffect();
                        changeAnimation(idle,0.25,possibleAnims[1],0.25);
                    }
                    else if(result[0].label == 'left_punch'){
                        punchEffect();
                        changeAnimation(idle,0.25,possibleAnims[2],0.25);
                    }
                    else if(result[0].label == 'right_kick'){
                        punchEffect();
                        changeAnimation(idle,0.25,possibleAnims[3],0.25);
                    }
                    else if(result[0].label == 'left_kick'){
                        punchEffect();
                        changeAnimation(idle,0.25,possibleAnims[3],0.25);
                    }

                    //if your model is dead, do the animation of dying
                    //make your life 100 again after death
                    if(modelHealth<=0){
                        changeAnimation(idle,0.25,possibleAnims[4],0.25);
                        changeAnimation(idle,0.25,possibleAnims[5],0.25);
                        modelHealth = 100;
                        healthEffect();
                    }
                }
                lastPose=result[0].label;
            }
        });
        

        if(distance<7 || distance>24){
            humanDistanceBar.material.color.setHex(0xFF0000);
        }
        else if(distance<14 || distance>17){
            humanDistanceBar.material.color.setHex(0xFF6400);
        }
        else{
            humanDistanceBar.material.color.setHex(0x005DFF);
        }
    }

}

update();

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;

    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

function changeAnimation(from, fSpeed, to, tSpeed){
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function() {
        from.enabled = true;
        to.crossFadeTo(from, tSpeed, true);
        currentlyAnimating = false;
    },to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
}

function punchEffect(){
    punchSound.play();
}



//if you want to make animation according to the mouse, activate
/*
function playOnClick(){
    let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
    changeAnimation(idle, 0.25, possibleAnims[anim], 0.25);
}

function raycast(e, touch = false) {
    var mouse = {};
    if (touch) {
      mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
      mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0]) {
      var object = intersects[0].object;
          playOnClick();
    }}

window.addEventListener('click', e => raycast(e));
window.addEventListener('touchend', e => raycast(e, true));
*/
