using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public float speed = 5f;

    void Update()
    {
        Debug.Log("IN PLayer COntroller");
        float horizontalInput = Input.GetAxis("Horizontal");
        float verticalInput = Input.GetAxis("Vertical");
        Debug.Log(horizontalInput);
        Vector3 movement = new Vector3(horizontalInput, verticalInput, 0) * speed * Time.deltaTime;
        transform.Translate(movement);
    }


}
