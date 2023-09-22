using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    public GameObject enemyPrefab;
    public float minSpawnDelay = 1f;
    public float maxSpawnDelay = 3f;

    void Start()
    {
        StartCoroutine(SpawnEnemies());
    }

    IEnumerator SpawnEnemies()
    {
        while (true) // This will keep spawning enemies indefinitely.
        {
            yield return new WaitForSeconds(Random.Range(minSpawnDelay, maxSpawnDelay));

            // Calculate a random position within the screen boundaries.
            Vector2 spawnPosition = new Vector2(Random.Range(-8f, 8f), Random.Range(-4f, 4f));

            // Instantiate the enemy at the calculated position.
            GameObject enemy = Instantiate(enemyPrefab, spawnPosition, Quaternion.identity);
        }
    }
}
