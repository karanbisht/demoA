var app = app || {};

app.orgListView = (function () {
    var organisationID;
    var account_Id;
    var groupDataShow = [];
    
    var orgDetailViewModel = (function () {
        var init = function () {

        };

        var adminNotificationShow = function(e) {
            $("#progressAdminNoti").show();
            $("#admin-noti-listview").hide();
                           
            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");


            var organisationALLListDataSource = new kendo.data.DataSource({                
                                                                              transport: {
                    read: {
                                                                                          url: app.serverUrl() + "notification/getCustomerNotification/" + organisationID + "/" + account_Id,
                                                                                          type:"POST",
                                                                                          dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                      }
                },
                 
                                                                              schema: {
                    data: function(data) {	
                        console.log(data);                                            
                        return [data]; 
                    }                                                            
                },
                 
                                                                              error: function (e) {
                                                                                  console.log(JSON.stringify(e));                                                                                  
                                                                                  $("#progressAdminNoti").hide();  

                                                                                  if (!app.checkSimulator()) {
                                                                                      window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                                  }else {
                                                                                      app.showAlert("Network problem . Please try again later", "Notification");  
                                                                                  }
                                                                                  showMoreDbData();
                                                                              }	        
                                                                          });         
            
          
          
            organisationALLListDataSource.fetch(function() {
                            
                var data = this.data();                
                var orgNotificationData; 
                       

                           
                                if (data[0]['status'][0].Msg ==='No notification') {     
                                    showMoreDbData();
                                }else if (data[0]['status'][0].Msg==='Success') {
                                    orgNotificationData = data[0]['status'][0].notificationList;
                                    saveOrgNotification(orgNotificationData);                                                                                                                                                                      
                                }
                              

            
            });

        };
        
        var orgNotiDataVal;         
       
        function saveOrgNotification(data) {
            orgNotiDataVal = data; 
            var db = app.getDb();
            db.transaction(insertOrgNotiData, app.errorCB, showMoreDbData);
        };
                        
        function insertOrgNotiData(tx) {
            var query = "DELETE FROM ADMIN_ORG_NOTIFICATION where org_id=" + organisationID;
            app.deleteQuery(tx, query);
          
            var dataLength = orgNotiDataVal.length;         
          
            for (var i = 0;i < dataLength;i++) {   
                var query = 'INSERT INTO ADMIN_ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type,group_id,customer_id,upload_type) VALUES ("'
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
                            + '","'
                            + orgNotiDataVal[i].upload_type
                            + '")';              
                app.insertQuery(tx, query);
            }
        }
        
        var showMoreDbData = function() {
            var db = app.getDb();
            db.transaction(getDataOrgNoti, app.errorCB, showLiveData);
        }
        
        var getDataOrgNoti = function(tx) {
            //var query = 'SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id='+organisationID ;
            var query = "SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id=" + organisationID + " ORDER BY pid DESC" ;
            app.selectQuery(tx, query, getOrgNotiDataSuccess);
        };   
        
        var previousDate = '';
        
        function getOrgNotiDataSuccess(tx, results) {
            groupDataShow = [];
            
            var count = results.rows.length;
            DBGETDATAVALUE = count;           

            if (count !== 0) {
                groupDataShow = [];
                for (var i = 0 ; i < count ; i++) { 
                    var dateString = results.rows.item(i).send_date;
                    var notiDate = app.timeConverter(dateString);

 
                    groupDataShow.push({
                                           message: results.rows.item(i).message,
                                           org_id: results.rows.item(i).org_id,
                                           date:notiDate,
                                           title:results.rows.item(i).title,
                                           pid :results.rows.item(i).pid ,
                                           comment_allow:results.rows.item(i).comment_allow ,
                                           bagCount : 'C',
                                           attached :results.rows.item(i).attached,
                                           upload_type:results.rows.item(i).upload_type,
                                           previousDate:previousDate, 
                                           attachedImg :results.rows.item(i).attached
                                       });
                    
                    previousDate = notiDate;  
                    lastNotificationPID = results.rows.item(i).pid;
                }    
                //console.log(lastNotificationPID);
            }else {
                lastNotificationPID = 0;
                groupDataShow.push({
                                       title: ' No Message ',
                                       message: 'No Message from this Organization',
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
        
        var showLiveData = function() {                        
            var organisationALLListDataSource = new kendo.data.DataSource({
                                                                              data: groupDataShow
                                                                          });
            
            $(".km-scroll-container").css("-webkit-transform", "");
             
            organisationALLListDataSource.fetch(function() {
            });
                       
            $("#admin-noti-listview").kendoMobileListView({
                                                              template: kendo.template($("#adminNotiTemplate").html()),    		
                                                              dataSource: organisationALLListDataSource
                                                          });             
            $('#admin-noti-listview').data('kendoMobileListView').refresh();                          
            
            $("#progressAdminNoti").hide();
            $("#admin-noti-listview").show();
        };

        var groupNotificationSelected = function (e) {
            app.MenuPage = false;	
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