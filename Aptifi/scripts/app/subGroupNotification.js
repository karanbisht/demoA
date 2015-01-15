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
            message: 'No Notification for this Group',
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
            console.log(e);
    
            var showNotiTypes=[
            { message: "Please Check Your Internet Connection"}
            ];
                        
            var dataSource = new kendo.data.DataSource({
            data: showNotiTypes
            });
                    
            $("#admin-sub-noti-listview").kendoMobileListView({
            template: kendo.template($("#errorTemplate").html()),
            dataSource: dataSource  
            });
                    
            }
	        
            });         
         
            */   
            //organisationALLListDataSource.fetch(function() {
                
            //});
          
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