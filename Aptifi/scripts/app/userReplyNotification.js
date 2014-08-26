var app = app || {};

app.userReplyNotificationList = (function () {

    var userReplyNotificationListViewModel = (function () {
	var custId;		
        
  	var init = function () {
             
                      
      };
         
      var show = function(e){
	    
         custId = e.view.params.cust_id;
          
            var userNotificationModel = {
            id: 'Id',
            fields: {
                notification_id: {
                    field: 'notification_id',
                    defaultValue: ''
                },
                add_date: {
                    field: 'add_date',
                    defaultValue:''
                }, 
                title: {
                    field: 'title',
                    defaultValue: ''
                },
                message: {
                    field: 'message',
                    defaultValue: ''
                }                
            },
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('add_date'));
            }
          };
            
            
            var userNotificationDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getNotificationList/"+custId,
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
                                   console.log(groupValue) 
                                     var returnMsg =groupValue[0].Msg;
                                     console.log(returnMsg);
                                     if(returnMsg==='Success'){

                                     var userReplyLength=groupValue[0].notificationList.length;
                                    
                                     //console.log(userReplyLength);
                            		 var tempArray = [];
                                         
                                     for(var j=0;j<userReplyLength;j++){
                                         //console.log(groupValue[0].notificationList[j].notification_id);
                                         
                                      if(groupValue[0].notificationList[j].notification_id !== 0 && groupValue[0].notificationList[j].notification_id !== '0'){  
                                         var pos = $.inArray(groupValue[0].notificationList[j].notification_id , tempArray);
                                          
                                         if (pos === -1) {
                                         tempArray.push(groupValue[0].notificationList[j].notification_id);   
                                         groupDataShow.push({                                         
                                         notification_id: groupValue[0].notificationList[j].notification_id,
                                         add_date:groupValue[0].notificationList[j].add_date,
                                         title:groupValue[0].notificationList[j].title,
                                         message:groupValue[0].notificationList[j].message                                            
                                     	});
                                         
                                      }
                                     }

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
                     
            userNotificationDataSource.fetch(function() {
                
 		   });

            $("#userReply-notification-listview").kendoMobileListView({
  		    template: kendo.template($("#userReplyNotificationTemplate").html()),    		
     		 dataSource: userNotificationDataSource,
               click: function(e){
                  	//console.log(e.dataItem);
                  	//console.log(e.dataItem.notification_id);
   				  app.mobileApp.navigate('views/userNotificationComment.html?uid=' + e.dataItem.notification_id+'&custId='+custId+'&message='+e.dataItem.message+'&title='+e.dataItem.title);                 
               },  
        		schema: {
           		model:  userNotificationModel
				}			 
		     });
		};
        
        
            return {
        	   init: init,
           	show: show,
               userNotificationDataSource:show.userNotificationDataSource
           	};
            
           }());
    
    return userReplyNotificationListViewModel;
}());