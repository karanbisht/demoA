var app = app || {};

app.Activities = (function () {
    'use strict'
 //var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 
 var activitiesDataSource;   
 var validator;
 var loginType,groupId,userId;
    
        
    var orgId = localStorage.getItem("UserOrgID");                              
    
	   // Activities model
	    var activitiesModel = (function () {	
		var data; 
		//var groupId1 = localStorage.getItem("UserGroupID");
        var groupId1=2;    
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
            	   navigator.notification.alert("Please check your internet connection.",
               	function () { }, "Notification", 'OK');
           	
              },
             
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
            validator = $('#enterNotification').kendoValidator().data('kendoValidator');
            $newNotification = $('#newNotification');
            
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
        };
        

         var show = function(e){
           app.MenuPage=true;
           app.userPosition=false;
           app.mobileApp.pane.loader.hide();
             
              $newNotification.val('');
              validator.hideMessages();
            
            loginType = e.view.params.LoginType;
       	 userId = e.view.params.UserId;
            groupId =e.view.params.GroupId;
             
            console.log(userId+"||"+groupId);
             
            if(userId==='11' || userId==='13'){
             /*$("#aboutUsView").hide();
             $("#settingView").hide();
             $("#websiteView").hide();
             $("#callUsView").hide();*/
             $("#replyUserView").show();   
             $("#sendNotificationView").show();
             $("#manageGroupView").show();   
            }
            
                        
            /*
              $("#deleteMemberData").kendoListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#Member-Delete-template").html()),
        		autoBind: true
			});
           */
                     
               //kendo.bind($('#deleteMemberData'), MemberDataSource);      
           
            //if(GroupName==='All'){
    			             
            /*app.groupDetail.userData.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: GroupName   	    				        	
        	    								});
                           /*}else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: GroupName
        	    								});
                           }*/
            
           //kendo.bind($('#groupMemberTemplate'), MemberDataSource);      
         

             

           
            if (app.checkConnection()) {
                  //$('#no-activities-span').hide();
                     //show(e);
            } else {
                  //$('#no-activities-span').show();
                    var db = app.getDb();
					db.transaction(offlineQueryDB, app.onError, offlineQueryDBSuccess);
            }        
        };
        

        var offlineQueryDB = function(tx){
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
        
        var activitySelected = function (e) {
            console.log(e.data.uid);
			app.MenuPage=false;	
            app.mobileApp.navigate('views/activityView.html?uid=' + e.data.uid);
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
            var tempArray=[];
            var dataLength;
            var uniqueLength;
            var MemberDataSource;
            console.log(app.Activities.userData);
            
           /*app.Activities.userData.fetch(function(){
					  var view = app.Activities.userData.view()
                      console.log(view);
					  dataLength = view.length;
		               for(var i=0;i<dataLength;i++){
                           var pos = $.inArray(view[i].UserId, tempArray);
                           console.log(pos);
							if (pos === -1) {
								   tempArray.push(view[i].UserId);
   								//console.log(uniqueLabel + " added to array[]");
							 } //else {
 							//	  console.log("label " + uniqueLabel + " already exists at index "+ pos);
							 //}
                				//arrayUId.push(view[i].Id);
                                console.log("hello"+tempArray);
                            	uniqueLength=tempArray.length;
				         }
                                //console.log("Final Result"+ tempArray );
      	 });  
            
              for(var i=0;i<uniqueLength;i++){     		
                 app.groupDetail.userData.filter({
					field: 'Id',
                	operator: 'eq',
                    value: tempArray[i]
	     		});
               }
             kendo.bind($('#userTemplate'), MemberDataSource);     
            */
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
        
         
        var sendNotificationMessage = function () {     
            if (validator.validate()) {
                var group=onChangeNotiGroup();
                console.log(group);
                var notificationValue = $newNotification.val();
                var titleValue = $("#inputValue").val();
                
                /*var el = new Everlive('wKkFz2wbqFe4Gj0s');
					el.push.notifications.create({ Message:notificationValue},
					    function(data){
					        app.showAlert("Notification Send Sucessfully","Notification");
					    },

                
                		function(error){
					        app.showAlert(JSON.stringify(error));
    					});
                */
               
  			  var conditions = {
    				'User.Group': group
				};
				var notification;
                
                if(group==='All' || group==='' ){

                      	notification = {
                              Title: titleValue ,
                              Message:notificationValue  
							};    
              	  }else{
                     			 notification = {
								    Filter: JSON.stringify(conditions),
                                    Title: titleValue ,
                        	        Message:notificationValue  
							};
                }
				                
                		$.ajax({
    						type: "POST",
						    url: 'http://api.everlive.com/v1/wKkFz2wbqFe4Gj0s/Push/Notifications',
						    contentType: "application/json",
   						 data: JSON.stringify(notification),
                    
 						   success: function (data) {
                                if(group===''){
                                    group='All'
                                }
                                var el = new Everlive('wKkFz2wbqFe4Gj0s');
								var data = el.data('GetNotification');
								data.create({ 'Message': notificationValue , 'Group': group ,'Title':titleValue },
							    function(data){
							        //alert(JSON.stringify(data));
							    },
							    function(error){
    							    // alert(JSON.stringify(error));
							    });
    							app.showAlert("Notification Send Sucessfully","Notification");
						    },
                    
						    error: function (error) {
						        app.showAlert(JSON.stringify(error));
							}
						});
              }
        };
        
        var info = function(){
            
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
          	var dataSource = new kendo.data.DataSource({
  					type: 'everlive',   
  					transport: {
  					typeName: 'Group'
   				              }
						});
		
      	    $("#groupSelect").width(105).kendoComboBox({
  				dataSource: dataSource,
  				dataTextField: "Name",
  				dataValueField: "Name",
                  change: onComboChange
		  	});   
             
             
         /*    
			     // working for getting values from content type    
        		var el = new Everlive('wKkFz2wbqFe4Gj0s');
				var data = el.data('GetNotification');
				data.get()
            	//data.get(query)
    					.then(function(data){
    //    					alert(JSON.stringify(data.result[0].Message +" Title -: "+ data.result[0].Title));
          					alert(JSON.stringify(data));
    
    					},
    
            			function(error){
  			      		alert(JSON.stringify(error));
    					});
        */  
	        };
        
        var showNotifi = function(){
            app.MenuPage=false;
           // $("#notification-listview").data("kendoMobileListView").refresh()
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
            activities: activitiesModel.activities,
            groupData:GroupsModel.groupData,
            userData:UsersModel.userData,
            activitySelected: activitySelected,
            groupSelected:groupSelected,
            notificationSelected:notificationSelected,
            CreatedAtFormatted:CreatedAtFormatted,          
            sendNotificationMessage:sendNotificationMessage,
            inAppBrowser:inAppBrowser,          
            manageGroup:manageGroup,
            makeCall:makeCall,
            replyUser:replyUser,
            initNotifi:initNotifi,
            sendNotification:sendNotification,
            showNotifi:showNotifi,
			about:about,
            setting:setting,
            info:info,
            init:init,
            show:show,
            refreshButton:refreshButton,
            logout: logout
        };

    }());

    return activitiesViewModel;

}());
