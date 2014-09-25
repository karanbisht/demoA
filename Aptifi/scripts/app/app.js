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
    var fp;
    var userTypeDBValue=[];
    var loginStatusDBValue;
    var adminLoginStatusDBValue;
    var account_IdDBValue;
    
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
            	
      tx.executeSql('CREATE TABLE IF NOT EXISTS PROFILE_INFO(account_id INTEGER, id INTEGER , email TEXT,first_name TEXT,last_name TEXT, mobile INTEGER, add_date TEXT , mod_date TEXT , login_status INTEGER , Admin_login_status INTEGER)');//1 for currently log in 0 or null for currently log out        
      
      tx.executeSql('CREATE TABLE IF NOT EXISTS JOINED_ORG(org_id INTEGER, org_name TEXT, role TEXT , imageSource TEXT , bagCount INTEGER , count INTEGER , lastNoti TEXT , joinedDate TEXT , orgDesc TEXT)');
        
      tx.executeSql('CREATE TABLE IF NOT EXISTS ADMIN_ORG(org_id INTEGER, org_name TEXT, role TEXT , imageSource TEXT , bagCount INTEGER , count INTEGER , lastNoti TEXT , orgDesc TEXT)');
        
      tx.executeSql('CREATE TABLE IF NOT EXISTS ORG_NOTIFICATION(org_id INTEGER,pid INTEGER, attached TEXT, message TEXT , title TEXT , comment_allow INTEGER , send_date TEXT , type TEXT)');  
        
      tx.executeSql('CREATE TABLE IF NOT EXISTS ADMIN_ORG_NOTIFICATION(org_id INTEGER,pid INTEGER, attached TEXT, message TEXT , title TEXT , comment_allow INTEGER , send_date TEXT , type TEXT , group_id INTEGER , customer_id INTEGER)');
        
      tx.executeSql('CREATE TABLE IF NOT EXISTS ADMIN_ORG_GROUP(org_id INTEGER, groupID INTEGER, org_name TEXT, group_name TEXT , group_desc TEXT , addDate TEXT )');
  
      tx.executeSql('CREATE TABLE IF NOT EXISTS ORG_NOTI_COMMENT(id INTEGER,notification_id INTEGER, comment TEXT, add_date TEXT , reply_to TEXT , reply_to_id INTEGER , user_id INTEGER , user_type TEXT)');  
    
    };	
    
    var checkForLoginStatus = function (){
		  localStorage.setItem("loginStatusCheck",0); 
          db = getDb();
		  db.transaction(loginStatusQuery, errorCB, loginStatusQuerySuccess);
    };
        
    var loginStatusQuery = function(tx){
        	var query = 'SELECT * FROM PROFILE_INFO';
			selectQuery(tx, query, loginResultSuccess);  
        
            var query = 'SELECT * FROM JOINED_ORG';
			selectQuery(tx, query, loginOrgResultSuccess);
    };
    
    var loginResultSuccess = function(tx, results) {
		var count = results.rows.length;
		if (count !== 0) {
			 loginStatusDBValue = results.rows.item(0).login_status;
             adminLoginStatusDBValue= results.rows.item(0).Admin_login_status;
             account_IdDBValue= results.rows.item(0).account_id;
        }
    };
    
     
    var loginOrgResultSuccess = function(tx, results) {
    	 userTypeDBValue=[];
        var count = results.rows.length;
		  if (count !== 0) {
             for(var i=0;i<count;i++){
                  userTypeDBValue.push(results.rows.item(i).role);
			 }
         }
    };
    
    
    var loginStatusQuerySuccess= function(){
	    console.log(loginStatusDBValue+"||"+account_IdDBValue+"||"+userTypeDBValue);
        
       if(loginStatusDBValue===1 && adminLoginStatusDBValue!==1){
            app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_IdDBValue+'&userType='+userTypeDBValue+'&from=Reload');
            localStorage.setItem("loginStatusCheck",1);
       }else if(loginStatusDBValue===1 && adminLoginStatusDBValue===1){
          var account_Id = localStorage.getItem("ACCOUNT_ID");
              app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id);
              localStorage.setItem("adminloginStatusCheck",1);    
        } else {            
            app.mobileApp.navigate('#welcome');
            localStorage.setItem("loginStatusCheck",0);
             localStorage.setItem("adminloginStatusCheck",0);
        }
	};
    
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
        alert("error--"+err.message);
 		console.log("Error processing SQL: " + err.message);
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
        
      //alert(app.mobileApp.view()['element']['0']['id']);
        
     //if(app.userPosition){        
        
     if(app.mobileApp.view()['element']['0']['id']==='welcome'){    
        	e.preventDefault();
        		navigator.notification.confirm('Do you really want to exit?', function (confirmed) {           
            	if (confirmed === true || confirmed === 1) {
                    navigator.app.exitApp();
            	}
        	}, 'Exit', ['OK', 'Cancel']);        
     //}else if(app.MenuPage){
         
     }else if(app.mobileApp.view()['element']['0']['id']==='organisationNotiList'){
             navigator.notification.confirm('Are you sure to Logout ?', function (checkLogout) {
            	if (checkLogout === true || checkLogout === 1) {
                     app.mobileApp.pane.loader.show();    
                    
                    setTimeout(function() {
                       var db = app.getDb();
                       db.transaction(updateLoginStatus, updateLoginStatusError,updateLoginStatusSuccess);
                   }, 100);
            	}
        	}, 'Logout', ['OK', 'Cancel']);

     }else if(app.mobileApp.view()['element']['0']['id']==='view-all-activities-admin'){
           var account_Id = localStorage.getItem("ACCOUNT_ID");
           var userType = localStorage.getItem("USERTYPE");   

             navigator.notification.confirm('Are you sure to Logout from Admin Panel ?', function (checkLogout) {
            	if (checkLogout === true || checkLogout === 1) {
                     app.mobileApp.pane.loader.show();    
                       var db = app.getDb();
                       db.transaction(updateAdminLoginStatus, updateAdminLoginStatusError,updateAdminLoginStatusSuccess);
            	}
        	}, 'Logout', ['OK', 'Cancel']);
   
     }else if(app.mobileApp.view()['element']['0']['id']==='organisationDiv'){
         //var tabstrip = app.mobileApp.view().header.find(".km-tabstrip").data("kendoMobileTabStrip");
         //tabstrip.clear();
         //tabstrip.switchTo("#organisationNotiList");        
         app.mobileApp.navigate("#organisationNotiList");
         
     }else if(app.mobileApp.view()['element']['0']['id']==='view-all-activities-userReply'){
         //var tabstrip = app.mobileApp.view().header.find(".km-tabstrip").data("kendoMobileTabStrip");
         //tabstrip.clear();
         //tabstrip.switchTo("#organisationNotiList");        
         app.mobileApp.navigate("#view-all-activities-admin");    
     }else {
        //navigator.app.backHistory();
         app.mobileApp.navigate("#:back");    
		}

    };
        
            function updateLoginStatus(tx) {                
                var query = "DELETE FROM PROFILE_INFO";
        	    app.deleteQuery(tx, query);

            	var query = "DELETE FROM JOINED_ORG";
	            app.deleteQuery(tx, query);

            	var query = "DELETE FROM ORG_NOTIFICATION";
	            app.deleteQuery(tx, query);
                
                var query = "DELETE FROM ORG_NOTI_COMMENT";
	            app.deleteQuery(tx, query);

	             var query = 'UPDATE PROFILE_INFO SET login_status=0';
            	 app.updateQuery(tx, query);
            }
            

            function updateLoginStatusSuccess() {
                  window.location.href = "index.html";
            }

            function updateLoginStatusError(err) {
	            console.log(err);
            }
    
    
    
    function updateAdminLoginStatus(tx) {
                
                var query = "DELETE FROM ADMIN_ORG";
        	    app.deleteQuery(tx, query);

            	var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
	            app.deleteQuery(tx, query);

            	var query = "DELETE FROM ADMIN_ORG_GROUP";
	            app.deleteQuery(tx, query);
                                                
	            var query = 'UPDATE PROFILE_INFO SET Admin_login_status=0';
            	app.updateQuery(tx, query);
            }
            

            function updateAdminLoginStatusSuccess() {
                        var account_Id = localStorage.getItem("ACCOUNT_ID");
                        var userType = localStorage.getItem("USERTYPE");   

                app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Admin');
            }

            function updateAdminLoginStatusError(err) {
	            console.log(err);
            }



     var navigateHome = function () {
            app.MenuPage=false;
            app.mobileApp.navigate('#welcome');
     };
    
    var onDeviceReady = function() {
        // Handle "backbutton" event
        document.addEventListener('backbutton', onBackKeyDown, false);
        
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
        
        navigator.splashscreen.hide();
        fixViewResize();
                
        var pushNotification = window.plugins.pushNotification;
		console.log(window.plugins);
        //alert(device.platform);
           
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
    
    
    var fileSystemSuccess = function(fileSystem){
         var directoryEntry = fileSystem.root;
         console.log(directoryEntry);
		 directoryEntry.getDirectory("Aptifi", {create: true, exclusive: false}, onDirectorySuccess, onDirectoryFail); 
         var rootdir = fileSystem.root;
         console.log(rootdir);
         fp = rootdir.fullPath;
         getfbValue();
    }
    
    var getfbValue = function(){
       var fbValue = fp;
       return fbValue;
    };
    
    function onDirectorySuccess(parent) {
            console.log(parent);
    }
 
	function onDirectoryFail(error) {
    		console.log("Unable to create new directory: " + error.code);
	}
    
    function fileSystemFail(evt) {
    		console.log(evt.target.error.code);
	}
        


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
        //alert(token);
        //alert(token.toString(16));
        localStorage.setItem("deviceTokenID",token); //token.toString(16)
        //sendTokenToServer(token.toString(16));
        addCallback('onNotificationAPN', onNotificationAPN);
    }
 
 
    var apnFailedRegistration = function(error) {
        console.log("Error: " + error.toString());
    }
    
    
    
            var messageDB;
			var orgIdDB;
			var notiIdDB;
            var typeDB;
            var titleDB;
            var attachedDB;
            var account_IdDB;
            var commentAllowDB;
            var send_DateDB;

    
 
    
    //the function is a callback when a notification from APN is received
    //var onNotificationAPN = function(e) {
        
       var onNotificationAPN = function(event) {
           
       if ( event.alert )
       {
                   
           var receivedMesage = JSON.stringify(event, null, 4);
            account_IdDB = localStorage.getItem("ACCOUNT_ID");
            var messageSplitVal = receivedMesage.split('#####');
            messageDB = messageSplitVal[0];
			orgIdDB = messageSplitVal[1];
			notiIdDB=messageSplitVal[2];
            typeDB=messageSplitVal[3];
            titleDB=messageSplitVal[4];
            attachedDB=messageSplitVal[5];
            commentAllowDB=messageSplitVal[6];
            send_DateDB= getPresentDateTime();
                        
            if(commentAllowDB===''){
                commentAllowDB=0;
            }
    
            var db = app.getDb();
			db.transaction(insertOrgNotiData, app.errorCB, goToAppPage);
       }
     };
    
    
    //the function is a callback for all GCM events
    var onNotificationGCM = function onNotificationGCM(e) {
        //alert(e);
     try{
        switch (e.event) {
            case 'registered':
                if (e.regid.length > 0) {
                    //your GCM push server needs to know the regID before it can push to this device
                    //you can store the regID for later use here
                    console.log('###token received');
                    console.log("TokenID Received" + e.regid);
                    localStorage.setItem("deviceTokenID",e.regid);
                    //sendTokenToServer(e.regid);
                }
                break;
            case 'message': 
            //alert(e.message);
            
            account_IdDB = localStorage.getItem("ACCOUNT_ID");            
            //alert(account_IdDB);
            
            var messageSplitVal = e.message.split('#####');
            messageDB = messageSplitVal[0];
			orgIdDB = messageSplitVal[1];
			notiIdDB=messageSplitVal[2];
            typeDB=messageSplitVal[3];
            titleDB=messageSplitVal[4];
            attachedDB=messageSplitVal[5];
            commentAllowDB=messageSplitVal[6];
            send_DateDB= getPresentDateTime();

            
                        
            if(commentAllowDB===''){
                commentAllowDB=0;
            }
    
            var db = app.getDb();
			db.transaction(insertOrgNotiData, app.errorCB, goToAppPage);
            
            
            //return message;
            //alert('message = '+e.message+' msgcnt = '+e.msgcnt);            
                //getPromotionFromServer();
            	break;
            case 'error':
                alert('GCM error = ' + e.msg);
                break;
            default:
                alert('An unknown GCM event has occurred.');
                break;
        }
      }
	  catch(err){
		 alert(err);
	  }
	  finally {    
		
	  }   
    };  
    
        
      function insertOrgNotiData(tx){
          alert('insert');
    	   var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,attached ,message ,title,comment_allow,type,send_date) VALUES ("'
				+ orgIdDB
				+ '","'
				+ attachedDB
				+ '","'
				+ messageDB
           	 + '","'
				+ titleDB
    	        + '","'
			    + commentAllowDB
                + '","'
				+ typeDB
                + '","'
				+ send_DateDB
				+ '")';              
                app.insertQuery(tx, query);               
      }
    
    
    function goToAppPage(){
        alert('move');
            //alert(messageDB+'title='+titleDB+'&org_id='+orgIdDB+'&notiId='+notiIdDB+'&account_Id='+account_IdDB+'&comment_allow='+commentAllowDB+'&attached='+attachedDB);            
            app.mobileApp.navigate('views/activityView.html?message='+messageDB+'&title='+titleDB+'&org_id='+orgIdDB+'&notiId='+notiIdDB+'&account_Id='+account_IdDB+'&comment_allow='+commentAllowDB+'&attached='+attachedDB);      
    }
    
    
    function checkIfFileExists(path){
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
        fileSystem.root.getFile(path, { create: false }, fileExists, fileDoesNotExist);
    }, getFSFail);
	}

    function fileExists(fileEntry){
	    console.log("File " + fileEntry.fullPath + " exists!");
	}
	
    function fileDoesNotExist(){
    	console.log("file does not exist");
	}
    
	function getFSFail(evt) {
    	console.log(evt.target.error.code);
	}
    
    
    /*
    var os = kendo.support.mobileOS,
    statusBarStyle = os.ios && os.flatVersion >= 700 ? 'black-translucent' : 'black';
	*/
    
    // Initialize KendoUI mobile application

    var loginStatusCheck = localStorage.getItem("loginStatusCheck");                             
    
    var mobileApp;
    
    console.log(loginStatusCheck);
    
    //if(loginStatusCheck==='0'){
    mobileApp = new kendo.mobile.Application(document.body, {
        											 initial: "#welcome",
                                                     transition: 'slide',
                                                     //statusBarStyle: statusBarStyle,
         											layout: "tabstrip-layout",										
                                                     skin: 'flat'
                                                 	});
   /*}else{
    mobileApp = new kendo.mobile.Application(document.body, {
        											 initial: "#organisationNotiList",
                                                     transition: 'slide',
                                                     statusBarStyle: statusBarStyle,
         											layout: "tabstrip-layout",										
                                                     skin: 'flat'
                                                 	});
       
   }*/
    
    var callOrganisationLogin = function(){
          var account_Id = localStorage.getItem("ACCOUNT_ID");
          app.MenuPage=false;	
          console.log(account_Id);
          app.mobileApp.navigate('views/organisationLogin.html?account_Id='+account_Id);
    };
    
    
    var callUserLogin = function(){
           var account_Id = localStorage.getItem("ACCOUNT_ID");
           var userType = localStorage.getItem("USERTYPE");
          app.MenuPage=false;	
          console.log(account_Id);
          app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Admin');
    };
    
    var callAdminOrganisationList = function(){
          var account_Id = localStorage.getItem("ACCOUNT_ID");
          app.userPosition=false;
          app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id);
    }; 
    
    var getPresentDateTime = function(){
          var currentDate = new Date();
          var month = currentDate.getMonth() + 1;
          var day = currentDate.getDate();
          var year = currentDate.getFullYear();
            
          var CurDateVal =year+'-'+month+'-'+day;
          var hours = currentDate.getHours();
          var minutes = currentDate.getMinutes();
          var seconds = currentDate.getSeconds();
          var time = hours + ":" + minutes + ":" + seconds;
            
          var totalTime = CurDateVal+' '+time;
          return totalTime;
    }
    
    var replyUser = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/userReplyView.html');                         
    };
    
    var sendNotification = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('views/sendNotification.html?account_Id='+account_Id);           
    };
  

    var getYear = (function () {
        return new Date().getFullYear();
    }());
    
     
    var formatDate = function (dateString) {
            var days = ["Sun","Mon","Tues","Wed","Thur","Fri","Sat"];
            var month=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var today = new Date(dateString);
			return kendo.toString(days[today.getDay()] +','+ today.getDate() +' '+ month[today.getMonth()]+' '+today.getFullYear());
            //return kendo.toString(new Date(dateString), 'MMM d, yyyy');
     }
    
    var currentDataFormate = function(){
       var days = ["Sun","Mon","Tues","Wed","Thur","Fri","Sat"];
       var month=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
       var today = new Date();
        
        return kendo.toString(days[today.getDay()] +','+ today.getDate() +' '+ month[today.getMonth()]+' '+today.getFullYear()); 
    }
      
    function timeConvert (time) {
          // Check correct time format and split into components
          time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
          if (time.length > 1) { // If time format correct
            time = time.slice (1);  // Remove full string match value
            time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
          }
          return time.join (''); // return adjusted time or original string
      }

    function isInternetConnected() {
        if((navigator.network.connection.type).toUpperCase() != "NONE" &&
           (navigator.network.connection.type).toUpperCase() != "UNKNOWN") {
        //alert("online");
            return true;
        }else {                                             //alert("offline");
            return false;
        }
     }
    
    
    
    
    
  function ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox) {

    var result = { width: 0, height: 0, fScaleToTargetWidth: true };

    if ((srcwidth <= 0) || (srcheight <= 0) || (targetwidth <= 0) || (targetheight <= 0)) {
        return result;
    }

    // scale to the target width
    var scaleX1 = targetwidth;
    var scaleY1 = (srcheight * targetwidth) / srcwidth;

    // scale to the target height
    var scaleX2 = (srcwidth * targetheight) / srcheight;
    var scaleY2 = targetheight;

    // now figure out which one we should use
    var fScaleOnWidth = (scaleX2 > targetwidth);
    if (fScaleOnWidth) {
        fScaleOnWidth = fLetterBox;
    }
    else {
       fScaleOnWidth = !fLetterBox;
    }

    if (fScaleOnWidth) {
        result.width = Math.floor(scaleX1);
        result.height = Math.floor(scaleY1);
        result.fScaleToTargetWidth = true;
    }
    else {
        result.width = Math.floor(scaleX2);
        result.height = Math.floor(scaleY2);
        result.fScaleToTargetWidth = false;
    }
    result.targetleft = Math.floor((targetwidth - result.width) / 2);
    result.targettop = Math.floor((targetheight - result.height) / 2);

    return result;
  };

    return {
        showAlert: showAlert,
        showError: showError,
        callUserLogin:callUserLogin,
        callOrganisationLogin:callOrganisationLogin,
        callAdminOrganisationList:callAdminOrganisationList,
        replyUser:replyUser,
        ScaleImage:ScaleImage,
        checkIfFileExists:checkIfFileExists,
        sendNotification:sendNotification,
        errorCB:errorCB,
        successCB:successCB,
        getPresentDateTime:getPresentDateTime,
        checkSimulator:checkSimulator,
        showNativeAlert:showNativeAlert,
        getDb:getDb,
        formatDate:formatDate,
        currentDataFormate:currentDataFormate,
        timeConvert:timeConvert,
        validateMobile:validateMobile,
        validateEmail:validateEmail,
        devicePlatform:devicePlatform, 
        deviceUuid:deviceUuid,
        selectQuery:selectQuery,
        deleteQuery:deleteQuery,
        updateQuery:updateQuery,
        insertQuery:insertQuery,
        showConfirm: showConfirm,
        isKeySet: isKeySet,
        mobileApp: mobileApp,
        checkConnection:checkConnection,
        helper: AppHelper,
        getfbValue:getfbValue,
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
