# Places 

This folder contains the code of the Places app for Pepper.

The Places app lets you annotate a map built by the robot with the Explore app to add remarkable places.
You can then save multiple maps for use in other applications such as Patrol app.

# Requirements

This application requires NAOqi 2.5.2+ and a Pepper robot.
In order to work, you might need Explore app from the same repo to explore an area and build a map.

# Getting started

## Installation

### Using Store

This application can be installed on your robot via https://cloud.aldebaran-robotics.com/application/exploration-manager/

### Manual Installation

Clone this repo or download the zip, open the project in Choregraphe and click on install button in the robot Application Panel.
This will deploy the whole project on your robot and start ExplorationManager service.

Note: Do *NOT* use the "run behavior" button in the top panel in Choregraphe, as it will not install and launch the ExplorationManager service.

## Starting Places

Just start the application using the trigger sentence "Pepper Places" or "Show me the places".
Alternatively, you can start it using a launcher or the robot Application panel in Choregraphe.

The robot will then guide you through the steps to load the map and add interesting points in it.

When starting, there is a drop-down meny with all the exploration files on the robot.
Select the one you want and click on "Load" (a message appears during the loading).

Once the map appears, you can add intersting points by clicking on their location in the map, which should open the keyboard. Adding the point is then done by click on "Add". 
 
"Reset" button deletes all interesting points it the current map.
"Save" button writes the current points and the map on the disk for a later use.
 
Click on "Exit" to exit the app once the map is correctly loaded and the interest points are configured. 

# Notes 

All UI displayed during the app are placeholders and are heavily improvable.
