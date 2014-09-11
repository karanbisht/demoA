var app = app || {};

app.orgsubGroupListView = (function () {
    
    var organisationID;
    var group_ID;
    var orgDetailViewModel = (function () {

        
  	var init = function () {
             
                      
      };

      var adminNotificationShow = function(e){
            organisationID = e.view.params.organisationID;
       	 group_ID = e.view.params.group_ID;

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
                   url: " http://54.85.208.215/webservice/group/groupNotification/"+ organisationID+"/"+group_ID,
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

                   	             if(orgVal.Msg ==='No notification in this group'){     
                	                   groupDataShow.push({
                                         message: 'No Notification for this Group ',
                                         org_id:0,
                                         pid:0,  
                                         date:0,
                                         title: ' No Notification '                                                                                         
    	                               });                   
                                        
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.allNotification.length);  
                        
                                        for(var i=0;i<orgVal.allNotification.length;i++){
                                            groupDataShow.push({
												 message: orgVal.allNotification[i].message,
        		                                 org_id: orgVal.allNotification[i].org_id,
                                                 pid:orgVal.allNotification[i].pid,
                                                 date:orgVal.allNotification[i].send_date,
                                                 title:orgVal.allNotification[i].title
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
         
            
            //organisationALLListDataSource.fetch(function() {
                
 		   //});

             $("#admin-sub-noti-listview").kendoMobileListView({
  		    template: kendo.template($("#adminSubNotiTemplate").html()),    		
     		 dataSource: organisationALLListDataSource,
              pullToRefresh: true,
        		schema: {
           		model:  organisationAllNotificationModel
				}			 
		     });              
        };
        
        
        
         var groupNotificationSelected = function (e) {
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