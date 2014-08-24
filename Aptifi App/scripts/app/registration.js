var app = app || {};

app.registration = (function () {
    'use strict'
    
    // Activities view model
    var registrationViewModel = (function () {
        var $regFirstName;
        var $regPassword;
        var $regMobile;
        var $regLastName;
        var $regEmail;
        var backToRegPage=false;
        var varifiCode;
        var regClickButton;
        
         var regInit = function () {
                 app.userPosition=false;
                 $regFirstName=$('#regFirstName');
             	$regPassword=$('#regPassword');            
             	$regLastName=$('#regLastName');
             	$regEmail=$('#regEmail');
             	$regMobile=$('#regMobile'); 
             
             
         };
        
        // Navigate to activityView When some activity is selected

        var addNewRegistration = function () {
            if(!backToRegPage){
            $regFirstName.val('');
            $regPassword.val('');
            $regLastName.val('');
            $regEmail.val('');
            $regMobile.val('');
            }
        };
        
        
        var clearSelectOrganisation = function(){
             $("#selectOrgData").data("kendoComboBox").value("");
             $("#selectGroupData").data("kendoComboBox").value("");
            
        }

        var register = function(){
         regClickButton=0;   
		 backToRegPage=true;   
         var firstName = $regFirstName.val();
         var lastName = $regLastName.val();
         var password= $regPassword.val();
         var email = $regEmail.val();
         var mobile = $regMobile.val();
      /* 
         if (firstName === "First Name" || firstName === "") {
				app.showAlert("Please enter your First Name.","Validation Error");
         }else if (lastName === "Last Name" || lastName === "") {
				app.showAlert("Please enter your Last Name.","Validation Error");
         }else if (email === "Email" || email === "") {
				app.showAlert("Please enter your Email.","Validation Error");
		 } else if (!app.validateEmail(email)) {
				app.showAlert("Please enter a valid Email.","Validation Error");
         } else if (mobile === "Mobile" || mobile === "") {
				app.showAlert("Please enter your Mobile Number.","Validation Error");
		 } else if (!app.validateMobile(mobile)) {
				app.showAlert("Please enter a valid Mobile Number.","Validation Error");
         } else if (password === "Password" || password === "") {
				app.showAlert("Please enter Password.","Validation Error");
		 } else if (password.length<6) {
				app.showAlert("Please Enter Password Six Characters.","Validation Error");	
		 } else {   
            */
            app.mobileApp.navigate('views/selectOrganisationView.html');
        // }
      };
        
        var goToIndex = function(){
            backToRegPage=false;    
            app.mobileApp.navigate('index.html');
        }

        
        var clickforValificationCode = function(){            
            if(regClickButton===0){
            var selectOrg = $("#selectOrgData").data("kendoComboBox");
		    var selectGroup = $("#selectGroupData").data("kendoComboBox");
			var cmbGroup ; //= [];            
            var org_id = selectOrg.value();            
            //cmbGroup.push(selectGroup.value());
            
            cmbGroup = selectGroup.value();
            console.log(org_id);
            console.log(cmbGroup);
          
         if (org_id === "") {
				app.showAlert("Please select your Organisation.","Validation Error");
         }else if (cmbGroup === "") {
				app.showAlert("Please select your Group.","Validation Error");
         }else{
          var mobile=$regMobile.val();
              varifiCode = genRand(0,9);
         	 //alert(varifiCode);
              varifiCode = varifiCode.toString();
                                           
          var dataSourceValidation = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://203.129.203.243/blank/sms/user/urlsmstemp.php?username=sakshay&pass=sakshay550&senderid=PRPMIS&dest_mobileno=+91"+mobile+"&tempid=21429&F1="+varifiCode+"&response=Y"
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
               		    	app.showAlert("The Verification Code will be sent to this number ("+mobile+")." , "Notification");
               				$("#validationRow").show();
               				regClickButton=1;
                          });          
          }
        }else{
            regDone();
        }        
      };
        
         var genRand = function() {      	
             return Math.floor(Math.random()*89999+10000);		   
         };

        
        var regDone = function(){
            var selectOrg = $("#selectOrgData").data("kendoComboBox");
		    var selectGroup = $("#selectGroupData").data("kendoComboBox");
			var cmbGroup ; //= [];            
            var org_id = selectOrg.value();            
            var validateCode = $("#validationCodeId").val();
            //cmbGroup.push(selectGroup.value());
            validateCode=validateCode.toString();
            cmbGroup = selectGroup.value();
            console.log(org_id);
            console.log(cmbGroup);
          
            console.log(validateCode+"||"+varifiCode);
            
         if (validateCode === "" || validateCode === "Verification Code" ) {
				app.showAlert("Please enter Verification Code.","Validation Error");
         }else if (validateCode !== varifiCode) {
				app.showAlert("Please enter Correct Verification Code.","Validation Error");
         }else{
            var fname=$regFirstName.val();
            var password=$regPassword.val();
            var lname=$regLastName.val();
            var email=$regEmail.val();
            var mobile=$regMobile.val();
        	var deviceName = app.devicePlatform();
            var device_type;
             
            console.log(deviceName);
             
             if(deviceName==='Android'){
                device_type ='AN';
             }else if(deviceName==='iOS'){
                device_type='AP';
             }
             
             var device_id = localStorage.getItem("deviceTokenID");
             console.log(device_id);
    	     //console.log(device_type +"||"+ device_id);
                          

             
             //http://203.129.203.243/blank/sms/user/urlsmstemp.php?username=sakshay&pass=sakshay550&senderid=PRPMIS&dest_mobileno=+919717818898&tempid=21429&F1=23456&response=Y
             
             
             
             //http://54.85.208.215/webservice/customer/customerRegistration?fname=karan&lname=bisht&email=karan@gmail.com&password=123456&mobile=9717818898&cmbGroup=1&device_id=e0908060g38bde8e6740011221af335301010333&device_type=AN&org_id=1
            
          var jsonData = {"fname":fname,"lname":lname,"email":email,"password":password,"mobile":mobile,"cmbGroup":cmbGroup,"device_id":device_id,"device_type":device_type,"org_id":org_id};
                        
          console.log(jsonData);               
             //alert(fname +"||"+lname+"||"+email+"||"+password+"||"+mobile+"||"+cmbGroup+"||"+device_id+"||"+device_type+"||"+org_id);
          var dataSourceRegistration = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/customer/customerRegistration",
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
                               
                               if(regData.status[0].Msg==='Sucess'){              
                                  app.showAlert("Registration Successful","Notification"); 
                                     window.location.href = "index.html";
                                  //app.mobileApp.navigate('views/activitiesView.html?LoginType=Admin');
                               }else{
                                  app.showAlert(regData.status[0].Msg ,'Notification'); 
                               }
                               
                          });

  			  });
	             
            //console.log(dataSourceRegistration);
            //console.log(dataSourceRegistration.read());
             
/*            
            app.everlive.Users.register(
                userEmail,
                userPassword,{Email:userEmail,DisplayName:userFirstName,Organisation:selectedOrg,Group:selectedGroup,MobileNo:userMobile}
                )
            .then(function () {
                app.showAlert("Registration successful");
                app.mobileApp.navigate('#welcome');
            },
            function (err) {
                app.showError(err.message);
            });
           
            alert("Your Detail follows"+userFirstName+"#"+userPassword+"#"+ userLastName +"#"+ userEmail +"#"+ userMobile +"#"+ selectedOrg +"#"+ selectedGroup);	   
             */
           }
        };
        
    
        return {
            regInit: regInit,
            addNewRegistration: addNewRegistration,
            clickforValificationCode:clickforValificationCode,
            regDone: regDone,
            goToIndex:goToIndex,
            clearSelectOrganisation:clearSelectOrganisation,
            // selectedOrg:selectedOrg,
            //selectedGroup:selectedGroup,
            register: register
        };

        
    }());

    return registrationViewModel;


}());
