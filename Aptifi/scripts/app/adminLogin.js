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
        var varifiCode;
               
        var init = function () {         
            app.userPosition = false;
            app.MenuPage = false;	            
        };

        var show = function (e) {            

            account_Id = localStorage.getItem("ACCOUNT_ID");

            app.userPosition = false;
            app.MenuPage = false;	

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
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }else { 
                usernameMob = $("#loginMob").val();
                password = $("#loginPassword").val();
                //console.log(usernameMob + "||" + password);
                if (usernameMob === "Mobile Number" || usernameMob === "") {
                    app.showAlert("Please enter your Mobile No.", "Validation Error");
                } else if (!validateMobile(usernameMob)) {
                    app.showAlert("Please enter a valid Mobile Number.", "Validation Error");  
                } else if (password === "Password" || password === "") {
                    app.showAlert("Please enter your Password.", "Validation Error");
                }else {           
                    $("#progress1").show();
                    document.getElementById('OrgLogin').style.pointerEvents = 'none';
             						
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
                                console.log(data);
                                return [data];
                            }
                        },
                                                                        error: function (e) {
                                                                            console.log(JSON.stringify(e));
                                                                            $("#progress1").hide();

                                                                            document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 

                                                                            if (!app.checkSimulator()) {
                                                                                window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                            }else {
                                                                                app.showAlert("Network problem . Please try again later", "Notification");  
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
                                document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
                                app.showAlert(loginData.status[0].Msg, "Notification");
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
                                                                                       url: app.serverUrl() + "organisation/managableOrg/" + account_Id,
                                                                                       type:"POST",
                                                                                       dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                   }
                },
                                                                           schema: {                                
                    data: function(data) {	
                        var datacheck = 0;
                        var allData = 0;
                        var adminOrgInfo =[];
                        //console.log(data);
                        //return [data];
                       
                        $.each(data, function(i, groupValue) {
                            //console.log(groupValue);   
                            //allData++;
                            if (groupValue[0].Msg ==='No Orgnisation to manage') {    
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom('No Organization to Manage , Login not allow.');  
                                }else {
                                    app.showAlert('No Organization to Manage , Login not allow.' , 'Notification');  
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
                                
                                
                                goToAdminDashboard();
                                
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

                                                                               document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
    
                                                                               //console.log(e);
                                                                               if (!app.checkSimulator()) {
                                                                                   window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                               }else {
                                                                                   app.showAlert("Network problem . Please try again later", "Notification");  
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
            console.log('DataBase Saved');
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
                                                                                      e.preventDefault();
                                                                                      //apps.hideLoading();
                                                                                      console.log(e);
                                                                                      $("#progress1").hide();  

                                                                                      document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 

                                                                                      if (!app.checkSimulator()) {
                                                                                          window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                                      }else {
                                                                                          app.showAlert("Network problem . Please try again later", "Notification");  
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
                                                                                    e.preventDefault();
                                                                                    //apps.hideLoading();
                   
                                                                                    $("#progress1").hide();

                                                                                    document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 

                                                                                    if (!app.checkSimulator()) {
                                                                                        window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                                    }else {
                                                                                        app.showAlert("Network problem . Please try again later", "Notification");  
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
            //var query = "DELETE FROM ADMIN_ORG_GROUP";
            //app.deleteQuery(tx, query);
            var dataLength = orgNotiGroupDataVal.length;         
            //alert(dataLength);
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
            
            document.getElementById('OrgLogin').style.pointerEvents = 'auto'; 
            app.userPosition = false;
            //app.mobileApp.navigate('#view-all-activities-admin'); 
            localStorage.setItem("open", 5);
            localStorage.setItem("loginStatusCheck", 2);                        
            app.analyticsService.viewModel.trackFeature("User navigate to Organization List in Admin");            

            //app.slide('left', 'green' ,'3' ,'#view-all-activities-admin');    
            
            app.mobileApp.navigate('#view-all-activities-GroupDetail');

             //app.slide('left', 'green' ,'3' ,'#view-all-activities-GroupDetail');

            //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
        };
        
        var forgetPass = function(){
            app.mobileApp.navigate('views/forgetPasswordView.html');
        }
        
        var forgetPassShow = function(){
            

           $("#forgetMobile").val('');            


            var userMobileNo = localStorage.getItem("username");

                varifiCode = genRand(0, 9);
                console.log(varifiCode);
                varifiCode = varifiCode.toString();
              
                var varifiCodeMsg = "Your Zaffio forget Password code -: " + varifiCode;
          
                //console.log("-----Verification code Login--" + varifiCode);


                var dataSourceForgetPassword = new kendo.data.DataSource({
                                                    transport: {
                                                                read: {
                                                                                 //url: "http://203.129.203.243/blank/sms/user/urlsmstemp.php?username=sakshay&pass=sakshay550&senderid=PRPMIS&dest_mobileno=+918447091551&tempid=21429&F1="+varifiCode+"&response=Y"                   
                                                                                  url: "http://smsbox.in/Api.aspx?usr=spireonline&pwd=15816555&smstype=TextSMS&to=" + userMobileNo + "&msg=" + varifiCodeMsg + "&rout=transactional&from=ZAFFIO"
                                                                             }
                                                                       },
                                                                     schema: {
                            
                                                                data: function(data) {                                                                                                                                                             
                                                                    return [data];
                                                                }                                                                
                                                             },
                                                                     error: function (e) {
                                                                                                                                                                  
                                                                        app.analyticsService.viewModel.trackException(e,'SMS Gateway , Unable to sent verification SMS at forget Password.');

                                                                         if (!app.checkSimulator()) {
                                                                             window.plugins.toast.showLongBottom('Forget Password Code not sent . Please click on Regenerate Code');  
                                                                         }else {
                                                                             app.showAlert('Forget Password Code not sent . Please click on Regenerate Code' , 'Forget Password');  
                                                                         }
                                                                     } 
                                                                 });  
	            
            /*dataSourceForgetPassword.fetch(function() {
                var forgetPasswordDataView = dataSourceForgetPassword.data();
                alert('enterval');
            });*/                   
        }
        
                
        var changerPassword = function(){
           
            var code =  $("#forgetMobile").val();            
            //alert(code+"||"+varifiCode);
            
            if (code === "Code" || code === "") {
                app.showAlert("Please enter your Code to change password.", "");
            } else if (varifiCode!==code){
                app.showAlert("Please enter correct Code to change password.", "Validation Error");    
            }else{
                app.mobileApp.navigate('#genrateNewPass');                            
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
                app.showAlert("Your new password and confirm password do not match.", "Validation Error");    
            }else{
                                            
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