# Patrol

This folder contains the code of the Patrol app for Pepper.
This application can be installed on your robot via https://cloud.aldebaran-robotics.com/application/patrol-c8782b/

The patrol app allows your robot to patrol in your appartment betweend several waypoints that you can define.

# Requirements

This application requires NAOqi 2.5.2+ and a Pepper robot.
In order to work, this application must be used along with Places app in naoqi_navigation_samples repo to load a map.
You might also need Explore app from the same repo to explore an area.

# Getting started

Just start the application with a launcher or using the trigger sentence "Pepper Patrol" or "Show me the patrol panel".
The robot will then guide you through the steps to setup the patrol.

When starting, if no map is loaded, Patrol start Places app to load and annotate a map, otherwise, the patrol panel is displayed.

The page is by default in relocalization mode. In this mode, when the user clicks on the map at the expected robot pose, the robot asks the user to move away so that he can try to relocalize precisely by doing a full turn.

After this operation, the localized robot pose with orientation is displayed. If the pose is not correct, you should reselect the radio button "Relocalize" to retry the localization process.

Once the robot is localized, you should go (if not already) into "Configure Patrol" mode.
In this mode, each click on the map adds a new Patrol point one after the other.
You can also use the vocal labels that you annotated the map with.
When adding a new waypoint, its index is displayed on the map.
The "Reset" button allows you to delete all the waypoints of the map.
The Patrol button starts the patrol (You can also say "Patrol"). The robot will then go to each waypoint successively.
The "Infinite Patrol" checkbox will specify if the robot should stop after the patrol defined.

# Notes 

All UI displayed during the app are placeholders and are heavily improvable.
