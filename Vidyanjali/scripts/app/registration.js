
var app = app || {};

app.registration = (function () {
    'use strict'

    var registrationViewModel = (function () {
        var $regFirstName;
        var $regLastName;
        var $regEmail;
        var username;  
        var comingFrom;        
        var account_Id;
        var userType = [];
        var UserProfileInformation;
        var varifiCode;
        //var JoinedOrganisationYN = 1;
        
        var regInit = function () {
            $regFirstName = $('#regFirstName');
            $regLastName = $('#regLastName');
            $regEmail = $('#regEmail');
        };

        var addNewRegistration = function (e) {
            $regFirstName.val('');
            $regLastName.val('');
            $regEmail.val('');
            username = e.view.params.mobile;
            comingFrom = e.view.params.type;            
            account_Id = e.view.params.accountId;
            document.getElementById('selectionDivR').style.pointerEvents = 'auto'; 
            $("#selectionDivR").css("z-index", "999");
            $("#selectionDivR").css("opacity", 1);	
        };

        var registerR = function() {
            var fname = $regFirstName.val();
            var lname = $regLastName.val();
            var email = $regEmail.val();
            
            if (fname === "First Name" || fname === "") {
                app.showAlert("Please enter your First Name.", app.APP_NAME);
            }else if (lname === "Last Name" || lname === "") {
                app.showAlert("Please enter your Last Name.", app.APP_NAME);
                /*}else if (email === "Email" || email === "") {
                app.showAlert("Please enter your Email.", app.APP_NAME);*/
            } else if (email !== "Email" && email !== "" && !app.validateEmail(email)) {
                app.showAlert("Please enter a valid Email.", app.APP_NAME);
            } else {   
                app.showAppLoader();
                var jsonDataRegister;
                var goToUrl;
             
                if (comingFrom==='reg') {
                    jsonDataRegister = {"username":username,"fname":fname,"lname":lname,"email":email, "APP_ID":app.CLIENT_APP_ID};  
                    goToUrl = app.serverUrl() + "customer/register"  
                }else {
                    jsonDataRegister = {"account_id":account_Id,"first_name":fname,"last_name":lname,"email":email, "app_id":app.CLIENT_APP_ID} 
                    goToUrl = app.serverUrl() + "customer/createProfile"
                }
       
                var dataSourceRegister = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url:goToUrl ,
                                                                                   type:"POST",
                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                   data: jsonDataRegister
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
                                                                               //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                           }
                                                                       }               
                                                                   });  
	            
                dataSourceRegister.fetch(function() {
                    var data = this.data();

                    if (data[0]['status'][0].Msg==='Registration Success' || data[0]['status'][0].Msg==='Profile Created') {
                        app.mobileApp.pane.loader.hide();                                    
                        var deviceName = app.devicePlatform();
                        var device_type;
                        if (deviceName==='Android') {
                            device_type = 'AN';
                        }else if (deviceName==='iOS') {
                            device_type = 'AP';
                        }
                         
                        //var device_id='APA91bGWUuUGxBdf_xT8XJ-XrrxXq_C8Z9s3O7GlWVTitgU0bw1oYrHxshzp2rdualgIcLq696TnoBM4tPaQ-Vsqu3iM6Coio77EnKOpi0GKBdMy7E1yYLEhF2oSlo-5OkYfNpi7iAhtFQGMgzabaEnfQbis5NfaaA';            
                        var device_id = localStorage.getItem("deviceTokenID");
                
                        var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type}
       
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
                                                                                app.mobileApp.pane.loader.hide();
                                                                              
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
                                                                                    //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                }
                                                                            }               
                                                                        });  
	            
                        dataSourceLogin.fetch(function() {
                            var data = this.data();
                  
                            if (data[0]['status'][0].Msg==='Authentication Required') {
                                app.mobileApp.pane.loader.hide();
                                app.hideAppLoader();
                                clickforRegenerateCodeR();   
                            }else if (data[0]['status'][0].Msg==='Success') {
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
                                    var roleLength = data[0]['status'][0].JoinedOrg.role.length;
                                    for (var i = 0;i < roleLength;i++) {
                                        userType.push(data[0]['status'][0].JoinedOrg.role[i]); 
                                    }
                                }else {
                                    //JoinedOrganisationYN = 0;
                                } 
                          
                                if (data[0]['status'][0].JoinedOrg.length!==0) {
                                    //saveOrgInfo(UserOrgInformation);  
                                }
                     
                                UserProfileInformation = data[0]['status'][0].ProfileInfo[0];
                          
                                //db = app.getDb();
                                //db.transaction(deletePrevData, app.errorCB,PrevsDataDeleteSuccess);
                                saveProfileInfo(UserProfileInformation);                        
                            }
                        });            
                    }
                });
            }
        };
       
        var clickforValificationCodeR = function() {
            $("#regenerateDivR").hide();
            $("#validationRowR").show();
            $("#regDoneButtonR").hide();
            $("#selectionDivR").css("z-index", "-1");
            $("#selectionDivR").css("opacity", .1);	
            $("#validationRowR").css("z-index", "999");
            document.getElementById('selectionDivR').style.pointerEvents = 'none';
            document.getElementById('selectionDivR').style.pointerEvents = 'none';
            
            varifiCode = genRandR(0, 9);
            console.log(varifiCode);
            varifiCode = varifiCode.toString();
            
            if (username==='9999999999') {
                varifiCode = '12345';  
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
                                                                         //apps.hideLoading();
                                                                         //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                         if (!app.checkSimulator()) {
                                                                             window.plugins.toast.showShortBottom(app.VERIFICATION_CODE_NOT_SEND);  
                                                                         }else {
                                                                             app.showAlert(app.VERIFICATION_CODE_NOT_SEND , 'Verification Code');  
                                                                         }           
                                                                     } 
                                                                 });  
 	            
            dataSourceValidation.fetch(function() {
                $("#validationRowR").show();
            });          
        };
        
        var genRandR = function() {      	
            return Math.floor(Math.random() * 89999 + 10000);		   
        };
        
        var clickforRegenerateCodeR = function() {
            $("#regenerateDivR").show();
            $("#validationRowR").hide(); 
            $("#userRegMobNumR").html('+91' + username);                
            $("#registrationNextR").hide();
            $("#selectionDivR").css("z-index", "-1");
            $("#selectionDivR").css("opacity", .1);	
            $("#regenerateDivR").css("z-index", "999");
            document.getElementById('selectionDivR').style.pointerEvents = 'none';  
        };
        
        var cancelButtonRCR = function() {
            app.mobileApp.navigate('#welcome');
            $("#selectionDiv").show();
            $("#regenerateDivR").hide();
            $("#validationRowR").hide();
            document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 
            $("#selectionDiv").css("z-index", "999");
            $("#selectionDiv").css("opacity", 1);	

            $('#validationCodeIdR').val('');
        };
        
        var backToIndex = function() {
            window.location.href = "index.html";
        };
        
        var doneVerificationR = function() {
            var validationCodeId = $("#validationCodeIdR").val();
            if (validationCodeId==='Verification Code' || validationCodeId==='') {            
                app.showAlert("Please Enter Verification Code", app.APP_NAME);  
            }else {
                if (varifiCode===validationCodeId) {
                    var deviceName = app.devicePlatform();
                    var device_type;
                    if (deviceName==='Android') {
                        device_type = 'AN';
                    }else if (deviceName==='iOS') {
                        device_type = 'AP';
                    }

                    app.showAppLoader();
                    localStorage.setItem("alterTableYN", 1);

                    //var device_id='APA91bGWUuUGxBdf_xT8XJ-XrrxXq_C8Z9s3O7GlWVTitgU0bw1oYrHxshzp2rdualgIcLq696TnoBM4tPaQ-Vsqu3iM6Coio77EnKOpi0GKBdMy7E1yYLEhF2oSlo-5OkYfNpi7iAhtFQGMgzabaEnfQbis5NfaaA';
                    var device_id = localStorage.getItem("deviceTokenID");
                    
                    var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type , "authenticate":'1' , "APP_ID":app.CLIENT_APP_ID}
                    
                    localStorage.setItem("username", username);
                    localStorage.setItem("usernameAnalytic", username);

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
                                                                                //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                            }
                                                                        }               
                                                                    });  
	            
                    dataSourceLogin.fetch(function() {
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
                                var roleLength = data[0]['status'][0].JoinedOrg.role.length;
                                for (var i = 0;i < roleLength;i++) {
                                    userType.push(data[0]['status'][0].JoinedOrg.role[i]); 
                                }
                            }else {
                                //JoinedOrganisationYN = 0;
                            } 
                          
                            if (data[0]['status'][0].JoinedOrg.length!==0) {
                                //saveOrgInfo(UserOrgInformation);  
                            }
                     
                            UserProfileInformation = data[0]['status'][0].ProfileInfo[0];
                          
                            //db = app.getDb();
                            //db.transaction(deletePrevData, app.errorCB,PrevsDataDeleteSuccess);
                            saveProfileInfo(UserProfileInformation);                          
                        }else {
                            app.mobileApp.pane.loader.hide();
                            app.showAlert(data[0]['status'][0].Msg, app.APP_NAME);
                            app.hideAppLoader();
                        }      
                    });
                }else {
                    app.showAlert(ENTER_CORRECT_V_CODE, app.APP_NAME);    
                    app.hideAppLoader();
                }
            }
        };
        
        var profileInfoData;
        var profileOrgData;
        function saveProfileInfo(data) {
            profileInfoData = data; 
            /*if (JoinedOrganisationYN===0) {
            //var db = app.getDb();
            db.transaction(insertProfileInfo, app.errorCB, goToHomePage); 
            }else {
            var db = app.getDb();
            //db.transaction(insertProfileInfo, app.errorCB, app.successCB); 
            db.transaction(insertProfileInfo, app.errorCB, goToHomePage); 
            }*/            
            var db = app.getDb();
            db.transaction(insertProfileInfo, app.errorCB, goToHomePage); 
            //db.transaction(insertProfileInfo, app.errorCB, loginSuccessCB);
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
       
            var query = 'INSERT INTO PROFILE_INFO(account_id , id  , email ,first_name ,last_name , mobile, add_date , mod_date ) VALUES ("'
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
                        + profileInfoData.mod_date + '")';              

            app.insertQuery(tx, query);
        }
      
        var userOrgIdArray = [];
        
        function insertOrgInfo(tx) {
            var query = "DELETE FROM JOINED_ORG";
            app.deleteQuery(tx, query);

            var dataLength = profileOrgData.org_id.length;

            for (var i = 0;i < dataLength;i++) {    
                if (profileOrgData.role[i]==='C') {
                    userOrgIdArray.push(profileOrgData.org_id[i]);
                }
           
                var query = 'INSERT INTO JOINED_ORG(org_id , org_name , role , imageSource) VALUES ("'
                            + profileOrgData.org_id[i]
                            + '","'
                            + profileOrgData.org_name[i]
                            + '","'
                            + profileOrgData.role[i]
                            + '","'
                            + profileOrgData.org_logo[i]	
                            + '")';              
                app.insertQuery(tx, query);
            }                       
        }  

        function loginSuccessCB() {
            for (var i = 0;i < userOrgIdArray.length;i++) {     
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
                       
                            var orgNotificationData; 
                            $.each(data, function(l, groupValue) {
                                allData++;
                                $.each(groupValue, function(m, orgVal) {
                                    if (orgVal.Msg ==='No notification') {     
                                        datacheck++;                             
                                    }else if (orgVal.Msg==='Success') {
                                        orgNotificationData = orgVal.notificationList;
                                        saveOrgNotification(orgNotificationData);                                                                                     
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
                                                                                      //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                  }	        
                                                                              });         
            
                organisationALLListDataSource.fetch(function() {
                });
            }
        }
                        
        var orgNotiDataVal;         
        function saveOrgNotification(data) {
            orgNotiDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiData, app.errorCB, app.successCB);
        };
                        
        function insertOrgNotiData(tx) {
            var dataLength = orgNotiDataVal.length; 
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
            localStorage.setItem("ACCOUNT_ID", account_Id);
            app.mobileApp.navigate('#view-all-activities');
            app.hideAppLoader();
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
            var query = "UPDATE JOINED_ORG SET count='" + GlobalDataCount + "',lastNoti='" + GlobalDataLastMsg + "' where org_id='" + GlobalDataOrgId + "' and role='" + 'C' + "'";
            app.updateQuery(tx, query);
        }
        
        var checkEnterCode = function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                doneVerificationR();
                $(e.target).blur();
            }
        };
        
        var checkEnter = function (e) {
            if (e.keyCode === 13 || e.keyCode === 9) {
                registerR();
                $(e.target).blur();
            }
        };
        
        return {
            regInit: regInit,
            addNewRegistration: addNewRegistration,
            clickforValificationCodeR:clickforValificationCodeR,
            backToIndex:backToIndex,
            clickforRegenerateCodeR:clickforRegenerateCodeR,
            cancelButtonRCR:cancelButtonRCR,
            genRandR:genRandR,
            doneVerificationR:doneVerificationR,
            checkEnterCode:checkEnterCode,
            checkEnter:checkEnter,
            registerR: registerR
        };
    }());

    return registrationViewModel;
}());