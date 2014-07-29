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
       
         if (firstName == "First Name" || firstName == "") {
				app.showAlert("Please enter your First Name.","Validation Error");
         }else if (lastName == "Last Name" || lastName == "") {
				app.showAlert("Please enter your Last Name.","Validation Error");
         }else if (email == "Email" || email == "") {
				app.showAlert("Please enter your Email.","Validation Error");
		 } else if (!app.validateEmail(email)) {
				app.showAlert("Please enter a valid Email.","Validation Error");
         } else if (mobile == "Mobile" || mobile == "") {
				app.showAlert("Please enter your Mobile Number.","Validation Error");
		 } else if (!app.validateMobile(mobile)) {
				app.showAlert("Please enter a valid Mobile Number.","Validation Error");
         } else if (password == "Password" || password == "") {
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
			            
            var selectedOrg = selectOrg.value();
            var selectedGroup = selectGroup.value();
            
         if (selectedOrg == "") {
				app.showAlert("Please select your Organisation.","Validation Error");
         }else if (selectedGroup == "") {
				app.showAlert("Please select your Group.","Validation Error");
         }else{
            var userFirstName=$regFirstName.val();
            var userPassword=$regPassword.val();
            var userLastName=$regLastName.val();
            var userEmail=$regEmail.val();
            var userMobile=$regMobile.val();
        
            
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
