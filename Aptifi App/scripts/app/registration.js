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
		 backToRegPage=true;   
         var firstName = $regFirstName.val();
         var lastName = $regLastName.val();
         var password= $regPassword.val();
         var email = $regEmail.val();
         var mobile = $regMobile.val();
       
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
            app.mobileApp.navigate('views/selectOrganisationView.html');
         }
      };
        
        var goToIndex = function(){
            backToRegPage=false;    
            app.mobileApp.navigate('index.html');
        }
        
        var regDone = function(){
            var selectOrg = $("#selectOrgData").data("kendoComboBox");
		    var selectGroup = $("#selectGroupData").data("kendoComboBox");
			var cmbGroup = [];            
            var org_id = selectOrg.value();            
            cmbGroup.push(selectGroup.value());
            
             console.log(org_id);
             console.log(cmbGroup);
          
         if (org_id === "") {
				app.showAlert("Please select your Organisation.","Validation Error");
         }else if (cmbGroup === "") {
				app.showAlert("Please select your Group.","Validation Error");
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
             
 	         var device_id = app.deviceUuid();
     	     console.log(device_type +"||"+ device_id);
                          
            //http://54.85.208.215/webservice/customer/customerRegistration?fname=karan&lname=bisht&email=karan@gmail.com&password=123456&mobile=9717818898&cmbGroup=1&device_id=e0908060g38bde8e6740011221af335301010333&device_type=AN&org_id=1
            
          var jsonData = {"fname":fname ,"lname":lname,"email":email, "password":password,"mobile":mobile,"cmbGroup":cmbGroup,"device_id":device_id,"device_type":device_type,"org_id":org_id}
          console.log(jsonData);               
             
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
                                  app.mobileApp.navigate('views/activitiesView.html?LoginType=Admin');
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
