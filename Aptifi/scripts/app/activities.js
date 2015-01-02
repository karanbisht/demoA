var app = app || {};

app.Activities = (function () {
  
 
    var organisationID;  
    var account_Id;  
    var bagCount;
    var groupDataShow = [];
    var lastNotificationPID;
    var orgName;
    var orgId = localStorage.getItem("UserOrgID");                              

    var activitiesViewModel = (function () {
        var init = function() {
        }   
        
        var show = function(e) {             
            StartDbCount = 0;
            EndDbCount = 10;
            totalOrgNotification = 0;
            groupDataShow = [];
            $("#showMoreButton").hide();

            $("#progressNotification").show();
            $("#activities-listview").hide();  
            $(".km-scroll-container").css("-webkit-transform", "");  
            groupDataShow = [];
            //$('#activities-listview').data('kendoMobileListView').refresh();
        
            app.MenuPage = false;
            app.userPosition = false;                                      

            
            organisationID = localStorage.getItem("user_SelectOrgID");
            account_Id = localStorage.getItem("user_ACCOUNT_ID");
            bagCount = localStorage.getItem("user_orgBagCount");
            orgName = localStorage.getItem("user_selectedOrgName");
                         

            var OrgDisplayName;
            if (orgName.length > 25) {
                    OrgDisplayName = orgName.substr(0, 25) + '..';
            }else {
                    OrgDisplayName = orgName;
                
            }

            $("#navBarHeader").html(OrgDisplayName);

            var db = app.getDb();
            db.transaction(getLastOrgNoti, app.errorCB, app.successCB);       
        };
                    
        var getLastOrgNoti = function(tx) {
            var query = "SELECT MAX(pid) as pid FROM ORG_NOTIFICATION where org_id=" + organisationID;
            app.selectQuery(tx, query, getOrgLastNotiDataSuccess);
        };    
                    
        function getOrgLastNotiDataSuccess(tx, results) {
            var count = results.rows.length;
            //alert(count);
            var lastNotificationPID = results.rows.item(0).pid;
            //alert(lastNotificationPID);
            if (lastNotificationPID===null) {
                lastNotificationPID = 0;
            }
            if (count !== 0) {
                var organisationALLNewListDataSource = new kendo.data.DataSource({
                                                                                     transport: {
                        read: {
                                                                                                 url: app.serverUrl() + "notification/getCustomerNotification/" + organisationID + "/" + account_Id + "/" + lastNotificationPID,
                                                                                                 type:"POST",
                                                                                                 dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                             }
                    },
                                                                                     schema: {
                        data: function(data) {
                            console.log(data);
               
                            var orgNotificationData; 
                            $.each(data, function(i, groupValue) {
                                console.log(groupValue);
                                     
                                $.each(groupValue, function(i, orgVal) {
                                    console.log();

                                    if (orgVal.Msg ==='No notification') {     
                                        var db = app.getDb();
                                        db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
                                    }else if (orgVal.Msg==='Success') {
                                        console.log(orgVal.notificationList.length);  
                                        orgNotificationData = orgVal.notificationList;
                                        saveOrgNotification(orgNotificationData);                                                                                     
                                    }
                                });    
                            });
                       
                            console.log(groupDataShow);
                            return groupDataShow;
                        }                       
                    },
                                                                                     error: function (e) {
                                                                                         console.log(e);
                    
                                                                                         if (!app.checkSimulator()) {
                                                                                             window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                                         }else {
                                                                                             app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                                         }
                                                                                         
                                                                                         app.analyticsService.viewModel.trackException(e,'Api Call , Unable to get response from API fetching Organization Notification List.');
                    
                                                                                         var db = app.getDb();
                                                                                         db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
                                                                                     }	        
                                                                                 });        
                organisationALLNewListDataSource.fetch();
            }else {
                var db = app.getDb();
                db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
            } 
        }                      
        
        var orgNotiDataVal;
        
        function saveOrgNotification(data) {
            orgNotiDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiData, app.errorCB, showDBNotification);
        };
            
        function insertOrgNotiData(tx) {
            //var query = "DELETE FROM ORG_NOTIFICATION";
            //app.deleteQuery(tx, query);
            var dataLength = orgNotiDataVal.length;
         
            //alert('LiveDataVal'+dataLength);

            var orgData;        
            var orgLastMsg;
 
            for (var i = 0;i < dataLength;i++) {    
                orgData = orgNotiDataVal[i].org_id;
                orgLastMsg = orgNotiDataVal[i].message;
          
                var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type) VALUES ("'
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
                            + '")';              
                app.insertQuery(tx, query);
            }   

            updateJoinOrgTable(orgData, orgLastMsg, dataLength);
        }
                         
        var GlobalDataOrgId;
        var GlobalDataLastMsg;
        var GlobalDataCount;
        
        var updateJoinOrgTable = function(orgData, orgLastMsg, dataLength) {
            GlobalDataOrgId = orgData;
            GlobalDataLastMsg = orgLastMsg;
            GlobalDataCount = dataLength;
            var db = app.getDb();
            db.transaction(updateLoginStatus, app.errorCB, app.successDB);
        }
        
        function updateLoginStatus(tx) {
            //alert(GlobalDataOrgId+"||"+GlobalDataLastMsg+"||"+GlobalDataCount);     
            var query = "UPDATE JOINED_ORG SET count='" + GlobalDataCount + "',bagCount='" + GlobalDataCount + "', lastNoti='" + GlobalDataLastMsg + "' where org_id='" + GlobalDataOrgId + "' and role='C'";
            app.updateQuery(tx, query);
        }
        
        var totalOrgNotification = 0;        
        var StartDbCount = 0;
        var EndDbCount = 10;
        
        function showDBNotification() {
            var db = app.getDb();
            db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
        }
            
        var getDataOrgNoti = function(tx) {
            //alert(StartDbCount+"||"+EndDbCount);
            var query = "SELECT * FROM ORG_NOTIFICATION where org_id='" + organisationID + "' ORDER BY pid DESC limit'" + StartDbCount + "','" + EndDbCount + "'" ;
            app.selectQuery(tx, query, getOrgNotiDataSuccess);
            
            var query = "SELECT count(pid) as TOTAL_DATA from ORG_NOTIFICATION where org_id=" + organisationID;
            app.selectQuery(tx, query, getOrgTotalNotiData);
        };    
        
        function getOrgTotalNotiData(tx, results) {
            totalOrgNotification = results.rows.item(0).TOTAL_DATA;            
            if (StartDbCount + 10 >= totalOrgNotification) {
                StartDbCount = totalOrgNotification;
                $("#showMoreButton").hide();
            }else {
                $("#showMoreButton").show(); 
            }
        }
            
        function getOrgNotiDataSuccess(tx, results) {
            //groupDataShow=[];
            var count = results.rows.length;
             
            var previousDate = '';
            //alert(count);
            if (count !== 0) {
                //groupDataShow=[];
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
                                           previousDate:previousDate,
                                           attachedImg :results.rows.item(i).attached
                                       });
                    
                    previousDate = notiDate;
                    
                    lastNotificationPID = results.rows.item(i).pid;
                }    
                console.log(lastNotificationPID);
            }else {
                lastNotificationPID = 0;
                $("#showMoreButton").hide();                    

                groupDataShow.push({
                                       title: ' No Message ',
                                       message: 'No Message from this Organization',
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
        
        var showMoreButtonPress = function() {
            StartDbCount = StartDbCount + 10;
            EndDbCount = 10;
                       
            showDBNotification();
        }

        var afterShow = function() {
            var db = app.getDb();
            db.transaction(insertBagCount, app.errorCB, app.successCB);  
        };    
            
        var insertBagCount = function(tx) {             
            var query = "UPDATE JOINED_ORG SET bagCount='" + bagCount + "' WHERE org_id='" + organisationID + "'" ;
            app.updateQuery(tx, query);
        };   
            
        var showLiveData = function() {
            var organisationALLListDataSource = new kendo.data.DataSource({
                                                                              data: groupDataShow
                                                                          });
             
            organisationALLListDataSource.fetch(function() {
            });

            $("#activities-listview").kendoMobileListView({
                                                              template: kendo.template($("#activityTemplate").html()),    		
                                                              dataSource: organisationALLListDataSource
                                                              //pullToRefresh: true,   

                                                          });
            
            $('#activities-listview').data('kendoMobileListView').refresh();          
            //setTimeout(function(){
            $("#progressNotification").hide();
            $("#activities-listview").show();  
                 
            //app.mobileApp.pane.loader.hide();
            //},10); 
             
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }
        };
        
      
            
        var activitySelected = function (e) {
            console.log(e.data.uid);
            console.log(e.data);
            var message = e.data.message;
            var title = e.data.title;
            var org_id = e.data.org_id;
            console.log(org_id);
            var notiId = e.data.pid;
            var comment_allow = e.data.comment_allow;//: "1"
            var attached = e.data.attached;
            var type = e.data.type;
        
            app.MenuPage = false;	
    
            //alert(message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&account_Id='+account_Id+'&comment_allow='+comment_allow+'&attached='+attached);
            
            var messageVal = app.urlEncode(message); 
            var titleVal = app.urlEncode(title);
            
            //alert(messageVal);
            app.analyticsService.viewModel.trackFeature("User navigate to Customer Notification Comment List");            
            app.mobileApp.navigate('views/activityView.html?message=' + messageVal + '&title=' + titleVal + '&org_id=' + org_id + '&notiId=' + notiId + '&account_Id=' + account_Id + '&comment_allow=' + comment_allow + '&attached=' + attached + '&type=' + type + '&date=' + e.data.date);
        };
      
               
        var goToAppFirstView =  function(){

            app.slide('right', 'green' ,'3' ,'#organisationNotiList');

        }

        return {
            //activities: activitiesModel.activities,
            //groupData:GroupsModel.groupData,
            //userData:UsersModel.userData,
            activitySelected: activitySelected,
            init:init,
            goToAppFirstView:goToAppFirstView,
            show:show,
            afterShow:afterShow,
            showMoreButtonPress:showMoreButtonPress,
        };
    }());

    return activitiesViewModel;
}());