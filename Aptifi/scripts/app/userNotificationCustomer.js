var app = app || {};

app.replyedCustomer = (function () {
    var replyedCustomerView = (function () {
        var message;
      
        var org_id;
        var userCount;

        var groupDataShow = [];

        var init = function () {
        };
        
        var show = function(e) {
            app.MenuPage = false;
            groupDataShow = [];
            app.mobileApp.pane.loader.hide();

            $("#loaderReplyCustomer").show();
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
                        console.log(data);
                        return [data];
                    }

                },
                                                                 error: function (e) {
                                                                     //console.log(JSON.stringify(e));
                                                                     $("#loaderReplyCustomer").hide();
                                                                     $("#reply-customer-listview").show();
                                                                     if (!app.checkSimulator()) {
                                                                         window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                     }else {
                                                                         app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                     } 
                     
                                                                     var showNotiTypes = [
                                                                         { message: "Please Check Your Internet Connection"}
                                                                     ];
                        
                                                                     var dataSource = new kendo.data.DataSource({
                                                                                                                    data: showNotiTypes
                                                                                                                });
                    
                                                                     $("#reply-customer-listview").kendoMobileListView({
                                                                                                                           template: kendo.template($("#errorTemplate").html()),
                                                                                                                           dataSource: dataSource  
                                                                                                                       });
                                                                 }
                                                             });         
            
            MemberDataSource.fetch(function() {
                var data = this.data();                                
                if (data[0]['status'][0].Msg==="You don't have access") {                                                         
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }                    
                    app.mobileApp.navigate('#view-all-activities-GroupDetail');
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
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
                    //console.log(orgVal.customerList.length);  
                    for (var i = 0;i < data[0].status[0].customerList.length;i++) {
                        var dateString = data[0].status[0].customerList[i].add_date;
                        var split = dateString .split(' ');
                        //console.log(split[0] + " || " + split[1]);
                        var commentDate = app.formatDate(split[0]);
                        var commentTime = app.formatTime(split[1]);
                        var date_show = commentDate + ' ' + commentTime;
 
                        groupDataShow.push({
                                               user_fname: data[0].status[0].customerList[i].user_fname,
                                               user_lname : data[0].status[0].customerList[i].user_lname,
                                               customerID:data[0].status[0].customerList[i].customerID,
                                               user_type:data[0].status[0].customerList[i].user_type,
                                               //orgID:orgVal.customerList[i].orgID,
                                               comment:data[0].status[0].customerList[i].comment,
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

            $("#loaderReplyCustomer").hide();
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
                   
                //alert(countData);
                //alert(bagCountData);
    
                localStorage.setItem("incommingMsgCount", countData);                  
                    
                var showData = countData - bagCountData;
                                
                $("#countToShow").html(showData);            
            }            
        }
                     
        var customerSelected = function(e) {
            //console.log(e);
            //console.log(e.data.user_fname);
            //console.log(e.data.customerID);
            app.MenuPage = false;

            app.analyticsService.viewModel.trackFeature("User navigate to Reply page in Admin");            

            app.mobileApp.navigate('views/userNotificationComment.html?org_id=' + org_id + '&customerID=' + e.data.customerID + '&userName=' + e.data.user_fname +' '+e.data.user_lname+'&notification_id=' + e.data.notification_id + '&date=' + e.data.add_date);
        };
       
        return {
            init: init,
            show: show,
            customerSelected:customerSelected
        };
    }());
    
    return replyedCustomerView;
}());