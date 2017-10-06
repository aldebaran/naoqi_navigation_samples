######
import sys

import qi

import threading
import time

import math
import almath as m

import pygame
from pygame import locals

import numpy as np

screenColor = (255,255,255)
robotColor = (255, 200, 0)
targetColor = (255,0,0)
black = (100, 0, 100)

# OccupancyMap is a class to manage transitions between position in map
# and pixels.Kexplorer
class OccupancyMap:
  def __init__(self, size, mpp, originOffest):
    self.size = size
    self.mpp = mpp
    # Metric coordinates of the (0, 0) pixel.
    self.originOffset = m.Position2D(0, 0)
    self.originOffset.x = originOffest.x
    self.originOffset.y = originOffest.y
    self.minMetersPerPixel = 0.0001

  def getPosition2DFromPixel(self, pixel):
    return m.Position2D(pixel.x * self.mpp + self.originOffset.x, -pixel.y * self.mpp + self.originOffset.y)

  def getPixelFromPosition2D(self, position):
    return m.Position2D((position.x - self.originOffset.x) / self.mpp, (self.originOffset.y - position.y) / self.mpp)

  def scroll(self, toScroll):
      self.originOffset = self.originOffset + toScroll

  def getDeltaPositionFromDeltaPixel(self, pixel):
    return m.Position2D(-pixel.y * self.mpp, -pixel.x * self.mpp)

  # Increase metersPerPixel to zoom out and increaseit to zoom in.
  def zoom(self, deltaMetersPerPixel):
    previousMpp = self.mpp
    self.mpp = max([self.mpp + deltaMetersPerPixel, self.minMetersPerPixel])
    effectiveDelta = self.mpp - previousMpp

