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

// ! Drawing 
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

// Necessary for certain dragging code to work correctly
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

// ! Buttons Below Canvas
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

// ! Dijkstra's Algorithm
var checkedIndexes = [];
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

// ! A* Algorithm
var startIndex, endIndex;

// For usage with aStar pathfinder - Each node has cost values, etc. associated with it for heuristic reasons 
class costNode
{
    constructor(distanceFromStart, distanceFromEnd, originalIndex)
    {
        this.distanceFromStart = distanceFromStart;
        this.distanceFromEnd = distanceFromEnd;
        this.originalIndex = originalIndex;

        this.totalCost = Math.pow(this.distanceFromEnd, 2);
    }
}

function getLowestCostIndex(openNodes)
{
    let lowestCostIndex = 0;

    // Starts at 1 because 0 is assumed to be the lowest unless proven wrong 
    for (let i = 1; i < openNodes.length; i++)
    {
        if (openNodes[i].totalCost < openNodes[lowestCostIndex].totalCost)
        {
            lowestCostIndex = i;
        }
    }

    return openNodes[lowestCostIndex].originalIndex;
}

function aStarPathfinder()
{
    // Getting list of blocks 
    let gridItems = document.querySelectorAll(".gridItem");

    if (!validateGrid())
    {
        // validateGrid already offers debug output 
        return 0;
    }

    startIndex = getStartBlockIndex(gridItems);
    endIndex = getEndBlockIndex(gridItems);

    // * Assigning a cost to every thing on the grid 
    // Todo - Can be further optimized by only assigning a cost to elements when they are discovered
    let costNodes = [];
    for (let i = 0; i < gridItems.length; i++)
    {
        costNodes[i] = new costNode(getDistanceToStartFromIndex(i), getDistanceToEndFromIndex(i), i);
    }

    // * Declaring the list that holds the "currently being considered for exploration" nodes
    // Putting the start node in there so it has somewhere to start 
    let openNodes = [costNodes[startIndex]];

    // * Declaring the list that holds the "already been explored" nodes 
    // This one doesn't have anything in it just yet 
    let closedNodes = [];
    let isInClosedNodes;    

         
    // * Main control loop that continues until an end block is found, selecting one block each time
    let timerLoop = setInterval(function()
    {
        // In the case that it runs out of things to do 
        if (openNodes.length === 0)
        {
            alert("Impossible maze!");
            clearInterval(timerLoop);
            return 0;
        }

        console.log("Loop Iteration Start.");

        // * Getting the "cheapest" node 
        // Worth noting that this returns the overall index, not the index in openNodes 
        let lowestCostIndex = getLowestCostIndex(openNodes);
        console.log("Lowest Cost Index: " + lowestCostIndex);

        // Debug
        if (openNodes.indexOf(costNodes[lowestCostIndex]) === -1)
        {
            console.debug("Couldn't find current lowest cost node in the original costNodes list.");
        }

        // * Removing the "cheapest node" from openNodes and adding it to closedNodes
        // Works by finding the original node given the index then finding it in openNodes using indexOf
        closedNodes.push(costNodes[lowestCostIndex]);
        openNodes.splice(openNodes.indexOf(costNodes[lowestCostIndex]), 1);

        // * Greying in the current node 
        gridItems[lowestCostIndex].classList.toggle("gray");

        // Resetting closedNodes shutdown variable
        isInClosedNodes = false;

        // * Adding surrounding nodes to the list of open nodes if they're not already closed, checking to make sure we're not going outside the canvas in each case 
        // Left
        if (lowestCostIndex % 20 !== 0)
        {   
            //  closedNodes takes a value directly from 
            // ! This check is legit just never succeeding 
            // If it's already in the closed list, don't even consider it 
            if (closedNodes.includes(costNodes[lowestCostIndex - 1]))
            {
                console.debug("Left node is already in closedNodes. Not considering.");
                isInClosedNodes = true;
            }

            // If it's a wall, add it to closedNodes
            else if (gridItems[lowestCostIndex - 1].classList.contains("black") && !isInClosedNodes)
            {
                console.debug("Left node is a wall. Adding to closedNodes.");
                closedNodes.push(costNodes[lowestCostIndex - 1]);
            }

            else if (gridItems[lowestCostIndex - 1].classList.contains("red"))
            {
                endFound = true;
                clearInterval(timerLoop);
                return 0;
            }

            // Otherwise, it's valid, add it to open nodes 
            else if (!isInClosedNodes)
            {
                console.debug("Left node is legitimate; Adding to openNodes.");
                openNodes.push(costNodes[lowestCostIndex - 1]);
            }
        }

        // Resetting closedNodes shutdown variable
        isInClosedNodes = false;

        // Right 
        if ((lowestCostIndex + 1) % 20 !== 0)
        {      
            // If it's already in the closed list, don't even consider it 
            if (closedNodes.includes(costNodes[lowestCostIndex + 1]))
            {
                console.debug("Right node is already in closedNodes. Not considering.");
                isInClosedNodes = true;
            }

            // If it's a wall, add it to closedNodes
            else if (gridItems[lowestCostIndex + 1].classList.contains("black") && !isInClosedNodes)
            {
                console.debug("Right node is a wall. Adding to closedNodes.");
                closedNodes.push(costNodes[lowestCostIndex + 1]);
            }

            else if (gridItems[lowestCostIndex + 1].classList.contains("red"))
            {
                endFound = true;
                clearInterval(timerLoop);
                return 0;
            }

            // Otherwise, it's valid, add it to open nodes 
            else if (!isInClosedNodes)
            {
                console.debug("Right node is legitimate; Adding to openNodes.");
                openNodes.push(costNodes[lowestCostIndex + 1]);
            }
        }

        // Resetting closedNodes shutdown variable
        isInClosedNodes = false;

        // Up 
        if(!(lowestCostIndex < 20))
        {     
            // If it's already in the closed list, don't even consider it 
            if (closedNodes.includes(costNodes[lowestCostIndex - 20]))
            {
                console.debug("Up node is already in closedNodes. Not considering.");
                isInClosedNodes = true;
            }

            // If it's a wall, add it to closedNodes
            else if (gridItems[lowestCostIndex - 20].classList.contains("black") && !isInClosedNodes)
            {
                console.debug("Up node is a wall. Adding to closedNodes.");
                closedNodes.push(costNodes[lowestCostIndex - 20]);
            }

            else if (gridItems[lowestCostIndex - 20].classList.contains("red"))
            {
                endFound = true;
                clearInterval(timerLoop);
                return 0;
            }

            // Otherwise, it's valid, add it to open nodes 
            else if (!isInClosedNodes)
            {
                console.debug("Up node is legitimate; Adding to openNodes.");
                openNodes.push(costNodes[lowestCostIndex - 20]);
            }
        }

        // Resetting closedNodes shutdown variable
        isInClosedNodes = false;

        // Down 
        if (!(lowestCostIndex >= 380))
        {
            // If it's already in the closed list, don't even consider it 
            if (closedNodes.includes(costNodes[lowestCostIndex + 20]))
            {
                console.debug("Down node is already in closedNodes. Not considering.");
                isInClosedNodes = true;
            }

            // If it's a wall, add it to closedNodes
            else if (gridItems[lowestCostIndex + 20].classList.contains("black") && !isInClosedNodes)
            {
                console.debug("Down node is a wall. Adding to closedNodes.");
                closedNodes.push(costNodes[lowestCostIndex + 20]);
            }

            else if (gridItems[lowestCostIndex + 20].classList.contains("red"))
            {
                endFound = true;
                clearInterval(timerLoop);
                return 0;
            }

            // Otherwise, it's valid, add it to open nodes 
            else if (!isInClosedNodes)
            {
                console.debug("Down node is legitimate; Adding to openNodes.");
                openNodes.push(costNodes[lowestCostIndex + 20]);
            }
        }  

        console.debug("Current openNodes length: " + openNodes.length);
        console.log("Current closedNodes length: " + closedNodes.length);

        // * Making sure nothing that's in closedNodes is in openNodes
        // Todo - Remove the need for this because it's pretty inefficient 
        for (let i = 0; i < openNodes.length; i++)
        {
            if (closedNodes.includes(openNodes[i]))
            {
                openNodes.splice(i, 1);
            }
        } 

    }, 100);

}

// ! "Generic" Utility Functions 
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

// Checks to make sure grid has both a beginning and end spot 
// This could probably be far optimized, but by all means it should still work well 
function validateGrid()
{
    let gridItems = document.querySelectorAll(".gridItem");

    let blue = false, red = false;

    for (let i = 0; i < gridItems.length; i++)
    {
        if (gridItems[i].classList.contains("blue"))
        {
            blue = true;
        }

        else if (gridItems[i].classList.contains("red"))
        {
            red = true;
        }

        if (blue && red)
        {
            return true;
        }
    }

    if (blue)
    {
        alert("No end block!");
        return false;
    }

    else if (red)
    {
        alert("No start block!");
        return false;
    }

    else 
    {
        alert("No start OR end block!");
        return false;
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




