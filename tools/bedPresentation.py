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
  def __init__(self, ip, init, initAngle, first, second, third, angle):
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
      self.currentTarget = self.init

      self.initAngle = float(initAngle)

      self.navigationFuture = self.navigation.navigateToInMap(self.currentTarget[0], self.currentTarget[1], _async = True)
      self.run()

  def run(self):
      while True:
          time.sleep(0.2)
          try:

                if (not self.navigationFuture.isRunning()):
                    val = self.navigationFuture.value()
                    if (not val):
                      self.anime.say("Oh!")
                    else:
                        robotPose = self.navigation.getRobotPositionInMap()
                        print robotPose[0]
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
                            self.anime.say("This is the Item numero one, I can tell you a lot of informations about it!")
                            self.currentTarget = self.secondTarget

                        elif self.currentTarget == self.init:
                            self.anime.say("Do you want to know have more informations about our items?")
                            time.sleep(5)
                            self.currentTarget = self.firstTarget

                        elif self.currentTarget == self.secondTarget:
                            self.anime.say("This is the item numero two, it is really interesting for a lot of reasons!")
                            self.currentTarget = self.thirdTarget

                        elif self.currentTarget == self.thirdTarget:
                            self.anime.say("This is the item numero three, what an interesting item!")
                            self.currentTarget = self.init



                    self.navigationFuture = self.navigation.navigateToInMap(self.currentTarget[0], self.currentTarget[1], _async = True)

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


    else:
        print "args: ip, first target, second target, angle"
        raise

    faceDetector = FaceDetector(ip, init, initAngle, first, second, third, angle)


