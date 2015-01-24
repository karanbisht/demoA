var app = app || {};

app.orgsubGroupListView = (function () {
    var organisationID;
    var group_ID;
    var orgDetailViewModel = (function () {
        var init = function () {
        };

        var adminNotificationShow = function(e) {
            organisationID = e.view.params.organisationID;
            group_ID = e.view.params.group_ID;
          
            var db = app.getDb();
            db.transaction(getDataOrgNoti, app.errorCB, showLiveData); 
        };
        
        var getDataOrgNoti = function(tx) {
            var query = "SELECT * FROM ADMIN_ORG_NOTIFICATION where org_id='" + organisationID + "'and group_id=='" + group_ID + "'";
            app.selectQuery(tx, query, getOrgNotiDataSuccess);
        };    
                        
        var groupDataShow = [];
        
        function getOrgNotiDataSuccess(tx, results) {
            groupDataShow = [];
            
            var count = results.rows.length;
            
            DBGETDATAVALUE = count;           
            //alert(count);
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
                                           attachedImg :'http://54.85.208.215/assets/attachment/' + results.rows.item(i).attached
                                       });
                    
                    lastNotificationPID = results.rows.item(i).pid;
                }    
                //console.log(lastNotificationPID);
            }else {
                lastNotificationPID = 0;

                groupDataShow.push({
                                       title: ' No Notification ',
                                       message: 'No Notification for this Group',
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
        
        var showLiveData = function() {
            var organisationALLListDataSource = new kendo.data.DataSource({
                                                                              data: groupDataShow
                                                                          });
             
            organisationALLListDataSource.fetch(function() {
            });
            
            $("#admin-sub-noti-listview").kendoMobileListView({
                                                                  template: kendo.template($("#adminSubNotiTemplate").html()),    		
                                                                  dataSource: organisationALLListDataSource
                                                              });              
            
            $('#admin-sub-noti-listview').data('kendoMobileListView').refresh(); 
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