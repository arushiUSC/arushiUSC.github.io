using UnityEngine;
using UnityEngine.UI;

public class TimerImage : MonoBehaviour
{
    public Image timerImage;
    public float maxTime = 60f;
    private float currentTime = 0f;
    private bool isGameOver = false;

    void Update()
    {
        if (!isGameOver)
        {
            currentTime += Time.deltaTime;

            // Calculate fill amount based on current time
            float fillAmount = Mathf.Clamp01(currentTime / maxTime);
            timerImage.fillAmount = 1 - fillAmount;

            if (currentTime >= maxTime)
            {
                // Game over logic
                GameOver();
            }
        }
    }

    void GameOver()
    {
        isGameOver = true;
        // Add any game over logic here
    }
}
