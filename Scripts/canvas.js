/* 
    Key: 
    0 = Erasing
    1 = Wall
    2 = Blue (Start) 
    3 = Red (End)
*/
var currentMode = 0;

document.addEventListener("DOMContentLoaded", function()
{
    initializeGrid();
    initializeButtonEventListeners();
});

function initializeGrid()
{
    console.debug("Initializing 20x20 grid.");

    let canvas = document.getElementById("canvas");

    // Fills the canvas with boxes 
    // Increments rows 
    for (let i = 0; i < 20; i++)
    {
        // Increments columns 
        for (let j = 0; j < 20; j++)
        {
            let currentElement = document.createElement("div");
            currentElement.classList.toggle("gridItem");
            canvas.appendChild(currentElement);

            addGridItemEventListeners(currentElement);
        }
    }
}

function addGridItemEventListeners(element)
{
    // If it's made a blue box 
    element.addEventListener("mousedown", function()
    {
        console.debug("Element click event fired.");

        switch(currentMode)
        {
            // If the user is in erase mode 
            case 0:
            {
                console.debug("User is currently in erase mode. Setting color to white.");

                if (!element.classList.contains("white"))
                {            
                    wipeElemBackgroundColor(element);        
                    element.classList.toggle("white");
                }

                break;
            }

            // If the user is in wall mode 
            case 1:
            {
                console.debug("User is currently in wall mode. Setting color to black.");

                if (!element.classList.contains("black"))
                {
                    wipeElemBackgroundColor(element);
                    element.classList.toggle("black");
                }

                break;
            }

            // If the user is in blue box mode 
            case 2: 
            {
                console.debug("User is currently in start block mode. Setting color to blue.");

                if (!element.classList.contains("blue"))
                {
                    wipeElemBackgroundColor(element);
                    element.classList.toggle("blue");
                }

                break;
            }

            // If the user is in red box mode 
            case 3:
            {
                console.debug("User is currently in end block mode. Setting color to red.");

                if (!element.classList.contains("red"))
                {
                    wipeElemBackgroundColor(element);
                    element.classList.toggle("red");
                }

                break;
            }

            default:
            {
                console.debug("Current Mode not understood.");
                break;
            }
        }
    });

    // If it's made a red box 

    // If it's made a wall 

    // If it's erased 
}

function wipeGrid()
{
    let gridItems = document.querySelectorAll(".gridItem");

    for (let i = 0; i < gridItems.length; i++)
    {
        wipeElemBackgroundColor(gridItems[i]);
    }
}

function wipeElemBackgroundColor(element)
{
    // White
    if (element.classList.contains("white"))
    {
        element.classList.toggle("white");
    }

    // Black 
    if (element.classList.contains("black"))
    {
        element.classList.toggle("black");
    }

    // Red 
    if (element.classList.contains("red"))
    {
        element.classList.toggle("red");
    }

    // Blue 
    if (element.classList.contains("blue"))
    {
        element.classList.toggle("blue");
    }
}

function initializeButtonEventListeners()
{
    /* Button event listeners
    This just changes a global variable, the event listeners for the individual grid
    elements make their decision based on the global variable. */
    document.getElementById("blueSquareButton").addEventListener("click", function()
    {
        currentMode = 2;
    });

    document.getElementById("redSquareButton").addEventListener("click", function()
    {
        currentMode = 3;
    });

    document.getElementById("blackSquareButton").addEventListener("click", function()
    {
        currentMode = 1;
    });

    document.getElementById("eraseButton").addEventListener("click", function()
    {
        currentMode = 0;
    });

    document.getElementById("wipeButton").addEventListener("click", function()
    {
        wipeGrid();
    });

    // Physically starts pathfinding 
    document.getElementById("startButton").addEventListener("click", function()
    {
        /* Todo - Implement this later once I finish all the grid setup stuff */
    });
}

