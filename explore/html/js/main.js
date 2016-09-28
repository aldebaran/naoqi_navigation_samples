
var application = function(){
    
    //services
    var ALMemory = null;
    var RobotStore = null;
	
	//localization dictionary
	var localDict = {}
    
    //variables
    var applications = {}
    var currentApplication = null;
    var resultPackages = [];
    var resultApps = [];
    var categories = [];
    
    var currentLanguage = "English";
    var currentScreen = "home"
    var prevScreen = "home"
    var currentCategory = "All"
    var currentKeyword = ""
    
    
    window.addEventListener('load', function() {
        new FastClick(document.body);
    }, false);
    
    var log = function(l){
        if(console) console.log(l)    
    }
    
// ------- GUI Functions --------------
    
    var displayScreen = function(screen, overlap){
        prevScreen = currentScreen;
        hideQuotes(screen)
    	if (!overlap)
        	$('.screen').fadeOut(500)
        $('#'+screen).fadeIn(500);
        currentScreen = screen;
    }
    
    var hideQuotes = function(screen){
        log("onTextDone")
        buttons = $("#"+screen+" .button")
		buttons2 = $(".searchBorder .button")
		Array.prototype.push.apply(buttons, buttons2);
        for(var i=0;i<buttons.length;i++){
            id = $("#"+buttons[i].id)
            if(id.css("display")!="none"){
                id.switchClass( "quote", "hidden", 1000);
                id.fadeIn()
            }
        }
    }
    
    var highlightButton = function(id, callback){
        log("highlightButton " + id)
		$(id).animate({ opacity: 0.5 }, 200);
		setTimeout(callback,1000);
		setTimeout(function(){$(id).animate({ opacity: 1 }, 200);},1500);
	}
    
    var highlightApp = function(id, callback){
        log("highlightApp " + id)
		$(id).parent().animate({backgroundColor:"rgba(12, 23, 62, 0.1)" }, 200);
		setTimeout(callback,1000);
		setTimeout(function(){$(id).parent().animate({ backgroundColor:"rgba(255, 255, 255, 0.0)" }, 200);},1500);
	}
    
// ------- Content Functions --------------
    
    function fillCategoryScreen(){
        html = "<h2>SELECT YOUR CATEGORY</h2><div>"
        for(var key=0; key<categories.length; key++){
            cat = categories[key];
            html += "<div class='button greyCategory hidden' id='category"+key+"'><h2>"+cat+"</h2></div>"
        }
        html += "</div><div class='button blueNoIcon hidden' id='categoryCancel'><h2>Cancel</h2></div>"
        $("#category").html(html);
        bindButton("#categoryCancel", "BUTTON_CATEGORY_CANCEL",0)
        for(var key=0;key<categories.length;key++){
            cat = categories[key];
            bindCategoryButton("#category"+key, cat)
        }
    }
    //< 9 results
    function displayResultApps(){
        for(var key in resultApps){
            app = resultApps[key]
            $("#applicationContainer").append(ApplicationObject(app));
            convertByteToImgApp(app);
            fillRatingApp(app);
            bindApp(app['slug']);
        }
        $("#applicationContainer").fadeIn("slow");
    }
    //>= 9 results
    function displayResultAppsMultiple(){
        for(var key in resultApps){
            app = resultApps[key]
            $("#applicationContainer").append(ApplicationSmallObject(app));
            convertByteToImgApp(app);
            bindApp(app['slug']);
        }
        $("#applicationContainer").fadeIn("slow");
    }
    
    function getAppUUID(app){
        return app["slug"].replace(".","")
    }
    
    function getAppByUUID(uuid){
        for(var key in resultApps){
            app = resultApps[key];
            if(getAppUUID(app) == uuid){
                return app;
            }
        }
        return null;
    }
    
    function getAppUUIDByName(name){
        log(name)
        name = name.trim().replace("( ", "(").replace(" )",")")
        for(var key in resultApps){
            app = resultApps[key];
            langToName = app["title"].trim().replace("( ", "(").replace(" )",")")
            log(langToName)
            if(langToName == name){
                return app['slug']
            }
        }
        return null;
    }
    
    function fillAppDetails(uuid){
        app = getAppByUUID(uuid);
        keys = Object.keys(app);
        $("#title").empty();
        $("#description").empty();
        $("#naoqiVersion").empty();
        if(keys.indexOf("title") > -1){
            $("#title").html(app["title"])
        }
        if(keys.indexOf("icon_b64") > -1){
            //document.getElementById("icon").src = "data:image/png;base64," + app["icon_b64"];
            $(".icon").each(function(index, element){element.src = app["icon_b64"];})
        }
        else{
            //default icon
            $(".icon").each(function(index, element){element.src = "img/icon.png";})
        }
        if(keys.indexOf("langToDesc") > -1){
            $("#description").html(app["langToDesc"]["en_US"]);
        }
        
        val = Math.random() * (5.0 - 0.0) + 0.0;
        $("#rating").addClass("rateit").addClass("bigstars").addClass("details");
        $("#rating").rateit({ max: 5, value:val, resetable:0, starwidth:32, starheight:32});
        
        if(keys.indexOf("naoqiRequirements") > -1){
            try{
                $("#naoqiVersion").html(app["naoqiRequirements"][0]["minVersion"]);
            }
            catch(err){
                log(err.message)
            }
        }
    }
    
    function convertByteToImgApp(app){
        if(document.getElementById(app["slug"]+"_IMG"))
            //document.getElementById(app["slug"]+"_IMG").src = "data:image/png;base64," + app["icon_b64"];
            document.getElementById(app["slug"]+"_IMG").src = app["icon_b64"];
    }
    
    function fillRatingApp(app){
        if(document.getElementById(app["slug"]+"_RATING")){
            val = Math.random() * (5.0 - 0.0) + 0.0;
            $("#"+app["slug"]+"_RATING").rateit({ max: 5, value:val, resetable:0, starwidth:32, starheight:32});
        }
    }
    
    var ApplicationObject = function(application){
		var app = application;//applications[application];
		window.app = app;
		var keys = Object.keys(app);
        uuid = getAppUUID(app)
		var html = "<div class='appDiv'>";
        //touchable div
        html += "<div id='"+ uuid +"' class='touchable'></div>"
        if(keys.indexOf("icon_b64") > -1){
            html += "<img id='"+ uuid +"_IMG"+"' class='appIcon' src='' />"
        }
        else{
            //default icon
            html += "<img class='appIcon' src='img/icon.png' />"
        }
        html += "<div class='appContent'>"
        if(keys.indexOf("title") > -1){
            html += "<h2 class='appTitle'>"+ app["title"] +"</h2>"
        }
        html += "<div id='"+ uuid +"_RATING"+"' class='rateit bigstars'></div>"
        if(keys.indexOf("langToDesc") > -1){
            html += "<h3>"+ app["langToDesc"]["en_US"] +"</h3>"
        }
        html += "</div></div>";
		return html;
	}
    
    var ApplicationSmallObject = function(application){
		var app = application;//applications[application];
		var keys = Object.keys(app);
        uuid = getAppUUID(app)
		var html = "<div class='appDivSmall'>";
        //touchable div
        html += "<div id='"+ uuid +"' class='touchableSmall'></div>"
        if(keys.indexOf("icon_b64") > -1){
            html += "<img id='"+ uuid +"_IMG"+"' class='appIconSmall' src='' />"
        }
        else{
            //default icon
            html += "<img class='appIconSmall' src='img/icon.png' />"
        }
        html += "<div class='appContentSmall'>"
        if(keys.indexOf("title") > -1){
            html += "<h2 class='appTitleSmall'>"+ app["title"] +"</h2>"
        }
        html += "</div></div>";
		return html;
	}
 
    function searchForKeyword(keyword){
        RobotStore.searchForAppsByKeyword(keyword,currentCategory).then(function(data){
            processSearchData(data)
        })
    }
    //what is going to be displayed depending on the results
    function processSearchData(data){
        $("#applicationContainer").empty()
        if(data){
            resultApps = JSON.parse(data);
            if(resultApps.length == 1){
                window.packages = resultApps;
                displayResultApps();
                fillAppDetails(getAppUUID(resultApps[0]));
                if (RobotStore) RobotStore.inputReceived("DETAILS",0)
            }
            else if(resultApps.length > 1 && resultApps.length <= 9){
                window.packages = resultApps;
                displayResultApps();
                RobotStore.inputReceived("RESULTS",0)
            }
            else if(resultApps.length > 9){
                window.packages = resultApps;
                displayResultAppsMultiple();
                RobotStore.inputReceived("RESULTS",0)
            }
            else{
                window.packages = resultApps;
                displayResultApps();
                RobotStore.inputReceived("NO_RESULTS",0)
            }
        }
    }
    
// ------- GUI Event Listeners --------------
    
    document.getElementById("searchField").addEventListener("focus", function() {
        $("#searchField").val("");
    });
    
    document.getElementById("searchField").addEventListener("blur", function() {
        log("searchField inactive")
        val = $("#searchField").val();
        RobotStore.setKeyword(val);
        searchForKeyword(val)
    });
    
    
    $("#searchField").keyup(function(event) {
        if (event.keyCode==13) {
            $("#searchField").trigger("blur")
        }
    });
    
    document.getElementById("applicationContainer").addEventListener("scroll", function() {
        if($('#applicationContainer').prop('scrollHeight')-$("#applicationContainer").height() - parseInt($('#applicationContainer').css('paddingTop'))==$("#applicationContainer").scrollTop()){
            $("#applicationContainer").addClass("hideShadowBelow")
        }
        else if($("#applicationContainer").scrollTop() != 0){
            $("#applicationContainer").removeClass("hideShadow")
            $("#applicationContainer").removeClass("hideShadowBelow")
        }
        else{
            if($("#applicationContainer").attr("class")==""){
                $("#applicationContainer").addClass("hideShadow")
            }
            $("#applicationContainer").removeClass("hideShadowBelow")
        }
	}, false);


// ------- qi.Property callbacks for Service communication --------------
    
    var onStateChanged = function(state){
        log("onStateChanged : "+state)
        switch (state) {
            case "SEARCH":
                bindButton("#actionSelectCategory", "BUTTON_CATEGORY",0)
                bindButton("#latestApps", "LATEST_APPS",0)
                bindButton("#topRatedApps", "TOP_RATED_APPS",0)
                bindButton("#discoveryApps", "DISCOVERY_APPS",0)
                bindButton("#recommendedApps", "RECOMMENDED_APPS",0)
				$("#actionHome").fadeOut()
				displayScreen("home", false);
				break;
            case "SET_CATEGORY":
                displayScreen("category", true);
                break;
            case "CATEGORY_CANCEL":
                $("#category").fadeOut()
                bindButton("#actionSelectCategory", "BUTTON_CATEGORY",0)
                break;
            case "LATEST_APPS":
                RobotStore.getThreeLatest(currentCategory).then(function(data){
                    processSearchData(data)
                })
                break;
            case "TOP_RATED_APPS":
                RobotStore.getThreeTopRated(currentCategory).then(function(data){
                    processSearchData(data)
                })
                break;
            case "DISCOVERY_APPS":
            case "RECOMMENDED_APPS":
                RobotStore.getThreeRandom(currentCategory).then(function(data){
                    processSearchData(data)
                })
                break;
            case "CALC_RESULTS":
                //trigger search
                searchForKeyword(currentKeyword)
                break;
            case "RESULTS":
                displayScreen("results", false);
				$("#actionHome").fadeIn()
				bindButton("#actionHome", "SEARCH", 0);
				break;
            case "DETAILS":
                displayScreen("details", false);
                bindButton("#actionBackResults", "BUTTON_BACK_TO_LIST", 1);
                $("#actionLearn").fadeIn("fast")
                bindButton("#actionLearn", "BUTTON_LEARN", 1);
                break;
            case "LEARN":
                displayScreen("learn", false);
                bindButton("#actionLearnNo", "BUTTON_BACK_DETAILS", 1);
                bindButton("#actionLearnYes", "BUTTON_CONFIRMATION", 1);
                break;
			case "CONFIRMATION":
                displayScreen("confirmation", false);
                bindButton("#actionLearnOk", "SEARCH", 1);
                break;
        }
    }
    
    // Not necessary, but allows for easier debug.
    window.changeState = onStateChanged;
    
    var onTextDone = function(data){
        log("onTextDone")
        var buttons = []
        buttons = $("#"+currentScreen+" .button")
		buttons2 = $(".searchBorder .button")
		Array.prototype.push.apply(buttons, buttons2);
        for(var i=0;i<buttons.length;i++){
            id = $("#"+buttons[i].id)
            if(id.css("display")!="none"){
                id.switchClass( "hidden", "quote", 1000);
            }
        }
    }
    
    var onKeywordChanged = function(keyword){
        log("onKeywordChanged")
        currentKeyword = keyword;
        if (currentCategory != ""){
            $("#searchField").val(keyword.toUpperCase());
        }
        else{
            $("#searchField").val(keyword.toUpperCase());
        }
    }
    
    var onCategoryChanged = function(category){
        currentCategory = category;
        log("onCategoryChanged")
        $("#searchCategory").html(category.toString());
        divs = $(".catAppBorder")
        for(var key=0;key<divs.length;key++){
            id = divs[key].id;
            $("#"+id+" h2 span").html(category.toUpperCase())
        }
        if(RobotStore) RobotStore.inputReceived("BUTTON_CATEGORY_CANCEL",0)
		//start search
		if(currentScreen != "home" && prevScreen != "home"){
			searchForKeyword(currentKeyword);
		}
    }
    
    var onChooseApp = function(name){
        uuid = getAppUUIDByName(name);
        log("uuid" + uuid)
        $("#"+uuid).click()
    }
    
// ------- Button callbacks --------------
     
     function bindButton(buttonId, callbackMessage, unbindAfterClick) {
        //in case buttonId is already bound
        $(buttonId).off("click");
        $(buttonId).click(function(e){
            console.debug("Button clicked: " + e.target.id);
            highlightButton(buttonId, function(){
                if (RobotStore) RobotStore.inputReceived(callbackMessage,0)
                if (unbindAfterClick) {
                    $(buttonId).off("click");
                }
            });
        });
     }
     
     function bindApp(uuid) {
        buttonId = "#"+uuid;
        //in case buttonId is already bound
        $(buttonId).off("click");
        $(buttonId).click(function(e){
            highlightApp("#" + e.target.id, function(){
                console.debug("App clicked: " + uuid);
                fillAppDetails(uuid);
                if (RobotStore) RobotStore.inputReceived("DETAILS",0)
            })
        });
     }
     
     function bindCategoryButton(buttonId, category){
        $(buttonId).off("click");
        $(buttonId).click(function(e){
            highlightButton("#" + e.target.id, function(){
                if (RobotStore) {
                    RobotStore.setCategory(category)
                    RobotStore.inputReceived("BUTTON_CATEGORY_CANCEL",0)
                }
            })
        });
     }

// ------- qi Session Event --------------
    
    var onConnected = function(session){
        log("onConnected")
        session.service("RobotStore").then(function (serv) {
            RobotStore = serv;
            RobotStore.onStateChanged.connect(onStateChanged)
            RobotStore.onTextDone.connect(onTextDone)
            RobotStore.onChooseApp.connect(onChooseApp)
            RobotStore.onKeywordChanged.connect(onKeywordChanged)
            RobotStore.onCategoryChanged.connect(onCategoryChanged)
            
            RobotStore.getAllCategories().then(function(cats){
                categories = cats;
                fillCategoryScreen()
            });

            session.service("ALMemory").then(function(mem) {
                mem.raiseEvent("Robot-store/WebAppLoaded", true);
            })

        });
    }
    var onError = function(){
        log("Disconnected, or failed to connect :-(")
    }
    
    $( window ).unload(function() {
    });
        
    var init = function(){
        RobotUtils.connect(onConnected, onError);
        return this;
    }
    
    return init();
}
