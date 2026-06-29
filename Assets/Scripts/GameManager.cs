using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager instance;
    
    [SerializeField] private int score = 0;
    [SerializeField] private int enemiesKilled = 0;
    private bool isPaused = false;

    void Awake()
    {
        // Singleton pattern
        if (instance == null)
        {
            instance = this;
        }
        else
        {
            Destroy(gameObject);
        }
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            TogglePause();
        }
    }

    public void AddScore(int points)
    {
        score += points;
        Debug.Log("Score: " + score);
    }

    public void EnemyKilled()
    {
        enemiesKilled++;
        AddScore(100);
        Debug.Log("Enemies Killed: " + enemiesKilled);
    }

    public int GetScore()
    {
        return score;
    }

    public int GetEnemiesKilled()
    {
        return enemiesKilled;
    }

    void TogglePause()
    {
        isPaused = !isPaused;
        Time.timeScale = isPaused ? 0f : 1f;
        Debug.Log(isPaused ? "Game Paused" : "Game Resumed");
    }
}
