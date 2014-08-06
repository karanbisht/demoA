/**
 * Login view model
 */

var app = app || {};

app.Login = (function () {
    'use strict';

    var loginViewModel = (function () {

        var isInMistSimulator = (location.host.indexOf('icenium.com') > -1);
        var $loginUsername;
        var $loginPassword;
        
        var isAnalytics = analytics.isAnalytics();
               
        var init = function () {            
            app.userPosition=true;
            if (!app.isKeySet(appSettings.everlive.apiKey)) {
                app.mobileApp.navigate('views/noApiKey.html', 'fade');
            }
            $loginUsername = $('#loginUsername');
            $loginPassword = $('#loginPassword');            
        };

        var show = function () {
            app.userPosition=true;
            $loginUsername.val('');
            $loginPassword.val('');
        };
        
       
        // Authenticate to use Backend Services as a particular user
        var login = function () {

            var username = $loginUsername.val();
            var password = $loginPassword.val();

            if (username === "Email" || username === "") {
				app.showAlert("Please enter your Email.", "Validation Error");
			} else if (!app.validateEmail(username)) {
				app.showAlert("Please enter a valid Email.", "Validation Error");
			} else if (password === "Password" || password === "") {
				app.showAlert("Please enter Password.", "Validation Error");
			} else {
            //username = 'ravi@chamria.com';
            //password = 'password';
            
          /* var dataSource = new kendo.data.DataSource({
			 transport: {
    			read:  {
      			url: "http://54.85.208.215/api/userapi/user",
    			  dataType: "html", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  data: {email:username , password:password} 
                }
 			 }
       	});
            
            console.log(dataSource);
            console.log(dataSource.read());
            
			dataSource.fetch(function(){
  				var data = dataSource.data();
                  console.log(data);
  				console.log(data.length);  // displays "77"
			});
            */
            
            // Authenticate using the username and password
            
            app.everlive.Users.login(username, password)
            .then(function () {
                // EQATEC analytics monitor - track login type
               if (isAnalytics) {
                    analytics.TrackFeature('Login.Regular');
                }
                return app.Users.load();
            })
                
            .then(function () {
                app.userPosition=false;
                app.everlive.Users.currentUser()
    				.then(function (data) {
                        saveLoginInfo(data);
                        console.log(data.result.Group);
    			        app.mobileApp.navigate('views/activitiesView.html?LoginType=' + data.result.Group);
				    },

                function(error){
       					 alert(JSON.stringify(error));
			    });

            })  
                
            .then(null,
                  function (err) {
                      if(err.message===null){
                          app.showAlert("Error in Internet Connectivity","Error");
                      }else{
                          app.showError(err.message);
                      }
                      //show();
                  }
            );
                		
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
				app.showAlert('Your Password Send to your Mail','Notification');
            }
        };
        
        // function used for registration
        
        var registration = function() {
            //alert("welcome to user registration");  
            app.mobileApp.navigate('views/registrationView.html');           
        };

        // Authenticate using Facebook credentials
        return {
            init: init,
            show: show,
            getYear: app.getYear,
            login: login,
            forgetPass: forgetPass,
            sendForgetMail:sendForgetMail,
            goToIndex:goToIndex,
            forgetPassInit:forgetPassInit,
            registration : registration
        };

    }());

    return loginViewModel;

}());
