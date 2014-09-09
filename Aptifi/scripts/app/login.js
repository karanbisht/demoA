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
        
        //var isAnalytics = analytics.isAnalytics();
               
        var init = function () {            
            app.userPosition=true;                       
            $loginUsername = $('#loginUsername');
          //$loginPassword = $('#loginPassword');            
        };

        var show = function () {
            console.log("Login Page");
            //app.showNativeAlert();            
            app.userPosition=true;
            $('#loginUsername').val('');
            //$('#loginPassword').val('');
            
            //if(window.navigator.simulator === true){
            //window.plugins.toast.showShortBottom('klkkkkkkk' , app.successCB , app.errorCB);
            //var message = 'karan bisht';
            //window.plugins.toast.showShortTop(message);
		    //}
                //app.showNativeAlert();
        };
        
        
        var checkEnter = function (e) {
            if (e.keyCode === 13) {
                login();
                $(e.target).blur();
            }
        };


       
        // Authenticate to use Backend Services as a particular user

        var login = function () {		 
            var deviceName = app.devicePlatform();
            var device_type;
             if(deviceName==='Android'){
                device_type ='AN';
             }else if(deviceName==='iOS'){
                device_type='AP';
             }
                         
            var device_id='123456';           			
            
            //var device_id = localStorage.getItem("deviceTokenID");
            console.log(device_id);
            
            username = $("#loginUsername").val();
            console.log(username);
            
            if (username === "Mobile Number" || username === "") {
				app.showAlert("Please enter your Mobile No.", "Validation Error");
			} else {            
                 app.mobileApp.pane.loader.show();                
                 //app.mobileApp.pane.loader.hide();           
       		  console.log(username+"||"+device_id+"||"+device_type);
        	              
          var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type}
       
          var dataSourceLogin = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/customer/login",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataLogin
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
               app.mobileApp.pane.loader.hide();
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
               
           }               
          });  
	            
           dataSourceLogin.fetch(function() {
                         var loginDataView = dataSourceLogin.data();
               			console.log(loginDataView);
               
               			var orgDataId = [];
               			var userAllGroupId = [];
						   $.each(loginDataView, function(i, loginData) {
                               console.log(loginData.status[0].Msg);
                               
                      if(loginData.status[0].Msg==='User not registered'){
                          console.log('reg');
							app.mobileApp.pane.loader.hide();
                            app.userPosition=false;
 				           app.mobileApp.navigate('views/registrationView.html?mobile='+username+'&type=reg');  
                      }else if(loginData.status[0].Msg==='Create profile'){
                            app.mobileApp.pane.loader.hide();
                            app.userPosition=false;
                            var accountId=loginData.status[0].AccountID;
 				           app.mobileApp.navigate('views/registrationView.html?mobile='+accountId+'&type=pro');       
                      }else if(loginData.status[0].Msg==='Authentication Required'){
                             app.mobileApp.pane.loader.hide();
                                clickforRegenerateCode();   
                      }else if(loginData.status[0].Msg==='Success'){
                          console.log('reg');
                          account_Id = loginData.status[0].ProfileInfo[0].account_id;
                          console.log('karan'+account_Id);
                          console.log(loginData.status[0].JoinedOrg.role.length);
                          var roleLength = loginData.status[0].JoinedOrg.role.length;

                          for(var i=0;i<roleLength;i++){
                             userType.push(loginData.status[0].JoinedOrg.role[i]); 
                          }
                             console.log(userType);
                          
                          
                          UserProfileInformation = loginData.status[0].ProfileInfo[0];
                          UserOrgInformation = loginData.status[0].JoinedOrg;
                          console.log(UserOrgInformation);
                          console.log(UserProfileInformation);
                          console.log("karan bisht");
                          //db = app.getDb();
						  //db.transaction(deletePrevData, app.errorCB,PrevsDataDeleteSuccess);
                          saveProfileInfo(UserProfileInformation);
                          saveOrgInfo(UserOrgInformation);                         
                      }else{
                          app.mobileApp.pane.loader.hide();
                          app.showAlert(loginData.status[0].Msg,"Notification");
                      }                            
                });
  		 });
             
                	
          }
        };
        
        
        
        var profileInfoData;
        var profileOrgData;
		function saveProfileInfo(data) {
			profileInfoData = data; 
			var db = app.getDb();
			db.transaction(insertProfileInfo, app.errorCB, loginSuccessCB);
		};
        
        function saveOrgInfo(data1) {
            profileOrgData = data1;            
			var db = app.getDb();
			db.transaction(insertOrgInfo, app.errorCB, loginSuccessCB);
		};
        
        
        
        
   function insertProfileInfo(tx) {
		var query = "DELETE FROM PROFILE_INFO";
			app.deleteQuery(tx, query);
       	
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
        
    function insertOrgInfo(tx){
        var query = "DELETE FROM JOINED_ORG";
		app.deleteQuery(tx, query);

        var dataLength = profileOrgData.org_id.length;
       
        console.log(profileOrgData.org_id[0]);
        console.log(profileOrgData.org_id[1]);

       for(var i=0;i<dataLength;i++){       
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
							app.mobileApp.pane.loader.hide();
                            app.userPosition=false;				  
                            app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Login');

}
        
        
        
        
              
        
        var UserInfoData;
        
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
        
        var goToIndex = function(){
              app.mobileApp.navigate('index.html');
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
        
        var clickforRegenerateCode = function(){
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
           $("#regenerateDiv").hide();
           $("#validationRow").hide(); 
           document.getElementById('selectionDiv').style.pointerEvents = 'auto'; 
		   $("#selectionDiv").css("z-index", "1");
		   $("#selectionDiv").css("opacity", 1);
		   $("#regDoneButton").show();
        };
        
        var backToIndex = function(){
           window.location.href = "index.html";
        };
        
        
        var clickforValificationCode = function(){
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
                                           
          var dataSourceValidation = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://203.129.203.243/blank/sms/user/urlsmstemp.php?username=sakshay&pass=sakshay550&senderid=PRPMIS&dest_mobileno=+918447091551&tempid=21429&F1="+varifiCode+"&response=Y"
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
	            
           dataSourceValidation.fetch(function() {
				        var registrationDataView = dataSourceValidation.data();
						console.log(registrationDataView);
               		    	//app.showAlert("The Verification Code will be sent to this number." , "Notification");
               				$("#validationRow").show();
               				regClickButton=1;
                          });                  	
    		};
    
   	        
         var genRand = function() {      	
             return Math.floor(Math.random()*89999+10000);		   
         };
        
        var doneVerification = function(){
             varifiCode='123456';
            
			var validationCodeId = $("#validationCodeId").val();
            if(validationCodeId==='Verification Code' || validationCodeId==='' ){            
              app.showAlert("Please Enter Verification Code","Notification");  
            }else{
                if(varifiCode===validationCodeId){
          	  //app.mobileApp.navigate('views/getOrganisationList.html');  
                    
                                                        
                                                var deviceName = app.devicePlatform();
            									var device_type;
									             if(deviceName==='Android'){
											                device_type ='AN';
									             }else if(deviceName==='iOS'){
                										    device_type='AP';
									             }

            var device_id='123456';                    
            //var device_id = localStorage.getItem("deviceTokenID");
            //console.log(device_id);
                    
          var jsonDataLogin = {"username":username ,"device_id":device_id, "device_type":device_type , "authenticate":'1'}
       
          var dataSourceLogin = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/customer/login",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataLogin
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
               app.mobileApp.pane.loader.hide();
               navigator.notification.alert("Please check your internet connection.",
               function () { }, "Notification", 'OK');
               
           }               
          });  
	            

                    dataSourceLogin.fetch(function() {
                         var loginDataView = dataSourceLogin.data();
               			console.log(loginDataView);
       
               $.each(loginDataView, function(i, loginData) {
                               console.log(loginData.status[0].Msg);
                               
                      if(loginData.status[0].Msg==='Success'){
					      account_Id = loginData.status[0].ProfileInfo[0].account_id;
                          console.log('karan'+account_Id);
                          console.log(loginData.status[0].JoinedOrg.role.length);
                          var roleLength = loginData.status[0].JoinedOrg.role.length;
                          
                          for(var i=0;i<roleLength;i++){
                             userType.push(loginData.status[0].JoinedOrg.role[i]); 
                          }
                             console.log(userType);
                          
                          
                          UserProfileInformation = loginData.status[0].ProfileInfo[0];
                          UserOrgInformation = loginData.status[0].JoinedOrg;
                          console.log(UserOrgInformation);
                          console.log(UserProfileInformation);
                          console.log("karan bisht");
                          //db = app.getDb();
						  //db.transaction(deletePrevData, app.errorCB,PrevsDataDeleteSuccess);
                          saveProfileInfo(UserProfileInformation);
                          saveOrgInfo(UserOrgInformation); 
                      }else{
                          app.mobileApp.pane.loader.hide();
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
            forgetPass: forgetPass,
            sendForgetMail:sendForgetMail,
            goToIndex:goToIndex,
            forgetPassInit:forgetPassInit,
            backToIndex:backToIndex,
            clickforValificationCode:clickforValificationCode,
            cancelButtonRC:cancelButtonRC,
            genRand:genRand,
            doneVerification:doneVerification,
            clickforRegenerateCode : clickforRegenerateCode
        };

    }());

    return loginViewModel;

}());
