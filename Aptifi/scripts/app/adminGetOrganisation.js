var app = app || {};

app.adminOragnisationList = (function () {
    'use strict'
 //var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 
 var activitiesDataSource;   
 var validator;
 var account_Id;
    
 var loginType,groupId,userId;
  
 		   var userlName;
            var userfName;
            var userMobile;
            var userEmail;
            var userOrgName;
            var userGropuName;   

        var organisationViewModel = (function () {

            
        var beforeShow=function(){
           var db = app.getDb();
		   db.transaction(getDataOrg, app.errorCB, showLiveData);   
        };
            
    
        var getDataOrg = function(tx){
            	var query = "SELECT * FROM ADMIN_ORG";
				app.selectQuery(tx, query, getDataSuccess);
            
               var db = app.getDb();
               db.transaction(updateProfileTab,app.errorCB,app.successCB);
        };
            
        
        var updateProfileTab = function(tx){
                var query = 'UPDATE PROFILE_INFO SET Admin_login_status=1';
            	app.updateQuery(tx, query);
        };
            
        var groupDataShow=[];
            
        function getDataSuccess(tx, results) {                        
            groupDataShow=[];
            
			var count = results.rows.length;                    			
               if (count !== 0) {                
            	    for(var i =0 ; i<count ; i++){                
                                       groupDataShow.push({
												 orgName: results.rows.item(i).org_name,
        		                                 orgDesc: results.rows.item(i).orgDesc,
                                                 organisationID:results.rows.item(i).org_id,
                                                 org_logo:results.rows.item(i).imageSource,
                                                 imageSource:'http://54.85.208.215/assets/upload_logo/'+results.rows.item(i).imageSource,
		                                         bagCount : 'C'					
                                       });
                    }
                }else{
                                     groupDataShow.push({
                                         orgName: 'Welcome to Aptifi',
                                         orgDesc: 'You are not a customer of any organisation',
                                         organisationID:'0',
                                         org_logo:null,
                                         imageSource:null,
                                         bagCount : 'D'    
    	                               });          
                }
  
             }               
            
            
            
             var showLiveData = function(){
                //console.log('Hello');
                //console.log(groupDataShow);
                
             var organisationListDataSource = new kendo.data.DataSource({
                  data: groupDataShow
              });           

                
             $("#admin-org-listview").kendoMobileListView({
  		    template: kendo.template($("#adminOrganisationTemplate").html()),    		
     		 dataSource: organisationListDataSource,
              pullToRefresh: true
             });
                               
              $('#admin-org-listview').data('kendoMobileListView').refresh();
                
              app.mobileApp.pane.loader.hide();

               if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }

                 
            };
    
            
        var init = function(){
           app.MenuPage=false;
           app.userPosition=false;
        };

         var show = function(e){
    
            var tabStrip = $("#upperTabAdmin").data("kendoMobileTabStrip");
	   	 tabStrip.switchTo("#view-all-activities-admin");
  
            $(".km-scroll-container").css("-webkit-transform", "");

             
           app.MenuPage=false;
           app.userPosition=false;
           app.mobileApp.pane.loader.hide();
                                     
            account_Id = e.view.params.account_Id;
	        account_Id = localStorage.getItem("ACCOUNT_ID");
            console.log(account_Id);
             

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
                           
                                            if(groupValue[0].Msg ==='Not a customer to any organisation'){     
                                                   beforeShow();
                                                }else if(groupValue[0].Msg==='Success'){
                                                    console.log(groupValue[0].orgData.length);  
                                                    var adminOrgInformation = groupValue[0].orgData;
                                                    saveAdminOrgInfo(adminOrgInformation); 
                                                }
                                     });
                    	return [data];

                   }                                                            
                },
	            error: function (e) {
                  $("#progress1").hide();  
    	           console.log(e);
                                     if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                     }else{
                                      app.showAlert("Network problem . Please try again later","Notification");  
                                     }
  
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
			db.transaction(insertAdminOrgInfo, app.errorCB, beforeShow);
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
            var organisationID=e.data.organisationID;
            //uid=' + e.data.uid
			app.MenuPage=false;	
            app.mobileApp.navigate('views/groupDetailView.html?organisationID=' + organisationID +'&account_Id='+account_Id+'&orgName='+e.data.orgName+'&orgDesc='+e.data.orgDesc);
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
             //document.location.href="#view-all-notification";
             //document.location.href="views/MessageChatLayout.html";
             document.location.href="#infoDiv";
        };
        
        
        var manageGroup =function(){
            app.MenuPage=false;	
            //app.mobileApp.pane.loader.show();
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var setting = function(){
             app.MenuPage=false;
             document.location.href="#settingDiv";
        };       
        
              
        var refreshButton = function(){
            
        };
        
         
        
        var info = function(){
            
        };
        
        var orgShow = function(){
          app.MenuPage=false;
            
          var orgDataSource= [];   
          var userOrgName = localStorage.getItem("userOrgName"); 
          console.log(userOrgName);
          
          //studentAnswerArray[i] = answerString.toString().split(',');
            
          orgDataSource.push({userOrgName:userOrgName});                                   
          
           $("#organisation-listview").kendoMobileListView({
  		    template: kendo.template($("#orgTemplate").html()),    		
     		 dataSource: orgDataSource
		   });
            
            
        };
        

            // var onComboSelect = function() {
               // alert("combo");
                // var selectData = $("#groupSelect").data("kendoComboBox");
                 //alert(selectData.value());
                 
          	 //var dataItem = this.dataItem(e.item.index());      
      	     //alert( dataItem.text + " : " + dataItem.value );
               /*  
                 
                 
                   $("#get").click(function() {
                        var categoryInfo = "\nCategory: { id: " + categories.value() + ", name: " + categories.text() + " }",
                            productInfo = "\nProduct: { id: " + products.value() + ", name: " + products.text() + " }",
                            orderInfo = "\nOrder: { id: " + orders.value() + ", name: " + orders.text() + " }";

                        alert("Order details:\n" + categoryInfo + productInfo + orderInfo);
                 */
        	//};
        
       
       var onChangeNotiGroup = function(){
            	 var selectDataNoti = $("#groupSelectNotification").data("kendoComboBox");    
             	var groupSelectedNoti = selectDataNoti.value();
             	return groupSelectedNoti;
       };
        
        
        
        var onAdminComboChange = function(){
       		  var selectData = $("#groupSelectAdmin").data("kendoComboBox");    
           	  var groupSelected = selectData.value();
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   if(groupSelected==='All'){
    			             app.Activities.activities.filter({
							                	
        	    								});
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: groupSelected
        	    								});
                                }

            
                      kendo.bind($('#activityTemplate'), activitiesDataSource);                              
			};
        
        
	    var onComboChange = function(){
                 //$("#activities-listview").empty();
            	 //var activities;
       		  var selectData = $("#groupSelect").data("kendoComboBox");    
           	  var groupSelected = selectData.value();
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   if(groupSelected==='All'){
    			              app.Activities.activities.filter({
							                	
                                 
        	    			  });
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: groupSelected
        	    								});
                                }

                      kendo.bind($('#activityTemplate'), activitiesDataSource);
                                    	         
   		 //var $notificationContainer = $('#activities-listview');
            //$notificationContainer.empty();
           // var notificationModel1 = (function () { 

             /*   var notiCModel = {
            				id: 'Id',
            				fields: {
				                CreatedAt: {
                					    field: 'CreatedAt',
        					            defaultValue: new Date()
		                					},
                                   Message: {
					                    field: 'Message',
                    					defaultValue: ''
               							 },
				                   Title :{
                   					 field: 'Title',
					                    defaultValue: ''  
                							}
            					    },
	            					CreatedAtFormatted: function () {
        	        						return app.helper.formatDate(this.get('CreatedAt'));
					    	        }
	        			};
                
					
                
			   if(groupSelected==='All'){
		                dataSource = new kendo.data.DataSource({
                                            type: 'everlive',
        						            schema: {
          									      model: notiCModel
        										    },

									            transport: {
								                // Required by Backend Services
								                typeName: 'GetNotification'
    									        },
            									                pageSize: '100',
                    					    				    page: 1,
											    				serverPaging: true,
                            
                                            change: function (e) {
									                if (e.items && e.items.length > 0) {
                    										$('#no-activities-span').hide();
									                } else {
										                    $('#no-activities-span').show();
                									}
           									 }    
   						  			  });
                  
               }else{
	            	        dataSource = new kendo.data.DataSource({
                                            type: 'everlive',
                                            filter: { field: "Group", value:groupSelected },
 									       schema: {
          									      model: notiCModel
        										    },

									        transport: {
									            typeName: 'GetNotification'
    									    },
												                pageSize: '100',
                                								page: 1,
															    serverPaging: true,
                                            change: function (e) {
									                if (e.items && e.items.length > 0) {
                    										$('#no-activities-span').hide();
									                } else {
										                    $('#no-activities-span').show();
                									}
           									 }    
   						  			  });
					}               
                
               	 console.log(dataSource);
                    $("#activities-listview").kendoMobileListView({
                	style: "inset",    
           		 dataSource: dataSource,
	                template: kendo.template($("#activityTemplate").html()),
            		endlessScroll: true,
            		scrollTreshold: 30,
            			click: function (e) {
	
                        }
        			});
                	$("#activities-listview").data("kendoMobileListView").dataSource.fetch();
                    $("#activities-listview").data("kendoMobileListView").refresh();
             */   
				//	}());             

