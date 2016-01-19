var app = app || {};

app.replyedCustomer = (function () {
    var replyedCustomerView = (function () {
        var org_id;
        var userCount;

        var groupDataShow = [];

        var init = function () {
        };
        
        var show = function(e) {
            groupDataShow = [];
            app.mobileApp.pane.loader.hide();
            app.showAppLoader(true);

            $("#reply-customer-listview").hide();
          
            org_id = localStorage.getItem("orgSelectAdmin");
            userCount = localStorage.getItem("incommingMsgCount"); 
                    
            $(".km-scroll-container").css("-webkit-transform", "");
          
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "notification/replyListbyOrg/" + org_id,
                                                                             type:"POST",
                                                                             dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
                                                                         }
                },
                                                                 schema: {
                                
                    data: function(data) {
                        return [data];
                    }

                },
                                                                 error: function (e) {
                                                                     app.hideAppLoader();

                                                                     $("#reply-customer-listview").show();
                                                                   
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
            
            MemberDataSource.fetch(function() {
                var data = this.data();                                
                if (data[0]['status'][0].Msg==="You don't have access") {                                                         
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                    
                    app.mobileApp.navigate('#view-all-activities-GroupDetail');
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg ==='No list found') {   
                    groupDataShow.push({
                                           user_fname: 'No Message found',
                                           user_lname: '',
                                           customerID:0,  
                                           user_type : '',
                                           //orgID:0,
                                           comment:'',
                                           notification_id:'',
                                           add_date:'',
                                           user_id:0
    	                               
                                       });                                      
                }else if (data[0]['status'][0].Msg==='Success') {
                    for (var i = 0;i < data[0].status[0].customerList.length;i++) {
                        var dateString = data[0].status[0].customerList[i].add_date;
                        var split = dateString .split(' ');
                        var commentDate = app.formatDate(split[0]);
                        var commentTime = app.formatTime(split[1]);
                        var date_show = commentDate + ' ' + commentTime;
 
                        groupDataShow.push({
                                               user_fname: data[0].status[0].customerList[i].user_fname,
                                               user_lname : data[0].status[0].customerList[i].user_lname,
                                               customerID:data[0].status[0].customerList[i].customerID,
                                               user_type:data[0].status[0].customerList[i].user_type,
                                               photo:data[0].status[0].customerList[i].photo,
                                               comment:data[0].status[0].customerList[i].title,
                                               notification_id:data[0].status[0].customerList[i].notification_id,
                                               add_date:date_show,
                                               user_id:data[0].status[0].customerList[i].user_id
                                           });
                    }  
                } 
                
                showMemberDataInTemp(); 
            });
        };
        
        var showMemberDataInTemp = function() {
            app.mobileApp.pane.loader.hide();    	    
            $(".km-scroll-container").css("-webkit-transform", "");             
            var memberListDataSource = new kendo.data.DataSource({
                                                                     data: groupDataShow
                                                                 });           
            
            $("#reply-customer-listview").kendoMobileListView({
                                                                  dataSource: memberListDataSource,
                                                                  template: kendo.template($("#replyCustomerTemplate").html())       
                                                              });
            
            $("#reply-customer-listview").data('kendoMobileListView').refresh();

            app.mobileApp.pane.loader.hide();

            app.hideAppLoader();
            $("#reply-customer-listview").show();

            var db = app.getDb();
            db.transaction(updateBagCount, app.errorCB, app.successCB);   
        }
       
        var updateBagCount = function(tx) {
            var queryUpdate = "UPDATE ADMIN_ORG SET bagCount='" + userCount + "' where org_id=" + org_id;
            app.updateQuery(tx, queryUpdate);                         
            
            var query = "SELECT * FROM ADMIN_ORG where org_id=" + org_id;
            app.selectQuery(tx, query, getDataSuccessCust);
        }                
        
        function getDataSuccessCust(tx, results) {                                                               
            var count = results.rows.length;
            if (count !== 0) { 
                var bagCountData = results.rows.item(0).bagCount;                  
                var countData = results.rows.item(0).count;
                   
                if (countData===null || countData==="null") {
                    countData = 0; 
                }
                   
                if (bagCountData===null || bagCountData==="null") {
                    bagCountData = 0;
                }
                       
                localStorage.setItem("incommingMsgCount", countData);                  
                    
                var showData = countData - bagCountData;
                                
                $("#countToShow").html(showData);            
            }            
        }
                     
        var customerSelected = function(e) {
            app.analyticsService.viewModel.trackFeature("User navigate to Reply page in Admin");            

            app.mobileApp.navigate('views/userNotificationComment.html?org_id=' + org_id + '&customerID=' + e.data.customerID + '&userName=' + e.data.user_fname + ' ' + e.data.user_lname + '&notification_id=' + e.data.notification_id + '&date=' + e.data.add_date);
        };
       
        return {
            init: init,
            show: show,
            customerSelected:customerSelected
        };
    }());
    
    return replyedCustomerView;
}());