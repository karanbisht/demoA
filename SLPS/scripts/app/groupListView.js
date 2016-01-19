var app = app || {};

app.GroupList = (function () {
    var organisationID;  
    var account_Id;
    var orgName;
    var orgDesc;
    
    var activityListViewModel = (function () {
        var init = function () {
            $('#newGroup').val('');
            $('#newGroupDesc').val('');
        };
        
        var addGroupShow = function() {
            $('#newGroup').val('');
            $('#newGroupDesc').val('');
            
            $('#newGroupDesc').css('height', '40px');

            var txt = $('#newGroupDesc'),
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
        }
                
        var show = function(e) {
            app.showAppLoader();
            $("#group-listview").hide();
            $("#groupFooter").hide();
                  
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#popover-orgGroup").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");
              
            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            orgName = localStorage.getItem("orgNameAdmin");
            orgDesc = localStorage.getItem("orgDescAdmin");
                  
            $('#newGroup').val('');
            groupDataShow = [];      
    
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
                                                                                    app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                }
                   
                                                                                getGroupDataDB();
                                                                            }	        
                                                                        });         
            
            organisationGroupDataSource.fetch(function() {
                var orgNotificationData;
                  
                var data = this.data();
                
                if (data[0]['status'][0].Msg ==='No Group list') {
                    groupDataShow.push({
                                           orgName: '',
                                           groupID:0,
                                           groupName:'No Group',
                                           organisationID:'',
                                           groupDesc:'No Group in this Organization',
                                           addDate:''  
                                       });   
                    
                    $("#tabDeleteGroup").hide();
                    $("#tabAddGroup").css('width', '100%');
                    showLiveData();
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
                    $("#tabDeleteGroup").show();

                    orgNotificationData = data[0]['status'][0].groupData;                                                                               
                    saveOrgGroupNotification(orgNotificationData);                                                                                                                                                                      
                }
            });    
        };  
    
        var orgNotiGroupDataVal;         
        function saveOrgGroupNotification(data) {                      
            orgNotiGroupDataVal = data;
            var db = app.getDb();
            db.transaction(insertOrgGroupNotiData, app.errorCB, getGroupDataDB);
        };
                        
        function insertOrgGroupNotiData(tx) {
            var queryDelete = "DELETE FROM ADMIN_ORG_GROUP";
            app.deleteQuery(tx, queryDelete);
          
            var dataLength = orgNotiGroupDataVal.length;         
              
            for (var i = 0;i < dataLength;i++) {   
                var query = 'INSERT INTO ADMIN_ORG_GROUP(org_id ,groupID ,org_name ,group_name ,group_desc,addDate) VALUES ("'
                            + orgNotiGroupDataVal[i].org_id
                            + '","'
                            + orgNotiGroupDataVal[i].pid
                            + '","'
                            + orgNotiGroupDataVal[i].org_name
                            + '","'
                            + orgNotiGroupDataVal[i].group_name
                            + '","'
                            + orgNotiGroupDataVal[i].group_desc
                            + '","'
                            + orgNotiGroupDataVal[i].add
                            + '")';              
                app.insertQuery(tx, query);
            }                                                 
        }
    
        var getGroupDataDB = function() {
            var db = app.getDb();
            db.transaction(getDataOrg, app.errorCB, showLiveData);     
        }
    
        var getDataOrg = function(tx) {
            var query = "SELECT * FROM ADMIN_ORG_GROUP where org_id=" + organisationID;
            app.selectQuery(tx, query, getDataSuccess);
        };
            
        var groupDataShow = [];            
        function getDataSuccess(tx, results) {                        
            groupDataShow = []; 
            var tempArray = [];
            var count = results.rows.length;                       
            if (count !== 0) {                
                for (var i = 0 ; i < count ; i++) {
                    var pos = $.inArray(results.rows.item(i).groupID, tempArray);
                    if (pos === -1) {
                        tempArray.push(results.rows.item(i).groupID); 
                        groupDataShow.push({
                                               orgName: results.rows.item(i).org_name,
                                               groupID: results.rows.item(i).groupID,
                                               groupName: results.rows.item(i).group_name,
                                               orgID:results.rows.item(i).org_id,
                                               groupDesc:results.rows.item(i).group_desc,
                                               addDate:results.rows.item(i).addDate
                                           });
                    }
                }  
                $("#tabDeleteGroup").show();
                $("#tabAddGroup").css('width', '45%');
            }else {                    
                groupDataShow.push({
                                       orgName: '',
                                       groupID:'',
                                       groupName:'No Group',
                                       organisationID:'',
                                       groupDesc:'No Group in this Organization',
                                       addDate:''  
                                   });   
                    
                $("#tabDeleteGroup").hide();
                $("#tabAddGroup").css('width', '100%');
            }
        }
            
        var showLiveData = function() {
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });           
                           
            $("#group-listview").kendoMobileListView({
                                                         template: kendo.template($("#groupTemplate").html()),    		
                                                         dataSource: organisationListDataSource
                                                     });        
                
            $('#group-listview').data('kendoMobileListView').refresh();
            app.hideAppLoader();  
            $("#group-listview").show();
            $("#groupFooter").show();
        };

        var backToOrgDetail = function() {
            groupDataShow = [];         
            app.mobileApp.navigate('#view-all-activities-GroupDetail');                             
        }
    
        var groupSelected = function (e) {
            localStorage.setItem("groupIdAdmin", e.data.groupID);
            localStorage.setItem("groupNameAdmin", e.data.groupName);
            localStorage.setItem("groupDescAdmin", e.data.groupDesc);

            app.analyticsService.viewModel.trackFeature("User navigate to Group in Admin");            
             
            app.mobileApp.navigate('views/subGroupDetailView.html?groupID=' + e.data.groupID + '&orgID=' + e.data.orgID + '&groupName=' + e.data.groupName + '&groupDesc=' + e.data.groupDesc);
        };
                
        var addGroup = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('views/addGroup.html');  
                app.analyticsService.viewModel.trackFeature("User navigate to Add Group in Admin");            
            }            
        };
        
        var deleteGroup = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('views/deleteGroup.html');
                app.analyticsService.viewModel.trackFeature("User navigate to Delete Group in Admin");            
            }                       
        };
    
        var goToGroupList = function() {
            app.analyticsService.viewModel.trackFeature("User navigate to Group List Page in Admin");            
            app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID);                
        }
         
        var addGroupFunc = function() {            
            var group_name = $("#newGroup").val();     
            var group_description = $("#newGroupDesc").val();
            
            if (group_name === "Enter New Group Name" || group_name === "") {
                app.showAlert("Please enter Group Name.", app.APP_NAME);
                /*}else if (group_description === "Write Group description here (Optional) ?" || group_description === "") {
                app.showAlert("Please enter Group Description.", app.APP_NAME);*/
            }else {
                $("#addGroupLoader").show();
                var jsonDataSaveGroup = {"org_id":organisationID ,"txtGrpName":group_name,"txtGrpDesc":group_description}
            
                var dataSourceaddGroup = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "group/add",
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
                                                                           $("#addGroupLoader").hide();
                                                                      
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
                                                                               app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                           }
                                                                       }               
          
                                                                   });  
	            
                dataSourceaddGroup.fetch(function() {
                    var loginDataView = dataSourceaddGroup.data();
                    $.each(loginDataView, function(i, addGroupData) {
                        if (addGroupData.status[0].Msg==='Group added successfully') {         
                            $("#addGroupLoader").hide();
                            app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID);
                            $("#newGroup").val('');     
                            $("#newGroupDesc").val('');
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Group Added Successfully');   
                            }else {
                                app.showAlert("Group Added Successfully", "Notification");  
                            }
                        }else if (addGroupData.status[0].Msg==="You don't have access") {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                            }else {
                                app.showAlert(app.NO_ACCESS , 'Offline');  
                            }
                     
                            goToGroupList();
                        }else if (addGroupData.status[0].Msg==="Session Expired") {
                            app.LogoutFromAdmin(); 
                        }else {
                            $("#addGroupLoader").hide();
                            app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            }      
        };
                
        var deleteGroupFunc = function() {
            var groupID = [];
            
            $('#deleteGroupData input:checked').each(function() {
                groupID.push($(this).val());
            });
            
            groupID = String(groupID);
            
            if (groupID.length!==0 && groupID.length!=='0') {
                $("#deleteGroupLoader").show();
            
                var jsonDataDelete = {"group_id":groupID ,"orgID":organisationID}
            
                var dataSourceDeleteMember = new kendo.data.DataSource({
                                                                           transport: {
                        read: {
                                                                                       url: app.serverUrl() + "group/delete",
                                                                                       type:"POST",
                                                                                       dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                       data: jsonDataDelete
                                                                                   }
                    },
                                                                           schema: {
                        data: function(data) {
                            return [data];
                        }
                    },
                                                                           error: function (e) {
                                                                               $("#deleteGroupLoader").hide();
                                                                           
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
                                                                                   app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                               }
                                                                           }                         
                                                                       });  
	            
                dataSourceDeleteMember.fetch(function() {
                    var loginDataView = dataSourceDeleteMember.data();
                    $.each(loginDataView, function(i, deleteGroupData) {
                        if (deleteGroupData.status[0].Msg==='Deleted Successfully') {      
                            $("#deleteGroupLoader").hide();
                            app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID);

                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Group Deleted Successfully');   
                            }else {
                                app.showAlert("Group Deleted Successfully", "Notification");  
                            }
                        }else if (deleteGroupData.status[0].Msg==="You don't have access") {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                            }else {
                                app.showAlert(app.NO_ACCESS , 'Offline');  
                            }
                                             
                            goToGroupList();
                        }else if (deleteGroupData.status[0].Msg==="Session Expired") {
                            app.LogoutFromAdmin(); 
                        }else {
                            $("#deleteGroupLoader").hide();
                            app.showAlert(deleteGroupData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Please Select Group To Delete.');   
                }else {
                    app.showAlert("Please Select Group To Delete.", "Notification");  
                }
            }   
        };
          
        var showGroup = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
            $(".km-filter-form").hide();
            
            $("#deleteGroupData").kendoMobileListView({
                                                          dataSource: groupDataShow,                                        
                                                          template: kendo.template($("#Group-Delete-template").html()),
                                                          filterable: {
                    field: "groupName",
                    operator: "contains",
                },
                                                      });
            
            $('#deleteGroupData').data('kendoMobileListView').refresh();          
        }
                
        return {
            init: init,
            show: show,
            groupSelected:groupSelected,
            deleteGroupFunc:deleteGroupFunc,
            addGroup:addGroup,
            goToGroupList:goToGroupList,
            deleteGroup:deleteGroup,
            backToOrgDetail:backToOrgDetail,
            showGroup:showGroup,
            addGroupShow:addGroupShow,
            addGroupFunc:addGroupFunc                        
        };
    }());
        
    return activityListViewModel;
}());