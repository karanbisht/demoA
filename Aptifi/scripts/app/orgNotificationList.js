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

            /*var organisationAllNotificationModel = {
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
                }                  
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
          
          */
          
             var db = app.getDb();
	  	   db.transaction(getDataOrgNoti, app.errorCB, showLiveData); 
                        
        };
        
        
        
                var getDataOrgNoti = function(tx){
                    //var query = 'SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id='+organisationID ;
                    var query = "SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id="+organisationID+" ORDER BY pid DESC" ;
		        	app.selectQuery(tx, query, getOrgNotiDataSuccess);
                };    
                        
            
        function getOrgNotiDataSuccess(tx, results) {
            groupDataShow=[];
            
			var count = results.rows.length;
                DBGETDATAVALUE = count;           
            //alert(count);
                        var previousDate='';

			if (count !== 0) {
                groupDataShow=[];
            	for(var i =0 ; i<count ; i++){ 
                    
                    var dateString = results.rows.item(i).send_date;
                       var split = dateString .split(' ');
                           console.log(split[0]+" || "+split[1]);
                       var notiDate= app.formatDate(split[0]);
                           console.log(notiDate);
                    
                       var splitTime =split[1].split(':');
                            console.log(splitTime);
                       var timeVal = splitTime[0]+':'+splitTime[1];
                            console.log(timeVal);

                       var notiTime=app.timeConvert(timeVal);
                       console.log(notiTime);

 
                      groupDataShow.push({
												 message: results.rows.item(i).message,
        		                                 org_id: results.rows.item(i).org_id,
                                                 date:notiDate,
                                                 time:notiTime,
                                                 title:results.rows.item(i).title,
                                                 pid :results.rows.item(i).pid ,
                                                 comment_allow:results.rows.item(i).comment_allow ,
		                                         bagCount : 'C',
                                                 attached :results.rows.item(i).attached,
                                                 previousDate:previousDate, 
                                                 attachedImg :'http://54.85.208.215/assets/attachment/'+results.rows.item(i).attached
                       });
                    
                  previousDate= notiDate;  
                  lastNotificationPID=results.rows.item(i).pid;
        	    }    
                 console.log(lastNotificationPID);
            }else{
                    lastNotificationPID=0;
                           groupDataShow.push({
                                         title: ' No Notification ',
                                         message: 'No Notification from this Organisation',
                                         date:'0',  
                                         comment_allow : 'Y',
                                         org_id:'0', 
                                         pid:'',
                                         bagCount : '',
                                         attachedImg :'',  
                                         attached:''  
    	                               });                   

            }                       
         };       
        
        
        var showLiveData = function(){                        
             var organisationALLListDataSource = new kendo.data.DataSource({
                  data: groupDataShow
              });
             
             organisationALLListDataSource.fetch(function() {
                
 		    });
                       
              $("#admin-noti-listview").kendoMobileListView({
  		    template: kendo.template($("#adminNotiTemplate").html()),    		
     		 dataSource: organisationALLListDataSource,
              pullToRefresh: true
 		     });             
             $('#admin-noti-listview').data('kendoMobileListView').refresh();                          
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