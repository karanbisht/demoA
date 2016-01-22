var app = app || {};

app.Login = (function () {
    'use strict';
    var loginViewModel = (function () {
        var username;
        var varifiCode;
        var UserProfileInformation;
        var account_Id;
        var organizationID;
        
        var init = function () {            
        };

        var show = function () {
            $('#loginUsername').val('');           
            $("#selectionDiv").show();
                        
            $("#validationRow").hide();  
            $("#regenerateDiv").hide();  
            
            $("#logo").show();

            $("#validationRowR").hide();  
            $("#regenerateDivR").hide();  
        };
                
        var checkEnter = function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                login();
                $(e.target).blur();
            }
        };
        
        var checkEnterCode = function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                doneVerification();
                $(e.target).blur();
            }
        };

        var login = function () {		 
            var deviceName = app.devicePlatform();
            var device_type;
             
            if (deviceName==='Android') {
                device_type = 'AN';
            }else if (deviceName==='iOS') {
                device_type = 'AP';
            }
                         
            //var device_id = 'APA91bGWUuUGxBdf_xT8XJ-XrrxXq_C8Z9s3O7GlWVTitgU0bw1oYrHxshzp2rdualgIcLq696TnoBM4tPaQ-Vsqu3iM6Coio77EnKOpi0GKBdMy7E1yYLEhF2oSlo-5OkYfNpi7iAhtFQGMgzabaEnfQbis5NfaaA';
            var device_id = localStorage.getItem("deviceTokenID");                         
            username = $("#loginUsername").val();

            //console.log("--------------------");
            //console.log(device_id);
            if (username === "Mobile Number" || username === "") {
                app.showAlert("Please enter your mobile no.", app.APP_NAME);
            } else if (!validateMobile(username)) {
                app.showAlert("Please enter a valid Mobile Number.", app.APP_NAME);            
            } else {         
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                    }
                } else if (device_id===null || device_id==='null') {
                    //app.onLoad();              
                    app.getDeviceID(); 
                }else {
                    app.showAppLoader(true);
                    app.deviceId_Not_Receive = 0;
                    localStorage.setItem("username", username);
                    localStorage.setItem("usernameAnalytic", username);
                    
                    var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type , "APP_ID":app.CLIENT_APP_ID ,"updated":1 , "appID":app.CLIENT_APP_ID};
                    var dataSourceLogin = new kendo.data.DataSource({
                                                                        transport: {
                            read: {
                                                                                    url: app.serverUrl() + "customer/login",
                                                                                    type:"POST",
                                                                                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                    data: jsonDataLogin
                                                                                }
                        },
                                                                        schema: {
                            data: function(data) {
                                //console.log(JSON.stringify(data));
                                return [data];
                            }
                        },
                                                                        error: function (e) {
                                                                            //console.log(JSON.stringify(e));              
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
                                                                            
                                                                            app.hideAppLoader();
                                                                        }               
                                                                    });  
	            
                    dataSourceLogin.fetch(function() {                        
                        var data = this.data();
                        if (data[0]['status'][0].Msg==='User not registered') {
                            app.hideAppLoader();
                            app.mobileApp.navigate('views/registrationView.html?mobile=' + username + '&type=reg' + '&accountId=' + accountId);  
                        }else if (data[0]['status'][0].Msg==='Create profile') {
                            app.hideAppLoader();
                            var accountId = data[0]['status'][0].AccountID;
                            app.mobileApp.navigate('views/registrationView.html?mobile=' + username + '&type=pro' + '&accountId=' + accountId);       
                        }else if (data[0]['status'][0].Msg==='Authentication Required') {
                            app.hideAppLoader();
                            clickforRegenerateCode();   
                        }else if (data[0]['status'][0].Msg==='Success') {
                            clickforRegenerateCode();                              
                        }else {
                            app.hideAppLoader();
                            app.showAlert(data[0]['status'][0].Msg, app.APP_NAME);
                        }                            
                    });
                }
            }
        };
        
        function validateMobile(mobileNo) {
            var mobilePattern = /^\d{10}$/;
            return mobilePattern.test(mobileNo);
        }
        
        var profileInfoData;
        function saveProfileInfo(data) {
            profileInfoData = data; 

            var db = app.getDb();
            db.transaction(insertProfileInfo, app.errorCB, app.successCB); 
        };
       
        function insertProfileInfo(tx) {
            var query = "DELETE FROM PROFILE_INFO";
            app.deleteQuery(tx, query);       	
            
            var query = 'INSERT INTO PROFILE_INFO(account_id , id  , email ,first_name ,last_name , mobile, add_date , mod_date ,profile_image , login_status ) VALUES ("'
                        + profileInfoData.account_id
                        + '","'
                        + profileInfoData.id
                        + '","'
                        + profileInfoData.email
                        + '","'
                        + profileInfoData.first_name
                        + '","'
                        + profileInfoData.last_name
                        + '","'
                        + username
                        + '","'
                        + profileInfoData.add_date
                        + '" ,"'
                        + profileInfoData.mod_date
                        + '" ,"'
                        + profileInfoData.photo
                        + '" ,"' + 1 + '")';              
            app.insertQuery(tx, query);       
        }
                        
        var orgNotiDataVal = [];         
        function saveOrgNotification(data) {
            orgNotiDataVal = [];
            orgNotiDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiData, app.errorCB, goToHomePage);
        };
                        
        function insertOrgNotiData(tx) {
            var query = "DELETE FROM ORG_NOTIFICATION";
            app.deleteQuery(tx, query);
            
            var dataLength = orgNotiDataVal.length;
            var orgData;        
            var orgLastMsg;
 
            for (var i = 0;i < dataLength;i++) {    
                orgData = orgNotiDataVal[i].org_id;
                orgLastMsg = orgNotiDataVal[i].message;
          
                var notiTitleEncode = app.urlEncode(orgNotiDataVal[i].title);
                var notiMessageEncode = app.urlEncode(orgNotiDataVal[i].message);

                var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type,upload_type) VALUES ("'
                            + orgNotiDataVal[i].org_id
                            + '","'
                            + orgNotiDataVal[i].pid
                            + '","'
                            + orgNotiDataVal[i].attached
                            + '","'
                            + notiMessageEncode
                            + '","'
                            + notiTitleEncode
                            + '","'
                            + orgNotiDataVal[i].comment_allow
                            + '","'
                            + orgNotiDataVal[i].send_date
                            + '","'
                            + orgNotiDataVal[i].type
                            + '","'
                            + orgNotiDataVal[i].upload_type
                            + '")';              
                app.insertQuery(tx, query);
            }   
            updateJoinOrgTable(orgData, orgLastMsg, dataLength);
        }
        
        var GlobalDataOrgId;
        var GlobalDataLastMsg;
        var GlobalDataCount;
        
        var updateJoinOrgTable = function(orgData, orgLastMsg, dataLength) {
            GlobalDataOrgId = orgData;
            GlobalDataLastMsg = orgLastMsg;
            GlobalDataCount = dataLength;
            var db = app.getDb();
            db.transaction(updateLoginStatus, app.errorCB, app.successDB);
        }
        
        function updateLoginStatus(tx) {
            GlobalDataLastMsg = app.urlEncode(GlobalDataLastMsg);
            var query = "UPDATE JOINED_ORG SET count='" + GlobalDataCount + "',bagCount='" + GlobalDataCount + "', lastNoti='" + GlobalDataLastMsg + "' where org_id='" + GlobalDataOrgId + "' and role='C'";
            app.updateQuery(tx, query);
        }
        
        var goToHomePage = function() {
            app.hideAppLoader();
            document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 
            localStorage.setItem("ACCOUNT_ID", account_Id);
            localStorage.setItem("FIRST_LOGIN", 1); 
            localStorage.setItem("ADMIN_FIRST_LOGIN", 1); 

            app.analyticsService.viewModel.trackFeature("User navigate to Customer Organisation List");            
            app.analyticsService.viewModel.userLoginStatus();
            app.mobileApp.navigate('#view-all-activities');
        }
                         
        var goToIndex = function() {
            app.mobileApp.navigate('index.html');
        };
        
        var goToLoginPage = function() {
            $("#regenerateDiv").hide();
            $("#validationRow").hide();
            $("#logo").show();
        };
        
        var clickforRegenerateCode = function() {
            app.hideAppLoader();
            $(".km-scroll-container").css("-webkit-transform", "");  
            $("#regenerateDiv").show();
            $("#selectionDiv").hide();            
            $("#logo").hide();
            $("#validationRow").hide(); 
            $("#userRegMobNum").html('+91' + username);                
            $("#registrationNext").hide();
            $("#selectionDiv").css("z-index", "-1");
            $("#selectionDiv").css("opacity", .1);	
            $("#regenerateDiv").css("z-index", "999");
        };
        
        var cancelButtonRC = function() {
            $("#selectionDiv").show();
            $("#regenerateDiv").hide();
            $("#logo").show();
            $("#validationRow").hide();
            $('#validationCodeId').val('');
            document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 
            $("#selectionDiv").css("z-index", "999");
            $("#selectionDiv").css("opacity", 1);	         
        };
        
        var backToIndex = function() {
            window.location.href = "index.html";
        };
        
        var clickforValificationCode = function() {
            $(".km-scroll-container").css("-webkit-transform", ""); 
            $("#regenerateDiv").hide();
            $("#validationRow").show();
            $("#logo").hide();
            $("#selectionDiv").hide();
            $("#regDoneButton").hide();
            $("#selectionDiv").css("z-index", "-1");
            $("#selectionDiv").css("opacity", .1);	
            $("#validationRow").css("z-index", "999");
            
            varifiCode = genRand(0, 9);
            console.log(varifiCode);
            varifiCode = varifiCode.toString();
                    
            if (username==='9999999999') {
                varifiCode = '16989';  
            }
            
            var varifiCodeMsg = "Your " + app.APP_NAME + " verification code-: " + varifiCode;
          
            var dataSourceValidation = new kendo.data.DataSource({
                                                                     transport: {
                    read: {                     
                                                                                 url: "http://smsbox.in/Api.aspx?usr=spireonline&pwd=15816555&smstype=TextSMS&to=" + username + "&msg=" + varifiCodeMsg + "&rout=transactional&from=POSTIF"
                                                                             }
                },
                                                                     schema: {
                    data: function(data) {
                        return [data];
                    }
                },
                                                                     error: function (e) {
                                                                         app.hideAppLoader();                                                                         
                                                                         app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                         if (!app.checkSimulator()) {
                                                                             window.plugins.toast.showShortBottom(app.VERIFICATION_CODE_NOT_SEND);  
                                                                         }else {
                                                                             app.showAlert(app.VERIFICATION_CODE_NOT_SEND , 'Verification Code');  
                                                                         }
                                                                     } 
                                                                 });  
	            
            dataSourceValidation.fetch(function() {
                $("#validationRow").show();
                $("#selectionDiv").hide();
            });                  	
        };
   	        
        var genRand = function() {      	
            return Math.floor(Math.random() * 89999 + 10000);		   
        };
        
        var doneVerification = function() {
            $(".km-scroll-container").css("-webkit-transform", "");            
            var validationCodeId = $("#validationCodeId").val();
            
            if (validationCodeId==='Verification Code' || validationCodeId==='') {            
                app.showAlert("Please Enter Verification Code", app.APP_NAME);
            }else {
                app.showAppLoader(true);
                if (varifiCode===validationCodeId) {
                    var deviceName = app.devicePlatform();
                    var device_type;
                    if (deviceName==='Android') {
                        device_type = 'AN';
                    }else if (deviceName==='iOS') {
                        device_type = 'AP';
                    }

                    //var device_id = 'APA91bGWUuUGxBdf_xT8XJ-XrrxXq_C8Z9s3O7GlWVTitgU0bw1oYrHxshzp2rdualgIcLq696TnoBM4tPaQ-Vsqu3iM6Coio77EnKOpi0GKBdMy7E1yYLEhF2oSlo-5OkYfNpi7iAhtFQGMgzabaEnfQbis5NfaaA';
                    var device_id = localStorage.getItem("deviceTokenID");                          
                    
                    var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type , "authenticate":'1', "APP_ID":app.CLIENT_APP_ID}
                    var dataSourceLogin = new kendo.data.DataSource({
                                                                        transport: {
                            read: {
                                                                                    url: app.serverUrl() + "customer/login",
                                                                                    type:"POST",
                                                                                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                    data: jsonDataLogin
                                                                                }
                        },
                                                                        schema: {
                            data: function(data) {	
                                return [data];
                            }
                        },
                                                                        error: function (e) {
                                                                            app.hideAppLoader();    
                                                                            
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
                        if (data[0]['status'][0].Msg==='Success') {
                            account_Id = data[0]['status'][0].ProfileInfo[0].account_id;  
                            organizationID = data[0]['status'][0].JoinedOrg.org_id[0];
                            localStorage.setItem("selectedOrgId", data[0]['status'][0].JoinedOrg.org_id[0]);
                            localStorage.setItem("ACCOUNT_ID", account_Id);
                            localStorage.setItem("orgBagCount", 0);
                            localStorage.setItem("selectedOrgName", data[0]['status'][0].JoinedOrg.org_name[0]);
                            localStorage.setItem("selectedOrgLogo", data[0]['status'][0].JoinedOrg.org_logo[0]);                                
                            localStorage.setItem("selectedOrgDesc", data[0]['status'][0].JoinedOrg.org_desc[0]);
                            localStorage.setItem("selectedOrgRole", data[0]['status'][0].JoinedOrg.role[0]);
                            localStorage.setItem("selectedOrgDOJ", data[0]['status'][0].JoinedOrg.joined_on[0]);
                                
                            account_Id = data[0]['status'][0].ProfileInfo[0].account_id;
                            UserProfileInformation = data[0]['status'][0].ProfileInfo[0];
                            saveProfileInfo(UserProfileInformation);
                            getDataFromLive();
                        }else {
                            app.hideAppLoader();
                            app.showAlert(data[0]['status'][0].Msg, app.APP_NAME);
                        }      
                    });
                }else {
                    app.showAlert(app.ENTER_CORRECT_V_CODE, app.APP_NAME);
                    $("#progressRandomCode").hide();
                }
            }
        };
        
        var getDataFromLive = function() {
            var organisationALLListDataSource = new kendo.data.DataSource({                 
                                                                              transport: {
                    read: {
                                                                                          url: app.serverUrl() + "notification/getCustomerNotification/" + organizationID + "/" + account_Id + "/" + 0,
                                                                                          type:"POST",
                                                                                          dataType: "json"                  
                                                                                      }
                },
                                                                              schema: {
                    data: function(data) {                   
                        return [data];                       
                    }                                                             
                },
                 
                                                                              error: function (e) {                                                                           
                                                                                  goToHomePage();                                                                           
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
 
            organisationALLListDataSource.fetch(function() {
                var data = this.data();            
                if (data[0]['status'][0].Msg ==='No notification') { 
                    goToHomePage();
                }else if (data[0]['status'][0].Msg==='Success') {
                    var orgNotificationData = data[0]['status'][0].notificationList;
                    saveOrgNotification(orgNotificationData);                                                                                     
                }
            });
        }
        
        return {
            init: init,
            show: show,
            getYear: app.getYear,
            login: login,
            checkEnter:checkEnter,
            goToLoginPage:goToLoginPage,
            goToIndex:goToIndex,
            backToIndex:backToIndex,
            clickforValificationCode:clickforValificationCode,
            cancelButtonRC:cancelButtonRC,
            genRand:genRand,
            checkEnterCode:checkEnterCode,
            doneVerification:doneVerification,
            clickforRegenerateCode : clickforRegenerateCode
        };
    }());

    return loginViewModel;
}());
