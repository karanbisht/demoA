/**
 * Login view model
 */

var app = app || {};
app.adminLogin = (function () {
    'use strict';
    var adminLoginViewModel = (function () {
        var usernameMob;
        var password;
        var account_Id;
               
        var init = function () {         
        };

        var show = function (e) {            
            account_Id = localStorage.getItem("ACCOUNT_ID");
            var userMobileNo = localStorage.getItem("username");
            $("#loginMob").val(userMobileNo);            
            document.getElementById("loginMob").readOnly = true;
            $('#loginPassword').val('');            
        };
        
        var checkEnter = function (e) {
            if (e.keyCode === 13) {
                login();
                $(e.target).blur();
            }
        };

        var login = function () {		
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else { 
                usernameMob = $("#loginMob").val();
                password = $("#loginPassword").val();
                //console.log(usernameMob + "||" + password);
                if (usernameMob === "Mobile Number" || usernameMob === "") {
                    app.showAlert("Please enter your Mobile No.", app.APP_NAME);
                } else if (!validateMobile(usernameMob)) {
                    app.showAlert("Please enter a valid Mobile Number.", app.APP_NAME);  
                } else if (password === "Password" || password === "") {
                    app.showAlert("Please enter your Password.", app.APP_NAME);
                }else {           
                    $("#progress1").show();
                    //document.getElementById('OrgLogin').style.pointerEvents = 'none';
                    password = app.urlEncode(password);
                    var jsonDataLogin = {"username":usernameMob ,"password":password}       
                    var dataSourceLogin = new kendo.data.DataSource({
                                                                        transport: {
                            read: {
                                                                                    url: app.serverUrl() + "organisation/orgAdminLogin",
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
                                                                            $("#progress1").hide();

                                                                            //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }

                                                                        }               
                                                                    });  
	            
                    dataSourceLogin.fetch(function() {
                            //var loginDataView = dataSourceLogin.data();
               
                        var data = this.data();
                        
                            if (data[0]['status'][0].Msg==='You have been successfully logged in.') {
                                getAdminOrgData();
                            }else {
                                $("#progress1").hide();
                                //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
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

        var getAdminOrgData = function() {
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           transport: {
                    read: {
                                                                                       url: app.serverUrl() + "organisation/managableOrg/" + account_Id +"/"+ app.CLIENT_APP_ID,
                                                                                       type:"POST",
                                                                                       dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                   }
                    },
                                                                           schema: {                                

                                          
                                                                               
                    data: function(data) {	
                    
                        //console.log(data);
                        
                        var datacheck = 0;
                        var allData = 0;
                        var adminOrgInfo =[];
                       
                        $.each(data, function(i, groupValue) {
                            //console.log(groupValue);   
                            //allData++;
                            if (groupValue[0].Msg ==='No Orgnisation to manage') {    
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom('No organization to manage, Login not allowed.');  
                                }else {
                                    app.showAlert('No organization to manage, Login not allowed.' , 'Notification');  
                                }
 
                                adminOrgInfo=[];
                                localStorage["ADMIN_ORG_DATA"] = JSON.stringify(adminOrgInfo);
                                
                                $("#progress1").hide();  
                            }else if (groupValue[0].Msg==='Success') {
                                
                                //console.log(groupValue[0].orgData.length);  
                                var adminOrgInformation = groupValue[0].orgData;           
                              
                              localStorage.setItem("orgSelectAdmin",groupValue[0].orgData[0].organisationID);                  
                              localStorage.setItem("orgNameAdmin",groupValue[0].orgData[0].org_name);                  

                              for (var i = 0 ; i < adminOrgInformation.length ;i++) {
                                  
                                  adminOrgInfo.push({
                                                       id: groupValue[0].orgData[i].organisationID,
                                                       org_name:groupValue[0].orgData[i].org_name
                                                   });
                              }                           
                           
                                localStorage["ADMIN_ORG_DATA"] = JSON.stringify(adminOrgInfo);                                
                                
                                callUrlForPermission();
                                
                                //goToAdminDashboard();
                                
                                //saveAdminOrgInfo(adminOrgInformation); 
                            }
                        });
                       
                        /*if(allData===datacheck){
                        goToAdminDashboard();
                        }*/
                        return [data];
                    }                                                            
                },
                                                                           error: function (e) {
                                                                               $("#progress1").hide();  
                                                                               //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
    
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                           }	        
                                                                       });
                        
            organisationListDataSource.fetch(function() {

                /*
                var loginAdminDataView = organisationListDataSource.data();
                $.each(loginAdminDataView, function(i, groupValue) {
                console.log(groupValue);                                     
                if(groupValue.status[0].Msg ==='Not a customer to any organisation'){     
                }else if(groupValue.status[0].Msg==='Success'){
                console.log(groupValue.status[0].orgData.length);  
                var adminOrgInformation = groupValue.status[0].orgData;
                saveAdminOrgInfo(adminOrgInformation); 
                }
                });
                */
            });
        };
        
        
             function callUrlForPermission (){
            
                var orgId = localStorage.getItem("orgSelectAdmin");
                var account_Id = localStorage.getItem("ACCOUNT_ID");

                
                var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "customer/changeOrg/"+orgId+"/"+account_Id,
                                                                            type:"POST",
                                                                            dataType: "json"// "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                           
                                   
                    }
                },
                                                                schema: {
                    data: function(data) {	
                        //console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(JSON.stringify(e));
                                                                    $("#progress1").hide();
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                }               
                                                            });  
	            
                dataSourceLogin.fetch(function() {
             	
                    var data = this.data();
                                         
                    if (data[0]['status'][0].Msg==='Success') {
                
                        goToAdminDashboard();
                        
                    }else if (data[0]['status'][0].Msg==='Fail') {
                        
                        
                    } 

                });

            }
        
        
        
        
        var adminOrgProfileData;        
        function saveAdminOrgInfo(data1) {
            adminOrgProfileData = data1;            
            var db = app.getDb();
            db.transaction(insertAdminOrgInfo, app.errorCB, loginSuccessCB);
        };
        
        var userOrgIdArray = [];
        
        function insertAdminOrgInfo(tx) {
            var query = "DELETE FROM ADMIN_ORG";
            app.deleteQuery(tx, query);
            //console.log(adminOrgProfileData);

            var dataLength = adminOrgProfileData.length;
            //console.log(dataLength);

            for (var i = 0;i < dataLength;i++) {       
                userOrgIdArray.push(adminOrgProfileData[i].organisationID);
             
                var query = 'INSERT INTO ADMIN_ORG(org_id , org_name , role , imageSource ,orgDesc) VALUES ("'
                            + adminOrgProfileData[i].organisationID
                            + '","'
                            + adminOrgProfileData[i].org_name
                            + '","'
                            + adminOrgProfileData[i].role
                            + '","'
                            + adminOrgProfileData[i].org_logo
                            + '","'
                            + adminOrgProfileData[i].org_desc
                            + '")';              
                app.insertQuery(tx, query);
            }                               
        }  
      
        var loginSuccessCB = function() {
            //console.log('DataBase Saved');
            //console.log(userOrgIdArray);          
            //console.log(userRoleArray);
            
            for (var i = 0;i < userOrgIdArray.length;i++) {
                //alert(userOrgIdArray[i]);
                //console.log(userAccountID);
                var organisationALLListDataSource = new kendo.data.DataSource({                
                                                                                  transport: {
                        read: {
                                                                                              url: app.serverUrl() + "notification/getCustomerNotification/" + userOrgIdArray[i] + "/" + account_Id,
                                                                                              type:"POST",
                                                                                              dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                          }
                    },
                 
                                                                                  schema: {
                        data: function(data) {	
                            var datacheck = 0;
                            var allData = 0;
                            //console.log(data);
                       
                            var orgNotificationData; 
                            $.each(data, function(i, groupValue) {
                                //console.log(groupValue);
                                allData++;   
                                $.each(groupValue, function(i, orgVal) {
                                    //console.log();

                                    if (orgVal.Msg ==='No notification') {     
                                        datacheck++;                                                                                           
                                    }else if (orgVal.Msg==='Success') {
                                        //console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        saveOrgNotification(orgNotificationData);                                                                                                                                                                      
                                    }
                                });    
                            });       
                       
                            if (allData===datacheck) {
                                goToAdminDashboard();
                            }                                       
                            return [data]; 
                        }                                                            
                    },
                 
                                                                                  error: function (e) {
                                                                                      //e.preventDefault();
                                                                                      $("#progress1").hide();  
                                                                                      //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
                                                                                      
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                                  }	        
                                                                              });         
            
                organisationALLListDataSource.read();                                  
            }
        }  
         
        var orgNotiDataVal;         
       
        function saveOrgNotification(data) {
            orgNotiDataVal = data; 
            //console.log(orgNotiDataVal);            
            var db = app.getDb();
            db.transaction(insertOrgNotiData, app.errorCB, goToHomePage);
        };
                        
        function insertOrgNotiData(tx) {
            //var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
            //app.deleteQuery(tx, query);
            var dataLength = orgNotiDataVal.length;         
            var orgData;
            var orgLastMsg;
          
            for (var i = 0;i < dataLength;i++) {   
                orgData = orgNotiDataVal[i].org_id;
                orgLastMsg = orgNotiDataVal[i].message;
           
                var query = 'INSERT INTO ADMIN_ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type,group_id,customer_id) VALUES ("'
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
                            + '","'
                            + orgNotiDataVal[i].group_id
                            + '","'
                            + orgNotiDataVal[i].customer_id
                            + '")';              
                app.insertQuery(tx, query);
            }                                                 
        }
        
        var goToHomePage = function() {
                    //console.log(userOrgIdArray);
            for (var i = 0;i < userOrgIdArray.length;i++) {
                //console.log(userOrgIdArray[i]);
                //console.log(userAccountID);
                var organisationGroupDataSource = new kendo.data.DataSource({                
                                                                                transport: {
                        read: {
                                                                                            url: app.serverUrl() + "group/index/" + userOrgIdArray[i],
                                                                                            type:"POST",
                                                                                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                        }
                    },
                 
                                                                                schema: {
                        data: function(data) {	
                            var datacheck = 0;
                            var allData = 0;
                       
                            var orgNotificationData; 
                            $.each(data, function(i, groupValue) {
                                //console.log(groupValue);
                                allData++;   
                                $.each(groupValue, function(i, orgVal) {
                                    
                                    if (orgVal.Msg ==='No Group list') {     
                                        //alert('no');
                                        datacheck++;                                                                                           
                                    }else if (orgVal.Msg==='Success') {
                                     
                                        orgNotificationData = orgVal.groupData;                                                                               
                                                                            
                                        saveOrgGroupNotification(orgNotificationData);                                                                                                                                                                      
                                    }
                                });    
                            });       
                       
                            if (allData===datacheck) {
                                goToAdminDashboard();
                            }    
                       
                            return [data]; 
                        }                                                            
                    },
                 
                                                                                error: function (e) {
                                                                                    //e.preventDefault();
                                                                                    //apps.hideLoading();
                   
                                                                                    $("#progress1").hide();
                                                                                    //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 

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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                                }	        
                                                                            });         
                organisationGroupDataSource.read();                                  
            }       
        }
        
        var orgNotiGroupDataVal;         
        function saveOrgGroupNotification(data) {           
            orgNotiGroupDataVal = data;
            //alert('dataaaaaaaaa');
            //console.log(orgNotiGroupDataVal);            
            var db = app.getDb();
            db.transaction(insertOrgGroupNotiData, app.errorCB, goToAdminDashboard);
        };
                        
        function insertOrgGroupNotiData(tx) {
            var dataLength = orgNotiGroupDataVal.length;         
            var orgGroupData;
          
            for (var i = 0;i < dataLength;i++) {   
                orgGroupData = orgNotiGroupDataVal[i].org_id;
           
                var query = 'INSERT INTO ADMIN_ORG_GROUP(org_id ,groupID ,org_name ,group_name ,group_desc,addDate) VALUES ("'
                            + orgNotiGroupDataVal[i].org_id
                            + '","'
                            + orgNotiGroupDataVal[i].pid
                            + '","'
                            + orgNotiGroupDataVal[i].org_name
                            + '","'
                            + orgNotiGroupDataVal[i].group_name
                            + '","'
                            + orgNotiGroupDataVal[i].group_desc
                            + '","'
                            + orgNotiGroupDataVal[i].addDate
                            + '")';              
                app.insertQuery(tx, query);
            }                                  
        }

        var goToAdminDashboard = function() {            
            //app.mobileApp.pane.loader.hide();
            $("#progress1").hide();
            //document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
            //app.mobileApp.navigate('#view-all-activities-admin'); 
            localStorage.setItem("open", 5);
            localStorage.setItem("loginStatusCheck", 2);                        

            
            app.analyticsService.viewModel.setAnalyticMonitor();
            app.analyticsService.viewModel.trackFeature("User navigate to Organization List in Admin");            

            //app.slide('left', 'green' ,'3' ,'#view-all-activities-admin');    
            
            app.mobileApp.navigate('#view-all-activities-GroupDetail');

            //app.slide('left', 'green' ,'3' ,'#view-all-activities-GroupDetail');
            //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
        };
        
        var forgetPass = function(){
                        
            $("#progress1").show();
            var userMobileNo = localStorage.getItem("username");
            //alert(userMobileNo);

            var jsonDataOTP = {"username":userMobileNo}       

            
            var adminOTP = new kendo.data.DataSource({
                                                                                  transport: {
                                                                                  read: {
                                                                                                 url: app.serverUrl() + "organisation/generateOTP",
                                                                                                 type:"POST",
                                                                                                 dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                                 data: jsonDataOTP           
                                                                                  }
                    },
                                                                                     schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];                       
                        }                       
                    },
                                           
                                                                                error: function (e) {
                                                                                         //console.log(JSON.stringify(e));
                                                                                         $("#progress1").hide();
                                                                                     
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                    
                                                                                     }	        
                                                                                 });        
                                
 
            adminOTP.fetch(function() {
                        var data = this.data();
            
                                    if (data[0]['status'][0].Msg ==='OTP SENT') {     
                                        if (!app.checkSimulator()) {
                                                  window.plugins.toast.showShortBottom(app.FORGET_PASSWORD_CODE_SEND);
                                        }else {
                                                 app.showAlert(app.FORGET_PASSWORD_CODE_SEND, "Notification");
                                        }
                                        app.mobileApp.navigate('views/forgetPasswordView.html');
                                    }else{
                                       app.showAlert(data[0]['status'][0].Msg,"Notification");
                                       app.mobileApp.navigate('views/organisationLogin.html');                                
                
                                    }

                $("#progress1").hide();

            });

            
        }
        
        var forgetPassShow = function(){            

           $("#userOTP").val('');            
           
        }
        
                
        var changerPassword = function(){
           
                                      
            var otp_input =  $("#userOTP").val();
            var jsonDataOTP = {"otp":otp_input}       
            
            if (otp_input === "Code" || otp_input === "") {
                app.showAlert("Please enter your Code to change password.", app.APP_NAME);
            }else{            
                    
                          $("#forgetPassLoader").show();
  
              var sendOPT = new kendo.data.DataSource({
                                                                                  transport: {
                                                                                  read: {
                                                                                                 url: app.serverUrl() + "organisation/verifyOTP",
                                                                                                 type:"POST",
                                                                                                 dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                                 data: jsonDataOTP           
                                                                                  }
                    },
                                                                                     schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];                       
                        }                       
                    },
                                           
                                                                                error: function (e) {
                                                                                         //console.log(JSON.stringify(e));
                                                                                         $("#forgetPassLoader").hide();
                                                                                    
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }

                                                                                    
                    
                                                                                     }	        
                                                                                 });        
                                
 
              sendOPT.fetch(function() {
                        var data = this.data();
            
                                    if (data[0]['status'][0].Msg ==='SUCCESS') {     

                                        app.mobileApp.navigate('#genrateNewPass');                            

                                    }else{
                                       app.showAlert(data[0]['status'][0].Msg,"Notification");
                                        
                                    }

                  $("#forgetPassLoader").hide();
                  
              });


            }            
        }
        
        
        var genRand = function() {      	
            return Math.floor(Math.random() * 89999 + 10000);		   
            return Math.floor(Math.random() * 89999 + 10000);		   
        };
        
        var newPassShow = function(){

            $("#newMobile").val('');
            $("#renewMobile").val('');

        }
        
        var saveChangerPassword = function(){

            var newPass =  $("#newMobile").val();
            var reNewPass =  $("#renewMobile").val();
            
            if (newPass === "New Password" || newPass === "") {
                app.showAlert("Please enter new password.", "");
            }else if (reNewPass === "Confirm password" || reNewPass === "") {
                app.showAlert("Please enter confirm password.", "");
            } else if (newPass!==reNewPass){
                app.showAlert("Passwords do not match", app.APP_NAME);    
            }else{
                
                

                $("#changePassLoader").show();
                //console.log(newPass);
                
                var jsonNewPass = {"new_password":newPass}       
                
                var changePassword = new kendo.data.DataSource({
                                                                                  transport: {
                                                                                  read: {
                                                                                                 url: app.serverUrl() + "organisation/setPassword",
                                                                                                 type:"POST",
                                                                                                 dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                                 data: jsonNewPass           
                                                                                  }
                    },
                                                                                     schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];                       
                        }                       
                    },
                                           
                                                                                error: function (e) {
                                                                                         //console.log(JSON.stringify(e));

                                                                                         $("#changePassLoader").hide();
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }

                                                                                     }	        
                                                                                 });        
                                
 
              changePassword.fetch(function(){
                        var data = this.data();
            
                                    if (data[0]['status'][0].Msg ==='Success') {     
                                        

                                        if (!app.checkSimulator()) {
                                                  window.plugins.toast.showShortBottom('Password changed successfully');   
                                        }else {
                                                 app.showAlert("Password changed successfully", "Notification");  
                                        }
                                        
                                        app.mobileApp.navigate('views/organisationLogin.html');                                
                                        
                                    }else{
                                        
                                        app.showAlert(data[0]['status'][0].Msg,"Notification");
                
                                        app.mobileApp.navigate('views/organisationLogin.html');                                
                
                                    }
                  
                  $("#changePassLoader").hide();

              });
                
            }            
  
        }
        
        var goBackOrgLogin = function(){
            app.mobileApp.navigate('views/organisationLogin.html');                                        
        }
 

        return {
            init: init,
            show: show,
            forgetPassShow:forgetPassShow,
            getYear: app.getYear,
            login: login,
            goBackOrgLogin:goBackOrgLogin,
            genRand:genRand,
            newPassShow:newPassShow,
            saveChangerPassword:saveChangerPassword,
            forgetPass:forgetPass,
            changerPassword:changerPassword,
            checkEnter:checkEnter
        };
    }());
    return adminLoginViewModel;
}());