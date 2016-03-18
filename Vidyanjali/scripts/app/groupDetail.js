var app = app || {};

app.groupDetail = (function () {
    var orgName;
    var selectedGroupId;
    var orgDesc;
    var alternateNumInfo = [];
    var memberSelectedPhoto;

    var organisationID;
    var account_Id;

    var totalReadMsg=0;
    var totalSum1=0;
    var totalSum2=0;

    
    var groupDetailViewModel = (function () {
        var init = function () {
        };
           
        var show = function (e) {
            app.mobileApp.pane.loader.hide();       
            var adminOrgInfo = [];
            
            localStorage.setItem("open", 0);                  
            $("#dynamicLi").slideUp("slow");

            localStorage.setItem("loginStatusCheck", 2);

            organisationID = localStorage.getItem("orgSelectAdmin");
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
                                                                                       url: app.serverUrl() + "organisation/managableOrg/" + account_Id + "/" + app.CLIENT_APP_ID,
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
                                                                               $("#progressAdmin").hide();                                                                                            
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
                if (data[0]['status'][0].Msg ==='No Orgnisation to manage') {                                   
                    adminOrgInfo = [];
                    localStorage["ADMIN_ORG_DATA"] = JSON.stringify(adminOrgInfo); 
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                                
                }else if (data[0]['status'][0].Msg==='Session Expired') {
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
            //db.transaction(getDataOrgDB, app.errorCB, app.successCB); 
            db.transaction(updateBagCount, app.errorCB, setMsgCount);
        };
        
        var updateBagCount = function(tx) {

              var org_id_db = localStorage.getItem("orgSelectAdmin"); 

              var query = "SELECT count FROM ADMIN_OTO where org_id=" + org_id_db;
              app.selectQuery(tx, query, adminOtoSuccess);
            
              var query1 = "SELECT count FROM ADMIN_MSG_MEM where org_id=" + org_id_db;
              app.selectQuery(tx, query1, adminMsgSuccess);
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
            var org_id_db = localStorage.getItem("orgSelectAdmin"); 

            var queryUpdate = "UPDATE ADMIN_ORG SET bagCount='" + totalReadMsg + "' where org_id=" + org_id_db;
            app.updateQuery(tx, queryUpdate);
            
            //var query = "SELECT * FROM ADMIN_ORG where org_id=" + organisationID;
            //app.selectQuery(tx, query, getDataSuccessCust);            

            var query = "SELECT * FROM ADMIN_ORG where org_id=" + org_id_db;
            app.selectQuery(tx, query, getDataSuccessDB);
        }
        
    
        /*function getDataOrgDB(tx) {
            var org_id_db = localStorage.getItem("orgSelectAdmin"); 
            var query = "SELECT * FROM ADMIN_ORG where org_id=" + org_id_db;
            app.selectQuery(tx, query, getDataSuccessDB);
        };*/
            
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
                localStorage.setItem("incommingMsgCount", countData);                                  
                var showData = countData - bagCountData;
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
            userOrgIdArray = [];
            var dataLength = adminOrgProfileData.length;
          
            for (var i = 0;i < dataLength;i++) {       
                userOrgIdArray.push(parseInt(adminOrgProfileData[i].organisationID));
             
                adminOrgProfileData[i].organisationID = parseInt(adminOrgProfileData[i].organisationID);
                var pos = $.inArray(parseInt(adminOrgProfileData[i].organisationID), joinOrgID);           
                if (pos === -1) {              
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
                    var queryUpdate = "UPDATE ADMIN_ORG SET org_name='" + orgNameEncode + "',orgDesc='" + orgDescEncode + "',imageSource='" + adminOrgProfileData[i].org_logo + "',count='" + adminIncomMsgData[i].total + "' where org_id=" + adminOrgProfileData[i].organisationID;
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
             
            var query1 = "DELETE FROM ADMIN_ORG_NOTIFICATION where org_id=" + orgIdToDel;
            app.deleteQuery(tx, query1);
        } 
           
        var showGroupNotification = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                //app.analyticsService.viewModel.trackFeature("User navigate to Organization Notification in Admin");            
                app.mobileApp.navigate('views/orgNotificationList.html?organisationID=' + organisationID + '&account_Id=' + account_Id);
            }
        };   

        var groupDataShow = [];        
        var showGroupMembers = function() {            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                //app.analyticsService.viewModel.trackFeature("User navigate to Organization Member List in Admin");            
                app.mobileApp.navigate('views/orgMemberPage.html');                              
            }
        };
        
        var orgMemberShow = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");              
            $("#popover-orgMember").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow"); 
            $("#groupMember-listview").hide();
            app.showAppLoader();
            $("#orgMemFooter").hide();
            $(".km-filter-form").hide();                        
            var organisationID = localStorage.getItem("orgSelectAdmin");  
            var selectedGroupID = localStorage.getItem("memberGroupId");
            var memberGroupName = localStorage.getItem("memberGroupName");
            
            $("#adminMembHeader").html(memberGroupName);           

            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "group/getCustomerByGroupID/" + selectedGroupID + "/" + organisationID,
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

                                                                     app.hideAppLoader();
                                                                     $("#groupMember-listview").show();
                                                                 }	        
                                                             });         
            MemberDataSource.fetch(function() {
                var data = this.data();                        
                groupDataShow = [];
                if (data[0]['status'][0].Msg ==='No member in group') {     
                    groupDataShow.push({
                                           mobile: '',
                                           first_name: '',
                                           email:'No Member in this Group',  
                                           last_name : '',
                                           customerID:'0',
                                           account_id:'0',
                                           orgID:'0'
                                       });     
                    $("#adminRemoveMember").hide();
                    $("#adminAddMember").css('width', '100%');
                    showNoGroupDataInTemplate(groupDataShow);
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==='Success') {
                    for (var i = 0;i < data[0]['status'][0].customerInfo.length;i++) {
                        groupDataShow.push({
                                               mobile: data[0]['status'][0].customerInfo[i].mobile,
                                               first_name: data[0]['status'][0].customerInfo[i].first_name,
                                               email:data[0]['status'][0].customerInfo[i].email,  
                                               last_name : data[0]['status'][0].customerInfo[i].last_name,
                                               full_name:data[0]['status'][0].customerInfo[i].first_name + " " + data[0]['status'][0].customerInfo[i].last_name,
                                               customerID:data[0]['status'][0].customerInfo[i].customerID,
                                               account_id:data[0]['status'][0].customerInfo[i].account_id,
                                               photo:data[0]['status'][0].customerInfo[i].photo,
                                               orgID:data[0]['status'][0].customerInfo[i].orgID
                                           });
                    }     
                    $("#adminRemoveMember").show();
                    $("#adminAddMember").css('width', '45%');
                    showMemberDataFunc(groupDataShow);
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    backToOrgDetail();  
                }
                //showMemberDataFunc(groupDataShow);
            });
        }
        
        function showMemberDataFunc(data) {
            app.hideAppLoader();
            $("#groupMember-listview").show();            
            $(".km-filter-form").hide();

            $("#groupMember-listview").kendoMobileListView({
                                                               dataSource: data,                                        
                                                               template: kendo.template($("#groupMemberTemplate").html()),
                                                               filterable: {
                    field: "full_name",
                    operator: "contains",
                },
                                                           });
            
            $('#groupMember-listview').data('kendoMobileListView').refresh();          
        }

        var showNoGroupDataInTemplate = function(data) {           
            $(".km-scroll-container").css("-webkit-transform", "");
            app.hideAppLoader();
            $("#groupMember-listview").show();

            var comboGroupListDataSourceNo = new kendo.data.DataSource({
                                                                           data: data
                                                                       });              
            
            $("#groupMember-listview").kendoListView({
                                                         dataSource: comboGroupListDataSourceNo,                                        
                                                         template: kendo.template($("#groupMemberTemplate").html())
                                                     });                            
        };
        
        var showGroupToDelete = function() {            
            $(".km-scroll-container").css("-webkit-transform", "");
            $(".km-filter-form").hide();
               
            $("#deleteMemberData").kendoMobileListView({
                                                           dataSource: groupDataShow,                                        
                                                           template: kendo.template($("#Member-Delete-template").html()),
                                                           filterable: {
                    field: "full_name",
                    operator: "contains",
                },
                                                       });
            
            $('#deleteMemberData').data('kendoMobileListView').refresh();          
        }
        
        var addNemMember = function() {
        }
                
        var showUpdateGroupView = function() {
            app.mobileApp.navigate('#updateGroupInfo');                     
            $("#editOrgName").val(orgName);
            $("#editOrgDesc").val(orgDesc);
        };
        
        var manageGroup = function() {
            //app.analyticsService.viewModel.trackFeature("User navigate to Group List in Admin");            
            
            app.mobileApp.navigate("views/groupListPage.html");
        };
        
        var sendNotification = function() {
            app.mobileApp.navigate('views/sendNotification.html');
        };
        
        var saveUpdatedGroupVal = function() {
            var group_status = 'A';
            var org_id = localStorage.getItem("orgSelectAdmin"); 
            var group_name = $("#editOrgName").val();     
            var group_description = $("#editOrgDesc").val();
            
            var jsonDataSaveGroup = {"org_id":org_id ,"group_name":group_name,"group_description":group_description, "group_status":group_status}
            
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
	            
            dataSourceaddGroup.fetch(function() {
                var loginDataView = dataSourceaddGroup.data();
                $.each(loginDataView, function(i, addGroupData) {
                    if (addGroupData.status[0].Msg==='Success') {    
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom(app.GROUP_UPDATED_MSG);   
                        }else {
                            app.showAlert(app.GROUP_UPDATED_MSG, "Notification");  
                        }
                        app.mobileApp.navigate('views/groupListPage.html');
                    }else if (addGroupData.status[0].Msg==="Session Expired") {
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
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                var organisationID = localStorage.getItem("orgSelectAdmin");
                //app.analyticsService.viewModel.trackFeature("User navigate to Add Customer in Admin");                        
                app.mobileApp.navigate('views/addCustomerByAdmin.html?organisationID=' + organisationID);
            }
        };
        
        var backToOrgDetail = function() {
            app.mobileApp.navigate("#view-all-activities-GroupDetail");
        }
        
        var backToOrgGrpDetail = function() {
            app.mobileApp.navigate("#memberPageGroupList");
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
            customer = String(customer);             
            if (customer.length!==0 && customer.length!=='0') {
                navigator.notification.confirm(app.DELETE_CONFIRM, function (confirmed) {           
                    if (confirmed === true || confirmed === 1) {
                        app.showAppLoader(true);
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
                                    return [data];
                                }
                            },
                                                                                   error: function (e) {
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
                                                                                   }               
          
                                                                               });  
	            
                        dataSourceDeleteMember.fetch(function() {
                            var loginDataView = dataSourceDeleteMember.data();
                            $.each(loginDataView, function(i, deleteGroupData) {
                                if (deleteGroupData.status[0].Msg==='Deleted successfully' || deleteGroupData.status[0].Code===2) {                                
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.MEMBER_DELETED_MSG);   
                                    }else {
                                        app.showAlert(app.MEMBER_DELETED_MSG, "Notification");  
                                    }                               
                                    app.hideAppLoader();
                                    app.mobileApp.navigate('views/orgMemberPage.html');
                                }else if (deleteGroupData.status[0].Msg==="You don't have access") {                                                        
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }                    
                                    app.mobileApp.navigate('#groupMemberShow');
                                }else {
                                    app.hideAppLoader();
                                    app.showAlert(deleteGroupData.status[0].Msg , 'Notification'); 
                                }
                            });
                        });
                    }
                }, app.APP_NAME, ['Yes', 'No']);
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
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
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
            memberSelectedPhoto = e.data.photo;
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                //app.analyticsService.viewModel.trackFeature("User navigate to Edit Member in Admin");            
                app.mobileApp.navigate('#editMemberInAdmin');       
            }
        };
        
        var takeMemberProfilePhoto = function() {
            navigator.camera.getPicture(onProfilePhotoURISuccess, onFail, { 
                                            quality: 40,
                                            targetWidth: 150,
                                            targetHeight: 150,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true                                           
                                        });
        };
        
        var selectMemberProfilePhoto = function() {
            navigator.camera.getPicture(onProfilePhotoURISuccess, onFail, { 
                                            quality: 40,
                                            targetWidth: 150,
                                            targetHeight: 150,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        var resetMemberProfilePhoto = function() {
            var largeImage = document.getElementById('editMemberPhoto');
            largeImage.src = "styles/images/profile-img1.png";
            memberSelectedPhoto = "";   
        }
        
        function onFail(e) {
            //console.log(e);
        }
        
        function onProfilePhotoURISuccess(imageURI) {            
            var largeImage = document.getElementById('editMemberPhoto');
            largeImage.src = imageURI;
            memberSelectedPhoto = imageURI;   
        }

        var alernateMobileVal;
        var adminAllGroupArray = [];
        var customerGroupArray = [];
        var EditGroupArrayMember = [];

        var editMemberShow = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");  
            $('.km-popup-arrow').addClass("removeArrow");
            app.showAppLoader(true);
            $("#editOrgMemberContent").hide();
            var largeImage = document.getElementById('editMemberPhoto');
            if (memberSelectedPhoto==="" || memberSelectedPhoto=== null || memberSelectedPhoto=== 'null') {
                largeImage.src = "styles/images/profile-img1.png";    
            }else {
                largeImage.src = memberSelectedPhoto;
            }
            
            alernateMobileVal = 0;
            countMobile = 0;
            alternateNumInfo = [];
            adminAllGroupArray = [];
            customerGroupArray = [];
            EditGroupArrayMember = [];
            mobileArray = [];
            $("#showAlternateList").show();
            $("#alternateMobileList").empty();
            
            $("#groupInEditMember option:selected").removeAttr("selected");
            $('#groupInEditMember').empty();

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
                        //console.log(JSON.stringify(data));
                        return [data];
                    }
                },
                                                                       error: function (e) {
                                                                           //console.log(JSON.stringify(e));
                                                                           app.hideAppLoader();
                                                                           $("#editOrgMemberContent").show();
                                                                           
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
	            
            dataSourceMemberDetail.fetch(function() {
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

                            $("#alternateMobileList").append('<li style="color:#5992CB;padding-left:0px;margin-left:0px;" id="editMobileLi' + alernateMobileVal + '"><input type="number" pattern="[0-9]*" step="0.01" id="editMobile' + alernateMobileVal + '" placeholder="Mobile Number" style="padding-left:0px;margin-left:0px;"/><a data-role="button" onclick="removeAlternateNo(' + i + ')">Remove</a></li>');
                            $("#editMobile" + alernateMobileVal).val(data[0]['status'][0].alternate[i].uacc_username);  
                        }                           
                        localStorage["ALTER_ARRAY"] = JSON.stringify(alternateNumInfo);
                    }else {
                        $("#showAlternateList").hide();
                    }  
                        
                    if (data[0]['status'][0].AdminGroup!==false) {
                        if (data[0]['status'][0].AdminGroup.length!==0 && data[0]['status'][0].AdminGroup.length!==undefined) {
                            adminAllGroupArray = [];
                            for (var i = 0 ; i < data[0]['status'][0].AdminGroup.length;i++) {
                                adminAllGroupArray.push({
                                                            group_name: data[0]['status'][0].AdminGroup[i].group_name,
                                                            pid: data[0]['status'][0].AdminGroup[i].pid
                                                        });
                            }
                        }                        

                        if (data[0]['status'][0].customerGroup !== null) {                                                                            
                            if (data[0]['status'][0].customerGroup.groupID.length!==0 && data[0]['status'][0].customerGroup.groupID.length!==undefined) {
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
                                        check = 'selected';
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
   
                            $.each(EditGroupArrayMember, function (index, value) {                            
                                if (value.check==='') {
                                    $('#groupInEditMember').append($('<option/>', { 
                                                                         value: value.pid,
                                                                         text : value.group_name                                   
                                                                     }));   
                                }else {
                                    $('#groupInEditMember').append($('<option/>', { 
                                                                         value: value.pid,
                                                                         text : value.group_name ,
                                                                         selected:"selected"
                                                                     }));   
                                }                                
                            });
                        }else {
                            var allGroupLength1 = adminAllGroupArray.length;                         
                            for (var k = 0; k < allGroupLength1;k++) {                                                    
                                EditGroupArrayMember.push({
                                                              group_name: adminAllGroupArray[k].group_name,
                                                              pid: adminAllGroupArray[k].pid,
                                                              check:''
                                                          });
                            }                             
                            $.each(EditGroupArrayMember, function (index, value) {                            
                                $('#groupInEditMember').append($('<option/>', { 
                                                                     value: value.pid,
                                                                     text : value.group_name                                   
                                                                 }));   
                            });
                        } 
                    }else {
                        app.noGroupAvailable();
                    }   
                }else if (addGroupData.status[0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
                }else {
                    app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                }                               
                app.hideAppLoader();
                $("#editOrgMemberContent").show();
            });
        }
        
        var showOrgEvent = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('views/adminEventCalendar.html');                
            }
        }
        
        var showOrgNews = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('views/adminNews.html');
            }
        }
        
        var countMobile;
        var mobileArray = [];
        
        var addMoreMobileNoPage = function() {
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
                                       
            $('#groupInEditMember :selected').each(function(i, selected) { 
                groupEdit[i] = $(selected).val(); 
            });
            
            groupEdit = String(groupEdit);             
            
            var organisationID = localStorage.getItem("orgSelectAdmin");
            
            if (fname === "First Name" || fname === "") {
                app.showAlert("Please enter your First Name.", app.APP_NAME);
            }else if (lname === "Last Name" || lname === "") {
                app.showAlert("Please enter your Last Name.", app.APP_NAME);
                /*}else if (email === "Email" || email === "") {
                app.showAlert("Please enter your Email.", app.APP_NAME);
                } else if (!app.validateEmail(email)) {
                app.showAlert("Please enter a valid Email.", app.APP_NAME);*/
            } else if (mobile === "Mobile Number" || mobile === "") {
                app.showAlert("Please enter your Mobile Number.", app.APP_NAME);
            } else if (!app.validateMobile(mobile)) {
                app.showAlert("Please enter a valid Mobile Number.", app.APP_NAME);    
            }else if (groupEdit.length===0 || groupEdit.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);    
            }else if (countMobile!==0) {  
                if (alterEditMob=== "Mobile Number" || alterEditMob === "") {
                    app.showAlert("Please enter your Mobile Number.", app.APP_NAME);
                } else if (!app.validateMobile(alterEditMob)) {
                    app.showAlert("Please enter a valid Mobile Number.", app.APP_NAME);    
                }else {                    
                    app.showAppLoader(true);
                    mobileArray = [];
                    mobileArray.push(alterEditMob);                    
                    var count = 0;                             
                    for (var i = 1;i <= addMoreEditMobile;i++) {
                        var newMobile = $("#editMobileMoreNo" + i).val(); 
                        if (newMobile === "Mobile Number" || newMobile === "") {
                            count++;                        
                        }else if (!app.validateMobile(newMobile)) {
                            app.showAlert("Please enter a valid Mobile Number.", app.APP_NAME);                                                  
                        }else {
                            count++;
                            mobileArray.push(newMobile);
                        } 
                    }                                 
                    mobileArray = String(mobileArray);

                    if (count===addMoreEditMobile) {
                        var jsonDataRegister;
                        jsonDataRegister = {"org_id":organisationID,"cust_id":memberSelectedCustID,"txtMobile":mobileArray,"user_email":email,"user_fname":fname,"user_lname":lname,"cmbGroup":groupEdit};
                              
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
                                    return [data];
                                }
                            },
                                                                               error: function (e) {
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
                                                                               }               
                                                                           });  
             
                        dataSourceRegister.fetch(function() {
                            var loginDataView = dataSourceRegister.data();
                            $.each(loginDataView, function(i, loginData) {
                                if (loginData.status[0].Msg==='Success') {
                                    app.hideAppLoader();
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.MEMBER_DETAIL_UPDATED_MSG);   
                                    }else {
                                        app.showAlert(app.MEMBER_DETAIL_UPDATED_MSG, "Notification");  
                                    }
                                    
                                    app.mobileApp.navigate('#groupMemberShow');
                                }else if (loginData.status[0].Msg==="Session Expired") {
                                    app.LogoutFromAdmin(); 
                                }else if (loginData.status[0].Msg==="You don't have access") {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }
                                              
                                    app.mobileApp.navigate('views/orgMemberPage.html');
                                }else {
                                    app.hideAppLoader();
                                    app.showAlert(loginData.status[0].Msg , 'Notification'); 
                                }
                            });
                        });
                    }
                } 
            }else {    
                app.showAppLoader(true);
                mobileArray = [];                    
                mobileArray.push(mobile);
                mobileArray = String(mobileArray);
                
                if (memberSelectedPhoto==="") {
                    jsonDataRegister = {"org_id":organisationID,"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"cust_id":memberSelectedCustID,"cmbGroup":groupEdit,"profile_pic":memberSelectedPhoto};
       
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
                                return [data];
                            }
                        },
                                                                           error: function (e) {
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
                                                                           }               
                                                                       });  
             
                    dataSourceRegister.fetch(function() {
                        var loginDataView = dataSourceRegister.data();
                        $.each(loginDataView, function(i, loginData) {
                            if (loginData.status[0].Msg==='Customer detatil updated successfully') {
                                app.hideAppLoader();
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.MEMBER_DETAIL_UPDATED_MSG);   
                                }else {
                                    app.showAlert(app.MEMBER_DETAIL_UPDATED_MSG, "Notification");  
                                }                            
                                app.mobileApp.navigate('#groupMemberShow');
                            }else if (loginData.status[0].Msg==="Session Expired") {
                                app.LogoutFromAdmin(); 
                            }else if (loginData.status[0].Msg==="You don't have access") {
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }
                                              
                                app.mobileApp.navigate('views/orgMemberPage.html');
                            }else {
                                app.showAlert(loginData.status[0].Msg , 'Notification'); 
                                app.hideAppLoader();
                            }
                        });
                    });                  
                }else {
                    if (memberSelectedPhoto.substring(0, 21)==="content://com.android") {
                        var photo_split = memberSelectedPhoto.split("%3A");
                        memberSelectedPhoto = "content://media/external/images/media/" + photo_split[1];
                    }   
              
                    var filename = memberSelectedPhoto.substr(memberSelectedPhoto.lastIndexOf('/') + 1);                                                
                    if (filename.indexOf('.') === -1) {
                        filename = filename + '.jpg';
                    }                

                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtFName = fname;
                    params.txtLName = lname;
                    params.txtEmail = email;
                    params.txtMobile = mobileArray;
                    params.cust_id = memberSelectedCustID;
                    params.cmbGroup = groupEdit;
                    ft = new FileTransfer();
                    var options = new FileUploadOptions();          
                    options.fileKey = "profile_pic";
                    options.fileName = filename;  
                    options.mimeType = "image/jpeg";
                    options.params = params;
                    options.chunkedMode = false;
                    options.headers = {
                        Connection: "close"
                    };     
              
                    ft.upload(memberSelectedPhoto, app.serverUrl() + "customer/edit", memberWin, memberFail, options , true); 
                }
            }      
        };
        
        function memberWin(r) {
            app.hideAppLoader();
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.MEMBER_DETAIL_UPDATED_MSG);   
            }else {
                app.showAlert(app.MEMBER_DETAIL_UPDATED_MSG, "Notification");  
            }                            
            app.mobileApp.navigate('#groupMemberShow');
        }

        function memberFail(e) {
            app.hideAppLoader();
        }
        
        var attendance = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('views/adminAttendance.html');
            }            
        }
        
        var timeTableManage = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('views/adminTimeTable.html');
            }            
        }
        
        var memberGroupDataShow = [];
        var showGroup = function() {     
            $(".km-scroll-container").css("-webkit-transform", "");              
            $("#popover-orgMemberGroup").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow"); 
            
            app.showAppLoader(true);
            $("#memberGroup-listview").hide();
                    
            var organisationID = localStorage.getItem("orgSelectAdmin");
                                    
            memberGroupDataShow = [];      
    
            var organisationGroupDataSource = new kendo.data.DataSource({                
                                                                            transport: {
                    read: {
                                                                                        url: app.serverUrl() + "group/index/" + organisationID,
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
                                                                                //getGroupDataDB();
                                                                            }	        
                                                                        });         
            
            organisationGroupDataSource.fetch(function() {
                var data = this.data();                
                if (data[0]['status'][0].Msg ==='No Group list') {     
                    memberGroupDataShow.push({
                                                 orgName: '',
                                                 groupID:0,
                                                 groupName:'No Group',
                                                 organisationID:'',
                                                 groupDesc:'No Group in this Organization',
                                                 addDate:''  
                                             });                       
                    //showLiveData();
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==="You don't have access") {                                    
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                                                             
                    backToOrgDetail();                                    
                }else if (data[0]['status'][0].Msg==='Success') {  
                    var orgLength = data[0].status[0].groupData.length;
                    for (var i = 0;i < orgLength;i++) {
                        memberGroupDataShow.push({
                                                     orgName: data[0]['status'][0].groupData[i].org_name,
                                                     groupID:data[0]['status'][0].groupData[i].pid,
                                                     groupName:data[0]['status'][0].groupData[i].group_name,
                                                     organisationID:data[0]['status'][0].groupData[i].org_id,
                                                     groupDesc:data[0]['status'][0].groupData[i].group_desc,
                                                     addDate:data[0]['status'][0].groupData[i].add  
                                                 }); 
                    }                                       
                    //saveOrgGroupNotification(orgNotificationData);                                                                                                                                                                      
                }
                showLiveData();
            });                                
        };  

        var showLiveData = function() {
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: memberGroupDataShow
                                                                       });                                      
            $("#memberGroup-listview").kendoMobileListView({
                                                               template: kendo.template($("#memberGroupTemplate").html()),    		
                                                               dataSource: organisationListDataSource
                                                           });        
                
            $('#memberGroup-listview').data('kendoMobileListView').refresh();
              
            app.hideAppLoader();
            $("#memberGroup-listview").show();
        };
        
        var memberGroupSelected = function (e) {   
            localStorage.setItem("memberGroupId", e.data.groupID);  
            localStorage.setItem("memberGroupName", e.data.groupName);
            
            //app.analyticsService.viewModel.trackFeature("User navigate to Member Module in Admin Member Page");                         
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('#groupMemberShow');
            }
        };
        
        return {
            init: init,
            show: show,
            manageGroup:manageGroup,
            showOrgNews:showOrgNews,
            showGroup:showGroup,
            memberGroupSelected:memberGroupSelected,
            editProfileFunc:editProfileFunc,
            addAlternateNo:addAlternateNo,
            attendance:attendance,
            timeTableManage:timeTableManage,
            clickOnOrgMember:clickOnOrgMember,     
            sendNotification:sendNotification,    
            removeMemberClick:removeMemberClick,
            addMemberToGroup:addMemberToGroup,
            backToOrgAdminList:backToOrgAdminList,
            backToOrgDetail:backToOrgDetail,  
            backToOrgGrpDetail:backToOrgGrpDetail,
            showGroupToDelete:showGroupToDelete,
            addNemMember:addNemMember,
            addMoreMobileNoFunc:addMoreMobileNoFunc,
            addMoreMobileNoPage:addMoreMobileNoPage,
            takeMemberProfilePhoto:takeMemberProfilePhoto,
            selectMemberProfilePhoto:selectMemberProfilePhoto,
            resetMemberProfilePhoto:resetMemberProfilePhoto,
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