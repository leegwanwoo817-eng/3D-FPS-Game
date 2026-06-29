using UnityEngine;

public class EnemyAI : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 3f;
    [SerializeField] private float stoppingDistance = 0.5f;
    [SerializeField] private float lookRadius = 20f;

    [Header("Attack")]
    [SerializeField] private float attackRange = 2f;
    [SerializeField] private float attackCooldown = 1f;
    [SerializeField] private float attackDamage = 10f;
    private float lastAttackTime = 0f;

    [Header("Health")]
    [SerializeField] private float health = 50f;
    private float maxHealth;

    private Transform player;
    private Rigidbody rb;
    private HealthSystem healthSystem;
    private bool isChasing = false;

    void Start()
    {
        player = GameObject.FindGameObjectWithTag("Player")?.transform;
        rb = GetComponent<Rigidbody>();
        healthSystem = GetComponent<HealthSystem>();
        maxHealth = health;

        if (healthSystem != null)
        {
            healthSystem.SetMaxHealth((int)maxHealth);
        }
    }

    void Update()
    {
        if (player == null) return;

        float distanceToPlayer = Vector3.Distance(transform.position, player.position);

        // Check if player is in range
        if (distanceToPlayer < lookRadius)
        {
            isChasing = true;
        }
        else
        {
            isChasing = false;
        }

        if (isChasing)
        {
            // Move towards player
            if (distanceToPlayer > stoppingDistance)
            {
                Vector3 direction = (player.position - transform.position).normalized;
                rb.velocity = direction * moveSpeed;

                // Face player
                transform.rotation = Quaternion.LookRotation(direction);
            }
            else
            {
                rb.velocity = Vector3.zero;
                // Try to attack
                if (distanceToPlayer < attackRange && Time.time - lastAttackTime >= attackCooldown)
                {
                    AttackPlayer();
                }
            }
        }
        else
        {
            rb.velocity = Vector3.zero;
        }
    }

    void AttackPlayer()
    {
        lastAttackTime = Time.time;
        Debug.Log("Enemy attacking player!");
        // Add attack logic here (particle effect, sound, etc.)
    }

    public void TakeDamage(float damageAmount)
    {
        health -= damageAmount;
        
        if (healthSystem != null)
        {
            healthSystem.SetHealth((int)health);
        }

        if (health <= 0)
        {
            Die();
        }
    }

    void Die()
    {
        Debug.Log("Enemy died!");
        Destroy(gameObject);
    }

    // Visualize detection range in editor
    void OnDrawGizmosSelected()
    {
        Gizmos.color = Color.yellow;
        Gizmos.DrawWireSphere(transform.position, lookRadius);

        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(transform.position, attackRange);
    }
}