# ExplorationGUI starts pyGame, gets Navigation map and robot position then
# display it. The user can right click on the pygame window to send new
# target for NavigateToinMap().
class ExplorationGUI(threading.Thread) :
  def __init__(self, ip) :
    self.IP = ip
    self.running = True
    self.occupancyMap = OccupancyMap(700, 0.01, m.Position2D(0, 0))
    self.robotPose = m.Pose2D(0,0,0)
    self.robotRadius = 0.3 # meters
    self.nodeNumber = 0
    self.map = []
    self.path  = []
    self.localizationResult = []
    self.downSelectedPositionWorld = m.Position2D()
    self.currentTargetRobotPose2D = m.Pose2D(200, 200, 0)
    self.downScrollPosition = m.Position2D()
    self.lastUpdateScrollPosition = m.Position2D(10000000, 10000000)

    #init
    self.connectionToRobot()
    self.initPygame()

  def connectionToRobot(self):
    try:
      self.session = qi.Session()
      port = 9559
      self.session.connect("tcp://" + self.IP + ":" + str(port))
      self.navigation = self.session.service("ALNavigation")
    except Exception,errorMsg:
      print "Error when creating proxy:"
      print str(errorMsg)
      self.running = False

  def initPygame(self):
    pygame.init()
    self.screen = pygame.display.set_mode((int(self.occupancyMap.size), int(self.occupancyMap.size)))
    self.screen.fill(screenColor)
    self.font1 = pygame.font.SysFont("Courier New",14, True)
    pygame.display.set_caption('Exploration')

    try:
      self.run()
    except KeyboardInterrupt:
      self.exit()

  def exit(self):
    pass

  def center(self):
    center = m.Position2D(self.occupancyMap.size / 2, self.occupancyMap.size / 2)
    self.occupancyMap.scroll(m.position2DFromPose2D(self.robotPose) - self.occupancyMap.getPosition2DFromPixel(center))

  def getKeyboard(self, e):
    if e.type == pygame.KEYDOWN:
      if (e.key == pygame.K_PLUS) | (e.key == pygame.K_KP_PLUS) | e.key == pygame.K_UP:
         self.occupancyMap.zoom(-0.001)
         self.center()
      elif (e.key == pygame.K_MINUS) | (e.key == pygame.K_KP_MINUS)| e.key == pygame.K_DOWN:
          self.occupancyMap.zoom(0.001)
          self.center()
      elif e.key == pygame.K_c:
        self.center()

  # Send targets to robot with right click.
  def getRightClickPositionInMap(self, e):
    RIGHTBUTTON = 3
    sendCommand = False
    # Find the new position2D of the robot.
    if e.type == pygame.MOUSEBUTTONDOWN and e.button == RIGHTBUTTON:
      self.downSelectedPositionWorld = self.occupancyMap.getPosition2DFromPixel(m.Position2D(e.pos[0], e.pos[1]))
      if self.downSelectedPositionWorld.distance(m.position2DFromPose2D(self.currentTargetRobotPose2D)) > 0.1:
        self.currentTargetRobotPose2D = m.pose2DFromPosition2D(self.downSelectedPositionWorld)
        sendCommand = True
    return sendCommand

  def drawRobot(self, robotPose):
    # Draw robot triangle
    L = self.robotRadius
    points = []
    frontLeft = self.occupancyMap.getPixelFromPosition2D(m.position2DFromPose2D(robotPose * m.Pose2D(0.155, 0.1762, 0.0)))
    frontRight = self.occupancyMap.getPixelFromPosition2D(m.position2DFromPose2D(robotPose * m.Pose2D(0.155, -0.1762, 0.0)))
    back = self.occupancyMap.getPixelFromPosition2D(m.position2DFromPose2D(robotPose * m.Pose2D(-0.20, 0.0, 0.0)))
    points.append(frontLeft.toVector())
    points.append(frontRight.toVector())
    points.append(back.toVector())
    pygame.draw.lines(self.screen, black, True, points, 8)
    pygame.draw.lines(self.screen, robotColor, True, points, 2)

    # Front point
    frontPoint = self.occupancyMap.getPixelFromPosition2D(m.position2DFromPose2D(robotPose * m.Pose2D(0.1, 0.0, 0.0))).toVector()
    frontPointInts = [int(frontPoint[0]), int(frontPoint[1])]
    pygame.draw.circle(self.screen, black, frontPointInts, 10)
    pygame.draw.circle(self.screen, robotColor, frontPointInts, 8)

    # Black center dot
    robot = self.occupancyMap.getPixelFromPosition2D(m.position2DFromPose2D(robotPose)).toVector()
    robotInts = [int(robot[0]), int(robot[1])]
    pygame.draw.circle(self.screen, (0, 0,0), robotInts, 2)
    obstacleList = []
    # Target.
    target = self.occupancyMap.getPixelFromPosition2D(m.position2DFromPose2D(self.currentTargetRobotPose2D))
    pygame.draw.circle(self.screen, targetColor, [int(target.x), int(target.y)], 10)

  def drawMap(self):
    if len(self.metricalMap) != 5:
      return
    mpp = self.metricalMap[0]
    size = self.metricalMap[1]
    originOffset = m.Position2D(self.metricalMap[3])
    data = self.metricalMap[4]
    # Show the metrical self.metricalMap.
    img = np.array(data, np.uint8).reshape(size, size, 1)
    img = (100 - img) * 2.5
    exploMap = OccupancyMap(size, mpp, originOffset)
    for i in range(0, size):
      for j in range(0, size):
        pix = img[i][j][0]
        if pix < 200.0:
          pixColor = [pix, pix, pix]
          pi = m.Position2D(i, j)
          pW = exploMap.getPosition2DFromPixel(pi)
          point = self.occupancyMap.getPixelFromPosition2D(pW)
          r = int(0.05 / self.occupancyMap.mpp)
          pygame.draw.circle(self.screen, pixColor, [int(point.x), int(point.y)], r)

  def drawExplorationPath(self):
    nodeColor = [0, 0, 200]
    i = 0
    for pose in self.path:
      pp = m.Pose2D(pose[0], pose[1], pose[2])
      point = self.occupancyMap.getPixelFromPosition2D(m.position2DFromPose2D(pp))
      pygame.draw.circle(self.screen, nodeColor, [int(point.x), int(point.y)], 5)
      position = [int(point.x) + 5, int(point.y)]
      string = str(i)
      ren = self.font1.render(string,3,(0,0,255))
      self.screen.blit(ren, position)
      i = i + 1

  def drawLocalizationResult(self):
    if len(self.localizationResult) != 2:
      return
    incert = m.Pose2D(self.localizationResult[1])
    ellipseRadius = math.sqrt(incert.x * incert.x + incert.y * incert.y)
    r = int(ellipseRadius / self.occupancyMap.mpp)
    # Do not draw if radius circle is less than 3 pixels.
    if r > 3:
      pose = m.Pose2D(self.localizationResult[0])
      p = self.occupancyMap.getPixelFromPosition2D(m.Position2D(pose.x, pose.y)).toVector()
      pInts = (int(p[0]), int(p[1]))
      zoneColor = [100, 100, 200]
      pygame.draw.circle(self.screen, zoneColor, pInts, r, 3)

  def updateNavigationInput(self):
      connectionOK = True
      try:
        self.localizationResult = self.navigation.getRobotPositionInMap()
      except Exception,errorMsg:
        # display error Msg
        position = [10, 90]
        stringMsg = str(errorMsg)
        string = str("ERROR: " + stringMsg)
        ren = self.font1.render(string,3,(255,0,0))
        self.screen.blit(ren, position)
        return False
      self.robotPose= m.Pose2D(self.localizationResult[0])
      self.path = self.navigation.getExplorationPath()
      if self.nodeNumber != len(self.path):
        self.nodeNumber = len(self.path)
        self.navigation._computeAggregatedMap()
        self.metricalMap = self.navigation.getMetricalMap()
      return connectionOK

  def run(self):
    self.center()
    while(self.running) :
      for e in pygame.event.get():
        if e.type == pygame.QUIT:
          self.running = False
          self.exit()
        self.getKeyboard(e)
        sendCommand = self.getRightClickPositionInMap(e)
        # Handle the command.
        if sendCommand:
          self.navigation.navigateToInMap(self.currentTargetRobotPose2D.x,
              self.currentTargetRobotPose2D.y, _async = True)
      self.screen.fill(screenColor)
      connectionOK = self.updateNavigationInput()
      if connectionOK:
        self.drawMap()
        self.drawExplorationPath()
        self.drawLocalizationResult()
        self.drawRobot(self.robotPose)

      # Replace previous view by the current just computed.
      pygame.display.flip()
      time.sleep(0.2)
    pygame.quit()

if __name__ == "__main__":
    ip = "127.0.0.1"
    if (len(sys.argv))>1:
        ip = sys.argv[1]
    print "IP: " + ip
    win = ExplorationGUI(ip)
