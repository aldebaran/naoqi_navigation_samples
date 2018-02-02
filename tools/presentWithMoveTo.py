#!/usr/bin/env python
# -*- coding: utf-8 -*-


import qi
import time
import sys
import functools
import cv2
import numpy as np
import vision_definitions as vd
import almath

class FaceDetector:
  def __init__(self, ip, init, initAngle, first, second, third, angle, tsec):
      port = 9559
      self.session = qi.Session()
      self.session.connect("tcp://" + ip + ":" + str(port))
      self.navigation = self.session.service("ALNavigation")
      self.motion = self.session.service("ALMotion")
      self.anime = self.session.service("ALAnimatedSpeech")

      self.init = self.navigation.getExplorationPath()[int(init)]

      self.firstTarget = self.navigation.getExplorationPath()[int(first)]
      self.secondTarget = self.navigation.getExplorationPath()[int(second)]
      self.thirdTarget = self.navigation.getExplorationPath()[int(third)]

      self.angle = float(angle)
      self.currentTarget = self.thirdTarget
      self.tsec = int(tsec)

      self.initAngle = float(initAngle)
      self.moveFunction(self.init)

      self.run()


  def getPositionDiff(self, target):
      robotPose = self.navigation.getRobotPositionInMap()
      currentPose = almath.Pose2D(robotPose[0][0], robotPose[0][1], robotPose[0][2])
      targetPose = almath.Pose2D(target)
      poseDiff = currentPose.inverse() * targetPose
      positionDiff = almath.position2DFromPose2D(poseDiff)
      #angle = positionDiff.getAngle()
      return positionDiff

  def moveFunction(self, target):
      diff = self.getPositionDiff(target)
      print diff
      while (abs(diff.y) > 0.1):
          diff = self.getPositionDiff(target)
          print "turn:" , diff
          resTurn = self.motion.moveTo(0, 0, almath.modulo2PI(diff.getAngle()))
          time.sleep(0.01)
          diff = self.getPositionDiff(target)
      diff = self.getPositionDiff(target)
      while (diff.x > 0.1):
          diff = self.getPositionDiff(target)
          print "move: ", diff
          fut = self.motion.moveTo(diff.x, diff.y, almath.modulo2PI(diff.getAngle()), _async = True)
          time.sleep(0.2)
          diff = self.getPositionDiff(target)
      try:
        fut.wait()
      except Exception, e:
        pass


  def run(self):
      print "qaaaaaaaaaaa"
      while True:
          print "bbbbbbbbbbbbbbbbb"
          time.sleep(0.2)
          try:
            robotPose = self.navigation.getRobotPositionInMap()
            print self.currentTarget

            currentPose = almath.Pose2D(robotPose[0][0], robotPose[0][1], robotPose[0][2])
            if (self.currentTarget != self.init):
                target = almath.Pose2D(currentPose.x, currentPose.y, self.angle)
                currentPoseToTarget = currentPose.inverse() * target
                thetaModulo2PI = almath.modulo2PI(currentPoseToTarget.theta)
                future = self.motion.moveTo(0, 0, thetaModulo2PI, _async=True)
                self.motion.angleInterpolationWithSpeed(["HeadPitch"], [0], 0.2, _async=True)
                future.wait()
            else:
                target = almath.Pose2D(currentPose.x, currentPose.y, self.initAngle)
                currentPoseToTarget = currentPose.inverse() * target
                thetaModulo2PI = almath.modulo2PI(currentPoseToTarget.theta)
                future = self.motion.moveTo(0, 0, thetaModulo2PI, _async=True)
                self.motion.angleInterpolationWithSpeed(["HeadPitch"], [0], 0.2, _async=True)
                future.wait()


            if self.currentTarget == self.firstTarget:
                #self.anime.say("This is the Item numero one, I can tell you a lot of informations about it!")
                self.anime.say("one ")

                time.sleep(self.tsec)
                self.currentTarget = self.secondTarget

            elif self.currentTarget == self.init:
               # self.anime.say("Do you want to know have more informations about our items?")
                self.anime.say("init")

                time.sleep(self.tsec)
                self.currentTarget = self.firstTarget

            elif self.currentTarget == self.secondTarget:
                #self.anime.say("This is the item numero two, it is really interesting for a lot of reasons!")
                self.anime.say("two")

                time.sleep(self.tsec)
                self.currentTarget = self.thirdTarget

            elif self.currentTarget == self.thirdTarget:
                #self.anime.say("This is the item numero three, what an interesting item!")
                self.anime.say("three")

                time.sleep(self.tsec)
                self.currentTarget = self.init
            self.moveFunction(self.currentTarget)

          except Exception, e:
              print "Error :"
              print str(e)
              raise
          except (KeyboardInterrupt, SystemExit):
             print '\nkeyboardinterrupt found'
             break


if __name__ == "__main__":
    ip = "127.0.0.1"
    if (len(sys.argv))>1:
        ip = sys.argv[1]
        init = sys.argv[2]
        initAngle = sys.argv[3]
        first = sys.argv[4]
        second = sys.argv[5]
        third = sys.argv[6]
        angle = sys.argv[7]
        tsec = sys.argv[8]


    else:
        print "args: ip, first target, second target, angle"
        raise

    faceDetector = FaceDetector(ip, init, initAngle, first, second, third, angle, tsec)


