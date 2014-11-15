var app = app || {};

app.orgListView = (function () {
    
    var organisationID;
    var account_Id;
    var groupDataShow=[];
    
    var orgDetailViewModel = (function () {
        
  	var init = function () {
             
                      
      };

      var adminNotificationShow = function(e){

          $("#progressAdminNoti").show();

            organisationID = e.view.params.organisationID;
       	 account_Id = e.view.params.account_Id;

               var organisationALLListDataSource = new kendo.data.DataSource({                
               transport: {
               read: {
                   url: app.serverUrl()+"notification/getCustomerNotification/"+ organisationID +"/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
                 
        	  schema: {
                 data: function(data)
                   {	
                       console.log(data);
                       
                       var orgNotificationData; 
                           $.each(data, function(i, groupValue) {
                                  console.log(groupValue);

                               $.each(groupValue, function(i, orgVal) {

                   	             if(orgVal.Msg ==='No notification'){     
                                        showMoreDbData();

                                    }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        saveOrgNotification(orgNotificationData);                                                                                                                                                                      
                                    }
                                 });    
                            });       
                       
                    	return [data]; 
                   }                                                            
              },
                 
    	        error: function (e) {
                        e.preventDefault();
    	               //apps.hideLoading();
        	           console.log(e);
                                      //$("#progress1").hide();  

                                       if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                      }else{
                                      app.showAlert("Network problem . Please try again later","Notification");  
                                       }
                        showMoreDbData();

           	    }	        
     	      });         
            
               organisationALLListDataSource.read();
                                  
        };
        
        
        var orgNotiDataVal;         
       
       function saveOrgNotification(data) {
            orgNotiDataVal = data; 
            console.log(orgNotiDataVal);            
			var db = app.getDb();
			db.transaction(insertOrgNotiData, app.errorCB,showMoreDbData);
	   };
                        
      function insertOrgNotiData(tx){
          
        var query = "DELETE FROM ADMIN_ORG_NOTIFICATION where org_id="+organisationID;
        app.deleteQuery(tx, query);
          
        var dataLength = orgNotiDataVal.length;         
          
        for(var i=0;i<dataLength;i++){   
           
    	   var query = 'INSERT INTO ADMIN_ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type,group_id,customer_id) VALUES ("'
				+ orgNotiDataVal[i].org_id
				+ '","'
				+ orgNotiDataVal[i].pid
				+ '","'
				+ orgNotiDataVal[i].attached
           	 + '","'
				+ orgNotiDataVal[i].message
    	        + '","'
			    + orgNotiDataVal[i].title
                + '","'
				+ orgNotiDataVal[i].comment_allow
                + '","'
				+ orgNotiDataVal[i].send_date
                + '","'
				+ orgNotiDataVal[i].type
                + '","'
				+ orgNotiDataVal[i].group_id
                + '","'
				+ orgNotiDataVal[i].customer_id
				+ '")';              
                app.insertQuery(tx, query);
        }
          
      }
        
            var showMoreDbData = function(){
                var db = app.getDb();
   	  	   db.transaction(getDataOrgNoti, app.errorCB, showLiveData);
            }
        
        
            var getDataOrgNoti = function(tx){
                    //var query = 'SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id='+organisationID ;
                    var query = "SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id="+organisationID+" ORDER BY pid DESC" ;
		        	app.selectQuery(tx, query, getOrgNotiDataSuccess);
            };   
        
       
        
        var previousDate='';

        
        function getOrgNotiDataSuccess(tx, results) {
            groupDataShow=[];
            
			var count = results.rows.length;
                DBGETDATAVALUE = count;           
                         

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
                                         previousDate:'0',
                                         time:'',
                                         attached:''  
    	                               });                   

            }                       
         };       
        
        
        var showLiveData = function(){                        
             var organisationALLListDataSource = new kendo.data.DataSource({
                  data: groupDataShow
              });
            
                       $(".km-scroll-container").css("-webkit-transform", "");

             
             organisationALLListDataSource.fetch(function() {
                
 		    });
                       
              $("#admin-noti-listview").kendoMobileListView({
  		    template: kendo.template($("#adminNotiTemplate").html()),    		
     		 dataSource: organisationALLListDataSource,
              pullToRefresh: true
 		     });             
             $('#admin-noti-listview').data('kendoMobileListView').refresh();                          
            
            $("#progressAdminNoti").hide();
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