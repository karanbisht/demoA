var app = app || {};

app.OragnisationList = (function () {
    'use strict'
 //var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 
 var activitiesDataSource;   
 var validator;
 var account_Id;
 var userType;
 var newUserType;   
 var num1=0,num2=0,num3=0;
 var groupDataShow = [];   
 var loginType,groupId,userId;
  
 		   var userlName;
            var userfName;
            var userMobile;
            var userEmail;
            var userOrgName;
            var userGropuName;   
    
        var organisationViewModel = (function () {
            
        var init = function(){
        
        };

         var show = function(e){
           app.MenuPage=true;
           app.userPosition=false;
  		 app.mobileApp.pane.loader.show();
             
           var from= e.view.params.from; 
             
             if(from==='Login'){
              account_Id = e.view.params.account_Id;
              userType= e.view.params.userType;
              newUserType = userType.split(',');   
                 
              //console.log("karan"+newUserType);  
              //console.log(newUserType.length);
                 
              localStorage.setItem("ACCOUNT_ID",account_Id);
              localStorage.setItem("USERTYPE",userType);
                 
             }else{                 
               account_Id = localStorage.getItem("ACCOUNT_ID");
               userType = localStorage.getItem("USERTYPE");
               newUserType = userType.split(',');   
             }
				
             console.log(account_Id);
             console.log(userType);
              
             
             for(var i=0;i<newUserType.length;i++){
                 console.log(newUserType[i]);
                 if(newUserType[i]==='C'){
                  num1=1;   
                 }else if(newUserType[i]==='O'){
                  num2=3;   
                 }else{
                  num3=5;   
                 }
             }
             
             
            if(num1===1 && num2===0 && num3===0){
                localStorage.setItem("ShowMore",1);
                $("#goToAdmin").hide();
             }else if(num2===3 && num1===0 && num3===0){
                localStorage.setItem("ShowMore",0);
                $("#moreOption").hide();  
             }else if(num1===1 && num2===3){
                 localStorage.setItem("ShowMore",0);
                 $("#moreOption").hide();
             }else if(num1===1){
                 localStorage.setItem("ShowMore",1);
                 $("#goToAdmin").hide();
             }
             
             
            var organisationNotificationModel = {
            id: 'Id',
            fields: {
                orgName: {
                    field: 'orgName',
                    defaultValue: ''
                },
                orgDesc :{
                    field: 'orgDesc',
                    defaultValue: ''  
                },
                organisationID: {
                    field: 'organisationID',
                    defaultValue: null
                }/*,
                CreatedAt: {
                    field: 'send_date',
                    defaultValue: new Date()
                },
                organisationID: {
                    field: 'organisationID',
                    defaultValue: null
                }*/                  
            },            
                 
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('CreatedAt'));
            }
            
          };
             
             
          var organisationListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/organisation/customerOrg/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: organisationNotificationModel,                                
                 data: function(data)
  	             {
                       console.log(data);
               			groupDataShow = [];
                        //var groupDataShow = [];
                                  $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                     
                                   $.each(groupValue, function(i, orgVal) {
                                  			console.log();

                   	             if(orgVal.Msg ==='Not a customer to any organisation'){     
                	                   groupDataShow.push({
                                         orgName: 'Welcome to Aptifi',
                                         orgDesc: 'You are not a customer of any organisation',
                                         organisationID:'0',
                                         org_logo :null,  
                                         bagCount : 'D'    
    	                               });                                      
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.orgData.length);  
                                        for(var i=0;i<orgVal.orgData.length;i++){
                                            groupDataShow.push({
												 orgName: orgVal.orgData[i].org_name,
        		                                 orgDesc: orgVal.orgData[i].org_desc,
                                                 organisationID:orgVal.orgData[i].organisationID,
                                                 org_logo:orgVal.orgData[i].org_logo,
                                                 imageSource:'http://54.85.208.215/assets/upload_logo/'+orgVal.orgData[i].org_logo,
		                                         bagCount : 'C'					
                                            });
                                        }     
                                                                                     
                                    }
                                       
                                       
                                                                            
                                   });    
                                      
                                  /*   
                                     var orgLength=groupValue[0].sentNotification.length;
                                     console.log(orgLength);
                            
                                     for(var j=0;j<orgLength;j++){
                                     groupDataShow.push({
                                         attached: groupValue[0].sentNotification[j].attached,
                                         message: groupValue[0].sentNotification[j].message,
                                         notification_id: groupValue[0].sentNotification[j].notification_id,
                                         send_date:groupValue[0].sentNotification[j].send_date,
                                         title:groupValue[0].sentNotification[j].title,
                                          type:groupValue[0].sentNotification[j].type

                                     });
                                   }
                                     */
                                 });
                       
		                         console.log(groupDataShow);
                                 return groupDataShow;
                       
                   }                       
            },
	            error: function (e) {
    	           //apps.hideLoading();
        	       console.log(e);
            	   navigator.notification.alert("Please check your internet connection.",
               	function () { }, "Notification", 'OK');
           	}
	        
    	    });         
         
            
            organisationListDataSource.fetch(function() {
                
 		   });
             
             app.mobileApp.pane.loader.hide();

             $("#organisation-listview").kendoMobileListView({
  		    template: kendo.template($("#organisationTemplate").html()),    		
     		 dataSource: organisationListDataSource,
              pullToRefresh: true,
        	  schema: {
           		model:  organisationNotificationModel
  			 }
               
                 
		     });
             
              
            /* 
       	 userId = e.view.params.UserId;
            groupId =e.view.params.GroupId;
            userlName =e.view.params.userlName;
            userfName =e.view.params.userfName;
            userMobile =e.view.params.userMobile;
            userEmail =e.view.params.userEmail;
            userOrgName =e.view.params.userOrgName;
            userGropuName =e.view.params.userGropuName;
             
          
             
            if(loginType==='O'){
             $("#replyUserView").show();   
             $("#sendNotificationView").show();
             $("#manageGroupView").show();
             $("#upperTab").hide();   
            }
                     
             
            if (app.checkConnection()) {
                  //$('#no-activities-span').hide();
                     //show(e);
            } else {
                  //$('#no-activities-span').show();
                    var db = app.getDb();
					db.transaction(offlineQueryDB, app.onError, offlineQueryDBSuccess);
            } 
            */
             
          
        };
            
        var afterShow = function(){
              var db = app.getDb();
		  	db.transaction(insertOrgImage, app.errorCB, app.successCB);  
        }    
            
         var insertOrgImage = function(tx){
             console.log(groupDataShow.length);
             
             for(var i=0;i<groupDataShow.length;i++){     
                 var query = 'UPDATE JOINED_ORG SET imageSource=' + groupDataShow[i].imageSource + ' WHERE org_id=' + groupDataShow[i].organisationID;
				 app.updateQuery(tx, query);
             }
         };   
            
        
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
            //console.log(e.data.uid);
            var organisationID=e.data.organisationID;
            //uid=' + e.data.uid
			app.MenuPage=false;	
            app.mobileApp.navigate('views/activitiesView.html?organisationID=' + organisationID +'&account_Id='+account_Id);
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
             document.location.href="#infoDiv";
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
        
        var setting = function(){
             app.MenuPage=false;
             document.location.href="#settingDiv";
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
            var query = 'SELECT org_id , org_name , role , imageSource FROM JOINED_ORG';
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
                         imageSourceOrg:"http://54.85.208.215/assets/upload_logo/",   
                         orgDesc:''                      
                       });         
                    }
                }
			}
		};
           

	function getOrgDBSuccess() {
			app.mobileApp.pane.loader.hide();
            //console.log(orgDbData);
        
             $("#organisation-listview1").kendoMobileListView({
  		    template: kendo.template($("#orgTemplate").html()),    		
     		 dataSource: orgDbData        			 
		     });
                
		};
       
            
            
            
        var orgForGroupSelected =function(e){
            alert("hello");
            //var organisationID=e.data.organisationID;
            //uid=' + e.data.uid
            console.log(e.data);
			app.MenuPage=false;	
            app.mobileApp.navigate('views/activitiesView.html?organisationID=' + organisationID +'&account_Id='+account_Id);                
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
        
    
           
         var userProfileInt = function () {       
      	    app.MenuPage=false; 
         };
        
        var userProfileShow = function(){
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
            
            
                     
        var callOrganisationLogin = function(){
          alert('click');  
          app.MenuPage=false;	
          //window.location.href = "views/organisationLogin.html"; 
          console.log(account_Id);
          app.mobileApp.navigate('views/organisationLogin.html?account_Id='+account_Id);      
        };
        
    	         
        // Logout user
        var logout = function () {

        navigator.notification.confirm('Are you sure to Logout ?', function (checkLogout) {
            	if (checkLogout === true || checkLogout === 1) {                    
                   app.mobileApp.pane.loader.show();    
                   setTimeout(function() {
                   	 window.location.href = "index.html";
                   }, 100);
            	}
        	}, 'Logout', ['OK', 'Cancel']);
        };


        return {
            //activities: activitiesModel.activities,
            //groupData:GroupsModel.groupData,
            //userData:UsersModel.userData,
            organisationSelected: organisationSelected,
            orgForGroupSelected:orgForGroupSelected,
            groupSelected:groupSelected,
            afterShow:afterShow,
            notificationSelected:notificationSelected,
            //CreatedAtFormatted:CreatedAtFormatted,          
            inAppBrowser:inAppBrowser,          
            manageGroup:manageGroup,
            makeCall:makeCall,
            replyUser:replyUser,
            userProfileInt:userProfileInt,
            sendNotification:sendNotification,
            userProfileShow:userProfileShow,
			about:about,
            setting:setting,
            orgShow:orgShow,
            info:info,
            init:init,
            show:show,
            callOrganisationLogin:callOrganisationLogin,
            refreshButton:refreshButton,
            logout: logout
        };

    }());

    return organisationViewModel;

}());
