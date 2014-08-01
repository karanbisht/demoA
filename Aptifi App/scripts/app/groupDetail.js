var app = app || {};

app.groupDetail = (function () {

 var MemberDataSource;    
     var UsersModel = (function () {                 
       var UserModel = {
            id: 'Id',
            fields: {
                ModifiedAt: {
                    field: 'ModifiedAt',
                    defaultValue: new Date()
                },
                DisplayName: {
                    field: 'DisplayName',
                    defaultValue: ''
                }
            },
           
	          CreatedAtFormatted: function () {
        	        return app.helper.formatDate(this.get('ModifiedAt'));
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
                    $('#no-notification-span').hide();
                } else {
                    $('#no-notification-span').show();
                }
            },
             sort: { field: 'ModifiedAt', dir: 'desc' }    
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
    			             app.Activities.activities.filter({
							                	
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
           
           return {
           init: init,
           show: show,
           userData:UsersModel.userData,
           showGroupNotification:showGroupNotification,
           showGroupMembers:showGroupMembers    
           };
        
    
           }());
    
    return groupDetailViewModel;
}());  