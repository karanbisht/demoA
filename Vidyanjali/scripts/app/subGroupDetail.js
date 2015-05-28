var app = app || {};

app.subGroupDetail = (function () {
    var GroupName;
    var selectedGroupDesc;

    //var orgId = localStorage.getItem("UserOrgID");
    
    var groupID;
    var organisationID;
       
    var groupDetailViewModel = (function () {
        var init = function () {
        };
           
        var show = function (e) {
            app.mobileApp.pane.loader.hide();            
           
            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            groupID = localStorage.getItem("groupIdAdmin");
            GroupName = localStorage.getItem("groupNameAdmin");
            selectedGroupDesc = localStorage.getItem("groupDescAdmin");
            
            /*var GroupNameVal;
            if (GroupName.length > 20) {
                GroupNameVal = GroupName.substr(0, 20) + '..';
            }else {
                GroupNameVal = GroupName;  
            }*/            
            
            $("#adminGroupHeader").html(GroupName);           
        };
           
        var showSubGroupNotification = function() {

            app.analyticsService.viewModel.trackFeature("User navigate to Group Notification in Admin");            

            app.mobileApp.navigate('views/subGroupNotificationList.html?organisationID=' + organisationID + '&group_ID=' + groupID);
            //app.mobileApp.navigate('#groupNotificationShow');
        };   
                
        var groupMemberData = [];
        
         var showSubGroupMembers = function() {
            
             if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                app.mobileApp.pane.loader.hide();
                app.mobileApp.navigate('#subGroupMemberShow');            
                app.analyticsService.viewModel.trackFeature("User navigate to Group Member Page in Admin");            
            }
                               
         }
        
         var showSubGroupMembersShow = function() {
        
             $("#memberSGLoader").show();
             $("#subGroupMember-listview").hide();
             $("#groupMemberFooter").hide();
             

             var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "group/getCustomerByGroupID/" + groupID + "/" + organisationID,
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
                                                                     app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));                                                                                         
                                                                     var showNotiTypes = [
                                                                         { message: "Please Check Your Internet Connection"}
                                                                     ];
                        
                                                                     var dataSource = new kendo.data.DataSource({
                                                                                                                    data: showNotiTypes
                                                                                                                });
                    
                                                                     $("#subGroupMember-listview").kendoMobileListView({
                                                                                                                           template: kendo.template($("#errorTemplate").html()),
                                                                                                                           dataSource: dataSource  
                                                                                                                       });
                                                                     
                                                                      $("#memberSGLoader").hide();
                                                                      $("#subGroupMember-listview").show();

                                                                 }
	        
                                                             });         
            
            MemberDataSource.fetch(function() {
                var data = this.data();

                var groupDataShow = [];

                if (data[0]['status'][0].Msg ==='No member in group') {
                    app.mobileApp.pane.loader.hide();                                        
                    groupDataShow.push({
                                           mobile: '',
                                           first_name: '',
                                           email:'No member in this group',  
                                           last_name : '',
                                           customerID:'0',
                                           orgID:0
                                       });                                         
                    $("#deleteGroupMemberBtn").hide();  
                    $("#addGroupMemberBtn").css('width','100%');
                    
                    
                    
                    groupMemberData = groupDataShow ;
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==='Success') {
                    app.mobileApp.pane.loader.hide();
                                        
                    $("#deleteGroupMemberBtn").show(); 
                    $("#addGroupMemberBtn").css('width','45%');

                    for (var i = 0;i < data[0].status[0].customerInfo.length;i++) {
                        groupDataShow.push({
                                               first_name: data[0].status[0].customerInfo[i].first_name,
                                               email:data[0].status[0].customerInfo[i].email,  
                                               last_name : data[0].status[0].customerInfo[i].last_name,
                                               customerID:data[0].status[0].customerInfo[i].customerID,
                                               mobile:data[0].status[0].customerInfo[i].mobile,
                                               orgID:data[0].status[0].customerInfo[i].orgID
                                           });
                    }     
                                       
                    groupMemberData = groupDataShow ;
                }else if (addGroupData.status[0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }
                     
                        backToPrePage();
                    } 
                
                showDataInTemplate();
            });
        };
        
        var showDataInTemplate = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
           

            $("#memberSGLoader").hide();
            $("#subGroupMember-listview").show();
            $("#groupMemberFooter").show();


            

            console.log(groupMemberData);
            var subGroupDataListDataSource = new kendo.data.DataSource({
                                                                           data: groupMemberData
                                                                       });           
                
            $("#subGroupMember-listview").kendoMobileListView({
                                                                  template: kendo.template($("#subGroupMemberTemplate").html()),    		
                                                                  dataSource: subGroupDataListDataSource
                                                              });
                
            $('#subGroupMember-listview').data('kendoMobileListView').refresh();
            
            //app.mobileApp.pane.loader.hide();
        }

        var showUpdateSubGroupView = function() {

            app.analyticsService.viewModel.trackFeature("User navigate to Edit Group Info Page in Admin");            

            app.mobileApp.navigate('#updateSubGroupInfo');      
               
            $("#editGroupName").val(GroupName);
            
            $('#editGroupDesc').css('height', '40px');

            var txt = $('#editGroupDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');

            $('body').append(hiddenDiv);

            txt.on('keyup', function () {
                content = $(this).val();    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
                $(this).css('height', hiddenDiv.height());
            });
            
            $("#editGroupDesc").val(selectedGroupDesc);
        };
        
        var showDeleteGroupMember = function() {
            $("#deleteSubMemberData").kendoListView({
                                                        template: kendo.template($("#sub-Member-Delete-template").html()),    		
                                                        dataSource: groupMemberData 
                                                    });
        }
        
        var manageGroup = function() {
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var sendNotification = function() {
            app.mobileApp.navigate('views/sendNotification.html');
        };
        
        var saveUpdatedGroupVal = function() {
            //console.log(selectedGroupId);
            var group_status = 'A';
            //var org_id=1; 
            var group_name = $("#editGroupName").val();     
            var group_description = $("#editGroupDesc").val();
                         
            if (group_name === "Enter New Group Name" || group_name === "") {
                app.showAlert("Please enter Group Name.", "Validation Error");
            }else if (group_description === "Write Group description here (Optional) ?" || group_description === "") {
                app.showAlert("Please enter Group Description.", "Validation Error");
            }else {
                $("#updateSGLoader").show();
                var jsonDataSaveGroup = {"org_id":organisationID ,"txtGrpName":group_name,"txtGrpDesc":group_description,"pid":groupID , "group_status":group_status}
                       
                var dataSourceaddGroup = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "group/edit",
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
                                                                           $("#updateSGLoader").hide();
                                                                           //console.log(e);
                                                                      
                                                                           if (!app.checkConnection()) {
                                                                                             if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                             }else {
                                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                             } 
                                                                                        }else {
                                                                              
                                                                                            if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.ERROR_MESSAGE);
                                                                                            }else {
                                                                                                app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                            }
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                       }               
                                                                   });  
	            
                dataSourceaddGroup.fetch(function() {
                    var loginDataView = dataSourceaddGroup.data();
                    $.each(loginDataView, function(i, addGroupData) {
                        if (addGroupData.status[0].Msg==='Group updated successfully') {  
                            $("#updateSGLoader").hide();
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Group Updated Successfully');   
                            }else {
                                app.showAlert("Group Updated Successfully", "Notification");  
                            }                                   
                            app.mobileApp.navigate('views/groupListPage.html');  
                            //app.showAlert("Group Updated Successfully","Notification");
                        }else if (addGroupData.status[0].Msg==="You don't have access") {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                            }else {
                                app.showAlert(app.NO_ACCESS , 'Offline');  
                            }
                     
                             app.mobileApp.navigate('views/groupListPage.html');
                    }else {
                            $("#updateSGLoader").hide();
                            app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                          }
                    });
                });
            }      
        };
        
        var addMemberToGroup = function() {
            app.mobileApp.navigate('#addMemberToSubGroup');
        };
        
        var initAddMember = function() {
        };
        
        var showAddMember = function() {
            
            $("#addSGMemberLoader").show();
            $("#groupAddMemberList").hide();
            $("#groupAddMember").hide();
            
            var groupDataAllShow = [];
            var remDataValue = [];
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                read: {
                                                                             url: app.serverUrl() + "customer/getOrgCustomer/" + organisationID+"/A",
                                                                             type:"POST",
                                                                             dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
                                                                         }
                },
                                                                 schema: {                              
                    data: function(data) {
                        console.log(data);
                       
                        $.each(data, function(i, groupValue) {
                            //console.log(groupValue);
                            $.each(groupValue, function(i, orgVal) {
                                console.log(orgVal);

                                if (orgVal.Msg==='Success') {
                                    console.log(orgVal.allCustomer.length);  
                                    for (var i = 0;i < orgVal.allCustomer.length;i++) {
                                        groupDataAllShow.push({
                                                                  mobile: orgVal.allCustomer[i].uacc_username,
                                                                  first_name: orgVal.allCustomer[i].user_fname,
                                                                  email:orgVal.allCustomer[i].user_email,  
                                                                  last_name : orgVal.allCustomer[i].user_lname,
                                                                  customerID:orgVal.allCustomer[i].custID,
                                                                  account_id:orgVal.allCustomer[i].account_id,
                                                                  orgID:orgVal.allCustomer[i].orgID
                                                              });
                                    }        
                                }else if (orgVal.Msg==="Session Expired") {
                                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
                                    app.LogoutFromAdmin(); 
                                }else if (orgVal.Msg==='No Customer in this organisation') {
                                    if (!app.checkSimulator()) {
                                           window.plugins.toast.showShortBottom(app.No_MEMBER_TO_ADD);
                                    }else {
                                           app.showAlert(app.No_MEMBER_TO_ADD, "Notification"); 
                                    }                                    
                                    app.mobileApp.navigate('#subGroupMemberShow');
                                }
                                
                                            $("#addSGMemberLoader").hide();
                                            $("#groupAddMemberList").show();
                                            $("#groupAddMember").show();
    
                            });
                        });
		                                                           
                        var allData = groupDataAllShow.length;
                        var groupData = groupMemberData.length;            
                                              
                        var checkRem = 0;
                        for (var x = 0;x < allData ; x++) {                     
                            var numCheck = 0;
                            for (var y = 0;y < groupData ;y++) {
                                if (groupDataAllShow[x].customerID=== groupMemberData[y].customerID) {                                
                                    numCheck = 1;                                    
                                }
                            }
                            if (numCheck!==1) {
                                remDataValue.push({
                                                      mobile: groupDataAllShow[x].mobile,
                                                      first_name: groupDataAllShow[x].first_name,
                                                      email:groupDataAllShow[x].email,  
                                                      last_name : groupDataAllShow[x].last_name,
                                                      customerID:groupDataAllShow[x].customerID,
                                                      account_id:groupDataAllShow[x].account_id,
                                                      orgID:groupDataAllShow[x].orgID
                                                  });								                
                                checkRem++;
                            }
                        }
                        
                        if (checkRem===0) {
                                    if (!app.checkSimulator()) {
                                           window.plugins.toast.showShortBottom(app.No_MEMBER_TO_ADD);
                                    }else {
                                           app.showAlert(app.No_MEMBER_TO_ADD, "Notification"); 
                                    }
                            app.mobileApp.navigate('#subGroupMemberShow');  
                        }
                        
                        
                        return remDataValue;
                    }
                },
                                                                 error: function (e) {
                                                                     //apps.hideLoading();
                                                                     //console.log(e);
                                                                     //console.log(JSON.stringify(e));
                                                                  if (!app.checkConnection()) {
                                                                                             if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                             }else {
                                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                             } 
                                                                                        }else {
                                                                              
                                                                                            if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.ERROR_MESSAGE);
                                                                                            }else {
                                                                                                app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                            }
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }    
                                                                     
                                                                     
                                                                 }	        
                                                             });         
        
            $("#addMemberData-listview").kendoListView({
                                                           template: kendo.template($("#Sub-Member-Add-template").html()),
                                                           dataSource: MemberDataSource
                                                       });
        };
        
        var addMemberToGroupFunc = function() {
            
            var customer = [];
            /*$(':checkbox:checked').each(function(i) {
                customer[i] = $(this).val();
                //console.log(val[i]);
            });*/
        
            $('#addMemberData-listview input:checked').each(function() {
                customer.push($(this).val());
            });

            
            customer = String(customer);        
            console.log(customer);            
                        
            if (customer.length!==0 && customer.length!=='0') {
                //var customer = String(customer);        
                $("#addSGMemberLoader").show();
                var jsonDataAddMember = {"customer_id":customer ,"group_id":groupID,"org_id":organisationID}
            
                //console.log(customer + "||" + groupID + "||" + organisationID);      
                var dataSourceAddMember = new kendo.data.DataSource({
                                                                        transport: {
                        read: {
                                                                                    url: app.serverUrl() + "group/addUser",
                                                                                    type:"POST",
                                                                                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                    data: jsonDataAddMember
                                                                                }
                    },
                                                                        schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];
                        }
                    },
                                                                        error: function (e) {
                                                                            $("#addSGMemberLoader").hide();
                                                                           if (!app.checkConnection()) {
                                                                                             if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                             }else {
                                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                             } 
                                                                                        }else {
                                                                              
                                                                                            if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.ERROR_MESSAGE);
                                                                                            }else {
                                                                                                app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                            }
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                        }               
          
                                                                    });  
	            
                dataSourceAddMember.fetch(function() {
                    var loginDataView = dataSourceAddMember.data();
                    $.each(loginDataView, function(i, addGroupData) {
                        console.log(addGroupData.status[0].Msg);           
                        if (addGroupData.status[0].Msg==='Customer Added to group successfully') { 
                            $("#addSGMemberLoader").hide();
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Member Added Successfully');   
                            }else {
                                app.showAlert("Member Added Successfully", "Notification");  
                            }
                                   
                            //app.showAlert("Member Added Successfully","Notification");
                            //app.mobileApp.navigate('#groupMemberShow');
                            showSubGroupMembers();
                        }else if (addGroupData.status[0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }                     
                        showSubGroupMembers();
                       
                        }else {
                            $("#addSGMemberLoader").hide();
                            app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Please Select Member To Add.');   
                }else {
                    app.showAlert("Please Select Member To Add.", "Notification");  
                }
            }      
        };
        
        var removeMemberFromGroup = function() {           
            //app.slide('left', 'green' ,'3' ,'#removeMemberFromSubGroup');
            app.mobileApp.navigate('#removeMemberFromSubGroup');            
        };
                 
        var removeMemberClick = function() {
            //var orgId = localStorage.getItem("UserOrgID"); 
            //console.log(orgId);    
            var customer = [];

           /* $('#deleteSubMemberData:checkbox:checked').each(function(i) {
                customer[i] = $(this).val();
            });*/
            
            $('#deleteSubMemberData input:checked').each(function() {
                customer.push($(this).val());
            });
            
            customer = String(customer);        
            
            console.log(customer);            
                         
            if (customer.length!==0 && customer.length!=='0') {
                $("#deleteSGMemberLoader").hide();  
                //var customer = String(customer);        
            
                //console.log(customer);            
                //console.log(organisationID);
       
                var jsonDataDeleteMember = {"customer_id":customer ,"group_id":groupID,"org_id":organisationID}
            
                //console.log("customer_id" + customer + "||" + groupID + "||" + organisationID);
            
                var dataSourceDeleteMember = new kendo.data.DataSource({
                                                                           transport: {
                        read: {
                                                                                       url: app.serverUrl() + "group/removeUser",
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
                                                                               $("#deleteSGMemberLoader").hide();
                                                                             
                                                                               if (!app.checkConnection()) {
                                                                                             if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                             }else {
                                                                                                app.showAlert(app.INTERNET_ERROR , 'Offline'); 
                                                                                             } 
                                                                                        }else {
                                                                              
                                                                                            if (!app.checkSimulator()) {
                                                                                                window.plugins.toast.showLongBottom(app.ERROR_MESSAGE);
                                                                                            }else {
                                                                                                app.showAlert(app.ERROR_MESSAGE , 'Offline'); 
                                                                                            }
                                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                                        }
                                                                           }               
          
                                                                       });  
	            
                dataSourceDeleteMember.fetch(function() {
                    var loginDataView = dataSourceDeleteMember.data();
                    $.each(loginDataView, function(i, deleteGroupData) {
                        //console.log(deleteGroupData.status[0].Msg);           
                        if (deleteGroupData.status[0].Msg==='User removed successfully') { 
                            $("#deleteSGMemberLoader").hide();
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Member Deleted Successfully');   
                            }else {
                                app.showAlert("Member Deleted Successfully", "Notification");  
                            }
                            showSubGroupMembers();
                        }else if (deleteGroupData.status[0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }                     
                        showSubGroupMembers();
                    }else {
                            $("#deleteSGMemberLoader").hide();
                            app.showAlert(deleteGroupData.status[0].Msg , 'Notification'); 
                        }
                    });
                });    
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Please Select Member To Delete.');   
                }else {
                    app.showAlert("Please Select Member To Delete.", "Notification");  
                }
            }      
        };
        
        var showOrgGroupView = function() {
            //console.log(organisationID);
            app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID);                
            //app.mobileApp.navigate('#orgGroupShow');                        
        };
             
        var userMessageTab = function(e) {
            var tempArray = [];
            var activity;
            var uniqueLength;
            var activitiesDataSource;
                    
            notificationId=[],notificationMessage=[],notificationTitle=[];

            //console.log(e.data.uid);
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
                    //console.log(pos);
                    if (pos === -1) {
                        tempArray.push(view[i].NotificationId);
                    } 
                    //console.log("hello" + tempArray);
                    uniqueLength = tempArray.length;
                    //console.log(uniqueLength);   
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
        
        var backToPrePage = function() {
            app.mobileApp.navigate('views/subGroupDetailView.html');
            //app.slide('right', 'green' ,'3' ,'#views/subGroupDetailView.html');
        }

        var goToPrePageOrg = function() {
            app.mobileApp.navigate('views/groupListPage.html');
            //app.slide('right', 'green' ,'3' ,'#views/groupListPage.html');
        }
	           
        return {
            init: init,
            show: show,
            showAddMember:showAddMember,
            initAddMember:initAddMember,
            backToPrePage:backToPrePage,   
            goToPrePageOrg:goToPrePageOrg,    
            manageGroup:manageGroup,    
            showDeleteGroupMember:showDeleteGroupMember,    
            sendNotification:sendNotification,    
            removeMemberClick:removeMemberClick,
            addMemberToGroup:addMemberToGroup,
            userMessageTab:userMessageTab,    
            addMemberToGroupFunc:addMemberToGroupFunc,
            removeMemberFromGroup:removeMemberFromGroup,    
            showSubGroupNotification:showSubGroupNotification,
            showSubGroupMembers:showSubGroupMembers,
            showSubGroupMembersShow:showSubGroupMembersShow,
            showUpdateSubGroupView:showUpdateSubGroupView ,
            showOrgGroupView:showOrgGroupView,        
            saveUpdatedGroupVal:saveUpdatedGroupVal    
        };
    }());
    
    return groupDetailViewModel;
}());  