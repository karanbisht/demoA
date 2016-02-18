var app = app || {};

app.adminOragnisationList = (function () {
    'use strict'
  
    var account_Id;
    
    var organisationViewModel = (function () {
        var beforeShow = function() {
            var db = app.getDb();
            db.transaction(getDataOrg, app.errorCB, showLiveData);   
        };
    
        var getDataOrg = function(tx) {
            var query = "SELECT * FROM ADMIN_ORG";
            app.selectQuery(tx, query, getDataSuccess);
            
            var db = app.getDb();
            db.transaction(updateProfileTab, app.errorCB, app.successCB);
        };
        
        var updateProfileTab = function(tx) {
            var query = 'UPDATE PROFILE_INFO SET Admin_login_status=1';
            app.updateQuery(tx, query);
        };
            
        var groupDataShow = [];
        var totalCount = 0;
        var bagCount = 0;
        var bagCount1 = 0;
            
        //var ShowBagCount = 0;    
        
        function getDataSuccess(tx, results) {                        
            groupDataShow = [];
            
            var count = results.rows.length;                    		            
            if (count !== 0) {                
                for (var i = 0 ; i < count ; i++) {                
                    totalCount = results.rows.item(i).count + totalCount;                        
                    bagCount1 = results.rows.item(i).bagCount;                        
                    if (bagCount1===null || bagCount1==="null") {
                        bagCount1 = 0;
                    }
                        
                    bagCount = bagCount1 + bagCount;
                    groupDataShow.push({
                                           orgName: results.rows.item(i).org_name,
                                           orgDesc: results.rows.item(i).orgDesc,
                                           organisationID:results.rows.item(i).org_id,
                                           org_logo:results.rows.item(i).imageSource,
                                           imageSource:results.rows.item(i).imageSource,
                                           count:results.rows.item(i).count					
                                       });
                }
                //ShowBagCount = totalCount - bagCount;
                //tabstrip1.badge(1, ShowBagCount);
            }else {
                totalCount = 0;
                groupDataShow.push({
                                       orgName: 'No Organization',
                                       orgDesc: 'You are not a Member of any organization',
                                       organisationID:'0',
                                       org_logo:null,
                                       imageSource:null,
                                       count : 0    
                                   });          
            }
        }               
            
        var showLiveData = function() {
            app.hideAppLoader();
                 
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });           
                
            $("#admin-org-listview").kendoMobileListView({
                                                             template: kendo.template($("#adminOrganisationTemplate").html()),    		
                                                             dataSource: organisationListDataSource
                                                         });
               
            app.hideAppLoader();
            $('#admin-org-listview').data('kendoMobileListView').refresh();
               
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }
        };
            
        var init = function() {
        };

        var show = function(e) {
            localStorage.setItem("loginStatusCheck", 2);
            groupDataShow = [];
            joinOrgID = []; 
             
            totalCount = 0;
            bagCount = 0;
            bagCount1 = 0;
  
            $(".km-scroll-container").css("-webkit-transform", "");
            app.showAppLoader();
            account_Id = localStorage.getItem("ACCOUNT_ID");

            var organisationListDataSource = new kendo.data.DataSource({
                                                                           transport: {
                    read: {
                                                                                       url: app.serverUrl() + "organisation/managableOrg/" + account_Id + "/" + app.CLIENT_APP_ID,
                                                                                       type:"POST",
                                                                                       dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                   }
                },
                                                                           schema: {                                
                    data: function(data) {	
                        $.each(data, function(i, groupValue) {
                            if (groupValue[0].Msg ==='No Orgnisation to manage') {     
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom('No Organization to Manage.');  
                                }else {
                                    app.showAlert('No Organization to Manage.' , 'Notification');  
                                }
                                app.mobileApp.navigate('#organisationNotiList');
                            }else if (groupValue[0].Msg==='Success') {
                                var adminOrgInformation = groupValue[0].orgData;
                                var adminIncomMsg = groupValue[0].last;
                                saveAdminOrgInfo(adminOrgInformation , adminIncomMsg); 
                            }
                        });
                        return [data];
                    }                                                            
                },
                                                                           error: function (e) {
                                                                               app.hideAppLoader();             
                                                                               beforeShow();
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
            });
        };
                        
        var adminOrgProfileData;        
        var adminIncomMsgData;  
            
        function saveAdminOrgInfo(data1 , data2) {
            adminOrgProfileData = data1;  
            adminIncomMsgData = data2;

            var db = app.getDb();
            db.transaction(getAdminOrgIdFmDB, app.errorCB, nowGetLiveData);        
        };

        var userOrgIdArray = [];

        var joinOrgID = [];
                    
        var getAdminOrgIdFmDB = function(tx) {
            var query = 'SELECT org_id FROM ADMIN_ORG';
            app.selectQuery(tx, query, getOrgDataSuccess);   
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
            
        var nowGetLiveData = function() {       
            var db = app.getDb();
            db.transaction(insertAdminOrgInfo, app.errorCB, beforeShow);
        } 

        function insertAdminOrgInfo(tx) {
            userOrgIdArray = [];

            var dataLength = adminOrgProfileData.length;
          
            for (var i = 0;i < dataLength;i++) {       
                userOrgIdArray.push(parseInt(adminOrgProfileData[i].organisationID));
                adminOrgProfileData[i].organisationID = parseInt(adminOrgProfileData[i].organisationID);

                var pos = $.inArray(parseInt(adminOrgProfileData[i].organisationID), joinOrgID);           
		  
                if (pos === -1) {              
                    joinOrgID.push(adminOrgProfileData[i].organisationID);      

                    var first_login = localStorage.getItem("ADMIN_FIRST_LOGIN");

                    if (first_login===0) {
                        var query = 'INSERT INTO ADMIN_ORG(org_id , org_name , role , imageSource ,orgDesc , count) VALUES ("'
                                    + adminOrgProfileData[i].organisationID
                                    + '","'
                                    + adminOrgProfileData[i].org_name
                                    + '","'
                                    + adminOrgProfileData[i].role
                                    + '","'
                                    + adminOrgProfileData[i].org_logo
                                    + '","'
                                    + adminOrgProfileData[i].org_desc
                                    + '","'
                                    + adminIncomMsgData[i].total    
                                    + '")';              
                        app.insertQuery(tx, query);
                    }else {               
                        localStorage.setItem("ADMIN_FIRST_LOGIN", 0); 
               
                        var query = 'INSERT INTO ADMIN_ORG(org_id , org_name , role , imageSource ,orgDesc , count ,bagCount) VALUES ("'
                                    + adminOrgProfileData[i].organisationID
                                    + '","'
                                    + adminOrgProfileData[i].org_name
                                    + '","'
                                    + adminOrgProfileData[i].role
                                    + '","'
                                    + adminOrgProfileData[i].org_logo
                                    + '","'
                                    + adminOrgProfileData[i].org_desc
                                    + '","'
                                    + adminIncomMsgData[i].total    
                                    + '","'
                                    + adminIncomMsgData[i].total    
                                    + '")';              
                        app.insertQuery(tx, query);
                    }    
                }else {        
                    var queryUpdate = "UPDATE ADMIN_ORG SET org_name='" + adminOrgProfileData[i].org_name + "',orgDesc='" + adminOrgProfileData[i].org_desc + "',imageSource='" + adminOrgProfileData[i].org_logo + "',count='" + adminIncomMsgData[i].total + "' where org_id=" + adminOrgProfileData[i].organisationID;
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
                var dataVal = userOrgIdArray.indexOf(joinOrgID[i]);
            
                if (dataVal===-1) {
                    orgIdToDel = joinOrgID[i];
                    var db = app.getDb();
                    db.transaction(delOrgDataId, app.errorCB, app.successCB);                          
                } 
            }            
        }

        function delOrgDataId(tx) {
            var query = "DELETE FROM ADMIN_ORG where org_id=" + orgIdToDel;
            app.deleteQuery(tx, query);
             
            var query = "DELETE FROM ADMIN_ORG_NOTIFICATION where org_id=" + orgIdToDel;
            app.deleteQuery(tx, query);
        } 
    
        var organisationSelected = function (e) {
            var organisationID = e.data.organisationID;
            localStorage.setItem("orgSelectAdmin", organisationID);
            localStorage.setItem("orgNameAdmin", e.data.orgName);
            localStorage.setItem("orgDescAdmin", e.data.orgDesc);

            //app.analyticsService.viewModel.trackFeature("User navigate to Organization Detail View in Admin");            

            app.mobileApp.navigate('views/groupDetailView.html');
        };
        
        var groupSelected = function (e) {
            app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        };
        
        var notificationSelected = function (e) {
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };
        
        var manageGroup = function() {
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var orgShow = function() {
            var orgDataSource = [];   
            var userOrgName = localStorage.getItem("userOrgName"); 
            
            orgDataSource.push({userOrgName:userOrgName});                                   
          
            $("#organisation-listview").kendoMobileListView({
                                                                template: kendo.template($("#orgTemplate").html()),    		
                                                                dataSource: orgDataSource
                                                            });
        };
	           
        var initNotifi = function () {       
        };
        
        var showNotifi = function() {
            $("#orgData").val('');
            $("#groupData").val('');
            
            var userlName = localStorage.getItem("userlName");
            var userfName = localStorage.getItem("userfName");
            var userEmail = localStorage.getItem("userEmail");
            var userGropuName = localStorage.getItem("userGropuName"); 
            var userOrgName = localStorage.getItem("userOrgName");
            var userMobile = localStorage.getItem("userMobile");
            
            $("#userEmailId").html(userEmail); 
            $("#userMobileNo").html(userMobile);
            $("#userlname").html(userlName);
            $("#userfname").html(userfName); 
             
            for (var x = 0; x < userOrgName.length;x++) {
                document.getElementById("orgData").innerHTML += userOrgName[x];   
            } 
            
            for (var y = 0; y < userGropuName.length;y++) {
                document.getElementById("groupData").innerHTML += userGropuName[y];
            }
        };
            
        var callOrganisationLogin = function() {
            app.mobileApp.navigate('views/organisationLogin.html?account_Id=' + account_Id);      
        };
    	                 
        var logout = function () {                   
            navigator.notification.confirm('Are you sure to Logout from Admin Panel ?', function (checkLogout) {
                if (checkLogout === true || checkLogout === 1) {                    
                    //app.mobileApp.pane.loader.show();    
                    setTimeout(function() {
                        var db = app.getDb();
                        db.transaction(updateAdminLoginStatus, updateAdminLoginStatusError, updateAdminLoginStatusSuccess);
                        //window.location.href = "index.html";
                    }, 100);
                }
            }, 'Logout', ['OK', 'Cancel']);
        };
            
        function updateAdminLoginStatus(tx) {
            /*var query = "DELETE FROM ADMIN_ORG";
            app.deleteQuery(tx, query);
            var query = "DELETE FROM ADMIN_ORG_NOTIFICATION";
            app.deleteQuery(tx, query);
            var query = "DELETE FROM ADMIN_ORG_GROUP";
            app.deleteQuery(tx, query);*/
            var query = 'UPDATE PROFILE_INFO SET Admin_login_status=0';
            app.updateQuery(tx, query);
        }

        function updateAdminLoginStatusSuccess() {
            app.mobileApp.navigate('#organisationNotiList');
        }

        function updateAdminLoginStatusError(err) {
        }

        function listViewClick(e) {
        }

        return {
            organisationSelected: organisationSelected,
            groupSelected:groupSelected,
            notificationSelected:notificationSelected,
            manageGroup:manageGroup,
            initNotifi:initNotifi,
            showNotifi:showNotifi,
            orgShow:orgShow,
            listViewClick:listViewClick,
            init:init,
            beforeShow:beforeShow,
            show:show,
            callOrganisationLogin:callOrganisationLogin,
            logout: logout
        };
    }());

    return organisationViewModel;
}());