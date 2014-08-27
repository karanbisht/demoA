
var app = app || {};

app.registration = (function () {
    'use strict'
    var userRegNumber;
    // Activities view model
    var registrationViewModel = (function () {
        var $regFirstName;
        var $regLastName;
        var $regEmail;
        var backToRegPage=false;
        var username;  
        var comingFrom;
        
        var varifiCode;
        var regClickButton;
        
         var regInit = function () {
                 app.userPosition=false;
                 $regFirstName=$('#regFirstName');
             	$regLastName=$('#regLastName');
             	$regEmail=$('#regEmail');
         };
        
        // Navigate to activityView When some activity is selected

        var addNewRegistration = function (e) {
         app.userPosition=false;
            if(!backToRegPage){
            $regFirstName.val('');
            $regLastName.val('');
            $regEmail.val('');
            }
            username = e.view.params.mobile;
            comingFrom = e.view.params.type
        };
        
        
       /* var clearSelectOrganisation = function(){
             $("#selectOrgData").data("kendoComboBox").value("");
             $("#selectGroupData").data("kendoComboBox").value("");
            
        } */

        var registerR = function(){
   	  app.userPosition=false;   
         regClickButton=0;   
		 backToRegPage=true;   
         var fname = $regFirstName.val();
         var lname = $regLastName.val();
         var email = $regEmail.val();
            
         if (fname === "First Name" || fname === "") {
				app.showAlert("Please enter your First Name.","Validation Error");
         }else if (lname === "Last Name" || lname === "") {
				app.showAlert("Please enter your Last Name.","Validation Error");
         }else if (email === "Email" || email === "") {
				app.showAlert("Please enter your Email.","Validation Error");
		 } else if (!app.validateEmail(email)) {
				app.showAlert("Please enter a valid Email.","Validation Error");
    	 } else {   
            //app.mobileApp.navigate('views/selectOrganisationView.html');                     
          console.log(fname+"||"+lname+"||"+email+"||"+username);
	        var jsonDataRegister;
   	     var goToUrl;
             
             console.log(comingFrom);
             
            if(comingFrom==='reg'){
               console.log("1"); 
               jsonDataRegister = {"username":username,"fname":fname,"lname":lname,"email":email}  
               goToUrl = "http://54.85.208.215/webservice/customer/register"  
            }else{
                console.log("2");  
               jsonDataRegister = {"account_id":username,"first_name":fname,"last_name":lname,"email":email} 
               goToUrl = "http://54.85.208.215/webservice/customer/createProfile"
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
	            
           dataSourceRegister.fetch(function() {
                         var loginDataView = dataSourceRegister.data();
               			console.log(loginDataView);       
               			var orgDataId = [];
               			var userAllGroupId = [];
						   $.each(loginDataView, function(i, loginData) {
                               console.log(loginData.status[0].Msg);
                               
                                if(loginData.status[0].Msg==='Registration Success' || loginData.status[0].Msg==='Profile Created'){
									app.mobileApp.pane.loader.hide();
                    		        app.userPosition=false;
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
                               if(loginData.status[0].Msg==='Authentication Required'){
                                app.mobileApp.pane.loader.hide();   
                                clickforRegenerateCodeR();   
                               }
						  });
                       });            
                                    
			      
            }
                    
                           
                                
                           });
               });             
         }
      };
        
     /*   
        var goToIndex = function(){
        
        backToRegPage=false;    
        
        app.mobileApp.navigate('index.html');
        
        };
`		*/
       

        var clickforValificationCodeR = function(){
            $("#regenerateDivR").hide();
			$("#validationRowR").show();
            $("#regDoneButtonR").hide();
            $("#selectionDivR").css("z-index", "-1");
			$("#selectionDivR").css("opacity", .1);	
			$("#validationRowR").css("z-index", "999");
			document.getElementById('selectionDivR').style.pointerEvents = 'none';
            
            
              //var mobile=$regMobile.val();
              varifiCode = genRandR(0,9);
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
               				$("#validationRowR").show();
               				regClickButton=1;
                          });          
                 
 		};
        
        
         var genRandR = function() {      	
             return Math.floor(Math.random()*89999+10000);		   
         };

        
        
        var clickforRegenerateCodeR = function(){
          $("#regenerateDivR").show();
          $("#validationRowR").hide(); 
          $("#userRegMobNumR").html('+91'+ username);                
            $("#registrationNextR").hide();
            $("#selectionDivR").css("z-index", "-1");
			$("#selectionDivR").css("opacity", .1);	
			$("#regenerateDivR").css("z-index", "999");
			document.getElementById('selectionDivR').style.pointerEvents = 'none';  
        };
        
        
        var cancelButtonRCR = function(){
           $("#regenerateDivR").hide();
           $("#validationRowR").hide(); 
           document.getElementById('selectionDivR').style.pointerEvents = 'auto'; 
		   $("#selectionDivR").css("z-index", "1");
		   $("#selectionDivR").css("opacity", 1);
		   $("#regDoneButtonR").show();
        };
        
        var backToIndex = function(){
           window.location.href = "index.html";
        };
        
        var doneVerificationR = function(){
            varifiCode='123456';
            
			var validationCodeId = $("#validationCodeIdR").val();
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
							app.mobileApp.pane.loader.hide();
                            app.userPosition=false;				  
                            app.mobileApp.navigate('views/getOrganisationList.html?mobile='+username);
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
    
        
        return {
            regInit: regInit,
            addNewRegistration: addNewRegistration,
            clickforValificationCodeR:clickforValificationCodeR,
            backToIndex:backToIndex,
            clickforRegenerateCodeR:clickforRegenerateCodeR,
            //clearSelectOrganisation:clearSelectOrganisation,
            cancelButtonRCR:cancelButtonRCR,
            genRandR:genRandR,
            doneVerificationR:doneVerificationR,
            // selectedOrg:selectedOrg,
            //selectedGroup:selectedGroup,
            registerR: registerR
        };

        
    }());

    return registrationViewModel;


}());
