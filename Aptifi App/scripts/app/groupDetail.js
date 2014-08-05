var app = app || {};

app.groupDetail = (function () {

 var MemberDataSource;    
    var GroupName;
     var el = new Everlive('wKkFz2wbqFe4Gj0s');   
    
     var UsersModel = (function () {                 
     var UserModel = {
            id: 'Id',
            fields: {
                CreatedAt: {
                    field: 'CreatedAt',
                    defaultValue: new Date()
                },
                DisplayName: {
                    field: 'DisplayName',
                    defaultValue: ''
                },
                Email: {
                    field: 'Email',
                    defaultValue:''
                }
            },
           
	          CreatedAtFormatted: function () {
        	        return app.helper.formatDate(this.get('CreatedAt'));
    	        }
   	       };
        
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
	}());

   
    var groupDetailViewModel = (function () {

        
  			var init = function () {
             
                      
      		};
           
           
        var show = function (e) {
		    console.log("show function");
            activityUid = e.view.params.uid;
            console.log(activityUid);
            // Get current activity (based on item uid) from Activities model
            activity = app.Activities.groupData.getByUid(activityUid);
            console.log(activity.Name);
			GroupName = activity.Name;
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
            
            //if(GroupName==='All'){
    			             app.groupDetail.userData.filter({
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
           kendo.bind($('#groupMemberTemplate'), MemberDataSource);      
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
           	userData:UsersModel.userData,
           	addMemberToGroup:addMemberToGroup,
           	userMessageTab:userMessageTab,    
          	 addMemberToGroupFunc:addMemberToGroupFunc,
           	removeMemberFromGroup:removeMemberFromGroup,    
           	showGroupNotification:showGroupNotification,
           	showGroupMembers:showGroupMembers    
           	};
            
           }());
    
    return groupDetailViewModel;
}());  