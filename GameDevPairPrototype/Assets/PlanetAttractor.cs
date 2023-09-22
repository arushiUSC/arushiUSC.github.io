using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlanetAttractor : MonoBehaviour
{
    public float attractionForce = 10000f;
    public float attractionRadius = 50f;
    public Transform planetTransform;

    private void OnTriggerEnter2D(Collider2D other)
    {
        Debug.Log("Enemy entered attraction zone");
        if (other.CompareTag("Enemy"))
        {
            // Set attractedToPlanet to true in the enemy's EnemyController script.
            EnemyController enemyController = other.GetComponent<EnemyController>();
            if (enemyController != null)
            {
                enemyController.StartAttraction(planetTransform, attractionForce);
            }
        }
    }
}
