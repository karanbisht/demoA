/**
 * Login view model
 */
var app = app || {};

app.Login = (function () {
    'use strict';

    var loginViewModel = (function () {
        //var isInMistSimulator = (location.host.indexOf('icenium.com') > -1);
        var $loginUsername;
		var username;
        var varifiCode;
        var userType;
        var userType=[];
        var UserProfileInformation;
        var UserOrgInformation;
        var account_Id;
        var db;
        var regClickButton;
        var userOrgName=[];
        var userGropuName=[];
        var JoinedOrganisationYN=1;
 
        
        //var isAnalytics = analytics.isAnalytics();
               
        var init = function () {            
            app.userPosition=true;                       
            $loginUsername = $('#loginUsername');
          //$loginPassword = $('#loginPassword');            
        };


        var show = function () {
            //app.mobileApp.pane.showLoading();              
            console.log("Login Page");
                        
            //app.showNativeAlert();            
            app.userPosition=true;
            app.userPosition=true;
            $('#loginUsername').val('');
        
            //$('#loginPassword').val('');                        
            //console.log('TESTINGGGGGG');
            //console.log(window);
            //console.log(window.plugins);
            
            //window.plugins.toast.showShortBottom('Hello TESTING PLUGIN');
            
            //if(window.navigator.simulator === true){
            //window.plugins.toast.showShortBottom('klkkkkkkk' , app.successCB , app.errorCB);
            //var message = 'karan bisht';
            //window.plugins.toast.showShortTop(message);
		    //}
            //app.showNativeAlert();
            //app.showNativeAlert();
            
          $("#validationRow").hide();  
                    $("#regenerateDiv").hide();  

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
        var countCheck=0;

        var login = function () {		 
            var deviceName = app.devicePlatform();
            var device_type;
             
            if(deviceName==='Android'){
                device_type ='AN';
             }else if(deviceName==='iOS'){
                device_type='AP';
             }
                         
            
            var device_id='APA91bFI1Sc51QY1KbY1gnLoZG6jbQB813z-7jwUrlbud6ySufC22wFyBZs79e3LTdz8XcrrtHX3qAC8faQts17Q-CUTb7mAF8niiwN1QKIrcDdpD3B21NrEYJO2jrdKzJ4zXREQoq2-v5qMs52hCBQ9MHsq18OES_SgZGIp-E8K-q5xFk3MWac';                              
            //var device_id = localStorage.getItem("deviceTokenID");            
            console.log(device_id);            
            username = $("#loginUsername").val();
            //console.log(username);
            
            if (username === "Mobile Number" || username === "") {
				app.showAlert("Please enter your Mobile No.", "Validation Error");
            } else if (!validateMobile(username)) {
                app.showAlert("Please enter a valid Mobile Number.","Validation Error");
			} else {         
              
                if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline'); 
                  } 
               }else{

                $("#progress").show();
                document.getElementById('selectionDiv').style.pointerEvents = 'none';
                 //app.mobileApp.pane.loader.show();                
                 //app.mobileApp.pane.loader.hide();           
       		  console.log(username+"||"+device_id+"||"+device_type);
                
                 localStorage.setItem("username",username); 
                   
        	     console.log('--------static server URL-----'+app.serverUrl());
                   
               var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type}
               var dataSourceLogin = new kendo.data.DataSource({
                transport: {
                read: {
                   url: app.serverUrl()+"customer/login",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataLogin
           	}
           },
           schema: {
               data: function(data)
               {	//console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               console.log("------error------");
               console.log(e);
               //app.mobileApp.pane.loader.hide();
             
               if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }
             
               $("#progress").hide();

               document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 

               //navigator.notification.alert("Please check your internet connection.",
               //function () { }, "Notification", 'OK');               
           }               
          });  
	            
           dataSourceLogin.fetch(function() {
                         var loginDataView = dataSourceLogin.data();
               console.log('----------fetch Data------------');			
               console.log(loginDataView);
               			var orgDataId = [];
               			var userAllGroupId = [];
						   
               $.each(loginDataView, function(i, loginData) {
                                  console.log('-------Msg Data --------');			

                           console.log(loginData.status[0].Msg);
                               
                      if(loginData.status[0].Msg==='User not registered'){
                            //console.log('reg');
							//app.mobileApp.pane.loader.hide();
                             $("#progress").hide();
                                                    
                            document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 

                            app.userPosition=false;
 				           app.mobileApp.navigate('views/registrationView.html?mobile='+username+'&type=reg');  
                      }else if(loginData.status[0].Msg==='Create profile'){
                            //app.mobileApp.pane.loader.hide();
                             $("#progress").hide();
                                                     document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 

                            app.userPosition=false;
                            var accountId=loginData.status[0].AccountID;
 				           app.mobileApp.navigate('views/registrationView.html?mobile='+accountId+'&type=pro');       
                      }else if(loginData.status[0].Msg==='Authentication Required'){
                             //app.mobileApp.pane.loader.hide();
                             $("#progress").hide();
                                                     document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 

                                clickforRegenerateCode();   
                      }else if(loginData.status[0].Msg==='Success'){
                           clickforRegenerateCode();   

                          //console.log('reg');
                       //   account_Id = loginData.status[0].ProfileInfo[0].account_id;
                          //console.log('karan'+account_Id);
                          // console.log(loginData.status[0].JoinedOrg.role.length);
                          
                          //console.log(loginData);
                          //console.log(loginData.status[0].JoinedOrg.role.length);
                          
                          
                         /*if(loginData.status[0].JoinedOrg.length!==0){
                              var roleLength = loginData.status[0].JoinedOrg.role.length;
                                  for(var i=0;i<roleLength;i++){
                                    userType.push(loginData.status[0].JoinedOrg.role[i]); 
                              }
                            // console.log(userType);
                              UserOrgInformation = loginData.status[0].JoinedOrg;
                         }else{
                              JoinedOrganisationYN = 0;
                         }
                          UserProfileInformation = loginData.status[0].ProfileInfo[0];
                          */
                          //console.log('checking for User Date');
                          
                         
                          //console.log("1");
                          //console.log(UserOrgInformation);
                            //                        console.log("2");
                          //console.log(UserProfileInformation);
                          //console.log("karan bisht");
                          
                          //db = app.getDb();
						  //db.transaction(deletePrevData, app.errorCB,PrevsDataDeleteSuccess);
                     //  saveProfileInfo(UserProfileInformation);
                           
                         if(loginData.status[0].JoinedOrg.length!==0){
                                  //saveOrgInfo(UserOrgInformation);              
                         }
                        
                      }else{
                          //app.mobileApp.pane.loader.hide();
                             $("#progress").hide();
                                                     document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 

                          app.showAlert(loginData.status[0].Msg,"Notification");
                      }                            
                });
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
            if(JoinedOrganisationYN===0){
              var db = app.getDb();
	  		db.transaction(insertProfileInfo, app.errorCB, goToHomePage); 
             
            }else{
              var db = app.getDb();
	  		//db.transaction(insertProfileInfo, app.errorCB, app.successCB); 
              db.transaction(insertProfileInfo, app.errorCB, goToHomePage);  
            }
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
	        + '" ,"'+1+'")';              

       app.insertQuery(tx, query);       
      }
       
        
      var userOrgIdArray=[];
      //var userRoleArray=[];  
        
      function insertOrgInfo(tx){
        var query = "DELETE FROM JOINED_ORG";
		app.deleteQuery(tx, query);
          

        var dataLength = profileOrgData.org_id.length;
       
       // console.log(profileOrgData.org_id[0]);
       // console.log(profileOrgData.org_id[1]);

          //alert(dataLength);
       for(var i=0;i<dataLength;i++){                  
           
           if(profileOrgData.role[i]==='C'){
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
            console.log('DataBase Saved');
            console.log(userOrgIdArray);
            //console.log(userRoleArray);
            
            for(var i=0;i<userOrgIdArray.length;i++){
                 // console.log(userOrgIdArray[i]);
                 // console.log(userAccountID);

             var organisationALLListDataSource = new kendo.data.DataSource({
                 
             transport: {
               read: {
                   url: app.serverUrl()+"notification/getCustomerNotification/"+ userOrgIdArray[i]+"/"+userAccountID+"/"+0,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
               schema: {
                 data: function(data)
                   {	
                       var datacheck=0;
                       var allData=0;
                      // console.log(data);
                       
                       var orgNotificationData; 
                            $.each(data, function(l, groupValue) {
                                 // console.log(groupValue);                                     
                                 allData++;
                                $.each(groupValue, function(m, orgVal) {
                                     //console.log();                   	             
                
                                    if(orgVal.Msg ==='No notification'){     
                	                      datacheck++;                                        
	                                }else if(orgVal.Msg==='Success'){
                                       // console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                      setTimeout(function(){  
                                        saveOrgNotification(orgNotificationData);
                                       },10);  
                                    }                                     
                                });    
                            });
                                if(allData===datacheck){
                                         goToHomePage();
                                }
                    	return [data];
 
                   }                                                            
              },
                 
	          error: function (e) {
                    e.preventDefault();
    	           //apps.hideLoading();
        	       console.log(e);                        
           	}	        
     	    });         
            
               organisationALLListDataSource.read();
                
                
              /*organisationALLListDataSource.fetch(function() {
                   alert(i);
                   
                   var loginDataView = organisationALLListDataSource.data();
                   console.log('checkkkkkkkkkkkkkkkkkkkkkkkk');
                   console.log(loginDataView);
                        var datacheck=0;
                        var allData=0;
                   
                     $.each(loginDataView, function(y, groupValue) {
                          allData++;
                          console.log(groupValue);                                     
                   	             if(groupValue.status[0].Msg ==='No notification'){
                                        alert(y);
                                         datacheck++;
                                    }else if(groupValue.status[0].Msg==='Success'){
                                        alert(y);
                                       var orgNotificationData = groupValue.status[0].notificationList;
                                 
                                        console.log(groupValue);
                                        console.log(orgNotificationData);
                                        
                                        saveOrgNotification(orgNotificationData);                                                                                      
                                    }                                                
                     });
          
                                     if(allData===datacheck){
                                         alert('equel');
                                         //goToHomePage();
                                     }

                   
                                 /*var orgNotificationData; 
                                  $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                     
                                   $.each(groupValue, function(i, orgVal) {
                                     console.log();

                   	             if(orgVal.Msg ==='No notification'){     
                	                                                          
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        saveOrgNotification(orgNotificationData);                                                                                     
                                    }
                                                                            
                                   });    
                                 });
                                */

 		      //});
                
            }
            
         };
                        
       var orgNotiDataVal;         
       function saveOrgNotification(data) {
            orgNotiDataVal = data; 
            console.log(orgNotiDataVal);

           setTimeout(function(){
			var db = app.getDb();
			db.transaction(insertOrgNotiData, app.errorCB, app.successCB);
            },10);   
	   };
                        
      function insertOrgNotiData(tx){
        //var query = "DELETE FROM ORG_NOTIFICATION";
		//app.deleteQuery(tx, query);         
        var dataLength = orgNotiDataVal.length;
        //alert('LiveDataVal'+dataLength);
         
          var orgData;
          var orgLastMsg;
          
        for(var i=0;i<dataLength;i++){   
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
          updateJoinOrgTable(orgData,orgLastMsg,dataLength);
      }
        
        
       var goToHomePage = function(){
               //app.mobileApp.pane.loader.hide();
               $("#progress").hide();
               document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 

               $("#progressRandomCode").hide();                             
               localStorage.setItem("ACCOUNT_ID",account_Id);
               localStorage.setItem("FIRST_LOGIN",1); 
               localStorage.setItem("ADMIN_FIRST_LOGIN",1); 
               app.userPosition=false;	
           
               app.mobileApp.navigate('#organisationNotiList');
           
               //app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Login');
       }
                 
        var GlobalDataOrgId;
        var GlobalDataLastMsg;
        var GlobalDataCount;
        
        var updateJoinOrgTable= function(orgData,orgLastMsg,dataLength){
            GlobalDataOrgId=orgData;
            GlobalDataLastMsg=orgLastMsg;
            GlobalDataCount=dataLength;
            var db = app.getDb();
            db.transaction(updateLoginStatus, app.errorCB,goToHomePage);
        }
        
        function updateLoginStatus(tx) {
	           //console.log(GlobalDataOrgId+"||"+GlobalDataLastMsg+"||"+GlobalDataCount);     
               var query = "UPDATE JOINED_ORG SET count='"+GlobalDataCount+"',bagCount='"+GlobalDataCount+"', lastNoti='"+GlobalDataLastMsg+"' where org_id='" +GlobalDataOrgId +"' and role='C'";
               app.updateQuery(tx, query);
        }
            
          
 /*       var UserInfoData;        
        var saveLoginInfo = function(data){
           UserInfoData=data;
           console.log(UserInfoData);
           var db = app.getDb();
	       db.transaction(saveLoginInfoValue, app.onError, app.onSuccess);
        };
        
        var saveLoginInfoValue = function(tx){
            var query = "DELETE FROM LoginInfo";
		    app.deleteQuery(tx, query);
            console.log(UserInfoData);                
            var queryNotification = 'INSERT INTO LoginInfo (UserId,UserName,Email,MobileNo,Password,Group) VALUES ("'+ UserInfoData.result.Id+'","'+UserInfoData.result.DisplayName+'","'+ UserInfoData.result.Email +'","'+ UserInfoData.result.MobileNo +'","'+ UserInfoData.result.Password +'","'+ UserInfoData.result.Group +'")';
			app.insertQuery(tx,queryNotification); 
        };
        
        var forgetPassInit = function(){
            app.userPosition=false;
	        $("#forgetEmail").val('');
        };
        
        var forgetPass= function(){
					           app.userPosition=false;
                     	 	 app.mobileApp.navigate('views/forgetPasswordView.html');       
        };
        
        
        var sendForgetMail = function(){
            var forgetEmail = $("#forgetEmail").val();    
            if (forgetEmail === "Email" || forgetEmail === "") {
				  app.showAlert("Please enter your Email.", "Validation Error");
			} else if (!app.validateEmail(forgetEmail)) {
				  app.showAlert("Please enter a valid Email.", "Validation Error");
			}else{
               
                  var jsonData = {"email":forgetEmail};   
                  var dataSourceRegistration = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/user/forgot_password",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonData
           	}
           },
           schema: {
               data: function(data)
               {	console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               console.log(e);
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
           } 
           });  
	            
           dataSourceRegistration.fetch(function() {
				        var registrationDataView = dataSourceRegistration.data();
						   $.each(registrationDataView, function(i, regData) {
                                   console.log(regData.status[0].Msg);
                               
                               if(regData.status[0].Msg==='An email has been sent to reset your password.'){              
                                     app.showAlert("An email has been sent to reset your password.","Notification"); 
                                     window.location.href = "index.html";
                                  //app.mobileApp.navigate('views/activitiesView.html?LoginType=Admin');
                               }else{
                                  app.showAlert(regData.status[0].Msg ,'Notification'); 
                               }                               
                          });
  		  });
            }
        };
        
        // function used for registration
        
        /*var registration = function() {
            app.userPosition=false;
            app.mobileApp.navigate('views/registrationView.html');           
        };*/        
        
        var goToIndex = function(){
              app.mobileApp.navigate('index.html');
        };
        
        
        var goToLoginPage = function(){
            $("#regenerateDiv").hide();
            $("#validationRow").hide();
        };
        
        var clickforRegenerateCode = function(){
           
          $(".km-scroll-container").css("-webkit-transform", "");
  
          $("#regenerateDiv").show();
          $("#validationRow").hide(); 
          $("#userRegMobNum").html('+91'+ username);    
            
            $("#registrationNext").hide();
            $("#selectionDiv").css("z-index", "-1");
			$("#selectionDiv").css("opacity", .1);	
			$("#regenerateDiv").css("z-index", "999");
			document.getElementById('selectionDiv').style.pointerEvents = 'none';  
        };
        
        
        var cancelButtonRC = function(){

           /*$(".km-scroll-container").css("-webkit-transform", "");
           $("#regenerateDiv").hide();
           $("#validationRow").hide(); 
           document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 
		   $("#selectionDiv").css("z-index", "1");
		   $("#selectionDiv").css("opacity", 1);
		   $("#regDoneButton").show();*/
            
           window.location.href = "index.html"; 

            
        };
        
        var backToIndex = function(){
           window.location.href = "index.html";
        };
        
        
        var clickforValificationCode = function(){

            $(".km-scroll-container").css("-webkit-transform", "");
 
            $("#regenerateDiv").hide();
			$("#validationRow").show();
            $("#regDoneButton").hide();
            $("#selectionDiv").css("z-index", "-1");
			$("#selectionDiv").css("opacity", .1);	
			$("#validationRow").css("z-index", "999");
			document.getElementById('selectionDiv').style.pointerEvents = 'none';
            
            
              //var mobile=$regMobile.val();
              varifiCode = genRand(0,9);
         	 //alert(varifiCode);
              varifiCode = varifiCode.toString();
              
            var varifiCodeMsg = "verification code-: "+ varifiCode;
          
             console.log("-----Verification code Login--" + varifiCode);

            

            var dataSourceValidation = new kendo.data.DataSource({
               transport: {
               read: {
                   //url: "http://203.129.203.243/blank/sms/user/urlsmstemp.php?username=sakshay&pass=sakshay550&senderid=PRPMIS&dest_mobileno=+918447091551&tempid=21429&F1="+varifiCode+"&response=Y"
                     
                   url: "http://smsbox.in/Api.aspx?usr=spireonline&pwd=15816555&smstype=TextSMS&to="+username+"&msg="+varifiCodeMsg+"&rout=transactional&from=APTIFI"
           	}
           },
           schema: {
               data: function(data)
               {
                   console.log('--------Verification Code Sent-----------------');
                   //console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               console.log('--------Error in Verification Code Sent-----------------');               
               console.log(e);
               
               if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  }
                
               }
               
               //navigator.notification.alert("Please check your internet connection.",
               //function () { }, "Notification", 'OK');
           } 
           });  
	            
           dataSourceValidation.fetch(function() {
				      var registrationDataView = dataSourceValidation.data();
						//console.log(registrationDataView);
               		    	//app.showAlert("The Verification Code will be sent to this number." , "Notification");
               				$("#validationRow").show();
               				regClickButton=1;
                          });                  	
    		};
    
   	        
         var genRand = function() {      	
             return Math.floor(Math.random()*89999+10000);		   
         };
        
        var doneVerification = function(){
             //varifiCode='123456';

            $(".km-scroll-container").css("-webkit-transform", "");
            
			var validationCodeId = $("#validationCodeId").val();
                if(validationCodeId==='Verification Code' || validationCodeId==='' ){            
                      app.showAlert("Please Enter Verification Code","Notification");
                }else{
                    $("#progressRandomCode").show();
                      if(varifiCode===validationCodeId){
          	        //app.mobileApp.navigate('views/getOrganisationList.html');  
                    
                                                var deviceName = app.devicePlatform();
            									var device_type;
									             if(deviceName==='Android'){
											                device_type ='AN';
									             }else if(deviceName==='iOS'){
                										    device_type='AP';
									             }

                  var device_id='APA91bFI1Sc51QY1KbY1gnLoZG6jbQB813z-7jwUrlbud6ySufC22wFyBZs79e3LTdz8XcrrtHX3qAC8faQts17Q-CUTb7mAF8niiwN1QKIrcDdpD3B21NrEYJO2jrdKzJ4zXREQoq2-v5qMs52hCBQ9MHsq18OES_SgZGIp-E8K-q5xFk3MWac';                    
                  //var device_id = localStorage.getItem("deviceTokenID");
                          
                //console.log(device_id);
                    
          var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type , "authenticate":'1'}
       
          var dataSourceLogin = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"customer/login",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataLogin
           	}
           },
           schema: {
               data: function(data)
               {	//console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               //console.log(e);
               $("#progressRandomCode").hide();
               //app.mobileApp.pane.loader.hide();
               
               if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  }                
               }
               
               //navigator.notification.alert("Please check your internet connection.",
               //function () { }, "Notification", 'OK');
               
           }               
          });  
	            

                  dataSourceLogin.fetch(function() {
                       var loginDataView = dataSourceLogin.data();
               			//console.log(loginDataView);
       
                  $.each(loginDataView, function(i, loginData) {
                               //console.log(loginData.status[0].Msg);
                               
                      if(loginData.status[0].Msg==='Success'){
					                                                    
                          account_Id = loginData.status[0].ProfileInfo[0].account_id;
                          //console.log('karan'+account_Id);
                          console.log(loginData);
                                                   
                          if(loginData.status[0].JoinedOrg.length!==0){ 
                              console.log(loginData.status[0].JoinedOrg.role.length);
                              var roleLength = loginData.status[0].JoinedOrg.role.length;                          
                              for(var i=0;i<roleLength;i++){
                                 userType.push(loginData.status[0].JoinedOrg.role[i]); 
                              }
                             //console.log(userType);
                          }else{
                               JoinedOrganisationYN = 0;
                          }   
                          
                          UserProfileInformation = loginData.status[0].ProfileInfo[0];
                          //if(loginData.status[0].JoinedOrg.length!==0){
                              //UserOrgInformation = loginData.status[0].JoinedOrg;
                              //saveOrgInfo(UserOrgInformation);
                          //}    
                          //console.log(UserOrgInformation);
                          //console.log(UserProfileInformation);
                          //console.log("karan bisht");
                          //db = app.getDb();
						  //db.transaction(deletePrevData, app.errorCB,PrevsDataDeleteSuccess);
                          saveProfileInfo(UserProfileInformation);
                           
                      }else{
                          //app.mobileApp.pane.loader.hide();
                             $("#progressRandomCode").hide();
                             app.showAlert(loginData.status[0].Msg,"Notification");
                      }      
                   
                     /*else if(loginData.status[0].Msg==='Create profile'){
                            app.mobileApp.pane.loader.hide();
                            app.userPosition=false;
                            var accountId=loginData.status[0].AccountID;
 				           app.mobileApp.navigate('views/registrationView.html?mobile='+accountId+'&type=pro');       
                      }else if(loginData.status[0].Msg==='Authentication Required'){
                             app.mobileApp.pane.loader.hide();
                                clickforRegenerateCode();   
                      }*/
                            
                });

           });
                                              
        	    }else{
    	               app.showAlert("Please Enter Correct Verification Code","Notification");
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
            //forgetPass: forgetPass,
            //sendForgetMail:sendForgetMail,
            goToIndex:goToIndex,
            //forgetPassInit:forgetPassInit,
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
