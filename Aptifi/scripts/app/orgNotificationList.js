var app = app || {};

app.orgListView = (function () {
    
     'use strict';
    
    var organisationID;
    var account_Id;
    var groupDataShow = [];
    

    var page=0;
    var totalListView=0;
    var dataReceived=0;

    
    var orgDetailViewModel = (function () {
        var init = function () {

        };

        var adminNotificationShow = function(e) {

            $("#showMoreEventBtnOrg").hide();                           

            $("#progressAdminNoti").show();
            $("#admin-noti-listview").hide();
            
            page=0;
            dataReceived=0;
            totalListView=0;
            
            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            
            groupDataShow=[];
            
            //console.log(organisationID+'||'+account_Id);
            
            getLiveData();

        };
        
        
        var getLiveData = function(){
                                 
            var jsonDataLogin = {"page":page}                        
            var organisationALLListDataSource = new kendo.data.DataSource({                
                                                                              transport: {
                                                                                      read: {
                                                                                          url: app.serverUrl() + "notification/sent/" + organisationID,
                                                                                          type:"POST",
                                                                                          dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                          data: jsonDataLogin
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
                                                                                      window.plugins.toast.showShortBottom(app.INTERNET_ERROR);   
                                                                                  }else {
                                                                                      app.showAlert(app.INTERNET_ERROR, "Notification");  
                                                                                  }
                                                                                  showMoreDbData();
                                                                              }	        
                                                                          });         
            
          
          
            organisationALLListDataSource.fetch(function() {
                            
                var data = this.data();                
                       
                                if (data[0]['status'][0].Msg ==='No Record') {     
                                    groupDataShow=[];                                                                       
                                    groupDataShow.push({
                                       title: ' No Message ',
                                       message: 'No Message from this Organization',
                                       date:'0',  
                                       comment_allow : 'Y',
                                       org_id:'0', 
                                       pid:'',
                                       bagCount : '',
                                       attachedImg :'',
                                       //previousDate:'0',
                                       time:'',
                                       attached:''  
                                   });                   
                                    
                                    //showMoreDbData();
                                }else if (data[0]['status'][0].Msg==='Success') {
                                    totalListView = data[0]['status'][0].Total;
                                    
                                    //orgNotificationData = data[0]['status'][0].SentNotification.notiData;
                                    var orgDataLength = data[0]['status'][0].SentNotification.notiData.length;
                                    

                                    for (var i = 0 ; i < orgDataLength ;i++) {
                                        

                                        var notiDate = app.timeConverter(data[0].status[0].SentNotification.notiData[i].send_date);


                                        groupDataShow.push({
                                           message: data[0].status[0].SentNotification.notiData[i].message,
                                           org_id: data[0].status[0].SentNotification.notiData[i].org_id,
                                           date:notiDate,
                                           title:data[0].status[0].SentNotification.notiData[i].title,
                                           pid :data[0].status[0].SentNotification.notiData[i].pid ,
                                           comment_allow:data[0].status[0].SentNotification.notiData[i].comment_allow ,
                                           bagCount : 'C',
                                           attached :data[0].status[0].SentNotification.notiData[i].attached,
                                           upload_type:data[0].status[0].SentNotification.notiData[i].upload_type,
                                           //previousDate:previousDate, 
                                           attachedImg :data[0].status[0].SentNotification.notiData[i].attached
                                       });                                        
                                    }
                                    //saveOrgNotification(orgNotificationData);                                                                                                                                                                      
                                }else if(data[0]['status'][0].Msg==="Session Expired"){
                                        app.showAlert(app.SESSION_EXPIRE , 'Notification');
                                        app.LogoutFromAdmin();                                 
                                }else if (data[0]['status'][0].Msg==="You don't have access") {                    
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }                                                  
                                    app.mobileApp.navigate('#view-all-activities-GroupDetail');
          
                                }            
                showLiveData();
            });            
        }
       
        
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
            

            if((totalListView > 10) && (totalListView >=dataReceived+10)){
                $("#showMoreEventBtnOrg").show();
            }else{
                $("#showMoreEventBtnOrg").hide();
            }

        };

        var groupNotificationSelected = function (e) {
            app.MenuPage = false;	
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };
        
        
        var showMoreButtonPress = function(){
            page++;
            dataReceived=dataReceived+10;
            getLiveData();            
        }
	           
        return {
            init: init,
            adminNotificationShow: adminNotificationShow,
            getLiveData:getLiveData,
            showMoreButtonPress:showMoreButtonPress,
            groupNotificationSelected:groupNotificationSelected   
        };
    }());
    
    return orgDetailViewModel;
}());  