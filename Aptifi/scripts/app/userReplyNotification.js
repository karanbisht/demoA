var app = app || {};

app.userReplyNotificationList = (function () {

    var userReplyNotificationListViewModel = (function () {
	var organisationID;		
        
  	var init = function () {
                                   
      };
         
      var show = function(e){
	    
        organisationID = e.view.params.organisationID;
          
         var userNotificationModel = {
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
             
             
          var userReplyNotification = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/listReplyNotification/"+ organisationID,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: userNotificationModel,                                
                 data: function(data)
  	             {
                       console.log(data);
               
                        var groupDataShow = [];
                                  $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                     
                                   $.each(groupValue, function(i, orgVal) {
                                     console.log();

                   	             if(orgVal.Msg ==='No List'){     
                	                   groupDataShow.push({
                                         title: ' No Notification ',
                                         message: 'No Notification from this Organisation',
                                         date:'0',  
                                         comment_allow : '0',
                                         org_id:'0', 
                                         pid:'',
    	                               });                   
                                        
	                                }else if(orgVal.Msg==='Success'){
                                       console.log(orgVal.NotificationList.length);  
                                        for(var i=0;i<orgVal.NotificationList.length;i++){
                                            groupDataShow.push({
												 message: orgVal.NotificationList[i].message,
        		                                 org_id: orgVal.NotificationList[i].org_id,
                                                 date:orgVal.NotificationList[i].send_date,
                                                 title:orgVal.NotificationList[i].title,
                                                 pid :orgVal.NotificationList[i].pid ,
                                                 comment_allow:orgVal.NotificationList[i].comment_allow 
                                            });
                                        }                                                    
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
         
            
            userReplyNotification.fetch(function() {
                
 		   });

             $("#userReply-notification-listview").kendoMobileListView({
  		    template: kendo.template($("#userReplyNotificationTemplate").html()),    		
     		 dataSource: userReplyNotification,
              pullToRefresh: true,
        		schema: {
           		model:  userNotificationModel
				}			 
		     });


		};
        
        var adminReplyNotiSelect = function(){
            alert('hello');
        };
        
            return {
        	   init: init,
           	show: show,
               adminReplyNotiSelect:adminReplyNotiSelect 
           	};
            
           }());
    
    return userReplyNotificationListViewModel;
}());