/*                $("#activities-listview").kendoMobileListView({
				 	dataSource: dataSource,
	                 template: kendo.template($("#activityTemplate").html()),
				 	//template: $("#activityTemplate").html(),
     				endlessScroll: true,
					 scrollTreshold: 30
    			});
*/                
                
               // if ($("#activities-listview").data("kendoMobileListView") == undefined) {
     	
				/*}else {
                                        console.log("hello2");
    				$("#activities-listview").data("kendoMobileListView").dataSource = dataSource;
    				$("#activities-listview").data("kendoMobileListView").refresh();
				}*/
                
            };
        
    
           
          var initNotifi = function () {       
      	    app.MenuPage=false; 
          };
        
        var showNotifi = function(){
            app.MenuPage=false; 
            
             console.log(userlName+"||"+userfName+"||"+userMobile+"||"+userEmail+"||"+userOrgName+"||"+userGropuName);
             $("#orgData").val('');
             $("#groupData").val('');
            
            
             var userlName = localStorage.getItem("userlName");
             var userfName = localStorage.getItem("userfName");
             var userEmail = localStorage.getItem("userEmail");
             var userGropuName = localStorage.getItem("userGropuName"); 
             var userOrgName = localStorage.getItem("userOrgName");
             var userMobile = localStorage.getItem("userMobile");
            
            $("#userEmailId").html(userEmail); 
            $("#userMobileNo").html(userMobile);
            $("#userlname").html(userlName);
            $("#userfname").html(userfName); 
             
            for(var x=0; x < userOrgName.length;x++){
                document.getElementById("orgData").innerHTML += userOrgName[x];   
            } 
            
			for(var y=0; y < userGropuName.length;y++){
                document.getElementById("groupData").innerHTML += userGropuName[y];
			}

        };
            
        var callOrganisationLogin = function(){
          app.MenuPage=false;	
          //window.location.href = "views/organisationLogin.html"; 
          app.mobileApp.navigate('views/organisationLogin.html?account_Id='+account_Id);      
        };
        
    	         
        // Logout user
        
       var logout = function () {                   
           navigator.notification.confirm('Are you sure to Logout from Admin Panel ?', function (checkLogout) {
            	if (checkLogout === true || checkLogout === 1) {                    
                   //app.mobileApp.pane.loader.show();    
                   setTimeout(function() {
                       var db = app.getDb();
                       db.transaction(updateAdminLoginStatus, updateAdminLoginStatusError,updateAdminLoginStatusSuccess);
                   	 //window.location.href = "index.html";
                   }, 100);
            	}
        	}, 'Logout', ['OK', 'Cancel']);
        };
            
            
              function updateAdminLoginStatus(tx) {
                
                var query = "DELETE FROM ADMIN_ORG";
        	    app.deleteQuery(tx, query);

            	var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
	            app.deleteQuery(tx, query);

            	var query = "DELETE FROM ADMIN_ORG_GROUP";
	            app.deleteQuery(tx, query);
                                                
	            var query = 'UPDATE PROFILE_INFO SET Admin_login_status=0';
            	app.updateQuery(tx, query);
            }
            

            function updateAdminLoginStatusSuccess() {
                        var account_Id = localStorage.getItem("ACCOUNT_ID");
                        var userType = localStorage.getItem("USERTYPE");   

                app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Admin');
            }

            function updateAdminLoginStatusError(err) {
	            console.log(err);
            }



        return {
            //activities: activitiesModel.activities,
            //groupData:GroupsModel.groupData,
            //userData:UsersModel.userData,
            organisationSelected: organisationSelected,
            groupSelected:groupSelected,
            notificationSelected:notificationSelected,
            //CreatedAtFormatted:CreatedAtFormatted,          
            inAppBrowser:inAppBrowser,          
            manageGroup:manageGroup,
            makeCall:makeCall,
            initNotifi:initNotifi,
            showNotifi:showNotifi,
			about:about,
            setting:setting,
            orgShow:orgShow,
            info:info,
            init:init,
            beforeShow:beforeShow,
            show:show,
            callOrganisationLogin:callOrganisationLogin,
            refreshButton:refreshButton,
            logout: logout
        };

    }());

    return organisationViewModel;

}());
