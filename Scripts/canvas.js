/* 

    Todo: 

    Make it so you can click and drag. This worked alright when I tried it, but I encountered weird behavior with the red and blue 
        blocks and I'm taking a mental break from that and working on other aspects of the project. 

    Bug: If you click on an edge block, drag off of the canvas, then release, the block isn't updated. 

*/

/* 
    Key: 
    0 = Erasing
    1 = Wall
    2 = Blue (Start) 
    3 = Red (End)
*/
var currentDrawingMode = 0;
var currentPathfindingAlgorithm = "basic";

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
        // console.debug("Mouse Enter Event Fired.");

        if (mouseIsDown)
        {
            colorElement(element);
        }        
    });

    /* Todo - Combine above loop and this one into a function */
    element.addEventListener("click", function()
    {
        // console.debug("Click Event Fired.");

        colorElement(element);
    });
}

function colorElement(element)
{
    switch(currentDrawingMode)
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

    if (element.classList.contains("gray"))
    {
        element.classList.toggle("gray");
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
        currentDrawingMode = 2;
    });

    document.getElementById("redSquareButton").addEventListener("click", function()
    {
        currentDrawingMode = 3;
    });

    document.getElementById("blackSquareButton").addEventListener("click", function()
    {
        currentDrawingMode = 1;
    });

    document.getElementById("eraseButton").addEventListener("click", function()
    {
        currentDrawingMode = 0;
    });

    document.getElementById("wipeButton").addEventListener("click", function()
    {
        wipeGrid();
    });

    // Physically starts pathfinding 
    document.getElementById("startButton").addEventListener("click", function()
    {
        switch(currentPathfindingAlgorithm)
        {
            case "basic":
            {
                intuitivePathfinder();
            }
        }
    });
}

/* This code keeps track of whether the mouse is pressed or not - 
    Necessary for dragging behavior to work correctly w/ the blue and red blocks */

var mouseIsDown = false;
document.onmousedown = function()
{
    mouseIsDown = true;
    // console.debug("Mouse is currently down.");
};

document.onmouseup = function()
{
    mouseIsDown = false;
    // console.debug("Mouse is currently up.");
};

// Tracks which blocks have been checked so that every iteration of the recursive function
// doesn't recheck blocks and clog up an absolutely massive amount of resources
var checkedIndexes = [];

// Represents a "hard stop" to the recursion because it's at the start of every one 
var endBlockFound = false;

function intuitivePathfinder()
{
    // Resetting variables
    endBlockFound = false;
    checkedIndexes = [];

    /* Algorithm Pseudocode:

        1. Start at the start block.
        2. Explore in each direction in the four cardinal directions (no diagonals).
            Note: This process is blocked by a wall. 
        3. Continue this process for each block, repeating ad nauseum
        4. If the end block is found, then all pathfinding stops. 
        5. If no end block is ever found, the maze is "impossible". 
    */

    // Getting every grid element
    // Note - These are returned in document order 
    let gridItems = document.querySelectorAll(".gridItem");

    // Starts with a debug value so if the user doesn't put a start block, it's diagnosable
    let startBlockIndex = getStartBlockIndex(gridItems);

    if (startBlockIndex === -1)
    {
        alert("No start block detected.");
        return 0;
    }

    let endBlockIndex = getEndBlockIndex(gridItems);

    if (endBlockIndex === -1)
    {
        alert("No end block detected.");
        return 0;
    }

    /* Starts the actual pathfinding process */  
    checkSurroundings(gridItems, startBlockIndex); 
}

