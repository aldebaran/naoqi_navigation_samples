
console.log("defining module");
angular.module('pepper-patrol', ['ngTouch'])
    .controller('map-display', function ($scope, $locale, $timeout, $http) {
        console.log("map-display controller");
        var memory = null;
        var exploManager = null;
        var intervalID = null;
        var mpp = null;
        var size = null;
        var offset = null;
        // step : 0 = list explo, 1 = reloc, 2 = patrol.
        var step = 0;
        var touch = null;

        $scope.addOnClick = function (event) {
            // event.offsetX and event.offsetY
            // compute
            var img = document.getElementById("map_container");
            var pxlX = event.offsetX - img.offsetLeft
            var pxlY = event.offsetY - img.offsetTop
            touch = [pxlX, pxlY];
            if (pxlX > 0 && pxlX < img.width && pxlY > 0 && pxlY < img.height) {
                console.log("click: " + event.offsetX + " " + event.offsetY);
                if (step == 1) {
                    memory.raiseEvent("Patrol/Relocalize", [pxlX, pxlY]);
                    document.getElementById("mode_configure").click();
                } else if (step == 2) {
                    memory.raiseEvent("Patrol/AddWayPoint", [[pxlX, pxlY], ""]);
                }
            }
        };

        $scope.OnModeChanged = function() {
            step = document.querySelector('input[name="mode"]:checked').value
            console.log("onchanged: " + step.toString());
        }

        $scope.OnGoClick = function (event) {
            memory.raiseEvent("Patrol/StartPatrol", [])
        }

        $scope.OnResetClick = function(event) {
            memory.raiseEvent("Patrol/Reset", [])
        }

        $scope.setpatrolMessage = function () { //display patrol report message
            document.getElementById("patrol_report").style.display = "block";
            document.getElementById("waiting_ui").style.display = "none";
            document.getElementById("mode_ui").style.visibility = "hidden";
            document.getElementById("waypoints_ui").style.visibility = "hidden";
            document.getElementById("exit_button").style.display = "none";
        }

        $scope.rempatrolMessage = function () {
            document.getElementById("patrol_report").style.display = "none";           
            document.getElementById("mode_ui").style.visibility = "visible"; //show buttons
            document.getElementById("waypoints_ui").style.visibility = "visible";
            document.getElementById("image_container").style.visibility = "hidden"; //hidde pic
            document.getElementById("exit_button").style.display = "block";
        }

        $scope.setImage = function (tab) { // tab : [size, full], display a picture   
            var size = tab[0];
            var data = tab[1];
            var wrapper = document.getElementById("wrapper");
            wrapper.style = "position:relative; width:"+size+"px; height:"+size+"px;"
            var image_container = document.getElementById('image_container');
            image_container.width = size;
            image_container.height = size;      

            // show image
            document.getElementById("image_container").style.visibility = "visible";
            angular.element(image_container).css({ //display the picture
            'background-image': 'url(' + data +')',
            'background-size' : 'cover'
            }); 
        }

        $scope.dispMap = function(){

            document.getElementById("image_container").style.visibility = "hidden";            
        }

        $scope.setMap = function (tab) {
            //hide the image_container
            document.getElementById("image_container").style.visibility = "hidden";
            //show the map_container
            document.getElementById("map_container").style.visibility = "visible";
            document.getElementById("waiting_ui").style.display = "none";
            document.getElementById("mode_ui").style.visibility = "visible";
            document.getElementById("waypoints_ui").style.visibility = "visible";
            document.getElementById("waypoints_canvas").style.visibility = "visible";
            document.getElementById("exit_button").style.display = "block";

            var mpp = tab[0];
            var size = tab[1];
            var offset = tab[2];
            var data = tab[3];
            var wrapper = document.getElementById("wrapper");
            wrapper.style = "position:relative; width:"+size+"px; height:"+size+"px;"
            var map_container = document.getElementById('map_container');
            map_container.width = size;
            map_container.height = size;
            angular.element(map_container).css({
            'background-image': 'url(' + data +')',
            'background-size' : 'cover'
            });
            var waypoint_canvas = document.getElementById("waypoints_canvas");
            waypoint_canvas.width = size;
            waypoint_canvas.height = size;
            var places_canvas = document.getElementById("places_canvas");
            places_canvas.width = size;
            places_canvas.height = size;
            step = 1;

        };


        $scope.setRobot = function (tab) {
            console.log("setRobot");
            var centerX = tab[0][0];
            var centerY = tab[0][1];
            var radius = tab[1];
            var canvas = document.getElementById('map_container');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            context.fillStyle="blue";
            context.fill();
            context.beginPath();
            context.arc(tab[2][0], tab[2][1], 0.5 * radius, 0, 2 * Math.PI, false);
            context.fillStyle="blue";
            context.fill();
        };

        $scope.setPlaces = function (tab) {
            var canvas = document.getElementById('places_canvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (i = 0; i < tab.length; ++i) {
                var centerX = tab[i][0][0];
                var centerY = tab[i][0][1];
                var label = tab[i][1];
                var radius = 5;
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                context.fillStyle="#00ff00";
                context.fill();
                context.font = "30px Arial";
                context.fillStyle = "#00ff00";
                context.fillText(label.toString(), centerX + 10, centerY);
            }
        };

        $scope.Step2 = function(){
            step = 2;
            console.log("step = 2");
            document.getElementById("mode_relocalize").checked = false;
            document.getElementById("mode_configure").checked = true;

        }

        $scope.setWaypoints = function (tab) { //tab[0] = 0, 0 -> normal mode, tab[0] = [[1, 1],...] -> particular waypoint 
            var canvas = document.getElementById('waypoints_canvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.lineWidth = 1.5;
            context.beginPath();
            var a = tab[0];
            for (i = 0; i < tab[1].length; ++i) {
                var centerX = tab[1][i][0];
                var centerY = tab[1][i][1];
                if(a == 0){
                    var label = i.toString();
                    context.fillStyle = "red";
                    context.strokeStyle = 'red';
                }
                else{
                    var label = "Pic taken here";
                    context.fillStyle = "green";
                    context.strokeStyle = 'green';
                }
                var radius = 5;
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
                context.fill();
                context.font = "30px Arial";
                context.fillText(label, centerX + 10, centerY);
            }
        };

        $scope.OnExit = function() {
            memory.raiseEvent("Patrol/Exit", [])
        }

        $scope.OnStop = function() {
            memory.raiseEvent("Patrol/StopPatrol", [])
        }

        $scope.OnInfinitePatrolChanged = function() {
            var checkbox = document.querySelector('input[name="infinite_patrol"]:checked');
            var infinite_patrol = checkbox != null && checkbox.checked;
            console.log("raising patrolChanged: " + infinite_patrol.toString());
            memory.raiseEvent("Patrol/OnInfinitePatrolChanged", infinite_patrol);
        }

        $scope.onPatrolStarted = function() {
            document.getElementById("patrol_ongoing_ui").style.display = "block";
            document.getElementById("waypoints_ui").style.visibility = "hidden";
            document.getElementById("mode_ui").style.visibility = "hidden";
            document.getElementById("exit_button").style.display = "none";
            document.getElementById("stop_button").style.display = "block";
        }

        $scope.onPatrolFinished = function() {
            document.getElementById("patrol_ongoing_ui").style.display = "none";
            document.getElementById("exit_button").style.display = "block";
            document.getElementById("stop_button").style.display = "none";
        }

        $scope.isReport = function() { //used to know if a patrol report is needed
            var checkbox = document.querySelector('input[name="patrol_report"]:checked');
            var patrol_report = checkbox != null && checkbox.checked;
            console.log("raising IsReport: " + patrol_report.toString());
            memory.raiseEvent("Patrol/IsReport", patrol_report);
        }

        var onConnected = function (session) {
            session.service("ALMemory").then(function (service) {
                memory = service;
            }, function (error) {
            });
            session.service("ExplorationManager").then(function (service) {
                exploManager = service;
                exploManager.publishMap()
                exploManager.publishLabels()
            }, function (error) {
            });

            RobotUtils.subscribeToALMemoryEvent("ExplorationManager/MetricalMap", $scope.setMap);
            RobotUtils.subscribeToALMemoryEvent("Patrol/RobotPosition", $scope.setRobot);
            RobotUtils.subscribeToALMemoryEvent("ExplorationManager/Places", $scope.setPlaces);
            RobotUtils.subscribeToALMemoryEvent("Patrol/Waypoints", $scope.setWaypoints);
            RobotUtils.subscribeToALMemoryEvent("Patrol/PatrolStarted", $scope.onPatrolStarted);
            RobotUtils.subscribeToALMemoryEvent("Patrol/PatrolFinished", $scope.onPatrolFinished);
            RobotUtils.subscribeToALMemoryEvent("Patrol/DisplayPicture", $scope.setImage);
            RobotUtils.subscribeToALMemoryEvent("Patrol/StartReport", $scope.setpatrolMessage);
            RobotUtils.subscribeToALMemoryEvent("Patrol/EndReport", $scope.rempatrolMessage);
            RobotUtils.subscribeToALMemoryEvent("Patrol/DisplayMap", $scope.dispMap);
            RobotUtils.subscribeToALMemoryEvent("Patrol/Step2", $scope.Step2)

        };

        var onDisconnected = function () {
        };

        RobotUtils.connect(onConnected, onDisconnected);

    });

var click = function (x, y) {
    var ev = document.createEvent('TouchEvent');
    var el = document.elementFromPoint(x, y);
    ev.initUIEvent('touchstart', true, true);
    el.dispatchEvent(ev);
}

