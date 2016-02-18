var app = app || {};

app.subGroupDetail = (function () {
    var GroupName;
    var selectedGroupDesc;    
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
            
            $("#adminGroupHeader").html(GroupName);           
        };
           
        var showSubGroupNotification = function() {
            //app.analyticsService.viewModel.trackFeature("User navigate to Group Notification in Admin");            
            app.mobileApp.navigate('views/subGroupNotificationList.html?organisationID=' + organisationID + '&group_ID=' + groupID);
        };   
                
        var groupMemberData = [];        
        var showSubGroupMembers = function() {            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.pane.loader.hide();
                app.mobileApp.navigate('#subGroupMemberShow');            
                //app.analyticsService.viewModel.trackFeature("User navigate to Group Member Page in Admin");            
            }
        }
        
        var showSubGroupMembersShow = function() {
            app.showAppLoader();
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
                        return [data];
                    }

                },
                                                                 error: function (e) {
                                                                     app.hideAppLoader();
                                                                     $("#subGroupMember-listview").show();

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

                var groupDataShow = [];

                if (data[0]['status'][0].Msg ==='No member in group') {
                    app.mobileApp.pane.loader.hide();                                        
                    groupDataShow.push({
                                           mobile: '',
                                           first_name: '',
                                           email:'No member in this group',  
                                           full_name:'',
                                           last_name : '',
                                           customerID:'0',
                                           orgID:0
                                       });                                         
                    $("#deleteGroupMemberBtn").hide();  
                    $("#addGroupMemberBtn").css('width', '100%');
                    
                    groupMemberData = groupDataShow ;
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==='Success') {
                    app.mobileApp.pane.loader.hide();
                                        
                    $("#deleteGroupMemberBtn").show(); 
                    $("#addGroupMemberBtn").css('width', '45%');

                    for (var i = 0;i < data[0].status[0].customerInfo.length;i++) {
                        groupDataShow.push({
                                               first_name: data[0].status[0].customerInfo[i].first_name,
                                               email:data[0].status[0].customerInfo[i].email,  
                                               last_name : data[0].status[0].customerInfo[i].last_name,
                                               full_name:data[0].status[0].customerInfo[i].first_name + " " + data[0].status[0].customerInfo[i].last_name,
                                               customerID:data[0].status[0].customerInfo[i].customerID,
                                               mobile:data[0].status[0].customerInfo[i].mobile,
                                               photo:data[0].status[0].customerInfo[i].photo,
                                               orgID:data[0].status[0].customerInfo[i].orgID
                                           });
                    }     
                                       
                    groupMemberData = groupDataShow ;
                }else if (addGroupData.status[0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
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
            app.hideAppLoader();
            $("#subGroupMember-listview").show();
            $("#groupMemberFooter").show();
            
            var subGroupDataListDataSource = new kendo.data.DataSource({
                                                                           data: groupMemberData
                                                                       });           
                
            $("#subGroupMember-listview").kendoMobileListView({
                                                                  template: kendo.template($("#subGroupMemberTemplate").html()),    		
                                                                  dataSource: subGroupDataListDataSource
                                                              });
                
            $('#subGroupMember-listview').data('kendoMobileListView').refresh();
        }

        var showUpdateSubGroupView = function() {
            //app.analyticsService.viewModel.trackFeature("User navigate to Edit Group Info Page in Admin");            

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
            $(".km-scroll-container").css("-webkit-transform", "");
            $(".km-filter-form").hide();
               
            $("#deleteSubMemberData").kendoMobileListView({
                                                              dataSource: groupMemberData,                                        
                                                              template: kendo.template($("#sub-Member-Delete-template").html()),
                                                              filterable: {
                    field: "full_name",
                    operator: "contains",
                },
                                                          });
            
            $('#deleteSubMemberData').data('kendoMobileListView').refresh();          
        }
        
        var manageGroup = function() {
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        var sendNotification = function() {
            app.mobileApp.navigate('views/sendNotification.html');
        };
        
        var saveUpdatedGroupVal = function() {
            var group_status = 'A';
            var group_name = $("#editGroupName").val();     
            var group_description = $("#editGroupDesc").val();
                         
            if (group_name === "Enter New Group Name" || group_name === "") {
                app.showAlert("Please enter Group Name.", app.APP_NAME);
                /*}else if (group_description === "Write Group description here (Optional) ?" || group_description === "") {
                app.showAlert("Please enter Group Description.", app.APP_NAME);*/
            }else {
                app.showAppLoader();
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
	            
                dataSourceaddGroup.fetch(function() {
                    var loginDataView = dataSourceaddGroup.data();
                    $.each(loginDataView, function(i, addGroupData) {
                        if (addGroupData.status[0].Msg==='Group updated successfully') {  
                            app.hideAppLoader();
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Group Updated Successfully');   
                            }else {
                                app.showAlert("Group Updated Successfully", "Notification");  
                            }                                   
                            app.mobileApp.navigate('views/groupListPage.html');  
                        }else if (addGroupData.status[0].Msg==="You don't have access") {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                            }else {
                                app.showAlert(app.NO_ACCESS , 'Offline');  
                            }
                     
                            app.mobileApp.navigate('views/groupListPage.html');
                        }else {
                            app.hideAppLoader();
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
            app.showAppLoader(true);
            $("#addMemberData-listview").hide();
            $(".km-filter-form").hide();
            
            var groupDataAllShow = [];
            var remDataValue = [];
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "customer/getOrgCustomer/" + organisationID + "/A",
                                                                             type:"POST",
                                                                             dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
                                                                         }
                },
                                                                 schema: {                              
                    data: function(data) {
                        $.each(data, function(i, groupValue) {
                            $.each(groupValue, function(i, orgVal) {
                                if (orgVal.Msg==='Success') {
                                    for (var i = 0;i < orgVal.allCustomer.length;i++) {
                                        groupDataAllShow.push({
                                                                  mobile: orgVal.allCustomer[i].uacc_username,
                                                                  first_name: orgVal.allCustomer[i].user_fname,
                                                                  email:orgVal.allCustomer[i].user_email,
                                                                  full_name:orgVal.allCustomer[i].user_fname + " " + orgVal.allCustomer[i].user_lname,
                                                                  last_name : orgVal.allCustomer[i].user_lname,
                                                                  customerID:orgVal.allCustomer[i].custID,
                                                                  account_id:orgVal.allCustomer[i].account_id,
                                                                  orgID:orgVal.allCustomer[i].orgID
                                                              });
                                    }        
                                }else if (orgVal.Msg==="Session Expired") {
                                    app.LogoutFromAdmin(); 
                                }else if (orgVal.Msg==='No Customer in this organisation') {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.No_MEMBER_TO_ADD);
                                    }else {
                                        app.showAlert(app.No_MEMBER_TO_ADD, "Notification"); 
                                    }                                    
                                    app.mobileApp.navigate('#subGroupMemberShow');
                                }
                                
                                app.hideAppLoader();
                                $("#addMemberData-listview").show();
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
                                                      full_name:groupDataAllShow[x].first_name + " " + groupDataAllShow[x].last_name,                                                 
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
            
            $("#addMemberData-listview").kendoMobileListView({
                                                                 dataSource: MemberDataSource,                                        
                                                                 template: kendo.template($("#Sub-Member-Add-template").html()),
                                                                 filterable: {
                    field: "full_name",
                    operator: "contains",
                },
                                                             });                

            $("#addMemberData-listview").show();
            $('#addMemberData-listview').data('kendoMobileListView').refresh();          
        };
        
        var addMemberToGroupFunc = function() {            
            var customer = [];
            $('#addMemberData-listview input:checked').each(function() {
                customer.push($(this).val());
            });
            
            customer = String(customer);        
                        
            if (customer.length!==0 && customer.length!=='0') {
                app.showAppLoader(true);
                var jsonDataAddMember = {"customer_id":customer ,"group_id":groupID,"org_id":organisationID};
            
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
	            
                dataSourceAddMember.fetch(function() {
                    var loginDataView = dataSourceAddMember.data();
                    $.each(loginDataView, function(i, addGroupData) {
                        if (addGroupData.status[0].Msg==='Customer Added to group successfully') { 
                            app.hideAppLoader();
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Member Added Successfully');   
                            }else {
                                app.showAlert("Member Added Successfully", "Notification");  
                            }
                                   
                            showSubGroupMembers();
                        }else if (addGroupData.status[0].Msg==="You don't have access") {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                            }else {
                                app.showAlert(app.NO_ACCESS , 'Offline');  
                            }                     
                            showSubGroupMembers();
                            app.hideAppLoader();    
                        }else {
                            app.hideAppLoader();
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
            app.mobileApp.navigate('#removeMemberFromSubGroup');            
        };
                 
        var removeMemberClick = function() {
            var customer = [];            
            $('#deleteSubMemberData input:checked').each(function() {
                customer.push($(this).val());
            });            
            customer = String(customer);                                            
            if (customer.length!==0 && customer.length!=='0') {
                navigator.notification.confirm(app.DELETE_CONFIRM, function (confirmed) {           
                    if (confirmed === true || confirmed === 1) {              
                        app.showAppLoader();            
                        var jsonDataDeleteMember = {"customer_id":customer ,"group_id":groupID,"org_id":organisationID};            
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
                                if (deleteGroupData.status[0].Msg==='User removed successfully') { 
                                    app.hideAppLoader();
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom('Member Deleted Successfully');   
                                    }else {
                                        app.showAlert("Member Deleted Successfully", "Notification");  
                                    }
                                    showSubGroupMembers();
                                }else if (deleteGroupData.status[0].Msg==="You don't have access") {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }                     
                                    showSubGroupMembers();
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
                    window.plugins.toast.showShortBottom('Please Select Member To Delete.');   
                }else {
                    app.showAlert("Please Select Member To Delete.", "Notification");  
                }
            }      
        };
        
        var showOrgGroupView = function() {
            app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID);                
        };
        
        var backToPrePage = function() {
            app.mobileApp.navigate('views/subGroupDetailView.html');
        }

        var goToPrePageOrg = function() {
            app.mobileApp.navigate('views/groupListPage.html');
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