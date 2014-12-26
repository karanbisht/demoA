var app = app || {};

app.groupDetail = (function () {
    var orgName;
    var selectedGroupId;
    var orgDesc;
    var custFromGroup = [];
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
            
            var adminOrgInfo=[];
            //organisationID = e.view.params.organisationID;
            //account_Id = e.view.params.account_Id;
            //orgName= e.view.params.orgName;
            //orgDesc= e.view.params.orgDesc;
            

            localStorage.setItem("open", 0);                  
            $( "#dynamicLi" ).slideUp("slow");

            localStorage.setItem("loginStatusCheck", 2);

            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            orgName = localStorage.getItem("orgNameAdmin");
            orgDesc = localStorage.getItem("orgDescAdmin");
            
            //localStorage.setItem("orgNameAdmin",e.data.orgName);
            //localStorage.setItem("orgDescAdmin",e.data.orgDesc);

           // $("#adminOrgHeader").html(orgName);
            
                    var navbar = app.mobileApp.view()                
                    .header
                    .find(".km-navbar")
                    .data("kendoMobileNavBar");
                    navbar.title(orgName);

            $("#setOrgName").html(orgName);
            
            var organisationListDataSource = new kendo.data.DataSource({
                                                       transport: {
                                                            read: {
                                                                                       url: app.serverUrl() + "organisation/managableOrg/" + account_Id,
                                                                                       type:"POST",
                                                                                       dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
                                                                                   }
                                                                   },
                                                                           schema: {                                
                    data: function(data) {	
                       
                        $.each(data, function(i, groupValue) {
                            //alert("IN");
                            console.log(groupValue);   
                            if (groupValue[0].Msg ==='No Orgnisation to manage') {                                   
                              adminOrgInfo=[];
                              localStorage["ADMIN_ORG_DATA"] = JSON.stringify(adminOrgInfo);  
                            }else if (groupValue[0].Msg==='Success') {
                                console.log(groupValue[0].orgData.length);
                                var adminOrgInformation = groupValue[0].orgData;                                
                                var adminIncomMsg = groupValue[0].last;
                                saveAdminOrgInfo(adminOrgInformation , adminIncomMsg); 
              
                              for (var i = 0 ; i < adminOrgInformation.length ;i++) {

                                  adminOrgInfo.push({
                                                       id: groupValue[0].orgData[i].organisationID,
                                                       org_name:groupValue[0].orgData[i].org_name
                                                   });
                              }                           
                             localStorage["ADMIN_ORG_DATA"] = JSON.stringify(adminOrgInfo);
                            }
                        });
                        return [data];
                    }                                                            
                },
                                                                           error: function (e) {
                                                                               console.log(e);

                                                                               $("#progressAdmin").hide();             

                                                                               //beforeShow();
                                                                               if (!app.checkSimulator()) {
                                                                                   window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                                                                               }else {
                                                                                   app.showAlert("Network problem . Please try again later", "Notification");  
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
            
             var db = app.getDb();
            db.transaction(updateProfileTab, app.errorCB, app.successCB);
            
        };
        
        
               function getListCountDB() {
                    var db = app.getDb();
                    db.transaction(getDataOrgDB, app.errorCB, app.successCB);   
                };
    
                function getDataOrgDB(tx) {
                       var org_id_db = localStorage.getItem("orgSelectAdmin"); 
                       var query = "SELECT * FROM ADMIN_ORG where org_id="+org_id_db;
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
    
                localStorage.setItem("incommingMsgCount",countData);                  
    
                
                var showData = countData - bagCountData;
                //alert(showData);
                
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

            console.log(adminOrgProfileData);

            var dataLength = adminOrgProfileData.length;
            console.log(dataLength);

            //alert(dataLength);
            console.log("------------------DATA---------------------");
            console.log(joinOrgID);
          
            for (var i = 0;i < dataLength;i++) {       
                userOrgIdArray.push(parseInt(adminOrgProfileData[i].organisationID));
             
                console.log(adminOrgProfileData[i].organisationID);
                adminOrgProfileData[i].organisationID = parseInt(adminOrgProfileData[i].organisationID);

                var pos = $.inArray(parseInt(adminOrgProfileData[i].organisationID), joinOrgID);           
		  
                //alert(JSON.stringify(joinOrgID));
                //alert(JSON.stringify(parseInt(adminOrgProfileData[i].organisationID)));
         
                if (pos === -1) {              
                    //alert("insert");
                    joinOrgID.push(adminOrgProfileData[i].organisationID);      

                    var first_login = localStorage.getItem("ADMIN_FIRST_LOGIN");
                    //alert("data-:"+first_login);
                    
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
           
        var showGroupNotification = function() {
            app.MenuPage = false;

            app.analyticsService.viewModel.trackFeature("User navigate to Organization Notification in Admin");            

            app.mobileApp.navigate('views/orgNotificationList.html?organisationID=' + organisationID + '&account_Id=' + account_Id);
            //app.mobileApp.navigate('#groupNotificationShow');
        };   

        var groupDataShow = [];

        
        var showGroupMembers = function() {            
            app.MenuPage = false;

            app.analyticsService.viewModel.trackFeature("User navigate to Organization Member List in Admin");            

            app.mobileApp.navigate('views/orgMemberPage.html');                              
        };
        
        
        var orgMemberShow = function(){
            
          var organisationID = localStorage.getItem("orgSelectAdmin");
         
          $("#progressAdminOrgMem").show();         
         
                var UserModel = {
                id: 'Id',
                fields: {
                    mobile: {
                            field: 'mobile',
                            defaultValue: ''
                        },
                    first_name: {
                            field: 'first_name',
                            defaultValue: ''
                        },
                    email: {
                            field: 'email',
                            defaultValue:''
                        },
                    last_name: {
                            field: 'last_name',
                            defaultValue:''
                        },
                    customerID: {
                            field: 'customerID',
                            defaultValue:''
                        }

                }
            };
            
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
                    model: UserModel,
                
                
                    data: function(data) {
                        console.log(data);
                       
                        groupDataShow = [];
                        $.each(data, function(i, groupValue) {
                            console.log(groupValue);
                                     
                            $.each(groupValue, function(i, orgVal) {
                                console.log(orgVal);

                                if (orgVal.Msg ==='No Customer in this organisation') {     
                                    groupDataShow.push({
                                                           mobile: '',
                                                           first_name: '',
                                                           email:'No Customer in this Organization',  
                                                           last_name : '',
                                                           customerID:'0',
                                                           account_id:'0',
                                                           orgID:'0'
                                                       });     
                                    $("#adminRemoveMember").hide();
                                }else if (orgVal.Msg==='Success') {
                                    console.log(orgVal.allCustomer.length);  
                                    for (var i = 0;i < orgVal.allCustomer.length;i++) {
                                        groupDataShow.push({
                                                               mobile: orgVal.allCustomer[i].uacc_username,
                                                               first_name: orgVal.allCustomer[i].user_fname,
                                                               email:orgVal.allCustomer[i].user_email,  
                                                               last_name : orgVal.allCustomer[i].user_lname,
                                                               customerID:orgVal.allCustomer[i].custID,
                                                               account_id:orgVal.allCustomer[i].account_id,
                                                               orgID:orgVal.allCustomer[i].orgID
                                                           });
                                    }     
                                } 
                            });
                        });
                       
                        console.log(JSON.stringify(groupDataShow));
                        return groupDataShow;
                    }

                },
                                                                 error: function (e) {
                                                                     //apps.hideLoading();
                                                                     console.log(e);
                                                                     //navigator.notification.alert("Please check your internet connection.",
                                                                     //function () { }, "Notification", 'OK');
                    
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
                                                                 }
	        
                                                             });         
            
            //MemberDataSource.fetch(function() {
                
            //});
            
                        app.mobileApp.pane.loader.hide();

            console.log(MemberDataSource);

            $("#groupMember-listview").kendoMobileListView({
                                                               dataSource: MemberDataSource,
                                                               template: kendo.template($("#groupMemberTemplate").html())
                                                           });
                app.mobileApp.pane.loader.hide();
            
            setTimeout(function(){
                $("#progressAdminOrgMem").hide();
            },300);
                
        }
        
        var showGroupToDelete = function() {
            console.log("---------------------GROUP DATA----------------");
            
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

                    app.slide('left', 'green' ,'3' ,'#views/groupListPage.html');
 
        };
        
        var sendNotification = function() {
            app.MenuPage = false;
            app.mobileApp.navigate('views/sendNotification.html');
            
        };
        
        var saveUpdatedGroupVal = function() {
            console.log(selectedGroupId);
            var group_status = 'A';
            var org_id = 1; 
            var group_name = $("#editOrgName").val();     
            var group_description = $("#editOrgDesc").val();
            
            var jsonDataSaveGroup = {"org_id":org_id ,"group_name":group_name,"group_description":group_description, "group_status":group_status}
            console.log(selectedGroupId);
            
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
                        console.log(data);
                        return [data];
                    }
                },
                                                                   error: function (e) {
                                                                       //apps.hideLoading();
                                                                       console.log(e);
                                                                       navigator.notification.alert("Please check your internet connection.",
                                                                                                    function () {
                                                                                                    }, "Notification", 'OK');
                                                                   }               
                                                               });  
	            
            dataSourceaddGroup.fetch(function() {
                var loginDataView = dataSourceaddGroup.data();
                $.each(loginDataView, function(i, addGroupData) {
                    console.log(addGroupData.status[0].Msg);           
                    if (addGroupData.status[0].Msg==='Success') {    
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom('Group Updated Successfully');   
                        }else {
                            app.showAlert("Group Updated Successfully", "Notification");  
                        }

                        //app.showAlert("Group Updated Successfully","Notification");
                        app.mobileApp.navigate('views/groupListPage.html');
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }                               
                });
            });
        };
        
        var addMemberToGroup = function() {
            app.MenuPage = false;

            app.analyticsService.viewModel.trackFeature("User navigate to Add Customer in Admin");            

            //app.mobileApp.navigate('#addMemberToGroup');
            app.mobileApp.navigate('views/addCustomerByAdmin.html?organisationID=' + organisationID);
        };
        
        var backToOrgDetail = function() {
           // app.mobileApp.navigate('views/groupDetailView.html?organisationID=' + organisationID + '&account_Id=' + account_Id + '&orgName=' + orgName + '&orgDesc=' + orgDesc);
            app.slide('right', 'green' ,'3' ,'#view-all-activities-GroupDetail');    
        }
        
        var backToOrgAdminList = function() {       
            //app.mobileApp.navigate('#view-all-activities-admin');  
            app.slide('right', 'green' ,'3' ,'#view-all-activities-GroupDetail');
 
        }   
        
        /*var addMemberToGroupFunc = function(){
        var successFlag = false;
            
        var val = [];
        $(':checkbox:checked').each(function(i){
        val[i] = $(this).val();
        //console.log(val[i]);
        });
            
        var jsonDataAddMember = {"customer":val ,"organisation":orgId,"group":selectedGroupId}
                    
        var dataSourceAddMember = new kendo.data.DataSource({
        transport: {
        read: {
        url: "http://54.85.208.215/webservice/group/addCustomertoGroup",
        type:"POST",
        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
        data: jsonDataAddMember
        }
        },
        schema: {
        data: function(data)
        {	console.log(data);
        return [data];
        }
        },
        error: function (e) {
        //apps.hideLoading();
        console.log(e);
        navigator.notification.alert("Please check your internet connection.",
        function () { }, "Notification", 'OK');
        }               
          
        });  
	            
        dataSourceAddMember.fetch(function() {
        var loginDataView = dataSourceAddMember.data();
        $.each(loginDataView, function(i, addGroupData) {
        console.log(addGroupData.status[0].Msg);           
        if(addGroupData.status[0].Msg==='Customer saved to group'){                                
        app.showAlert("Member Added Successfully","Notification");
        app.mobileApp.navigate('#groupMemberShow');
        }else{
        app.showAlert(addGroupData.status[0].Msg ,'Notification'); 
        }
                               
        });
        });        
                                   
        /*$.each(val,function(i,dataValue){  
        console.log(dataValue);
                  
        var data = el.data('Users');
	
        data.update({ 'Group': 'Testing' }, // data
        { 'Id': dataValue }, // filter
                  
        function(data){      
        successFlag=true;
        },

        function(error){
        successFlag=false;
        });
                
        });	
            
        if(successFlag){
        app.showAlert("Member Added to Group","Notification");               
        }else{
        app.showAlert("Error ","Notification");
        }*/
            
        //};
        
        var removeMemberFromGroup = function() {           
            app.MenuPage = false;
            app.mobileApp.navigate('#removeMemberFromGroup');
            /*
            app.groupDetail.userData.filter({
            field: 'Group',
            operator: 'eq',
            value: GroupName   	    				        	
            });
            kendo.bind($('#Member-Delete-template'), MemberDataSource); 
            */
        };
                 
        var removeMemberClick = function() {
            //var orgId = localStorage.getItem("UserOrgID"); 
            //console.log(orgId);    
            var customer = [];
		    
            $(':checkbox:checked').each(function(i) {
                customer[i] = $(this).val();
            });
            
            console.log('Delete Button');
            customer = String(customer);        
            console.log(customer);            
            console.log(organisationID);
          
            
           if(customer.length!==0 && customer.length!=='0'){
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
                        console.log(data);
                        return [data];
                    }
                },
                                                                       error: function (e) {
                                                                           //apps.hideLoading();
                                                                           console.log(e);
                                                                           navigator.notification.alert("Please check your internet connection.",
                                                                                                        function () {
                                                                                                        }, "Notification", 'OK');
                                                                       }               
          
                                                                   });  
	            
            dataSourceDeleteMember.fetch(function() {
                var loginDataView = dataSourceDeleteMember.data();
                $.each(loginDataView, function(i, deleteGroupData) {
                    console.log('karan bisht');
                    console.log(deleteGroupData.status[0].Msg);
                    console.log(deleteGroupData.status[0].Code);
                      
                    if (deleteGroupData.status[0].Msg==='Deleted successfully' || deleteGroupData.status[0].Code===2) {                                
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom('Member Deleted Successfully');   
                        }else {
                            app.showAlert("Member Deleted Successfully", "Notification");  
                        }
                                   
                        //app.showAlert("Member Deleted Successfully","Notification");
                        app.mobileApp.navigate('#groupMemberShow');
                        refreshOrgMember();
                    }else {
                        app.showAlert(deleteGroupData.status[0].Msg , 'Notification'); 
                    }
                });
            }); 
          }else{
              
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom('Please Select Member To Delete.');   
                        }else {
                            app.showAlert("Please Select Member To Delete.", "Notification");  
                        }
          }      
        };
        
        var showOrgGroupView = function() {
            app.MenuPage = false;
            console.log(organisationID);
            app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID + '&account_Id=' + account_Id + '&orgName=' + orgName + '&orgDesc=' + orgDesc);                
            

        };
 
        function refreshOrgMember() {  
            console.log('go to member');
            app.groupDetail.showGroupMembers();
        };
		        
        var memberSelectedOrgID;
        var memberSelectedCustID;
         
        var clickOnOrgMember = function(e) {
            console.log('member click'); 
            console.log(e.data);
            memberSelectedOrgID=e.data.orgID;
            memberSelectedCustID=e.data.customerID;        
            app.analyticsService.viewModel.trackFeature("User navigate to Edit Member in Admin");            
            app.mobileApp.navigate('#editMemberInAdmin');       
        };
        

        var alernateMobileVal;
        
        var editMemberShow = function() {

            $(".km-scroll-container").css("-webkit-transform", "");  

            $("#adminEditCustomer").show();            
            $("#editOrgMemberContent").hide();
            
            alernateMobileVal=0;
            countMobile=0;
            alternateNumInfo=[];
            mobileArray=[];
            $("#showAlternateList").show();
            $("#alternateMobileList").empty();

            var dataSourceMemberDetail = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                    url: app.serverUrl() + "customer/customerDetail/" + memberSelectedOrgID +"/"+memberSelectedCustID,
                                                                    type:"POST",
                                                                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
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
                                                                       console.log(e);
                                                                                   $("#adminEditCustomer").hide();            
                                                                                   $("#editOrgMemberContent").show();
                                                                       navigator.notification.alert("Please check your internet connection.",
                                                                                                    function () {
                                                                                                    }, "Notification", 'OK');
                                                                   }               
                                                               });  
	            
            dataSourceMemberDetail.fetch(function() {
                var loginDataView = dataSourceMemberDetail.data();                                    
                console.log("----- DATA RESULT---------");

                console.log(loginDataView);
                $.each(loginDataView, function(i, addGroupData) {
                    
                    console.log("----- DATA RESULT---------");
                    console.log(addGroupData.status[0].Msg);           
                    if (addGroupData.status[0].Msg==='Success') {
                        
                           var cust_Mobile_no = addGroupData.status[0].customerDetail[0].uacc_username;
                           var cust_email = addGroupData.status[0].customerDetail[0].user_email;
                           var cust_fname = addGroupData.status[0].customerDetail[0].user_fname;
                           var cust_lname = addGroupData.status[0].customerDetail[0].user_lname;

                            $("#editFirstName").val(cust_fname);
                            $("#editLastName").val(cust_lname);
                            $("#editEmail").val(cust_email);
                            $("#staticMobile").val(cust_Mobile_no);
                        
                       if (addGroupData.status[0].alternate.length!==0 && addGroupData.status[0].alternate.length!==undefined ) { 
                           var alternateNoAdded = addGroupData.status[0].alternate.length;                          
                            for (var i = 0 ; i < alternateNoAdded ;i++) {
                                
                                alernateMobileVal++;
                                alternateNumInfo.push({
                                                       count:i,
                                                       id: addGroupData.status[0].alternate[i].custID,
                                                       alternateNo: addGroupData.status[0].alternate[i].uacc_username,
                                                       customerId: memberSelectedCustID,
                                                       org_id: addGroupData.status[0].alternate[i].orgID
                                                   });

                                $("#alternateMobileList").append('<li style="color:#5992CB" id="editMobileLi'+alernateMobileVal+'"><input type="number" pattern="[0-9]*" step="0.01" class="k-textbox" id="editMobile'+alernateMobileVal+'" placeholder="Mobile Number"/><a data-role="button" onclick="removeAlternateNo('+i+')">Remove</a></li>');
                                $("#editMobile"+alernateMobileVal).val(addGroupData.status[0].alternate[i].uacc_username);  
                            }                           
                             localStorage["ALTER_ARRAY"] = JSON.stringify(alternateNumInfo);
                         }else{
                             $("#showAlternateList").hide();
                         }  

                        
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }                               
                    

                    $("#adminEditCustomer").hide();            
                    $("#editOrgMemberContent").show();

                });
            });
            
            
        }

        
        var userMessageTab = function(e) {
            var tempArray = [];
            app.MenuPage = false;	
            var activity;
            var uniqueLength;
            var activitiesDataSource;
                    
            notificationId=[],notificationMessage=[],notificationTitle=[];

            console.log(e.data.uid);
            activity = app.groupDetail.userData.getByUid(e.data.uid);
            console.log(activity);
            console.log(activity.Id);
   	  	  
            app.mobileApp.navigate('views/adminMessageReply.html');
            app.Activities.userData.filter({
                                               field: 'UserId',
                                               operator: 'eq',
                                               value: activity.Id
                                           });
                 
            app.Activities.userData.fetch(function() {
                var view = app.Activities.userData.view();
                console.log(view);
                dataLength = view.length;
		                                  
                for (var i = 0;i < dataLength;i++) {
                    var pos = $.inArray(view[i].NotificationId, tempArray);
                    console.log(pos);
                    if (pos === -1) {
                        tempArray.push(view[i].NotificationId);
                    } 
                    console.log("hello" + tempArray);
                    uniqueLength = tempArray.length;
                    console.log(uniqueLength);   
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
            app.MenuPage = false;
            console.log(organisationID);
            //app.mobileApp.navigate('views/adminEventCalendar.html');                
            app.slide('left', 'green' ,'3' ,'#views/adminEventCalendar.html');

        }
        
        var showOrgNews = function() {
            app.MenuPage = false;
            console.log(organisationID);
            //app.mobileApp.navigate('views/adminNews.html');
            app.slide('left', 'green' ,'3' ,'#views/adminNews.html');
        }
        
        var countMobile;
        var mobileArray=[];
        
        var addMoreMobileNoPage = function(){
            
            app.slide('left', 'green' ,'3' ,'#addAlternateNumber');
        }
        
        var addMoreMobileNoFunc = function(){
            addMoreEditMobile++;
            $("#alternateMobile").append('<li class="username"><input type="number" pattern="[0-9]*" step="0.01" class="k-textbox" id="editMobileMoreNo'+addMoreEditMobile+'" placeholder="Mobile Number" /></li>');
        }
        
        var addMoreEditMobile;        
        
        var addAlternateNo = function(){
          $(".km-scroll-container").css("-webkit-transform", "");  
          $("#alternateMobile").empty();
          addMoreEditMobile=0;
          $("#editMobileAlterPage").val('');  
          countMobile=1;  
        }
                      
        var editProfileFunc = function() {
   
            //alert(memberSelectedCustID);
            
            var fname = $("#editFirstName").val();
            var lname = $("#editLastName").val();
            var email = $("#editEmail").val();
            var mobile = $("#staticMobile").val();
            var alterEditMob = $("#editMobileAlterPage").val();
            
            /*if(firstTime===0){
            countMobile=addMoreMobile;
            }else{
              firstTime++;  
            }*/
            
            if (fname === "First Name" || fname === "") {
                app.showAlert("Please enter your First Name.", "Validation Error");
            }else if (lname === "Last Name" || lname === "") {
                app.showAlert("Please enter your Last Name.", "Validation Error");
            }else if (email === "Email" || email === "") {
                app.showAlert("Please enter your Email.", "Validation Error");
            } else if (!app.validateEmail(email)) {
                app.showAlert("Please enter a valid Email.", "Validation Error");
            } else if (mobile === "Mobile Number" || mobile === "") {
                app.showAlert("Please enter your Mobile Number.", "Validation Error");
            } else if (!app.validateMobile(mobile)) {
                app.showAlert("Please enter a valid Mobile Number.", "Validation Error");    
            }else if(countMobile!==0){  

                if(alterEditMob=== "Mobile Number" || alterEditMob === "") {
                    app.showAlert("Please enter your Mobile Number.", "Validation Error");
                } else if (!app.validateMobile(alterEditMob)) {
                    app.showAlert("Please enter a valid Mobile Number.", "Validation Error");    
                }else{
                
                //alert("addMoreButton");

                mobileArray=[];
                //mobileArray.push(mobile);
                mobileArray.push(alterEditMob);    
                var count=0;
               
                //alert(countMobile);
               
                for(var i=1;i<=addMoreEditMobile;i++){
                    var newMobile = $("#editMobileMoreNo"+i).val(); 
                    if(newMobile === "Mobile Number" || newMobile === ""){
                        count++;                        
                    }else if (!app.validateMobile(newMobile)) {
                        app.showAlert("Please enter a valid Mobile Number.", "Validation Error");                                                  
                    }else{
                        count++;
                        mobileArray.push(newMobile);
                    } 
                }             

                if(count===addMoreEditMobile){
                    //alert('inside');
                    
                                    console.log(mobileArray);


                                    var jsonDataRegister;
                    
                jsonDataRegister = {"org_id":organisationID,"cust_id":memberSelectedCustID,"txtMobile":mobileArray,"user_email":email,"user_fname":fname,"user_lname":lname} 
       
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
                            console.log(data);
                            return [data];
                        }
                    },
                                                                       error: function (e) {
                                                                           //apps.hideLoading();
                                                                           console.log(e);
                                                                           console.log(JSON.stringify(e));           

                                                                           app.mobileApp.pane.loader.hide();
                                                                           navigator.notification.alert("Please check your internet connection.",
                                                                                                        function () {
                                                                                                        }, "Notification", 'OK');
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        console.log(loginData.status[0].Msg);                               
                        if (loginData.status[0].Msg==='Success') {
                            app.showAlert("Customer detatil updated successfully", "Notification");
                            app.mobileApp.navigate('#groupMemberShow');

                            //app.mobileApp.navigate('#groupMemberShow');
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            
               }
              } 
            }else{    
                  //alert("editPageSave");
                mobileArray=[];                    
                mobileArray.push(mobile);
                
                console.log(mobileArray);
                console.log(fname + "||" + lname + "||" + email + "||" + mobile + "||" + organisationID);
                var jsonDataRegister;

                jsonDataRegister = {"org_id":organisationID,"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"cust_id":memberSelectedCustID} 
       
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
                            console.log(data);
                            return [data];
                        }
                    },
                                                                       error: function (e) {
                                                                           //apps.hideLoading();
                                                                           console.log(e);

                                                                           console.log(JSON.stringify(e));           

                                                                           
                                                                           app.mobileApp.pane.loader.hide();
                                                                           navigator.notification.alert("Please check your internet connection.",
                                                                                                        function () {
                                                                                                        }, "Notification", 'OK');
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        console.log(loginData.status[0].Msg);
                               
                        if (loginData.status[0].Msg==='Customer detatil updated successfully') {
                            app.showAlert("Customer detatil updated successfully", "Notification");
                            app.mobileApp.navigate('#groupMemberShow');
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            }
        };
	           
        
        return {
            init: init,
            show: show,
            manageGroup:manageGroup,
            showOrgNews:showOrgNews,
            editProfileFunc:editProfileFunc,
            addAlternateNo:addAlternateNo,
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