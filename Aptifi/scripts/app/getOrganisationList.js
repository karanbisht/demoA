var app = app || {};

app.OragnisationList = (function () {
    'use strict'
 //var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 
 var activitiesDataSource;   
 var account_Id;
 var userType;   
 var userTypeAtShow=[];
 var newUserType;   
 var num1=0,num2=0,num3=0;
 var groupDataShow = [];   
 var UserProfileInformation;
 var UserOrgInformation;
 var JoinedOrganisationYN=1;
    
    
    var organisationViewModel = (function () {
            
        var init = function(){
        
        };
                
        var getRoleDataOrg = function(tx){
            	var query = "SELECT role FROM JOINED_ORG ";
				app.selectQuery(tx, query, checkUserRole);
        };    

        
        var checkUserRole = function(tx, results){
          var count = results.rows.length;                              			
          if (count !== 0) {                
                for(var i =0 ; i<count ; i++){                                           
                 if(results.rows.item(i).role==='C'){
                  num1=1;   
                 }else if(results.rows.item(i).role==='O'){
                  num2=3;   
                 }else{
                  num3=5;   
                 }
             }
                          
            if(num1===1 && num2===0 && num3===0){
                localStorage.setItem("ShowMore",1);
                $("#goToAdmin").hide();
                               $("#moreOption").show();  
 
            }else if(num2===3 && num1===0 && num3===0){
                localStorage.setItem("ShowMore",0);
                $("#moreOption").hide();  
                               $("#goToAdmin").show();
 
            }else if(num1===1 && num2===3){0
                 localStorage.setItem("ShowMore",0);
                 $("#moreOption").hide();
                               $("#goToAdmin").show();
 
            }else if(num1===1){
                 localStorage.setItem("ShowMore",1);
                 $("#goToAdmin").hide();
                               $("#moreOption").show();   
            }
           
          }else{
                 $("#goToAdmin").hide();
                 $("#moreOption").show();   
          }  
        }
        
        
        var showMoreDBData = function(){
           var db = app.getDb();
		   db.transaction(getDataOrg, app.errorCB, showLiveData);   
        }
        
                                
        var getDataOrg = function(tx){
            	var query = "SELECT * FROM JOINED_ORG where role='C'";
				app.selectQuery(tx, query, getDataSuccess);
        };    
            
         var getDataOrgDB=[];
         var getDataCountDB=[];
         var org_id_DB;
         var lastMessageShow;
        
        function getDataSuccess(tx, results) {                        
            console.log('before Show');
            console.log(results.rows);
            $('#organisation-listview').data('kendoMobileListView').refresh(); 
            getDataOrgDB=[];
            getDataCountDB=[];
            groupDataShow=[];
            
			var count = results.rows.length;                    
            console.log("DBCount"+count);
			
            if (count !== 0) {                
                 var tempArray=[];

                for(var i =0 ; i<count ; i++){                       

                    console.log('functionRun'+i);					
                    org_id_DB = results.rows.item(i).org_id;                  
                    console.log(org_id_DB);
                    
                    //var db = app.getDb();
        		    //db.transaction(getLastNotification, app.errorCB, app.successCB);                     

                    var bagCount = results.rows.item(i).bagCount;                   
                    
                    getDataOrgDB.push(org_id_DB);
                    getDataCountDB.push(bagCount);
                    
                    //alert(lastMessageShow);
                    var countValue;
                    var bagCountValue;
                    
                                    if(results.rows.item(i).count==='' || results.rows.item(i).count==='null'){
                                        countValue=0;
                                    }else{
                                        countValue = results.rows.item(i).count;
                                    }
                    
                                    if(results.rows.item(i).bagCount==='' || results.rows.item(i).bagCount==='null'){
                                        bagCountValue=0;
                                    }else{
                                        bagCountValue = results.rows.item(i).bagCount;
                                    }
                    
                        var lastNotifi;
                            if(results.rows.item(i).lastNoti===null || results.rows.item(i).lastNoti==='null'){
                                 lastNotifi='';   
                            }else{
                                lastNotifi=results.rows.item(i).lastNoti;
                            }

                    //alert(countValue);
                    //alert(bagCountValue);
                    
                                    var countData= countValue - bagCountValue;
                    //alert('hello');
                                    var pos = $.inArray(results.rows.item(i).org_id, tempArray);
                                    console.log(pos);
 					               if (pos === -1) {
                                     tempArray.push(results.rows.item(i).org_id);                                     
                                        //alert(tempArray);
                                       groupDataShow.push({
												 orgName: results.rows.item(i).org_name,
        		                                 orgDesc: lastNotifi,
                                                 organisationID:results.rows.item(i).org_id,
                                                 org_logo:results.rows.item(i).imageSource,
                                                 imageSource:'http://54.85.208.215/assets/upload_logo/'+results.rows.item(i).imageSource,
		                                         bagCount : bagCountValue,
                                                 countData:countData,
                                                 count : countValue
                                      });
                                    }
        	    }    
            }else{
                                      groupDataShow.push({
                                         orgName: 'Welcome to Aptifi',
                                         orgDesc: 'You are not a customer of any organisation',
                                         organisationID:'0',
                                         imageSource:'',
                                         org_logo :null,  
                                         bagCount : 0 ,
                                         countData:0,
                                         count : 0
    	                               });      
            }
         };       

                        

         var show = function(e){       
             
                                       
             $("#progress2").show();
             $('#organisation-listview').data('kendoMobileListView').refresh();
            
             $(".km-scroll-container").css("-webkit-transform", "");
             
             var scroller = e.view.scroller;
             scroller.reset();
             
            //window.plugins.toast.showShortBottom('Hello TESTING PLUGIN');             
            //app.mobileApp.pane.loader.show();
                          
            var tabStrip = $("#upperMainTab").data("kendoMobileTabStrip");
	   	 tabStrip.switchTo("#organisationNotiList");

           //console.log(getDataOrgDB);
           //console.log(getDataCountDB);  
             
           app.MenuPage=true;
           app.userPosition=false;

                              $("#moreOption").hide();
                              $("#goToAdmin").hide();

             
             localStorage.setItem("loginStatusCheck",1);
             account_Id = localStorage.getItem("ACCOUNT_ID");
             console.log(account_Id);
             
           //var from= e.view.params.from; 
             
             //if(from==='Login'){
              //account_Id = e.view.params.account_Id;
              //userType= e.view.params.userType;
              //alert(userType);   
              //newUserType = userType.split(',');   
                 
              //console.log("karan"+newUserType);  
              //console.log(newUserType.length);
                 
              //localStorage.setItem("ACCOUNT_ID",account_Id);
              //localStorage.setItem("USERTYPE",userType);                 
             //}else{                 
               //account_Id = localStorage.getItem("ACCOUNT_ID");
               //userType = localStorage.getItem("USERTYPE");
               //newUserType = userType.split(',');   
             //}
			
             
             
             //alert(account_Id);
             
             var device_id='APA91bFI1Sc51QY1KbY1gnLoZG6jbQB813z-7jwUrlbud6ySufC22wFyBZs79e3LTdz8XcrrtHX3qAC8faQts17Q-CUTb7mAF8niiwN1QKIrcDdpD3B21NrEYJO2jrdKzJ4zXREQoq2-v5qMs52hCBQ9MHsq18OES_SgZGIp-E8K-q5xFk3MWac';                    
             //var device_id = localStorage.getItem("deviceTokenID"); 
             

             
            var username = localStorage.getItem("username");
             
            var device_type = localStorage.getItem("DEVICE_TYPE");  
             
                   
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
               {	//console.log(data);
               	return [data];
               }
           },
           error: function (e) {
                //apps.hideLoading();
                console.log(e);
                //app.mobileApp.pane.loader.hide();
                $("#progress2").hide();
               
               if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  }
                
               }
               
                afterShow();  
               
               //navigator.notification.alert("Please check your internet connection.",
               //function () { }, "Notification", 'OK');
               
           }               
          });  
	            
           dataSourceLogin.fetch(function() {
                         var loginDataView = dataSourceLogin.data();
               //			console.log(loginDataView);

               var orgDataId = [];
               var userAllGroupId = [];
						   
               $.each(loginDataView, function(i, loginData) {
                      console.log(loginData.status[0].Msg);
                               
                      if(loginData.status[0].Msg==='User not registered'){
                          //console.log('reg');
							//app.mobileApp.pane.loader.hide();
                            //$("#progress").hide();
                            //app.userPosition=false;
 				           //app.mobileApp.navigate('views/registrationView.html?mobile='+username+'&type=reg');  
                      }else if(loginData.status[0].Msg==='Create profile'){
                            //app.mobileApp.pane.loader.hide();
                            //$("#progress").hide();
                            //app.userPosition=false;
                            //var accountId=loginData.status[0].AccountID;
 				           //app.mobileApp.navigate('views/registrationView.html?mobile='+accountId+'&type=pro');       
                      }else if(loginData.status[0].Msg==='Authentication Required'){
                             //app.mobileApp.pane.loader.hide();
                             //$("#progress").hide();
                             //clickforRegenerateCode();   
                      }else if(loginData.status[0].Msg==='Success'){
                          //console.log('reg');
                          //account_Id = loginData.status[0].ProfileInfo[0].account_id;
                          //console.log('karan'+account_Id);
                          // console.log(loginData.status[0].JoinedOrg.role.length);

                          if(loginData.status[0].JoinedOrg.length!==0){

                              var roleLength = loginData.status[0].JoinedOrg.role.length;
                              
                              for(var i=0;i<roleLength;i++){
                                 userTypeAtShow.push(loginData.status[0].JoinedOrg.role[i]); 
                              }
                         }else{
                                JoinedOrganisationYN = 0;
                         } 
                           //alert(userType);
                          
                          UserProfileInformation = loginData.status[0].ProfileInfo[0];
                          
                          //console.log('checking for User Date');

                          if(loginData.status[0].JoinedOrg.length!==0){
                              UserOrgInformation = loginData.status[0].JoinedOrg;
                              saveOrgInfo(UserOrgInformation);
                          }    
                          //console.log("1");
                          //console.log(UserOrgInformation);
                            //                        console.log("2");
                          //console.log(UserProfileInformation);
                          //console.log("karan bisht");
                          
                          //db = app.getDb();
						  //db.transaction(deletePrevData, app.errorCB,PrevsDataDeleteSuccess);
                          saveProfileInfo(UserProfileInformation);
                          
                      
                      }else{
                          //app.mobileApp.pane.loader.hide();
                          //$("#progress").hide();
                          //app.showAlert(loginData.status[0].Msg,"Notification");
                      }                            
                });
  		 }); 
                              
        };
                                                
        var profileInfoData;
        var profileOrgData;
        
		function saveProfileInfo(data) {
 
            //alert("saveProgfile");

			profileInfoData = data;            
            if(JoinedOrganisationYN===0){
              var db = app.getDb();
	  		db.transaction(insertProfileInfo, app.errorCB, showFullData);              
            }else{
              var db = app.getDb();
	  		db.transaction(insertProfileInfo, app.errorCB, app.successCB); 
            }
		};
        
        function saveOrgInfo(data1) {
            profileOrgData = data1;            
            var db = app.getDb();
			db.transaction(getOrgIdFmDB, app.errorCB, nowGetLiveData);        
		};
        
        
        var getOrgIdFmDB = function(tx){
            var query = 'SELECT org_id FROM JOINED_ORG';
			app.selectQuery(tx, query, getOrgDataSuccess);   
        } 
        
        var joinOrgID = [];
        
       function getOrgDataSuccess(tx, results){
                  var count = results.rows.length;
		          if (count !== 0) {
                     for(var i=0;i<count;i++){
                           joinOrgID.push(results.rows.item(i).org_id);
			         }
                  }
       }
        
        
       var nowGetLiveData = function(){
        	var db = app.getDb();
			db.transaction(insertOrgInfo, app.errorCB, loginSuccessCB);   
       } 
        
      function insertProfileInfo(tx) {
		//var query = "DELETE FROM PROFILE_INFO";
        //app.deleteQuery(tx, query);          
        var query = "UPDATE PROFILE_INFO SET email='"+profileInfoData.email+"',first_name='"+profileInfoData.first_name+"',last_name='"+profileInfoData.last_name+"',mod_date='"+profileInfoData.mod_date+"' where account_id='" +profileInfoData.account_id +"'";
        app.updateQuery(tx, query);
       }
               
      var userOrgIdArray=[];
      //var userRoleArray=[];  
        
      function insertOrgInfo(tx){
       var dataLength = profileOrgData.org_id.length;
       //alert(dataLength);
          
       //var query = "DELETE FROM JOINED_ORG";
	   //app.deleteQuery(tx, query); 
          
       // console.log(profileOrgData.org_id[0]);
       // console.log(profileOrgData.org_id[1]);
       
          
          
       /*for(var x=0;x<dataLength;x++){
           //alert('karan');
           //alert(profileOrgData.org_id[x]);
          joinOrgID.push(profileOrgData.org_id[x]);
       }*/
          
        //alert(joinOrgID);
          
       for(var i=0;i<dataLength;i++){                             
 
           //if(profileOrgData.role[i]==='C'){
              // userOrgIdArray.push(profileOrgData.org_id[i]);
           //}                      
           //alert(joinOrgID);
           
           var pos = $.inArray(profileOrgData.org_id[i], joinOrgID);           
		   if (pos === -1) {
    		   joinOrgID.push(profileOrgData.org_id[i]);      
                //alert('New Data');               
               var query ='INSERT INTO JOINED_ORG(org_id , org_name , role , imageSource , joinedDate , orgDesc) VALUES ("'
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
           
           }else{        
               //alert("update");
               //alert(profileOrgData.role[0]); 
               setTimeout(function(){
                   var queryUpdate = "UPDATE JOINED_ORG SET role='"+profileOrgData.role[i]+"', org_name='"+profileOrgData.org_name[i]+"',orgDesc='"+profileOrgData.org_desc[i]+"',imageSource='"+profileOrgData.org_logo[i]+"' where org_id='" +profileOrgData.org_id[i];
                   app.updateQuery(tx, queryUpdate);                         
               },10);
           }                      
        }                               
     }  


       var loginSuccessCB = function(){
          var db = app.getDb();
          db.transaction(getLastNotification, app.errorCB, showFullData);                            
       }  
        

        var getLastNotification = function(tx){
             console.log(userOrgIdArray);                    
             var dataLength = userOrgIdArray.length;      
             console.log(dataLength);
             for(var i=0;i<dataLength;i++){
                 console.log(userOrgIdArray[i]);                               
                 //var query = 'SELECT message FROM ORG_NOTIFICATION where pid = (SELECT MAX(pid)  FROM ORG_NOTIFICATION where org_id ="'+userOrgIdArray[i]+'")';                                
                 var query = 'SELECT message , org_id FROM ORG_NOTIFICATION where org_id ="'+userOrgIdArray[i]+'"';	    	     
                 app.selectQuery(tx, query, getLastNotificationSuccess);                 
             }
          };      
                
            
         function getLastNotificationSuccess(tx, results) {             
			var count = results.rows.length;
            var DB_org_id ; 
             
            console.log('DATA TOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO '+count);
            //bagValueForDB=count;             
			if (count !== 0) {                
                
            	for(var i =count-1 ; i<count ; i++){                    
					lastMessageShow = results.rows.item(i).message;
                    DB_org_id  = results.rows.item(i).org_id;
        	    }
                
            }else{
                lastMessageShow='';               
            }
                            
             console.log('lastMessage'+lastMessageShow);
             console.log('count'+count);
             
             var query = "UPDATE JOINED_ORG SET count='"+count+"',lastNoti='"+lastMessageShow+"' where org_id='" +DB_org_id +"' and role='C'";
             app.updateQuery(tx, query);
         };    
        

            
      var showFullData = function(){
          afterShow();  
      }  
        

        var showLiveData = function(){
                
             console.log('alertvalue');
             console.log(groupDataShow);
                
             var organisationListDataSource = new kendo.data.DataSource({
                  data: groupDataShow
             });           

                
            $("#organisation-listview").kendoMobileListView({
  		    template: kendo.template($("#organisationTemplate").html()),    		
     		 dataSource: organisationListDataSource
            });
                
              $('#organisation-listview').data('kendoMobileListView').refresh();
                
                $("#progress2").hide();
                
                if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }   
                 
            };
                                                        
                                     function fileExist( file ) {
                                            var status;    
                                            window.resolveLocalFileSystemURI('file://' + window.rootFS.fullPath + '/' + file,
                                            function(){ status = true; },
                                            function(){ status = false; }
                                            );
                                            return status;
                                     }

            
          /* var imagePathExist = function(){
                   return 1;    
            };

            var imagePathNotExist = function(){
            	return 2;    
            };
          */  
            
            var storeImageSdcard = function(imageName , orgId){
                var imgData='http://54.85.208.215/assets/upload_logo/'+imageName;               
                var imgPathData = app.getfbValue();    
	            var fp = imgPathData+"/Aptifi/"+'Aptifi_OrgLogo_'+orgId+'.jpg';
            	
               var fileTransfer = new FileTransfer();    
               fileTransfer.download(imgData,fp,  
        			function(entry) {
                        app.mobileApp.pane.loader.hide();
	        		},
    
    		        function(error) {
                        app.mobileApp.pane.loader.hide();
	        		}
	    		);                        
            };

            
        var afterShow = function(){
            
           console.log("showData");
            
           var db = app.getDb();
		   db.transaction(getRoleDataOrg, app.errorCB, showMoreDBData);   

            
           //$('#organisation-listview').data('kendoMobileListView').refresh();
           //var db = app.getDb();
		   //db.transaction(insertOrgImage, app.errorCB, app.successCB);  
        }    
        
        /*
         var insertOrgImage = function(tx){
             console.log(groupDataShow.length);
             
             for(var i=0;i<groupDataShow.length;i++){     
                 var query = 'UPDATE JOINED_ORG SET imageSource=' + groupDataShow[i].imageSource + ' WHERE org_id=' + groupDataShow[i].organisationID;
				 app.updateQuery(tx, query);
             }
         };   
         */   
        
        /*var offlineQueryDB = function(tx){
            var query = 'SELECT * FROM GetNotification';
			app.selectQuery(tx, query, offlineTestQuerySuccess);
        };
        
        var offlineTestQuerySuccess = function(tx, results) {
            $("#activities-listview").empty();
			var count = results.rows.length;
			if (count !== 0) {
				for (var i = 0; i < count; i++) {
					var Title = results.rows.item(i).Title;
					var Message = results.rows.item(i).Message;
					var CreatedAt = results.rows.item(i).CreatedAt; 
                    var template;
                    
                    //if(i===0){
                      //  template = kendo.template($("#activityTemplate").html());
       			//	 $("#activities-listview").html(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
                    //    $("#activities-listview").on('click', offlineActivitySelected);
       			 //}else{

	                template = kendo.template($("#activityTemplate").html());
					$("#activities-listview").append(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
					kendo.bind($('#activityTemplate'), activitiesDataSource);
                    //}
                 }
       		}else{
                   	$("#activities-listview").html("You are Currently Offline and data not available in local storage");
               }
        };
                 
        var CreatedAtFormatted = function(value){
            return app.helper.formatDate(value);
        };

		var offlineQueryDBSuccess = function(){
            console.log("Query Success");
        };
        */
    
        var organisationSelected = function (e) {
            $("#progress2").show();
            //app.mobileApp.pane.loader.show();
            console.log(e.data);
            var organisationID=e.data.organisationID;
            var bagCount =e.data.count;
            //uid=' + e.data.uid
            
			app.MenuPage=false;	
            app.mobileApp.navigate('views/activitiesView.html?organisationID=' + organisationID +'&account_Id='+account_Id+'&bagCount='+bagCount+'&orgName='+e.data.orgName);
        };
            
       
        var groupSelected = function (e) {
            console.log("karan Bisht"+e);
			app.MenuPage=false;	
            app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        };
         
        var offlineActivitySelected = function (i) {
            console.log(i);
			app.MenuPage=false;	
            console.log("click");
            //app.mobileApp.navigate('views/activityView.html?uid=' + e.data.uid);
        };
        
        
        var notificationSelected = function (e) {
			app.MenuPage=false;	
            //alert(e.data.uid);
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };

        // Navigate to app home
        var navigateHome = function () {
            app.MenuPage=false;
            app.mobileApp.navigate('#welcome');
        };
        

        
        var replyUser = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/userReplyView.html');                         
        };
        
        var manageGroup =function(){
            app.MenuPage=false;	
            //app.mobileApp.pane.loader.show();
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        
        var sendNotification = function(){
            app.MenuPage=false;
            //document.location.href="#sendNotificationDiv";
            app.mobileApp.navigate('views/sendNotification.html');           
        };
        
        var refreshButton = function(){
            
        };
                                 
        var info = function(){
            
        };
        

        var orgShow = function(){

           $(".km-scroll-container").css("-webkit-transform", "");
 
           app.MenuPage=false;
		   $("#organisation-listview1").html("");
           var showMore = localStorage.getItem("ShowMore");
             if(showMore!==1){
               $("#goToAdmin").hide();             
             }else{
               $("#moreOption").hide();  
             }
                        
            var db = app.getDb();
		    db.transaction(getOrgInfoDB, app.errorCB, getOrgDBSuccess);       
        };                        
                     
        function getOrgInfoDB(tx) {                    
            var query = 'SELECT * FROM JOINED_ORG';
			app.selectQuery(tx, query, orgDataForOrgSuccess);
		};

		var orgDbData = [];
            
        function orgDataForOrgSuccess(tx, results) {
            var tempArray= [];
            orgDbData = [];
            
			var count = results.rows.length;
            console.log('count'+count);
			if (count !== 0) {
                for(var i=0;i<count;i++){
                     var pos = $.inArray(results.rows.item(i).org_id, tempArray);                   
                     console.log(pos);
                    
					if (pos === -1) {
						 tempArray.push(results.rows.item(i).org_id); 

                        orgDbData.push({
						 org_name: results.rows.item(i).org_name,
        		         org_id: results.rows.item(i).org_id,
                         role:results.rows.item(i).role,
                         imgData:results.rows.item(i).imageSource,   
                         imageSourceOrg:'http://54.85.208.215/assets/upload_logo/'+results.rows.item(i).imageSource,   
                         orgDesc:results.rows.item(i).orgDesc,                      
                         joinDate:results.rows.item(i).joinedDate                   
                       });
                    }
                }
			}else{
                orgDbData.push({
						 org_name:'No Organisation',
        		         org_id: '',
                         role:'',
                         imgData:null,   
                         imageSourceOrg:'',   
                         orgDesc:'You are not a customer of any organisation',                      
                         joinDate:'Not Yet Joined'                   
                 });
            }
		};
           

	function getOrgDBSuccess() {
			app.mobileApp.pane.loader.hide();
            //console.log(orgDbData);
        
             $("#organisation-listview1").kendoMobileListView({
  		    template: kendo.template($("#orgTemplate").html()),    		
     		 dataSource: orgDbData        			 
		     });
        
            $('#organisation-listview1').data('kendoMobileListView').refresh();    		    			
                
            if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }
		};
                
            
            
        var orgMoreInfoSelected =function(e){
            console.log(e.data);
            var orgID=e.data.org_id;
            var orgName=e.data.org_name;
            var orgDesc=e.data.orgDesc;
            var role = e.data.role;
            var joinDate = e.data.joinDate;
            //alert(joinDate);
			app.MenuPage=false;	
            app.mobileApp.navigate('views/userOrgManage.html?orgID=' + orgID +'&orgName='+orgName+'&orgDesc='+orgDesc+'&account_Id='+account_Id+'&role='+role+'&joinDate='+joinDate);
        };    
            
           
        var orgManageID;
            
        var showOrgInfoPage = function(e){
           orgManageID = e.view.params.orgID;
           var orgName = e.view.params.orgName; 
           var orgDesc = e.view.params.orgDesc;
           var account_Id = e.view.params.account_Id;
           var role = e.view.params.role;                 
           var joinDate = e.view.params.joinDate;
            
            
            $("#orgDescList").css("background-color", "#ffffff");
            $("#manageOrgDesc").css("background-color", "#ffffff");
			$("#orgDescList").css("z-index", "999");
            $("#manageOrgDesc").css("z-index", "999");
            
            
            if(orgDesc===''){
                orgDesc="Description Not Available";
             }
            
            //alert(orgDesc+"||"+joinDate);
            if(role==='C'){
                $("#manageOrgFooter").show();
            }else{
                $("#manageOrgFooter").hide();
            }
            
           $("#orgJoinData").html(joinDate); 
           $("#navBarOrgHeader").html(orgName);        
           $("#OrgDescData").html(orgDesc); 
                   
   
            if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }
        }    
        
        
         var unsubscribeOrg = function(){                         
             
           var delOrgfromServerDB = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/customer/unsubscribe/"+orgManageID+"/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {                                
                 data: function(data)
  	             {
                       console.log(data);
               
                                  if(data.status[0].Msg==='Sucess'){                                                      
                                        var db = app.getDb();
                                        db.transaction(delOrgRelData, delOrgError,delOrgSuccess);                          
                                     } 
                                 
                       
		                        // console.log(groupDataShow);
                                   return groupDataShow;
                   }                       
            },
	            error: function (e) {
        	       console.log(e);
           	}
	        
    	    });         
             
           delOrgfromServerDB.read();  
         }
            
            
            
              function delOrgRelData(tx) {
                
                var query = "DELETE FROM JOINED_ORG where org_id="+orgManageID;
        	    app.deleteQuery(tx, query);

            	var query = "DELETE FROM ORG_NOTIFICATION where org_id="+orgManageID;
	            app.deleteQuery(tx, query);
                               
            }
            

            function delOrgSuccess() {
                app.showAlert('Successfully Unsubscribe Organisation','Unsubscribe');
                app.callUserLogin();
            }

            function delOrgError(err) {
	            console.log(err);
            }
            
           
         var userProfileInt = function () {       
      	    app.MenuPage=false; 
         };
        
        var userProfileShow = function(){

            $(".km-scroll-container").css("-webkit-transform", "");

            app.mobileApp.pane.loader.show();
            app.MenuPage=false;    
            
   		var showMore = localStorage.getItem("ShowMore");
             if(showMore!==1){
               $("#goToAdmin").hide();             
             }else{
               $("#moreOption").hide();  
             }

            var db = app.getDb();
			db.transaction(getProfileInfoDB, app.errorCB, getProfileDBSuccess);
         };
            
            
         function getProfileInfoDB(tx) {
				var query = 'SELECT first_name , last_name , email , mobile FROM PROFILE_INFO';
				app.selectQuery(tx, query, profileDataSuccess);
             
                var query = 'SELECT org_id , org_name , role FROM JOINED_ORG';
				app.selectQuery(tx, query, orgDataSuccess);
			}


            function profileDataSuccess(tx, results) {
				var count = results.rows.length;
			if (count !== 0) {
			var fname = results.rows.item(0).first_name;
			var lname = results.rows.item(0).last_name;
			var email = results.rows.item(0).email;
			var mobile = results.rows.item(0).mobile;
        
            $("#userEmailId").html(email); 
            $("#userMobileNo").html(mobile);
            $("#userlname").html(lname);
            $("#userfname").html(fname); 
		}
			}
            
	function orgDataSuccess(tx, results) {    
        	var count = results.rows.length;      
        	var tempArray=[];
				if (count !== 0) {
                    
	             document.getElementById("orgData").innerHTML = "";
                    
        			for(var x=0; x < count;x++){
                     var pos = $.inArray(results.rows.item(x).org_id, tempArray);
                     console.log(pos);
 					if (pos === -1) {
						tempArray.push(results.rows.item(x).org_id);								                    
                		document.getElementById("orgData").innerHTML += '<ul><li>' + results.rows.item(x).org_name + '</li></ul>' 
                        }
            		}             
                }
        
      }
            


	function getProfileDBSuccess() {
		app.mobileApp.pane.loader.hide();
	}
            
            
            
           function OnImageLoad(evt) {

            var img = evt.currentTarget;

            // what's the size of this image and it's parent
            var w = $(img).width();
            var h = $(img).height();
            var tw = $(img).parent().width();
            var th = $(img).parent().height();

            // compute the new size and offsets
            var result = app.ScaleImage(w, h, tw, th, false);

            // adjust the image coordinates and size
            img.width = result.width;
            img.height = result.height;
            $(img).css("left", result.targetleft);
            $(img).css("top", result.targettop);
           
          };
            
            
                     
        var callOrganisationLogin = function(){
          app.MenuPage=false;	
          //window.location.href = "views/organisationLogin.html"; 
          console.log(account_Id);
          app.mobileApp.navigate('views/organisationLogin.html?account_Id='+account_Id);      
        };
        
    	         
        // Logout user
        var logout = function () {

        navigator.notification.confirm('Are you sure to Logout ?', function (checkLogout) {
            	if (checkLogout === true || checkLogout === 1) {                    

                    setTimeout(function() {
                       var db = app.getDb();
                       db.transaction(updateLoginStatus, updateLoginStatusError,updateLoginStatusSuccess);

                   }, 100);
            	}
        	}, 'Logout', ['OK', 'Cancel']);
        };
            
            
            
            function updateLoginStatus(tx) {
                
                var query = "DELETE FROM PROFILE_INFO";
        	    app.deleteQuery(tx, query);

            	var query = "DELETE FROM JOINED_ORG";
	            app.deleteQuery(tx, query);

            	var query = "DELETE FROM ORG_NOTIFICATION";
	            app.deleteQuery(tx, query);
                
                var query = "DELETE FROM ORG_NOTI_COMMENT";
	            app.deleteQuery(tx, query);
                                
	            var query = 'UPDATE PROFILE_INFO SET login_status=0';
            	app.updateQuery(tx, query);
            }
            

            function updateLoginStatusSuccess() {
                  window.location.href = "index.html";
            }

            function updateLoginStatusError(err) {
	            console.log(err);
            }

            
                    var inAppBrowser= function() {
                        app.MenuPage=false;
                        window.open('http://www.sakshay.in','_blank');
                    };
                        
                    var makeCall = function(){
                        app.MenuPage=false;
                        document.location.href = 'tel:+91-971-781-8898';
                    };
       
                    var about = function(){
                         app.MenuPage=false;
                         document.location.href="#infoDiv";
                    };
    
                    var setting = function(){
                         app.MenuPage=false;
                         document.location.href="#settingDiv";
                    };       


        return {
            //activities: activitiesModel.activities,
            //groupData:GroupsModel.groupData,
            //userData:UsersModel.userData,
            organisationSelected: organisationSelected,
            orgMoreInfoSelected:orgMoreInfoSelected,
            groupSelected:groupSelected,
            afterShow:afterShow,
            showOrgInfoPage:showOrgInfoPage,
            notificationSelected:notificationSelected,
            //CreatedAtFormatted:CreatedAtFormatted,          
                   
            manageGroup:manageGroup,
            about:about,
            setting:setting,
            inAppBrowser:inAppBrowser,  
            makeCall:makeCall,
            OnImageLoad:OnImageLoad,
            replyUser:replyUser,
            userProfileInt:userProfileInt,
            sendNotification:sendNotification,
            userProfileShow:userProfileShow,
	        orgShow:orgShow,
            info:info,
            init:init,
            show:show,
            callOrganisationLogin:callOrganisationLogin,
            refreshButton:refreshButton,
            unsubscribeOrg:unsubscribeOrg,
            logout: logout
        };

    }());

    return organisationViewModel;

}());
