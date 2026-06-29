# Unity 3D FPS Game - Setup Guide

## Step 1: Install Unity
1. Download **Unity Hub** from https://unity.com/download
2. Install **Unity 2021 LTS** (or newer)
3. Install **Visual Studio Community** (for coding)

## Step 2: Clone the Repository
```bash
git clone https://github.com/leegwanwoo817-eng/3d-fps-game.git
cd 3d-fps-game
```

## Step 3: Open in Unity
1. Open **Unity Hub**
2. Click **"Add project from disk"**
3. Select the `3d-fps-game` folder
4. Open the project

## Step 4: Scene Setup

### Create the Main Scene
1. In Project window: Right-click **Assets/Scenes** → Create → Scene
2. Name it **MainScene**
3. Save it in **Assets/Scenes/**

### Setup Player
1. Create empty GameObject: **Right-click Hierarchy → 3D Object → Capsule**
2. Name it **"Player"** and tag it as "Player"
3. Add **Character Controller** component
4. Add **PlayerController.cs** script
5. Create child object (empty) called **"ShootPoint"** at position (0, 0, 1)
6. Add **Main Camera** as child (position: 0, 0.6, 0)

### Setup Camera
1. Select Player → Camera (child object)
2. Adjust position to (0, 0.6, 0) for head level

### Create Ground
1. Create Plane: **Right-click Hierarchy → 3D Object → Plane**
2. Scale it up: Set Scale to (10, 1, 10)
3. Create Material (right-click Assets → Material) → name it "Ground"
4. Assign to Plane
5. Add **Collider** to Plane
6. Tag it as "Ground"

### Setup Enemy Prefab
1. Create Sphere: **Right-click → 3D Object → Sphere**
2. Name it **"Enemy"**
3. Add **Rigidbody** component (Freeze Rotation)
4. Add **Sphere Collider**
5. Add **EnemyAI.cs** script
6. Add **HealthSystem.cs** script
7. Drag it to **Assets/Prefabs/** to make it a prefab
8. Delete from scene

### Setup Bullet Prefab
1. Create Sphere: **Right-click → 3D Object → Sphere**
2. Scale to (0.2, 0.2, 0.2)
3. Name it **"Bullet"**
4. Add **Rigidbody** (check "Is Kinematic")
5. Add **Sphere Collider** (check "Is Trigger")
6. Add **Bullet.cs** script
7. Set Damage Amount to 10
8. Drag it to **Assets/Prefabs/** to make it a prefab
9. Delete from scene

## Step 5: Configure Scripts

### Player Controller Setup
1. Select Player in Hierarchy
2. In Inspector, find **PlayerController** script
3. Assign:
   - **Shoot Point**: Drag "ShootPoint" object
   - **Bullet Prefab**: Drag Bullet prefab from Assets/Prefabs/
   - **Player Camera**: Drag Camera from scene or leave empty (auto-finds)

### Enemy AI Setup
1. Select Enemy Prefab
2. Assign **Look Radius**: 20
3. Assign **Attack Range**: 2

## Step 6: Spawn Enemies

### Option A: Manual (for testing)
1. Drag Enemy prefab into scene
2. Position it away from player
3. Click Play to test!

### Option B: Create Spawner Script
Create **Assets/Scripts/EnemySpawner.cs**:

```csharp
using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private GameObject enemyPrefab;
    [SerializeField] private Transform spawnPoint;
    [SerializeField] private float spawnInterval = 5f;
    private float lastSpawnTime = 0f;

    void Update()
    {
        if (Time.time - lastSpawnTime >= spawnInterval)
        {
            SpawnEnemy();
            lastSpawnTime = Time.time;
        }
    }

    void SpawnEnemy()
    {
        if (enemyPrefab == null || spawnPoint == null) return;
        Instantiate(enemyPrefab, spawnPoint.position, Quaternion.identity);
    }
}
```

## Step 7: Test!

1. Click **Play** button
2. Use **WASD** to move
3. Use **Mouse** to look around
4. **Left Click** to shoot
5. **Space** to jump

## Troubleshooting

### Player falls through ground?
- Make sure Plane has a Collider
- Check Character Controller height isn't too large

### Can't shoot?
- Make sure Shoot Point is assigned
- Check Bullet prefab is assigned
- Open Console (Ctrl+Shift+C) to see errors

### Enemy doesn't move?
- Make sure Enemy has Rigidbody with gravity enabled
- Check "Is Kinematic" is NOT checked
- Verify Player tag is set to "Player"

### Camera won't rotate?
- Make sure Main Camera is child of Player
- Check PlayerController script is on Player object

## Next Steps

1. Watch the tutorial: https://www.youtube.com/watch?v=xLw3N9KhUw0
2. Add UI (Health bar, Score display)
3. Add sound effects
4. Add multiple enemy types
5. Add weapon variety
6. Add level progression

## Open in Cursor

1. Download Cursor: https://www.cursor.com/
2. Open Cursor
3. Click **File → Open Folder**
4. Select the `3d-fps-game` folder
5. Ask Cursor questions about the code!

Happy coding! 🎮
