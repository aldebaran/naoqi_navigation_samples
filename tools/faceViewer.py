import qi
import time
import sys
import functools
import cv2
import numpy as np
import vision_definitions as vd

class FaceDetector:
  def __init__(self, ip):
      port = 9559
      self.session = qi.Session()
      self.session.connect("tcp://" + ip + ":" + str(port))
      self.faceDetection = self.session.service("ALFaceDetection")
      self.memory = self.session.service("ALMemory")
      self.video = self.session.service("ALVideoDevice")
      self.faces = []

      # Init ALFaceDetection:
      # This means that ALFaceDetection will write in ALMemory with
      # the given period below.
      period = 500
      self.subscriberName = "FaceDetector"
      self.faceDetection.subscribe(self.subscriberName, period, 0.0 )
      self.sub = self.memory.subscriber("FaceDetection/FaceDetected")
      self.sub.signal.connect(self.callbackFace)

      # Init ALVideoDevice: subscribe to cameraTop
      framerate = 30
      self.videoSubscriberName = self.video.subscribeCamera(self.subscriberName,
       vd.kTopCamera, vd.kVGA, vd.kBGRColorSpace, framerate)
      # To adapt faceDetectionResult to the format of our image.
      self.faceDetection.setResolution(vd.kVGA)
      self.run()

  def drawFaces(self, frame):
      color = [0, 0, 255]
      for _face in self.faces:
          # Format points array
          _points = np.array([[_face[0][1][0], _face[0][1][1]],
                              [_face[0][2][0], _face[0][2][1]],
                              [_face[0][4][0], _face[0][4][1]],
                              [_face[0][3][0], _face[0][3][1]]],
                             dtype=np.int32)
          _points = _points.reshape((-1, 1, 2))
          # Display rectangle
          cv2.polylines(frame, [_points], isClosed=True,
                        color=color, thickness=2)
          # Display face ID
          cv2.putText(frame, "id: {}".format(_face[0][0]),
                      (_face[0][3][0], _face[0][3][1]+15),
                      cv2.FONT_HERSHEY_SIMPLEX, .5, color=color, thickness=2)
          # Display face size
          cv2.putText(frame,
                      "size: {}".format(abs(_face[0][3][0] - _face[0][2][0])),
                      (_face[0][3][0], _face[0][3][1]+30),
                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, color=color, thickness=2)
      # Display texts
      cv2.putText(frame, 'Faces: {}'.format(len(self.faces)), (20, 20),
                  cv2.FONT_HERSHEY_SIMPLEX, .7, (255, 0, 255), 2)

  def callbackFace(self, value):
      self.faces = value

  def unsubscribeEverything(self):
      self.faceDetection.unsubscribe(self.subscriberName)
      self.video.unsubscribe(self.videoSubscriberName)

  def run(self):
      while True:
          try:
              image = self.video.getImageRemote(self.videoSubscriberName)
              if (image == None):
                  time.sleep(1)
                  print "Can't retrieve image data"
                  continue
              # from ALImage to openCV.
              data = np.asarray(image[6], dtype=np.uint8) # 6 = image buffer
              frame = data.reshape((image[1], image[0], 3))  # (height, width)
              self.drawFaces(frame)
              cv2.imshow('img', frame)
              # break
              key = cv2.waitKey(200)
              if key & 0xFF == ord('q'):
                self.unsubscribeEverything()
                break
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
    faceDetector = FaceDetector(ip)
