/**
 * Login view model
 */

var app = app || {};

app.adminLogin = (function () {
    'use strict';

    var adminLoginViewModel = (function () {


        var $loginUsername;
        var $loginPassword;
		var usernameMob;
        var password;
        var account_Id;
        var varifiCode;
        var regClickButton;
        var userOrgName=[];
        var userGropuName=[];

               
        var init = function () {            
            app.userPosition=false;
            app.MenuPage=false;	
            
            $loginUsername = $('#loginMob');
            $loginPassword = $('#loginPassword');            
        };

        var show = function (e) {
            account_Id = e.view.params.account_Id;
            app.userPosition=false;
            app.MenuPage=false;	
            $('#loginMob').val('');
            $('#loginPassword').val('');
        };
        
        
        var checkEnter = function (e) {
            if (e.keyCode === 13) {
                login();
                $(e.target).blur();
            }
        };


        var login = function () {		 
            
            usernameMob = $("#loginMob").val();
            password = $("#loginPassword").val();

            console.log(usernameMob+"||"+password);
            
            if (usernameMob === "Mobile Number" || usernameMob === "") {
				app.showAlert("Please enter your Mobile No.", "Validation Error");
			} else if(password === "Password" || password === ""){
                app.showAlert("Please enter your Password.", "Validation Error");
            }else {           
                 app.mobileApp.pane.loader.show();  	
                        
          var jsonDataLogin = {"username":usernameMob ,"password":password}       
          var dataSourceLogin = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/organisation/orgAdminLogin",
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
                         console.log("karan" + account_Id);      
                      if(loginData.status[0].Msg==='You have been successfully logged in.'){
                          console.log('reg');
							app.mobileApp.pane.loader.hide();
                            app.userPosition=false;
                            app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id);
                      }
                 
                   /*
                   else if(loginData.status[0].Msg==='Create profile'){
                            app.mobileApp.pane.loader.hide();
                            app.userPosition=false;
                            var accountId=loginData.status[0].AccountID;
 				           app.mobileApp.navigate('views/registrationView.html?mobile='+accountId+'&type=pro');       
                      }else if(loginData.status[0].Msg==='Authentication Required'){
                             app.mobileApp.pane.loader.hide();
                                clickforRegenerateCode();   
                      }else if(loginData.status[0].Msg==='Success'){
                           console.log('reg');
                           var account_Id = loginData.status[0].ProfileInfo[0].account_id;
                           console.log('karan'+account_Id);
                           var userType=loginData.status[0].JoinedOrg.role[0];
                          
							app.mobileApp.pane.loader.hide();
                            app.userPosition=false;				  
                            app.mobileApp.navigate('views/getOrganisationList.html?mobile='+username+'&userType='+userType);
                      } 
                   */
                   
                });
  		 });
             
                	
          }
        };
        
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
                          console.log('reg');
                          var account_Id = loginData.status[0].ProfileInfo[0].account_id;
                          console.log('karan'+account_Id);
                          var userType=loginData.status[0].JoinedOrg.role[0];
                 
							app.mobileApp.pane.loader.hide();
                            app.userPosition=false;
                            app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id);
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

    return adminLoginViewModel;

}());
