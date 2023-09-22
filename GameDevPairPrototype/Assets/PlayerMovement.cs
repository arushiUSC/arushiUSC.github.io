using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public float speed = 20;
    public float turnSpeed;
    public float horizontalInput;
    public float verticalInput;

    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {
        horizontalInput = Input.GetAxis("Horizontal");
        verticalInput = Input.GetAxis("Vertical");

        // Modify this line to move in 2D space
        transform.Translate(Vector3.right * Time.deltaTime * speed * horizontalInput);

        // Uncomment the line below if you want rotation as well
        // transform.Rotate(Vector3.up * Time.deltaTime * turnSpeed * horizontalInput);
    }
}
