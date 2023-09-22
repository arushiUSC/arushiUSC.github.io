using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    public Transform target; // The player's Transform component.
    public Vector3 offset;  // Offset of the camera from the player.

    void LateUpdate()
    {
        if (target != null)
        {
            // Set the camera's position to the player's position plus the offset.
            transform.position = target.position + offset;
        }
    }
}
