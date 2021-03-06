var app = app || {};

app.Activities = (function () { 
    'use strict';    
    var organisationID;  
    var account_Id;  
    var bagCount;
    var groupDataShow = [];
    var lastNotificationPID;
    var UserOrgInformation;
    var orgName;
    var totalOrgNotification = 0;    
    var StartDbCount = 0;
    var EndDbCount = 10;
    var checkVal = 0;
    var noDatainDB = 0;
    var device_type; 
    var countVal = 0;
    var sdcardPath;
    var clickOnShowMore = 0;
    
    var activitiesViewModel = (function () {
        var init = function() {
            
        };   
        
        var show = function(e) {                                            
            $("#admMsgIcon").show();
            $(".km-scroll-container").css("-webkit-transform", "");
            device_type = localStorage.getItem("DEVICE_TYPE");
            localStorage.setItem("loginStatusCheck", 1);
            localStorage.setItem("gotNotification", 0);
     
            
            var alterTable = localStorage.getItem("alterTableYN");            
            if(alterTable!=='1'){    
                var db = app.getDb();
                db.transaction(alterTableDB, app.errorCB, alterTableSuccess);                                
            }
            
            var ADMIN_USER = localStorage.getItem("ADMIN_USER");            
            if (ADMIN_USER===1 || ADMIN_USER==='1') {
                $("#goToAdmin").show();
            }else {
                $("#goToAdmin").hide();
            }

            StartDbCount = 0;
            checkVal = 0;
            EndDbCount = 10;
            totalOrgNotification = 0;
            groupDataShow = [];
            $("#showMoreButton").hide();
            $("#popover-drawer").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");       
            sdcardPath = localStorage.getItem("sdCardPath");
            app.mobileApp.pane.loader.hide();
            
            organisationID = localStorage.getItem("selectedOrgId");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            bagCount = localStorage.getItem("orgBagCount");
            orgName = localStorage.getItem("selectedOrgName");
            
            var OrgDisplayName;
            if (orgName.length > 25) {
                OrgDisplayName = orgName.substr(0, 25) + '..';
            }else {
                OrgDisplayName = orgName;                
            }            
            $("#navBarHeader").html(OrgDisplayName);
            getAdminSentMsg();
            getDataFromDB();                        
            countVal = 0;
            clickOnShowMore = 0;
        };        
        

        var alterTableDB = function(tx) {        
              tx.executeSql('ALTER TABLE ORG_NOTIFICATION ADD COLUMN receiver_id INTEGER');
              tx.executeSql('ALTER TABLE ORG_NOTIFICATION ADD COLUMN count INTEGER');
        };
        
        function alterTableSuccess(){
            localStorage.setItem("alterTableYN", 1);
        }
            
        var getDataFromDB = function() {
            groupDataShow = [];
            var db = app.getDb();
            db.transaction(getDataOrgNoti, app.errorCB, showLiveDataDB);         
        }
                    
        var getLastOrgNoti = function(tx) {
            var query = "SELECT MAX(pid) as pid FROM ORG_NOTIFICATION where org_id=" + organisationID;
            app.selectQuery(tx, query, getOrgLastNotiDataSuccess);
            
            var queryUp = 'UPDATE PROFILE_INFO SET Admin_login_status=0';
            app.updateQuery(tx, queryUp);            
        };    
               
        var getAdminSentMsg = function(){
            organisationID = localStorage.getItem("selectedOrgId");
            account_Id = localStorage.getItem("ACCOUNT_ID");
 
            var admMsgDataSource = new kendo.data.DataSource({
                                                                                 transport: {
                    read: {
                                                                                             url: app.serverUrl() + "notification/getCustomerSentMsg/" + account_Id + "/" + organisationID,
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
                                                                                     /*var db = app.getDb();
                                                                                     db.transaction(getDataOrgNoti, app.errorCB, app.successCB);*/         
                                                                                 }	        
                                                                             });        
 
            admMsgDataSource.fetch(function() {
                var data = this.data();            
                if (data[0]['status'][0].Msg ==='No Message') { 

                }else if(data[0]['status'][0].Msg ===''){
                    
                }else if (data[0]['status'][0].Msg==='Success') {
                    var admMsgLst = data[0]['status'][0].AllMessage;
                    saveAdmMsg(admMsgLst);                                                                                   
                }
                    //var db = app.getDb();
                    //db.transaction(getLastOrgNoti, app.errorCB, showUpdateLocalDB);                                  
            });
        }
        
                    
        function getOrgLastNotiDataSuccess(tx, results) {
            var count = results.rows.length;            
            var deviceName = app.devicePlatform();
            var device_type;             
            if (deviceName==='Android') {
                device_type = 'AN';
            }else if (deviceName==='iOS') {
                device_type = 'AP';
            }            
            var device_id = localStorage.getItem("deviceTokenID");
            //device_id ='APA91bGWUuUGxBdf_xT8XJ-XrrxXq_C8Z9s3O7GlWVTitgU0bw1oYrHxshzp2rdualgIcLq696TnoBM4tPaQ-Vsqu3iM6Coio77EnKOpi0GKBdMy7E1yYLEhF2oSlo-5OkYfNpi7iAhtFQGMgzabaEnfQbis5NfaaA';

            var lastNotificationPID = results.rows.item(0).pid;
            if (lastNotificationPID===null) {
                lastNotificationPID = 0;
            }

            var organisationALLNewListDataSource = new kendo.data.DataSource({
                                                                                 transport: {
                    read: {
                                                                                             url: app.serverUrl() + "notification/getCustomerNotification/" + organisationID + "/" + account_Id + "/" + lastNotificationPID + "/" + 1 + "/" + device_id + "/" + device_type + "/" + app.CLIENT_APP_ID ,
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
                                                                                     /*var db = app.getDb();
                                                                                     db.transaction(getDataOrgNoti, app.errorCB, app.successCB);*/         
                                                                                 }	        
                                                                             });        
 
            organisationALLNewListDataSource.fetch(function() {
                var data = this.data();            
                if (data[0]['status'][0].Msg ==='No notification') { 
                    /*var db = app.getDb();
                    db.transaction(getDataOrgNoti, app.errorCB, app.successCB);*/                                        
                }else if (data[0]['status'][0].Msg==='Success') {
                    StartDbCount = 0;
                    var orgNotificationData = data[0]['status'][0].notificationList;
                    if (noDatainDB===1) {
                        groupDataShow = []; 
                    }                                        
                    saveOrgNotification(orgNotificationData);                                                                                     
                }
            });
        }                      
        
        var orgNotiDataVal;        
        function saveOrgNotification(data) {
            orgNotiDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiData, app.errorCB, getDataFromDB);
        };

        
        var admRecvDataLive;
        function saveAdmMsg(admVal){      
            admRecvDataLive=admVal;
            var db = app.getDb();
            db.transaction(getReceivIDData, app.errorCB, app.successCB);         
        }        
                    
        var getReceivIDData = function(tx) {
            var query = "SELECT receiver_id FROM ORG_NOTIFICATION where org_id=" + organisationID +" and receiver_id !=''";
            app.selectQuery(tx, query, admRecDataSuc);
        };
        
        var admCmmt = 1;
        
        function admRecDataSuc(tx, results) {
          var count = results.rows.length; 
          var admMsgDB = [];  
          if(count!==0){              
             for(var i=0;i<count;i++){
               admMsgDB.push(parseInt(results.rows.item(i).receiver_id));                         
             }
          }      
                    
            if(count===0){
              var dataLength = admRecvDataLive.length;
              for (var i = 0;i < dataLength;i++) {    
                  
                var notiTitleEncode = app.urlEncode(admRecvDataLive[i].Name +' (Admin)');
                var notiMessageEncode = app.urlEncode(admRecvDataLive[i].message);

                var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,receiver_id ,message ,title,send_date,comment_allow,type,count) VALUES ("'
                            + organisationID
                            + '","'
                            + admRecvDataLive[i].receiver_id
                            + '","'
                            + notiMessageEncode
                            + '","'
                            + notiTitleEncode
                            + '","'
                            + admRecvDataLive[i].date
                            + '","'
                            + admCmmt
                            + '","'
                            + 'OTO'
                            + '","'
                            + admRecvDataLive[i].count
                            + '")';              
                 app.insertQuery(tx, query);
              }   
            }else{
                var dataLength1 = admRecvDataLive.length;
                for (var i = 0;i < dataLength1;i++) {    
          
                   var notiTitleEncode1 = app.urlEncode(admRecvDataLive[i].Name +' (Admin)');
                   var notiMessageEncode1 = app.urlEncode(admRecvDataLive[i].message);

                      
                   var pos = $.inArray(parseInt(admRecvDataLive[i].receiver_id), admMsgDB);                      
                   if (pos === -1) {
                     var query1 = 'INSERT INTO ORG_NOTIFICATION(org_id ,receiver_id ,message ,title,send_date,comment_allow,type,count) VALUES ("'
                            + organisationID
                            + '","'
                            + admRecvDataLive[i].receiver_id
                            + '","'
                            + notiMessageEncode1
                            + '","'
                            + notiTitleEncode1
                            + '","'
                            + admRecvDataLive[i].date               
                            + '","'
                            + admCmmt
                            + '","'
                            + 'OTO'
                            + '","'
                            + admRecvDataLive[i].count
                            + '")';              
                      app.insertQuery(tx, query1);
                  }else{                      
                      var query2 = "UPDATE ORG_NOTIFICATION SET message='" + notiMessageEncode1 + "',title='" + notiTitleEncode1 + "',count='"+admRecvDataLive[i].count+"', send_date='" + admRecvDataLive[i].date + "',comment_allow = 1 where org_id='" + organisationID + "' and receiver_id='"+admRecvDataLive[i].receiver_id+"'";
                      app.updateQuery(tx, query2); 
                  }   
                }    
            }
        }
            
        function insertOrgNotiData(tx) {
            //var query = "DELETE FROM ORG_NOTIFICATION";
            //app.deleteQuery(tx, query);
            var dataLength = orgNotiDataVal.length;

            var orgData;        
            var orgLastMsg;
 
            for (var i = 0;i < dataLength;i++) {    
                orgData = orgNotiDataVal[i].org_id;
                orgLastMsg = orgNotiDataVal[i].message;
          
                var notiTitleEncode = app.urlEncode(orgNotiDataVal[i].title);
                var notiMessageEncode = app.urlEncode(orgNotiDataVal[i].message);

                var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type,upload_type,count) VALUES ("'
                            + orgNotiDataVal[i].org_id
                            + '","'
                            + orgNotiDataVal[i].pid
                            + '","'
                            + orgNotiDataVal[i].attached
                            + '","'
                            + notiMessageEncode
                            + '","'
                            + notiTitleEncode
                            + '","'
                            + orgNotiDataVal[i].comment_allow
                            + '","'
                            + orgNotiDataVal[i].send_date
                            + '","'
                            + orgNotiDataVal[i].type
                            + '","'
                            + orgNotiDataVal[i].upload_type
                            + '","'
                            + orgNotiDataVal[i].total
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
            GlobalDataLastMsg = app.urlEncode(GlobalDataLastMsg);
            var query = "UPDATE JOINED_ORG SET count='" + GlobalDataCount + "',bagCount='" + GlobalDataCount + "', lastNoti='" + GlobalDataLastMsg + "' where org_id='" + GlobalDataOrgId + "' and role='C'";
            app.updateQuery(tx, query);
        }
        
        function showDBNotification() {
            clickOnShowMore++;   
            var db = app.getDb();
            db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
        }
            
        var getDataOrgNoti = function(tx) {
            var query = "SELECT * FROM ORG_NOTIFICATION where org_id='" + organisationID + "' ORDER BY send_date DESC limit'" + StartDbCount + "','" + EndDbCount + "'" ;
            app.selectQuery(tx, query, getOrgNotiDataSuccess);
            
            var query1 = "SELECT count(pid) as TOTAL_DATA from ORG_NOTIFICATION where org_id=" + organisationID;
            app.selectQuery(tx, query1, getOrgTotalNotiData);
        };    
        
        function getOrgTotalNotiData(tx, results) {            
            totalOrgNotification = results.rows.item(0).TOTAL_DATA;   
            if (totalOrgNotification > StartDbCount) {
                setTimeout(function() {
                    $("#showMoreButton").show();
                }, 1500);                
            }else {                                
                $("#showMoreButton").hide();
            }
        }
        
        var showLiveDataDB = function() {                      
            setTimeout(function(){
                getMoreDb(1);
            },500);
        };
        
        
        function getMoreDb(goTOVal){
             $.each(groupDataShow, function( i, Message ) {
                var msgType = Message.type;
                var totalCount = Message.totalCount;
                var db = app.getDb();
                if(msgType==='OTO'){
                    var msgIdA = Message.receiver_id;    
                    //db.transaction(getBagCountValOTO, app.errorCB, app.successCB);
                    db.transaction( function(tx){ getBagCountAdmMsg(tx, i ,totalCount,msgIdA,goTOVal) }, app.errorCB, app.successCB);
                }else{
                    var msgIdM = Message.pid;                    
                    //db.transaction(getBagCountValMsg, app.errorCB, app.successCB);
                    db.transaction( function(tx){ getBagCountLocalMsg(tx, i ,totalCount,msgIdM,goTOVal) }, app.errorCB, app.successCB);
                }
             });   
        }
                
        
        function getBagCountAdmMsg(tx,index,totalC,msgIdVal,goToData){
              var query = "SELECT count FROM USER_OTO where org_id='" + organisationID +"'and id='"+msgIdVal+"'";
              //app.selectQuery(tx, query, bagValOTOSuccess);    
              tx.executeSql(query, [], function(tx, results){
                  var count = results.rows.length;
                  var result;
                  if (count !== 0) { 
                        result=isNaN(parseInt(results.rows.item(0).count)); 
                        if(result===null || result===true ){
                            result=0;
                        }else{
                           result=parseInt(results.rows.item(0).count);  
                        }
                  }else{
                    result=0;
                  }  
                  totalC = totalC - result;
                  totalC = parseInt(totalC);
                  if(totalC < 0){
                      totalC=0;
                  }
                  groupDataShow[index].showCount = totalC; 
                  if(index===groupDataShow.length-1){
                     if(goToData===1){ 
                          showDataInTemplate();
                     }else{
                          showInTemplateMoreButton();
                     }    
                  }
              }, app.errorCB);
        }
        
        function getBagCountLocalMsg(tx,index,totalC,msgIdVal,goToData){
              var query = "SELECT count FROM ADMIN_MSG_RPY where org_id='" + organisationID +"'and id='"+msgIdVal+"'";
              //app.selectQuery(tx, query, bagValMSGSuccess); 
              tx.executeSql(query, [], function(tx, results){
                  var count = results.rows.length;
                  var totalbagVal=0;
                  if (count !== 0) { 
                      for(var i=0;i<count;i++){                          
                        var result=isNaN(parseInt(results.rows.item(i).count));                          
                        if(result===null || result===true ){
                            result=0;
                        }else{
                           result=parseInt(results.rows.item(i).count);  
                        }
                        totalbagVal=parseInt(totalbagVal)+result;   
                      }
                  }else{
                        totalbagVal=0;
                  }
                  totalC = totalC - totalbagVal;
                  totalC = parseInt(totalC);
                  if(totalC < 0){
                      totalC=0;
                  }       
                  groupDataShow[index].showCount = totalC;                  
                  if(index===groupDataShow.length-1){
                     if(goToData===1){                           
                          showDataInTemplate();
                     }else{
                          showInTemplateMoreButton();
                     }    
                  }
              }, app.errorCB);
        }
        
        function showDataInTemplate(){
            setTimeout(function() {
                groupDataShow = groupDataShow.sort(function(a, b) {
                    return parseInt(a.index) - parseInt(b.index);
                }); 
                
                var organisationALLListDataSource = new kendo.data.DataSource({
                                                                                  data: groupDataShow
                                                                              });
             
                $("#activities-listview").kendoMobileListView({
                                                                  template: kendo.template($("#activityTemplate").html()),    		
                                                                  dataSource: organisationALLListDataSource
                                                              });
            
                $('#activities-listview').data('kendoMobileListView').refresh();          
                $("#progressNotification").hide();
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else {
                    //getAdminSentMsg();

                    var db = app.getDb();
                    db.transaction(getLastOrgNoti, app.errorCB, showUpdateLocalDB);                                  

                }
                app.hideAppLoader();
                activeImgClick();
                activeVidClick(); 
            }, 100);
        }
        
        var showUpdateLocalDB = function(e) {       
            account_Id = localStorage.getItem("ACCOUNT_ID");   
            var jsonDataLogin = {"APP_ID":app.CLIENT_APP_ID}
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "organisation/customerOrg/" + account_Id,
                                                                            type:"POST",
                                                                            dataType: "json", 
                                                                            data: jsonDataLogin                                                    
                                                                        }
                },
                                                                schema: {
                    data: function(data) {	
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data();                                		                                  
                if (data[0]['status'][0].Msg==='Not a customer to any organisation') {
                    groupDataShow = [];                               
                    groupDataShow.push({
                                           orgName: 'No Organization',
                                           orgDesc: 'Not a member of any Organization',
                                           organisationID:'0',
                                           imageSource:'',
                                           org_logo :null,  
                                           bagCount : 0 ,
                                           countData:0,
                                           count : 0
                                       });
                               
                    var db = app.getDb();
                    db.transaction(delOrgDataDB, app.errorCB, app.successCB);                                                    
                    loginSuccessForManageOrg();
                }else if (data[0]['status'][0].Msg==='Success') {
                    localStorage.setItem("selectedOrgId", data[0]['status'][0].orgData[0].organisationID);
                    localStorage.setItem("ACCOUNT_ID", account_Id);
                    localStorage.setItem("orgBagCount", 0);
                    localStorage.setItem("selectedOrgName", data[0]['status'][0].orgData[0].org_name);
                    localStorage.setItem("selectedOrgLogo", data[0]['status'][0].orgData[0].org_logo);                                
                    localStorage.setItem("selectedOrgDesc", data[0]['status'][0].orgData[0].org_desc);
                    localStorage.setItem("selectedOrgDOJ", data[0]['status'][0].orgData[0].joinedON);

                    if (data[0]['status'][0].orgData.length!==0) {
                        UserOrgInformation = data[0]['status'][0].orgData;
                        var userOrgLastNoti = data[0]['status'][0].last;                             
                        saveOrgInfo(UserOrgInformation, userOrgLastNoti);
                    }else {
                        groupDataShow = []; 
                        $("#moreOption").show();
                              
                        groupDataShow.push({
                                               orgName: 'No Organization',
                                               orgDesc: 'Not a member of any Organization',
                                               organisationID:'0',
                                               imageSource:'',
                                               org_logo :null,  
                                               bagCount : 0 ,
                                               countData:0,
                                               count : 0
                                           });
                               
                        var db = app.getDb();
                        db.transaction(delOrgDataDB, app.errorCB, app.successCB);                          
                    } 
                }else {
                }                      
            }); 
        };

        function delOrgDataDB(tx) {
            var query = "DELETE FROM JOINED_ORG";
            app.deleteQuery(tx, query);

            var query = "DELETE FROM ORG_NOTIFICATION";
            app.deleteQuery(tx, query);
        }
        
        var profileAdminOrgData;
        var profileOrgData;
                
        function saveOrgInfo(data1, data2) {
            profileOrgData = data1;
            profileAdminOrgData = data2;
            var db = app.getDb();
            db.transaction(getOrgIdFmDB, app.errorCB, nowGetLiveData);        
        };

        var joinOrgID = [];               
        var joinOrgAdminID = [];
        
        var getOrgIdFmDB = function(tx) {
            var query = 'SELECT org_id FROM JOINED_ORG';
            app.selectQuery(tx, query, getOrgDataSuccess);   

            var query1 = 'SELECT org_id FROM JOINED_ORG_ADMIN';
            app.selectQuery(tx, query1, getOrgAdminDataSuccess);   
        } 
                
        function getOrgDataSuccess(tx, results) {
            var count = results.rows.length;
            joinOrgID = [];
            if (count !== 0) {
                for (var i = 0;i < count;i++) {
                    joinOrgID.push(parseInt(results.rows.item(i).org_id));
                }
            }
        }
        
        function getOrgAdminDataSuccess(tx, results) {
            var count = results.rows.length;
            joinOrgAdminID = [];
            if (count !== 0) {
                for (var i = 0;i < count;i++) {
                    joinOrgAdminID.push(parseInt(results.rows.item(i).org_id));
                }
            }
        }
        
        var nowGetLiveData = function() {
            var db = app.getDb();
            db.transaction(insertOrgInfo, app.errorCB, loginSuccessForManageOrg);   
        } 
               
        var userLiveOrgIdArray = [];
        
        function insertOrgInfo(tx) {
            var dataLength = profileOrgData.length;
            userLiveOrgIdArray = [];            

            for (var i = 0;i < dataLength;i++) {                             
                userLiveOrgIdArray.push(parseInt(profileOrgData[i].organisationID));           
                profileOrgData[i].organisationID = parseInt(profileOrgData[i].organisationID);           
                var LastNotificationMsg;           
                if (profileAdminOrgData[i].total!==0) {
                    LastNotificationMsg = profileAdminOrgData[i].last_notification.message; 
                }else {
                    LastNotificationMsg = ""; 
                }
                LastNotificationMsg = app.urlEncode(LastNotificationMsg);
                var orgNameEncode = app.urlEncode(profileOrgData[i].org_name);
                var orgDescEncode = app.urlEncode(profileOrgData[i].org_desc);
                var pos = $.inArray(parseInt(profileOrgData[i].organisationID), joinOrgID);           
                if (pos === -1) {
                    joinOrgID.push(profileOrgData[i].organisationID);     
                    var first_login = localStorage.getItem("FIRST_LOGIN");
                    if (first_login===0) {
                        var query = 'INSERT INTO JOINED_ORG(org_id,org_name,imageSource,joinedDate,orgDesc,lastNoti,count) VALUES ("'
                                    + profileOrgData[i].organisationID
                                    + '","'
                                    + orgNameEncode
                                    + '","'
                                    + profileOrgData[i].org_logo
                                    + '","'
                                    + profileOrgData[i].joinedON
                                    + '","'
                                    + orgDescEncode
                                    + '","'
                                    + LastNotificationMsg
                                    + '","'
                                    + profileAdminOrgData[i].total
                                    + '")';              
                        app.insertQuery(tx, query);
                    }else {
                        localStorage.setItem("FIRST_LOGIN", 0); 
                        var query1 = 'INSERT INTO JOINED_ORG(org_id,org_name,imageSource,joinedDate,orgDesc,lastNoti,count,bagCount) VALUES ("'
                                     + profileOrgData[i].organisationID
                                     + '","'
                                     + orgNameEncode
                                     + '","'
                                     + profileOrgData[i].org_logo
                                     + '","'
                                     + profileOrgData[i].joinedON
                                     + '","'
                                     + orgDescEncode
                                     + '","'
                                     + LastNotificationMsg
                                     + '","'
                                     + profileAdminOrgData[i].total
                                     + '","'
                                     + profileAdminOrgData[i].total
                                     + '")';              
                        app.insertQuery(tx, query1);
                    }
                }else {                    
                    var queryUpdate = "UPDATE JOINED_ORG SET org_name='" + orgNameEncode + "',orgDesc='" + orgDescEncode + "',imageSource='" + profileOrgData[i].org_logo + "',joinedDate='" + profileOrgData[i].joinedON + "',lastNoti='" + LastNotificationMsg + "',count='" + profileAdminOrgData[i].total + "' where org_id=" + profileOrgData[i].organisationID;
                    app.updateQuery(tx, queryUpdate);                         
                }                      
            }                               
            checkDeletedData();   
        }  

        var orgIdToDel;
        var checkDeletedData = function() {
            var dbIdLength;
            
            dbIdLength = joinOrgID.length;                       
            for (var i = 0;i < dbIdLength;i++) {
                var dataVal = userLiveOrgIdArray.indexOf(joinOrgID[i]);
                if (dataVal===-1) {
                    orgIdToDel = joinOrgID[i];
                    var db = app.getDb();
                    db.transaction(delOrgDataId, app.errorCB, app.successCB);                          
                } 
            }            
        }

        function delOrgDataId(tx) {
            var query = "DELETE FROM JOINED_ORG where org_id=" + orgIdToDel;
            app.deleteQuery(tx, query);
             
            var query1 = "DELETE FROM ORG_NOTIFICATION where org_id=" + orgIdToDel;
            app.deleteQuery(tx, query1);
        }  

        var loginSuccessForManageOrg = function() {                        
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           transport: {
                    read: {
                                                                                       url: app.serverUrl() + "organisation/managableOrg/" + account_Id + "/" + app.CLIENT_APP_ID,
                                                                                       type:"POST",
                                                                                       dataType: "json"                 
                                                                                   }
                },
                                                                           schema: {                                
                    data: function(data) {	
                        return [data];
                    }                                                            
                },
                                                                           error: function (e) {
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
                        
            organisationListDataSource.fetch(function() {                
                var data = this.data();
                var anay_UserName = localStorage.getItem("username");           
                if (data[0]['status'][0].Msg ==='No Orgnisation to manage') {     
                    $("#moreOption").show();
                    $("#goToAdmin").hide();
                    localStorage.setItem("ADMIN_USER", 0);
                    localStorage.setItem("usernameAnalytic", anay_UserName);                             
                    var db = app.getDb();
                    db.transaction(delAdminOrgDataDB, app.errorCB, app.successCB);                          
                }else if (data[0]['status'][0].Msg==='Success') {
                    $("#moreOption").hide();
                    $("#goToAdmin").show();
                    localStorage.setItem("ADMIN_USER", 1);
                    anay_UserName = anay_UserName + ' A';                
                    localStorage.setItem("usernameAnalytic", anay_UserName);
                }
            });
        }

        function delAdminOrgDataDB(tx) {
            var query = "DELETE FROM JOINED_ORG_ADMIN";
            app.deleteQuery(tx, query);
        }  
               
        function getOrgNotiDataSuccess(tx, results) {
            var count = results.rows.length;
            var arrayDB = [];
            for (var i = 0;i < count;i++) {
                arrayDB.push(results.rows.item(i));
            }              
            if (checkVal===0) {
                StartDbCount = count + 1;
            }else {
                StartDbCount = StartDbCount + count;
            }                  
            checkVal++;
            
            var previousDate = '';            
            if (count !== 0) {                
                $.each(arrayDB, function(i, msgData) {
                    var dateString = msgData.send_date;                    
                    var notiTitleDecode = app.urldecode(msgData.title);
                    var notiMessageDecode = app.urldecode(msgData.message);
                    var notiDate = app.timeConverter(dateString);
                    var attachedData = msgData.attached;
                    var uplaodData = msgData.upload_type;                    
                    var downloadedImg;
                    var Filename;
                    var fp;                                        
                    if (attachedData!== null && attachedData!=='' && attachedData!=="0" && uplaodData==="other") {
                        Filename = attachedData.replace(/^.*[\\\/]/, '');
                        var ext = app.getFileExtension(Filename);
                        if (ext==='') {
                            Filename = Filename + '.jpg';
                        }
                        fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + Filename;
                        window.resolveLocalFileSystemURL(fp, 
                                                         function(entry) {
                                                             downloadedImg = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + Filename;                        
                                                             pushDataInArray(msgData, previousDate, downloadedImg, notiDate, notiMessageDecode, notiTitleDecode, i);
                                                         }, function(error) {
                                                             downloadedImg = msgData.attached;
                                                             pushDataInArray(msgData, previousDate, downloadedImg, notiDate, notiMessageDecode, notiTitleDecode, i);
                                                         });                
                        
                        /*}else if (attachedData!== null && attachedData!=='' && attachedData!=="0" && uplaodData==="video") { 
                        Filename = attachedData.replace(/^.*[\\\/]/, '');
                        fp = sdcardPath + "Zaffio/" + 'Zaffio_Video_' + Filename;             
                        downloadedImg = msgData.attached;
                        window.resolveLocalFileSystemURL(fp, 
                        function(entry)
                        {
                        console.log('sdcard');
                        downloadedImg = sdcardPath + "Zaffio/" + 'Zaffio_Video_' + Filename;
                        pushDataInArray(msgData,previousDate,downloadedImg,notiDate,notiMessageDecode,notiTitleDecode,i);  
                        },function(error)
                        {
                        console.log('not in sdcard');
                        downloadedImg = msgData.attached;
                        pushDataInArray(msgData,previousDate,downloadedImg,notiDate,notiMessageDecode,notiTitleDecode,i); 
                        });*/
                    }else {
                        downloadedImg = '';
                        pushDataInArray(msgData, previousDate, downloadedImg, notiDate, notiMessageDecode, notiTitleDecode, i);
                    }                                                         
                    previousDate = notiDate;                    
                    lastNotificationPID = msgData.pid;                    
                });                
            }else {
                lastNotificationPID = 0;
                $("#showMoreButton").hide();                    
                if (checkVal===0) {
                    noDatainDB = 1;                                                                  
                }else {
                    noDatainDB = 0;
                }
                groupDataShow = [];                
                groupDataShow.push({
                                       title: ' No Message ',
                                       message: 'No messages from this organization',
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
                
        function pushDataInArray(msgData, previousDate, downloadedImg, notiDate, notiMessageDecode, notiTitleDecode, i) {  
            var indexVal; 
            if (clickOnShowMore!==0) {
                indexVal = parseInt(clickOnShowMore + '0') + i + 1;
            }else {
                indexVal = i + 1;
            }
                               
            groupDataShow.push({
                                   message: notiMessageDecode,
                                   org_id: msgData.org_id,
                                   date:notiDate,
                                   title:notiTitleDecode,
                                   pid :msgData.pid ,
                                   comment_allow:msgData.comment_allow ,
                                   bagCount : 'C',
                                   comment_count :msgData.adminReply , 
                                   upload_type:msgData.upload_type,
                                   attached :msgData.attached,
                                   totalCount:msgData.count,
                                   receiver_id : msgData.receiver_id,
                                   previousDate:previousDate,
                                   type:msgData.type,                
                                   showCount:0,
                                   attachedImg :downloadedImg,
                                   index:indexVal
                               }); 
        }           
        
        var showMoreButtonPress = function() {
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
             setTimeout(function(){
                getMoreDb(2);
             },500);
        };
        
        function showInTemplateMoreButton(){
            setTimeout(function() { 
                groupDataShow = groupDataShow.sort(function(a, b) {
                    return parseInt(a.index) - parseInt(b.index);
                });
                
                var organisationALLListDataSource = new kendo.data.DataSource({
                                                                                  data: groupDataShow
                                                                              });
                $("#activities-listview").kendoMobileListView({
                                                                  template: kendo.template($("#activityTemplate").html()),    		
                                                                  dataSource: organisationALLListDataSource
                                                              });
            
                $('#activities-listview').data('kendoMobileListView').refresh();          
                activeImgClick();
                activeVidClick();
            }, 100);
        }
                          
        var activitySelected = function (e) {  
            var msgType = e.data.type;
            if(msgType==='OTO'){
                app.mobileApp.navigate('views/createAdmMsgLst.html');           
            }else{
                app.mobileApp.navigate('views/activityView.html');
            }    
            //app.analyticsService.viewModel.trackFeature("User navigate to Customer Notification Comment List");            
        };
               
        var goToAppFirstView = function() {
            app.mobileApp.navigate('#view-all-activities');
        }
        
        var attachedFilename;
        var videoFile;
        var notiFi;
        var fpVid;
        
        var videoDownlaodClick = function(e) {            
            var data = e.button.data();
            videoFile = data.someattribute;              
            notiFi = data.notiid;
            attachedFilename = videoFile.replace(/^.*[\\\/]/, '');
            fpVid = sdcardPath + app.SD_NAME + "/" + 'Zaffio_Video_' + attachedFilename;             
            window.resolveLocalFileSystemURL(fpVid, videoPathExist, videoPathNotExist);                        
        }
        
        var videoPathExist = function() {          
            fpVid = sdcardPath + app.SD_NAME + "/" + 'Zaffio_Video_' + attachedFilename;
            if (device_type==="AP") {
                window.open(fpVid, "_blank", 'EnableViewPortScale=yes');
            }else {
                window.plugins.fileOpener.open(fpVid);
            }
        }
        
        var videoPathNotExist = function() { 
            if (!app.checkConnection()) {                                                                             
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                               
            }else {  
                if (countVal!==0) {
                    if (!app.checkSimulator()) {                                                                                               
                        window.plugins.toast.showShortBottom(app.VIDEO_ALY_DOWNLOAD);                                                                                           
                    }else {                                                                                                
                        app.showAlert(app.VIDEO_ALY_DOWNLOAD , 'Error');                                                                                             
                    }                                
                }else {      
                    var newNotiFi = notiFi;                
                    $("#video_Div_" + newNotiFi).show();
                    var attachedVid = videoFile;                        
                    fpVid = sdcardPath + app.SD_NAME + "/" + 'Zaffio_Video_' + attachedFilename;
                    var fileTransfer = new FileTransfer(); 
            
                    fileTransfer.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);                                                                             
                            countVal = perc;
                            document.getElementById("downloadPer_" + newNotiFi).value = countVal;
                            document.getElementById("progressValue_" + newNotiFi).innerHTML = countVal;                                                                                     
                        }else {
                            document.getElementById("progressValue_" + newNotiFi).innerHTML = 0;
                            countVal = 0;
                        }
                    };
            
                    fileTransfer.download(attachedVid, fpVid, 
                                          function(entry) {                                      
                                              $("#video_Div_" + newNotiFi).hide();
                                              $("#downloadPer_" + newNotiFi).hide();   
                                              countVal = 0;
                                              document.getElementById("progressValue_" + newNotiFi).innerHTML = 0;
                                              window.plugins.toast.showShortBottom(app.DOWNLOAD_COMPLETED);
                                          },
    
                                          function(error) {
                                              countVal = 0;
                                              $("#video_Div_" + newNotiFi).hide();
                                              $("#downloadPer_" + newNotiFi).hide();
                                              document.getElementById("progressValue_" + newNotiFi).innerHTML = 0; 
                                              window.plugins.toast.showShortBottom(app.DOWNLOAD_NOT_COMPLETE);
                                          }
                        );   
                }
            }    
        }

        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;
        var fpImg;
                
        var imgPathExist = function() {                    
            fpImg = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;
            $("#img_Div_" + imgNotiFi).hide();
            if (device_type==="AP") {
                window.open(fpImg, '_blank' , 'location=no,enableViewportScale=yes,closebuttoncaption=Close');
            }else {
                window.plugins.fileOpener.open(fpImg);
            }
        }
        
        var imgClickIdArray = []; 
        var imgPathNotExist = function() {
            if (!app.checkConnection()) {
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
            }else {
                var pos = $.inArray(imgNotiFi, imgClickIdArray);                    
                if (pos === -1) {
                    imgClickIdArray.push(imgNotiFi);
                    var circle = new ProgressBar.Circle("#img_Div_" + imgNotiFi, {
                                                            color: '#7FBF4D',
                                                            trailColor: '#eee',
                                                            strokeWidth: 10,
                                                            duration: 2500,
                                                            easing: 'easeInOut'
                                                        });

                    circle.set(0.05);
                    setTimeout(function() {
                        circle.animate(0.3);
                    }, 1000);
                    setTimeout(function() {
                        circle.animate(0.4);
                    }, 3500);
                    setTimeout(function() {
                        circle.animate(0.6);
                    }, 5500);
                    setTimeout(function() {
                        circle.animate(0.8);
                    }, 8000);
                    setTimeout(function() {
                        circle.animate(.9);
                    }, 10000);                
                    $("#img_Div_" + imgNotiFi).show();
                
                    var attachedImg = imgFile;                        
                    fpImg = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;

                    var fileTransfer = new FileTransfer();              
                    fileTransfer.download(attachedImg, fpImg, 
                                          function(entry) {
                                              $("#img_Div_" + imgNotiFi).hide();
                                              window.plugins.toast.showShortBottom(app.DOWNLOAD_COMPLETED);
                                              var index = imgClickIdArray.indexOf(imgNotiFi);
                                              if (index > -1) {
                                                  imgClickIdArray.splice(index, 1);
                                              }                                          
                                              console.log(JSON.stringify(imgClickIdArray));
                                          }, 
                                          function(error) {
                                              $("#img_Div_" + imgNotiFi).hide();
                                              window.plugins.toast.showShortBottom(app.DOWNLOAD_NOT_COMPLETE);
                                              var index = imgClickIdArray.indexOf(imgNotiFi);
                                              if (index > -1) {
                                                  imgClickIdArray.splice(index, 1);
                                              }
                                          }
                        );
                }   
            }    
        }
         
        var getDataToPost = function(e) {
            var message = e.data.message;
            var title = e.data.title;
            var attached = e.data.attached;
            var type = e.data.upload_type;            
            var msgType = e.data.type;
            var org_id = e.data.org_id;
            var notiId = e.data.pid;
            var comment_allow = e.data.comment_allow; //"1"
            var upload_type = e.data.upload_type;                            
            var date = e.data.date;
            var receiver_id = e.data.receiver_id;

            if (attached!== null && attached!=='' && attached!=="0") {
                localStorage.setItem("shareImg", attached);
            }else {
                localStorage.setItem("shareImg", null);
            }
            
            localStorage.setItem("shareMsg", message);
            localStorage.setItem("shareTitle", title);                 
            localStorage.setItem("shareOrgId", org_id);
            localStorage.setItem("shareNotiID", notiId);
            localStorage.setItem("shareComAllow", comment_allow);
            localStorage.setItem("shareUploadType", upload_type);
            localStorage.setItem("shareDate", date);
            localStorage.setItem("shareType", type);
            localStorage.setItem("msgType", msgType);
            localStorage.setItem("msgCount", e.data.totalCount);            
            localStorage.setItem("shareReceiverID", receiver_id);
            localStorage.setItem("frmWhere",'User');
        }

        function activeImgClick() {
            $('.activityImgClick').click(function(event) {
                var imgData = event.target.id.split('-----');
                imgFile = imgData[0];
                imgNotiFi = imgData[1];
                   
                attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
                var ext = app.getFileExtension(attachedImgFilename);
                if (ext==='') {
                    attachedImgFilename = attachedImgFilename + '.jpg'; 
                }
            
                fpImg = sdcardPath + app.SD_NAME + "/" + 'Zaffio_img_' + attachedImgFilename;             
                window.resolveLocalFileSystemURL(fpImg, imgPathExist, imgPathNotExist); 
            });
        }
        
        function activeVidClick() {
            $('.activityVidClick').click(function(event) {
                var imgData = event.target.alt.split('-----');
                      
                videoFile = imgData[0];
                notiFi = imgData[1];
                   
                attachedFilename = videoFile.replace(/^.*[\\\/]/, '');
                fpVid = sdcardPath + app.SD_NAME + "/" + 'Zaffio_Video_' + attachedFilename;             
                window.resolveLocalFileSystemURL(fpVid, videoPathExist, videoPathNotExist);                                   
            });
        }

        return {
            activitySelected: activitySelected,
            init:init,
            getDataToPost:getDataToPost,
            videoDownlaodClick:videoDownlaodClick,
            goToAppFirstView:goToAppFirstView,
            show:show,
            getAdminSentMsg:getAdminSentMsg,
            afterShow:afterShow,
            showMoreButtonPress:showMoreButtonPress,
        };
    }());

    return activitiesViewModel;
}());