var scene,
    camera,
    renderer,
    element,
    container,
    effect,
    controls,
    clock,

    // Particles
    particles = new THREE.Object3D(),
    totalParticles = 200,
    maxParticleSize = 200,
    particleRotationSpeed = 0,
    particleRotationDeg = 0,
    lastColorRange = [0, 0.3],
    currentColorRange = [0, 0.3],

    // City and weather API set up
    cities = [['Sydney', '2147714'], ['New York', '5128638'], ['Tokyo', '1850147'], ['London', '2643743'], ['Mexico City', '3530597'], ['Miami', '4164138'], ['San Francisco', '5391959'], ['Rome', '3169070']],
    cityWeather = {},
    cityTimes = [],
    currentCity = 0,
    currentCityText = new THREE.TextGeometry(),
    currentCityTextMesh = new THREE.Mesh();

init();




function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.001, 700);

  camera.position.set(0, 15, 0);

  scene.add(camera);

  renderer = new THREE.WebGLRenderer();
  element = renderer.domElement;
  container = document.getElementById('webglviewer');
  container.appendChild(element);

  effect = new THREE.StereoEffect(renderer);

  controls = new THREE.OrbitControls(camera, element);
  controls.target.set(
    camera.position.x + 0.15,
    camera.position.y,
    camera.position.z
  );
  controls.noPan = true;
  controls.noZoom = true;

  function setOrientationControls(e) {
    if (!e.alpha) {
      return;
    }
  }

  window.addEventListener('deviceorientation', setOrientationControls, true);

  controls = new THREE.DeviceOrientationControls(camera, true);
  controls.connect();
  controls.update();

  element.addEventListener('click', fullscreen, false);

  window.removeEventListener('deviceorientation', setOrientationControls, true);

  var light = new THREE.PointLight(0x999999, 2, 100);
  light.position.set(50, 50, 50);
  scene.add(light);

  var lightScene = new THREE.PointLight(0x999999, 2, 100);
  lightScene.position.set(0, 5, 0);
  scene.add(lightScene);

  var floorTexture = THREE.ImageUtils.loadTexture('textures/wood.jpg');
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat = new THREE.Vector2(50, 50);
  floorTexture.anisotropy = renderer.getMaxAnisotropy();

  var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 20,
    shading: THREE.FlatShading,
    map: floorTexture
  });

  var geometry = new THREE.PlaneBufferGeometry(1000, 1000);

  var floor = new THREE.Mesh(geometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  var particleTexture = THREE.ImageUtils.loadTexture('textures/particles.png');
  spriteMaterial = new THREE.SpriteMaterial({
    map: particleTexture,
    color: 0xffffff
  });

  for (var i = 0; i < totalParticles; i++) {
    let sprite = new THREE.Sprite(spriteMaterial);

    sprite.scale.set(64, 64, 1.0);
    sprite.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.75);
    sprite.position.setLength(maxParticleSize * Math.random());

    sprite.material.blending = THREE.AdditiveBlending;

    particles.add(sprite);
  }

  particles.position.y = 70;
  scene.add(particles);

  function adjustToWeatherConditions() {
    let cityIDs = '';
    for (var i = 0; i < cities.length; i++) {
      cityIDs += cities[i][1];
      if (i != cities.length - 1) cityIDs += ',';
    }
    //refactor below, add url to var, maybe obfuscate the appid as well
    getURL('http://api.openweathermap.org/data/2.5/group?id=' + cityIDs + '&APPID=kj34723jkh23kj89dfkh2b28ey982hwm223iuyhe2c', function(info) {
      cityWeather = info.list;
      lookupTimezones(0, cityWeather.length);
    });
  }
  function lookupTimezones(t, len) {
    var tz = new TimeZoneDB;

    tz.getJSON({
      key: "KH3KH239D1S",
      lat: cityWeather[t].coord.lat,
      lng: cityWeather[t].coord.lon
    }, function(timeZone) {
      cityTimes.push(new Date(timeZone.timestamp * 1000));

      t++;

      if (t < len) {
        setTimeout(function() {
          lookupTimezones(t, len);
        }, 1200);
      } else {
        applyWeatherConditions();
      }
    });
  }

  
}
