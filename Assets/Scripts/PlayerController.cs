using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float jumpForce = 5f;
    [SerializeField] private float groundDrag = 5f;
    [SerializeField] private float airDrag = 2f;
    [SerializeField] private bool isGrounded;
    [SerializeField] private float groundDist = 0.2f;
    [SerializeField] private LayerMask groundLayer;

    [Header("Shooting")]
    [SerializeField] private float shootForce = 20f;
    [SerializeField] private float shootCooldown = 0.1f;
    [SerializeField] private Transform shootPoint;
    [SerializeField] private GameObject bulletPrefab;
    private float lastShootTime = 0f;

    [Header("Camera")]
    [SerializeField] private Camera playerCamera;
    [SerializeField] private float mouseSensitivity = 2f;
    private float xRotation = 0f;

    private CharacterController controller;
    private Vector3 velocity;
    private float verticalVelocity = 0f;

    void Start()
    {
        controller = GetComponent<CharacterController>();
        if (playerCamera == null)
            playerCamera = Camera.main;

        // Lock cursor to game window
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        HandleMovement();
        HandleCameraLook();
        HandleShooting();
        HandleInput();
    }

    void HandleMovement()
    {
        // Check if grounded
        isGrounded = Physics.Raycast(transform.position, Vector3.down, groundDist, groundLayer);

        // Get input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        // Move forward/backward and left/right
        Vector3 move = transform.forward * vertical + transform.right * horizontal;
        controller.Move(move * moveSpeed * Time.deltaTime);

        // Handle gravity
        if (isGrounded && verticalVelocity < 0)
        {
            verticalVelocity = -2f; // Small negative value to keep grounded
        }
        else
        {
            verticalVelocity -= 9.81f * Time.deltaTime; // Gravity
        }

        // Handle jump
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            verticalVelocity = jumpForce;
        }

        // Apply vertical velocity
        controller.Move(Vector3.up * verticalVelocity * Time.deltaTime);
    }

    void HandleCameraLook()
    {
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;

        // Rotate body left/right
        transform.Rotate(Vector3.up * mouseX);

        // Rotate camera up/down
        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f);
        playerCamera.transform.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
    }

    void HandleShooting()
    {
        if (Input.GetMouseButton(0) && Time.time - lastShootTime >= shootCooldown)
        {
            Shoot();
            lastShootTime = Time.time;
        }
    }

    void Shoot()
    {
        if (shootPoint == null)
        {
            Debug.LogWarning("Shoot point not assigned!");
            return;
        }

        if (bulletPrefab == null)
        {
            Debug.LogWarning("Bullet prefab not assigned!");
            return;
        }

        // Instantiate bullet
        GameObject bullet = Instantiate(bulletPrefab, shootPoint.position, shootPoint.rotation);
        Rigidbody bulletRb = bullet.GetComponent<Rigidbody>();

        if (bulletRb != null)
        {
            bulletRb.velocity = shootPoint.forward * shootForce;
        }

        // Destroy bullet after 5 seconds
        Destroy(bullet, 5f);
    }

    void HandleInput()
    {
        // Unlock cursor with ESC
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            Cursor.lockState = CursorLockMode.None;
        }
    }
}
