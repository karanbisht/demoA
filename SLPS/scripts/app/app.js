/*  
ANDROID
PackageID = com.postifi.slps
CurrentVersion = 1.0.6
VersionCode = 7
IOS
PackageID = com.postifi.slps
CurrentVersion = 1.0.6
VersionCode = 1
*/

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
    var deviceId_Not_Receive = 0;
    
    var CLIENT_APP_ID = "2015091076";
    var APP_NAME = "SLPS";
    var SD_NAME = "SLPS";
    var SUPPORT_MAIL="karanbisht.karan@gmail.com";
    var SUPPORT_NO="971-781-8898";
    var BASE_COLOR = "#7FBF4D";
    var ILLEGAL_CHARS = /\W/; // allow letters, numbers, and underscores      
    var INTERNET_ERROR = "Network problem. Please try again.";
    var ERROR_MESSAGE = "Network problem. Please try again."; //"Unable to reach server. Please try again.";
    var NO_ACCESS = "You don't have access.";
    var EXIT_APP = "Are you sure you want to exit ?"; //"Press again to exit.";
    var SESSION_EXPIRE = "Your session has expired. Please re-login in Admin Panel";
    var VERIFICATION_CODE_SEND = "Verification code not sent. Please click on Regenerate Code";
    var VERIFICATION_CODE_NOT_SEND = "Verification code not sent. Please click on Regenerate Code";
    var ENTER_CORRECT_V_CODE = "Incorrect Verification Code";
    var No_MEMBER_TO_ADD = "No member to add in group"; 
    var LOGIN_ANOTHER_DEVICE = "You have logged in from another device, Please re-login.";
    var COMMENT_REPLY = "Message sent successfully";
    var NOTIFICATION_MSG_NOT_SENT = "Operation Failed. Please try again.";
    var NOTIFICATION_MSG_SENT = "Message sent successfully";    
    var NOTIFICATION_MSG_SCHEDULED = "Message scheduled successfully";
    var NEWS_ADDED_MSG = "News added successfully";
    var TIMETABLE_ADDED_MSG = "Timetable added successfully";
    var NEWS_UPDATED_MSG = "News updated successfully";
    var TIMETABLE_UPDATED_MSG = "Timetable updated successfully";
    var NEWS_EVENT_FAIL = "Operation Failed. Please try again.";
    var TIMETABLE_EVENT_FAIL = "Operation Failed. Please try again.";
    var CANNOT_CANCEL = "Operation cannot be cancelled , Data sent.";
    var NEWS_DELETED_MSG = "News deleted successfully";
    var TIMETABLE_DELETED_MSG = "Timetable deleted successfully";
    var EVENT_ADDED_MSG = "Event added successfully";
    var EVENT_UPDATED_MSG = "Event updated successfully";
    var EVENT_DELETED_MSG = "Event deleted successfully";
    var GROUP_UPDATED_MSG = "Group updated successfully";
    var MEMBER_DELETED_MSG = "Member deleted successfully";
    var SELECT_MEMBER_TO_DELETE = "Please select member to delete";
    var DOWNLOAD_COMPLETED = "Download completed."
    var DOWNLOAD_NOT_COMPLETE = "Download not completed.";
    var MEMBER_DETAIL_UPDATED_MSG = "Member detail updated successfully";
    var MEMBER_ADDED_MSG = "Member added successfully";
    var NO_GROUP_AVAILABLE = "No Group Available , Please Add Group."
    var FORGET_PASSWORD_CODE_SEND = "Code sent at your registered number.";
    var DELETE_CONFIRM = "Are you sure you want to delete this.";
    var PRESENT_CONFIRM = "Are you sure you want to marked as Present.";
    var ABSENT_CONFIRM = "Are you sure you want to marked as Absent.";
    var VIDEO_ALY_DOWNLOAD = "Please wait until the previous download processing is complete before attempting to download new video."
    var SOCIAL_SHARE_ERROR_MSG = "Application not installed on your device , you need to install it first to use this feature."
    var GEO_PLACE_API = "https://maps.googleapis.com/maps/api/place/autocomplete/json?types=geocode&sensor=false&key=AIzaSyCf5YlSpGBRT2i5QRl3r5bD0c6JN-T0yF4&input=";    
    var GEO_MAP_API = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCf5YlSpGBRT2i5QRl3r5bD0c6JN-T0yF4&q=";
    var USER_IFRAME_OPEN = 0;
    var ADMIN_IFRAME_OPEN = 0;
    var NO_GROUP_AVAILABLE_OTO = "No Group Admin Available."
    
    var serverUrl = function() {        
        return 'https://app.postifi.com/webservice/';  
        //return 'http://sandbox.zaff.io/webservice/';
    }

    var showAppVersion = function() {
        cordova.getAppVersion(function(version) {           
            localStorage.setItem("AppVersion", version);
        });
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
        app.analyticsService.viewModel.trackException(e, 'Error in SLPS App -:' + message);
        return true;
    });
    
    var deviceUuid = function() {
        return device.uuid;
    };
    
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
        
    var checkSimulator = function() {
        if (window.navigator.simulator === true) {
            return true;
        } else if (window.plugins.toast === undefined) {
            return true;
        } else {
            return false;
        }
    };
    
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
                
        tx.executeSql('CREATE TABLE IF NOT EXISTS ORG_EVENT(id INTEGER , org_id INTEGER , event_name TEXT, event_desc TEXT, event_image TEXT, event_image_DB TEXT , upload_type TEXT, event_date TEXT,event_time TEXT,location TEXT)');

        tx.executeSql('CREATE TABLE IF NOT EXISTS ORG_NEWS(id INTEGER , org_id INTEGER , news_name TEXT, news_desc TEXT, news_image TEXT, news_image_DB TEXT, upload_type TEXT, news_date TEXT,news_time TEXT)');

        tx.executeSql('CREATE TABLE IF NOT EXISTS TIME_TABLE(org_id INTEGER, id INTEGER ,group_name TEXT, timetable TEXT,group_id INTEGER, added_by INTEGER)');
        
        tx.executeSql('CREATE TABLE IF NOT EXISTS ONE_TO_ONE(org_id INTEGER, id INTEGER , message TEXT, add_date TEXT , receiver INTEGER , sender INTEGER )');
    };	
    
    var checkForLoginStatus = function () {
        db = getDb();
        db.transaction(loginStatusQuery, errorCB, loginStatusQuerySuccess);
    };
        
    var loginStatusQuery = function(tx) {
        var query = 'SELECT * FROM PROFILE_INFO';
        selectQuery(tx, query, loginResultSuccess);  
        
        var query1 = 'SELECT * FROM JOINED_ORG';
        selectQuery(tx, query1, loginOrgResultSuccess);
    };
    
    var loginResultSuccess = function(tx, results) {
        var count = results.rows.length;
        if (count !== 0) {
            loginStatusDBValue = results.rows.item(0).login_status;
            adminLoginStatusDBValue = results.rows.item(0).Admin_login_status;
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
        var gotNoti = localStorage.getItem("gotNotification");
        if (gotNoti!==1 && gotNoti!=='1') {
            //loginStatusDBValue=0;
            if (loginStatusDBValue===1 && adminLoginStatusDBValue!==1) {
                app.mobileApp.navigate('#view-all-activities');
                localStorage.setItem("loginStatusCheck", 1);
            }else if (loginStatusDBValue===1 && adminLoginStatusDBValue===1) {
                app.mobileApp.navigate('#view-all-activities-GroupDetail');
                localStorage.setItem("loginStatusCheck", 2);    
            } else {            
                app.mobileApp.navigate('#welcome');
                localStorage.setItem("loginStatusCheck", 0);
                localStorage.setItem("adminloginStatusCheck", 0);
            }        
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
        app.analyticsService.viewModel.trackException(err, "Error in Sqlite local Storage processing");
    };
    
    var successCB = function() {
    };
    
    var checkConnection = function() {
        if (typeof navigator.connection.type !== "undefined") {
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

    //var lastClickTime11 = 0;
    //var backButtonClickCount=0;
    
    var onBackKeyDown = function(e) { 
        if (app.mobileApp.view()['element']['0']['id']==='welcome') {    
            e.preventDefault();           
            navigator.app.exitApp();            
        }else if (app.mobileApp.view()['element']['0']['id']==='organisationNotiList') {
            e.preventDefault();            
            navigator.app.exitApp();
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities') {                 
            /*if(backButtonClickCount===0){
            window.plugins.toast.showShortBottom(app.EXIT_APP);                  
            }
            var current = new Date().getTime();
            var delta = current - lastClickTime11;
            lastClickTime11 = current;
            if (delta < 3000) {
            backButtonClickCount=0;
            e.preventDefault();            
            navigator.app.exitApp();
            }else {
            if(backButtonClickCount===0){
            backButtonClickCount=1;
            }else{
            window.plugins.toast.showShortBottom(app.EXIT_APP); 
            }                
            }*/
            navigator.notification.confirm(app.EXIT_APP, function (confirmed) {           
                if (confirmed === true || confirmed === 1) {
                    e.preventDefault();            
                    navigator.app.exitApp();
                }else {
                }
            }, app.APP_NAME, ['Yes', 'No']);
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-GroupDetail') {
        }else if (app.mobileApp.view()['element']['0']['id']==='profileDiv' || app.mobileApp.view()['element']['0']['id']==='eventCalendar') {
            app.mobileApp.navigate("#view-all-activities");               
        }else if (app.mobileApp.view()['element']['0']['id']==='eventCalendarDetail') {
            if (app.USER_IFRAME_OPEN===1) {
                app.USER_IFRAME_OPEN = 0; 
                $("#location_Map_UserSide").kendoMobileModalView("close");
            }else {
                app.mobileApp.navigate("#eventCalendar");   
            }
        }else if (app.mobileApp.view()['element']['0']['id']==='organisationDiv') {
            app.mobileApp.navigate("#view-all-activities");
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-userReply') {
            app.mobileApp.navigate("#view-all-activities-admin");          
        }else if (app.mobileApp.view()['element']['0']['id']==='groupMemberShow') {
            app.mobileApp.navigate("#memberPageGroupList");
        }else if (app.mobileApp.view()['element']['0']['id']==='memberPageGroupList') {
            app.mobileApp.navigate("#view-all-activities-GroupDetail");    
        }else if (app.mobileApp.view()['element']['0']['id']==='subGroupMemberShow') {
            app.mobileApp.navigate('views/subGroupDetailView.html');
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-Group') {
            app.mobileApp.navigate('views/groupListPage.html');
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-GroupList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');    
        }else if (app.mobileApp.view()['element']['0']['id']==='addAdminCustomer') {
            app.mobileApp.navigate('#groupMemberShow');
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-GroupDetail') {
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEventCalendar') {
            app.mobileApp.navigate('#adminEventList');     
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEventCalendarDetail') {
            //app.mobileApp.navigate('#adminEventList'); 
            if (app.ADMIN_IFRAME_OPEN===1) {
                app.ADMIN_IFRAME_OPEN = 0; 
                $("#location_Map").kendoMobileModalView("close");
            }else {
                app.mobileApp.navigate('#adminEventList');   
            }
        }else if (app.mobileApp.view()['element']['0']['id']==='adminAddEventCalendar') {
            app.mobileApp.navigate('#adminEventList'); 
            //app.adminEventCalender.onBackClsPicker('add');
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEditEventCalendar') {
            app.mobileApp.navigate('#adminEventList');   
            //app.adminEventCalender.onBackClsPicker('edit');            
        }else if (app.mobileApp.view()['element']['0']['id']==='adminTimeTableList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');    
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEventList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');  
        }else if (app.mobileApp.view()['element']['0']['id']==='adminOrgNewsList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');                      
        }else if (app.mobileApp.view()['element']['0']['id']==='adminAddNews') {
            app.mobileApp.navigate('#adminOrgNewsList');
            //app.adminNews.onBackClsPicker('add');
        }else if (app.mobileApp.view()['element']['0']['id']==='adminEditNews') {
            app.mobileApp.navigate('#adminOrgNewsList');
            //app.adminNews.onBackClsPicker('edit');
        }else if (app.mobileApp.view()['element']['0']['id']==='sendNotificationDiv') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
            //app.sendNotification.onBackClsPicker();    
        }else if (app.mobileApp.view()['element']['0']['id']==='single-activity-user') {
            var gotNoti = localStorage.getItem("gotNotification");             
            if (gotNoti===1 || gotNoti==='1') {
                app.onLoad();
            }else {
                app.mobileApp.navigate('#view-all-activities');  
            }
        }else if (app.mobileApp.view()['element']['0']['id']==='attendancePageGroupList') {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');    
        }else if (app.mobileApp.view()['element']['0']['id']==='OrgLogin') {
            app.mobileApp.navigate('#view-all-activities');
        }else if (app.mobileApp.view()['element']['0']['id']==='view-all-activities-reg') {
            app.mobileApp.navigate('#welcome');
        }else {
            app.mobileApp.navigate("#:back");    
        }
    };
        
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
        app.mobileApp.navigate('#view-all-activities');
    }

    function updateAdminLoginStatusError(err) {
        //console.log(err);
    }    
    
    var Keyboardisoff = function() {       
        $(".km-scroll-container").css("-webkit-transform", "");
    };
    
    var Keyboardison = function() {
    }
    
    var onDeviceReady = function() {       
        app.deviceId_Not_Receive = 0;
        localStorage.setItem("gotNotification", 0);
        //feedback.initialize('ee535990-56b4-11e5-8549-fbea17bda868');
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByHexString('#000000');
        document.addEventListener('backbutton', onBackKeyDown, false);
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("hidekeyboard", Keyboardisoff, false);
        document.addEventListener("showkeyboard", Keyboardison, false);
                
        if (!app.checkSimulator()) {
            app.showAppVersion();
        }else {
            localStorage.setItem("AppVersion", '9.9.9');
        }    

        window.requestFileSystem(window.PERSISTENT, 0, fileSystemSuccess, fileSystemFail);                
        var pushNotification = window.plugins.pushNotification;   
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(oncallback);
        } else {
            app.analyticsService.viewModel.setAnalyticMonitor();
        }
                
        if (device.platform === "iOS") {
            localStorage.setItem("DEVICE_TYPE", "AP");
            
            pushNotification.register(successHandler,
                                      errorHandler, {
                                          "badge": "true",
                                          "sound": "true",
                                          "alert": "true",
                                          "ecb": "window.onNotificationAPN"
                                      });
        } else {
            localStorage.setItem("DEVICE_TYPE", "AN");
            pushNotification.register(successHandler, errorHandler, {"senderID":"707847265747","ecb":"window.onNotificationGCM"});            
        }
        
        var db = getDb();
        db.transaction(createDB, errorCB, checkForLoginStatus);
        //checkForceUpdate();
        //app.hideAppLoader();
    };    
    
    function successHandler (result) {
        app.deviceId_Not_Receive = 0;
        localStorage.setItem("deviceTokenID", result);
    }

    function errorHandler (error) {
    }
    
    var oncallback = function(position) {
        var latitude = position.coords.latitude,
            longitude = position.coords.longitude;
        app.analyticsService.viewModel.setAnalyticMonitor(latitude, longitude);
    };
    
    var onPause = function(e) {
        app.analyticsService.viewModel.trackFeature("Detect Status.App is running in background");
        app.analyticsService.viewModel.monitorStop();
    };
    
    var onResume = function() {
        var loginStatus = localStorage.getItem("loginStatusCheck");    
        console.log(loginStatus);
        if (loginStatus !== '0' && loginStatus !== 0 && loginStatus !== null && loginStatus !== 'null') {            
            app.analyticsService.viewModel.setInstallationInfo(localStorage.getItem("username"));

            if (loginStatus==='1' || loginStatus===1) {
                app.Activities.show();
            }else if (loginStatus==='2' || loginStatus===2) {
                app.groupDetail.show();     
            }             
            var device_id = localStorage.getItem("deviceTokenID");
            var account_Id = localStorage.getItem("ACCOUNT_ID");
        
            var jsonDataLogin = {"APP_ID":app.CLIENT_APP_ID};
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "customer/isActive/" + account_Id + "/" + device_id,
                                                                            type:"POST",
                                                                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                            data: jsonDataLogin
                                                                        }
                },
                                                                schema: {
                    data: function(data) {
                        console.log(JSON.stringify(data));
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    console.log(JSON.stringify(e));
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data();                                    
                if (data[0]['status'][0].Msg==='Fail') {                        
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.LOGIN_ANOTHER_DEVICE);  
                    }else {
                        app.showAlert(app.LOGIN_ANOTHER_DEVICE , 'Notification');  
                    }                        
                  /*karan*/
                    //var db = app.getDb();
                    //db.transaction(updateLoginStatus, updateLoginStatusError, updateLoginStatusSuccess);  
                    logoutFromApp();
                }                    
            });      
            //checkForceUpdate();
        } else {
            app.analyticsService.viewModel.setInstallationInfo("Anonymous User");
        }       
        app.analyticsService.viewModel.monitorStart();
        app.analyticsService.viewModel.trackFeature("Detect Status.App is running in foreground");
    };
    
    function checkForceUpdate() {
        var serverV = '1.0.6';
        var serverVersion = [];
        var systemVersion = [];
            
        serverVersion = serverV.split(".");
        console.log("serverVersion", serverVersion[0]);
        console.log("serverVersion", serverVersion[1]);
        console.log("serverVersion", serverVersion[2]);

        var value = localStorage.getItem("AppVersion");
        systemVersion = value.split(".");
        console.log("systemversion", systemVersion[0]);
        console.log("systemversion", systemVersion[1]);
        console.log("systemversion", systemVersion[2]);
            
        if ((parseInt(systemVersion[0]) < parseInt(serverVersion[0]))) {                    
            navigator.notification.alert("You are running an outdated version of " + app.APP_NAME + " . Please use the latest version available.", goToStore, app.APP_NAME, 'Ok');                    
        }else if((parseInt(systemVersion[0]) === parseInt(serverVersion[0])) && (parseInt(systemVersion[1]) < parseInt(serverVersion[1]))){
            navigator.notification.alert("You are running an outdated version of " + app.APP_NAME + " . Please use the latest version available.", goToStore, app.APP_NAME, 'Ok');
        } 
    }
    
    function goToStore() {
        var device_type = localStorage.getItem("DEVICE_TYPE");                                            
        if (device_type==='AN') {  
            window.open('https://play.google.com/store/apps/details?id=com.postifi.slps', '_system');                          
        }else {
            window.open('https://itunes.apple.com/in/app/slps/id1041813405?mt=8');
        }    
    }    
    
    var onLoad = function() {
        document.addEventListener('deviceready', onDeviceReady, false);      
    }
    
    document.addEventListener('orientationchange', fixViewResize);
    
    var fileSystemSuccess = function(fileSystem) {
        var rootdir = fileSystem.root;
        fp = rootdir.toURL();        
        rootdir.getDirectory(app.SD_NAME, {create: true, exclusive: false}, onDirectorySuccess, onDirectoryFail); 
        getfbValue();
    }
    
    var getfbValue = function() {
        var fbValue = fp;
        localStorage.setItem("sdCardPath", fbValue);
        return fbValue;
    };
    
    function onDirectorySuccess(parent) {
    }
 
    function onDirectoryFail(error) {
    }
    
    function fileSystemFail(evt) {
    }

    var emptyGuid = '00000000-0000-0000-0000-000000000000';
    var AppHelper = {
        
        resolveProfilePictureUrl: function (id) {
            if (id && id !== emptyGuid) {
            } else {
                return 'styles/images/avatar.png';
            }
        },

        resolvePictureUrl: function (id) {
            if (id && id !== emptyGuid) {
            } else {
                return '';
            }
        },

        formatDate: function (dateString) {
            var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            var today = new Date(dateString);
            return kendo.toString(days[today.getDay()] + ', ' + today.getDate() + ' ' + month[today.getMonth()]);
        }
    };
       
    var messageDB;
    var orgIdDB;
    var notiIdDB;
    var typeDB;
    var titleDB;
    var attachedDB;
    //var account_IdDB;
    var commentAllowDB;
    var send_DateDB;
    var notificationMsg;
    var sendDateInside; 
    var uploadTypeNoti;
        
    window.onNotificationAPN = function(event) {
        if (event.id) {                   
            //account_IdDB = localStorage.getItem("ACCOUNT_ID");
            var messageSplitVal = event.id.split('#####');
                      
            messageDB = messageSplitVal[0];
            orgIdDB = messageSplitVal[1];
            notiIdDB = messageSplitVal[2];
            typeDB = messageSplitVal[3];
            titleDB = messageSplitVal[4];
            attachedDB = messageSplitVal[5];
            commentAllowDB = messageSplitVal[6];
            notificationMsg = messageSplitVal[7];
            uploadTypeNoti = messageSplitVal[8];
            
            /*if(attachedDB!==0 || attachedDB!=="0"){                       
            var vidPathData = app.getfbValue();    
            var Filename = attachedDB.replace(/^.*[\\\/]/, '');
            var fp = vidPathData + app.SD_NAME+"/"+ 'Zaffio_img_' + Filename;  
                        
            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedDB, fp, 
            function(entry) {
            //alert('complete');
            app.mobileApp.pane.loader.hide();
            //$("#progressChat").hide();
            },
    
            function(error) {
            //alert('error');
            app.mobileApp.pane.loader.hide();
                                      
            }
            );
            }*/
                        
            //send_DateDB= getPresentDateTime();
            send_DateDB = getPresntTimeStamp();   
            sendDateInside = timeConverter(send_DateDB);
          
            /*& typeDB!=='Attendance'*/
            
            if (typeDB!=='Add Customer' && typeDB!=='News' && typeDB!=='Event') {
                if (commentAllowDB==='') {
                    commentAllowDB = 0;
                }
                
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
                        //var db = app.getDb();
                        //db.transaction(insertOrgNotiData, app.errorCB, app.successCB);  
                        if (typeDB!=='Reply') {
                            var db = app.getDb();
                            db.transaction(insertOrgNotiData, app.errorCB, refreshMsgList);
                        }else {   
                            var db = app.getDb();
                            db.transaction(insertCommentCount, app.errorCB, app.successCB);            
                        }
                    }
                }, 'Message', ['View', 'Close']);   
            }else if (typeDB==='News') {
                navigator.notification.confirm(titleDB, function (confirmed) {           
                    if (confirmed === true || confirmed === 1) {
                        goToAppNewsPage();
                    }else {
                       app.orgNews.show(); 
                    }
                }, 'News', ['View', 'Close']);  
            }else if (typeDB==='Event') {
                navigator.notification.confirm(titleDB, function (confirmed) {           
                    if (confirmed === true || confirmed === 1) {
                        goToAppEventPage();
                    }else {
                        app.eventCalender.show();
                    }
                }, 'Event', ['View', 'Close']);                    
            }else {
                showAlert(messageDB , "Message");
            } 
            
            if (app.deviceId_Not_Receive===1) {
                app.Login.login();
            }
        }
    };

    window.onNotificationGCM = function(e) {
        try {
            switch (e.event) {
                case 'registered':
                    if (e.regid.length > 0) {
                        localStorage.setItem("deviceTokenID", e.regid);
                    }
                    break;
                case 'message':             
                    //account_IdDB = localStorage.getItem("ACCOUNT_ID");                         
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
                
                    /*if(attachedDB!==0 || attachedDB!=="0"){                       
                    var vidPathData = app.getfbValue();    
                    var Filename = attachedDB.replace(/^.*[\\\/]/, '');
                    var fp = vidPathData + app.SD_NAME+"/"+ 'Zaffio_img_' + Filename;  
                        
                    var fileTransfer = new FileTransfer();              
                    fileTransfer.download(attachedDB, fp, 
                    function(entry) {
                    //alert('complete');
                    app.mobileApp.pane.loader.hide();
                    //$("#progressChat").hide();
                    },
    
                    function(error) {
                    //alert('error');
                    app.mobileApp.pane.loader.hide();

                    }
                    );
                    }*/
                    
                    //&& typeDB!=='Attendance'
                    if (typeDB!=='Add Customer' && typeDB!=='News' && typeDB!=='Event' && typeDB!=='One2One') {
                        if (attachedDB=== 0 || attachedDB=== "0") {
                            attachedDB = '';
                        }
                        
                        if (e.foreground) {
                            if (typeDB!=='Reply') {
                                var db = app.getDb();
                                db.transaction(insertOrgNotiData, app.errorCB, refreshMsgList);
                            }else {   
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
                    }else if (typeDB==='News') {
                        if (e.foreground) {
                            app.orgNews.show();
                        }else {
                            goToAppNewsPage();    
                        }    
                    }else if (typeDB==='Event') {
                        if (e.foreground) {
                            app.eventCalender.show();
                        }else {
                            goToAppEventPage(); 
                        }    
                    }else if (typeDB==='One2One') {
                        if (e.foreground) {
                        }else {                
                            localStorage.setItem("selAdmFulName", commentAllowDB);
                            localStorage.setItem("selAdmAccId", attachedDB); 
                            goToAppOneToOnePage(); 
                        }    
                    }    
                    break;
                case 'error':
                    app.analyticsService.viewModel.trackException(e, "Error in GCM PUSH Registration : " + e.msg);
                    break;
                default:
                    break;
            }
            
            if (app.deviceId_Not_Receive===1) {
                app.Login.login();
            }
        } catch (err) {
            app.analyticsService.viewModel.trackException(e, "Error in GCM PUSH Registration : " + err);
        }
        finally {    
        }   
    };  
    
    
    
    function refreshMsgList(){
        app.Activities.show();
    }

    function insertCommentCount(tx) {
        var query = "UPDATE ORG_NOTIFICATION SET adminReply= adminReply+1 where org_id='" + orgIdDB + "' and pid='" + notiIdDB + "'";
        app.updateQuery(tx, query);
    }
        
    function insertOrgNotiData(tx) {
        messageDB = app.urlEncode(messageDB);
        titleDB = app.urlEncode(titleDB);
        notificationMsg = app.urlEncode(notificationMsg);
                            
        var queryUpdate = "UPDATE JOINED_ORG SET count=count+1 , lastNoti='" + messageDB + "' where org_id=" + orgIdDB;
        app.updateQuery(tx, queryUpdate);          
        /*var queryDelete = "DELETE FROM ORG_NOTIFICATION where pid =" + notiIdDB;
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
        */ 
    }
    
    function insertOrgNotiDataBagINC(tx) {
        messageDB = app.urlEncode(messageDB);
        titleDB = app.urlEncode(titleDB);
        notificationMsg = app.urlEncode(notificationMsg);

        var queryUpdate = "UPDATE JOINED_ORG SET count=count+1 , bagCount=bagCount+1 , lastNoti='" + messageDB + "' where org_id=" + orgIdDB;
        app.updateQuery(tx, queryUpdate);          
        /* var queryDelete = "DELETE FROM ORG_NOTIFICATION where pid =" + notiIdDB;
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
        */
    }
    
    function goToAppPage() { 
        var db = app.getDb();
        db.transaction(updatebagCount, app.errorCB, app.successCB);

        //var messageDBVal = app.urlEncode(messageDB); 
        //var titleDBVal = app.urlEncode(titleDB);
        
        if (attachedDB!== null && attachedDB!=='' && attachedDB!=="0") {
            localStorage.setItem("shareImg", attachedDB);
        }else {
            localStorage.setItem("shareImg", null);
        }
        
        localStorage.setItem("shareMsg", messageDB);
        localStorage.setItem("shareTitle", titleDB);    
             
        localStorage.setItem("shareOrgId", orgIdDB);
        localStorage.setItem("shareNotiID", notiIdDB);
        localStorage.setItem("shareComAllow", commentAllowDB);
        localStorage.setItem("shareUploadType", uploadTypeNoti);
        localStorage.setItem("shareDate", sendDateInside);
        localStorage.setItem("shareType", typeDB);        
        localStorage.setItem("gotNotification", 1);
        
        app.mobileApp.navigate('views/activityView.html');
    }
    
    function goToAppNewsPage() {                                 
        app.mobileApp.navigate('views/organizationNews.html?orgin=1');
    }
    
    function goToAppEventPage() {                                 
        app.mobileApp.navigate('views/eventCalendar.html?orgin=1');
    }
    
    function goToAppOneToOnePage() {
        app.mobileApp.navigate('views/connectToUsWindow.html');    
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
    }
	
    function fileDoesNotExist() {
    }
    
    function getFSFail(evt) {
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
    
    var loginStatusCheck = localStorage.getItem("loginStatusCheck");                                 
    
    if (loginStatusCheck==='0' || loginStatusCheck===null) {    
        mobileApp = new kendo.mobile.Application(document.body, {
                                                     initial: "#welcome",
                                                     skin: 'flat'
                                                     //transition:'fade'
                                                 });
    }else if (loginStatusCheck==='1') {
        mobileApp = new kendo.mobile.Application(document.body, {
                                                     initial: "#firstScreen",
                                                     skin: 'flat'
                                                     //transition:'fade'
                                                 });
    }else if (loginStatusCheck==='2') {
        mobileApp = new kendo.mobile.Application(document.body, {
                                                     initial: "#firstScreen",
                                                     skin: 'flat'
                                                     //transition:'fade'
                                                 });       
    }
    
    var callOrganisationLogin = function() {
        var account_Id = localStorage.getItem("ACCOUNT_ID");
        app.mobileApp.navigate('views/organisationLogin.html?account_Id=' + account_Id);
    };
       
    var callUserLogin = function() {        
        app.mobileApp.navigate('#view-all-activities');
    };
    
    var callAdminOrganisationList = function() {
        app.mobileApp.navigate('#view-all-activities-GroupDetail');
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
        var totalTime = CurDateVal + '||' + time;
        return totalTime;
    }

    var newGetCurrentDateTime = function() {
        var currentDate = new Date();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var year = currentDate.getFullYear();
        if (day < 10) {
            day = '0' + day;
        }        
        if (month < 10) {
            month = '0' + month; 
        }         
        var CurDateVal = year + '-' + month + '-' + day ;
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();

        if (hours < 10) {
            hours = '0' + hours;    
        }        
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
                
        var time = hours + ":" + minutes;            
        var totalTime = CurDateVal + '||' + time;
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
        
        var second = "00";
        
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
        app.mobileApp.navigate('views/userReplyView.html');                         
    };
    
    var sendNotification = function() {
        app.mobileApp.navigate('views/sendNotification.html?account_Id=' + account_Id);           
    };

    var getYear = (function () {
        return new Date().getFullYear();
    }());
     
    var formatDate = function (dateString) {
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var today = new Date(dateString);
        return kendo.toString(days[today.getDay()] + ', ' + today.getDate() + ' ' + month[today.getMonth()] + ' ' + today.getFullYear());
    }
    
    var getDateDays = function (dateString) {
        var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        var today = new Date(dateString);
        return kendo.toString(days[today.getDay()]);
    }
    
    var getDateMonth = function (dateString) {
        var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        var today = new Date(dateString);
        return kendo.toString(month[today.getMonth()] + ' ' + today.getFullYear());
    }
    
    var currentDataFormate = function() {
        var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        var month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var today = new Date();     
        return kendo.toString(days[today.getDay()] + ',' + today.getDate() + ' ' + month[today.getMonth()] + ' ' + today.getFullYear()); 
    }
      
    function timeConvert (time) {
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
            return true;
        }else {                                                         
            return false;
        }
    }
    
    var gobackTOCalendar = function() {
        app.mobileApp.navigate('#eventCalendar');
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
    
    var formatTime = function(timeString) {        
        var split = timeString .split(':');
   
        var dayNight = split[0] < 12 ? 'am' : 'pm'; // Set AM/PM

        if (split[0] > 12) {
            split[0] = split[0] - 12;
        }
        
        var time = split[0] + ':' + split[1] + ' ' + dayNight ;        
        return time;
    }
    
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
    
    function LogoutFromAdmin() {   
        app.hideAppLoader();
        if (!app.checkConnection()) {
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Network unavailable . Please try again later');  
            }else {
                app.showAlert('Network unavailable . Please try again later' , 'Offline');
            } 
        }else { 
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.SESSION_EXPIRE);
            }else {
                app.showAlert(app.SESSION_EXPIRE);
            }
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
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    if (!app.checkConnection()) {
                                                                        if (!app.checkSimulator()) {
                                                                            window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                        }else {
                                                                            app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                        } 
                                                                    }else {
                                                                        if (!app.checkSimulator()) {
                                                                            window.plugins.toast.showShortBottom(app.ERROR_MESSAGE);
                                                                        }else {
                                                                            app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                        }
                                                                        app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                    }
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data();
                
                if (data[0]['status'][0].Msg==='You have been successfully logged out.') {                                
                    app.mobileApp.navigate('views/organisationLogin.html');
                    localStorage.setItem("loginStatusCheck", 1);
                }else {
                    app.showAlert(loginData.status[0].Msg, "Notification");
                }
            });
        }
    }
    
    var generateMoniterForAdmin = function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(oncallback);
        } else {
            app.analyticsService.viewModel.setAnalyticMonitor();
        }        
    };
    
    var noGroupAvailable = function() {
        if (!app.checkSimulator()) {
            window.plugins.toast.showShortBottom(app.NO_GROUP_AVAILABLE);   
        }else {
            app.showAlert(app.NO_GROUP_AVAILABLE);  
        }
    };
    
    var noGroupAvailableOTO = function() {
        if (!app.checkSimulator()) {
            window.plugins.toast.showShortBottom(app.NO_GROUP_AVAILABLE_OTO);   
        }else {
            app.showAlert(app.NO_GROUP_AVAILABLE_OTO);  
        }
    };
    
    var shareMessageAndURLViaTwitter = function () {
        var shareImg = localStorage.getItem("shareImg");
        var shareMsg = localStorage.getItem("shareMsg");
        //var shareTitle = localStorage.getItem("shareTitle");
           
        if (!app.checkSimulator()) { 
            if (shareImg!== null && shareImg!=='' && shareImg!=="0" && shareImg!=="null") {
                window.plugins.socialsharing.shareViaTwitter(
                    shareMsg, 
                    shareImg, // img
                    null, //link 
                    app.shareSuccess, 
                    app.shareError);
            }else {
                window.plugins.socialsharing.shareViaTwitter(
                    shareMsg, 
                    null, 
                    null, 
                    app.shareSuccess, 
                    app.shareError);
            }    
        }
    };

    var shareImagesViaFacebook = function () {
        var shareImg = localStorage.getItem("shareImg");
        var shareMsg = localStorage.getItem("shareMsg");
        //var shareTitle = localStorage.getItem("shareTitle");
            
        if (!app.checkSimulator()) {
            if (shareImg!== null && shareImg!=='' && shareImg!=="0" && shareImg!=="null") {
                window.plugins.socialsharing.shareViaFacebook(
                    shareMsg,
                    shareImg, //img
                    null, //url
                    app.shareSuccess, 
                    app.shareError);
            }else {
                window.plugins.socialsharing.shareViaFacebook(
                    shareMsg,
                    null, //img
                    null, //url
                    app.shareSuccess, 
                    app.shareError);
            }    
        }
    };

    var shareMessageViaWhatsApp = function () {
        var shareImg = localStorage.getItem("shareImg");
        var shareMsg = localStorage.getItem("shareMsg");
        //var shareTitle = localStorage.getItem("shareTitle");
                        
        if (!app.checkSimulator()) {
            if (shareImg!==null && shareImg!=='' && shareImg!=="0" && shareImg!=="null") {
                window.plugins.socialsharing.shareViaWhatsApp(
                    shareMsg, 
                    shareImg, //img 
                    null, //url
                    app.shareSuccess, app.shareError);
            }else {
                window.plugins.socialsharing.shareViaWhatsApp(
                    shareMsg, 
                    null, 
                    null, 
                    app.shareSuccess, app.shareError);
            }    
        }         
    };

    var shareMessageViaSMS = function () {
        //var shareImg = localStorage.getItem("shareImg");
        var shareMsg = localStorage.getItem("shareMsg");
        //var shareTitle = localStorage.getItem("shareTitle");
            
        var device_type = localStorage.getItem("DEVICE_TYPE");                                             
        if (device_type==='AN') {  
            var options = {
                android: {
                    intent: 'INTENT'  // send SMS with the native android SMS messaging
                    //intent: '' // send SMS without open any other app
                }
            };

            sms.send('', shareMsg, options, app.shareSuccess, app.shareMessageError);
        }else {
            window.plugins.socialsharing.shareViaSMS(
                shareMsg, 
                null,
                app.shareSuccess, 
                app.shareError);
        }     
    };
        
    var shareViaEmail = function (e) {
        var shareImg = localStorage.getItem("shareImg");
        var shareMsg = localStorage.getItem("shareMsg");
        var shareTitle = localStorage.getItem("shareTitle");            
        if (!app.checkSimulator()) {
            if (shareImg!== null && shareImg!=='' && shareImg!=="0" && shareImg!=="null") {
                window.plugins.socialsharing.shareViaEmail(
                    shareMsg,
                    shareTitle,
                    null, // TO: must be null or an array  ['to@person1.com', 'to@person2.com']
                    null, // CC: must be null or an array  ['cc@person1.com']
                    null, // BCC: must be null or an array
                    [shareImg],
                    app.shareSuccess,
                    app.shareMessageError
                    );
            }else {
                window.plugins.socialsharing.shareViaEmail(
                    shareMsg,
                    shareTitle,
                    null, // TO: must be null or an array  ['to@person1.com', 'to@person2.com']
                    null, // CC: must be null or an array  ['cc@person1.com']
                    null, // BCC: must be null or an array
                    app.shareSuccess,
                    app.shareMessageError
                    );
            }    
        }
    };
        
    var socialShare = function() {
        window.plugins.socialsharing.share(
            'message',
            'subject',
            null,
            null,
            [app.shareSuccess], // e.g. function(result) {console.log('result: ' + result)}
            [app.shareError]    // e.g. function(result) {alert('error: ' + result);
            );
    }
    
    var shareSuccess = function() {
        //console.log('success');
    };
    
    var shareError = function(errormsg) {               
        if (errormsg!=="URL_NOT_SUPPORTED" && errormsg!=="not available") {
            window.plugins.toast.showShortBottom(app.SOCIAL_SHARE_ERROR_MSG);
        }else if ('errormsg==="not available"') {
            window.plugins.toast.showShortBottom(app.SOCIAL_SHARE_ERROR_MSG);
        }   
    };
        
    var shareMessageError = function() {              
    };
    
    var getMonthData = function (dateString) {
        var month = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        var today = new Date(dateString);
        return kendo.toString(month[today.getMonth()]);
    };
    
    var getDeviceID = function() {
        app.deviceId_Not_Receive = 1;                
        var pushNotification = window.plugins.pushNotification;   
                        
        if (device.platform === "iOS") {            
            localStorage.setItem("DEVICE_TYPE", "AP");
                       
            pushNotification.register(successHandler,
                                      errorHandler, {
                                          "badge": "true",
                                          "sound": "true",
                                          "alert": "true",
                                          "ecb": "window.onNotificationAPN"
                                      });
        } else if (device.platform === 'android' || device.platform === 'Android') {
            localStorage.setItem("DEVICE_TYPE", "AN");            
            
            pushNotification.register(successHandler, errorHandler, {"senderID":"707847265747","ecb":"window.onNotificationGCM"});
        }
    };
        
    var getFileExtension = function(filename) {
        var ext = /^.+\.([^.]+)$/.exec(filename);
        return ext === null ? "" : ext[1];
    };
    
    var refreshBtn = function() {  
        app.showAppLoader();
        app.onLoad();       
        setTimeout(function() {
            $("#popover-drawer").data("kendoMobilePopOver").close();
        }, 200);
    };
    
    var genRandNumber = function() {      	
        return Math.floor(Math.random() * 899999999 + 100000000);		   
    };
    
    var triggerDrawer1 = function() {        
        $("#left-drawer").data("kendoMobileDrawer").show();
        $(".km-scroll-container").css("-webkit-transform", "");            
        return false;		
    };
    
    var triggerDrawer2 = function() {        
        $("#left-drawer1").data("kendoMobileDrawer").show();
        $(".km-scroll-container").css("-webkit-transform", "");            
        return false;	
    };
    
    var shareMsgContent = function () {
        app.showActionSheet({
                                'androidTheme' : window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
                                'title': 'Choose an action',
                                'buttonLabels': ['Share via WhatsApp', 'Share via Twitter','Share via SMS' ,'Share via Email'],
                                'addCancelButtonWithLabel': 'Cancel',
                                'androidEnableCancelButton' : true, // default false
                                'winphoneEnableCancelButton' : true // default false
                                //'addDestructiveButtonWithLabel' : 'Delete it'                
                            });
    };
    
    var showActionSheet = function (options) {
        if (!app.checkSimulator()) {
            window.plugins.actionsheet.show(
                options,
                function (buttonIndex) {
                    // wrapping in a timeout so the dialog doesn't freeze the app                        
                    if (buttonIndex===1) {
                        app.shareMessageViaWhatsApp();
                    }else if (buttonIndex===2) {
                        app.shareMessageAndURLViaTwitter();
                    }else if (buttonIndex===3) {
                        app.shareMessageViaSMS();  
                    }else if (buttonIndex===4) {
                        app.shareViaEmail();
                    }else if (buttonIndex===5) {
                        window.plugins.actionsheet.hide();
                    }    
                    /*setTimeout(function() {
                    alert('button index clicked: ' + buttonIndex);
                    }, 0);*/
                }
                );
        }
    };
    
    var showAppLoader = function(cls) {
        if (!app.checkSimulator()) {
            window.plugins.spinnerDialog.show(
                null, // title
                null, // message
                true // non-dismissable
                );
            setTimeout(function() {
                window.plugins.spinnerDialog.hide();
            }, 10000); 
        }else {
            $("#appLoader").show();
        }    
    };
    
    var hideAppLoader = function() {
        if (!app.checkSimulator()) {
            window.plugins.spinnerDialog.hide();
        }else {
            $("#appLoader").hide();
        }  
    };
    
    var rateUs = function() {
        var device_type = localStorage.getItem("DEVICE_TYPE");  
        if (!app.checkConnection()) {
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Network unavailable . Please try again later');  
            }else {
                app.showAlert('Network unavailable . Please try again later' , 'Offline');
            } 
        }else { 
            if (device_type==='AN') {                     
                navigator.startApp.start([
                                             "com.android.vending", // package name
                                             "com.google.android.finsky.activities.LaunchUrlHandlerActivity", // activity
                                             "market://details?id=com.postifi.slps" // URI                  
                                         ], function(message) { 
                                         }, 
                                         function(error) { 
                                         });                                  
            }else if (device_type==='AP') {                               
                window.open('https://itunes.apple.com/in/app/slps/id1041813405?mt=8'); 
            }
        }   
    }
    
    function logoutFromApp(){             
        var db = app.getDb();
        db.transaction(updateAppTables, updateAppTablesError, updateAppTablesSuccess);
    }
    
    function updateAppTables(tx) {
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
        
            var query = "DELETE FROM ORG_EVENT";
            app.deleteQuery(tx, query);
        
            var query = "DELETE FROM ORG_NEWS";
            app.deleteQuery(tx, query);

            var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
            app.deleteQuery(tx, query);

            var query = "DELETE FROM ADMIN_ORG_GROUP";
            app.deleteQuery(tx, query);
                
            var query = 'UPDATE PROFILE_INFO SET login_status=0';
            app.updateQuery(tx, query);
    }

    function updateAppTablesSuccess() {
            localStorage.setItem("loginStatusCheck", 0);
            window.location.href = "index.html";
    }

    function updateAppTablesError(err) {
            
    }
    
    var onSelectTabStrip = function(e){
        if(e.item.text()==="Call us"){
            makeCall();
        }else{
            mailTo();
        }        
    }
    
    var makeCall = function() {
        console.log('call');
        window.location.href = 'tel:+91-'+app.SUPPORT_NO;
        //document.location.href = 'tel:+91-971-781-8898';
    };

    var mailTo = function(){
        var platform;
        var device_type = localStorage.getItem("DEVICE_TYPE");  
        var appVersion = localStorage.getItem("AppVersion");
        var phoneNo = localStorage.getItem("username");
        var deviceName = device.model;
        var deviceVersion = device.version;
        
        if (device_type==='AN') {                     
            platform="Android";
        }else{
            platform="iOS";    
        }
        
        window.location.href = "mailto:"+app.SUPPORT_MAIL+"?subject=Feedback on "+app.APP_NAME+" for "+platform+"&body=%0D%0A%0D%0A%0D%0A%0D%0A%0D%0A"+app.APP_NAME+" Version : "+appVersion+"%0D%0A Device Name : "+deviceName+" %0D%0A Android Version : "+deviceVersion+" %0D%0A Phone No :"+phoneNo;
    }
    
    return {
        CLIENT_APP_ID:CLIENT_APP_ID,
        APP_NAME:APP_NAME,
        shareMsgContent:shareMsgContent,
        showActionSheet:showActionSheet,
        SD_NAME:SD_NAME,
        showAlert: showAlert,
        showError: showError,
        showAppLoader:showAppLoader,
        hideAppLoader:hideAppLoader,
        genRandNumber:genRandNumber,
        serverUrl:serverUrl,
        makeCall:makeCall,
        SUPPORT_MAIL:SUPPORT_MAIL,
        SUPPORT_NO:SUPPORT_NO,
        onSelectTabStrip:onSelectTabStrip,
        getFileExtension:getFileExtension,
        refreshBtn:refreshBtn,
        triggerDrawer2:triggerDrawer2,
        triggerDrawer1:triggerDrawer1,
        shareMessageViaWhatsApp:shareMessageViaWhatsApp,
        shareImagesViaFacebook:shareImagesViaFacebook,
        shareMessageAndURLViaTwitter:shareMessageAndURLViaTwitter,
        shareSuccess:shareSuccess,
        socialShare:socialShare,
        shareMessageViaSMS:shareMessageViaSMS,
        shareViaEmail:shareViaEmail,
        onLoad:onLoad,
        mailTo:mailTo,
        shareMessageError:shareMessageError,
        shareError:shareError,
        showAppVersion:showAppVersion,
        noGroupAvailable:noGroupAvailable,
        noGroupAvailableOTO:noGroupAvailableOTO,
        callUserLogin:callUserLogin,
        callOrganisationLogin:callOrganisationLogin,
        callAdminOrganisationList:callAdminOrganisationList,
        replyUser:replyUser,
        timeConverter:timeConverter,
        getMonthData:getMonthData,
        toTitleCase:toTitleCase,
        checkIfFileExists:checkIfFileExists,
        sendNotification:sendNotification,
        errorCB:errorCB,
        successCB:successCB,
        formatTime:formatTime,
        getPresentDateTime:getPresentDateTime,
        checkSimulator:checkSimulator,
        getDb:getDb,
        NO_GROUP_AVAILABLE:NO_GROUP_AVAILABLE,
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
        generateMoniterForAdmin:generateMoniterForAdmin,
        getDateMonth:getDateMonth,
        getDateDays:getDateDays,
        getYear: getYear,
        getDeviceID:getDeviceID,
        INTERNET_ERROR:INTERNET_ERROR,
        ERROR_MESSAGE:ERROR_MESSAGE,
        NO_ACCESS:NO_ACCESS,
        BASE_COLOR:BASE_COLOR,
        ILLEGAL_CHARS:ILLEGAL_CHARS,
        SESSION_EXPIRE:SESSION_EXPIRE,
        VERIFICATION_CODE_SEND:VERIFICATION_CODE_SEND,
        VERIFICATION_CODE_NOT_SEND:VERIFICATION_CODE_NOT_SEND,
        ENTER_CORRECT_V_CODE:ENTER_CORRECT_V_CODE,
        No_MEMBER_TO_ADD:No_MEMBER_TO_ADD,
        LOGIN_ANOTHER_DEVICE:LOGIN_ANOTHER_DEVICE,
        COMMENT_REPLY:COMMENT_REPLY,
        deviceId_Not_Receive:deviceId_Not_Receive,
        NOTIFICATION_MSG_NOT_SENT:NOTIFICATION_MSG_NOT_SENT,
        NOTIFICATION_MSG_SENT:NOTIFICATION_MSG_SENT,
        NOTIFICATION_MSG_SCHEDULED:NOTIFICATION_MSG_SCHEDULED,
        NEWS_ADDED_MSG:NEWS_ADDED_MSG,
        TIMETABLE_ADDED_MSG:TIMETABLE_ADDED_MSG,
        NEWS_EVENT_FAIL:NEWS_EVENT_FAIL,
        TIMETABLE_EVENT_FAIL:TIMETABLE_EVENT_FAIL,
        NEWS_UPDATED_MSG:NEWS_UPDATED_MSG,
        TIMETABLE_UPDATED_MSG:TIMETABLE_UPDATED_MSG,
        NEWS_DELETED_MSG:NEWS_DELETED_MSG,
        TIMETABLE_DELETED_MSG:TIMETABLE_DELETED_MSG,
        EVENT_ADDED_MSG:EVENT_ADDED_MSG,
        CANNOT_CANCEL:CANNOT_CANCEL,
        EXIT_APP:EXIT_APP,
        rateUs:rateUs,
        GEO_PLACE_API:GEO_PLACE_API,
        DOWNLOAD_COMPLETED:DOWNLOAD_COMPLETED,
        GEO_MAP_API:GEO_MAP_API,
        ADMIN_IFRAME_OPEN:ADMIN_IFRAME_OPEN,
        USER_IFRAME_OPEN:USER_IFRAME_OPEN,
        DELETE_CONFIRM:DELETE_CONFIRM,
        SOCIAL_SHARE_ERROR_MSG:SOCIAL_SHARE_ERROR_MSG,
        getSendNotiDateTime:getSendNotiDateTime,
        getCurrentDateTime:getCurrentDateTime,
        newGetCurrentDateTime:newGetCurrentDateTime,
        EVENT_UPDATED_MSG:EVENT_UPDATED_MSG,
        EVENT_DELETED_MSG:EVENT_DELETED_MSG,
        GROUP_UPDATED_MSG:GROUP_UPDATED_MSG,
        PRESENT_CONFIRM:PRESENT_CONFIRM,
        ABSENT_CONFIRM:ABSENT_CONFIRM,
        DOWNLOAD_NOT_COMPLETE:DOWNLOAD_NOT_COMPLETE,
        NO_GROUP_AVAILABLE_OTO:NO_GROUP_AVAILABLE_OTO,
        VIDEO_ALY_DOWNLOAD:VIDEO_ALY_DOWNLOAD,
        MEMBER_DELETED_MSG:MEMBER_DELETED_MSG,
        SELECT_MEMBER_TO_DELETE:SELECT_MEMBER_TO_DELETE,
        MEMBER_DETAIL_UPDATED_MSG:MEMBER_DETAIL_UPDATED_MSG,
        MEMBER_ADDED_MSG:MEMBER_ADDED_MSG,
        FORGET_PASSWORD_CODE_SEND:FORGET_PASSWORD_CODE_SEND
    };
})(window);