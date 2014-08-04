var app = app || {};

app.Activities = (function () {
    'use strict'
 var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 var activitiesDataSource;   
    var validator;
	   // Activities model
	    var activitiesModel = (function () {	
		var data; 
            var activityModel = {
            id: 'Id',
            fields: {
                Message: {
                    field: 'Message',
                    defaultValue: ''
                },
                Title :{
                    field: 'Title',
                    defaultValue: ''  
                },
                CreatedAt: {
                    field: 'CreatedAt',
                    defaultValue: new Date()
                },
                UserId: {
                    field: 'UserId',
                    defaultValue: null
                }                  
            },
            
                 
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('CreatedAt'));
            },
            
            /*PictureUrl: function () {
                return app.helper.resolvePictureUrl(this.get('Picture'));
            },*/
            
            User: function () {
                var userId = this.get('UserId');
                var user = $.grep(app.Users.users(), function (e) {
                    return e.Id === userId;
                })[0];

                /*return user ? {
                    DisplayName: user.DisplayName,
                    PictureUrl: app.helper.resolveProfilePictureUrl(user.Picture)
                } : {
                    DisplayName: 'Anonymous',
                    PictureUrl: app.helper.resolveProfilePictureUrl()
                };*/
            },
            
            isVisible: function () {
                var currentUserId = app.Users.currentUser.data.Id;
                var userId = this.get('UserId');
                return currentUserId === userId;
            }
        };
            

        // Activities data source. The Backend Services dialect of the Kendo UI DataSource component
        // supports filtering, sorting, paging, and CRUD operations.

            activitiesDataSource = new kendo.data.DataSource({
            type: 'everlive',
            schema: {
                model: activityModel
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
            },
                
            //onrequestend: function (e) {
        		//insertRecord();
		    //},
            sort: { field: 'CreatedAt', dir: 'desc' }
	        });            
            
            //var arr = [];
        	    var len =null;
				 	console.log(activitiesDataSource.data().length);
		 	        activitiesDataSource.fetch(function(){
     		           data = activitiesDataSource.data();
            			len = data.length;
            			console.log(data.length);
                        var db = app.getDb();             
						db.transaction(insertNotification, app.onError, app.onSuccess);
        				//db.transaction(insertNotification, errorCB, successCB);
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
        app.userPosition=false;
        // Navigate to activityView When some activity is selected
        var loginType;
        var $newNotification;
        
        var init = function () {        
            app.MenuPage=true;      
            validator = $('#enterNotification').kendoValidator().data('kendoValidator');
            $newNotification = $('#newNotification');
            
            var dataSource = new kendo.data.DataSource({
  					type: 'everlive',   
  					transport: {
  					typeName: 'Group'
   				              }
			});
            
      	    $("#groupSelect").kendoComboBox({
  				dataSource: dataSource,
  				dataTextField: "Name",
  				dataValueField: "Name",
                  change: onComboChange
		  	});
	            $("#groupSelectAdmin").kendoComboBox({
  				dataSource: dataSource,
  				dataTextField: "Name",
  				dataValueField: "Name",
                  change: onAdminComboChange
		  	});
               $("#groupSelectNotification").kendoComboBox({
  				dataSource: dataSource,
  				dataTextField: "Name",
  				dataValueField: "Name",
                  change: onChangeNotiGroup
		  	});            
        };
        

         var show = function(e){
              app.MenuPage=true; 
              $newNotification.val('');
              validator.hideMessages();
            
            loginType = e.view.params.LoginType;
       
            if(loginType==='Admin'){
             $("#aboutUsView").hide();
             $("#settingView").hide();
             $("#websiteView").hide();
             $("#callUsView").hide();
             $("#replyUserView").show();   
             $("#sendNotificationView").show();
             $("#manageGroupView").show();   
            }
           
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
            //console.log(e.data.uid);
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
        
        var addGroupFunc = function(){            
            var newGroupValue = $("#newGroup").val();
                        
			var data = el.data('Group');
            data.create({ 'Name' : newGroupValue },
    
            function(data){
        		//alert(JSON.stringify(data));
                app.showAlert("Group Added Successfully","Notification");
                $("#newGroup").val();
                app.mobileApp.navigate('views/groupListPage.html');
    		},
    
            function(error){
                    app.showAlert("Please try again later","Notification");
                //alert(JSON.stringify(error));
    		});
  
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
            
           app.Activities.userData.fetch(function(){
					  var view = app.Activities.userData.view();
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
        };
        
        var manageGroup =function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var addGroup = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/addGroup.html');    
        };
        
        var deleteGroup = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/deleteGroup.html');    
        };
        

        var setting = function(){
             app.MenuPage=false;
             document.location.href="#settingDiv";
        };
        

        var deleteGroupFunc = function(){
            //var data = $('input:checkbox:checked').val();
			var val = [];
		        $(':checkbox:checked').each(function(i){
          	  val[i] = $(this).val();
        	});
            
            var arrLength=val.length;
            var delVal =0;
            
          $.each(val,function(i,dataValue){  
            var data = el.data('Group');
			data.destroySingle({ Id: dataValue },    		
	        
              function(){
				  delVal++;
   			 },
 		
              function(error){
			    });
          
          });	
           
           	  app.showAlert("Group Deleted Successfully","Notification");
        };
        
        var sendNotification = function(){
            app.MenuPage=false;
            document.location.href="#sendNotificationDiv";
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
               	 	app.helper.logout()
            			.then(navigateHome, function (err) {

                            
                            app.showError(err.message);
                		navigateHome();
            		});
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
            addGroupFunc:addGroupFunc,
            sendNotificationMessage:sendNotificationMessage,
            inAppBrowser:inAppBrowser,
            deleteGroupFunc:deleteGroupFunc,
            manageGroup:manageGroup,
            addGroup:addGroup,
            deleteGroup:deleteGroup,
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
