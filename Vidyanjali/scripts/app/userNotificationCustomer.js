var app = app || {};

app.replyedCustomer = (function () {
    var replyedCustomerView = (function () {
        var org_id;
        var noti_id;
        var groupDataShow = [];

        var init = function () {
        };
        
        var show = function(e) {
            groupDataShow = [];
            app.mobileApp.pane.loader.hide();
            app.showAppLoader(true);
            
           /*localStorage.setItem("shareMsg", message);
           localStorage.setItem("shareTitle", title);
           localStorage.setItem("shareOrgId",org_id);
           localStorage.setItem("shareNotiID",pId);
           localStorage.setItem("shareComAllow",commentAllow);
           localStorage.setItem("msgType",msgType);
           localStorage.setItem("shareDate",shareDate);
           localStorage.setItem("shareUploadType",type);
           localStorage.setItem("shareReceiverID",senderId)*/
            
            org_id = localStorage.getItem("shareOrgId");
            noti_id = localStorage.getItem("shareNotiID");
         
            //alert(org_id+"----"+noti_id);
            $(".km-scroll-container").css("-webkit-transform", "");
          
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "notification/getReplycustomerList/"+org_id+"/"+noti_id,
                                                                             type:"POST",
                                                                             dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
                                                                         }
                },
                                                                 schema: {
                                
                    data: function(data) {
                        //console.log(JSON.stringify(data));
                        return [data];
                    }

                },
                                                                 error: function (e) {
                                                                     app.hideAppLoader();
                                                                     //console.log(JSON.stringify(e));

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
                                                                         //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
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
                                               comment:data[0].status[0].customerList[i].comment,
                                               totalCount: data[0].status[0].customerList[i].total,
                                               notification_id:data[0].status[0].customerList[i].notification_id,
                                               add_date:date_show,
                                               user_id:data[0].status[0].customerList[i].user_id
                                           });
                    }  
                } 
                
                getBagCount(); 
            });
        };
                
                
        function getBagCount(){
            console.log(groupDataShow);                        
            $.each( groupDataShow, function( i, MemberMsg ) {
                
                var notiIdDB = MemberMsg.notification_id;        
                var custIdDB = MemberMsg.customerID;
                var totalCount = MemberMsg.totalCount;
                
                var db = app.getDb();
                //db.transaction(getBagMebCountValMsg, app.errorCB, app.successCB);
                db.transaction( function(tx){ getBagMebCountValMsg(tx, i ,totalCount,notiIdDB,custIdDB) }, app.errorCB, app.successCB );
             });
        }
        
        function getBagMebCountValMsg(tx,index,totalC,notiVal,CustVal){
              var query = "SELECT count FROM ADMIN_MSG_MEM where org_id='" + org_id +"'and id='"+notiVal+"' and customerID='"+CustVal+"'";
              //app.selectQuery(tx, query, bagValMemMSGSuccess); 
              tx.executeSql(query, [], function(tx, results){
                  var count = results.rows.length;
                  console.log(count);
                  var totalbagVal=0;
                  if (count !== 0) { 
                      for(var i=0;i<count;i++){
                        var result=parseInt(results.rows.item(i).count); 
                        totalbagVal=parseInt(totalbagVal)+result;   
                      }
                  }else{
                        totalbagVal=0;
                  }
                  console.log(totalbagVal);
                  totalC = totalC - totalbagVal;
                  groupDataShow[index].showCount = totalC;  
                  if(index===groupDataShow.length-1){
                      showMemberDataInTemp();
                  }
              }, app.errorCB);
        }
        
        var showMemberDataInTemp = function() {
            $(".km-scroll-container").css("-webkit-transform", "");  
            console.log(groupDataShow);
            var memberListDataSource = new kendo.data.DataSource({
                                                                     data: groupDataShow
                                                                 });                       
            $("#reply-customer-listview").kendoMobileListView({
                                                                  dataSource: memberListDataSource,
                                                                  template: kendo.template($("#replyCustomerTemplate").html())       
                                                              });            
            $("#reply-customer-listview").data('kendoMobileListView').refresh();
            app.hideAppLoader();
            
        }
       
                     
        var customerSelected = function(e) {
           //app.analyticsService.viewModel.trackFeature("User navigate to Reply page in Admin");            
           localStorage.setItem("shareTitle", e.data.user_fname + ' ' + e.data.user_lname);
           localStorage.setItem("shareOrgId",org_id);
           localStorage.setItem("shareNotiID",e.data.notification_id);
           localStorage.setItem("msgType",'C');
           localStorage.setItem("shareDate",e.data.add_date);
           localStorage.setItem("shareReceiverID",e.data.customerID);
           localStorage.setItem("msgCount",e.data.totalCount);
           app.mobileApp.navigate('views/userNotificationComment.html');
        };
       
        return {
            init: init,
            show: show,
            customerSelected:customerSelected
        };
    }());
    
    return replyedCustomerView;
}());