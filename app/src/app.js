const deg2rad = (_degrees) => _degrees * Math.PI / 180;

var audioCtxCheck = window.AudioContext || window.webkitAudioContext;
if (!audioCtxCheck) {
    document.getElementById("warning").style.display = "block";
    document.getElementById("player").style.display = "none";
}

function resume() {
    if (!audioCtxCheck) {
        return;
    }

    var visualizer = new Visualizer();
    var player = document.getElementById("player");
    var loader = new SoundcloudLoader(player);
    var audioSource = new SoundCloudAudioSource(player);

    visualizer.init({
        containerId: "visualizer",
        audioSource: audioSource
    });

    var trackUrl;

    // On load, check to see if there is a track token in the URL, and if so, load that automatically
    if (window.location.hash) {
        trackUrl = "https://soundcloud.com/" + window.location.hash.substr(1);
    } else {
        trackUrl = "https://soundcloud.com/" + "shockone/polygon-shockone-vip";
    }

    loader.loadStream(trackUrl, () => audioSource.playStream(loader.streamUrl()));

    // Init values
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 600, 1500);

    /*
    var camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    */
    var aspect = window.innerWidth / window.innerHeight;
    var d = 250;

    var camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
    camera.position.set( 500, 500, 500 ); // all components equal

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 0); // background
    renderer.setSize(window.innerWidth, window.innerHeight);

    var group = new THREE.Group();
    scene.add(group);

    // Ambient Light
    var light = new THREE.AmbientLight(0xFFFFFF); // soft white light
    scene.add(light);

    // I'll create a matrix of cubes with the settings below.
    var cubeDimension = 45,
        cubeRows = 9,
        cubeColumns = 9,
        cubePadding = 1,
        cubes = []; // Don't ask me why, but I needed to initialize this array. This will accomodate each single object

    var cubeGeometry = new THREE.BoxGeometry(cubeDimension, 1, cubeDimension);

    for (var column = 0; column < cubeColumns; column++) {
        // Column cycle
        for (var row = 0; row < cubeRows; row++) {
            // Row cycle

            // First cube
            var cube = new THREE.Mesh(
                cubeGeometry,
                new THREE.MeshLambertMaterial({
                    // Note: I have to directly create the material object into the mesh, if I define the material before I can't change this indepedently.
                    color: 0x2c75ff, // That's a blue colour, I used this to debug and just left.
                    ambient: 0x2222c8,
                    transparent: true,
                    shininess: 85,
                    opacity: 0.05 // It will change on runtime anyway.
                })
            );

            cube.position.x = column * cubeDimension + cubePadding * column; // Position it
            cube.position.z = row * cubeDimension + cubePadding * row;

            group.add(cube); // Aaaaah, here it is, yes this should add into the scene the cube automatically
            cubes.push(cube); // And I add the cube into the array since I will be destroying this object shortly
        }
    }

    // Some post processing, fiddle around with these values to give it different FX
    var renderModel = new THREE.RenderPass(scene, camera);
    var effectBloom = new THREE.BloomPass(1.1, 2, 0.3, 1024);
    var effectFilm = new THREE.FilmPass(0.3, 1.5, 800, false);

    // Applying composer
    effectFilm.renderToScreen = true;

    var composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderModel);
    composer.addPass(effectBloom);
    composer.addPass(effectFilm);

    var time = new THREE.Clock();
    var centerCube = 40;

    // Render function

    document.body.appendChild(renderer.domElement);
    var render = makeRenderContext(camera, time, cubes, centerCube, audioSource, renderer, scene, composer);
    render();

    // Mouse and resize events
    window.addEventListener("resize", onWindowResize, false);

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        composer.reset(); // Comment this if you want to switch off postprocessing
    }
}