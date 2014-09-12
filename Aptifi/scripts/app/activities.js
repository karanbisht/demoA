var app = app || {};

app.Activities = (function () {
    'use strict'
 //var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 
 var activitiesDataSource;   
 var validator;
 var loginType,groupId,userId;
  var userlName;
  var organisationID;  
  var account_Id;  
            var userfName;
            var userMobile;
            var userEmail;
            var userOrgName;
            var userGropuName;   
        	var bagCount;
   		 var groupDataShow = [];
            var lastNotificationPID;
    		var DBGETDATAVALUE;
    var orgId = localStorage.getItem("UserOrgID");                              
    
	   // Activities model
    /*
	    var activitiesModel = (function () {	
		var data; 
		var groupId1 = localStorage.getItem("UserGroupID");
        //var groupId1=2;    
 	   var userId1 = localStorage.getItem("UserID");	
     
              console.log("karan"+groupId1+"||"+userId1+"||"+orgId);            

            var activityModel = {

            id: 'Id',
            fields: {
                message: {
                    field: 'message',
                    defaultValue: ''
                },
                title :{
                    field: 'title',
                    defaultValue: ''  
                },
                CreatedAt: {
                    field: 'send_date',
                    defaultValue: new Date()
                },
                notification_id: {
                    field: 'notification_id',
                    defaultValue: null
                }                  
            },
            
                 
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('CreatedAt'));
            },
            
            /*PictureUrl: function () {
                return app.helper.resolvePictureUrl(this.get('Picture'));
            },*/
            
/*            
            isVisible: function () {
                var currentUserId = app.Users.currentUser.data.Id;
                var userId = this.get('UserId');
                return currentUserId === userId;
            }
          };
             
             
          var activitiesDataSource = new kendo.data.DataSource({

            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/notificationHistory?group_id="+groupId1 +"&customer_id="+userId1,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
              	}
              },
       	 schema: {
               model: activityModel,
                                
                 data: function(data)
  	             {
                       console.log(data);
               
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
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
                                 });
                       		console.log('karan');	
		                         console.log(groupDataShow);
                                 return groupDataShow;
                       
                       }                       
            },
	            
              error: function (e) {
    	           //apps.hideLoading();
        	       console.log(e);
                  /*
                  navigator.notification.alert("Please check your internet connection.",
               	
                  function () { }, "Notification", 'OK');
           	   
                  
                  */
/*              },
             
              sort: { field: 'send_date', dir: 'desc' }
	        
    	    });                    
            
            //var arr = [];
        	    var len =null;
				 	console.log(activitiesDataSource.data().length);
		 	        activitiesDataSource.fetch(function(){
     		           data = activitiesDataSource.data();
            			len = data.length;
            			console.log(data.length);
                        //var db = app.getDb();             
						//db.transaction(insertNotification, app.onError, app.onSuccess);
    			    });
            
              var insertNotification = function(tx){
						        var query = "DELETE FROM GetNotification";
								app.deleteQuery(tx, query);
                  for (var i = 0; i < len; i++) {
    	       		var queryNotification = 'INSERT INTO GetNotification (Title, Message,CreatedAt) VALUES ("'+ data[i].Title+'","'+data[i].Message+'","'+ data[i].CreatedAt +'")';
					   app.insertQuery(tx,queryNotification);  	
        			}   
    				
               };
           
 				console.log(activitiesDataSource);
				    return {          
    		        	activities: activitiesDataSource
        			};
        }());
    
    
     var GroupsModel = (function () {                 
       var GroupModel = {
            id: 'Id',
            fields: {
                CreatedAt: {
                    field: 'CreatedAt',
                    defaultValue: new Date()
                },
                Name: {
                    field: 'Name',
                    defaultValue: null
                }
            },
	            CreatedAtFormatted: function () {
        	        return app.helper.formatDate(this.get('CreatedAt'));
    	        }
	       };        
        
	        var groupDataSource = new kendo.data.DataSource({
            type: 'everlive',
	           schema: {
                model: GroupModel
            },

            transport: {
                typeName: 'Group'
            },
               
             sort: { field: 'CreatedAt', dir: 'desc' }    
	        });
               
	        return {
            	groupData: groupDataSource
        	};
	}());
    
    
    
    var UsersModel = (function () {                 
       var UserModel = {
            id: 'Id',
            fields: {
                ModifiedAt: {
                    field: 'ModifiedAt',
                    defaultValue: new Date()
                },
                UserId: {
                    field: 'UserId',
                    defaultValue: null
                }
            },
           
            User: function () {
                var userId = this.get('UserId');
                var user = $.grep(app.Users.users(), function (e) {
                    return e.Id === userId;
                })[0];
                return user ? user.DisplayName : 'Anonymous';    
            },
           
	          CreatedAtFormatted: function () {
        	        return app.helper.formatDate(this.get('ModifiedAt'));
    	        }
   	       };        
        
	        var userDataSource = new kendo.data.DataSource({
            type: 'everlive',
	           schema: {
                model: UserModel
            },

            transport: {
                // Required by Backend Services
                typeName: 'NotificationReply'
            },
                
            change: function (e) {
                if (e.items && e.items.length > 0) {
                    $('#no-notification-span').hide();
                } else {
                    $('#no-notification-span').show();
                }
            },
                
             sort: { field: 'ModifiedAt', dir: 'desc' }    
	        });
               
	        return {
            	userData: userDataSource
        	};
	}());
    
        
    // Activities view model
    var activitiesViewModel = (function () {
        // Navigate to activityView When some activity is selected
      
        var $newNotification;
        
        var init = function () {        
            app.MenuPage=true;
            app.userPosition=false;
            
          var comboGroupListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/getGroupByOrgID/"+orgId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
              	}
              },
       	 schema: {               
                  data: function(data)
  	             {	console.log(data);
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                     var orgLength=groupValue[0].grpData.length;
                                   for(var j=0;j<orgLength;j++){
                                     groupDataShow.push({
                                         pid: groupValue[0].grpData[j].pid,
                                         group_name: groupValue[0].grpData[j].group_name,
                                         add:groupValue[0].grpData[j].add,
                                         group_desc:groupValue[0].grpData[j].group_desc
                                     });
                                   }
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
           },       
             sort: { field: 'add', dir: 'desc' }    
	       });
               
	                                        
      	    $("#groupSelect").kendoComboBox({
  				dataSource: comboGroupListDataSource,
  				dataTextField: "group_name",
  				dataValueField: "pid",
                  change: onComboChange
		  	});
	            $("#groupSelectAdmin").kendoComboBox({
  				dataSource: comboGroupListDataSource,
  				dataTextField: "group_name",
  				dataValueField: "pid",
                  change: onAdminComboChange
		  	});
               
            /*$("#groupSelectNotification").kendoComboBox({
  				dataSource: comboGroupListDataSource,
  				dataTextField: "group_name",
  				dataValueField: "pid",
                  change: onChangeNotiGroup
		    });
            */
/*        };
        
*/

    var activitiesViewModel = (function () {
            
         var init = function(){
             
         }   
                                 
         var show = function(e){
           groupDataShow=[];
             //alert("ShowFunction");
             
           app.MenuPage=false;
           app.userPosition=false;
           app.mobileApp.pane.loader.show();
                                      
           organisationID = e.view.params.organisationID;
       	account_Id = e.view.params.account_Id;
           bagCount = e.view.params.bagCount; 
           
           var db = app.getDb();
		   db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
        };
            
        var orgNotiDataVal;
        
        function saveOrgNotification(data) {
            orgNotiDataVal = data;      
			var db = app.getDb();
			db.transaction(insertOrgNotiData, app.errorCB, app.successCB);
		};
            
            
     function insertOrgNotiData(tx){
        //var query = "DELETE FROM ORG_NOTIFICATION";
		//app.deleteQuery(tx, query);

        var dataLength = orgNotiDataVal.length;
        //alert('LiveDataVal'+dataLength);
         
 
       for(var i=0;i<dataLength;i++){       
    	   var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type) VALUES ("'
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
				+ '")';              
                app.insertQuery(tx, query);
        }                               
      }
                        
            
        var getDataOrgNoti = function(tx){
            var query = 'SELECT * FROM ORG_NOTIFICATION where org_id='+organisationID ;
			app.selectQuery(tx, query, getOrgNotiDataSuccess);
        };    
                        
            
        function getOrgNotiDataSuccess(tx, results) {
			var count = results.rows.length;
                DBGETDATAVALUE = count;           
            //alert(count);
			if (count !== 0) {
                groupDataShow=[];
            	for(var i =0 ; i<count ; i++){    
                    
                    //alert(results.rows.item(i).attached);
                    
                                   /* if(results.rows.item(i).attached!== null && results.rows.item(i).attached!==''){
                                                        var attachedImg ='http://54.85.208.215/assets/attachment/'+results.rows.item(i).attached;
                                                        $('#notiImagefirstShow').css({"height":"100px"});
                                                        $('#notiImagefirstShow').css({"width":'100px'});
                                                        $('#notiImagefirstShow').css({"margin-top":"10px"});                                                         
                                                        
                                                        var img = $('<img id="imgShowfirstShow" style="width:100%;height:100%" />'); //Equivalent: $(document.createElement('img'))
                                            			img.attr('src', attachedImg);
                                            			img.appendTo('#notiImagefirstShow'); 
                                      }*/

                      groupDataShow.push({
												 message: results.rows.item(i).message,
        		                                 org_id: results.rows.item(i).org_id,
                                                 date:results.rows.item(i).send_date,
                                                 title:results.rows.item(i).title,
                                                 pid :results.rows.item(i).pid ,
                                                 comment_allow:results.rows.item(i).comment_allow ,
		                                         bagCount : 'C',
                                                 attachedImg :results.rows.item(i).attached,
                                                 attached :'http://54.85.208.215/assets/attachment/'+results.rows.item(i).attached
                       });
                  lastNotificationPID=results.rows.item(i).pid;
        	    }    
                 console.log(lastNotificationPID);
            }else{
                lastNotificationPID=0;
            }                       
         };       


            
            
            
        var afterShow = function(){
              var db = app.getDb();
		  	db.transaction(insertBagCount, app.errorCB, app.successCB);  
        };    
            
         var insertBagCount = function(tx){             
             console.log('ssss'+bagCount);
             console.log('ssss'+organisationID);

                 var query = 'UPDATE JOINED_ORG SET bagCount=' +bagCount + ' WHERE org_id=' +organisationID ;
				 app.updateQuery(tx, query);
         };   
            
            
         var showLiveData = function(){
            var organisationAllNotificationModel = {
            id: 'Id',
            fields: {
                title: {
                    field: 'title',
                    defaultValue: ''
                },
                message :{
                    field: 'message',
                    defaultValue: ''  
                },
                notificationID: {
                    field: 'notificationID',
                    defaultValue: null
                },
                CreatedAt: {
                    field: 'date',
                    defaultValue: new Date()
                }/*,
                organisationID: {
                    field: 'organisationID',
                    defaultValue: null
                }*/                  
            },            
                 
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('CreatedAt'));
            }
            
          };
             
          console.log(lastNotificationPID);
             
          var organisationALLListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getCustomerNotification/"+ organisationID+"/"+account_Id+"/"+lastNotificationPID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: organisationAllNotificationModel,                                
                 data: function(data)
  	             {
                       console.log(data);
               
                        var orgNotificationData; 
                                  $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                     
                                   $.each(groupValue, function(i, orgVal) {
                                     console.log();

                   	             if(orgVal.Msg ==='No notification' && DBGETDATAVALUE===0){     
                	                   groupDataShow.push({
                                         title: ' No Notification ',
                                         message: 'No Notification from this Organisation',
                                         date:'0',  
                                         comment_allow : 'Y',
                                         org_id:'0', 
                                         pid:'',
                                         bagCount : '',
                                         attachedImg :'',  
                                         attached:''  
    	                               });                   
                                        
	                                }else if(orgVal.Msg==='Success'){
                                                        //alert(orgVal.notificationList[i].attached);
                                        
                                                    /*if(orgVal.notificationList[i].attached!== null && orgVal.notificationList[i].attached!==''){
                                                        var attachedImg ='http://54.85.208.215/assets/attachment/'+orgVal.notificationList[i].attached;
                                                        $('#notiImagefirstShow').css({"height":"100px"});
                                                        $('#notiImagefirstShow').css({"width":'100px'});
                                                        $('#notiImagefirstShow').css({"margin-top":"10px"});                                                         
                                                        
                                                        var img = $('<img id="imgShowfirstShow" style="width:100%;height:100%" />'); //Equivalent: $(document.createElement('img'))
                                            			img.attr('src', attachedImg);
                                            			img.appendTo('#notiImagefirstShow'); 
                                                    }*/

                                        console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        for(var i=0;i<orgVal.notificationList.length;i++){
                                            groupDataShow.push({
												 message: orgVal.notificationList[i].message,
        		                                 org_id: orgVal.notificationList[i].org_id,
                                                 date:orgVal.notificationList[i].send_date,
                                                 title:orgVal.notificationList[i].title,
                                                 pid :orgVal.notificationList[i].pid ,
                                                 comment_allow:orgVal.notificationList[i].comment_allow ,
		                                         bagCount : 'C',
                                                 attachedImg :orgVal.notificationList[i].attached,
                                                 attached :'http://54.85.208.215/assets/attachment/'+orgVal.notificationList[i].attached
                                            });
                                        }
                                        saveOrgNotification(orgNotificationData);                                                                                     
                                    }
                                                                            
                                   });    
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
         
            
            //organisationALLListDataSource.fetch(function() {
                
 		   //});

             $("#activities-listview").kendoMobileListView({
  		    template: kendo.template($("#activityTemplate").html()),    		
     		 dataSource: organisationALLListDataSource,
              pullToRefresh: true,
        		schema: {
           		model:  organisationAllNotificationModel
				}			 
		     });
                     app.mobileApp.pane.loader.hide();

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
        */         
       
            var CreatedAtFormatted = function(value){
            return app.helper.formatDate(value);
        
            };

       /*     
		var offlineQueryDBSuccess = function(){
            console.log("Query Success");
        };
        */
            
        var activitySelected = function (e) {
            console.log(e.data.uid);
            console.log(e.data);
            var message = e.data.message;
            var title = e.data.title;
            var org_id = e.data.org_id;
            console.log(org_id);
            var notiId=e.data.pid;
            var comment_allow=e.data.comment_allow;//: "1"
            var attached = e.data.attached;
			app.MenuPage=false;	
            app.mobileApp.navigate('views/activityView.html?message=' + message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow+'&attached='+attached);
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
        



        return {
            //activities: activitiesModel.activities,
            //groupData:GroupsModel.groupData,
            //userData:UsersModel.userData,
            activitySelected: activitySelected,
            groupSelected:groupSelected,
            notificationSelected:notificationSelected,
            CreatedAtFormatted:CreatedAtFormatted,          
            inAppBrowser:inAppBrowser,          
            manageGroup:manageGroup,
            showLiveData:showLiveData,
            makeCall:makeCall,
            replyUser:replyUser,
            sendNotification:sendNotification,
			about:about,
            setting:setting,
            info:info,
            init:init,
            show:show,
            afterShow:afterShow,
            refreshButton:refreshButton
        };

    }());

    return activitiesViewModel;

}());
