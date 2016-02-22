var app = app || {};

app.orgsubGroupListView = (function () {
    var organisationID;
    var group_ID;

    var page = 0;
    var totalListView = 0;
    var dataReceived = 0;

    var orgDetailViewModel = (function () {
        var init = function () {
        };

        var adminNotificationShow = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
            
            page = 0;
            dataReceived = 0;
            totalListView = 0; 
            app.showAppLoader();
            $("#admin-sub-noti-listview").hide();
            $("#showMoreGroupBtnOrg").hide();
            groupDataShow = [];

            organisationID = e.view.params.organisationID;
            group_ID = e.view.params.group_ID;
          
            //var db = app.getDb();
            //db.transaction(getDataOrgNoti, app.errorCB, showLiveData); 
            
            getLiveData();
        };
        
        /*var getDataOrgNoti = function(tx) {
        var query = "SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id='" + organisationID + "'and group_id=='" + group_ID + "'";
        app.selectQuery(tx, query, getOrgNotiDataSuccess);
        };*/    
                        
        var groupDataShow = [];
        
        /*function getOrgNotiDataSuccess(tx, results) {
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
        attachedImg :results.rows.item(i).attached
        });
                    
        lastNotificationPID = results.rows.item(i).pid;
        }    
        }else {
        lastNotificationPID = 0;

        groupDataShow.push({
        title: ' No Message ',
        message: 'No messages in this group',
        date:'0',  
        comment_allow : 'Y',
        org_id:'0', 
        pid:'',
        bagCount : '',
        attachedImg :'',  
        attached:''  
        });                   
        }                       
        };*/     
        
        var getLiveData = function() {
            var jsonDataLogin = {"group_id":group_ID,"page":page}                        
            var organisationALLListDataSource = new kendo.data.DataSource({                
                                                                              transport: {
                    read: {
                                                                                          url: app.serverUrl() + "notification/groupNotification",
                                                                                          type:"POST",
                                                                                          dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                          data: jsonDataLogin
                                                                                      }
                },
                 
                                                                              schema: {
                    data: function(data) {	
                        return [data]; 
                    }                                                            
                },
                 
                                                                              error: function (e) {
                                                                                  app.hideAppLoader();
                                                                                  $("#admin-sub-noti-listview").show();

                                                                                  if (!app.checkConnection()) {
                                                                                      if (!app.checkSimulator()) {
                                                                                          window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                                      }else {
                                                                                          app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                      } 
                                                                                  }else {
                                                                                      if (!app.checkSimulator()) {
                                                                                          window.plugins.toast.showShortBottom(app.ERROR_MESSAGE);
                                                                                      }else {
                                                                                          app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                      }
                                                                                      app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                  }
                                                                              }	        
                                                                          });         
          
            organisationALLListDataSource.fetch(function() {
                var data = this.data();                                       
                if (data[0]['status'][0].Msg ==='No Record') {     
                    groupDataShow = [];                                                                       
                    groupDataShow.push({
                                           title: ' No Message ',
                                           message: 'No messages in this group',
                                           date:'0',  
                                           comment_allow : 'Y',
                                           org_id:'0', 
                                           pid:'',
                                           bagCount : '',
                                           attachedImg :'',  
                                           attached:''  
                                       });                                                                     
                }else if (data[0]['status'][0].Msg==='Success') {
                    totalListView = data[0]['status'][0].Total;                                    
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
                                               upload_type:data[0].status[0].SentNotification.notiData[i].upload_type,
                                               attached :data[0].status[0].SentNotification.notiData[i].attached,
                                               attachedImg :data[0].status[0].SentNotification.notiData[i].attached
                                           });                                        
                    }
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin();                                 
                }else if (data[0]['status'][0].Msg==="You don't have access") {                    
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                                                  
                    app.mobileApp.navigate('#view-all-activities-GroupDetail');
                }            
                showLiveData();
            });            
        }
        
        var showLiveData = function() {
            var organisationALLListDataSource = new kendo.data.DataSource({
                                                                              data: groupDataShow
                                                                          });
            app.hideAppLoader();
            $("#admin-sub-noti-listview").show();
            
            organisationALLListDataSource.fetch(function() {
            });
            
            $("#admin-sub-noti-listview").kendoMobileListView({
                                                                  template: kendo.template($("#adminSubNotiTemplate").html()),    		
                                                                  dataSource: organisationALLListDataSource
                                                              });              
            
            $('#admin-sub-noti-listview').data('kendoMobileListView').refresh(); 

            if ((totalListView > 10) && (totalListView >= dataReceived + 10)) {
                $("#showMoreGroupBtnOrg").show();
            }else {
                $("#showMoreGroupBtnOrg").hide();
            }
        };
        
        var groupNotificationSelected = function (e) {
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };
        
        var showMoreButtonPress = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else { 
                page++;
                dataReceived = dataReceived + 10;
                getLiveData();            
            }
        }
	           
        return {
            init: init,
            adminNotificationShow: adminNotificationShow,
            showMoreButtonPress:showMoreButtonPress,
            getLiveData:getLiveData,
            groupNotificationSelected:groupNotificationSelected   
        };
    }());
    
    return orgDetailViewModel;
}());  