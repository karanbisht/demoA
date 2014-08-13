var app = app || {};

app.groupDetail = (function () {


    var GroupName;
    var selectedGroupId;
    var selectedGroupDesc;
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
        
              var activitiesDataSource;
              console.log(GroupName);
              app.MenuPage=false;
              app.mobileApp.navigate('#groupNotificationShow');
   	  
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   if(GroupName==='All'){
    			             app.Activities.activities.filter({
							                	
        	    								});
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: GroupName
        	    								});
                           }

                      kendo.bind($('#groupDetailTemplate'), activitiesDataSource);     
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
	
         
            $("#groupMember-listview").kendoListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#groupMemberTemplate").html()),
        		autoBind: true
			 });
            
           
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
            app.groupDetail.userData.filter({
							                	field: 'Group',
                								operator: 'neq',
                								value: GroupName   	    				        	
        	    								});
             kendo.bind($('#Member-Add-template'), MemberDataSource); 
            
   
         };

        

        var addMemberToGroupFunc = function(){
			var successFlag = false;
            var val = [];
		        $(':checkbox:checked').each(function(i){
          	  val[i] = $(this).val();
                    //console.log(val[i]);
        	});
            
                                   
            $.each(val,function(i,dataValue){  
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
               }
        };

        
        var removeMemberFromGroup = function(){           
            app.MenuPage=false;
            app.mobileApp.navigate('#removeMemberFromGroup');
            app.groupDetail.userData.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: GroupName   	    				        	
        	    								});
            kendo.bind($('#Member-Delete-template'), MemberDataSource); 
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