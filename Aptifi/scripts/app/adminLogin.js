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
            app.userPosition=false;
            app.MenuPage=false;	            
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
 
            $("#progress1").show();     
            
          if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
           }else{ 
               
            usernameMob = $("#loginMob").val();
            password = $("#loginPassword").val();

            console.log(usernameMob+"||"+password);
            
            if (usernameMob === "Mobile Number" || usernameMob === "") {
				app.showAlert("Please enter your Mobile No.", "Validation Error");
            } else if (!validateMobile(usernameMob)) {
                app.showAlert("Please enter a valid Mobile Number.","Validation Error");  
			} else if(password === "Password" || password === ""){
                app.showAlert("Please enter your Password.", "Validation Error");
            }else {           
                 //app.mobileApp.pane.loader.show();  	
                    $("#progress1").show();     
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
               console.log(JSON.stringify(e));
               //app.mobileApp.pane.loader.hide();
                $("#progress1").hide();
                   if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                      }else{
                                      app.showAlert("Network problem . Please try again later","Notification");  
                   }

               
               //navigator.notification.alert("Please check your internet connection.",
               //function () { }, "Notification", 'OK');
               
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
                          console.log(loginDataView);
                          getAdminOrgData();
                                                    
                   }else{
                           //app.mobileApp.pane.loader.hide();
                                       $("#progress1").hide();

                          app.showAlert(loginData.status[0].Msg,"Notification");

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
         }
        };
        
        
        function validateMobile(mobileNo) {
	        var mobilePattern = /^\d{10}$/;
	        return mobilePattern.test(mobileNo);
        }


        var getAdminOrgData = function(){
           var organisationListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/organisation/managableOrg/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {                                
                 data: function(data)
                   {	
                       var datacheck=0;
                       var allData=0;
                       
                       //console.log(data);
               	    //return [data];
                       
                                    $.each(data, function(i, groupValue) {
                                     console.log(groupValue);   
                                        allData++;
                   	             if(groupValue[0].Msg ==='Not a customer to any organisation'){     
                                        datacheck++;   
                                    }else if(groupValue[0].Msg==='Success'){
                                        console.log(groupValue[0].orgData.length);  
                                        var adminOrgInformation = groupValue[0].orgData;
                                        saveAdminOrgInfo(adminOrgInformation); 
                                    }
                                 });
                       
                           if(allData===datacheck){
                             goToAdminDashboard();
                           }
                    	return [data];

                   }                                                            
                },
	            error: function (e) {
    	           console.log(e);
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
        
            var userOrgIdArray=[];

        
      function insertAdminOrgInfo(tx){
          var query = "DELETE FROM ADMIN_ORG";
	  	app.deleteQuery(tx, query);
          console.log(adminOrgProfileData);

          var dataLength = adminOrgProfileData.length;
          console.log(dataLength);
       

         for(var i=0;i<dataLength;i++){       
                                 
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

      
      var loginSuccessCB = function(){
            console.log('DataBase Saved');
            console.log(userOrgIdArray);          
            //console.log(userRoleArray);
            
            for(var i=0;i<userOrgIdArray.length;i++){
                  //alert(userOrgIdArray[i]);
                  //console.log(userAccountID);
              var organisationALLListDataSource = new kendo.data.DataSource({                
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getCustomerNotification/"+ userOrgIdArray[i]+"/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
                 
        	  schema: {
                 data: function(data)
                   {	
                       var datacheck=0;
                       var allData=0;
                       console.log(data);
                       
                       var orgNotificationData; 
                           $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                  allData++;   
                                 $.each(groupValue, function(i, orgVal) {
                                     console.log();

                   	             if(orgVal.Msg ==='No notification'){     
                  	                      datacheck++;                                                                                           
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        saveOrgNotification(orgNotificationData);                                                                                                                                                                      
                                    }
                                 });    
                            });       
                       
                                if(allData===datacheck){
                                    goToAdminDashboard();
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
            }
        }  
         
       var orgNotiDataVal;         
       
       function saveOrgNotification(data) {
            orgNotiDataVal = data; 
            console.log(orgNotiDataVal);            
			var db = app.getDb();
			db.transaction(insertOrgNotiData, app.errorCB,goToHomePage);
	   };
                        
      function insertOrgNotiData(tx){
          
        //var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
        //app.deleteQuery(tx, query);

          
          var dataLength = orgNotiDataVal.length;         
          var orgData;
          var orgLastMsg;
          
        for(var i=0;i<dataLength;i++){   
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
        
        
        var goToHomePage = function(){
            console.log('sssssssss');
            console.log(userOrgIdArray);
            for(var i=0;i<userOrgIdArray.length;i++){
               console.log(userOrgIdArray[i]);
               //console.log(userAccountID);
             var organisationGroupDataSource = new kendo.data.DataSource({                
             transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/index/"+userOrgIdArray[i],
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
                 
        	 schema: {
                 data: function(data)
                   {	
                       var datacheck=0;
                       var allData=0;
                       console.log(data);
                       
                       var orgNotificationData; 
                           $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                  allData++;   
                                 $.each(groupValue, function(i, orgVal) {
                                     console.log();
                   	             if(orgVal.Msg ==='No Group list'){     
                                        //alert('no');
                  	                      datacheck++;                                                                                           
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.groupData.length);
                                        console.log('karan Bisht');
                                        orgNotificationData = orgVal.groupData;                                                                               
                                        console.log(orgNotificationData);                                       
                                        saveOrgGroupNotification(orgNotificationData);                                                                                                                                                                      
                                    }
                                 });    
                            });       
                       
                             if(allData===datacheck){
                                         goToAdminDashboard();
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
               organisationGroupDataSource.read();                                  
            }       
        }
        
       var orgNotiGroupDataVal;         
       function saveOrgGroupNotification(data) {
           
            orgNotiGroupDataVal = data;
            //alert('dataaaaaaaaa');
            console.log(orgNotiGroupDataVal);            
			var db = app.getDb();
			db.transaction(insertOrgGroupNotiData, app.errorCB, goToAdminDashboard);
	   };
                        
      function insertOrgGroupNotiData(tx){
        //var query = "DELETE FROM ADMIN_ORG_GROUP";
        //app.deleteQuery(tx, query);
          
        var dataLength = orgNotiGroupDataVal.length;         
          //alert(dataLength);
        var orgGroupData;
          
        for(var i=0;i<dataLength;i++){   
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
        

      var goToAdminDashboard = function(){
             //app.mobileApp.pane.loader.hide();
              $("#progress1").hide();
              app.userPosition=false;
              app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
      };
        
 
        // Authenticate using Facebook credentials
        return {
            init: init,
            show: show,
            getYear: app.getYear,
            login: login,
            checkEnter:checkEnter
        };

    }());

    return adminLoginViewModel;

}());
