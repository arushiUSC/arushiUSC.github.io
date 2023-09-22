using UnityEngine;

public class EnemyMovement : MonoBehaviour
{
    public GameObject player;
    private Vector3 offset = new Vector3(-8, 0, 0);

    public float followSpeed = 5f; // Adjust this to control follow speed

    private bool shouldFollow = true; // New variable to control following

    void LateUpdate()
    {
        if (shouldFollow && player != null)
        {
            // Calculate the desired position for the enemy
            Vector3 desiredPosition = player.transform.position + offset;

            // Move the enemy towards the desired position with speed
            transform.position = Vector3.Lerp(transform.position, desiredPosition, followSpeed * Time.deltaTime);
        }
    }

    public void SetShouldFollow(bool shouldFollow)
    {
        this.shouldFollow = shouldFollow;
    }
}
