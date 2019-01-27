# Pathfinder

This is a grid-based visualization of both the Dijkstra and Greedy pathfinding algorithms. The user can place the start point, end point, and walls. They can then choose the algorithm they'd like to simulate and then watch it happen. 

## Implementation Overview

The algorithms used differ fundamentally. Dijkstra's algorithm doesn't utilize any sort of heuristics (what makes an algorithm "smart"), so it was possible to implement recursively. The "Greedy" algorithm is semi-smart, so operated by selecting the best node individually every time. 

Each algorithm operates on a timer, where each algorithm "step" occurs after a predefined interval (100 milliseconds, I believe). This feature allows the algorithm's selection process to be much more transparent, as it isn't just instant. 

## Algorithms Overview

Dijkstra's algorithm works by recursively exploring every node's neighbors, then their neighbors, and so on, without any prioritization. 

The "Greedy" algorithm always explores the node that's closest to the endpoint. This often results in a "circular" sort of pattern. This has the advantage of being much smarter than Dijkstra's algorithm, and is much faster when there are few obstacles. 

## What I Learned

### Major Learning Points

#### Algorithm Implementation

Being able to look up an algorithm and make it work from scratch with your code is a skill I think is very valuable. This project got me some great experience with that.

#### CSS-JavaScript Interaction

I tracked the grid elements' colors using CSS classes rather than JavaScript variables. Rather than apply a lot of stying in JavaScript, all I really had to do was toggle CSS classes, which was a much, much cleaner and more readable practice. I plan to do this similarly in the future, because I really can't emphasize how much easier it was to go back and make modifications in the future. 

#### Methodization

With this project, I placed a huge focus on methodizing a lot of the code rather than having longer methods. I've been doing it for a while, but placed a larger focus on it with this project due to some of the complexity of the algorithms. Methodizing, again, helps with clarity and readability and makes it immeasurably easier to go back and make changes, especially if it's a repeated function (which is really the biggest case where functions are practical). 

### Minor Learning Points

#### HTML DOM Editing

At this point, I do this with basically every project, but I still pick up small new things that it can be used for. I basically take it as a given at this point, because it's used in 99% of JavaScript; It's really just the main method of page output. I feel like this project really helped reaffirm that I have a good handle on various selection methods and how JavaScript really interacts with the page as a whole in order to produce intended output that the user can see. 
