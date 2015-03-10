var app = app || {};

app.groupDetail = (function () {
    var orgName;
    var selectedGroupId;
    var orgDesc;
    var alternateNumInfo = [];

    //var orgId = localStorage.getItem("UserOrgID");
    
    var organisationID;
    var account_Id;
    
    var groupDetailViewModel = (function () {
        var init = function () {
        };
           
        var show = function (e) {
            app.MenuPage = false;
            app.mobileApp.pane.loader.hide();       
            
            var adminOrgInfo = [];
            
            localStorage.setItem("open", 0);                  
            $("#dynamicLi").slideUp("slow");

            localStorage.setItem("loginStatusCheck", 2);

            organisationID = localStorage.getItem("orgSelectAdmin");
            
            //alert(organisationID);
            account_Id = localStorage.getItem("ACCOUNT_ID");
            orgName = localStorage.getItem("orgNameAdmin");
            orgDesc = localStorage.getItem("orgDescAdmin");
            var db = app.getDb();
            db.transaction(updateProfileTab, app.errorCB, app.successCB);
               
            var OrgDisplayName;
            if (orgName.length > 20) {
                OrgDisplayName = orgName.substr(0, 20) + '..';
            }else {
                OrgDisplayName = orgName;
            }
            
            var navbar = app.mobileApp.view()                
                .header
                .find(".km-navbar")
                .data("kendoMobileNavBar");
            navbar.title(OrgDisplayName);

            $("#setOrgName").html(orgName);
        
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
                        console.log(data);                                            
                        return [data];
                    }                                                            
                },
                                                                           error: function (e) {
                                                                               console.log(e);
                                                                               console.log(JSON.stringify(e));
                                                                               $("#progressAdmin").hide();             
                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));

                                                                               //beforeShow();
                                                                               if (!app.checkSimulator()) {
                                                                                   window.plugins.toast.showShortBottom(app.INTERNET_ERROR);   
                                                                               }else {
                                                                                   app.showAlert(app.INTERNET_ERROR, "Notification");  
                                                                               }
                                                                           }	        
                                                                       });
                        
            organisationListDataSource.fetch(function() {
                var data = this.data();                
                            if (data[0]['status'][0].Msg ==='No Orgnisation to manage') {                                   
                                adminOrgInfo = [];
                                localStorage["ADMIN_ORG_DATA"] = JSON.stringify(adminOrgInfo); 
                                
                            }else if (data[0]['status'][0].Msg==="You don't have access") {
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom(app.NO_ACCESS);
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }                                
                            }else if (data[0]['status'][0].Msg==='Session Expired') {
                                app.showAlert(app.SESSION_EXPIRE , 'Notification');
                                app.LogoutFromAdmin();          
                                
                            }else if (data[0]['status'][0].Msg==='Success') {
                                var adminOrgInformation = data[0]['status'][0].orgData;                                
                                var adminIncomMsg = data[0]['status'][0].last;
                                saveAdminOrgInfo(adminOrgInformation , adminIncomMsg); 
              
                                for (var i = 0 ; i < adminOrgInformation.length ;i++) {
                                    adminOrgInfo.push({
                                                          id: data[0]['status'][0].orgData[i].organisationID,
                                                          org_name:data[0]['status'][0].orgData[i].org_name
                                                      });
                                }    
                                
                                localStorage["ADMIN_ORG_DATA"] = JSON.stringify(adminOrgInfo);
                            }
            });
        };
        
        function getListCountDB() {
            var db = app.getDb();
            db.transaction(getDataOrgDB, app.errorCB, app.successCB);   
        };
    
        function getDataOrgDB(tx) {
            var org_id_db = localStorage.getItem("orgSelectAdmin"); 
            var query = "SELECT * FROM ADMIN_ORG where org_id=" + org_id_db;
            app.selectQuery(tx, query, getDataSuccessDB);
        };
            
        function getDataSuccessDB(tx, results) {                                    
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
                //alert(showData);

                if (showData < 0) {
                    showData = 0;   
                }                
                $("#countToShow").html(showData);            
            }            
        }
               
        var updateProfileTab = function(tx) {
            var query = 'UPDATE PROFILE_INFO SET Admin_login_status=1';
            app.updateQuery(tx, query);
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
            db.transaction(insertAdminOrgInfo, app.errorCB, getListCountDB);
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
            //console.log("------------------DATA---------------------");
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
                    var orgNameEncode = app.urlEncode(adminOrgProfileData[i].org_name);
                    var orgDescEncode = app.urlEncode(adminOrgProfileData[i].org_desc);
                                   
                    if (first_login===0) {
                        var query = 'INSERT INTO ADMIN_ORG(org_id , org_name , role , imageSource ,orgDesc , count) VALUES ("'
                                    + adminOrgProfileData[i].organisationID
                                    + '","'
                                    + orgNameEncode
                                    + '","'
                                    + adminOrgProfileData[i].role
                                    + '","'
                                    + adminOrgProfileData[i].org_logo
                                    + '","'
                                    + orgDescEncode 
                                    + '","'
                                    + adminIncomMsgData[i].total    
                                    + '")';              
                        app.insertQuery(tx, query);
                    }else {               
                        localStorage.setItem("ADMIN_FIRST_LOGIN", 0); 
                                    
                        var query = 'INSERT INTO ADMIN_ORG(org_id , org_name , role , imageSource ,orgDesc , count ,bagCount) VALUES ("'
                                    + adminOrgProfileData[i].organisationID
                                    + '","'
                                    + orgNameEncode
                                    + '","'
                                    + adminOrgProfileData[i].role
                                    + '","'
                                    + adminOrgProfileData[i].org_logo
                                    + '","'
                                    + orgDescEncode
                                    + '","'
                                    + adminIncomMsgData[i].total    
                                    + '","'
                                    + adminIncomMsgData[i].total    
                                    + '")';              
                        app.insertQuery(tx, query);
                    }    
                }else {        
                    //alert("update");
                    var queryUpdate = "UPDATE ADMIN_ORG SET org_name='" + orgNameEncode + "',orgDesc='" + orgDescEncode + "',imageSource='" + adminOrgProfileData[i].org_logo + "',count='" + adminIncomMsgData[i].total + "' where org_id=" + adminOrgProfileData[i].organisationID;
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
           
        var showGroupNotification = function() {
            

            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                    app.analyticsService.viewModel.trackFeature("User navigate to Organization Notification in Admin");            
                    app.mobileApp.navigate('views/orgNotificationList.html?organisationID=' + organisationID + '&account_Id=' + account_Id);
            }

            //app.mobileApp.navigate('#groupNotificationShow');
        };   

        var groupDataShow = [];        
        var showGroupMembers = function() {            

            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                    app.analyticsService.viewModel.trackFeature("User navigate to Organization Member List in Admin");            
                    app.mobileApp.navigate('views/orgMemberPage.html');                              
            }
        };
        
        var orgMemberShow = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");              
            var organisationID = localStorage.getItem("orgSelectAdmin");         
            $("#groupMember-listview").hide();
            $("#progressAdminOrgMem").show();
            $("#orgMemFooter").hide();
                               
                        
            app.mobileApp.pane.loader.hide();
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "customer/getOrgCustomer/" + organisationID,
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

                                                                     //console.log(JSON.stringify(e));
                                                                     
                                                                     e.type='show Data Member List';
                                                                                                                                          
                                                                     if (!app.checkSimulator()) {
                                                                         window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                                                                     }else {
                                                                         app.showAlert(app.INTERNET_ERROR , 'Network Problem');  
                                                                     }
                                                                                           
                                                                     app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                     var showNotiTypes = [
                                                                         { message: "Please Check Your Internet Connection"}
                                                                     ];
                       
                                                                     var dataSource = new kendo.data.DataSource({
                                                                                                                    data: showNotiTypes
                                                                                                                });
                    
                                                                     $("#groupMember-listview").kendoMobileListView({
                                                                                                                        template: kendo.template($("#errorTemplate").html()),
                                                                                                                        dataSource: dataSource  
                                                                                                                    });
                    
                                                                     $("#progressAdminOrgMem").hide();
                                                                     $("#groupMember-listview").show();
                                                                 }
	        
                                                             });         
            
            MemberDataSource.fetch(function() {
                var data = this.data();                        
                groupDataShow = [];
                if (data[0]['status'][0].Msg ==='No Customer in this organisation') {     
                    groupDataShow.push({
                                           mobile: '',
                                           first_name: '',
                                           email:'No Member in this Organization',  
                                           last_name : '',
                                           customerID:'0',
                                           account_id:'0',
                                           orgID:'0'
                                       });     
                    $("#adminRemoveMember").hide();
                    $("#adminAddMember").css('width','100%');
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==='Success') {
                    for (var i = 0;i < data[0]['status'][0].allCustomer.length;i++) {
                        groupDataShow.push({
                                               mobile: data[0]['status'][0].allCustomer[i].uacc_username,
                                               first_name: data[0]['status'][0].allCustomer[i].user_fname,
                                               email:data[0]['status'][0].allCustomer[i].user_email,  
                                               last_name : data[0]['status'][0].allCustomer[i].user_lname,
                                               customerID:data[0]['status'][0].allCustomer[i].custID,
                                               account_id:data[0]['status'][0].allCustomer[i].account_id,
                                               orgID:data[0]['status'][0].allCustomer[i].orgID
                                           });
                    }     
                    $("#adminRemoveMember").show();
                    $("#adminAddMember").css('width','45%');

                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                  backToOrgDetail();  
                }
                
                showMemberDataFunc(groupDataShow);
            });
        }
        
        function showMemberDataFunc(data) {

            $("#progressAdminOrgMem").hide();
            $("#groupMember-listview").show();
            $("#orgMemFooter").show();

            
            $("#groupMember-listview").kendoMobileListView({
                                                               dataSource: data,
                                                               template: kendo.template($("#groupMemberTemplate").html())
                                                           });

            $('#groupMember-listview').data('kendoMobileListView').refresh(); 
        }
        
        var showGroupToDelete = function() {
            //console.log("---------------------GROUP DATA----------------");
            $("#deleteMemberData").kendoListView({
                                                     template: kendo.template($("#Member-Delete-template").html()),    		
                                                     dataSource: groupDataShow
                                                 });
        }
        
        var addNemMember = function() {
        }
                
        var showUpdateGroupView = function() {
            app.MenuPage = false;
            app.mobileApp.navigate('#updateGroupInfo');                     
            $("#editOrgName").val(orgName);
            $("#editOrgDesc").val(orgDesc);
        };
        
        var manageGroup = function() {
            app.MenuPage = false;	
            //app.mobileApp.navigate('views/groupListPage.html');

            app.analyticsService.viewModel.trackFeature("User navigate to Group List in Admin");            

            //app.slide('left', 'green' , '3' , '#views/groupListPage.html');
            
            app.mobileApp.navigate("views/groupListPage.html");
        };
        
        var sendNotification = function() {
            app.MenuPage = false;
            app.mobileApp.navigate('views/sendNotification.html');
        };
        
        var saveUpdatedGroupVal = function() {
            //console.log(selectedGroupId);
            var group_status = 'A';
            var org_id = localStorage.getItem("orgSelectAdmin"); 
            var group_name = $("#editOrgName").val();     
            var group_description = $("#editOrgDesc").val();
            
            //alert(org_id);
            
            var jsonDataSaveGroup = {"org_id":org_id ,"group_name":group_name,"group_description":group_description, "group_status":group_status}
            //console.log(selectedGroupId);
            
            var dataSourceaddGroup = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                               url: app.serverUrl() + "group/saveGroup/" + selectedGroupId,
                                                                               type:"POST",                        
                                                                               dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                               data: jsonDataSaveGroup
                                                                           }
                },
                                                                   schema: {
                    data: function(data) {
                        //console.log(data);
                        return [data];
                    }
                },
                                                                   error: function (e) {
                                                                    //console.log(JSON.stringify(e));
                                                                    app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));                                                                      
                                                                 
                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                                                                    }else {
                                                                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                                                                    }              
                                                                   }               
                                                               });  
	            
            dataSourceaddGroup.fetch(function() {
                var loginDataView = dataSourceaddGroup.data();
                $.each(loginDataView, function(i, addGroupData) {
                    //console.log(addGroupData.status[0].Msg);           
                    if (addGroupData.status[0].Msg==='Success') {    
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom(app.GROUP_UPDATED_MSG);   
                        }else {
                            app.showAlert(app.GROUP_UPDATED_MSG, "Notification");  
                        }
                        app.mobileApp.navigate('views/groupListPage.html');
                    }else if (addGroupData.status[0].Msg==="Session Expired") {
                        app.showAlert(app.SESSION_EXPIRE , 'Notification');
                        app.LogoutFromAdmin(); 
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }                               
                });
            });
        };
        
        var addMemberToGroup = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                var organisationID = localStorage.getItem("orgSelectAdmin");
                app.analyticsService.viewModel.trackFeature("User navigate to Add Customer in Admin");                        
                app.mobileApp.navigate('views/addCustomerByAdmin.html?organisationID=' + organisationID);
           }

        };
        
        var backToOrgDetail = function() {
            app.mobileApp.navigate("#view-all-activities-GroupDetail");
        }
        
        var backToOrgAdminList = function() {       
            app.mobileApp.navigate('#view-all-activities-admin');  
        }   
        

        
        var removeMemberFromGroup = function() {           
            app.mobileApp.navigate('#removeMemberFromGroup');
        };
                 
        var removeMemberClick = function() {
            var customer = [];
		    var organisationID = localStorage.getItem("orgSelectAdmin");
            
             $('#deleteMemberData input:checked').each(function() {
                customer.push($(this).val());
            });
            
            //console.log('Delete Button');
            customer = String(customer);        
            
            console.log(customer);            
                        
            if (customer.length!==0 && customer.length!=='0') {
                $("#deleteMemberLoader").show();
                
                var jsonDataDeleteMember = {'customer_id':customer ,'orgID':organisationID}
                        
                var dataSourceDeleteMember = new kendo.data.DataSource({
                                                                           transport: {
                        read: {
                                                                                       url: app.serverUrl() + "customer/removeCustomer",
                                                                                       type:"POST",
                                                                                       dataType: "json",// "jsonp" is required for cross-domain requests; use "json" for same-domain requests                                                          
                                                                                       data: jsonDataDeleteMember
                                                                                   }
                    },
                                                                           schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];
                        }
                    },
                                                                           error: function (e) {
                                                                               $("#deleteMemberLoader").hide();
                                                                               //console.log(e);
                                                                               //console.log(JSON.stringify(e));
                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e)); 
                                                                               if (!app.checkSimulator()) {
                                                                                   window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                               }else {
                                                                                   app.showAlert(app.INTERNET_ERROR, "Notification"); 
                                                                               }
                                                                           }               
          
                                                                       });  
	            
                dataSourceDeleteMember.fetch(function() {
                    var loginDataView = dataSourceDeleteMember.data();
                    $.each(loginDataView, function(i, deleteGroupData) {
                        console.log(deleteGroupData.status[0].Msg);
                      
                        if (deleteGroupData.status[0].Msg==='Deleted successfully' || deleteGroupData.status[0].Code===2) {                                
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.MEMBER_DELETED_MSG);   
                            }else {
                                app.showAlert(app.MEMBER_DELETED_MSG, "Notification");  
                            }                               
                            $("#deleteMemberLoader").hide();                            
                            app.mobileApp.navigate('#groupMemberShow');
                            refreshOrgMember();
                        }else if (deleteGroupData.status[0].Msg==="You don't have access") {                                                        
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                            }else {
                                app.showAlert(app.NO_ACCESS , 'Offline');  
                            }                    
                            app.mobileApp.navigate('#groupMemberShow');
                        }else {
                            $("#deleteMemberLoader").hide();
                            app.showAlert(deleteGroupData.status[0].Msg , 'Notification'); 
                        }
                    });
                }); 
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.SELECT_MEMBER_TO_DELETE);   
                }else {
                    app.showAlert(app.SELECT_MEMBER_TO_DELETE, "Notification");  
                }
            }      
        };
        
        var showOrgGroupView = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                   app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID + '&account_Id=' + account_Id + '&orgName=' + orgName + '&orgDesc=' + orgDesc);                
            }

        };
 
        function refreshOrgMember() {  
            app.groupDetail.showGroupMembers();
        };
		        
        var memberSelectedOrgID;
        var memberSelectedCustID;
         
        var clickOnOrgMember = function(e) {
            memberSelectedOrgID = e.data.orgID;
            memberSelectedCustID = e.data.customerID;  
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                 app.analyticsService.viewModel.trackFeature("User navigate to Edit Member in Admin");            
                 app.mobileApp.navigate('#editMemberInAdmin');       
            }
            
        };

        var alernateMobileVal;

        var adminAllGroupArray = [];
        var customerGroupArray = [];
        var EditGroupArrayMember = [];

        var editMemberShow = function(e) {
            e.preventDefault();
            
            $(".km-scroll-container").css("-webkit-transform", "");  
            $("#adminEditCustomer").show();            
            $("#editOrgMemberContent").hide();
            
            alernateMobileVal = 0;
            countMobile = 0;
            alternateNumInfo = [];
            adminAllGroupArray = [];
            customerGroupArray = [];
            EditGroupArrayMember = [];
            mobileArray = [];
            $("#showAlternateList").show();
            $("#alternateMobileList").empty();

            var dataSourceMemberDetail = new kendo.data.DataSource({
                                                                       transport: {
                    read: {
                                                                                   url: app.serverUrl() + "customer/customerDetail/" + memberSelectedOrgID + "/" + memberSelectedCustID,
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
                                                                           //apps.hideLoading();
                                                                           console.log(JSON.stringify(e));
                                                                           
                                                                           $("#adminEditCustomer").hide();            
                                                                           $("#editOrgMemberContent").show();
                                                                           
                                                                           app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));                                                                           
                                                                           if (!app.checkSimulator()) {
                                                                               window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                           }else {
                                                                               app.showAlert(app.INTERNET_ERROR, "Notification"); 
                                                                           }
                                                                       }               
                                                                   });  
	            
            dataSourceMemberDetail.fetch(function() {
                //var loginDataView = dataSourceMemberDetail.data();                                    
                

                var data = this.data();                

                    if (data[0]['status'][0].Msg==='Success') {
                        var cust_Mobile_no = data[0]['status'][0].customerDetail[0].uacc_username;
                        var cust_email = data[0]['status'][0].customerDetail[0].user_email;
                        var cust_fname = data[0]['status'][0].customerDetail[0].user_fname;
                        var cust_lname = data[0]['status'][0].customerDetail[0].user_lname;

                        $("#editFirstNameAdmin").val(cust_fname);
                        $("#editLastNameAdmin").val(cust_lname);
                        $("#editEmailAdmin").val(cust_email);
                        $("#staticMobile").val(cust_Mobile_no);
                        
                        if (data[0]['status'][0].alternate.length!==0 && data[0]['status'][0].alternate.length!==undefined) { 
                            var alternateNoAdded = data[0]['status'][0].alternate.length;                          
                            for (var i = 0 ; i < alternateNoAdded ;i++) {
                                alernateMobileVal++;
                                alternateNumInfo.push({
                                                          count:i,
                                                          id: data[0]['status'][0].alternate[i].custID,
                                                          alternateNo: data[0]['status'][0].alternate[i].uacc_username,
                                                          customerId: memberSelectedCustID,
                                                          org_id: data[0]['status'][0].alternate[i].orgID
                                                      });

                                $("#alternateMobileList").append('<li style="color:#5992CB" id="editMobileLi' + alernateMobileVal + '"><input type="number" pattern="[0-9]*" step="0.01" id="editMobile' + alernateMobileVal + '" placeholder="Mobile Number"/><a data-role="button" onclick="removeAlternateNo(' + i + ')">Remove</a></li>');
                                $("#editMobile" + alernateMobileVal).val(data[0]['status'][0].alternate[i].uacc_username);  
                            }                           
                            localStorage["ALTER_ARRAY"] = JSON.stringify(alternateNumInfo);
                        }else {
                            $("#showAlternateList").hide();
                        }  
                        
                        if (data[0]['status'][0].AdminGroup.length!==0 && data[0]['status'][0].AdminGroup.length!==undefined){
                            adminAllGroupArray = [];
                            for (var i = 0 ; i < data[0]['status'][0].AdminGroup.length;i++) {
                                adminAllGroupArray.push({
                                                            group_name: data[0]['status'][0].AdminGroup[i].group_name,
                                                            pid: data[0]['status'][0].AdminGroup[i].pid
                                                        });
                            }
                        }
                        

                        if(data[0]['status'][0].customerGroup !== null){
                                                                            
                        if (data[0]['status'][0].customerGroup.groupID.length!==0 && data[0]['status'][0].customerGroup.groupID.length!==undefined ) {
                            customerGroupArray = [];
                            for (var i = 0 ; i < data[0]['status'][0].customerGroup.groupID.length;i++) {
                                                        customerGroupArray.push({
                                                            pid: data[0]['status'][0].customerGroup.groupID[i]
                                                        });
                            }
                        }
                        
                        var allGroupLength = adminAllGroupArray.length;
                        var allCustomerLength = customerGroupArray.length;    
                        
                        for (var i = 0;i < allGroupLength;i++) {       
                        
                            adminAllGroupArray[i].pid = parseInt(adminAllGroupArray[i].pid);
                            var check = ''; 
                            
                            for (var j = 0;j < allCustomerLength;j++) {
                             
                                if (parseInt(adminAllGroupArray[i].pid)===parseInt(customerGroupArray[j].pid)) { 
                                    check = 'checked';
                                    break;
                                    
                                 }else {
                                    
                                     check = '';
                                        
                                }  
                            }
                            
                            EditGroupArrayMember.push({
                                                                  group_name: adminAllGroupArray[i].group_name,
                                                                  pid: adminAllGroupArray[i].pid,
                                                                  check:check
                                                              });
                            
                        }
                       }else{
                        
                        var allGroupLength = adminAllGroupArray.length;
                         
                        for (var i = 0;i < allGroupLength;i++) {       
                        
                            var check = ''; 
                            
       
                            
                            EditGroupArrayMember.push({
                                                                  group_name: adminAllGroupArray[i].group_name,
                                                                  pid: adminAllGroupArray[i].pid,
                                                                  check:check
                                                              });
                            
                        }  
                       }     
                    }else if (addGroupData.status[0].Msg==="Session Expired") {
                        app.showAlert(app.SESSION_EXPIRE , 'Notification');
                        app.LogoutFromAdmin(); 
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }                               
                    //console.log('------------------');
                    console.log(EditGroupArrayMember);
                               
                    /*var comboEditGroupListDataSource = new kendo.data.DataSource({
                    data: EditGroupArrayMember
                    }); */                        
            
                    $("#groupInEditMember").kendoListView({
                                                              template: kendo.template($("#groupNameEditShowTemplate").html()),    		
                                                              dataSource: EditGroupArrayMember
                                                          });
                    
                    $("#adminEditCustomer").hide();            
                    $("#editOrgMemberContent").show();
                });
            //showGroupDataToEditInTemplate();   
        }
        
        /*function showGroupDataToEditInTemplate(){
           
        console.log(EditGroupArrayMember);            
            
        $(".km-scroll-container").css("-webkit-transform", "");
           
        var comboEditGroupListDataSource = new kendo.data.DataSource({
        data: EditGroupArrayMember
        });                         
            
        $("#groupInEditMember").kendoListView({
        template: kendo.template($("#groupNameEditShowTemplate").html()),    		
        dataSource: comboEditGroupListDataSource
        });
        }*/
        
        var userMessageTab = function(e) {
            e.preventDefault();
            var tempArray = [];
            app.MenuPage = false;	
            var activity;
            var uniqueLength;
            var activitiesDataSource;
                    
            notificationId=[],notificationMessage=[],notificationTitle=[];

            activity = app.groupDetail.userData.getByUid(e.data.uid);
   	  	  
            app.mobileApp.navigate('views/adminMessageReply.html');
            app.Activities.userData.filter({
                                               field: 'UserId',
                                               operator: 'eq',
                                               value: activity.Id
                                           });
                 
            app.Activities.userData.fetch(function() {
                var view = app.Activities.userData.view();
                dataLength = view.length;
		                                  
                for (var i = 0;i < dataLength;i++) {
                    var pos = $.inArray(view[i].NotificationId, tempArray);
                    if (pos === -1) {
                        tempArray.push(view[i].NotificationId);
                    } 
                    uniqueLength = tempArray.length;
                }                 
            });
                    
            for (var i = 0;i < uniqueLength;i++) {     		
                app.Activities.activities.filter({
                                                     field: 'Id',
                                                     operator: 'eq',
                                                     value: tempArray[i]
                                                 });
                // for(var i=0;i<dataLength;i++){
                // var pos = $.inArray(view[i].UserId, tempArray);
                // template = kendo.template($("#userDetailTemplate").html());
                //$("#userDetail-listview").append(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
                //kendo.bind($('#userDetailTemplate'), activitiesDataSource);
            }                                                                                                              
        };
        
        var showOrgEvent = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                    app.mobileApp.navigate('views/adminEventCalendar.html');                
            }
            //app.slide('left', 'green' , '3' , '#views/adminEventCalendar.html');
        }
        
        var showOrgNews = function() {
                
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                   app.mobileApp.navigate('views/adminNews.html');
            }
        
            //app.slide('left', 'green' , '3' , '#views/adminNews.html');
        }
        
        var countMobile;
        var mobileArray = [];
        
        var addMoreMobileNoPage = function() {
            //app.slide('left', 'green' , '3' , '#addAlternateNumber');
            app.mobileApp.navigate('#addAlternateNumber');
        }
        
        var addMoreMobileNoFunc = function() {
            addMoreEditMobile++;
            $("#alternateMobile").append('<li class="username"><input type="number" pattern="[0-9]*" step="0.01" id="editMobileMoreNo' + addMoreEditMobile + '" placeholder="Mobile Number" /></li>');
        }
        
        var addMoreEditMobile;        
        
        var addAlternateNo = function() {
            $(".km-scroll-container").css("-webkit-transform", "");  
            $("#alternateMobile").empty();
            addMoreEditMobile = 0;
            $("#editMobileAlterPage").val('');  
            countMobile = 1;  
        }
                      
        var editProfileFunc = function() {
            var fname = $("#editFirstNameAdmin").val();
            var lname = $("#editLastNameAdmin").val();
            var email = $("#editEmailAdmin").val();
            var mobile = $("#staticMobile").val();
            var alterEditMob = $("#editMobileAlterPage").val();
            
            var groupEdit = [];
            
            /*$(':checkbox:checked').each(function(i) {
                groupEdit[i] = $(this).val();
            });*/         
            
             $('#groupInEditMember input:checked').each(function() {
                groupEdit.push($(this).val());
            });
            
            groupEdit = String(groupEdit);             
            console.log(groupEdit);
            
            var organisationID = localStorage.getItem("orgSelectAdmin");
            
            if (fname === "First Name" || fname === "") {
                app.showAlert("Please enter your First Name.", "Validation Error");
            }else if (lname === "Last Name" || lname === "") {
                app.showAlert("Please enter your Last Name.", "Validation Error");
            /*}else if (email === "Email" || email === "") {
                app.showAlert("Please enter your Email.", "Validation Error");
            } else if (!app.validateEmail(email)) {
                app.showAlert("Please enter a valid Email.", "Validation Error");*/
            } else if (mobile === "Mobile Number" || mobile === "") {
                app.showAlert("Please enter your Mobile Number.", "Validation Error");
            } else if (!app.validateMobile(mobile)) {
                app.showAlert("Please enter a valid Mobile Number.", "Validation Error");    
            }else if (groupEdit.length===0 || groupEdit.length==='0') {
                app.showAlert("Please select Group.", "Validation Error");    
            }else if (countMobile!==0) {  
                if (alterEditMob=== "Mobile Number" || alterEditMob === "") {
                    app.showAlert("Please enter your Mobile Number.", "Validation Error");
                } else if (!app.validateMobile(alterEditMob)) {
                    app.showAlert("Please enter a valid Mobile Number.", "Validation Error");    
                }else {                    
                    $("#adminEditCustomer").show();
                    
                    mobileArray = [];
                    //mobileArray.push(mobile);
                    mobileArray.push(alterEditMob);    
                    var count = 0;
                             
                    for (var i = 1;i <= addMoreEditMobile;i++) {
                        var newMobile = $("#editMobileMoreNo" + i).val(); 
                        if (newMobile === "Mobile Number" || newMobile === "") {
                            count++;                        
                        }else if (!app.validateMobile(newMobile)) {
                            app.showAlert("Please enter a valid Mobile Number.", "Validation Error");                                                  
                        }else {
                            count++;
                            mobileArray.push(newMobile);
                        } 
                    }             

                    if (count===addMoreEditMobile) {
                        //alert('inside');
                        console.log(mobileArray);

                        var jsonDataRegister;
                        //alert(localStorage.getItem("orgSelectAdmin"));
                        //alert(organisationID);
                        
                        jsonDataRegister = {"org_id":organisationID,"cust_id":memberSelectedCustID,"txtMobile":mobileArray,"user_email":email,"user_fname":fname,"user_lname":lname,"cmbGroup":groupEdit} 
       
                        //console.log(jsonDataRegister);
                        
                        var dataSourceRegister = new kendo.data.DataSource({
                                                                               transport: {
                                read: {
                                                                                           url: app.serverUrl() + "customer/saveAlternate",
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
                                                                                   $("#adminEditCustomer").hide();
                                                                                   //console.log(JSON.stringify(e));           
                                                                                    app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));                                                                                   app.mobileApp.pane.loader.hide();

                                                                                   if (!app.checkSimulator()) {
                                                                                       window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                                   }else {
                                                                                       app.showAlert(app.INTERNET_ERROR, "Notification"); 
                                                                                   }
                                                                               }               
                                                                           });  
             
                        dataSourceRegister.fetch(function() {
                            var loginDataView = dataSourceRegister.data();
                            //console.log(loginDataView);       
                            $.each(loginDataView, function(i, loginData) {
                                //console.log(loginData.status[0].Msg);                               
                                if (loginData.status[0].Msg==='Success') {
                                    $("#adminEditCustomer").hide();
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.MEMBER_DETAIL_UPDATED_MSG);   
                                    }else {
                                        app.showAlert(app.MEMBER_DETAIL_UPDATED_MSG, "Notification");  
                                    }
                                    
                                    app.mobileApp.navigate('#groupMemberShow');
                                }else if(loginData.status[0].Msg==="Session Expired"){
                                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
                                    app.LogoutFromAdmin(); 
                                
                                }else if (loginData.status[0].Msg==="You don't have access") {
                    
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }
                                              
                                    app.mobileApp.navigate('views/orgMemberPage.html');
      
                                }else {
                                    $("#adminEditCustomer").hide();
                                    app.showAlert(loginData.status[0].Msg , 'Notification'); 
                                }
                            });
                        });
                    }
                } 
            }else {    
                $("#adminEditCustomer").show();
                mobileArray = [];                    
                mobileArray.push(mobile);
                
                //var jsonDataRegister;

                jsonDataRegister = {"org_id":organisationID,"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"cust_id":memberSelectedCustID,"cmbGroup":groupEdit} 
       
                var dataSourceRegister = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "customer/edit",
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
                                                                           $("#adminEditCustomer").hide();

                                                                           //console.log(JSON.stringify(e));           
                                                                           app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));                                                                           app.mobileApp.pane.loader.hide();
                                                                         
                                                                           if (!app.checkSimulator()) {
                                                                               window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                           }else {
                                                                               app.showAlert(app.INTERNET_ERROR, "Notification"); 
                                                                           }
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    //console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        //console.log(loginData.status[0].Msg);
                        if (loginData.status[0].Msg==='Customer detatil updated successfully') {
                            $("#adminEditCustomer").hide();  
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.MEMBER_DETAIL_UPDATED_MSG);   
                            }else {
                                app.showAlert(app.MEMBER_DETAIL_UPDATED_MSG, "Notification");  
                            }
                            
                            app.mobileApp.navigate('#groupMemberShow');
                        }else if(loginData.status[0].Msg==="Session Expired"){
                            app.showAlert(app.SESSION_EXPIRE , 'Notification');
                            app.LogoutFromAdmin(); 
                                
                        }else if (loginData.status[0].Msg==="You don't have access") {
                    
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }
                                              
                                app.mobileApp.navigate('views/orgMemberPage.html');
  
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
                            $("#adminEditCustomer").hide();
                        }
                    });
                });
            }
        };
        
        var attendance = function(){
            
               if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                   app.mobileApp.navigate('views/adminAttendance.html');
            }
            
        }
        
        return {
            init: init,
            show: show,
            manageGroup:manageGroup,
            showOrgNews:showOrgNews,
            editProfileFunc:editProfileFunc,
            addAlternateNo:addAlternateNo,
            attendance:attendance,
            clickOnOrgMember:clickOnOrgMember,     
            sendNotification:sendNotification,    
            removeMemberClick:removeMemberClick,
            addMemberToGroup:addMemberToGroup,
            userMessageTab:userMessageTab,
            backToOrgAdminList:backToOrgAdminList,
            backToOrgDetail:backToOrgDetail,   
            showGroupToDelete:showGroupToDelete,
            addNemMember:addNemMember,
            addMoreMobileNoFunc:addMoreMobileNoFunc,
            addMoreMobileNoPage:addMoreMobileNoPage,
            //addMemberToGroupFunc:addMemberToGroupFunc,
            removeMemberFromGroup:removeMemberFromGroup,    
            showGroupNotification:showGroupNotification,
            editMemberShow:editMemberShow,
            showGroupMembers:showGroupMembers,
            orgMemberShow:orgMemberShow,
            showUpdateGroupView:showUpdateGroupView ,
            showOrgGroupView:showOrgGroupView,       
            showOrgEvent:showOrgEvent,    
            saveUpdatedGroupVal:saveUpdatedGroupVal    
        };
    }());
    
    return groupDetailViewModel;
}());  