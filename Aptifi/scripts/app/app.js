//This is your Telerik BackEnd Services API key.
var baasApiKey = 'wKkFz2wbqFe4Gj0s';

//This is the scheme (http or https) to use for accessing Telerik BackEnd Services.
var baasScheme = 'http';

//This is your Android project number. It is required by Google in order to enable push notifications for your app. You do not need it for iPhone.
var androidProjectNumber = '790452394475';

//Set this to true in order to test push notifications in the emulator. Note, that you will not be able to actually receive 
//push notifications because we will generate fake push tokens. But you will be able to test your other push-related functionality without getting errors.
var emulatorMode = false;


var app = (function (win) {
    'use strict';
    
    // Global error handling
    
    //var userPosition;
    var db;
    
    
    var showAlert = function(message, title, callback) {
        navigator.notification.alert(message, callback || function () {
        }, title, 'OK');
    };

    var showError = function(message) {
        showAlert(message, 'Error');
    };

    win.addEventListener('error', function (e) {
        e.preventDefault();

        var message = e.message + "' from " + e.filename + ":" + e.lineno;

        showAlert(message, 'Error');

        return true;
    });
    
    var devicePlatform = function(){
        return device.platform;
    };
    
    var deviceUuid = function(){
        return device.uuid;
    };
    
	// Global confirm dialog
    var showConfirm = function(message, title, callback) {
        navigator.notification.confirm(message, callback || function () {
        }, title, ['OK', 'Cancel']);
    };

    var isNullOrEmpty = function (value) {
        return typeof value === 'undefined' || value === null || value === '';
    };
    
    var validateEmail = function(elementValue) {
		var emailPattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
		return emailPattern.test(elementValue);
	};

	var validateMobile= function(mobileNo) {
		var mobilePattern = /^\d{10}$/;
		return mobilePattern.test(mobileNo);
	};

    var isKeySet = function (key) {
        var regEx = /^\$[A-Z_]+\$$/;
        return !isNullOrEmpty(key) && !regEx.test(key);
    };

    var fixViewResize = function () {
        if (device.platform === 'iOS') {
            setTimeout(function() {
                $(document.body).height(window.innerHeight);
            }, 10);
        }
    };
    
    var showNativeAlert = function () {
            //if (!this.checkSimulator()) {
                alert("hello");
	            window.plugins.toast.showShortBottom('klkkkkkkk' , app.successCB , app.errorCB);
            //}
    };
    
    var checkSimulator = function() {
            if (window.navigator.simulator === true) {
                alert('This plugin is not available in the simulator.');
                return true;
            } else if (window.plugins.toast === undefined) {
                alert('Plugin not found. Maybe you are running in AppBuilder Companion app which currently does not support this plugin.');
                return true;
            } else {
                return false;
            }
        };

 
    /*var getAdminId = function(){
      var dataSource = new kendo.data.DataSource({
			  type: 'everlive',
	           transport: {
    	            typeName: 'Users'
        	    },
  			filter: { field: "Group", operator: "eq", value: "Admin" }
			});
				dataSource.fetch(function(){
					  var view = dataSource.view();
                      console.log(view);
					  console.log(view.length); // displays "1"
					  console.log(view[0].Id); // displays "Jane Doe"                    
                      localStorage.setItem("adminId",view[0].Id);
			});  
    };*/

    
    
    /*var openDb = function() {
    	if (window.sqlitePlugin !== undefined) {
    	    app.db = window.sqlitePlugin.openDatabase("AptifiDB");
	    } else {
        	// For debugging in simulator fallback to native SQL Lite
        	app.db = window.openDatabase("AptifiDB", "1.0", "Cordova Demo", 50000000);    
    	}
	};*/
    

    function getDb(){
		return window.openDatabase("AptifiDB", "1.0", "Cordova Demo", 50000000);
    };
                
	var createDB = function(tx) {
            	
      tx.executeSql('CREATE TABLE IF NOT EXISTS PROFILE_INFO(account_id INTEGER, id INTEGER , email TEXT,first_name TEXT,last_name TEXT, mobile INTEGER, add_date TEXT , mod_date TEXT , login_status INTEGER)');//1 for currently log in 0 or null for currently log out        
      
      tx.executeSql('CREATE TABLE IF NOT EXISTS JOINED_ORG(org_id INTEGER, org_name TEXT, role TEXT)');  

    };	
    
    var checkForLoginStatus = function (){
		  localStorage.setItem("loginStatusCheck",0);        
    };
        
    /*var checkForLoginStatus = function(){
        	db = getDb();
			db.transaction(loginStatusQuery, errorCB, loginStatusQuerySuccess);
    };
    
    var loginStatusQuery = function(tx){
        	var query = 'SELECT * FROM LOGIN_INFO';
			selectQuery(tx, query, loginResultSuccess);       
    };
    
    var loginResultSuccess = function(tx, results) {
		var count = results.rows.length;
   	 console.log("Storage "+count);
		if (count !== 0) {
			var loginStatus = results.rows.item(0).LOGIN_STATUS;
            app.mobileApp.navigate('views/activitiesView.html');
            localStorage.setItem("loginStatusCheck",1);
        } else {		
            app.mobileApp.navigate('#welcome');
            localStorage.setItem("loginStatusCheck",1);
        }
    };

    var loginStatusQuerySuccess= function(){
	
	};

  */
    

    
    var selectQuery = function(tx,query,successFunction){
		tx.executeSql(query, [], successFunction, errorCB);
	};

    var insertQuery = function(tx,query){
		tx.executeSql(query);	
	};
    
    var deleteQuery = function(tx,delQuery){
		tx.executeSql(delQuery);
	};
    
    var updateQuery = function(tx,updateQue){
		tx.executeSql(updateQue);
    };  
    
    var errorCB = function(err) {
 		console.log("Error processing SQL: " + err);
	};
    
	// Transaction success callback
	var successCB =function(){
		console.log("success DB Function!");
	};
    
    var checkConnection= function() {
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.NONE]     = 'No network connection';		

        	if (states[networkState] === 'No network connection') {
           	return  false;    
	    	}else{
    	       return  true;
      	  }
    };
    
    // Handle device back button tap

    var onBackKeyDown = function(e) { 
	    //var pathname = window.location.pathname;
   	 //var pageNama = pathname.slice(-10);
        //alert(app.userPosition);
        //alert(app.MenuPage);
        
     if(app.userPosition){        
        	e.preventDefault();
        		navigator.notification.confirm('Do you really want to exit?', function (confirmed) {           
            	if (confirmed === true || confirmed === 1) {
                    navigator.app.exitApp();
            	}
        	}, 'Exit', ['OK', 'Cancel']);        
     }else if(app.MenuPage){
             navigator.notification.confirm('Are you sure to Logout ?', function (checkLogout) {
            	if (checkLogout === true || checkLogout === 1) {
                     app.mobileApp.pane.loader.show();    

                    setTimeout(function() {
                   	 window.location.href = "index.html";
                   }, 100);
            	}
        	}, 'Logout', ['OK', 'Cancel']);
            
  	  }else {
        navigator.app.backHistory();
		}

    };

     var navigateHome = function () {
            app.MenuPage=false;
            app.mobileApp.navigate('#welcome');
     };
    
    var onDeviceReady = function() {
        // Handle "backbutton" event
        document.addEventListener('backbutton', onBackKeyDown, false);
        navigator.splashscreen.hide();
        fixViewResize();
                
         var pushNotification = window.plugins.pushNotification;
		 console.log(window.plugins);
           
        if (device.platform === "iOS") {
            pushNotification.register(apnSuccessfulRegistration,
            apnFailedRegistration, {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "pushCallbacks.onNotificationAPN"
            });
 
        } else {
            //register for GCM
            pushNotification.register( 
            function(id) {
                console.log("###Successfully sent request for registering with GCM.");
                //set GCM notification callback
                addCallback('onNotificationGCM', onNotificationGCM);
            },
 
            function(error) {
                console.log("###Error " + error.toString());
            }, {
                "senderID": "790452394475",
                "ecb": "pushCallbacks.onNotificationGCM"
            });
        }
        var db = getDb();
		db.transaction(createDB, errorCB, checkForLoginStatus);
    };
    
      
    
    // Handle "deviceready" event
    document.addEventListener('deviceready', onDeviceReady, false);
    // Handle "orientationchange" event
    document.addEventListener('orientationchange', fixViewResize);

    // Initialize Everlive SDK
    var el = new Everlive({
                              apiKey: appSettings.everlive.apiKey,
                              scheme: appSettings.everlive.scheme
                          });

    var emptyGuid = '00000000-0000-0000-0000-000000000000';

    var AppHelper = {
        
        // Return user profile picture url
        resolveProfilePictureUrl: function (id) {
            if (id && id !== emptyGuid) {
                return el.Files.getDownloadUrl(id);
            } else {
                return 'styles/images/avatar.png';
            }
        },

        // Return current activity picture url
        resolvePictureUrl: function (id) {
            if (id && id !== emptyGuid) {
                return el.Files.getDownloadUrl(id);
            } else {
                return '';
            }
        },

        // Date formatter. Return date in d.m.yyyy format
        formatDate: function (dateString) {
            var days = ["Sun","Mon","Tues","Wed","Thur","Fri","Sat"];
            var month=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var today = new Date(dateString);
			return kendo.toString(days[today.getDay()] +','+ today.getDate() +' '+ month[today.getMonth()]);
            //return kendo.toString(new Date(dateString), 'MMM d, yyyy');
        },
        
        

        // Current user logout
        logout: function () {
            //return el.Users.logout();
             window.location.href('index.html');
        }
    };
        
    
    var addCallback = function addCallback(key, callback) {
        if (window.pushCallbacks === undefined) {
            window.pushCallbacks = {}
        }
        window.pushCallbacks[key] = callback;
    };
 
 
    var apnSuccessfulRegistration = function(token) {
        console.log(token);
        //sendTokenToServer(token.toString(16));
        addCallback('onNotificationAPN', onNotificationAPN);
    }
 
    var apnFailedRegistration = function(error) {
        console.log("Error: " + error.toString());
    }
 
    //the function is a callback when a notification from APN is received
    var onNotificationAPN = function(e) {
        console.log(e);
        //getPromotionFromServer();
    };
 
    //the function is a callback for all GCM events
    var onNotificationGCM = function onNotificationGCM(e) {
        switch (e.event) {
            case 'registered':
                if (e.regid.length > 0) {
                    //your GCM push server needs to know the regID before it can push to this device
                    //you can store the regID for later use here
                    console.log('###token received');
                    //alert("TokenID Received" + e.regid);
                    localStorage.setItem("deviceTokenID",e.regid);
                    //sendTokenToServer(e.regid);
                }
                break;
            case 'message':
                //getPromotionFromServer();
            	break;
            case 'error':
                alert('GCM error = ' + e.msg);
                break;
            default:
                alert('An unknown GCM event has occurred.');
                break;
        }
    };  
    
    
    var os = kendo.support.mobileOS,
        statusBarStyle = os.ios && os.flatVersion >= 700 ? 'black-translucent' : 'black';

    // Initialize KendoUI mobile application

    var loginStatusCheck = localStorage.getItem("loginStatusCheck");                             
    
    var mobileApp;
    if(loginStatusCheck==='0'){
    mobileApp = new kendo.mobile.Application(document.body, {
        											 initial: "#welcome",
                                                     transition: 'slide',
                                                     statusBarStyle: statusBarStyle,
         											layout: "tabstrip-layout",										
                                                     skin: 'flat'
                                                 	});
   }else{
    mobileApp = new kendo.mobile.Application(document.body, {
        											 initial: "#welcome1",
                                                     transition: 'slide',
                                                     statusBarStyle: statusBarStyle,
         											layout: "tabstrip-layout",										
                                                     skin: 'flat'
                                                 	});
       
        }

    var getYear = (function () {
        return new Date().getFullYear();
    }());

    return {
        showAlert: showAlert,
        showError: showError,
        errorCB:errorCB,
        successCB:successCB,
        checkSimulator:checkSimulator,
        showNativeAlert:showNativeAlert,
        getDb:getDb,
        validateMobile:validateMobile,
        validateEmail:validateEmail,
        devicePlatform:devicePlatform, 
        deviceUuid:deviceUuid,
        selectQuery:selectQuery,
        deleteQuery:deleteQuery,
        updateQuery:updateQuery,
        //getAdminId:getAdminId,
        insertQuery:insertQuery,
        showConfirm: showConfirm,
        isKeySet: isKeySet,
        mobileApp: mobileApp,
        checkConnection:checkConnection,
        helper: AppHelper,
        //registerInEverlive:registerInEverlive,
        //disablePushNotifications:disablePushNotifications,
        //updateRegistration:updateRegistration,
        //enablePushNotifications:enablePushNotifications,
        //_onDeviceRegistrationUpdated:_onDeviceRegistrationUpdated,
        //_onDeviceIsNotInitialized:_onDeviceIsNotInitialized,
        //_onDeviceIsNotRegistered:_onDeviceIsNotRegistered,
        //onAndroidPushReceived:onAndroidPushReceived,
        //onIosPushReceived:onIosPushReceived,
        //_onDeviceIsRegistered:_onDeviceIsRegistered,
        everlive: el,
        getYear: getYear
    };
}(window));
