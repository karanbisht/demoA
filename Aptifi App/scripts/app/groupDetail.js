var app = app || {};

app.groupDetail = (function () {


    var GroupName;
    var selectedGroupId;
    var selectedGroupDesc;
    var custFromGroup= [];
    var orgId = localStorage.getItem("UserOrgID");
    var el = new Everlive('wKkFz2wbqFe4Gj0s');          
    
    
        /*
	        MemberDataSource = new kendo.data.DataSource({
            type: 'everlive',
	           schema: {
                model: UserModel
            },

            transport: {
                // Required by Backend Services
                typeName: 'Users'
            },
                
            change: function (e) {
                if (e.items && e.items.length > 0) {
                    $('#no-Group-span').hide();
                } else {
                    $('#no-Group-span').show();
                }
            },
             sort: { field: 'CreatedAt', dir: 'desc' }    
	        });
               
	        return {
            	userData: MemberDataSource
        	};
         */
	

   
    var groupDetailViewModel = (function () {

        
  			var init = function () {
             
                      
      		};
           
           
        var show = function (e) {
            app.MenuPage=false;
            app.mobileApp.pane.loader.hide();
            
		    console.log("show function");
            activityUid = e.view.params.uid;
            console.log(activityUid);
            // Get current activity (based on item uid) from Activities model
            activity = app.GroupList.groupListData.getByUid(activityUid);
            console.log(activity.group_name);
			GroupName = activity.group_name;
            selectedGroupId = activity.pid;
            selectedGroupDesc = activity.group_desc;
            console.log(selectedGroupId);
            console.log(selectedGroupDesc);            
        };
           
           
        var showGroupNotification = function(){
        	 app.MenuPage=false;
              var activitiesDataSource;
              console.log(GroupName);
               app.mobileApp.navigate('#groupNotificationShow');
            
            
            var activityNotificationModel = {
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
            }
            
          };
             
             
          var notificationListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/notificationHistory?group_id="+selectedGroupId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: activityNotificationModel,
                                
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
         
            
            notificationListDataSource.fetch(function() {
                
 		   });

             $("#groupDetail-listview").kendoMobileListView({
  		    template: kendo.template($("#groupDetailTemplate").html()),    		
     		 dataSource: notificationListDataSource,
              pullToRefresh: true,
        		schema: {
           		model:  activityNotificationModel
				}			 
		     });

   	  
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   /*if(GroupName==='All'){
    			             app.Activities.activities.filter({
							                	
        	    								});
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: GroupName
        	    								});
                           }*/

                     // kendo.bind($('#groupDetailTemplate'), activitiesDataSource);     
        };
           
           
           

        
        
        var showGroupMembers = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#groupMemberShow');         
            
                           
            var UserModel ={
            id: 'Id',
            fields: {
                mobile: {
                    field: 'mobile',
                    defaultValue: ''
                },
                first_name: {
                    field: 'first_name',
                    defaultValue: ''
                },
                email: {
                    field: 'email',
                    defaultValue:''
                },
                last_name: {
                    field: 'last_name',
                    defaultValue:''
                }
               }
             };
            
        var MemberDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/getCustomerByGroupID/"+selectedGroupId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
              	}
              },
       	 schema: {
               model: UserModel,
                
                
                 data: function(data)
  	             {
                       console.log(data);
                       
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                     var orgLength=groupValue[0].customerData.length;
                                     console.log(orgLength);
                            
                                     for(var j=0;j<orgLength;j++){
                                      var dataVal = groupValue[0].customerData[j].customerID;
                                         custFromGroup.push(dataVal);
                                         
                                         groupDataShow.push({
                                         customerID: groupValue[0].customerData[j].customerID,
                                         first_name: groupValue[0].customerData[j].first_name,
                                         last_name: groupValue[0].customerData[j].last_name,
                                         email:groupValue[0].customerData[j].email,
                                         mobile:groupValue[0].customerData[j].mobile
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
           	}
	        
    	    });         
         
            
            MemberDataSource.fetch(function() {
                
 		   });
	
         
    	    $("#groupMember-listview").kendoMobileListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#groupMemberTemplate").html()),
                pullToRefresh: true, 
			});
            
             $("#deleteMemberData").kendoListView({
  		    template: kendo.template($("#Member-Delete-template").html()),    		
     		 dataSource: MemberDataSource,
        		schema: {
           		model:  UserModel
				}			 
		     });
            
            
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
        };
        
        

        var showUpdateGroupView = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#updateGroupInfo');      
               
            $("#editGroupName").val(GroupName);
            $("#editGroupDesc").val(selectedGroupDesc);
        };
        
        var manageGroup =function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var sendNotification = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('views/sendNotification.html');
        };
        
        var saveUpdatedGroupVal = function(){
            console.log(selectedGroupId);
         var group_status = 'A';
         var org_id=1; 
         var group_name = $("#editGroupName").val();     
         var group_description = $("#editGroupDesc").val();
            
         var jsonDataSaveGroup = {"org_id":org_id ,"group_name":group_name,"group_description":group_description, "group_status":group_status}
                      console.log(selectedGroupId);
            
         var dataSourceaddGroup = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/saveGroup/"+selectedGroupId,
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataSaveGroup
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
	            
           dataSourceaddGroup.fetch(function() {
              var loginDataView = dataSourceaddGroup.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='Success'){                                
									app.showAlert("Group Updated Successfully","Notification");
				        	        app.mobileApp.navigate('views/groupListPage.html');
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });
        };
        
        var addMemberToGroup = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#addMemberToGroup');
                       
        var addUserModel ={
            id: 'Id',
            fields: {
                mobile: {
                    field: 'mobile',
                    defaultValue: ''
                },
                first_name: {
                    field: 'first_name',
                    defaultValue: ''
                },
                email: {
                    field: 'email',
                    defaultValue:''
                },
                last_name: {
                    field: 'last_name',
                    defaultValue:''
                }
             }
          };
            
        var addMemberDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/organisation/getCustomer/"+orgId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
            
       	 schema: {
               model: addUserModel,
                  
                 data: function(data)
  	             {
                       console.log(data);
                       
                       var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                     var orgLength=groupValue[0].orgData.length;
                                     console.log(orgLength);
                            
                                     for(var j=0;j<orgLength;j++){
                                         
                                     var pos = $.inArray(groupValue[0].orgData[j].cust_id, custFromGroup);
                         	 			 console.log(pos);
									if (pos === -1) {
					                                    
                                     groupDataShow.push({
                                         customerID: groupValue[0].orgData[j].cust_id,
                                         first_name: groupValue[0].orgData[j].cust_fname,
                                         last_name: groupValue[0].orgData[j].cust_lname,
                                         email:groupValue[0].orgData[j].cust_email,
                                         mobile:groupValue[0].orgData[j].mobile
                                     });
                                    }
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
           	}
	        
    	    });         
         
            
            addMemberDataSource.fetch(function() {
                
 		   });
	
         
    	    $("#addMemberData").kendoListView({
        		dataSource: addMemberDataSource,
       		 template: kendo.template($("#Member-Add-template").html()),
                pullToRefresh: true, 
			});
            
            
            /*app.groupDetail.userData.filter({
							                	field: 'Group',
                								operator: 'neq',
                								value: GroupName   	    				        	
        	    								});
             kendo.bind($('#Member-Add-template'), MemberDataSource); 
            */
   
   
        };

        
        var groupNotificationSelected = function (e) {
            alert("hello");
			app.MenuPage=false;	
            //alert(e.data.uid);
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };
        

        
        var addMemberToGroupFunc = function(){
			var successFlag = false;
            
            var val = [];
		        $(':checkbox:checked').each(function(i){
          	  val[i] = $(this).val();
                    //console.log(val[i]);
        	});
            
            
            var jsonDataAddMember = {"customer":val ,"organisation":orgId,"group":selectedGroupId}
                    
            var dataSourceAddMember = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/addCustomertoGroup",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: jsonDataAddMember
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
	            
           dataSourceAddMember.fetch(function() {
              var loginDataView = dataSourceAddMember.data();
				  $.each(loginDataView, function(i, addGroupData) {
                      console.log(addGroupData.status[0].Msg);           
                               if(addGroupData.status[0].Msg==='Customer saved to group'){                                
									app.showAlert("Member Added Successfully","Notification");
				        	        app.mobileApp.navigate('#groupMemberShow');
                               }else{
                                  app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });        
                        
                                   
            /*$.each(val,function(i,dataValue){  
            console.log(dataValue);
                  
                var data = el.data('Users');
	
                data.update({ 'Group': 'Testing' }, // data
					    { 'Id': dataValue }, // filter
                  
                function(data){      
                      successFlag=true;
                },

                 function(error){
 					successFlag=false;
                 });
                
        	  });	
            
    	       if(successFlag){
        		  	app.showAlert("Member Added to Group","Notification");               
	           }else{
             		 app.showAlert("Error ","Notification");
               }*/
            
        };

        
        var removeMemberFromGroup = function(){           
            app.MenuPage=false;
            app.mobileApp.navigate('#removeMemberFromGroup');
            /*
            app.groupDetail.userData.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: GroupName   	    				        	
        	    								});
            kendo.bind($('#Member-Delete-template'), MemberDataSource); 
            */
        };
        
        
                 
        var removeMemberClick = function(){
	         var orgId = localStorage.getItem("UserOrgID"); 
                  console.log(orgId);    
             var customer = [];
		    
            $(':checkbox:checked').each(function(i){
          	  customer[i] = $(this).val();
        	});
            

            console.log(customer);            
			
            //var jsonDataDeleteMember = {"customer":customer ,"organisation":orgId,"group":selectedGroupId}
                        
            var dataSourceDeleteMember = new kendo.data.DataSource({
               transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/removeUser/"+customer+"/"+orgId+"/"+selectedGroupId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   //data: jsonDataDeleteMember
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
	            
           dataSourceDeleteMember.fetch(function() {
              var loginDataView = dataSourceDeleteMember.data();
				  $.each(loginDataView, function(i, deleteGroupData) {
                      console.log(deleteGroupData.status[0].Msg);           
                               if(deleteGroupData.status[0].Msg==='Success'){                                
									app.showAlert("Member Deleted Successfully","Notification");
				        	        app.mobileApp.navigate('#groupMemberShow');
                               }else{
                                  app.showAlert(deleteGroupData.status[0].Msg ,'Notification'); 
                               }
                               
                  });
  		 });    
        };
        
        
        
		        var userMessageTab = function(e){
        		    var tempArray= [];
            		app.MenuPage=false;	
            		var activity;
                    var uniqueLength;
                    var activitiesDataSource;
                    
                    notificationId=[],notificationMessage=[],notificationTitle=[];

                    console.log(e.data.uid);
            		activity = app.groupDetail.userData.getByUid(e.data.uid);
            		console.log(activity);
            		console.log(activity.Id);
   	  	  
                                app.mobileApp.navigate('views/adminMessageReply.html');
    	                        app.Activities.userData.filter({
							                	field: 'UserId',
                								operator: 'eq',
                								value: activity.Id
        	    								});
                    
                 
                    	app.Activities.userData.fetch(function(){
					 		var view = app.Activities.userData.view();
                      	   console.log(view);
					  	   dataLength = view.length;
		                                  
                          for(var i=0;i<dataLength;i++){
                     	      var pos = $.inArray(view[i].NotificationId, tempArray);
                         	  console.log(pos);
								if (pos === -1) {
								   tempArray.push(view[i].NotificationId);
								} 
 					           console.log("hello"+tempArray);
                            	uniqueLength=tempArray.length;
 		                       console.log(uniqueLength);   
                            }                 
          		  	});

                    
						 for(var i=0;i<uniqueLength;i++){     		
				                 app.Activities.activities.filter({
							 	field: 'Id',
                			 	operator: 'eq',
                    			 value: tempArray[i]
					     		});

                                 // for(var i=0;i<dataLength;i++){
                           	  // var pos = $.inArray(view[i].UserId, tempArray);
                             	 
                                // template = kendo.template($("#userDetailTemplate").html());
								//$("#userDetail-listview").append(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
								//kendo.bind($('#userDetailTemplate'), activitiesDataSource);
                           }                                                                                                              
       			 };

	           
    	       return {
        	   init: init,
           	show: show,
               manageGroup:manageGroup,    
               sendNotification:sendNotification,
               groupNotificationSelected:groupNotificationSelected,    
               removeMemberClick:removeMemberClick,
               addMemberToGroup:addMemberToGroup,
           	userMessageTab:userMessageTab,    
          	 addMemberToGroupFunc:addMemberToGroupFunc,
           	removeMemberFromGroup:removeMemberFromGroup,    
           	showGroupNotification:showGroupNotification,
           	showGroupMembers:showGroupMembers,
               showUpdateGroupView:showUpdateGroupView ,
               saveUpdatedGroupVal:saveUpdatedGroupVal    
           	};
            
           }());
    
    return groupDetailViewModel;
}());  