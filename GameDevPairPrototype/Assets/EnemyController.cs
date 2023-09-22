using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class EnemyController : MonoBehaviour
{
    public float initialSpeed = 3f;  // Starting speed
    public float speedIncreaseRate = 0.5f;  // Speed increase rate per second
    private float currentSpeed;

    private Transform playerShip; // Removed the public reference to the player.
    public float planetAttractionSpeed = 2f;
    private bool attractedToPlanet = false;
    private Transform planetTransform;
    private float attractionForce;
    public TextMeshProUGUI gameOverText;


    private GameManager gameManager;

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player") && !gameManager.IsGameOver())
        {
            Time.timeScale = 0f;
            gameOverText.text = "GAME OVER. You crashed into the red enemy!";
            gameManager.GameOver();
            Debug.LogError("Game Over");
        }
    }


    public void StartAttraction(Transform planet, float force)
    {
        attractedToPlanet = true;
        planetTransform = planet;
        attractionForce = force;
    }

    void Start()
    {
        gameOverText = FindObjectOfType<TextMeshProUGUI>();
        gameManager = GameObject.Find("GameManager").GetComponent<GameManager>();
        GameObject player = GameObject.FindGameObjectWithTag("Player");

        if (player != null)
        {
            playerShip = player.transform;
        }
        else
        {
            Debug.LogError("Player not found. Make sure the player GameObject has the 'Player' tag.");
        }
    }

    void Update()
    {
        if (attractedToPlanet && planetTransform != null)
        {
            // Enemy to planet.
            Vector3 direction = (planetTransform.position - transform.position).normalized;
            transform.Translate(direction * planetAttractionSpeed * Time.deltaTime);
        }
        else if (playerShip != null)
        {
            currentSpeed += speedIncreaseRate * Time.deltaTime;

            // Enemy To Player.
            Vector3 direction = (playerShip.position - transform.position).normalized;
            transform.Translate(direction * currentSpeed * Time.deltaTime);
        }
    }
}
