var app = app || {};

app.orgListView = (function () {
    
    var organisationID;
    var account_Id;
       
    var orgDetailViewModel = (function () {

        
  	var init = function () {
             
                      
      };

      var adminNotificationShow = function(e){
            organisationID = e.view.params.organisationID;
       	 account_Id = e.view.params.account_Id;

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
             
             
          var organisationALLListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getCustomerNotification/"+ organisationID+"/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: organisationAllNotificationModel,                                
                 data: function(data)
  	             {
                       console.log(data);
               
                        var groupDataShow = [];
                                  $.each(data, function(i, groupValue) {
                                  console.log(groupValue);
                                     
                                   $.each(groupValue, function(i, orgVal) {
                                     console.log();

                   	             if(orgVal.Msg ==='No notification'){     
                	                   groupDataShow.push({
                                         title: ' No Notification ',
                                         message: 'No Notification from this Organisation',
                                         date:'0',  
                                         commentAllow : 'Y',
                                         pid:0        
    	                               });                   
                                        
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.notificationList.length);  
                                        for(var i=0;i<orgVal.notificationList.length;i++){
                                            groupDataShow.push({
												 message: orgVal.notificationList[i].message,
        		                                 org_id: orgVal.notificationList[i].org_id,
                                                 pid:orgVal.notificationList[i].pid,
                                                 date:orgVal.notificationList[i].send_date,
                                                 title:orgVal.notificationList[i].title
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
         
            
            //organisationALLListDataSource.fetch(function() {
                
 		   //});

             $("#admin-noti-listview").kendoMobileListView({
  		    template: kendo.template($("#adminNotiTemplate").html()),    		
     		 dataSource: organisationALLListDataSource,
              pullToRefresh: true,
        		schema: {
           		model:  organisationAllNotificationModel
				}			 
		     });              
        };
        
         var groupNotificationSelected = function (e) {
            alert("hello");
			app.MenuPage=false;	
            //alert(e.data.uid);
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };

	           
    	       return {
        	   init: init,
           	adminNotificationShow: adminNotificationShow,
               groupNotificationSelected:groupNotificationSelected   
           	};
            
           }());
    
    return orgDetailViewModel;
}());  