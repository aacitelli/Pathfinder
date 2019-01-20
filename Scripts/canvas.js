console.debug("Entered JS file.");

document.addEventListener("DOMContentLoaded", function()
{
    console.debug("DOM Content is Loaded.");
    initializeGrid();
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
        }
    }
}