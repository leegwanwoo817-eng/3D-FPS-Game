// Three.js 3D FPS Game

let scene, camera, renderer;
let player, ground;
let enemies = [];
let bullets = [];
let keys = {};
let mouseX = 0, mouseY = 0;
let score = 0;
let health = 100;
let ammo = 30;
let maxAmmo = 30;
let gameOver = false;
let canShoot = true;
let shootCooldown = 200; // milliseconds

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 5;
    camera.position.z = 0;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 }); // Forest green
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.castShadow = true;
    ground.receiveShadow = true;
    scene.add(ground);

    // Player (invisible, just for collision)
    player = {
        position: new THREE.Vector3(0, 5, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        speed: 0.3,
        jumpForce: 0.8,
        isGrounded: true,
        gravity: -0.015
    };

    // Event listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === 'Escape') {
            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
            document.exitPointerLock();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    document.addEventListener('click', () => {
        if (!gameOver) {
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === document.body) {
            mouseX -= e.movementX * 0.005;
            mouseY -= e.movementY * 0.005;
            mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));
        }
    });

    document.addEventListener('mousedown', () => {
        if (!gameOver && canShoot && ammo > 0) {
            shoot();
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Spawn initial enemies
    spawnEnemies();

    // Start game loop
    animate();
}

function spawnEnemies() {
    for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 * i) / 3;
        const distance = 30;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        createEnemy(x, 0, z);
    }
}

function createEnemy(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 }); // Red
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const enemy = {
        mesh: mesh,
        health: 30,
        speed: 0.1,
        attackRange: 5,
        attackCooldown: 0,
        lastAttack: 0
    };

    enemies.push(enemy);
}

function shoot() {
    if (ammo <= 0 || !canShoot) return;

    ammo--;
    canShoot = false;
    setTimeout(() => { canShoot = true; }, shootCooldown);

    updateUI();

    // Create bullet from camera
    const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const bulletMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 }); // Yellow
    const bulletMesh = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bulletMesh.position.copy(camera.position);
    scene.add(bulletMesh);

    const direction = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), mouseY).applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseX);

    const bullet = {
        mesh: bulletMesh,
        velocity: direction.multiplyScalar(1),
        lifespan: 5000 // 5 seconds
    };

    bullets.push(bullet);
}

function updatePlayer() {
    // Movement
    const moveDirection = new THREE.Vector3();

    if (keys['w'] || keys['arrowup']) moveDirection.z -= 1;
    if (keys['s'] || keys['arrowdown']) moveDirection.z += 1;
    if (keys['a'] || keys['arrowleft']) moveDirection.x -= 1;
    if (keys['d'] || keys['arrowright']) moveDirection.x += 1;

    // Rotate movement by camera angle
    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        const rotationMatrix = new THREE.Matrix4().makeRotationY(mouseX);
        moveDirection.applyMatrix4(rotationMatrix);
        player.velocity.x = moveDirection.x * player.speed;
        player.velocity.z = moveDirection.z * player.speed;
    } else {
        player.velocity.x *= 0.9;
        player.velocity.z *= 0.9;
    }

    // Jump
    if ((keys[' '] || keys['w']) && player.isGrounded) {
        player.velocity.y = player.jumpForce;
        player.isGrounded = false;
    }

    // Gravity
    player.velocity.y += player.gravity;

    // Apply velocity
    player.position.add(player.velocity);

    // Ground collision
    if (player.position.y <= 0) {
        player.position.y = 0;
        player.velocity.y = 0;
        player.isGrounded = true;
    }

    // Boundary
    player.position.x = Math.max(-100, Math.min(100, player.position.x));
    player.position.z = Math.max(-100, Math.min(100, player.position.z));

    // Update camera position
    camera.position.copy(player.position);
    camera.position.y += 2; // Eye height
}

function updateCamera() {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = mouseX;
    camera.rotation.x = mouseY;
}

function updateEnemies() {
    enemies = enemies.filter(enemy => enemy.health > 0);

    enemies.forEach(enemy => {
        // Direction to player
        const direction = player.position.clone().sub(enemy.mesh.position);
        const distance = direction.length();
        direction.normalize();

        // Move towards player
        enemy.mesh.position.add(direction.multiplyScalar(enemy.speed));
        enemy.mesh.lookAt(player.position);

        // Attack if in range
        if (distance < enemy.attackRange) {
            if (Date.now() - enemy.lastAttack > 1000) {
                health -= 10;
                enemy.lastAttack = Date.now();
                updateUI();
                if (health <= 0) {
                    triggerGameOver();
                }
            }
        }
    });
}

function updateBullets() {
    bullets = bullets.filter(bullet => bullet.lifespan > 0);

    bullets.forEach(bullet => {
        bullet.mesh.position.add(bullet.velocity);
        bullet.lifespan -= 16; // ~60fps

        // Check collision with enemies
        enemies.forEach(enemy => {
            const distance = bullet.mesh.position.distanceTo(enemy.mesh.position);
            if (distance < 2) {
                enemy.health -= 15;
                bullet.lifespan = 0; // Destroy bullet

                if (enemy.health <= 0) {
                    scene.remove(enemy.mesh);
                    score += 100;
                    updateUI();

                    // Spawn new enemy
                    if (Math.random() < 0.5) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 30 + Math.random() * 20;
                        const x = Math.cos(angle) * distance;
                        const z = Math.sin(angle) * distance;
                        createEnemy(x, 0, z);
                    }
                }
            }
        });
    });

    // Remove bullets that are out of lifespan
    bullets.forEach(bullet => {
        if (bullet.lifespan <= 0) {
            scene.remove(bullet.mesh);
        }
    });
}

function updateUI() {
    document.getElementById('healthValue').innerText = Math.max(0, health);
    document.getElementById('scoreValue').innerText = score;
    document.getElementById('ammoValue').innerText = ammo;
}

function triggerGameOver() {
    gameOver = true;
    document.getElementById('gameOverTitle').innerText = health <= 0 ? 'YOU DIED!' : 'GAME OVER!';
    document.getElementById('finalScore').innerText = score;
    document.getElementById('gameOver').style.display = 'block';
}

function animate() {
    requestAnimationFrame(animate);

    if (!gameOver) {
        updatePlayer();
        updateCamera();
        updateEnemies();
        updateBullets();
    }

    renderer.render(scene, camera);
}

// Start game
init();
