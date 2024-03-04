# Bullet Hell Pattern Generator (IGME 430 Project 1) Documentation

## What is the intended purpose of your documentation?

The intended purpose of my application is to be able to create patterns commonly found in bullet hell games (like the [Touhou Project](https://en.wikipedia.org/wiki/Touhou_Project) series). In a more general sense, the program can make geometric patterns composing of colored circles.

## What data will be stored and delivered by the API?

The data being stored and delivered by the API would be the specific JSON data that represents different bullet patterns. Users would be able to create patterns with the front end, and be able to store that data by giving it a name. They can then retrieve past patterns by entering the name. By using canvas, the JSON data that represents a bullet is interpreted and displayed on the web page.

## What went right in the development of this project?

In general, the development of this project went smoothly. Implementing the Blockly API was simplier than I imagined, so after I had the logic and implementation for one block, creating more was extremely simple. Designing and implementating the server and the different data endpoints went quickly as well, due to the fact that I have a fair bit of experience doing so because of the content of IGME 430.

## What went wrong in the development of this project?

There was rarely anything that went flat-out wrong. Most things I was confused about had simple solutions that took debugging or research to fix. One problem that was constant was the usage of the JavaScript's ```eval()``` function. The current code uses the ```eval()``` function to run the code generated through Blockly (which becomes a ```String```). Using the function is a security risk to fully deployed applications, since it gives the user an opportunity to run malicious code in a program. It also violated ESLint's "no-eval" rule, which caused an error in that regard as well. After careful consideration, I decided to keep my current implementation of ```eval()``` due to it's simplicity, but also because of the scope of the project. The code that runs through the function would only be code generated through the Blockly workspace, which uses developer defined and implemented function, which lowers the security risk immensely.

A minor problem that I ran into while working on the project was how open-ended creating chains and statements in Blockly was. The intended functionality is that any and all blocks can be chained inside the Composite block and none others. For example, trying to put two Bullet Blocks inside of a Line Block would not evaluate, the two Bullet Blocks would need to be wrapped in a Composite Block. However, creating these restrictions with Blockly was not something that I was able to figure out in time.

## What did you learn while developing this project?

Something I learned while developing this project was how much communication must occur between front and back end components. While not extremely in-depth, the front-end application is all about giving the user the tools to create specific data, which is then interpreted and rendered to the screen. That formatted data can then be saved in a server and retrieved later, which can still be interpreted. The amount of moving parts in a project like this made it interesting to manage, and in general an enjoyable time.

## If you were to continue, what would you do to improve this application?

The main thre things that I would do would be to iterate on the aesthetic interface of the front-end. My intention was to immitate the user interface of [Touhou Project](https://i.ytimg.com/vi/dcmZNvDuEns/maxresdefault.jpg), with the gameplay and bullets on the left with information on the right. I would probably expand on this idea, and try to curate the experience more in that regard. My second improvement would be to find a better implementation than just using the ```eval()``` function for running Blockly generated code. My third improvement would be to find a way to add specific restrictions, like I outlined in a prior section, so that it would be impossible to create statements that can not be interpreted.

## If you went above and beyond, how did you do so?

I utilized the [Blockly](https://developers.google.com/blockly) API to create a simple block coding interface in which users can compose custom defined blocks to create different patterns. There are tooltips that show up when hovering over them explaining the function of the block, and what the attributes mean. Because of how bullet generation was set up, this was the main elegant way I thought this system could be expressed in a visual way.

## If you used any borrowed code or code fragments, where did you get them from? What do the code fragments do? Where are they in your code?

At the top of my ```main.js``` file, I have a helper function called ```replaceAt(string, index, replace)``` that I repurposed from a [StackOverflow thread](https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-specific-index-in-javascript). The function takes a string, index, and replacement character and adds the replacement character at the index of the string.

The starting point of this project was originally a group project for IGME 480. The algebraic logic functions were originally in Typescript, which I changed to Javascript for easier use with Node. The group was composed of IGME students Eli Cheramie, Stephen Adegun, and myself. The code for the bullet type functions were originally written by me and and Eli Cheramie, while the canvas code were written in collaboration of all three of us.

## Endpoints

### /getPatterns
<ul>
<li>Supported Methods: GET, HEAD</li>
<li>Query Params: N/A</li>
<li>Description: Gets the patterns object on the server</li>
<li>Return Type: JSON</li>
</ul>

### /addPattern
<ul>
<li>Supported Methods: POST</li>
<li>Query Params: N/A</li>
<li>Description: Adds a pattern to the object on the server</li>
<li>Return Type: Meta</li>
</ul>