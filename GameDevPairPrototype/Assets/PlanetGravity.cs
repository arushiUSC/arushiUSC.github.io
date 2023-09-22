using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlanetGravity : MonoBehaviour
{
    public float attractionForce = 100f;
    public float attractionRadius = 50f;
    public EnemyMovement followScript;
    //public EnemyMovement1 followScript1;
    //public EnemyMovement2 followScript2;

    private void FixedUpdate()
    {
        Collider2D[] attractableObjects = Physics2D.OverlapCircleAll(transform.position, attractionRadius);

        foreach (Collider2D obj in attractableObjects)
        {
            if (obj.CompareTag("Attractable"))
            {
                Rigidbody2D rb = obj.GetComponent<Rigidbody2D>();
                if (rb != null)
                {
                    Vector2 direction = transform.position - obj.transform.position;
                    rb.AddForce(direction.normalized * attractionForce);

                    if (followScript != null)
                    {
                        followScript.SetShouldFollow(false); // Set shouldFollow to false
                    }

                    //if (followScript1 != null)
                    //{
                    //    followScript1.SetShouldFollow(false); // Set shouldFollow to false
                    //}

                    //if (followScript2 != null)
                    //{
                    //    followScript2.SetShouldFollow(false); // Set shouldFollow to false
                    //}
                }
            }
        }
    }

    void OnDrawGizmos()
    {
        // Draw the gravity field radius in the Scene view
        Gizmos.color = Color.blue;
        Gizmos.DrawWireSphere(transform.position, attractionRadius);
    }
}
