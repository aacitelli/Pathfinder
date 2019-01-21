/* 

    Todo: 

    Bugs:

        Bug-free AFAIK. 

    Features: 

        Implement more algorithms other than just Dijkstra's 

*/

/* 
    Key: 
    0 = Erasing
    1 = Wall
    2 = Blue (Start) 
    3 = Red (End)
*/
var currentDrawingMode = 0;
var currentPathfindingAlgorithm;



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
    
    "mousedown" Event:

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

    element.addEventListener("mousedown", function()
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
        currentPathfindingAlgorithm = document.getElementById("algorithmSelection").value;

        switch(currentPathfindingAlgorithm)
        {
            case "basic":
            {
                dijkstraPathfinder();
                break;
            }

            case "aStar":
            {
                aStarPathfinder();
                break;
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

function dijkstraPathfinder()
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
    startBlockIndex = getStartBlockIndex(gridItems);

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

var startIndex, endIndex;

// For usage with aStar pathfinder - Each node has cost values, etc. associated with it for heuristic reasons 
class aStarNode
{
    aStarNode(distanceFromStart, distanceFromEnd)
    {
        this.distanceFromStart = distanceFromStart;
        this.distanceFromEnd = distanceFromEnd;

        this.totalCost = distanceFromStart + distanceFromEnd;
    }
}

function aStarPathfinder()
{
    // Getting list of blocks 
    let gridItems = document.querySelectorAll(".gridItem");

    // Checking to make sure it's a valid grid
    startIndex = getStartBlockIndex(gridItems);
    endIndex = getEndBlockIndex(gridItems);

    if (startIndex === -1)
    {
        alert("No start block!");
        return 0;
    }

    else if (endIndex === -1)
    {
        alert("No end block!");
        return 0;
    }

    let endBlockFound = false;

    let nodesList = [];

    // * Constructing a list of nodes beforehand and figuring out their distance beforehand 
    // * Basically just holds more data than just the index would 
    for (let i = 0; i < 400; i++)
    {
        nodesList.push(new aStarNode(getDistanceToStartFromIndex(i), getDistanceToEndFromIndex(i)));
    }

    let openNodes = [new aStarNode(0, getDistanceToEndFromIndex(startIndex))];
    let closedNodes = [];

    // Iterates through each block one by one 
    while (!endBlockFound)
    {
        // Setting equal to what's basically a placeholder value that will likely get overwritten 
        let currentLowestCostIndex = nodesList.indexOf(openNodes[0], 1);

        // * Determining which one in openlist has the lowest cost 
        for (let i = 0; i < nodesList.length; i++)
        {
            // ! nodesList[i] is apparently undefined here :^P 
            if (openNodes.includes(nodesList[i]) && nodesList[i].totalCost < nodesList[currentLowestCostIndex].totalCost)
            {
                currentLowestCostIndex = i;
            }
        }

        // * Making sure no repeats that are already in the closedList sneak in, and closing this one if it isn't already closed 
        if (closedNodes.includes(nodesList[currentLowestCostIndex]))
        {
            continue;
        }

        else 
        {
            // This could also probably go at the end of the algorithm but here seems more organized 
            closedNodes.push(nodesList[currentLowestCostIndex]);
        }

        console.debug("Current lowest index value: " + currentLowestCostIndex);

        // * Adding the ones around the current node if they're valid to the openNodes queue 
        // Making sure the leftmost one is valid 
        if (currentLowestCostIndex % 20 !== 0)
        {
            // If it's not a wall, add it to the open list
            if (!nodesList[currentLowestCostIndex - 1].classList.includes("black"))
            {
                openNodes.push(nodesList[currentLowestCostIndex - 1]);
            }

            // Otherwise, add it to the closed list 
            else 
            {
                closedNodes.push(nodesList[currentLowestCostIndex - 1]);
            }
        }

        // Making sure the rightmost one is valid
        if ((currentLowestCostIndex + 1) % 20 !== 0)
        {      
            // If it's not a wall, add it to the open list
            if (!nodesList[currentLowestCostIndex + 1].classList.includes("black"))
            {
                openNodes.push(nodesList[currentLowestCostIndex + 1]);
            }

            // Otherwise, add it to the closed list 
            else 
            {
                closedNodes.push(nodesList[currentLowestCostIndex + 1]);
            }
        }

        // Making sure the uppermost one is valid 
        if(!(currentLowestCostIndex < 20))
        {       
            // If it's not a wall, add it to the open list
            if (!nodesList[currentLowestCostIndex - 20].classList.includes("black"))
            {
                openNodes.push(nodesList[currentLowestCostIndex - 20]);
            }

            // Otherwise, add it to the closed list 
            else 
            {
                closedNodes.push(nodesList[currentLowestCostIndex - 20]);
            }
        }

        // Making sure the downmost one is valid 
        if (!(currentLowestCostIndex >= 380))
        {
            // If it's not a wall, add it to the open list
            if (!nodesList[currentLowestCostIndex + 20].classList.includes("black"))
            {
                openNodes.push(nodesList[currentLowestCostIndex + 20]);
            }

            // Otherwise, add it to the closed list 
            else 
            {
                closedNodes.push(nodesList[currentLowestCostIndex + 20]);
            }
        }
    }
}

function getDistanceToStartFromIndex(index)
{
    // Note - These are indexed by one, hence the occasional +1's 
    let startIndexRow = (startIndex / 20) + 1;
    let startIndexColumn = (startIndex % 20) + 1;

    let passedIndexRow = (index / 20) + 1;
    let passedIndexColumn = (index % 20) + 1;

    return Math.sqrt(Math.pow(startIndexRow - passedIndexRow, 2) + Math.pow(startIndexColumn - passedIndexColumn, 2));
}

function getDistanceToEndFromIndex(index)
{
    // Note - These are indexed by one, hence the occasional +1's 
    let endIndexRow = (endIndex / 20) + 1;
    let endIndexColumn = (endIndex % 20) + 1;

    let passedIndexRow = (index / 20) + 1;
    let passedIndexColumn = (index % 20) + 1;

    return Math.sqrt(Math.pow(endIndexRow - passedIndexRow, 2) + Math.pow(endIndexColumn - passedIndexColumn, 2));
}

var startBlockIndex; 

function checkSurroundings(gridItems, currIndex)
{
    // This might not even be necessary but it's sorta here for safety 
    if (endBlockFound)
    {
        return 0;
    }

    // If this block was already checked, nip it off at the bud to save computation time 
    // This could technically be checked before it's even called, but the performance
    //      difference is negligible and this is seemingly easier for me to implement 
    if (checkedIndexes.includes(currIndex))
    {        
        return 0;
    }


    // Making this a checked index and shading it in to signify so 
    checkedIndexes.push(currIndex);

    if (currIndex !== startBlockIndex)
    {        
        gridItems[currIndex].classList.toggle("gray");
    }

    // * Checking for the goal 

    // ! Todo - Make it alternate directions so it doesn't always just check left 
    // Making sure it's not in the left column 
    // CHecking to make sure it's not the first element in the row 
    if (currIndex % 20 !== 0)
    {
        // This check has to be nested, otherwise an out of bounds error will occur 
        if (gridItems[currIndex - 1].classList.contains("red"))
        {            
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
            checkedIndexes.push(currIndex - 1);
        }

        else 
        {
            setTimeout(checkSurroundings, 100, gridItems, currIndex - 1);
        }
    }

    // Checking Right  - Similar logic to above
    // Making sure it's not in the right column 
    if ((currIndex + 1) % 20 !== 0)
    {        
        // Checking right 
        if (gridItems[currIndex + 1].classList.contains("black"))
        {
            checkedIndexes.push(currIndex + 1);
        }

        else 
        {
            setTimeout(checkSurroundings, 100, gridItems, currIndex + 1);
        }
    }

    // Checking Up - Similar logic to above
    if(!(currIndex < 20))
    {        
        // Checking up 
        if (gridItems[currIndex - 20].classList.contains("black"))
        {
            checkedIndexes.push(currIndex - 20);
        }

        else 
        {
            setTimeout(checkSurroundings, 100, gridItems, currIndex - 20);
        }
    }

    // Checking Down  - Similar logic to above
    if (!(currIndex >= 380))
    {
        // Checking down 
        if (gridItems[currIndex + 20].classList.contains("black"))
        {
            checkedIndexes.push(currIndex + 20);
        }

        else 
        {
            setTimeout(checkSurroundings, 100, gridItems, currIndex + 20);
        }
    }
}

// Returns an index (if a begin block is found) or -1 if none is found 
function getStartBlockIndex(gridItems)
{
    for (let i = 0; i < gridItems.length; i++)
    {
        if (gridItems[i].classList.contains("blue"))
        {
            return i;
        }
    }

    return -1;
}

// Returns an index (if an end block is found) or -1 if none is found 
function getEndBlockIndex(gridItems)
{
    for (let i = 0; i < gridItems.length; i++)
    {
        if (gridItems[i].classList.contains("red"))
        {
            return i;
        }
    }

    return -1;
}




