using UnityEngine;

public class GameOverCanvas : MonoBehaviour
{
    public Canvas canvasToEnable;

    public void EnableCanvas()
    {
        if (canvasToEnable != null)
        {
            canvasToEnable.enabled = true;
        }
    }
}
