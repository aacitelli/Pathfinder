/* 

    Todo: 

    Make it so you can click and drag. This worked alright when I tried it, but I encountered weird behavior with the red and blue 
        blocks and I'm taking a mental break from that and working on other aspects of the project. 

*/

/* 
    Key: 
    0 = Erasing
    1 = Wall
    2 = Blue (Start) 
    3 = Red (End)
*/
var currentMode = 0;

// These are global b/c otherwise I'd need to loop through every one every time
// Necessary to check and make sure only one of these exists at once 
var numBlue = 0, numRed = 0;

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

/* Pressing Logic: 

    "mouseenter" Event:

        If mouse is pressed, fire coloring event for the current square. 
    
    "click" Event:

        Accounts for edge case with mouseenter where it won't do it for the current square 

*/
function addGridItemEventListeners(element)
{
    // If it's made a blue box 
    element.addEventListener("mouseenter", function()
    {
        console.debug("Mouse Enter Event Fired.");

        if (mouseIsDown)
        {
            colorElement(element);
        }        
    });

    /* Todo - Combine above loop and this one into a function */
    element.addEventListener("click", function()
    {
        console.debug("Click Event Fired.");

        colorElement(element);
    });
}

function colorElement(element)
{
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
                if (numBlue === 1)
                {
                    removeItemsWithClass("blue");
                }

                wipeElemBackgroundColor(element);
                element.classList.toggle("blue");
                numBlue++;
            }

            break;
        }

        // If the user is in red box mode 
        case 3:
        {
            console.debug("User is currently in end block mode. Setting color to red.");

            if (!element.classList.contains("red"))
            {
                // If one already exists, remove it 
                if (numRed === 1)
                {
                    removeItemsWithClass("red");
                }

                wipeElemBackgroundColor(element);
                element.classList.toggle("red");
                numRed++;
            }

            break;
        }

        default:
        {
            console.debug("Current Mode not understood.");
            break;
        }
    }
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
        numRed--;
    }

    // Blue 
    if (element.classList.contains("blue"))
    {
        element.classList.toggle("blue");
        numBlue--;
    }
}

function removeItemsWithClass(className)
{
    let gridItems = document.querySelectorAll(".gridItem");

    for (let i = 0; i < gridItems.length; i++)
    {
        if (gridItems[i].classList.contains(className))
        {
            wipeElemBackgroundColor(gridItems[i]);
        }
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

/* Pressing Logic: 

    "mouseenter" Event:

        If mouse is pressed, fire coloring event for the current square. 
    
    "click" Event:

        Accounts for edge case with mouseenter where it won't do it for the current square 

*/

var mouseIsDown = false;

document.addEventListener("mousedown", function()
{
    mouseIsDown = true;
});

document.addEventListener("mouseup", function()
{
    mouseIsDown = false;
});




