
console.log("defining module");
angular.module('pepper-patrol', ['ngTouch'])
    .controller('map-display', function ($scope, $locale, $timeout, $http) {
        console.log("map-display controller");
        var memory = null;
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
                } else if (step == 2) {
                    document.getElementById("label_field_id").focus();
                }
            }
        };

        $scope.OnClickAddLabel = function() {
            var label = document.getElementById("label_field_id").value;
            console.log("add label " + label);
            memory.raiseEvent("Patrol/AddPlace", [touch, label]);
        }

        $scope.OnGoClick = function (event) {
            console.log("go");
            memory.raiseEvent("Patrol/StartPatrol", [])
        }

        $scope.OnResetClick = function(event) {
            memory.raiseEvent("Patrol/Reset", [])
        }

        $scope.setMap = function (tab) {
            console.log("setMap");
            document.getElementById("map_loading_screen").display = "none";
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
            var waypoint_canvas = document.getElementById("places");
            waypoint_canvas.width = size;
            waypoint_canvas.height = size;
            document.getElementById("map_reloc").display = "block";
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
            context.fillStyle="#ff0000";
            context.fill();
            context.beginPath();
            context.arc(tab[2][0], tab[2][1], 0.5 * radius, 0, 2 * Math.PI, false);
            context.fillStyle="#ff0000";
            context.fill();
        };

        $scope.setPlaces = function (tab) {
            var canvas = document.getElementById('places');
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

        $scope.listAvailableExplo = function(tab) {
            for (i = 0; i < tab.length; ++i) {
                document.forms.form.exploration_list.options[document.forms.form.exploration_list.options.length] =
                    new Option(tab[i], tab[i]);
            }
        }

        $scope.OnClickLoadExplo = function() {
            var exploPath = document.forms.form.exploration_list.options[
              document.forms.form.exploration_list.options.selectedIndex].value;
            console.log("load explo " + exploPath)
            memory.raiseEvent("Patrol/LoadExploration", exploPath);
        }

        $scope.OnMapDisplay = function() {
            step = 2;
        }

        $scope.OnRelocalizeMode = function() {
            step = 1;
        }

        $scope.OnExit = function() {
            memory.raiseEvent("Patrol/Exit", [])
        }

        $scope.OnSave = function() {
            memory.raiseEvent("Patrol/Save", [])
        }

        var onConnected = function (session) {
            session.service("ALMemory").then(function (service) {
                memory = service;
            }, function (error) {
            });
            RobotUtils.subscribeToALMemoryEvent("Patrol/MetricalMap", $scope.setMap);
            RobotUtils.subscribeToALMemoryEvent("Patrol/RobotPosition", $scope.setRobot);
            RobotUtils.subscribeToALMemoryEvent("Patrol/Places", $scope.setPlaces);
            RobotUtils.subscribeToALMemoryEvent("Patrol/AvailableExplo", $scope.listAvailableExplo);
        };

        var onDisconnected = function () {
            console.log("Bye bye");
        };

        RobotUtils.connect(onConnected, onDisconnected);

    });

var click = function (x, y) {
    var ev = document.createEvent('TouchEvent');
    var el = document.elementFromPoint(x, y);
    ev.initUIEvent('touchstart', true, true );
    el.dispatchEvent(ev);
}
