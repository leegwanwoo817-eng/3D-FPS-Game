using UnityEngine;

public class Bullet : MonoBehaviour
{
    [SerializeField] private float damageAmount = 10f;
    private bool hasHit = false;

    void OnTriggerEnter(Collider collision)
    {
        if (hasHit) return;
        if (collision.CompareTag("Player")) return; // Don't hit player

        hasHit = true;

        // Check if it hit an enemy
        EnemyAI enemy = collision.GetComponent<EnemyAI>();
        if (enemy != null)
        {
            enemy.TakeDamage(damageAmount);
            Debug.Log("Bullet hit enemy!");
            GameManager.instance?.EnemyKilled();
        }

        // Destroy bullet on impact
        Destroy(gameObject);
    }
}
