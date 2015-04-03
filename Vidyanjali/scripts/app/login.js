/**
 * Login view model
 */
var app = app || {};

app.Login = (function () {
    'use strict';

    var loginViewModel = (function () {
        //var isInMistSimulator = (location.host.indexOf('icenium.com') > -1);
        var username;
        var varifiCode;
        var userType = [];
        var UserProfileInformation;
        var account_Id;
        
        //var isAnalytics = analytics.isAnalytics();
               
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
            if (e.keyCode === 13) {
                login();
                $(e.target).blur();
            }
        };
        
        var checkEnterCode = function (e) {
            if (e.keyCode === 13) {
                doneVerification();
                $(e.target).blur();
            }
        };
       
        // Authenticate to use Backend Services as a particular user

        var login = function () {		 
            var deviceName = app.devicePlatform();
            var device_type;
             
            if (deviceName==='Android'){
                device_type = 'AN';
            }else if (deviceName==='iOS') {
                device_type = 'AP';
            }
                         
            //var device_id = 'APA91bGWUuUGxBdf_xT8XJ-XrrxXq_C8Z9s3O7GlWVTitgU0bw1oYrHxshzp2rdualgIcLq696TnoBM4tPaQ-Vsqu3iM6Coio77EnKOpi0GKBdMy7E1yYLEhF2oSlo-5OkYfNpi7iAhtFQGMgzabaEnfQbis5NfaaA';
            var device_id = localStorage.getItem("deviceTokenID");          
            //console.log(device_id);            
            username = $("#loginUsername").val();
            //console.log(username);
            
            if (username === "Mobile Number" || username === "") {
                app.showAlert("Please enter your Mobile No.", "Validation Error");
            } else if (!validateMobile(username)) {
                app.showAlert("Please enter a valid Mobile Number.", "Validation Error");
            } else {         
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                    } 
                }else {
                    $("#progress").show();
                    console.log(username + "||" + device_id + "||" + device_type);
                    localStorage.setItem("username", username); 
                    //console.log('--------static server URL-----' + app.serverUrl());
                    var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type , "APP_ID":app.CLIENT_APP_ID}
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
                                                                            //console.log(e);
                                                                            console.log(JSON.stringify(e));
                         
                                                                            if (!app.checkSimulator()) {
                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                                                                            }else {
                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline');  
                                                                            } 
             
                                                                            $("#progress").hide();

                                                                            app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                        }               
                                                                    });  
	            
                    dataSourceLogin.fetch(function() {                        
                        var data = this.data();
                            if (data[0]['status'][0].Msg==='User not registered') {
                                $("#progress").hide();                                                    
                                app.mobileApp.navigate('views/registrationView.html?mobile=' + username + '&type=reg');  
                            }else if (data[0]['status'][0].Msg==='Create profile') {
                                $("#progress").hide();
                                var accountId = data[0]['status'][0].AccountID;
                                app.mobileApp.navigate('views/registrationView.html?mobile=' + accountId + '&type=pro');       
                            }else if (data[0]['status'][0].Msg==='Authentication Required') {
                                $("#progress").hide();
                                clickforRegenerateCode();   
                            }else if (data[0]['status'][0].Msg==='Success') {
                                clickforRegenerateCode();                              
                                if (data[0]['status'][0].JoinedOrg.length!==0) {
                                    //saveOrgInfo(UserOrgInformation);              
                                }
                            }else {
                                $("#progress").hide();
                                app.showAlert(data[0]['status'][0].Msg, "Notification");
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
        var profileOrgData;
        function saveProfileInfo(data) {
            profileInfoData = data; 

            var db = app.getDb();
            db.transaction(insertProfileInfo, app.errorCB, goToHomePage); 

            
            /*if (JoinedOrganisationYN===0) {
                var db = app.getDb();
                db.transaction(insertProfileInfo, app.errorCB, goToHomePage); 
            }else {
                var db = app.getDb();
                //db.transaction(insertProfileInfo, app.errorCB, app.successCB); 
                db.transaction(insertProfileInfo, app.errorCB, goToHomePage);  
            }*/
        };
        
        function saveOrgInfo(data1) {
            profileOrgData = data1; 
            var db = app.getDb();
            db.transaction(insertOrgInfo, app.errorCB, loginSuccessCB);
        };
        
        var userAccountID;
        
        function insertProfileInfo(tx) {
            var query = "DELETE FROM PROFILE_INFO";
            app.deleteQuery(tx, query);       	
            userAccountID = profileInfoData.account_id;
            
            var query = 'INSERT INTO PROFILE_INFO(account_id , id  , email ,first_name ,last_name , mobile, add_date , mod_date , login_status ) VALUES ("'
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
                        + '" ,"' + 1 + '")';              
            app.insertQuery(tx, query);       
        }
        
        var userOrgIdArray = [];
        //var userRoleArray=[];  
        
        function insertOrgInfo(tx) {
            var query = "DELETE FROM JOINED_ORG";
            app.deleteQuery(tx, query);
            var dataLength = profileOrgData.org_id.length;
            for (var i = 0;i < dataLength;i++) {                  
                if (profileOrgData.role[i]==='C') {
                    userOrgIdArray.push(profileOrgData.org_id[i]);
                }           
           
                //alert(profileOrgData.org_name[i]);
           
                //userRoleArray.push(profileOrgData.role[i]);           
                var query = 'INSERT INTO JOINED_ORG(org_id , org_name , role , imageSource , joinedDate , orgDesc) VALUES ("'
                            + profileOrgData.org_id[i]
                            + '","'
                            + profileOrgData.org_name[i]
                            + '","'
                            + profileOrgData.role[i]
                            + '","'
                            + profileOrgData.org_logo[i]
                            + '","'
                            + profileOrgData.joined_on[i]
                            + '","'
                            + profileOrgData.org_desc[i]
                            + '")';              
                app.insertQuery(tx, query);
            }                               
        }  

        function loginSuccessCB() {
            //console.log('DataBase Saved');
            //console.log(userOrgIdArray);
            //console.log(userRoleArray);
            for (var i = 0;i < userOrgIdArray.length;i++) {
                // console.log(userOrgIdArray[i]);
                // console.log(userAccountID);
                var organisationALLListDataSource = new kendo.data.DataSource({
                 
                                                                                  transport: {
                        read: {
                                                                                              url: app.serverUrl() + "notification/getCustomerNotification/" + userOrgIdArray[i] + "/" + userAccountID + "/" + 0,
                                                                                              type:"POST",
                                                                                              dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                          }
                    },
                                                                                  schema: {
                        data: function(data) {	
                            var datacheck = 0;
                            var allData = 0;
                            // console.log(data);
                       
                            var orgNotificationData; 
                            $.each(data, function(l, groupValue) {
                                // console.log(groupValue);                                     
                                allData++;
                                $.each(groupValue, function(m, orgVal) {
                                    //console.log();                   	             
                                    if (orgVal.Msg ==='No notification') {     
                                        datacheck++;                                        
                                    }else if (orgVal.Msg==='Success') {
                                        // console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        setTimeout(function() {  
                                            saveOrgNotification(orgNotificationData);
                                        }, 10);  
                                    }                                     
                                });    
                            });
                            if (allData===datacheck) {
                                goToHomePage();
                            }
                            return [data];
                        }                                                            
                    },
                 
                                                                                  error: function (e) {
                                                                                      e.preventDefault();
                                                                                      app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));                       
                                                                                  }	        
                                                                              });         
            
                organisationALLListDataSource.read();
            }
        };
                        
        var orgNotiDataVal;         
        function saveOrgNotification(data) {
            orgNotiDataVal = data; 
            //console.log(orgNotiDataVal);

            setTimeout(function() {
                var db = app.getDb();
                db.transaction(insertOrgNotiData, app.errorCB, app.successCB);
            }, 10);   
        };
                        
        function insertOrgNotiData(tx) {
            //var query = "DELETE FROM ORG_NOTIFICATION";
            //app.deleteQuery(tx, query);         
            var dataLength = orgNotiDataVal.length;
            //alert('LiveDataVal'+dataLength);
         
            var orgData;
            var orgLastMsg;
          
            for (var i = 0;i < dataLength;i++) {   
                orgData = orgNotiDataVal[i].org_id;
                orgLastMsg = orgNotiDataVal[i].message;
           
                var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type) VALUES ("'
                            + orgNotiDataVal[i].org_id
                            + '","'
                            + orgNotiDataVal[i].pid
                            + '","'
                            + orgNotiDataVal[i].attached
                            + '","'
                            + orgNotiDataVal[i].message
                            + '","'
                            + orgNotiDataVal[i].title
                            + '","'
                            + orgNotiDataVal[i].comment_allow
                            + '","'
                            + orgNotiDataVal[i].send_date
                            + '","'
                            + orgNotiDataVal[i].type
                            + '")';              
                app.insertQuery(tx, query);
            }                                          
            updateJoinOrgTable(orgData, orgLastMsg, dataLength);
        }
        
        var goToHomePage = function() {
            //app.mobileApp.pane.loader.hide();
            $("#progress").hide();
            document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 

            $("#progressRandomCode").hide();                             
            localStorage.setItem("ACCOUNT_ID", account_Id);
            localStorage.setItem("FIRST_LOGIN", 1); 
            localStorage.setItem("ADMIN_FIRST_LOGIN", 1); 

            app.analyticsService.viewModel.trackFeature("User navigate to Customer Organisation List");            
            app.analyticsService.viewModel.userLoginStatus();
            app.mobileApp.navigate('#view-all-activities');
            
            //app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Login');
        }
                 
        var GlobalDataOrgId;
        var GlobalDataLastMsg;
        var GlobalDataCount;
        
        var updateJoinOrgTable = function(orgData, orgLastMsg, dataLength) {
            GlobalDataOrgId = orgData;
            GlobalDataLastMsg = orgLastMsg;
            GlobalDataCount = dataLength;
            var db = app.getDb();
            db.transaction(updateLoginStatus, app.errorCB, goToHomePage);
        }
        
        function updateLoginStatus(tx) {
            //console.log(GlobalDataOrgId+"||"+GlobalDataLastMsg+"||"+GlobalDataCount);     
            var query = "UPDATE JOINED_ORG SET count='" + GlobalDataCount + "',bagCount='" + GlobalDataCount + "', lastNoti='" + GlobalDataLastMsg + "' where org_id='" + GlobalDataOrgId + "' and role='C'";
            app.updateQuery(tx, query);
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
            $("#progress").hide();            
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
            /*$(".km-scroll-container").css("-webkit-transform", "");
            $("#regenerateDiv").hide();
            $("#validationRow").hide(); 
            document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 
            $("#selectionDiv").css("z-index", "1");
            $("#selectionDiv").css("opacity", 1);
            $("#regDoneButton").show();*/
            $("#selectionDiv").show();
            $("#regenerateDiv").hide();
            $("#logo").show();
            $("#validationRow").hide();
            $('#validationCodeId').val('');
            document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 
            $("#selectionDiv").css("z-index", "999");
            $("#selectionDiv").css("opacity", 1);	
            //app.mobileApp.navigate('main.html');
            //window.location.href = "main.html"; 
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
              
            var varifiCodeMsg = "Your "+ app.APP_NAME+" verification code-: " + varifiCode;
          
            //console.log("-----Verification code Login--" + varifiCode);

            var dataSourceValidation = new kendo.data.DataSource({
                                                                     transport: {
                                                                            read: {                     
                                                                                 url: "http://smsbox.in/Api.aspx?usr=spireonline&pwd=15816555&smstype=TextSMS&to=" + username + "&msg=" + varifiCodeMsg + "&rout=transactional&from=Zaffio"
                                                                             }
                },
                                                                     schema: {
                    data: function(data) {
                        console.log('--------Verification Code Sent-----------------');
                        return [data];
                    }
                },
                                                                     error: function (e) {
                                                                         console.log(JSON.stringify(e));
                                                                         app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                         $("#progress").hide();
                                                                         if (!app.checkSimulator()) {
                                                                             window.plugins.toast.showLongBottom(app.VERIFICATION_CODE_NOT_SEND);  
                                                                         }else {
                                                                             app.showAlert(app.VERIFICATION_CODE_NOT_SEND , 'Verification Code');  
                                                                         }
                                                                     } 
                                                                 });  
	            
            dataSourceValidation.fetch(function() {
                //var registrationDataView = dataSourceValidation.data();
                $("#validationRow").show();
                $("#selectionDiv").hide();
            });                  	
        };
   	        
        var genRand = function() {      	
            return Math.floor(Math.random() * 89999 + 10000);		   
            return Math.floor(Math.random() * 89999 + 10000);		   
        };
        
        var doneVerification = function() {
            //varifiCode='123456';
            $(".km-scroll-container").css("-webkit-transform", "");            
            var validationCodeId = $("#validationCodeId").val();
            
            if (validationCodeId==='Verification Code' || validationCodeId==='') {            
                app.showAlert("Please Enter Verification Code", "Notification");
            }else {
                $("#progressRandomCode").show();
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
                    //console.log(device_id);
                    
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
                                console.log(JSON.stringify(data));
                                return [data];
                            }
                        },
                                                                        error: function (e) {
                                                                            console.log(JSON.stringify(e));
                                                                            $("#progressRandomCode").hide();
                                                                            app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                            if (!app.checkConnection()) {
                                                                                if (!app.checkSimulator()) {
                                                                                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                                                                                }else {
                                                                                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                                                                                }                
                                                                            }
                                                                        }               
                                                                    });  

                    dataSourceLogin.fetch(function() {
                        //var loginDataView = dataSourceLogin.data();
                        var data = this.data();       
                            if (data[0]['status'][0].Msg==='Success') {
                                account_Id = data[0]['status'][0].ProfileInfo[0].account_id;  
                                
                                localStorage.setItem("selectedOrgId", data[0]['status'][0].JoinedOrg.org_id[0]);
                                localStorage.setItem("ACCOUNT_ID", account_Id);
                                localStorage.setItem("orgBagCount", 0);
                                localStorage.setItem("selectedOrgName", data[0]['status'][0].JoinedOrg.org_name[0]);
                                localStorage.setItem("selectedOrgLogo", data[0]['status'][0].JoinedOrg.org_logo[0]);                                
                                localStorage.setItem("selectedOrgDesc", data[0]['status'][0].JoinedOrg.org_desc[0]);
                                localStorage.setItem("selectedOrgRole", data[0]['status'][0].JoinedOrg.role[0]);
                                localStorage.setItem("selectedOrgDOJ", data[0]['status'][0].JoinedOrg.joined_on[0]);
                                

                                if (data[0]['status'][0].JoinedOrg.length!==0) { 
                                    //console.log(loginData.status[0].JoinedOrg.role.length);
                                    var roleLength = data[0]['status'][0].JoinedOrg.role.length;                          
                                    for (var i = 0;i < roleLength;i++) {
                                        userType.push(data[0]['status'][0].JoinedOrg.role[i]); 
                                    }
                                }else {
                                    //JoinedOrganisationYN = 0;
                                }   
                          
                                UserProfileInformation = data[0]['status'][0].ProfileInfo[0];
                                saveProfileInfo(UserProfileInformation);
                            }else {
                                //app.mobileApp.pane.loader.hide();
                                $("#progressRandomCode").hide();
                                app.showAlert(data[0]['status'][0].Msg, "Notification");
                            }      
                    });
                }else {
                    app.showAlert(app.ENTER_CORRECT_V_CODE, "Notification");
                    $("#progressRandomCode").hide();
                }
            }
        };

        // Authenticate using Facebook credentials
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
            clickforRegenerateRegenerateCode : clickforRegenerateCode
        };
    }());

    return loginViewModel;
}());
