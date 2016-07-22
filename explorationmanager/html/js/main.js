
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
        var touch = null;

        $scope.addOnClick = function (event) {
            var img = document.getElementById("map_container");
            var pxlX = event.offsetX - img.offsetLeft
            var pxlY = event.offsetY - img.offsetTop
            touch = [pxlX, pxlY];
            if (pxlX > 0 && pxlX < img.width && pxlY > 0 && pxlY < img.height) {
                console.log("click: " + event.offsetX + " " + event.offsetY);
                var label_field = document.getElementById("label_field_id");
                label_field.value = "";
                label_field.focus();
            }
        };

        $scope.OnClickAddLabel = function() {
            var label = document.getElementById("label_field_id").value;
            console.log("add label " + label);
            memory.raiseEvent("Places/AddPlace", [touch, label]);
        }

        $scope.OnResetClick = function(event) {
            memory.raiseEvent("Places/Reset", [])
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
            document.getElementById("label_ui").style.visibility = "visible";
            document.getElementById("places_ui").style.visibility = "visible";
            document.getElementById("map_loading_screen").style.display = "block";
            document.getElementById("loading_map_ui").style.display = "none";
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
            document.getElementById("waiting_ui").style.display = "none";
            document.getElementById("map_loading_screen").style.display = "block";
            document.getElementById("general").style.visibility = "visible";
        }

        $scope.OnClickLoadExplo = function() {
            var exploPath = document.forms.form.exploration_list.options[
              document.forms.form.exploration_list.options.selectedIndex].value;
            console.log("load explo " + exploPath);
            document.getElementById("map_loading_screen").style.display = "none";
            document.getElementById("loading_map_ui").style.display = "block";
            memory.raiseEvent("Places/LoadPlaces", exploPath);
        }

        $scope.OnExit = function() {
            memory.raiseEvent("Places/Exit", [])
        }

        $scope.OnSave = function() {
            memory.raiseEvent("Places/Save", [])
        }

        var onConnected = function (session) {
            session.service("ALMemory").then(function (service) {
                memory = service;
            }, function (error) {
            });
            session.service("ExplorationManager").then(function (service) {
                exploManager = service;
                exploManager.getAvailableExplorations().then(function (list) {
                    console.log(list);
                    $scope.listAvailableExplo(list);
                }, function (error) {
                    console.log("getAvailableExplorations error: " + error.toString());
                });
            }, function (error) {
                console.log("Unable to get ExplorationManager " + error.toString());
            });
            RobotUtils.subscribeToALMemoryEvent("ExplorationManager/MetricalMap", $scope.setMap);
            RobotUtils.subscribeToALMemoryEvent("ExplorationManager/Places", $scope.setPlaces);
            RobotUtils.subscribeToALMemoryEvent("Places/AvailableExplo", $scope.listAvailableExplo);
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
