import qi
import time
import sys
import functools
import cv2
import numpy as np
import vision_definitions as vd

class FaceDetector:
  def __init__(self, ip, first, second):
      port = 9559
      self.session = qi.Session()
      self.session.connect("tcp://" + ip + ":" + str(port))
      self.faceDetection = self.session.service("ALFaceDetection")
      self.memory = self.session.service("ALMemory")
      self.navigation = self.session.service("ALNavigation")
      self.anime = self.session.service("ALAnimatedSpeech")
      self.faces = []
      self.firstTarget = self.navigation.getExplorationPath()[int(first)]
      self.secondTarget = self.navigation.getExplorationPath()[int(second)]
      self.navigationFuture = None
      self.currentTarget = self.firstTarget

      period = 500
      self.subscriberName = "FaceDetectoree"
      self.faceDetection.subscribe(self.subscriberName, period, 0.0 )
      self.sub = self.memory.subscriber("FaceDetection/FaceDetected")
      self.sub.signal.connect(self.callbackFace)

      self.navigationFuture = self.navigation.navigateToInMap(self.currentTarget[0], self.currentTarget[1], _async = True)
      self.run()

  def callbackFace(self, value):
      self.faces = value

  def unsubscribeEverything(self):
      self.faceDetection.unsubscribe(self.subscriberName)

  def run(self):
      while True:
          time.sleep(0.2)
          try:
              if (len(self.faces) > 0):
                  self.navigationFuture.cancel()
                  self.anime.say("Hello! I just saw you! This is my place holder application")

              if (not self.navigationFuture.isRunning()):

                  if (not self.navigationFuture.isCanceled()):
                      val = self.navigationFuture.value()
                      if (not val):
                          self.anime.say("sumimasen! I can't reach the target")
                      if self.currentTarget == self.firstTarget:
                            self.currentTarget = self.secondTarget
                      else:
                            self.currentTarget = self.firstTarget
                  self.navigationFuture = self.navigation.navigateToInMap(self.currentTarget[0], self.currentTarget[1], _async = True)
          except Exception, e:
              print "Error :"
              print str(e)
              self.unsubscribeEverything()
              raise
          except (KeyboardInterrupt, SystemExit):
             print '\nkeyboardinterrupt found'
             self.unsubscribeEverything()
             break

if __name__ == "__main__":
    ip = "127.0.0.1"
    if (len(sys.argv))>1:
        ip = sys.argv[1]
        first = sys.argv[2]
        second = sys.argv[3]

    else:
        print "args: ip, first target, second target."
        raise

    faceDetector = FaceDetector(ip, first, second)