function checkSurroundings(gridItems, currIndex)
{
    console.debug("Current Index: " + currIndex);

    // This might not even be necessary but it's sorta here for safety 
    if (endBlockFound)
    {
        console.log("End block has been found. Ceasing operations.");
        return 0;
    }

    // If this block was already checked, nip it off at the bud to save computation time 
    // This could technically be checked before it's even called, but the performance
    //      difference is negligible and this is seemingly easier for me to implement 
    if (checkedIndexes.includes(currIndex))
    {        
        console.log("Current block has already been checked.");
        return 0;
    }

    console.debug("Index " + currIndex + " is non-checked.");

    // Making this a checked index and shading it in to signify so 
    checkedIndexes.push(currIndex);
    gridItems[currIndex].classList.toggle("gray");

    // * Checking for the goal 

    // ! Todo - Make it alternate directions so it doesn't always just check left 
    // Making sure it's not in the left column 
    // CHecking to make sure it's not the first element in the row 
    if (currIndex % 20 !== 0)
    {
        // This check has to be nested, otherwise an out of bounds error will occur 
        if (gridItems[currIndex - 1].classList.contains("red"))
        {            
            console.debug("End block has been found.");
            endBlockFound = true;
            return 0;
        }
    }

    // Making sure it's not in the right column 
    if ((currIndex + 1) % 20 !== 0)
    {        
        // Checking right 
        if (gridItems[currIndex + 1].classList.contains("red"))
        {
            console.debug("End block has been found.");
            endBlockFound = true;
            return 0;
        }
    }

    // Making sure it's not in the top row 
    if(!(currIndex < 20))
    {        
        // Checking up 
        if (gridItems[currIndex - 20].classList.contains("red"))
        {
            console.debug("End block has been found.");
            endBlockFound = true;
            return 0;
        }
    }

    // Making sure it's not in the last row 
    if (!(currIndex >= 380))
    {
        // Checking down 
        if (gridItems[currIndex + 20].classList.contains("red"))
        {
            console.debug("End block has been found.");
            endBlockFound = true;
            return 0;
        }
    }

    // * Checking if surrounding blocks are valid, and if so, running this function again recursively

    // Checking Left - Similar logic to above
    if (currIndex % 20 !== 0)
    {
        if (gridItems[currIndex - 1].classList.contains("black"))
        {
            console.debug("Left block is a wall.");
            checkedIndexes.push(currIndex - 1);
        }

        else 
        {
            console.debug("Checking left block.");
            setTimeout(checkSurroundings, 100, gridItems, currIndex - 1);
        }
    }

    else 
    {
        console.debug("Left block is in the leftmost column.");
    }

    // Checking Right  - Similar logic to above
    // Making sure it's not in the right column 
    if ((currIndex + 1) % 20 !== 0)
    {        
        // Checking right 
        if (gridItems[currIndex + 1].classList.contains("black"))
        {
            console.debug("Right block is a wall.");
            checkedIndexes.push(currIndex + 1);
        }

        else 
        {
            console.debug("Checking right block.");
            setTimeout(checkSurroundings, 100, gridItems, currIndex + 1);
        }
    }

    else 
    {
        console.debug("Right block is in the rightmost column.");
    }

    // Checking Up - Similar logic to above
    if(!(currIndex < 20))
    {        
        // Checking up 
        if (gridItems[currIndex - 20].classList.contains("black"))
        {
            console.debug("Upper block is a wall.");
            checkedIndexes.push(currIndex - 20);
        }

        else 
        {
            console.debug("Checking upper block.");
            setTimeout(checkSurroundings, 100, gridItems, currIndex - 20);
        }
    }

    else 
    {
        console.debug("Upward block is in the top row.");
    }

    // Checking Down  - Similar logic to above
    if (!(currIndex >= 380))
    {
        // Checking down 
        if (gridItems[currIndex + 20].classList.contains("black"))
        {
            console.debug("Downward block is a wall.");
            checkedIndexes.push(currIndex + 20);
        }

        else 
        {
            console.debug("Checking downward block.");
            setTimeout(checkSurroundings, 100, gridItems, currIndex + 20);
        }
    }

    else 
    {
        console.debug("Downward block is in the bottom row.");
    }
}

// Returns an index (if a begin block is found) or -1 if none is found 
function getStartBlockIndex(gridItems)
{
    for (let i = 0; i < gridItems.length; i++)
    {
        if (gridItems[i].classList.contains("blue"))
        {
            console.debug("Found start block at index " + i);
            return i;
        }
    }

    console.debug("Did not find start block.");
    return -1;
}

// Returns an index (if an end block is found) or -1 if none is found 
function getEndBlockIndex(gridItems)
{
    for (let i = 0; i < gridItems.length; i++)
    {
        if (gridItems[i].classList.contains("red"))
        {
            console.debug("Found end block at index " + i);
            return i;
        }
    }

    console.debug("Did not find end block.");
    return -1;
}




