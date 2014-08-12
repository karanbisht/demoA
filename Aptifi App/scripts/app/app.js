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
    
    var getAdminId = function(){
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
    };
    
    function getDb(){
		return window.openDatabase("AptifiDB", "1.0", "Cordova Demo", 50000000);
    };
    
    var openDb = function() {
    	if (window.sqlitePlugin !== undefined) {
    	    app.db = window.sqlitePlugin.openDatabase("AptifiDB");
	    } else {
        	// For debugging in simulator fallback to native SQL Lite
        	app.db = window.openDatabase("AptifiDB", "1.0", "Cordova Demo", 50000000);    
    	}
	};
    
        
	var createTable = function(tx) {
        console.log("DB");
   
            tx.executeSql('CREATE TABLE IF NOT EXISTS LoginInfo(UserId INTEGER ,UserName TEXT,Email TEXT,MobileNo INTEGER,Password TEXT,Group TEXT)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS GetNotification(Id INTEGER ,Title TEXT,Message TEXT,CreatedAt TEXT)');        
            tx.executeSql('CREATE TABLE IF NOT EXISTS NotificationReply(Id INTEGER ,ReplyText TEXT,UserNameField TEXT,NotificationId TEXT,CreatedAt TEXT,UserId TEXT)');

	};	
    
    
    var goToCheckOfflineData = function(){
         console.log("1");
        db = getDb();
		db.transaction(offlineQueryLoginDB,  app.onError, app.onSuccess);
    };
    
    
    var offlineQueryLoginDB = function(tx){
            console.log("2");
    	    var query = 'SELECT * FROM LoginInfo';
			selectQuery(tx, query, offlineLoginQuerySuccess);
    };
    
    
    var offlineLoginQuerySuccess = function(tx, results) {
	count = results.rows.length;
         console.log(count);
	if (count !== 0) {
		 var Group = results.rows.item(0).Group;
        console.log(Group);
         app.mobileApp.navigate('views/activitiesView.html?LoginType=' + Group);
        
    	} else {
			
          app.mobileApp.navigate('#welcome');
	
    	}
	
	};
   
    var selectQuery = function(tx,query,successFunction){
		tx.executeSql(query, [], successFunction, onError);
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
   
    
   var onSuccess = function() {
     console.log("Your SQLite query was successful!");
   };

   var onError = function(e) {
    console.log("SQLite Error: " + e.message);
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
 	             	window.location.href = "index.html";
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

        //openDb();
        //var db = getDb();
  	  //db.transaction(createTable , onError , goToCheckOfflineData);
		//enablePushNotifications();
        
        /*
        try 
				{ 
                	pushNotification = window.plugins.pushNotification;
                	if (device.platform === 'android' || device.platform === 'Android') {
						//$("#app-status-ul").append('<li>registering android</li>');
                    	pushNotification.register(successHandler, errorHandler, {"senderID":790452394475,"ecb":"onNotificationGCM"});		// required!
					} else {
						//$("#app-status-ul").append('<li>registering iOS</li>');
                    	pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
                	}
                }
				catch(err) 
				{ 
					var txt="There was an error on this page.\n\n"; 
					txt+="Error description: " + err.message + "\n\n"; 
					alert(txt); 
				}
       */
        
        
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
        
    };
        
        
        /*if (analytics.isAnalytics()) {
            analytics.Start();
        }*/
        
        
        // Initialize AppFeedback
        /*if (app.isKeySet(appSettings.feedback.apiKey)) {
            try {
                feedback.initialize(appSettings.feedback.apiKey);
            } catch (err) {
                console.log('Something went wrong:');
                console.log(err);
            }
        } else {
            console.log('Telerik AppFeedback API key is not set. You cannot use feedback service.');
        }*/
        
        /*var networkState = navigator.connection.type;
        if (networkState === 'No network connection') {
                     navigator.notification.alert(
          'No active connection found!',
          oppenSettings,
          'Network ',
         'OK'
          );
         }*/
        
      
//      };
     
   
    
    
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
            return kendo.toString(new Date(dateString), 'MMM d, yyyy');
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
                alert('message');
            	break;
            case 'error':
                alert('GCM error = ' + e.msg);
                break;
            default:
                alert('An unknown GCM event has occurred.');
                break;
        }
    };
    
    
    
    /*
         onNotificationAPN=function(e) {
             alert("IOS"+e);
                if (e.alert) {
                     $("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
                     navigator.notification.alert(e.alert);
                }
                    
                if (e.sound) {
                    var snd = new Media(e.sound);
                    snd.play();
                }
                
                if (e.badge) {
                    pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
                }
            };
            
            // handle GCM notifications for Android

    onNotificationGCM = function(e) {
              alert(e.event);
                //$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
                
                switch( e.event )
                {
                    case 'registered':
					if ( e.regid.length > 0 )
					{
						$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
						// Your GCM push server needs to know the regID before it can push to this device
						// here is where you might want to send it the regID for later use.
						console.log("regID = " + e.regid);
					}
                    break;
                    
                    case 'message':
                    	// if this flag is set, this notification happened while we were in the foreground.
                    	// you might want to play a sound to get the user's attention, throw up a dialog, etc.
                    	if (e.foreground)
                    	{
							$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
							
							// if the notification contains a soundname, play it.
							var my_media = new Media("/android_asset/www/"+e.soundname);
							my_media.play();
						}
						else
						{	// otherwise we were launched because the user touched a notification in the notification tray.
							if (e.coldstart)
								$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
							else
							$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
						}
							
						$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
						$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
                    break;
                    
                    case 'error':
						$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
                    break;
                    
                    default:
						$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
                    break;
                }
            };
            
            tokenHandler = function(result) {
                
                alert(result);
                
                //$("#app-status-ul").append('<li>token: '+ result +'</li>');
                // Your iOS push server needs to know the token before it can push to this device
                // here is where you might want to send it the token for later use.
            };
			
            var successHandler = function(result) {
                console.log(result);
                //$("#app-status-ul").append('<li>success:'+ result +'</li>');
            };
            
            var errorHandler = function(error) {
                 console.log(error);
                //$("#app-status-ul").append('<li>error:'+ error +'</li>');
            };

    
    */
    
 /*   
         var onAndroidPushReceived = function(args) {
             //alert('Android notification received: ' + JSON.stringify(args)); 
             //alert(JSON.stringify(args.message));
             //alert(JSON.stringify(args.payload.message));
    	    };
        
        	var onIosPushReceived = function(args) {
            //alert('iOS notification received: ' + JSON.stringify(args)); 
        	};
         
         var _onDeviceIsRegistered = function() {
           // $("#initializeButton").hide();
           // $("#registerButton").hide();
           // $("#unregisterButton").show();
           // alert(successText + "Device is registered in Telerik BackEnd Services and can receive push notifications.");
        };
        
        var _onDeviceIsNotRegistered = function() {
            //$("#unregisterButton").hide();
        	//$("#registerButton").show();
            //alert(successText + "Device is not registered in Telerik BackEnd Services. Tap the button below to register it.");
        };
        
        var _onDeviceIsNotInitialized = function() {
            // $("#unregisterButton").hide();
            // $("#initializeButton").show();
            //alert("Device unregistered.<br /><br />Push token was invalidated and device was unregistered from Telerik BackEnd Services. No push notifications will be received.");
        };
        
        var _onDeviceRegistrationUpdated = function() {
            //alert("Device registration updated.");
        };
    
    
    
    	 var enablePushNotifications = function () {
            //Initialization settings    
            var pushSettings = {
                android: {
                    senderID: androidProjectNumber
                },
                iOS: {
                    badge: "true",
                    sound: "true",
                    alert: "true"
                },
                notificationCallbackAndroid : onAndroidPushReceived,
                notificationCallbackIOS: onIosPushReceived
            }
            
            //$("#initializeButton").hide();
            //$("#messageParagraph").text("Initializing push notifications...");
         
            var currentDevice = el.push.currentDevice(emulatorMode);
            
            currentDevice.enableNotifications(pushSettings)
                .then(
                    function(initResult) {
                        //$("#tokenLink").attr('href', 'mailto:test@example.com?subject=Push Token&body=' + initResult.token);
                        //alert(successText + "Checking registration status...");
                        console.log(currentDevice.getRegistration());
                        return currentDevice.getRegistration();
                    },
                    function(err) {
                       //alert("ERROR!<br /><br />An error occured while initializing the device for push notifications.<br/><br/>" + err.message);
                    }
                ).then(
                    function(registration) {                        
                        _onDeviceIsRegistered();                      
                    },
                    function(err) {                        
                        if(err.code === 801) {
                            _onDeviceIsNotRegistered();      
                        }
                        else {                        
                         //alert("ERROR!<br /><br />An error occured while checking device registration status: <br/><br/>" + err.message);
                        }
                    }
                );
         			registerInEverlive();
        };
    
    
    
    
    	var registerInEverlive = function() {
            var currentDevice = el.push.currentDevice();
            alert(currentDevice.pushToken);
            if (!currentDevice.pushToken) currentDevice.pushToken = "some token";
            el.push.currentDevice()
                .register({ Age: 15 })
                .then(
                    _onDeviceIsRegistered,
                    function(err) {
                       // alert('REGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        };
        
        var disablePushNotifications = function() {
            el.push.currentDevice()
                .disableNotifications()
                .then(
                    _onDeviceIsNotInitialized,
                    function(err) {
                      //  alert('UNREGISTER ERROR: ' + JSON.stringify(err));
                    }
                );
        };
        
        var updateRegistration = function() {
            el.push.currentDevice()
                .updateRegistration({ Age: 16 })
                .then(
                    _onDeviceRegistrationUpdated,
                    function(err) {
                      //  alert('UPDATE ERROR: ' + JSON.stringify(err));
                    }
                );
        };
    
*/
    
    var os = kendo.support.mobileOS,
        statusBarStyle = os.ios && os.flatVersion >= 700 ? 'black-translucent' : 'black';

    // Initialize KendoUI mobile application

    
    var mobileApp = new kendo.mobile.Application(document.body, {
        											 initial: "#welcome",
                                                     transition: 'slide',
                                                     statusBarStyle: statusBarStyle,
                                                     skin: 'flat'
                                                 	});

    var getYear = (function () {
        return new Date().getFullYear();
    }());

    return {
        showAlert: showAlert,
        showError: showError,
        onSuccess:onSuccess,
        onError:onError,
        getDb:getDb,
        goToCheckOfflineData:goToCheckOfflineData,
        validateMobile:validateMobile,
        validateEmail:validateEmail,
        devicePlatform:devicePlatform, 
        deviceUuid:deviceUuid,
        selectQuery:selectQuery,
        deleteQuery:deleteQuery,
        updateQuery:updateQuery,
        getAdminId:getAdminId,
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
