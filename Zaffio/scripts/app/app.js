$(document).ready(function() {
    $(document).ajaxError(function(e, jqxhr, settings, exception) {  
        if (jqxhr.readyState === 0 || jqxhr.status === 0) {  
            return; //Skip this error  
        }  
    }); 
}); 


var app = (function (win) {
    'use strict';
    var db;
    var fp;
    var userTypeDBValue = [];
    var loginStatusDBValue;
    var adminLoginStatusDBValue;
    var mobileApp;
    
    var INTERNET_ERROR = "Network problem. Please try again.";
    var NO_ACCESS = "You don't have access.";
    var SESSION_EXPIRE = "Your session has expired. Please re-login in Admin Panel";
    var VERIFICATION_CODE_SEND = "Verification code not sent. Please click on Regenerate Code";
    var VERIFICATION_CODE_NOT_SEND = "Verification code not sent. Please click on Regenerate Code";
    var ENTER_CORRECT_V_CODE="Incorrect Verification Code";
    var No_MEMBER_TO_ADD ="No member to add in group"; 
    var LOGIN_ANOTHER_DEVICE = "Your have logged in from another device, Please re-login.";
    var COMMENT_REPLY="Message sent successfully";
    var NOTIFICATION_MSG_NOT_SENT="Operation Failed. Please try again.";
    var NOTIFICATION_MSG_SENT="Message sent successfully";    
    var NOTIFICATION_MSG_SCHEDULED="Message scheduled successfully";
    var NEWS_ADDED_MSG="News added successfully";
    var NEWS_UPDATED_MSG="News updated successfully";
    var NEWS_EVENT_FAIL="Operation Failed. Please try again.";
    var CANNOT_CANCEL="Operation cannot be cancelled , Data sent.";
    var NEWS_DELETED_MSG="News deleted successfully";
    var EVENT_ADDED_MSG="Event added successfully";
    var EVENT_UPDATED_MSG="Event updated successfully";
    var EVENT_DELETED_MSG="Event deleted successfully";
    var GROUP_UPDATED_MSG="Group updated successfully";
    var MEMBER_DELETED_MSG="Member deleted successfully";
    var SELECT_MEMBER_TO_DELETE="Please select member to delete";
    var MEMBER_DETAIL_UPDATED_MSG="Member detatil updated successfully";
    var MEMBER_ADDED_MSG="Member added successfully";
    var FORGET_PASSWORD_CODE_SEND="Code sent at your registered number.";
    
    var serverUrl = function() {        
        return 'https://app.Zaff.io/webservice/';        
        //return 'http://54.86.57.141/webservice/';
    }

    var showAppVersion = function() {
        cordova.getAppVersion(function(version) {
            //showAlert("Current App Version: " + version , "App Version");
                             localStorage.setItem("AppVersion", version);
        });
        //alert(versionData);
    }
    
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
        console.log(message, 'Error');
        app.analyticsService.viewModel.trackException(e,'Error in Aptifi App -:'+ message);
        return true;
    });
    
    var deviceUuid = function() {
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

    var validateMobile = function(mobileNo) {
        var mobilePattern = /^\d{10}$/;
        return mobilePattern.test(mobileNo);
    };
    
    var devicePlatform = function() {
        return device.platform;
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
        window.plugins.toast.showShortBottom('klkkkkkkk' , app.successCB , app.errorCB);
    };
    
    var checkSimulator = function() {
        if (window.navigator.simulator === true) {
            //alert('This plugin is not available in the simulator.');
            return true;
        } else if (window.plugins.toast === undefined) {
            //alert('Plugin not found. Maybe you are running in AppBuilder Companion app which currently does not support this plugin.');
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

    function getDb() {
        return window.openDatabase("AptifiDB", "1.0", "Cordova Demo", 50000000);
    };
                
    var createDB = function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS PROFILE_INFO(account_id INTEGER, id INTEGER , email TEXT,first_name TEXT,last_name TEXT, mobile INTEGER, add_date TEXT , mod_date TEXT , login_status INTEGER , Admin_login_status INTEGER , profile_image TEXT)');//1 for currently log in 0 or null for currently log out        
      
        tx.executeSql('CREATE TABLE IF NOT EXISTS JOINED_ORG(org_id INTEGER, org_name TEXT, role TEXT , imageSource TEXT , bagCount INTEGER , count INTEGER , lastNoti TEXT , joinedDate TEXT , orgDesc TEXT)');

        tx.executeSql('CREATE TABLE IF NOT EXISTS JOINED_ORG_ADMIN(org_id INTEGER, org_name TEXT, role TEXT , imageSource TEXT , bagCount INTEGER , count INTEGER , lastNoti TEXT , joinedDate TEXT , orgDesc TEXT)');
  
        tx.executeSql('CREATE TABLE IF NOT EXISTS ADMIN_ORG(org_id INTEGER, org_name TEXT, role TEXT , imageSource TEXT , bagCount INTEGER , count INTEGER , lastNoti TEXT , orgDesc TEXT)');
        
        tx.executeSql('CREATE TABLE IF NOT EXISTS ORG_NOTIFICATION(org_id INTEGER,pid INTEGER, attached TEXT, message TEXT , title TEXT , comment_allow INTEGER , send_date TEXT , type TEXT , adminReply INTEGER , upload_type TEXT)');  
        
        tx.executeSql('CREATE TABLE IF NOT EXISTS ADMIN_ORG_NOTIFICATION(org_id INTEGER,pid INTEGER, attached TEXT, message TEXT , title TEXT , comment_allow INTEGER , send_date TEXT , type TEXT , group_id INTEGER , customer_id INTEGER , upload_type TEXT)');
        
        tx.executeSql('CREATE TABLE IF NOT EXISTS ADMIN_ORG_GROUP(org_id INTEGER, groupID INTEGER, org_name TEXT, group_name TEXT , group_desc TEXT , addDate TEXT )');
  
        tx.executeSql('CREATE TABLE IF NOT EXISTS ORG_NOTI_COMMENT(id INTEGER,notification_id INTEGER, comment TEXT, add_date TEXT , reply_to TEXT , reply_to_id INTEGER , user_id INTEGER , user_type TEXT)');
        
        tx.executeSql('CREATE TABLE IF NOT EXISTS EVENT(title TEXT,location TEXT, notes TEXT, startDate TEXT , endDate TEXT , startTime TEXT , endTime TEXT )');
    };	
    
    var checkForLoginStatus = function () {
        db = getDb();
        db.transaction(loginStatusQuery, errorCB, loginStatusQuerySuccess);
    };
        
    var loginStatusQuery = function(tx) {
        var query = 'SELECT * FROM PROFILE_INFO';
        selectQuery(tx, query, loginResultSuccess);  
        
        var query = 'SELECT * FROM JOINED_ORG';
        selectQuery(tx, query, loginOrgResultSuccess);
    };
    
    var loginResultSuccess = function(tx, results) {
        var count = results.rows.length;
        if (count !== 0) {
            loginStatusDBValue = results.rows.item(0).login_status;
            adminLoginStatusDBValue = results.rows.item(0).Admin_login_status;
            //account_IdDBValue = results.rows.item(0).account_id;
        }
    };
     
    var loginOrgResultSuccess = function(tx, results) {
        userTypeDBValue = [];
        var count = results.rows.length;
        if (count !== 0) {
            for (var i = 0;i < count;i++) {
                userTypeDBValue.push(results.rows.item(i).role);
            }
        }
    };
    
    var loginStatusQuerySuccess = function() {        
        //console.log(loginStatusDBValue + "||" + account_IdDBValue + "||" + userTypeDBValue);        
        if (loginStatusDBValue===1 && adminLoginStatusDBValue!==1) {
            //app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_IdDBValue+'&userType='+userTypeDBValue+'&from=Reload');
            localStorage.setItem("loginStatusCheck", 1);
        }else if (loginStatusDBValue===1 && adminLoginStatusDBValue===1) {
            //var account_Id = localStorage.getItem("ACCOUNT_ID");
            //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id);
            localStorage.setItem("loginStatusCheck", 2);    
        } else {            
            //app.mobileApp.navigate('index.html');
            localStorage.setItem("loginStatusCheck", 0);
            localStorage.setItem("adminloginStatusCheck", 0);
        }        
            navigator.splashscreen.hide();
    };
    
    var selectQuery = function(tx, query, successFunction) {
        tx.executeSql(query, [], successFunction, errorCB);
    };

    var insertQuery = function(tx, query) {
        tx.executeSql(query);	
    };
    
    var deleteQuery = function(tx, delQuery) {
        tx.executeSql(delQuery);
    };
    
    var updateQuery = function(tx, updateQue) {
        tx.executeSql(updateQue);
    };  
    
    var errorCB = function(err) {        
       console.log("Error processing SQL: " + JSON.stringify(err));
       app.analyticsService.viewModel.trackException(err,"Error in Sqlite local Storage processing");
    };
    
    // Transaction success callback
    var successCB = function() {
        console.log("success DB Function!");
    };
    
    var checkConnection = function() {
    if(typeof navigator.connection.type !== "undefined")
    {
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection';		

        if (states[networkState] === 'No network connection') {
            return false;    
        }
        
    }
            return true;
    };
    
    var onBackKeyDown = function(e) { 
        if (app.mobileApp.view()['element']['0']['id']==='welcome') {    
             e.preventDefault();           
             navigator.app.exitApp();

        }else if (app.mobileApp.view()['element']['0']['id']==='organisationNotiList') {
            e.preventDefault();            
            navigator.app.exitApp();

            
            
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-GroupDetail') {
        
        }else if (app.mobileApp.view()['element']['0']['id']==='profileDiv') {
            app.mobileApp.navigate("#organisationNotiList");      
        }else if (app.mobileApp.view()['element']['0']['id']==='organisationDiv') {
            app.mobileApp.navigate("#organisationNotiList");         
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-userReply') {
            app.mobileApp.navigate("#view-all-activities-admin");          
        }else if (app.mobileApp.view()['element']['0']['id']==='groupMemberShow') {
            app.mobileApp.navigate("#view-all-activities-GroupDetail");
        }else if (app.mobileApp.view()['element']['0']['id']==='subGroupMemberShow') {
            app.mobileApp.navigate('views/subGroupDetailView.html');
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-Group') {
            app.mobileApp.navigate('views/groupListPage.html');
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-GroupList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');    
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-GroupDetail') {
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEventCalendar') {
            app.mobileApp.navigate('#adminEventList');     
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEventCalendarDetail' || app.mobileApp.view()['element']['0']['id']==='adminAddEventCalendar') {
            app.mobileApp.navigate('#adminEventList');  
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEditEventCalendar') {
            app.mobileApp.navigate('#adminEventList');     
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEventList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');  
        }else if (app.mobileApp.view()['element']['0']['id']==='adminOrgNewsList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');                      
        }else if (app.mobileApp.view()['element']['0']['id']==='adminAddNews') {
            app.mobileApp.navigate('#adminOrgNewsList');
            $("#adminAddNews").data("kendoMobileModalView").close();
        }else {
            app.mobileApp.navigate("#:back");    
        }
    };
        
    function updateLoginStatus(tx) {                
        var query = "DELETE FROM PROFILE_INFO";
        app.deleteQuery(tx, query);

        var query = "DELETE FROM JOINED_ORG";
        app.deleteQuery(tx, query);

        var query = "DELETE FROM JOINED_ORG_ADMIN";
        app.deleteQuery(tx, query);
                
        var query = "DELETE FROM ORG_NOTIFICATION";
        app.deleteQuery(tx, query);
                
        var query = "DELETE FROM ORG_NOTI_COMMENT";
        app.deleteQuery(tx, query);
                
        var query = "DELETE FROM ADMIN_ORG";
        app.deleteQuery(tx, query);

        var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
        app.deleteQuery(tx, query);

        var query = "DELETE FROM ADMIN_ORG_GROUP";
        app.deleteQuery(tx, query);

        var query = 'UPDATE PROFILE_INFO SET login_status=0';
        app.updateQuery(tx, query);
    }

    function updateLoginStatusSuccess() {
        localStorage.setItem("loginStatusCheck", 0);
        window.location.href = "index.html";
    }

    function updateLoginStatusError(err) {
        //console.log(err);
    }
    
    function updateAdminLoginStatus(tx) {
        /*var query = "DELETE FROM ADMIN_ORG";
        app.deleteQuery(tx, query);
        var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
        app.deleteQuery(tx, query);
        var query = "DELETE FROM ADMIN_ORG_GROUP";
        app.deleteQuery(tx, query);*/
        var query = 'UPDATE PROFILE_INFO SET Admin_login_status=0';
        app.updateQuery(tx, query);
    }

    function updateAdminLoginStatusSuccess() {
        var account_Id = localStorage.getItem("ACCOUNT_ID");
        var userType = localStorage.getItem("USERTYPE");   
        
        app.mobileApp.navigate('#organisationNotiList');
        //app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Admin');
    }

    function updateAdminLoginStatusError(err) {
        //console.log(err);
    }

    var navigateHome = function () {
        app.MenuPage = false;
        app.mobileApp.navigate('#welcome');
    };
    
    //console.log(loginStatusCheck);
    
    //if(loginStatusCheck==='0'){
    
    /*mobileApp = new kendo.mobile.Application(document.body, {
    //transition: 'slide',
    //statusBarStyle: statusBarStyle,
    //loading: "<h1>Please wait...</h1>",
    //layout: "tabstrip-layout",										
    skin: 'flat'
    });*/
    
    var Keyboardisoff = function() {
      $("#single-activity").find(".km-scroll-container").css("-webkit-transform", "translate3d(0px, 0px, 0px)");        
    };
    
    var onDeviceReady = function() {
        //[data-role=footer]        
        feedback.initialize('8f965ba0-a6d8-11e4-962d-15be4c73b66b');
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByHexString('#000000');
        document.addEventListener('backbutton', onBackKeyDown, false);
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("hidekeyboard", Keyboardisoff, false);
        
        /*document.addEventListener("showkeyboard", function(){ $(".footer").hide();}, false);
        document.addEventListener("hidekeyboard", function(){ $(".footer").show();}, false);*/        
        
        window.requestFileSystem(window.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);
        
        //fixViewResize();
        
        
        //console.log(window.plugins);
        
        var pushNotification = window.plugins.pushNotification;   
        
         if(navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(oncallback);
        }
        else
        {
            app.analyticsService.viewModel.setAnalyticMonitor();
        }
                
        if (device.platform === "iOS") {
            localStorage.setItem("DEVICE_TYPE", "AP");

            pushNotification.register(apnSuccessfulRegistration,
                                      apnFailedRegistration, {
                                          "badge": "true",
                                          "sound": "true",
                                          "alert": "true",
                                          "ecb": "pushCallbacks.onNotificationAPN"
                                      });
        } else {
            localStorage.setItem("DEVICE_TYPE", "AN");

            
            pushNotification.register(
                function(id) {
                    addCallback('onNotificationGCM', onNotificationGCM);
                },
 
                function(error) {
                    //alert("###Error " + error.toString());
                }, {
                    "senderID": "995203039585",
                    "ecb": "pushCallbacks.onNotificationGCM"
                });
        }
        var db = getDb();
        db.transaction(createDB, errorCB, checkForLoginStatus);
        
        //navigator.splashscreen.hide();
    };    
    
    
    var oncallback = function(position)
    {
        var latitude = position.coords.latitude,
            longitude = position.coords.longitude;
        app.analyticsService.viewModel.setAnalyticMonitor(latitude,longitude);
    };
    
    var onPause = function(e){
        app.analyticsService.viewModel.trackFeature("Detect Status.App is running in background");
        app.analyticsService.viewModel.monitorStop();
    };
    
    var onResume = function(){ 
        app.analyticsService.viewModel.monitorStart();
        app.analyticsService.viewModel.trackFeature("Detect Status.App is running in foreground");
        var loginStatus = localStorage.getItem("loginStatusCheck");
        
        if(loginStatus !== '0' || loginStatus !== 0)
        {
            app.analyticsService.viewModel.setInstallationInfo(localStorage.getItem("username"));
        }
        else
        {
            app.analyticsService.viewModel.setInstallationInfo("Anonymous User");
        }       
        
        
        if(loginStatus!==0 && loginStatus!=='0'){

                var device_id = localStorage.getItem("deviceTokenID");
                var account_Id = localStorage.getItem("ACCOUNT_ID");
        
        
                var dataSourceLogin = new kendo.data.DataSource({
                    transport: {
                    read: {
                                                                            url: app.serverUrl() + "customer/isActive/"+account_Id+"/"+device_id,
                                                                            type:"POST",
                                                                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                        }
                },
                                                                schema: {
                    data: function(data) {	
                        console.log(data);
                        console.log(JSON.stringify(data));
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(e);
                                                                    console.log(JSON.stringify(e));
                                                                    /*if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
                                                                        app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                    }*/              
                                                                }               
                                                            });  
	            
                dataSourceLogin.fetch(function() {
                    var data = this.data();     
                    console.log(JSON.stringify(data));
                //$.each(loginDataView, function(i, loginData) {
                    //console.log(loginData.status[0].Msg);
                               
                    if (data[0]['status'][0].Msg==='Fail') {                        
                        console.log('fail');                        
                        if (!app.checkSimulator()) {
                                  window.plugins.toast.showLongBottom(app.LOGIN_ANOTHER_DEVICE);  
                        }else {
                                 app.showAlert(app.LOGIN_ANOTHER_DEVICE , 'Notification');  
                        }                        
                        var db = app.getDb();
                        db.transaction(updateLoginStatus, updateLoginStatusError, updateLoginStatusSuccess);  
                        updateLoginStatusSuccess();                 
                    }                    
               });
            
            }
    };
    
    
    /*function successHandler (result) {
        //alert('result = ' + result);
    }
    
    function errorHandler (error) {
        //alert('error = ' + error);
    }*/
       
    // Handle "deviceready" event
    document.addEventListener('deviceready',onDeviceReady, false);    
    
    // Handle "orientationchange" event
    document.addEventListener('orientationchange', fixViewResize);
    
    var fileSystemSuccess = function(fileSystem) {
        //alert(fileSystem.name);
        //var directoryEntry = fileSystem.root;
        //console.log(directoryEntry);
        var rootdir = fileSystem.root;
        //console.log(rootdir);
        fp = rootdir.toURL();        
        //alert(fp);
        //alert(fileSystem.root.fullPath);        
        directoryEntry.getDirectory("Zaffio", {create: true, exclusive: false}, onDirectorySuccess, onDirectoryFail); 
        getfbValue();

    }
    
    var getfbValue = function() {
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
        alert(evt.target.error.code);
        console.log(evt.target.error.code);
    }

    // Initialize Everlive SDK
    /* var el = new Everlive({
    apiKey: appSettings.everlive.apiKey,
    scheme: appSettings.everlive.scheme
    });*/

    var emptyGuid = '00000000-0000-0000-0000-000000000000';

    var AppHelper = {
        
        // Return user profile picture url
        resolveProfilePictureUrl: function (id) {
            if (id && id !== emptyGuid) {
                //return el.Files.getDownloadUrl(id);
            } else {
                return 'styles/images/avatar.png';
            }
        },

        // Return current activity picture url
        resolvePictureUrl: function (id) {
            if (id && id !== emptyGuid) {
                //return el.Files.getDownloadUrl(id);
            } else {
                return '';
            }
        },

        // Date formatter. Return date in d.m.yyyy format
        formatDate: function (dateString) {
            var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var today = new Date(dateString);
            return kendo.toString(days[today.getDay()] + ',' + today.getDate() + ' ' + month[today.getMonth()]);
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
        localStorage.setItem("deviceTokenID", token); //token.toString(16)
        //sendTokenToServer(token.toString(16));
        addCallback('onNotificationAPN', onNotificationAPN);
    }
 
    var apnFailedRegistration = function(error) {
        console.log("Error: " + error.toString());
        app.analyticsService.viewModel.trackException(error,"Error in APN PUSH Registration : " + error.toString());
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
    var notificationMsg;
    var sendDateInside; 
    var uploadTypeNoti;
    
    //the function is a callback when a notification from APN is received
    //var onNotificationAPN = function(e) {
        
    var onNotificationAPN = function(event) {
        //console.log(JSON.stringify(event));           
        if (event.id) {                   
            //var receivedMesage = JSON.stringify(event.id, null, 4);
            //console.log(receivedMesage);
            account_IdDB = localStorage.getItem("ACCOUNT_ID");
           
            var messageSplitVal = event.id.split('#####');
            
            //alert(messageSplitVal);
                      
            messageDB = messageSplitVal[0];
            orgIdDB = messageSplitVal[1];
            notiIdDB = messageSplitVal[2];
            typeDB = messageSplitVal[3];
            titleDB = messageSplitVal[4];
            attachedDB = messageSplitVal[5];
            commentAllowDB = messageSplitVal[6];
            notificationMsg = messageSplitVal[7];
            uploadTypeNoti = messageSplitVal[8];

                        
            //send_DateDB= getPresentDateTime();
            send_DateDB = getPresntTimeStamp();   

            sendDateInside = timeConverter(send_DateDB);
          
            if (typeDB!=='Add Customer') {
                if (commentAllowDB==='') {
                    commentAllowDB = 0;
                }
                        
                //console.log("RECEIVED VALUE------------------------");
                //console.log(messageDB + "||" + orgIdDB + "||" + notiIdDB + "||" + typeDB + "||" + titleDB + "||" + attachedDB + "||" + commentAllowDB + "||" + notificationMsg + "||" + send_DateDB);
            
                navigator.notification.confirm(titleDB, function (confirmed) {           
                    if (confirmed === true || confirmed === 1) {
                        if (typeDB!=='Reply') {
                            var db = app.getDb();
                            db.transaction(insertOrgNotiDataBagINC, app.errorCB, goToAppPage);    
                        }else {
                            typeDB = "Reply";
                            var temp;
                            temp = messageDB;
                            messageDB = notificationMsg;
                            notificationMsg = temp;
                            goToAppPage();                    
                        }    
                    }else {
                        //alert(typeDB);
                        //alert('else');
                        
                        //var db = app.getDb();
                        //db.transaction(insertOrgNotiData, app.errorCB, app.successCB);  
                        
                            if (typeDB!=='Reply') {
                                var db = app.getDb();
                                db.transaction(insertOrgNotiData, app.errorCB, app.successCB);
                            }else{   
                                var db = app.getDb();
                                db.transaction(insertCommentCount, app.errorCB, app.successCB);            
                            }
                    }
                }, 'Notification', ['View', 'Close']);        
            }else {
                showAlert(messageDB , "Notification");
            } 
         }
    };
    
    //the function is a callback for all GCM events
    var onNotificationGCM = function(e) {
        //alert(JSON.stringify(e));
        try {
            switch (e.event) {
                case 'registered':
                    if (e.regid.length > 0) {
                        console.log("TokenID Received" + e.regid);
                        localStorage.setItem("deviceTokenID", e.regid);
                    }
                    break;
                case 'message':             
                    account_IdDB = localStorage.getItem("ACCOUNT_ID");                         
                    var messageSplitVal = e.payload.default.split('#####');
                                               
                    messageDB = messageSplitVal[0];
                    orgIdDB = messageSplitVal[1];
                    notiIdDB = messageSplitVal[2];
                    typeDB = messageSplitVal[3];
                    titleDB = messageSplitVal[4];
                    attachedDB = messageSplitVal[5]; 
                    commentAllowDB = messageSplitVal[6];   
                    notificationMsg = messageSplitVal[7];
                    uploadTypeNoti = messageSplitVal[8];
                    
                    
                    send_DateDB = getPresntTimeStamp();          
                    sendDateInside = timeConverter(send_DateDB);
                            
                    if (typeDB!=='Add Customer') {
                        
                        if (attachedDB=== 0 || attachedDB=== "0") {
                            attachedDB = '';
                        }
                        
                        if (e.foreground) {
                            if (typeDB!=='Reply') {
                                var db = app.getDb();
                                db.transaction(insertOrgNotiData, app.errorCB, app.successCB);
                            }else{   
                                var db = app.getDb();
                                db.transaction(insertCommentCount, app.errorCB, app.successCB);            
                            }
                        }else {
                            if (typeDB!=='Reply') {
                                var db = app.getDb();
                                db.transaction(insertOrgNotiDataBagINC, app.errorCB, goToAppPage);    
                            }else {
                                typeDB = "Reply";
                                var temp;
                                temp = messageDB;
                                messageDB = notificationMsg;
                                notificationMsg = temp;
                                goToAppPage();                                
                            }    
                        }
                    } 
                    break;
                case 'error':
                        app.analyticsService.viewModel.trackException(e,"Error in GCM PUSH Registration : " + e.msg);
                    break;
                default:
                    break;
            }
        } catch (err) {
                   app.analyticsService.viewModel.trackException(e,"Error in GCM PUSH Registration : " + err);
        }
        finally {    
        }   
    };  
    

    function insertCommentCount(tx) {
            var query = "UPDATE ORG_NOTIFICATION SET adminReply= adminReply+1 where org_id='" + orgIdDB + "' and pid='"+notiIdDB+"'";
            app.updateQuery(tx, query);
    }

        
    function insertOrgNotiData(tx) {
        messageDB = app.urlEncode(messageDB);
        titleDB = app.urlEncode(titleDB);
        notificationMsg = app.urlEncode(notificationMsg);
                            
        var queryUpdate = "UPDATE JOINED_ORG SET count=count+1 , lastNoti='" + messageDB + "' where org_id=" + orgIdDB;
        app.updateQuery(tx, queryUpdate);          
          
        var queryDelete = "DELETE FROM ORG_NOTIFICATION where pid =" + notiIdDB;
        app.deleteQuery(tx, queryDelete);         
          
        var query = 'INSERT INTO ORG_NOTIFICATION(org_id,attached,message,title,comment_allow,type,send_date,pid,upload_type) VALUES ("'
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
                    + '","'
                    + notiIdDB
                    + '","'
                    + uploadTypeNoti
                    + '")';              
        app.insertQuery(tx, query);               
    }
    
    function insertOrgNotiDataBagINC(tx) {
    
        messageDB = app.urlEncode(messageDB);
        titleDB = app.urlEncode(titleDB);
        notificationMsg = app.urlEncode(notificationMsg);

        var queryUpdate = "UPDATE JOINED_ORG SET count=count+1 , bagCount=bagCount+1 , lastNoti='" + messageDB + "' where org_id=" + orgIdDB;
        app.updateQuery(tx, queryUpdate);          
          
        var queryDelete = "DELETE FROM ORG_NOTIFICATION where pid =" + notiIdDB;
        app.deleteQuery(tx, queryDelete);   

        var query = 'INSERT INTO ORG_NOTIFICATION(org_id,attached,message,title,comment_allow,type,send_date,pid,upload_type) VALUES ("'
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
                    + '","'
                    + notiIdDB
                    + '","'
                    + uploadTypeNoti
                    + '")';              
        app.insertQuery(tx, query);               
    }
    
    function goToAppPage() {        
        //console.log('DATA VALUE4');

        var db = app.getDb();
        db.transaction(updatebagCount, app.errorCB, app.successCB);
          
        //alert(messageDB+'title='+titleDB+'&org_id='+orgIdDB+'&notiId='+notiIdDB+'&account_Id='+account_IdDB+'&comment_allow='+commentAllowDB+'&attached='+attachedDB);            
        //console.log('karrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrraaaaaaaaaaaaaannnnnnn');    
        //alert('message='+messageDB+'&title='+titleDB+'&org_id='+orgIdDB+'&notiId='+notiIdDB+'&account_Id='+account_IdDB+'&comment_allow='+commentAllowDB+'&attached='+attachedDB);

        var messageDBVal = app.urlEncode(messageDB); 
        var titleDBVal = app.urlEncode(titleDB);
         
        //console.log('go to page');     
        app.mobileApp.navigate('views/activityView.html?message=' + messageDBVal + '&title=' + titleDBVal + '&org_id=' + orgIdDB + '&notiId=' + notiIdDB + '&account_Id=' + account_IdDB + '&comment_allow=' + commentAllowDB + '&attached=' + attachedDB + '&type=' + typeDB + '&date=' + sendDateInside+ '&upload_type=' + uploadTypeNoti);
    }
    
    function updatebagCount(tx) {
        var queryUpdate = "UPDATE JOINED_ORG SET bagCount=bagCount+1 where org_id=" + orgIdDB;
        app.updateQuery(tx, queryUpdate);          
    }
    
    function checkIfFileExists(path) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            fileSystem.root.getFile(path, { create: false }, fileExists, fileDoesNotExist);
        }, getFSFail);
    }

    function fileExists(fileEntry) {
        console.log("File " + fileEntry.fullPath + " exists!");
    }
	
    function fileDoesNotExist() {
        console.log("file does not exist");
    }
    
    function getFSFail(evt) {
        console.log(evt.target.error.code);
    }
    
    function urldecode(str) {
        return decodeURIComponent((str + '').replace(/\+/g, '%20'));
    }

    function urlEncode(str) {
        return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
    }
    
    function proURIDecoder(val) {
        val = val.replace(/\+/g, '%20');
        var str = val.split("%");
        var cval = str[0];
        for (var i = 1;i < str.length;i++) {
            cval+=String.fromCharCode(parseInt(str[i].substring(0, 2), 16)) + str[i].substring(2);
        }

        return cval;
    }
    
    /*
    var os = kendo.support.mobileOS,
    statusBarStyle = os.ios && os.flatVersion >= 700 ? 'black-translucent' : 'black';
    */
    
    // Initialize KendoUI mobile application

    var loginStatusCheck = localStorage.getItem("loginStatusCheck");                             
    
    //console.log(loginStatusCheck);
    
    //alert(loginStatusCheck);
    
    if (loginStatusCheck==='0' || loginStatusCheck===null) {    
        mobileApp = new kendo.mobile.Application(document.body, {
                                                     initial: "#welcome",
                                                     skin: 'flat'                                                       
                                                 });
    }else if (loginStatusCheck==='1') {
        mobileApp = new kendo.mobile.Application(document.body, {
                                                     initial: "#organisationNotiList",
                                                     skin: 'flat'
                                                 });
    }else if (loginStatusCheck==='2') {
        mobileApp = new kendo.mobile.Application(document.body, {
                                                     initial: "#view-all-activities-GroupDetail",
                                                     skin: 'flat'
                                                 });       
    }
    
    var callOrganisationLogin = function() {
        var account_Id = localStorage.getItem("ACCOUNT_ID");
        app.MenuPage = false;	
        //console.log(account_Id);
        app.mobileApp.navigate('views/organisationLogin.html?account_Id=' + account_Id);
        //app.mobileApp.navigate('#organisationNotiList');
    };
       
    var callUserLogin = function() {
        var account_Id = localStorage.getItem("ACCOUNT_ID");
        var userType = localStorage.getItem("USERTYPE");
        app.MenuPage = false;	
        //console.log(account_Id);
        //app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Admin');
        
         app.mobileApp.navigate('#organisationNotiList');
         //app.slide('right', 'green' ,'3' ,'#organisationNotiList');
    };
    
    var callAdminOrganisationList = function() {
        var account_Id = localStorage.getItem("ACCOUNT_ID");
        app.userPosition = false;
        //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id);
        //app.mobileApp.navigate('#view-all-activities-admin'); 
         app.mobileApp.navigate('#view-all-activities-GroupDetail');
         //app.slide('right', 'green' ,'3' ,'#view-all-activities-GroupDetail');
    }; 
    
    var getPresentDateTime = function() {
        var currentDate = new Date();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var year = currentDate.getFullYear();
        if (day < 10) {
            day = '0' + day;
        }
        var CurDateVal = year + '-' + month + '-' + day;
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();
        var seconds = currentDate.getSeconds();
        var time = hours + ":" + minutes + ":" + seconds;            
        var totalTime = CurDateVal + ' ' + time;
        return totalTime;
    }
    
    var getCurrentDateTime = function() {
        var currentDate = new Date();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var year = currentDate.getFullYear();
        /*if (day < 10) {
            day = '0' + day;
        }*/
        var CurDateVal = month + '/' + day + '/' + year;

        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();
        

        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        
        var dayNight = hours < 12 ? ' AM' : ' PM'; 
        
        if (hours > 12) {
            hours = hours - 12;
        }        
        var time = hours + ":" + minutes + dayNight;            
        var totalTime = CurDateVal+'||'+time;
        return totalTime;
    }
    
    var getSendNotiDateTime = function() {

        var currentDate = new Date();
        
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var year = currentDate.getFullYear();
              
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();        
        
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        /*if (hours!=='12' && hours!==12) {
            hours = parseInt(hours) + 12;
        }*/        
        
        var second="00";
        
        var totalTime = year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + second;
        return totalTime;
    }
    
    var getPresentDate = function() {
        var currentDate = new Date();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var year = currentDate.getFullYear();
        if (month < 10) {
            month = '0' + month;
        }           
        var CurDateVal = month + '/' + day + '/' + year;
        return CurDateVal;
    }
    
    var replyUser = function() {
        app.MenuPage = false;	
        app.mobileApp.navigate('views/userReplyView.html');                         
    };
    
    var sendNotification = function() {
        app.MenuPage = false;
        app.mobileApp.navigate('views/sendNotification.html?account_Id=' + account_Id);           
    };

    var getYear = (function () {
        return new Date().getFullYear();
    }());
     
    var formatDate = function (dateString) {
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var today = new Date(dateString);
        return kendo.toString(days[today.getDay()] + ',' + today.getDate() + ' ' + month[today.getMonth()] + ' ' + today.getFullYear());
        //return kendo.toString(new Date(dateString), 'MMM d, yyyy');
    }
    
    
     var getDateDays = function (dateString) {
        var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var today = new Date(dateString);
        return kendo.toString(days[today.getDay()]);
    }
    
    var getDateMonth = function (dateString) {
        var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        var today = new Date(dateString);
        return kendo.toString(month[today.getMonth()]+ ' ' + today.getFullYear());
    }
    
    var currentDataFormate = function() {
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var today = new Date();     
        return kendo.toString(days[today.getDay()] + ',' + today.getDate() + ' ' + month[today.getMonth()] + ' ' + today.getFullYear()); 
    }
      
    function timeConvert (time) {
        // Check correct time format and split into components
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
        if (time.length > 1) { // If time format correct
            time = time.slice(1);  // Remove full string match value
            time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
            time[0] = +time[0] % 12 || 12; // Adjust hours
        }
        return time.join(''); // return adjusted time or original string
    }

    function isInternetConnected() {
        if ((navigator.network.connection.type).toUpperCase() !== "NONE" &&
            (navigator.network.connection.type).toUpperCase() !== "UNKNOWN") {
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
        } else {
            fScaleOnWidth = !fLetterBox;
        }

        if (fScaleOnWidth) {
            result.width = Math.floor(scaleX1);
            result.height = Math.floor(scaleY1);
            result.fScaleToTargetWidth = true;
        } else {
            result.width = Math.floor(scaleX2);
            result.height = Math.floor(scaleY2);
            result.fScaleToTargetWidth = false;
        }
        result.targetleft = Math.floor((targetwidth - result.width) / 2);
        result.targettop = Math.floor((targetheight - result.height) / 2);

        return result;
    };

    var gobackTOCalendar = function() {
        app.mobileApp.navigate('#eventCalendar');
    }
    
    var convertTimeSpan = function(timeSpanVal) {
        var date = new Date(timeSpanVal * 1000);                    
               
        var hours = date.getHours();
        // minutes part from the timestamp
        
        var minutes = "0" + date.getMinutes();
        // seconds part from the timestamp
        var seconds = "0" + date.getSeconds();
        // will display time in 10:30:23 format
        var formattedTime = hours + ':' + minutes.substr(minutes.length - 2) + ':' + seconds.substr(seconds.length - 2);                 
        //alert(formattedTime);
    }
    
    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
     
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var day = days[a.getDay()];                      
        var hour = a.getHours();
        var min = a.getMinutes();
        var dayNight = hour < 12 ? ' AM' : ' PM'; // Set AM/PM

        if (hour > 12) {
            hour = hour - 12;
        }
   
        if (min < 10) {
            min = '0' + min;  
        }      
     
        //var sec = a.getSeconds();
        
        var time = day + ', ' + date + ' ' + month + ' ' + year + ', ' + hour + ':' + min + ' ' + dayNight ;        
        return time;
    }
   
    var getPresntTimeStamp = function() {
        var ts = Math.round((new Date()).getTime() / 1000);
        return ts;            
    }
    
    var formatTime = function(timeString){        
        var split = timeString .split(':');
        //console.log(split[0] + " || " + split[1]);
   
        var dayNight = split[0] < 12 ? 'am' : 'pm'; // Set AM/PM

        if (split[0] > 12) {
            split[0] = split[0] - 12;
        }
   
        /*if (split[1] < 10) {
            split[1] = '0' + split[1];  
        }*/      
     
        //var sec = a.getSeconds();
        
        var time = split[0] + ':' + split[1] + ' ' + dayNight ;        
        return time;

    }
    
    function slide(direction, color, slowdownfactor, hrf) {
        if (!hrf) {
            setTimeout(function () {
                // update the page inside this timeout
                document.querySelector("#title").innerHTML = direction;
                document.querySelector("html").style.background = color;
            }, 20);
        }
        // not passing in options makes the plugin fall back to the defaults defined in the JS API
        var theOptions = {
            'direction': direction,
            'duration': 700,
            'slowdownfactor' : slowdownfactor,
            'iosdelay'       :  100, // ms to wait for the iOS webview to update before animation kicks in, default 50
            'androiddelay'   :  150,   
            'href': hrf
        };
        
        if(!checkSimulator()){
        
           window.plugins.nativepagetransitions.slide(
            theOptions,
            function () {
                console.log('------------------- slide transition finished');
            },
            function (msg) {

                app.mobileApp.navigate(hrf);  
                //alert('error: ' + msg);
            });
            
        }else{
            
             app.mobileApp.navigate(hrf);  
        }    
    }
    
    
      function flip(direction, color, href) {
    setTimeout(function () {
      // update the page inside this timeout
      document.querySelector("#title").innerHTML = direction;
      document.querySelector("html").style.background = color;
    }, 10);
          
   if(!checkSimulator()){
       
    window.plugins.nativepagetransitions.flip({
          'direction': direction,
          'duration': 700,
          'iosdelay': 20,
          'href': href
        },
        function () {
          console.log('------------------- flip transition finished');
        },
        function (msg) {
          //alert('error: ' + msg);
          app.mobileApp.navigate(href);  

        });
       
     }else{
         app.mobileApp.navigate(href);  
     }  
  }

    //purple
  // demo for hooking the Android backbutton to the slide 'right'

    /*document.addEventListener('backbutton', function() {
        slide('right', 'green');
    }, false);*/
    
    
    
    function htmlDecode(value) {
	if (value) {
		return $('<div />').html(value).text();
	} else {
		return '';
	}
    }
    
    
   function toTitleCase(name , idVal) {
	var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;
	var answer = name.value.replace(/([^\W_]+[^\s-]*) */g, function(match, p1, index, title) {
		if (index > 0 && index + p1.length !== title.length && p1.search(smallWords) > -1 && title.charAt(index - 2) !== ":" && title.charAt(index - 1).search(/[^\s-]/) < 0) {
			return match.toLowerCase();
		}

		if (p1.substr(1).search(/[A-Z]|\../) > -1) {
			return match;
		}
		return match.charAt(0).toUpperCase() + match.substr(1);
	});
	document.getElementById(idVal).value = answer;
   }
    
    

    
       function LogoutFromAdmin(){
                
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');
                } 
            }else { 
                    var dataSourceLogin = new kendo.data.DataSource({
                                                                        transport: {
                            read: {
                                                                                    url: app.serverUrl() + "organisation/orgAdminLogout",
                                                                                    type:"POST",
                                                                                    dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                }
                        },
                                                                        schema: {
                            data: function(data) {
                                console.log(data);
                                return [data];
                            }
                        },
                                                                        error: function (e) {
                                                                            
                                                                            //console.log(JSON.stringify(e));
                                                                         
                                                                            //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
                                                                            
                                                                            if (!app.checkSimulator()) {
                                                                                window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                            }else {
                                                                                app.showAlert("Network problem . Please try again later", "Notification");  
                                                                            }
                                                                            
                                                                            //navigator.notification.alert("Please check your internet connection.",
                                                                            //function () { }, "Notification", 'OK');
                                                                        }               
                                                                    });  
	            
                    dataSourceLogin.fetch(function() {
                        
                        var data = this.data();
                        
                        //var loginDataView = dataSourceLogin.data();
                        //console.log(loginDataView);
               
                
                            if (data[0]['status'][0].Msg==='You have been successfully logged out.') {                                
                                app.mobileApp.navigate('views/organisationLogin.html');                                
                                //app.flip('left', 'green', '#organisationNotiList')                                
                            }else {
                                //app.mobileApp.pane.loader.hide();
                                //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
                                app.showAlert(loginData.status[0].Msg, "Notification");
                            }

                        });
                }
       }
    

    return {
        showAlert: showAlert,
        showError: showError,
        serverUrl:serverUrl,
        showAppVersion:showAppVersion,
        callUserLogin:callUserLogin,
        callOrganisationLogin:callOrganisationLogin,
        callAdminOrganisationList:callAdminOrganisationList,
        replyUser:replyUser,
        convertTimeSpan:convertTimeSpan,
        timeConverter:timeConverter,
        ScaleImage:ScaleImage,
        toTitleCase:toTitleCase,
        checkIfFileExists:checkIfFileExists,
        sendNotification:sendNotification,
        errorCB:errorCB,
        successCB:successCB,
        formatTime:formatTime,
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
        isInternetConnected:isInternetConnected,
        updateQuery:updateQuery,
        insertQuery:insertQuery,
        showConfirm: showConfirm,
        urldecode:urldecode,
        LogoutFromAdmin:LogoutFromAdmin,
        urlEncode:urlEncode,
        isKeySet: isKeySet,
        mobileApp: mobileApp,
        proURIDecoder:proURIDecoder,
        checkConnection:checkConnection,
        helper: AppHelper,
        getfbValue:getfbValue,
        getPresentDate:getPresentDate,
        gobackTOCalendar:gobackTOCalendar,
        getPresntTimeStamp:getPresntTimeStamp,
        htmlDecode:htmlDecode,
        slide:slide,
        flip:flip,
        getDateMonth:getDateMonth,
        getDateDays:getDateDays,
        getYear: getYear,
        INTERNET_ERROR:INTERNET_ERROR,
        NO_ACCESS:NO_ACCESS,
        SESSION_EXPIRE:SESSION_EXPIRE,
        VERIFICATION_CODE_SEND:VERIFICATION_CODE_SEND,
        VERIFICATION_CODE_NOT_SEND:VERIFICATION_CODE_NOT_SEND,
        ENTER_CORRECT_V_CODE:ENTER_CORRECT_V_CODE,
        No_MEMBER_TO_ADD:No_MEMBER_TO_ADD,
        LOGIN_ANOTHER_DEVICE:LOGIN_ANOTHER_DEVICE,
        COMMENT_REPLY:COMMENT_REPLY,
        NOTIFICATION_MSG_NOT_SENT:NOTIFICATION_MSG_NOT_SENT,
        NOTIFICATION_MSG_SENT:NOTIFICATION_MSG_SENT,
        NOTIFICATION_MSG_SCHEDULED:NOTIFICATION_MSG_SCHEDULED,
        NEWS_ADDED_MSG:NEWS_ADDED_MSG,
        NEWS_EVENT_FAIL:NEWS_EVENT_FAIL,
        NEWS_UPDATED_MSG:NEWS_UPDATED_MSG,
        NEWS_DELETED_MSG:NEWS_DELETED_MSG,
        EVENT_ADDED_MSG:EVENT_ADDED_MSG,
        CANNOT_CANCEL:CANNOT_CANCEL,
        getSendNotiDateTime:getSendNotiDateTime,
        getCurrentDateTime:getCurrentDateTime,
        EVENT_UPDATED_MSG:EVENT_UPDATED_MSG,
        EVENT_DELETED_MSG:EVENT_DELETED_MSG,
        GROUP_UPDATED_MSG:GROUP_UPDATED_MSG,
        MEMBER_DELETED_MSG:MEMBER_DELETED_MSG,
        SELECT_MEMBER_TO_DELETE:SELECT_MEMBER_TO_DELETE,
        MEMBER_DETAIL_UPDATED_MSG:MEMBER_DETAIL_UPDATED_MSG,
        MEMBER_ADDED_MSG:MEMBER_ADDED_MSG,
        FORGET_PASSWORD_CODE_SEND:FORGET_PASSWORD_CODE_SEND
    };
})(window);