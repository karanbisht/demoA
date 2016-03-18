var app = app || {};

app.admNotiList = (function () {
    'use strict';
    
    var organisationID;
    var account_Id;
    var groupDataShow = [];   
    var page = 0;
    var totalListView = 0;
    var dataReceived = 0;
    var userCount;
    

        var totalReadMsg=0;
        var totalSum1=0;
        var totalSum2=0;


    
    var admNotiViewModel = (function () {
        var init = function () {
        };

        var show = function(e) {
            //$("#showMoreEventBtnOrg").hide();                           
            app.showAppLoader(true);
            page = 0;
            dataReceived = 0;
            totalListView = 0;
            totalReadMsg=0;
            totalSum1=0;
            totalSum2=0;

            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");  
            userCount = localStorage.getItem("incommingMsgCount"); 

            groupDataShow = [];                        
            getLiveData();
        };

        var checkNoMsg = 0;
        var getLiveData = function() {
            checkNoMsg=0;
            //var jsonDataLogin = {"page":page}                        
            var admRepDataSource = new kendo.data.DataSource({                
                                                                              transport: {
                    read: {
                                                                                          url: app.serverUrl() + "notification/listReplyNotification/" + organisationID,
                                                                                          type:"POST",
                                                                                          dataType: "json"//, // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                          //data: jsonDataLogin
                                                                                      }
                },
                 
                                                                              schema: {
                    data: function(data) {
                        //console.log(JSON.stringify(data));
                        return [data]; 
                    }                                                            
                },
                 
                                                                              error: function (e) {
                                                                                  //console.log(JSON.stringify(e));
                                                                                  app.hideAppLoader();
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
                                                                                  //showMoreDbData();
                                                                              }	        
                                                                          });         
          
            admRepDataSource.fetch(function() {
                var data = this.data();                
                       
                if (data[0]['status'][0].Msg ==='No List') {     
                    groupDataShow = [];                
                    checkNoMsg=1;
                    groupDataShow.push({
                                           title: ' No Message ',
                                           message: 'No Message from this Organization',
                                           date:'0',  
                                           comment_allow : 'Y',
                                           org_id:'0', 
                                           pid:'',
                                           bagCount : '',
                                           attachedImg :'',
                                           time:'',
                                           attached:''  
                                       });                   
                    //showMoreDbData();
                }else if (data[0]['status'][0].Msg==='Success') {
                    checkNoMsg=0;
                    totalListView = data[0]['status'][0].Total;                                   
                    var orgDataLength = data[0]['status'][0].NotificationList.length;
                    for (var i = 0 ; i < orgDataLength ;i++) {
                        var notiDate = app.timeConverter(data[0].status[0].NotificationList[i].send_date);
                        groupDataShow.push({
                                               message: data[0].status[0].NotificationList[i].message,
                                               org_id: data[0].status[0].NotificationList[i].org_id,
                                               date:notiDate,
                                               title:data[0].status[0].NotificationList[i].title,
                                               pid :data[0].status[0].NotificationList[i].pid ,
                                               comment_allow:data[0].status[0].NotificationList[i].comment_allow ,
                                               type : 'C',
                                               totalCount:data[0].status[0].NotificationList[i].total,
                                               actualDate:data[0].status[0].NotificationList[i].send_date,
                                               attached :data[0].status[0].NotificationList[i].attached,
                                               upload_type:data[0].status[0].NotificationList[i].upload_type,
                                               attachedImg :data[0].status[0].NotificationList[i].attached,
                                               sender_id :''
                                           });                                                                               
                    }
                    //saveOrgNotification(orgNotificationData);                                                                                                                                                                      
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
                showUserAdmMsg();
                //showLiveData();
            });            
        }
                
        
        function showUserAdmMsg(){

 
            var admMsgDataSource = new kendo.data.DataSource({
                                                                                 transport: {
                    read: {
                                                                                             url: app.serverUrl() + "notification/chattoAdmin",
                                                                                             type:"POST",
                                                                                             dataType: "json"                 
                                                                                         }
                },
                                                                                 schema: {
                    data: function(data) {     
                        //console.log(JSON.stringify(data));
                        return [data];          

                    }                       
                },

                                                                                 error: function (e) {
                                                                                     //console.log(JSON.stringify(e));
                                                                                 }	        
                                                                             });        
 
            admMsgDataSource.fetch(function() {
                var data = this.data();            
                if (data[0]['status'][0].Msg ==='No Message') { 

                }else if (data[0]['status'][0].Msg==='Success') {
                    if(checkNoMsg===1){
                        groupDataShow=[];
                    }
                    var admMsgLst = data[0]['status'][0].AllMessage;
                    //saveAdmMsg(admMsgLst);
                    for(var i=0;i<admMsgLst.length;i++){
                           var notiDate = app.timeConverter(data[0].status[0].AllMessage[i].date);
                           groupDataShow.push({
                                               message: data[0].status[0].AllMessage[i].message,
                                               org_id: organisationID,
                                               date:notiDate,
                                               title:data[0].status[0].AllMessage[i].Name+" (User)",
                                               pid :'',
                                               comment_allow: 1,
                                               actualDate:data[0].status[0].AllMessage[i].date,
                                               totalCount:data[0].status[0].AllMessage[i].count,
                                               type : 'OTO',
                                               attached :"0",
                                               upload_type:'',
                                               attachedImg :'',
                                               sender_id : data[0].status[0].AllMessage[i].sender_id                         
                                         });
                     }   
                }

                showLiveData();
            });             
        }
        
        var showLiveData = function(){           
            $.each( groupDataShow, function( i, Message ) {
                var msgType = Message.type;
                var totalCount = Message.totalCount;
                var db = app.getDb();
                if(msgType==='OTO'){
                    var msgIdA = Message.sender_id;    
                    //db.transaction(getBagCountValOTO, app.errorCB, app.successCB);
                    db.transaction( function(tx){ getBagCountValOTO(tx, i ,totalCount,msgIdA) }, app.errorCB, app.successCB );
                }else{
                    var msgIdM = Message.pid;                    
                    //db.transaction(getBagCountValMsg, app.errorCB, app.successCB);
                    db.transaction( function(tx){ getBagCountValMsg(tx, i ,totalCount,msgIdM) }, app.errorCB, app.successCB );
                }
             });
             //showDataInTemplate();
        }
        
        function getBagCountValOTO(tx,index,totalC,msgIdVal){
              var query = "SELECT count FROM ADMIN_OTO where org_id='" + organisationID +"'and id='"+msgIdVal+"'";
              //app.selectQuery(tx, query, bagValOTOSuccess);    
              tx.executeSql(query, [], function(tx, results){
                  var count = results.rows.length;
                  var result;
                  if (count !== 0) { 
                    result=parseInt(results.rows.item(0).count); 
                  }else{
                    result=0;
                  }  
                  totalC = totalC - result;
                  groupDataShow[index].showCount = totalC;    
                  
                  if(index===groupDataShow.length-1){
                      showDataInTemplate();
                  }
              }, app.errorCB);
        }
        
        function getBagCountValMsg(tx,index,totalC,msgIdVal){
              var query = "SELECT count FROM ADMIN_MSG_MEM where org_id='" + organisationID +"'and id='"+msgIdVal+"'";
              //app.selectQuery(tx, query, bagValMSGSuccess); 
              tx.executeSql(query, [], function(tx, results){
                  var count = results.rows.length;
                  //console.log(count);
                  var totalbagVal=0;
                  if (count !== 0) { 
                      for(var i=0;i<count;i++){
                        var result=parseInt(results.rows.item(i).count); 
                        totalbagVal=parseInt(totalbagVal)+result;   
                      }
                  }else{
                        totalbagVal=0;
                  }
                  //console.log(totalbagVal);
                  totalC = totalC - totalbagVal;
                  groupDataShow[index].showCount = totalC;  
                  if(index===groupDataShow.length-1){
                      showDataInTemplate();
                  }
              }, app.errorCB);
        }
        
        
                
        function showDataInTemplate(){            
            groupDataShow.sort(function(a, b) {
                return parseFloat(b.actualDate) - parseFloat(a.actualDate);
            });
            
            $(".km-scroll-container").css("-webkit-transform", "");
            
            var admRepDataSource = new kendo.data.DataSource({
                                                                              data: groupDataShow
                                                                          });
                       
            $("#user-rep-adm-noti").kendoMobileListView({
                                                              template: kendo.template($("#admNotiReplyTemp").html()),    		
                                                              dataSource: admRepDataSource
                                                          });             

            $('#user-rep-adm-noti').data('kendoMobileListView').refresh();                          
            app.hideAppLoader();
            

            /*if ((totalListView > 10) && (totalListView >= dataReceived + 10)) {
                $("#showMoreEventBtnOrg").show();
            }else {
                $("#showMoreEventBtnOrg").hide();
            }*/     
            
            var db = app.getDb();
            db.transaction(updateBagCount, app.errorCB, setMsgCount);
        }
        
        
        var updateBagCount = function(tx) {
              var query = "SELECT count FROM ADMIN_OTO where org_id=" + organisationID;
              app.selectQuery(tx, query, adminOtoSuccess);
            
              var query1 = "SELECT count FROM ADMIN_MSG_MEM where org_id=" + organisationID;
              app.selectQuery(tx, query1, adminMsgSuccess);
            
            /*var queryUpdate = "UPDATE ADMIN_ORG SET bagCount='" + userCount + "' where org_id=" + organisationID;
            app.updateQuery(tx, queryUpdate);                         
            
            var query = "SELECT * FROM ADMIN_ORG where org_id=" + organisationID;
            app.selectQuery(tx, query, getDataSuccessCust);*/
        };
        
        function adminOtoSuccess(tx, results) {                                                               
            var count = results.rows.length;          
            if (count !== 0) { 
               for(var i=0;i<count;i++){
                var result=parseInt(results.rows.item(i).count); 
                totalSum1=parseInt(totalSum1)+result;   
              }
            }            
        }
        
        
        function adminMsgSuccess(tx, results) {                                                               
            var count = results.rows.length;
            if (count !== 0) { 
              for(var i=0;i<count;i++){
                var result=parseInt(results.rows.item(i).count); 
                totalSum2=parseInt(totalSum2)+result;   
              }
            }            
        }
        
        function setMsgCount(){
            totalReadMsg = parseInt(totalSum1)+parseInt(totalSum2);  
            var db = app.getDb();
            db.transaction(updateBagCount2, app.errorCB, app.successCB);
        }
        
        function updateBagCount2(tx){
            var queryUpdate = "UPDATE ADMIN_ORG SET bagCount='" + totalReadMsg + "' where org_id=" + organisationID;
            app.updateQuery(tx, queryUpdate);
            
            var query = "SELECT * FROM ADMIN_ORG where org_id=" + organisationID;
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
                if (showData < 0) {
                    showData = 0;   
                } 
                $("#countToShow").html(showData);            
            }            
        }

        

        var admRepNotiSelected = function (e) {
            var message = e.data.message;
            var title = e.data.title;
            var attached = e.data.attached;
            var type = e.data.upload_type;            
            var msgType = e.data.type;
            var senderId = e.data.sender_id;
            var commentAllow = e.data.comment_allow;
            var shareDate = e.data.date;
            var pId = e.data.pid;
            var org_id = e.data.org_id;

           if (attached!== null && attached!=='' && attached!=="0") {
              localStorage.setItem("shareImg", attached);
           }else {
              localStorage.setItem("shareImg", null);
           }
            
           localStorage.setItem("shareMsg", message);
           localStorage.setItem("shareTitle", title);
           localStorage.setItem("shareOrgId",org_id);
           localStorage.setItem("shareNotiID",pId);
           localStorage.setItem("shareComAllow",commentAllow);
           localStorage.setItem("msgType",msgType);
           localStorage.setItem("shareDate",shareDate);
           localStorage.setItem("shareUploadType",type);
           localStorage.setItem("shareReceiverID",senderId);
           localStorage.setItem("frmWhere",'Admin');
           localStorage.setItem("msgCount",e.data.totalCount);
            
            if(msgType==='OTO'){
                app.mobileApp.navigate('views/createAdmMsgLst.html');           
            }else{
                app.mobileApp.navigate('views/memberNotiRepList.html');
            }    

        };
        	           
        return {
            init: init,
            show: show,
            getLiveData:getLiveData,
            //showMoreButtonPress:showMoreButtonPress,
            admRepNotiSelected:admRepNotiSelected   
        };
    }());
    
    return admNotiViewModel;
s}());  