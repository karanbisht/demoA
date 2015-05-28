var app = app || {};


app.adminOragnisationList = (function () {
    'use strict'
    //var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 
    var activitiesDataSource;   
 
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
            
        var ShowBagCount = 0;    
        
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
                   
                ShowBagCount = totalCount - bagCount;
                //tabstrip1.badge(1, ShowBagCount);
            }else {
                totalCount = 0;
                groupDataShow.push({
                                       orgName: 'Welcome to Zaffio',
                                       orgDesc: 'You are not a Member of any organization',
                                       organisationID:'0',
                                       org_logo:null,
                                       imageSource:null,
                                       count : 0    
                                   });          
            }
        }               
            
        var showLiveData = function() {

            $("#progressAdmin").hide();
                
            //alert('LiveShow');
                 
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });           
                
            $("#admin-org-listview").kendoMobileListView({
                                             template: kendo.template($("#adminOrganisationTemplate").html()),    		
                                             dataSource: organisationListDataSource
                                       });
               
            $("#progressAdmin").hide();
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
            app.MenuPage = false;
            app.userPosition = false;
        };

        var show = function(e) {
            localStorage.setItem("loginStatusCheck", 2);
            groupDataShow = [];
            joinOrgID = []; 
             
            totalCount = 0;
            bagCount = 0;
            bagCount1 = 0;
  
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#progressAdmin").show();             
            account_Id = localStorage.getItem("ACCOUNT_ID");

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
                        var datacheck = 0;
                        var allData = 0;
                       
                        //return [data];
                       
                        $.each(data, function(i, groupValue) {
                            //alert("IN");
                            //console.log(groupValue);   
                            if (groupValue[0].Msg ==='No Orgnisation to manage') {     
                                //beforeShow();
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom('No Organization to Manage.');  
                                }else {
                                    app.showAlert('No Organization to Manage.' , 'Notification');  
                                }
                                app.mobileApp.navigate('#organisationNotiList');
                                
                            }else if (groupValue[0].Msg==='Success') {
                                //console.log(groupValue[0].orgData.length);  
                                var adminOrgInformation = groupValue[0].orgData;
                                var adminIncomMsg = groupValue[0].last;
                                saveAdminOrgInfo(adminOrgInformation , adminIncomMsg); 
                            }
                        });
                        return [data];
                    }                                                            
                },
                                                                           error: function (e) {
                                                                               //console.log(e);
                                                                               //console.log(JSON.stringify(e));
                                                                               $("#progressAdmin").hide();             

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
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                           }	        
                                                                       });
                        
            organisationListDataSource.fetch(function() {
                /*
                var loginAdminDataView = organisationListDataSource.data();
                $.each(loginAdminDataView, function(i, groupValue) {
                console.log(groupValue);                                     
                if(groupValue.status[0].Msg ==='Not a customer to any organisation'){     
                }else if(groupValue.status[0].Msg==='Success'){
                console.log(groupValue.status[0].orgData.length);  
                var adminOrgInformation = groupValue.status[0].orgData;
                saveAdminOrgInfo(adminOrgInformation); 
                }
                });
                */
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
            //alert('insertDB');
            
            userOrgIdArray = [];
            //var query = "DELETE FROM ADMIN_ORG";
            //app.deleteQuery(tx, query);

            //console.log(adminOrgProfileData);

            var dataLength = adminOrgProfileData.length;
            //console.log(dataLength);

            //alert(dataLength);
          
            //console.log(joinOrgID);
          
            for (var i = 0;i < dataLength;i++) {       
                userOrgIdArray.push(parseInt(adminOrgProfileData[i].organisationID));
             
                //console.log(adminOrgProfileData[i].organisationID);
                adminOrgProfileData[i].organisationID = parseInt(adminOrgProfileData[i].organisationID);

                var pos = $.inArray(parseInt(adminOrgProfileData[i].organisationID), joinOrgID);           
		  
                //alert(JSON.stringify(joinOrgID));
                //alert(JSON.stringify(parseInt(adminOrgProfileData[i].organisationID)));
         
                if (pos === -1) {              
                    //alert("insert");
                    joinOrgID.push(adminOrgProfileData[i].organisationID);      

                    var first_login = localStorage.getItem("ADMIN_FIRST_LOGIN");
                    alert(first_login);

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
                    //alert("update");
                    // alert(adminOrgProfileData[i].org_name);               
                    var queryUpdate = "UPDATE ADMIN_ORG SET org_name='" + adminOrgProfileData[i].org_name + "',orgDesc='" + adminOrgProfileData[i].org_desc + "',imageSource='" + adminOrgProfileData[i].org_logo + "',count='" + adminIncomMsgData[i].total + "' where org_id=" + adminOrgProfileData[i].organisationID;
                    app.updateQuery(tx, queryUpdate);                                        
                }                      
            }            
            checkDeletedData();
        }         
            
        var orgIdToDel;
        var checkDeletedData = function() {
            var liveIdLength;
            var dbIdLength;
            
            liveIdLength = userOrgIdArray.length;
            dbIdLength = joinOrgID.length;
            
            //alert(JSON.stringify(userOrgIdArray));
            
            for (var i = 0;i < dbIdLength;i++) {
                //alert(JSON.stringify(joinOrgID[i]));
                var dataVal = userOrgIdArray.indexOf(joinOrgID[i]);
                //alert(dataVal);
                //var pos = $.inArray(joinOrgID[i], userLiveOrgIdArray[j]);           
  
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
            
        /*var offlineQueryDB = function(tx){
        var query = 'SELECT * FROM GetNotification';
        app.selectQuery(tx, query, offlineTestQuerySuccess);
        };
        
        var offlineTestQuerySuccess = function(tx, results) {
        $("#activities-listview").empty();
        var count = results.rows.length;
        if (count !== 0) {
        for (var i = 0; i < count; i++) {
        var Title = results.rows.item(i).Title;
        var Message = results.rows.item(i).Message;
        var CreatedAt = results.rows.item(i).CreatedAt; 
        var template;
                    
        //if(i===0){
        //  template = kendo.template($("#activityTemplate").html());
        //	 $("#activities-listview").html(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
        //    $("#activities-listview").on('click', offlineActivitySelected);
        //}else{

        template = kendo.template($("#activityTemplate").html());
        $("#activities-listview").append(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
        kendo.bind($('#activityTemplate'), activitiesDataSource);
        //}
        }
        }else{
        $("#activities-listview").html("You are Currently Offline and data not available in local storage");
        }
        };
                 
        var CreatedAtFormatted = function(value){
        return app.helper.formatDate(value);
        };

        var offlineQueryDBSuccess = function(){
        console.log("Query Success");
        };
        */
    
        var organisationSelected = function (e) {
            var organisationID = e.data.organisationID;
            //uid=' + e.data.uid
            app.MenuPage = false;
            localStorage.setItem("orgSelectAdmin", organisationID);
            localStorage.setItem("orgNameAdmin", e.data.orgName);
            localStorage.setItem("orgDescAdmin", e.data.orgDesc);

            //app.mobileApp.navigate('views/groupDetailView.html?organisationID=' + organisationID + '&account_Id=' + account_Id + '&orgName=' + e.data.orgName + '&orgDesc=' + e.data.orgDesc);

            app.analyticsService.viewModel.trackFeature("User navigate to Organization Detail View in Admin");            

            app.mobileApp.navigate('views/groupDetailView.html');
            //app.slide('left', 'green' ,'3' ,'#views/groupDetailView.html');    

        };
        
        var groupSelected = function (e) {
            //console.log("karan Bisht" + e);
            app.MenuPage = false;	
            app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        };
         
        var offlineActivitySelected = function (i) {
            //console.log(i);
            app.MenuPage = false;	
            //console.log("click");
            //app.mobileApp.navigate('views/activityView.html?uid=' + e.data.uid);
        };
        
        var notificationSelected = function (e) {
            app.MenuPage = false;	
            //alert(e.data.uid);
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };

        // Navigate to app home
        var navigateHome = function () {
            app.MenuPage = false;
            app.mobileApp.navigate('#welcome');
        };
        
        var inAppBrowser = function() {
            app.MenuPage = false;
            window.open('http://www.sakshay.in', '_blank');
        };
                        
        var makeCall = function() {
            app.MenuPage = false;
            document.location.href = 'tel:+91-971-781-8898';
        };
       
        var about = function() {
            app.MenuPage = false;
            //document.location.href="#view-all-notification";
            //document.location.href="views/MessageChatLayout.html";
            document.location.href = "#infoDiv";
        };
        
        var manageGroup = function() {
            app.MenuPage = false;	
            //app.mobileApp.pane.loader.show();
            
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var setting = function() {
            app.MenuPage = false;
            document.location.href = "#settingDiv";
        };       
              
        var refreshButton = function() {
        };
                
        var info = function() {
        };
        
        var orgShow = function() {
            app.MenuPage = false;
            
            var orgDataSource = [];   
            var userOrgName = localStorage.getItem("userOrgName"); 
            //console.log(userOrgName);
          
            //studentAnswerArray[i] = answerString.toString().split(',');
            
            orgDataSource.push({userOrgName:userOrgName});                                   
          
            $("#organisation-listview").kendoMobileListView({
                         template: kendo.template($("#orgTemplate").html()),    		
                         dataSource: orgDataSource
            });
        };

        // var onComboSelect = function() {
        // alert("combo");
        // var selectData = $("#groupSelect").data("kendoComboBox");
        //alert(selectData.value());
                 
        //var dataItem = this.dataItem(e.item.index());      
        //alert( dataItem.text + " : " + dataItem.value );
        /*  
                 
        $("#get").click(function() {
        var categoryInfo = "\nCategory: { id: " + categories.value() + ", name: " + categories.text() + " }",
        productInfo = "\nProduct: { id: " + products.value() + ", name: " + products.text() + " }",
        orderInfo = "\nOrder: { id: " + orders.value() + ", name: " + orders.text() + " }";

        alert("Order details:\n" + categoryInfo + productInfo + orderInfo);
        */
        //};
       
        var onChangeNotiGroup = function() {
            var selectDataNoti = $("#groupSelectNotification").data("kendoComboBox");    
            var groupSelectedNoti = selectDataNoti.value();
            return groupSelectedNoti;
        };
        
        var onAdminComboChange = function() {
            var selectData = $("#groupSelectAdmin").data("kendoComboBox");    
            var groupSelected = selectData.value();
            //var query = new Everlive.Query().where().equal('Group',groupSelected);
            //notificationModel();
        
            if (groupSelected==='All') {
                app.Activities.activities.filter({
							                	
                                                 });
            }else {		
                app.Activities.activities.filter({
                                                     field: 'Group',
                                                     operator: 'eq',
                                                     value: groupSelected
                                                 });
            }
            
            kendo.bind($('#activityTemplate'), activitiesDataSource);                              
        };
	    
        var onComboChange = function() {
            //$("#activities-listview").empty();
            //var activities;
            var selectData = $("#groupSelect").data("kendoComboBox");    
            var groupSelected = selectData.value();
            //var query = new Everlive.Query().where().equal('Group',groupSelected);
            //notificationModel();
        
            if (groupSelected==='All') {
                app.Activities.activities.filter({
							                	
                                 
                                                 });
            }else {		
                app.Activities.activities.filter({
                                                     field: 'Group',
                                                     operator: 'eq',
                                                     value: groupSelected
                                                 });
            }

            kendo.bind($('#activityTemplate'), activitiesDataSource);
        };
           
        var initNotifi = function () {       
            app.MenuPage = false; 
        };
        
        var showNotifi = function() {
            app.MenuPage = false; 
            
            //console.log(userlName + "||" + userfName + "||" + userMobile + "||" + userEmail + "||" + userOrgName + "||" + userGropuName);
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
            app.MenuPage = false;	
            //window.location.href = "views/organisationLogin.html"; 
            app.mobileApp.navigate('views/organisationLogin.html?account_Id=' + account_Id);      
        };
    	         
        // Logout user
        
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
            var account_Id = localStorage.getItem("ACCOUNT_ID");
            var userType = localStorage.getItem("USERTYPE");   

            //app.mobileApp.navigate('views/getOrganisationList.html?account_Id='+account_Id+'&userType='+userType+'&from=Admin');
            app.mobileApp.navigate('#organisationNotiList');
        }

        function updateAdminLoginStatusError(err) {
            //console.log(err);
        }

        function listViewClick(e) {
            //console.log(e.item); // The clicked item as a jQuery object
        }

        return {
            organisationSelected: organisationSelected,
            groupSelected:groupSelected,
            notificationSelected:notificationSelected,
            inAppBrowser:inAppBrowser,          
            manageGroup:manageGroup,
            makeCall:makeCall,
            initNotifi:initNotifi,
            showNotifi:showNotifi,
            about:about,
            setting:setting,
            orgShow:orgShow,
            info:info,
            listViewClick:listViewClick,
            init:init,
            beforeShow:beforeShow,
            show:show,
            callOrganisationLogin:callOrganisationLogin,
            refreshButton:refreshButton,
            logout: logout
        };
    }());

    return organisationViewModel;
}());