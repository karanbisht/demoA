var app = app || {};
app.OragnisationList = (function () {
    'use strict'; 
    var account_Id;
    var groupDataShow = [];   
    var UserOrgInformation;
    var orgLogoName;
    var imgPathData;
    var checkForImg=0;
    var fp;
    
    var organisationViewModel = (function () {
        var init = function() {
        };
                      
        var show = function() {                      
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#moreOption").hide();
            $("#goToAdmin").hide();             
            localStorage.setItem("loginStatusCheck", 1);
            account_Id = localStorage.getItem("ACCOUNT_ID");                        
            var db = app.getDb();
            db.transaction(getDataOrg, app.errorCB, showLiveData);   
        }
                                
        var getDataOrg = function(tx) {
            var query = "SELECT * FROM JOINED_ORG";
            app.selectQuery(tx, query, getDataSuccess);
            
            var query1 = "SELECT * FROM JOINED_ORG_ADMIN";
            app.selectQuery(tx, query1, getAdminDataSuccess);
            
            var query2 = 'UPDATE PROFILE_INFO SET Admin_login_status=0';
            app.updateQuery(tx, query2);
        }; 
        
        var getDataOrgDB = [];
        var getDataCountDB = [];
        var org_id_DB;
        var org_Logi_Image;
        
        function getDataSuccess(tx, results) {                        
            $('#organisation-listview').data('kendoMobileListView').refresh(); 
            getDataOrgDB = [];
            getDataCountDB = [];
            groupDataShow = [];
            
            var count = results.rows.length;                    
            //console.log("DBCount" + count);
			
            if (count !== 0) {                
                var tempArray = [];
                for (var i = 0 ; i < count ; i++) {                      
                    //checkForImg=0;
                    var orgImage;
                    org_Logi_Image = results.rows.item(i).imageSource;
                    orgImage = results.rows.item(i).imageSource;
                    
                    if(org_Logi_Image!=='null' && org_Logi_Image!==null){
                        orgLogoName = org_Logi_Image.replace(/^.*[\\\/]/, '');                        
                        imgPathData = app.getfbValue();                    
                        fp = imgPathData + app.SD_NAME+"/" + 'Zaffio_orgLogo_'+orgLogoName;                         
                        window.resolveLocalFileSystemURL(fp, 
                        function(entry)
                        {
                           //alert('local');
                          orgImage=imgPathData + app.SD_NAME+"/"+'Zaffio_orgLogo_'+orgLogoName; 
                           //checkForImg=1; 
                        },function(error)
                        {
                          //alert('no available');  
                          //checkForImg=0;  
                          orgImage=results.rows.item(i).imageSource;  
                        });                                    
                    }
                    
                    //alert(orgImage);
                    
                    org_id_DB = results.rows.item(i).org_id;                                      
                    var bagCount = results.rows.item(i).bagCount;                   
                    var countVal = results.rows.item(i).count;                   
                    
                    var countValue;
                    
                    if (bagCount===null || bagCount==="null") {
                        bagCount = 0;
                    }

                    countValue = count - bagCount;                    
                    getDataOrgDB.push(org_id_DB);
                    getDataCountDB.push(bagCount);
                    
                    var bagCountValue;
                    var lastNotifi;                    
                    if (results.rows.item(i).lastNoti===null || results.rows.item(i).lastNoti==='null') {
                        lastNotifi = '';   
                    }else {
                        lastNotifi = results.rows.item(i).lastNoti;
                    }

                    countValue = countVal - bagCount;
                    if (countValue < 0) {
                        countValue = 0;
                    }                    
                    lastNotifi = app.urldecode(lastNotifi);

                    var orgNameDecode = app.urldecode(results.rows.item(i).org_name);
                    var orgDescDecode = app.urldecode(results.rows.item(i).orgDesc);
                                     
                    
                    var pos = $.inArray(results.rows.item(i).org_id, tempArray);
                    if (pos === -1) {
                        tempArray.push(results.rows.item(i).org_id);                                     
                        groupDataShow.push({
                                               orgName: orgNameDecode,
                                               orgDesc: lastNotifi,
                                               organisationID:results.rows.item(i).org_id,
                                               org_logo:results.rows.item(i).imageSource,
                                               imageSource:orgImage,
                                               localImageSource:fp,
                                               checkForImg:checkForImg,
                                               bagCount : bagCountValue,
                                               countData:countValue,
                                               count : countVal
                                           });
                    }
                }  
            }else {
                groupDataShow.push({
                                       orgName: 'No Messages',
                                       orgDesc: 'Not a member of any Organization',
                                       organisationID:'0',
                                       imageSource:'',
                                       org_logo :null,  
                                       bagCount : 0 ,
                                       countData:0,
                                       count : 0
                                   });      
            }
        };   
     
            
        
        function getAdminDataSuccess(tx, results) {                        		
            var count = results.rows.length;                    
            if (count !== 0) {                                
                $("#moreOption").hide();
                $("#goToAdmin").show();
            }else {
                $("#moreOption").show();
                $("#goToAdmin").hide();
            }
        };

        var showUpdateLocalDB = function(e) {       
            account_Id = localStorage.getItem("ACCOUNT_ID");            
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "organisation/customerOrg/" + account_Id,
                                                                            type:"POST",
                                                                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                        }
                },
                                                                schema: {
                    data: function(data) {	
                        //console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    $("#progress2").hide();
                                                                    app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data();                                		                                  
                    if (data[0]['status'][0].Msg==='Not a customer to any organisation') {
                        //JoinedOrganisationYN = 0;
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
                        loginSuccessCB();
                    }else if (data[0]['status'][0].Msg==='Success') {
                        if (data[0]['status'][0].orgData.length!==0) {
                            //var roleLength = loginData.status[0].JoinedOrg.role.length;
                            //JoinedOrganisationYN = 1;                              
                            UserOrgInformation = data[0]['status'][0].orgData;
                            var userOrgLastNoti = data[0]['status'][0].last;                             
                            saveOrgInfo(UserOrgInformation, userOrgLastNoti);
                        }else {
                            //JoinedOrganisationYN = 0;
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
                        $("#progress2").hide();
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

            var query = 'SELECT org_id FROM JOINED_ORG_ADMIN';
            app.selectQuery(tx, query, getOrgAdminDataSuccess);   
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
            db.transaction(insertOrgInfo, app.errorCB, loginSuccessCB);   
        } 
               
        var userLiveOrgIdArray = [];
        var userOrgIdArray = [];  
        
        function insertOrgInfo(tx) {
            //console.log(profileOrgData);
            //console.log(profileAdminOrgData);
            var dataLength = profileOrgData.length;
            userLiveOrgIdArray = [];            

            for (var i = 0;i < dataLength;i++) {                             
                userLiveOrgIdArray.push(parseInt(profileOrgData[i].organisationID));           
                //console.log(profileOrgData[i]); 
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
                        //alert('New Data');               
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
                        var query = 'INSERT INTO JOINED_ORG(org_id,org_name,imageSource,joinedDate,orgDesc,lastNoti,count,bagCount) VALUES ("'
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
                        app.insertQuery(tx, query);
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
            var liveIdLength;
            var dbIdLength;
            
            liveIdLength = userLiveOrgIdArray.length;
            dbIdLength = joinOrgID.length;
            
            //alert(JSON.stringify(userLiveOrgIdArray));
            
            for (var i = 0;i < dbIdLength;i++) {
                //alert(JSON.stringify(joinOrgID[i]));
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
             
            var query = "DELETE FROM ORG_NOTIFICATION where org_id=" + orgIdToDel;
            app.deleteQuery(tx, query);
        }  
        
        var loginSuccessCB = function() {            
            
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           transport: {
                    read: {
                                                                                       url: app.serverUrl() + "organisation/managableOrg/" + account_Id +"/"+ app.CLIENT_APP_ID,
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
                                                                               //console.log(e);
                                                                               
                                                                               showLiveDataUpdated();  
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                           }	        
                                                                       });
                        
            organisationListDataSource.fetch(function() {                
                
                        var data = this.data();
                
                            if (data[0]['status'][0].Msg ==='No Orgnisation to manage') {     
                                $("#moreOption").show();
                                $("#goToAdmin").hide();

                                var db = app.getDb();
                                db.transaction(delAdminOrgDataDB, app.errorCB, app.successCB);                          
    
                                showLiveDataUpdated();  
                            }else if (data[0]['status'][0].Msg==='Success') {
                                $("#moreOption").hide();
                                $("#goToAdmin").show();
                                var adminOrgInformation = data[0]['status'][0].orgData;
                                var adminIncomMsg = data[0]['status'][0].last;
                                saveAdminOrgInfo(adminOrgInformation , adminIncomMsg); 
                            }
                        });
        }  
        
        function delAdminOrgDataDB(tx) {
            var query = "DELETE FROM JOINED_ORG_ADMIN";
            app.deleteQuery(tx, query);
        }  
        
        var adminOrgProfileData;        
        var adminIncomMsgData;  
            
        function saveAdminOrgInfo(data1 , data2) {
            adminOrgProfileData = data1;  
            adminIncomMsgData = data2;

            var db = app.getDb();
            db.transaction(insertAdminOrgInfo, app.errorCB, showLiveDataUpdated);
        };

        function insertAdminOrgInfo(tx) {          
            //var query = "DELETE FROM JOINED_ORG_ADMIN";
            //app.deleteQuery(tx, query); 

            var dataLength = adminOrgProfileData.length;


            for (var i = 0;i < dataLength;i++) {       
                userOrgIdArray.push(parseInt(adminOrgProfileData[i].organisationID));
             
                adminOrgProfileData[i].organisationID = parseInt(adminOrgProfileData[i].organisationID);

                var pos = $.inArray(parseInt(adminOrgProfileData[i].organisationID), joinOrgAdminID);           

                var orgNameEncode = app.urlEncode(adminOrgProfileData[i].org_name);
                var orgDescEncode = app.urlEncode(adminOrgProfileData[i].org_desc);
         
                if (pos === -1) {              
                    joinOrgAdminID.push(adminOrgProfileData[i].organisationID);      

                    var query = 'INSERT INTO JOINED_ORG_ADMIN(org_id , org_name , joinedDate , imageSource ,orgDesc , count) VALUES ("'
                                + adminOrgProfileData[i].organisationID
                                + '","'
                                + orgNameEncode
                                + '","'
                                + adminOrgProfileData[i].joinedOn
                                + '","'
                                + adminOrgProfileData[i].org_logo
                                + '","'
                                + orgDescEncode
                                + '","'
                                + adminIncomMsgData[i].total    
                                + '")';              
                    app.insertQuery(tx, query);
                }else {        
                    var queryUpdate = "UPDATE JOINED_ORG_ADMIN SET org_name='" + orgNameEncode + "',orgDesc='" + orgDescEncode + "',imageSource='" + adminOrgProfileData[i].org_logo + "',count='" + adminIncomMsgData[i].total + "' where org_id=" + adminOrgProfileData[i].organisationID;
                    app.updateQuery(tx, queryUpdate);                         
                }                      
            }  
          
            checkAdminDeletedData();   
        }  
        
        var orgAdminIdToDel;
        var checkAdminDeletedData = function() {
            var liveIdLength;
            var dbIdLength;
            
            liveIdLength = userOrgIdArray.length;
            dbIdLength = joinOrgAdminID.length;
                        
            for (var i = 0;i < dbIdLength;i++) {
                var dataVal = userOrgIdArray.indexOf(joinOrgAdminID[i]);           
                if (dataVal===-1) {
                    orgAdminIdToDel = joinOrgAdminID[i];
                    var db = app.getDb();
                    db.transaction(delAdminOrgDataId, app.errorCB, app.successCB);                          
                } 
            }            
        }

        function delAdminOrgDataId(tx) {
            var query = "DELETE FROM JOINED_ORG_ADMIN where org_id=" + orgAdminIdToDel;
            app.deleteQuery(tx, query);
        }

        var showLiveData = function() {
            //console.log('alertvalue');
            //console.log(groupDataShow);
            
            $("#progress2").hide();
                
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });           
                
            $("#organisation-listview").kendoMobileListView({
                                                                template: kendo.template($("#organisationTemplate").html()),    		
                                                                dataSource: organisationListDataSource
                                                            });
                
            $("#progress2").hide();
            
            $('#organisation-listview').data('kendoMobileListView').refresh();
                
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {
                showUpdateLocalDB();
            }   
        };
        
        var showLiveDataNew = function() {
            $("#progress2").hide();                
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });           
                
            $("#organisation-listview").kendoMobileListView({
                                                                template: kendo.template($("#organisationTemplate").html()),    		
                                                                dataSource: organisationListDataSource
                                                            });
                
            $("#progress2").hide();
    
            $('#organisation-listview').data('kendoMobileListView').refresh();
        };
        
        var showLiveDataUpdated = function() {
            var db = app.getDb();
            db.transaction(getDataOrg, app.errorCB, showLiveDataNew);   
        };
                                                        
                        
            
        var organisationSelected = function (e) {
            //$("#progress2").show();            
            //console.log(JSON.stringify(e.data));
            var organisationID = e.data.organisationID;
            var bagCount = e.data.count;            
            localStorage.setItem("user_SelectOrgID", organisationID);
            localStorage.setItem("user_ACCOUNT_ID", account_Id);
            localStorage.setItem("user_orgBagCount", bagCount);
            localStorage.setItem("user_selectedOrgName", e.data.orgName);
            localStorage.setItem("user_selectedOrgLogo", e.data.imageSource);
            app.analyticsService.viewModel.trackFeature("User navigate to Customer Notification List");            
  
            app.mobileApp.navigate('views/activitiesView.html');

            //app.mobileApp.navigate('#view-all-activities');

            
        };
       
        var groupSelected = function (e) {
            //console.log("karan Bisht" + e);
            app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        };
         
        var offlineActivitySelected = function (i) {
            //console.log(i);
            //console.log("click");
            //app.mobileApp.navigate('views/activityView.html?uid=' + e.data.uid);
        };
        
        var notificationSelected = function (e) {
            //alert(e.data.uid);
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };

        // Navigate to app home
        var navigateHome = function () {
            app.mobileApp.navigate('#welcome');
            //app.slide('right', 'green' , '3' , '#welcome');    
        };
        
        var replyUser = function() {
            app.mobileApp.navigate('views/userReplyView.html');                         
        };
        
        var manageGroup = function() {
            //app.mobileApp.pane.loader.show();
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var sendNotification = function() {
            //document.location.href="#sendNotificationDiv";
            app.mobileApp.navigate('views/sendNotification.html');
            //app.slide('left', 'green' , '3' , '#views/sendNotification.html');
        };
        
        var refreshButton = function() {
        };
                                 
        var info = function() {
        };

        var orgShow = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
            orgDbData = [];
            tempArray = [];
 
            $("#organisation-listview1").html("");
            var showMore = localStorage.getItem("ShowMore");
                                     
            var db = app.getDb();
            db.transaction(getOrgInfoDB, app.errorCB, getOrgDBSuccess);       
        };                        
                     
        function getOrgInfoDB(tx) {                    
            var query = 'SELECT * FROM JOINED_ORG_ADMIN';
            app.selectQuery(tx, query, orgDataForOrgSuccess);
            
            var query = 'SELECT * FROM JOINED_ORG';
            app.selectQuery(tx, query, orgUserDataForOrgSuccess);
        };

        var orgDbData = [];
        var tempArray = [];
            
        function orgDataForOrgSuccess(tx, results) {
            orgDbData = [];
            tempArray = [];
            
            var count = results.rows.length;
            //alert(count);
            //console.log('count' + count);
            if (count !== 0) {
                for (var i = 0;i < count;i++) {
                    var pos = $.inArray(results.rows.item(i).org_id, tempArray);                   
                    //console.log(pos);
                    
                    var orgNameDecode = app.urldecode(results.rows.item(i).org_name);
                    var orgDescDecode = app.urldecode(results.rows.item(i).orgDesc);

                    if (pos === -1) {
                        tempArray.push(results.rows.item(i).org_id); 

                        orgDbData.push({
                                           org_name: orgNameDecode ,
                                           org_id: results.rows.item(i).org_id,
                                           role:'O',
                                           imgData:results.rows.item(i).imageSource,   
                                           imageSourceOrg:results.rows.item(i).imageSource,   
                                           orgDesc:orgDescDecode,                      
                                           joinDate:results.rows.item(i).joinedDate                   
                                       });
                    }
                }
  
                $("#moreOption").hide();              
                $("#goToAdmin").show();
  
                getUserOrgInfo(1);
            }else {
                getUserOrgInfo(0);
                orgDbData = [];
                /*orgDbData.push({
                org_name:'No Organisation',
                org_id: '',
                role:'',
                imgData:null,   
                imageSourceOrg:'',   
                orgDesc:'You are not a customer of any organization',                      
                joinDate:'Not Yet Joined'                   
                });*/
            }
        };
        
        var adminOrgExist;
        var getUserOrgInfo = function(data) {
            adminOrgExist = data;
            var db = app.getDb();
            db.transaction(getUserOrgInfoDB, app.errorCB, app.successCB);
        }
        
        function getUserOrgInfoDB(tx) {                    
            var query = 'SELECT * FROM JOINED_ORG';
            app.selectQuery(tx, query, orgUserDataForOrgSuccess);
        };
        
        var orgUserDataForOrgSuccess = function(tx, results) {
            var count1 = results.rows.length;
            //console.log('count' + count1);
            
            if (count1 !== 0) {
                for (var i = 0;i < count1;i++) {
                    var pos = $.inArray(results.rows.item(i).org_id, tempArray);                   
                    //console.log(pos);

                    var orgNameDecode = app.urldecode(results.rows.item(i).org_name);
                    var orgDescDecode = app.urldecode(results.rows.item(i).orgDesc);
                    
                    if (pos === -1) {	
                        tempArray.push(results.rows.item(i).org_id); 

                        orgDbData.push({
                                           org_name: orgNameDecode,
                                           org_id: results.rows.item(i).org_id,
                                           role:'C',
                                           imgData:results.rows.item(i).imageSource,   
                                           imageSourceOrg:results.rows.item(i).imageSource,   
                                           orgDesc:orgDescDecode,                      
                                           joinDate:results.rows.item(i).joinedDate                   
                                       });
                    }
                }
            }else {
                if (adminOrgExist===0) {
                    $("#showMoreButton").hide();  
                    orgDbData.push({
                                       org_name:'No Organization',
                                       org_id: '0',
                                       role:'',
                                       imgData:null,   
                                       imageSourceOrg:'',   
                                       orgDesc:'Not a member of any Organization',                      
                                       joinDate:'0'                   
                                   });
                }
            }
        }

        function getOrgDBSuccess() {
            app.mobileApp.pane.loader.hide();
            //console.log(orgDbData);
        
            $("#organisation-listview1").kendoMobileListView({
                                                                 template: kendo.template($("#orgTemplate").html()),    		
                                                                 dataSource: orgDbData        			 
                                                             });
        
            $('#organisation-listview1').data('kendoMobileListView').refresh();    		    			
                
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }
                       
        };
            
        var orgMoreInfoSelected = function(e) {
            //console.log(e.data);
            var orgID = e.data.org_id;
            var orgName = e.data.org_name;
            var orgDesc = e.data.orgDesc;
            var role = e.data.role;
            var joinDate = e.data.joinDate;
            var imageSourceOrg = e.data.imageSourceOrg; 
            var imgData = e.data.imgData;   
            
            localStorage.setItem("selectedOrgId", orgID);
            localStorage.setItem("selectedOrgName", orgName);
            localStorage.setItem("selectedOrgDesc", orgDesc);
            localStorage.setItem("selectedOrgRole", role);
            localStorage.setItem("selectedOrgDOJ", joinDate);
            localStorage.setItem("selectedOrgImgSou", imageSourceOrg);
            localStorage.setItem("selectedOrgImgData", imgData);
            app.analyticsService.viewModel.trackFeature("User navigate to Manage Organization List"); 
            app.mobileApp.navigate('views/userOrgManage.html');

        };    
           
        var orgManageID;
            
        var showOrgInfoPage = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
            
            orgManageID = localStorage.getItem("selectedOrgId");
            var orgName = localStorage.getItem("selectedOrgName");
            var orgDesc = localStorage.getItem("selectedOrgDesc");
            var role = localStorage.getItem("selectedOrgRole");
            var joinDate = localStorage.getItem("selectedOrgDOJ");
            var imageSourceOrg = localStorage.getItem("selectedOrgLogo");
            var imgData = localStorage.getItem("selectedOrgLogo");
            var account_Id = localStorage.getItem("ACCOUNT_ID");

            
            /*if (imgData===null || imgData==='null') {   
                $("#organisationLogo").css("background", "url(styles/images/habicon.png) no-repeat");
                $("#organisationLogo").css("background-size", "contain");
                $("#organisationLogo").css("background-position", "center");
            }else {
                $("#organisationLogo").css("background", "url("+imageSourceOrg+") no-repeat");
                $("#organisationLogo").css("background-size", "contain");
                $("#organisationLogo").css("background-position", "center");
            }*/    
            
            $("#orgDescList").css("background-color", "#ffffff");
            $("#manageOrgDesc").css("background-color", "#ffffff");
            $("#orgDescList").css("z-index", "999");
            $("#manageOrgDesc").css("z-index", "999");
            
            if (orgDesc==='') {
                orgDesc = " ";
            }            

            if (role==='C') {
                $("#manageOrgFooter").show();
            }else {
                $("#manageOrgFooter").hide();
            }
            
            if (joinDate!==0 && joinDate!=='0' && joinDate!=='undefined' && joinDate!=='null') { 
                joinDate = app.formatDate(joinDate);
                $("#orgJoinData").html(joinDate);
            }else {
                $("#joinedDate").hide();
            }
          
            var orgNameVal ;
                                  
            if (orgName.length > 25) {
                orgNameVal = orgName.substr(0, 25) + '..';
            }else {
                orgNameVal = orgName;  
            }
            
            $("#navBarOrgHeader").html(orgNameVal);        
            $("#OrgDescData").html(orgDesc); 
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }
        }    
        
        var gobackOrgMainPage = function() {
            app.mobileApp.navigate('#view-all-activities');
            //app.slide('right', 'green' , '3' , '#organisationNotiList');    
        }
        
        var orgDescMainPage = function() {
            app.analyticsService.viewModel.trackFeature("User navigate to Organization Admin List Page");            

            app.mobileApp.navigate('#organisationDiv');
        }
        
        var editProfilePage = function() {        

            app.analyticsService.viewModel.trackFeature("User navigate to Edit Profile Page");            

            app.mobileApp.navigate('views/editProfile.html');       
        }
        
        var editProfileShow = function() {
            $("#editFirstName").val(fname);
            $("#editLastName").val(lnameVal);            
            $("#editEmail").val(email);                      
        }
        
        var unsubscribeOrg = function() {                         

            $("#leaveOrganization").show();
            
            var delOrgfromServerDB = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                               url: app.serverUrl() + "customer/unsubscribe/" + orgManageID + "/" + account_Id,
                                                                               type:"POST",
                                                                               dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                           }
                },
                                                                   schema: {                                
                    data: function(data) {
                        //console.log(data);
               
                        if (data.status[0].Msg==='Sucess') {                                                      
                            var db = app.getDb();
                            db.transaction(delOrgRelData, delOrgError, delOrgSuccess);                          
                        } 
                       
                        // console.log(groupDataShow);
                        return groupDataShow;
                    }                       
                },
                                                                   error: function (e) {
                                                                       $("#leaveOrganization").hide();
                                                                       
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                       
         
                                                                   }
	        
                                                               });         
             
            delOrgfromServerDB.read();  
        }
            
        function delOrgRelData(tx) {
            var query = "DELETE FROM JOINED_ORG where org_id=" + orgManageID;
            app.deleteQuery(tx, query);

            var query = "DELETE FROM ORG_NOTIFICATION where org_id=" + orgManageID;
            app.deleteQuery(tx, query);
        }

        function delOrgSuccess() {
            $("#leaveOrganization").hide();

            app.showAlert('Successfully Unsubscribe Organisation', 'Unsubscribe');
            app.callUserLogin();
        }

        function delOrgError(err) {
            //console.log(err);
        }
           
        var userProfileInt = function () {       
            
        };
        
        var userProfileShow = function() {
          document.getElementById("orgData").innerHTML = "";
          tempArray = [];
          $(".km-scroll-container").css("-webkit-transform", "");
          if (!app.checkConnection()) {
            if (!app.checkSimulator()) {                                                                     
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
            }else {              
                app.showAlert(app.INTERNET_ERROR , 'Offline');                   
            }              
            getProfileDataFromDB();  
          }else{
            getProfileImageFromLive();  
          } 
        };
            
        function getProfileDataFromDB(){
            var db = app.getDb();
            db.transaction(getProfileInfoDB, app.errorCB, getProfileDBSuccess);    
        }
                
        function getProfileImageFromLive(){
            $("#liveProfileLoader").show();
            $("#profileContent").hide();
            account_Id = localStorage.getItem("ACCOUNT_ID");            
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "customer/userProfile/" + account_Id,
                                                                            type:"POST",
                                                                            dataType: "json"
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
                                                                    $("#liveProfileLoader").hide(); 
                                                                    $("#profileContent").show();
                                                                    getProfileDataFromDB();
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var data = this.data();                                		                                  
                if (data[0]['status'][0].Msg==='Success') {
                            var UserProfileInformation=data[0]['status'][0].ProfileInfo[0];
                            saveProfileInfo(UserProfileInformation); 
                }    
            }); 
        }
        
        var profileInfoData;
        function saveProfileInfo(data) {
            profileInfoData = data; 
            var db = app.getDb();
            db.transaction(insertProfileInfo, app.errorCB, getProfileDataFromDB);            
        };
                                       
        var userAccountID;        
        function insertProfileInfo(tx) {
            var query = "DELETE FROM PROFILE_INFO";
            app.deleteQuery(tx, query);  
            
            var username = localStorage.getItem("username");           
            userAccountID = profileInfoData.account_id;            
            
            var query1 = 'INSERT INTO PROFILE_INFO(account_id , id  , email ,first_name ,last_name , mobile, add_date , mod_date , profile_image , login_status) VALUES ("'
                        + profileInfoData.account_id
                        + '","'
                        + profileInfoData.id
                        + '","'
                        + profileInfoData.email
                        + '","'
                        + profileInfoData.first_name
                        + '","'
                        + profileInfoData.last_name
                        + '","'
                        + username
                        + '","'
                        + profileInfoData.add_date
                        + '" ,"'
                        + profileInfoData.mod_date
                        + '" ,"'
                        + profileInfoData.photo
                        + '" ,"' + 1 + '")';              
            app.insertQuery(tx, query1);       
        }
        
        
            
        function getProfileInfoDB(tx) {
            var query = 'SELECT first_name , last_name , email , mobile , profile_image FROM PROFILE_INFO';
            app.selectQuery(tx, query, profileDataSuccess);
             
            var query1 = 'SELECT org_id , org_name , role FROM JOINED_ORG';
            app.selectQuery(tx, query1, orgDataSuccess);
             
            var query2 = 'SELECT org_id , org_name , role FROM JOINED_ORG_ADMIN';
            app.selectQuery(tx, query2, orgAdminDataSuccess);
            $("#liveProfileLoader").hide();
            $("#profileContent").show();
        }

        var fname;
        var lname;
        var email;
        var mobile;
        var lnameVal;
        var profileImage;
        
        function profileDataSuccess(tx, results) {
            var count = results.rows.length;
            if (count !== 0) {
                fname = results.rows.item(0).first_name;
                lname = results.rows.item(0).last_name;
                lnameVal = results.rows.item(0).last_name;
                email = results.rows.item(0).email;
                            
                if(email===null || email==="null" || email===''){
                    $("#emailToShow").hide();
                }else{
                    $("#emailToShow").show();
                }
                
                mobile = results.rows.item(0).mobile;
                profileImage = results.rows.item(0).profile_image; 

                var largeImage = document.getElementById('profilePhoto');                
                largeImage.src = "styles/images/profile-img.png";
                
                if (profileImage!==null && profileImage!=='' && profileImage!=='null') {
                    largeImage.src = profileImage;
                }else {
                    largeImage.src = "styles/images/profile-img.png"; 
                }
                
                var fnameLen = fname.length;
                var lnameLen = lname.length;

                var totalLen = fnameLen + lnameLen ;
                                
                if (totalLen > 30) {
                    lname = lname.substr(0, 1) + '..';
                }
                          
                $("#userEmailId").html(email); 
                $("#userMobileNo").html(mobile);
                $("#userlname").html(lname);
                $("#userfname").html(fname); 
            }
        }
        
        var tempArray = [];
        var adminOrg = 0; 
        function orgDataSuccess(tx, results) {    
            var count = results.rows.length;              	
            //alert(count);	
            document.getElementById("orgData").innerHTML = "";                    

            if (count !== 0) {                    
                document.getElementById("orgData").innerHTML = "";                    
                for (var x = 0; x < count;x++) {
                    //alert(JSON.stringify(tempArray));
                    var pos = $.inArray(results.rows.item(x).org_id, tempArray);
                    //console.log(pos);
                    var orgName = app.urldecode(results.rows.item(x).org_name); 
                    if (pos === -1) {
                        tempArray.push(results.rows.item(x).org_id);								                    
                        document.getElementById("orgData").innerHTML += '<ul><li>' + orgName + '</li></ul>' 
                    }
                }  
                adminOrg = 0;
            }else {
                tempArray = [];                    
                adminOrg = 1;
            } 
        }
        
        function orgAdminDataSuccess(tx, results) {    
            var count = results.rows.length;      	
            if (count !== 0) {                                        
                for (var x = 0; x < count;x++) {
                    var pos = $.inArray(results.rows.item(x).org_id, tempArray);
                    //console.log(pos);

                    var orgName = app.urldecode(results.rows.item(x).org_name); 

                    if (pos === -1) {
                        tempArray.push(results.rows.item(x).org_id);								                    
                        document.getElementById("orgData").innerHTML += '<ul><li>' + orgName + '</li></ul>' 
                    }
                }             
            }else {
                if (adminOrg===1) {
                    document.getElementById("orgData").innerHTML += '<ul><li>No Organization Added You</li></ul>'   
                }
            }        
        }

        function getProfileDBSuccess() {
            app.mobileApp.pane.loader.hide();
        }
            
        function OnImageLoad(evt) {
            var img = evt.currentTarget;

            // what's the size of this image and it's parent
            var w = $(img).width();
            var h = $(img).height();
            var tw = $(img).parent().width();
            var th = $(img).parent().height();

            // compute the new size and offsets
            var result = app.ScaleImage(w, h, tw, th, false);

            // adjust the image coordinates and size
            img.width = result.width;
            img.height = result.height;
            $(img).css("left", result.targetleft);
            $(img).css("top", result.targettop);
        };
                     
        var callOrganisationLogin = function() {
            //window.location.href = "views/organisationLogin.html"; 
            //console.log(account_Id);

            app.analyticsService.viewModel.trackFeature("User navigate to Admin Login Page");            

            app.mobileApp.navigate('views/organisationLogin.html?account_Id=' + account_Id);      
        };
    	         
        // Logout user
        var logout = function () {
            navigator.notification.confirm('Are you sure to Logout ?', function (checkLogout) {
                if (checkLogout === true || checkLogout === 1) {                    
                    setTimeout(function() {
                        var db = app.getDb();
                        db.transaction(updateLoginStatus, updateLoginStatusError, updateLoginStatusSuccess);
                    }, 100);
                }
            }, 'Logout', ['OK', 'Cancel']);
        };
            
        function updateLoginStatus(tx) {
            var query = "DELETE FROM PROFILE_INFO";
            app.deleteQuery(tx, query);

            var query = "DELETE FROM JOINED_ORG";
            app.deleteQuery(tx, query);
                
            var query = "DELETE FROM JOINED_ORG_ADMIN";
            app.deleteQuery(tx, query);

            var query = "DELETE FROM ORG_NOTIFICATION";
            app.deleteQuery(tx, query);
                
            var query = "DELETE FROM ORG_NOTI_COMMENT";
            app.deleteQuery(tx, query);
                
            var query = "DELETE FROM ADMIN_ORG";
            app.deleteQuery(tx, query);

            var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
            app.deleteQuery(tx, query);

            var query = "DELETE FROM ADMIN_ORG_GROUP";
            app.deleteQuery(tx, query);
                
            var query = 'UPDATE PROFILE_INFO SET login_status=0';
            app.updateQuery(tx, query);
        }

        function updateLoginStatusSuccess() {
            localStorage.setItem("loginStatusCheck", 0);

            window.location.href = "index.html";
        }

        function updateLoginStatusError(err) {
            //console.log(err);
        }
            
        var inAppBrowser = function() {
            window.open('http://www.sakshay.in', '_blank');
        };
                        
        var makeCall = function() {
            document.location.href = 'tel:+91-981-859-2244';
        };
       
        var about = function() {
            document.location.href = "#infoDiv";
        };
    
        var setting = function() {
            document.location.href = "#settingDiv";
        };       
        
        var settingShow = function() {                        
            var switchInstance = $("#event-switch").data("kendoMobileSwitch");
            //console.log(switchInstance.check());
            
            var checkVal = localStorage.getItem("eventSwitch");
                   
            if (checkVal===1 || checkVal==='1') {
                switchInstance.check(true);
            }
        }
        
        var onChangeEventSwitch = function(e) {
            //console.log(e.checked);//true of fals            
            if (e.checked===true) {
                syncCalendar();
                localStorage.setItem("eventSwitch", 1);
            }else {
                localStorage.setItem("eventSwitch", 0);
            }
        }
        
        
        var showAboutUs = function() {
        }
        
        var closeVersionPopUp = function() {
            $("#settingOptionDiv").show();   
            $("#appVersionDiv").hide();    
            $('#contentDiv').css('background-color', '#ffffff');
        }
        
        var newFName;
        var newLName;
        var newEmail;
      
        var editProfileFunc = function() {
            var account_Id = localStorage.getItem("ACCOUNT_ID");            
            var fname = $("#editFirstName").val();
            newFName = fname;
            var lname = $("#editLastName").val();
            newLName = lname;
            var email = $("#editEmail").val();
            newEmail = email;
            //console.log(account_Id + "||" + fname + "||" + lname + "||" + email);
            
            if (fname === "First Name" || fname === "") {
                app.showAlert("Please enter your First Name.", app.APP_NAME);
            /*} else if (app.ILLEGAL_CHARS.test(fname)) {
                app.showAlert("First Name contains illegal characters.", app.APP_NAME);*/ 
            }else if (lname === "Last Name" || lname === "") {
                app.showAlert("Please enter your Last Name.", app.APP_NAME);
            /*} else if (app.ILLEGAL_CHARS.test(lname)) {
                app.showAlert("Last Name contains illegal characters.", app.APP_NAME);*/    
            }/*else if (email === "Email" || email === "") {
                app.showAlert("Please enter your Email.", app.APP_NAME);
            }*/else if (email !== "Email" && email !== "" && !app.validateEmail(email)) {
                app.showAlert("Please enter a valid Email.", app.APP_NAME);
            }else {    
                //console.log(fname+"||"+lname+"||"+email+"||"+mobile+"||"+organisationID);  
                var jsonDataRegister;
                          
                jsonDataRegister = {"account_id":account_Id,"first_name":fname,"last_name":lname,"email":email}; 
       
                var dataSourceRegister = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "customer/editprofile",
                                                                                   type:"POST",
                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                   data: jsonDataRegister
                                                                               }
                    },
                                                                       schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];
                        }
                    },
                                                                       error: function (e) {
                                                                           //apps.hideLoading();
                                                                           //console.log(e);
                                                                          
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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    //console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        //console.log(loginData.status[0].Msg);
                               
                        if (loginData.status[0].Msg==='Profile Updated') {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Your profile was updated successfully');  
                            }else {
                                app.showAlert('Your profile was updated successfully' , 'Notification');  
                            }
                                                                                                   
                            //app.showAlert("Profile Updated", "Notification");
                            var db = app.getDb();
                            db.transaction(updateLocalDB, app.errorCB, afterUpdateProfile);                          
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            }
        };

        var updateLocalDB = function(tx) {
            var queryUpdate = "UPDATE PROFILE_INFO SET email='" + newEmail + "',first_name='" + newFName + "',last_name='" + newLName + "'";
            app.updateQuery(tx, queryUpdate);                            
        }
        
        var afterUpdateProfile = function() {
            app.mobileApp.navigate('#profileDiv');
        }
        
        var showCalendar = function() {
            /*if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }else {*/
                app.analyticsService.viewModel.trackFeature("User navigate to Calendar List Page");            
                app.mobileApp.navigate('views/eventCalendar.html'); 
            //}
        }
        
        var showOrgNews = function() {
            /*if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }else {*/
                app.analyticsService.viewModel.trackFeature("User navigate to News List Page");            
                app.mobileApp.navigate('views/organizationNews.html?orgManageID=' + orgManageID);
            //}            
        }
        
        var syncCalendar = function() {
            $("#savingDeviceCalenderLoader").show();
            var db = app.getDb();
            db.transaction(getProfileForEventInfoDB, app.errorCB, getProfileEventDBSuccess);
        }
                
        var success = function(message) {
            //console.log("Success: " + JSON.stringify(message));
        };
        
        var error = function(message) {
            //console.log("Error: " + message);
        };
                 
        function getProfileForEventInfoDB(tx) {
            var query = 'SELECT org_id , org_name , role FROM JOINED_ORG';
            app.selectQuery(tx, query, orgDataEventSuccess);
             
            var query = 'SELECT org_id , org_name , role FROM JOINED_ORG_ADMIN';
            app.selectQuery(tx, query, orgAdminDataEventSuccess);

            var query = 'SELECT * FROM EVENT';
            app.selectQuery(tx, query, orgEventDelete);
        }
        
        var tempArrayEvent = [];
        var adminOrg = 0; 
        
        function orgDataEventSuccess(tx, results) {    
            var count = results.rows.length;              	
            if (count !== 0) {                    
                tempArrayEvent = [];
                for (var x = 0; x < count;x++) {
                    var pos = $.inArray(results.rows.item(x).org_id, tempArrayEvent);
                    //console.log(pos);
                    if (pos === -1) {
                        tempArrayEvent.push(results.rows.item(x).org_id);								                    
                    }
                } 
            }else {
                tempArrayEvent = [];                    
            } 
  
            //console.log('---------Array Value1------------');
            //console.log(tempArrayEvent);
        }
        
        function orgAdminDataEventSuccess(tx, results) {    
            var count = results.rows.length;      	
            if (count !== 0) {                                        
                for (var x = 0; x < count;x++) {
                    var pos = $.inArray(results.rows.item(x).org_id, tempArrayEvent);
                    //console.log(pos);
                    if (pos === -1) {
                        tempArrayEvent.push(results.rows.item(x).org_id);								                    
                    }
                }             
            }   
            //console.log('---------Array Value2------------');
           // console.log(tempArrayEvent);
        }
        
        function orgEventDelete(tx, results) {             
            var count = results.rows.length;      	
            //console.log("localDBStorage---" + count);
            if (count !== 0) {                                        
                for (var x = 0; x < count;x++) {
                    var title = results.rows.item(x).title ;
                    var location = results.rows.item(x).location ;
                    var notes = results.rows.item(x).notes ;
                    var eventDaya = results.rows.item(x).startDate ;
                    var eventTime = results.rows.item(x).startTime ;
                                  
                    //console.log(eventTime);
                    var values = eventDaya.split('-');
                    var year = values[0]; // globle variable
                    var month = values[1];
                    var day = values[2];
                                  
                    var valueTime = eventTime.split(':');            
                    var Hour = valueTime[0]; // globle variable            
                    var Min = valueTime[1];        
                    var sec = valueTime[2];
            
                    var endHour = 23;
                    var endMin = 59;
                    var endSec = 0;
                                                                                                             
                    var start = new Date(year + "/" + month + "/" + day + " " + Hour + ":" + Min + ":" + sec);      
                    //var start = new Date(2015,0,1,20,0,0,0,0);
                    var end = new Date(year + "/" + month + "/" + day + " " + endHour + ":" + endMin + ":" + endSec);
                    //var end = new Date(2015,0,1,22,0,0,0,0); 

                    //console.log(start+"||"+end+"||"+title+"||"+location+"||"+notes);
                        
                    //console.log("--------------------delete-----------------");
                        
                    window.plugins.calendar.deleteEvent(title, location, notes, start, end, success, error);
                }             
            }        
        }
        
        function getProfileEventDBSuccess(tx, results) {
                        
            var deviceName = app.devicePlatform();
            var deviceVersion = device.version;
            
            //console.log(deviceName + "||" + deviceVersion);
            
            var calendarName = "Aptifi";
            var cal = window.plugins.calendar;
            
            var orgListLength = tempArrayEvent.length;
            //console.log(orgListLength);
            
            if (deviceName==='iOS') {
                cal.deleteCalendar(calendarName, success, error);    
                var options = cal.getCreateCalendarOptions();
                options.calendarName = calendarName;
                options.calendarColor = "#FF0000"; // passing null make iOS pick a color for you
                cal.createCalendar(options, success, error);         
            }            
        
            var jsonDataLogin = {"org_id":tempArrayEvent}         
            //console.log(tempArrayEvent);
            //alert(tempArrayEvent);
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "event/customerEvent",
                                                                            type:"POST",
                                                                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                            data: jsonDataLogin
                                                                        }
                },
                                                                schema: {
                    data: function(data) {	
                        //console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(e);              
                                                                    $("#savingDeviceCalenderLoader").hide();

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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }                             
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var loginDataView = dataSourceLogin.data();               
                //console.log(loginDataView);
                var orgDataId = [];
                var userAllGroupId = [];
                var orgEventData;			   
                $.each(loginDataView, function(i, loginData) {
                   
                    //alert(loginData.status[0].Msg);
                               
                    if (loginData.status[0].Msg==='No Event list') {
                        
                        $("#savingDeviceCalenderLoader").hide();

                        if (!app.checkSimulator()) {
                        
                            window.plugins.toast.showShortBottom('No event list to sync');  
                            
                        }else {
                        
                            app.showAlert('No event list to sync' , 'Notification');  
                            
                        }               


                    }else if (loginData.status[0].Msg==='Success') {
                        if (loginData.status[0].eventData.length!==0) {
                            var eventListLength = loginData.status[0].eventData.length;
                                                                                          
                            for (var i = 0 ; i < eventListLength ;i++) {
                                var eventDaya = loginData.status[0].eventData[i].event_date;
                                var eventTime = loginData.status[0].eventData[i].event_time;
                                  
                                //console.log(eventTime);
                                var values = eventDaya.split('-');
                                var year = values[0]; // globle variable
                                var month = values[1];
                                var day = values[2];
                                  
                                /*console.log('------------------date=---------------------');
                                console.log(year+"||"+month+"||"+day);
                                  
                                tasks[+new Date(year+"/"+month+"/"+day)] = "ob-done-date";
                                  
                                console.log(tasks);
                                  
                                //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                                if(day<10){
                                day = day.replace(/^0+/, '');                                     
                                }
                                var saveData = month+"/"+day+"/"+year;
                                */

                                var valueTime = eventTime.split(':');            
                                var Hour = valueTime[0]; // globle variable            
                                var Min = valueTime[1];        
                                var sec = valueTime[2];
            
                                var endHour = 23;
                                var endMin = 59;
                                var endSec = 0;
                                                                                                             
                                var start = new Date(year + "/" + month + "/" + day + " " + Hour + ":" + Min + ":" + sec);      
                                //var start = new Date(2015,0,1,20,0,0,0,0);
                                var end = new Date(year + "/" + month + "/" + day + " " + endHour + ":" + endMin + ":" + endSec);
                                //var end = new Date(2015,0,1,22,0,0,0,0); 

                                var title = loginData.status[0].eventData[i].event_name;
                                var location = 'India';
                                var notes = loginData.status[0].eventData[i].event_desc;

                                //console.log(start + "||" + end + "||" + title + "||" + location + "||" + notes);
                                  
                                if (deviceName==='Android') {
                                    cal.createEvent(title, location, notes, start, end, success, error);
                                }else if (deviceName==='iOS') {
                                    //console.log("-----------------insert--------------------");
                                    cal.createEvent(title, location, notes, start, end, success, error);
                                    //cal.createEventInNamedCalendar(title,location,notes,start,end,calendarName,success,error);            
                                }
                                //cal.findAllEventsInNamedCalendar(calendarName, success, error);
                            }
                        } 

                        orgEventData = loginData.status[0].eventData;
                        saveOrgEvents(orgEventData);
                    }                
                });
            });
        }
         
        var orgEventDataVal;        
        function saveOrgEvents(data) {
            orgEventDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgEventData, app.errorCB, showAlertToComplete);
        };
             
        function insertOrgEventData(tx) {
            var query = "DELETE FROM EVENT";
            app.deleteQuery(tx, query);

            var dataLength = orgEventDataVal.length;
         
            var orgData;        
            var orgLastMsg;

            for (var i = 0;i < dataLength;i++) {    
                var query = 'INSERT INTO EVENT(title ,location ,notes ,startDate ,endDate,startTime,endTime) VALUES ("'
                            + orgEventDataVal[i].event_name
                            + '","'
                            + 'India'
                            + '","'
                            + orgEventDataVal[i].event_desc
                            + '","'
                            + orgEventDataVal[i].event_date
                            + '","'
                            + ''
                            + '","'
                            + orgEventDataVal[i].event_time
                            + '","'
                            + ''
                            + '")';              
                app.insertQuery(tx, query);
            }   
        }
        
        function showAlertToComplete() {
            $("#savingDeviceCalenderLoader").hide();                        
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Successfully synchronized with device calendar');           
            }else {
                app.showAlert('Successfully synchronized with device calendar', 'Notification');            
            }               
        }
        
        var takeProfilePhoto = function() {
            navigator.camera.getPicture(onProfilePhotoURISuccess, onFail, { 
                                            quality: 40,
                                            targetWidth: 150,
                                            targetHeight: 150,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true
                                        });
        };
        
        var selectProfilePhoto = function() {
            navigator.camera.getPicture(onProfilePhotoURISuccess, onFail, { 
                                            quality: 40,
                                            targetWidth: 150,
                                            targetHeight: 150,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };

        var profileImagePath;        
        function onProfilePhotoURISuccess(imageURI) {
            var largeImage = document.getElementById('profilePhoto');
            largeImage.src = imageURI;
            profileImagePath = imageURI;
               
            
            sendImageToServer(imageURI);
            
            //var db = app.getDb();
            //db.transaction(updateProfilePic, app.errorCB, app.successCB);   
        }
        
        
        function sendImageToServer(imageURI){                
              if(imageURI===''){
                var jsonDataRegister;                              
                jsonDataRegister = {"account_id":account_Id,"first_name":fname,"last_name":lname,"email":email,"profile_pic":imageURI}; 
       
                var dataSourceRegister = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "customer/editprofile",
                                                                                   type:"POST",
                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                   data: jsonDataRegister
                                                                               }
                    },
                                                                       schema: {
                        data: function(data) {
                            console.log(data);
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
                                                                              app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                          }
                                                                                                                                                                    
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    $.each(loginDataView, function(i, loginData) {
                        //console.log(loginData.status[0].Msg);      
                        if (loginData.status[0].Msg==='Profile Updated') {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Your profile image was updated successfully');  
                            }else {
                                app.showAlert('Your profile image was updated successfully' , 'Notification');  
                            }
                            var db = app.getDb();
                            db.transaction(updateProfilePic, app.errorCB, app.successCB);                               
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
              }else{
                   $("#liveProfileLoader").show();
                   if(imageURI.substring(0, 21)==="content://com.android"){
                        var photo_split = imageURI.split("%3A");
                        imageURI = "content://media/external/images/media/" + photo_split[1];
                    }   
              
                    var filename = imageURI.substr(imageURI.lastIndexOf('/') + 1);                                                
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                

                    var params = new Object();
                    params.account_id = account_Id;  //you can send additional info with the file
                    params.first_name = fname;
                    params.last_name = lname;
                    params.email = email;
                   
                    var ft = new FileTransfer();
                    var options = new FileUploadOptions();          
                    options.fileKey = "profile_pic";
                    options.fileName = filename;  
                    options.mimeType = "image/jpeg";
                    options.params = params;
                    options.chunkedMode = false;
                    options.headers = {
                        Connection: "close"
                    };     
              
                    //alert(filename+"||"+memberSelectedPhoto);
                    ft.upload(imageURI, app.serverUrl() + "customer/editprofile", profilePicWin, profilePicFail, options , true);
              }  
        }

        function profilePicWin(r){                      
            if (!app.checkSimulator()) {
                 window.plugins.toast.showShortBottom('Your profile image was updated successfully.');  
            }else {
                 app.showAlert('Your profile image was updated successfully.' , 'Notification');  
            }

            var db = app.getDb();
            db.transaction(updateProfilePic, app.errorCB, app.successCB);
            $("#liveProfileLoader").hide();
        }
        
        function profilePicFail(e){
            $("#liveProfileLoader").hide();
            if (!app.checkSimulator()) {
                 window.plugins.toast.showShortBottom('Operation Failed. Please try again.');  
            }else {
                 app.showAlert('Operation Failed. Please try again.' , 'Notification');  
            }
        }
        
        
        function updateProfilePic(tx) {       
            var query = "UPDATE PROFILE_INFO SET profile_image='" + profileImagePath + "'";
            app.updateQuery(tx, query);
        }
        
        var resetProfilePhoto = function() {
            var largeImage = document.getElementById('profilePhoto');
            largeImage.src = "styles/images/profile-img.png";
            profileImagePath='';                           
            sendImageToServer(profileImagePath);            
            var db = app.getDb();
            db.transaction(resetProfilePic, app.errorCB, app.successCB);    
        }
        
        function resetProfilePic(tx) {       
            var query = "UPDATE PROFILE_INFO SET profile_image='null'";
            app.updateQuery(tx, query);
        }
        
        function onFail(message) {
            //console.log('Failed because: ' + message);
            $("#removeEventAttachment").hide(); 
            $("#attachedImgEvent").hide();
        }
        
        var openPopoverDrawer = function(){
            app.mobileApp.navigate('#versionView');            
        }
        
        var appVersion = function() {
            var value = localStorage.getItem("AppVersion");
            $("#appVersionPop").html(value);
            $("#appNameBarId").html(app.APP_NAME);
        }

        return {
            organisationSelected: organisationSelected,
            takeProfilePhoto:takeProfilePhoto,
            selectProfilePhoto:selectProfilePhoto,            
            resetProfilePhoto:resetProfilePhoto,
            openPopoverDrawer:openPopoverDrawer,
            appVersion:appVersion,
            orgMoreInfoSelected:orgMoreInfoSelected,
            groupSelected:groupSelected,
            settingShow:settingShow,
            //afterShow:afterShow,
            showOrgInfoPage:showOrgInfoPage,
            notificationSelected:notificationSelected,
            //CreatedAtFormatted:CreatedAtFormatted,          
            showCalendar:showCalendar,
            showOrgNews:showOrgNews,
            manageGroup:manageGroup,
            about:about,
            setting:setting,
            inAppBrowser:inAppBrowser,  
            makeCall:makeCall,
            OnImageLoad:OnImageLoad,
            replyUser:replyUser,
            userProfileInt:userProfileInt,
            sendNotification:sendNotification,
            userProfileShow:userProfileShow,
            orgShow:orgShow,
            info:info,
            init:init,
            showAboutUs:showAboutUs,
            onChangeEventSwitch:onChangeEventSwitch,
            gobackOrgMainPage:gobackOrgMainPage,
            syncCalendar:syncCalendar,
            show:show,
            callOrganisationLogin:callOrganisationLogin,
            refreshButton:refreshButton,
            unsubscribeOrg:unsubscribeOrg,
            editProfileFunc:editProfileFunc,
            editProfilePage:editProfilePage,
            editProfileShow:editProfileShow,
            closeVersionPopUp:closeVersionPopUp,
            orgDescMainPage:orgDescMainPage,
            logout: logout
        };
    }());

    return organisationViewModel;
}());