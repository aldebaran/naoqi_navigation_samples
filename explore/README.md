# Explore 

This folder contains the code of the Explore app for Pepper.
This application can be installed on your robot via https://cloud.aldebaran-robotics.com/application/explore-c8782b/

The Explore app makes the robot explore autonomously his environment within a 10m range.

# Requirements

This application requires NAOqi 2.5.2+ and a Pepper robot.
In order to work, you might need Explore app from the same repo to explore an area and build a map.

# Getting started

Just start the application with a launcher or using the trigger sentence "Explore".
The robot will then start an autonomous exploration within 10m range. Please step away from the robot while he builds the map.

Once he finished, the robot will go back to his starting point and display the map on the tablet.

The exploration is also saved for a later use in Places or Patrol app.

The app will exit after a few minutes of showing the map.

# Notes 

All UI displayed during the app are placeholders and are heavily improvable.
