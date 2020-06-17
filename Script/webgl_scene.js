//set our main variables
var audio =new Audio('Sounds/punch.mp3');
var characterHealth=100;
var lastPose='idle';
var moduleName='activity_estimation';

let scene,
    renderer,
    fileAnimations,
    camera,
    model,
    waist,
    possibleAnims,
    mixer,
    idle,
    clock = new THREE.Clock(),
    raycaster = new THREE.Raycaster(),
    loaderAnim = document.getElementById('js-loader');

init();


//the function where all initial values ​​are determined for character animation
function init(){
    const model_path = 'CharacterData/Boss/bossModelWithAnimation.glb';
    
    var loader = new THREE.GLTFLoader();
    loader.load(
        model_path,

        function(gltf){
            model = gltf.scene;
            fileAnimations=gltf.animations;

            model.traverse(o =>{
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
            let dieAnimation='Armature.004|mixamo.com|Layer0';//animation code for die animation
            let standUpAnimation='Armature.005|mixamo.com|Layer0';//animation code for stand up animation

            //there should not be a idle animation in random animations
            let clips =fileAnimations.filter(val => val.name !== idleAnimation);
            possibleAnims = clips.map(val => {
                let clip = THREE.AnimationClip.findByName(clips,val.name);
                clip = mixer.clipAction(clip);
                return clip;
            });


            //the animation that our character will make when he comes to the first screen and an animation is requested
            idle = THREE.AnimationClip.findByName(fileAnimations,idleAnimation);
            idle.tracks.splice(3,3);
            idle.tracks.splice(9,3);
            idle = mixer.clipAction(idle);
            idle.play();
        },
        undefined,//dont need this function
        function(error){
            console.log(console.error);
        }
    );
    const canvas = document.querySelector('#scene');
    const backgroundColor = 0xf1f1f1;

    //init the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor,60,100);

    //init the renderer
    renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    //add a camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth/window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = -3;

    //add lights
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0,50,0);
    scene.add(hemiLight);

    //add directional light
    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
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

    //floor
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

    let geometry = new THREE.SphereGeometry(8,32,32);
    let material = new THREE.MeshBasicMaterial({color: 0xf2ce2e});
    let sphere = new THREE.Mesh(geometry,material);
    sphere.position.z = -15;
    sphere.position.y = -2.5;
    sphere.position.x = 0.25;
    scene.add(sphere);   

}


//function called when character animation changes
function changeAnimation(from,fspeed,to,tspeed){
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function() {
      from.enabled = true;
      to.crossFadeTo(from, tSpeed, true);
      currentlyAnimating = false;
    }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));   
}

//New dimensioning requirement for display rendering, isn't it?
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


//The function that realizes the character's animation continuity and motion waiting continuity
function update(){
    if(mixer){
        mixer.update(clock.getDelta());
    }
    if(resizeRendererToDisplaySize(renderer)){
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeihht;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene,camera);
    requestAnimationFrame(update);
}
update();

window.addEventListener('click', e => raycast(e));
window.addEventListener('touchend', e => raycast(e, true));