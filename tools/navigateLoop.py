import qi
import sys

if __name__ == "__main__":
    ip = "127.0.0.1"
    if (len(sys.argv))==4:
        ip = sys.argv[1]
        firstID = sys.argv[2]
        secondID = sys.argv[3]
        session = qi.Session()
        session.connect("tcp://" + ip + ":9559")
        nav = session.service("ALNavigation")
        print "IP: " + ip
        print "navigateToInMap from " + firstID + " point to "+ secondID
        while True:
          path = nav.getExplorationPath()
          try:
              print " NavigateTo " + firstID
              first = path[int(firstID)]
              boo = nav.navigateToInMap(first[0], first[1])

              print " NavigateTo " + secondID
              last = path[int(secondID)]
              boo4 = nav.navigateToInMap(last[0], last[1])

          except Exception, e:
              print "Error :"
              print str(e)
    else:
        print " navigateLoop ROBOT_IP FRIST_PATH_ID LAST_PATH_ID"

