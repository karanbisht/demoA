var app = app || {};


app.GroupList = (function () {
    var groupListDataSource;   
    var orgId = localStorage.getItem("UserOrgID");

    var organisationID;  
    var account_Id;
    var orgName;
    var orgDesc;
    
    var activityListViewModel = (function () {
        var GroupDataSource;           
    	     
        var init = function () {
            //console.log('helloasda');
            $('#newGroup').val('');
            $('#newGroupDesc').val('');

        };
        
        var addGroupShow = function(){
         
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
            $("#admin-groupList-loader").show();
            $("#group-listview").hide();
            $("#groupFooter").hide();
                  
            $(".km-scroll-container").css("-webkit-transform", "");
            //var tabStrip = $("#addGroupTabStrip").data("kendoMobileTabStrip");
            //tabStrip.clear();
  
            organisationID = localStorage.getItem("orgSelectAdmin");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            orgName = localStorage.getItem("orgNameAdmin");
            orgDesc = localStorage.getItem("orgDescAdmin");
                  
            //console.log('Organisation ID' + organisationID);
                  
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
                        //console.log(data);                                                                          
                        return [data]; 
                    }                                                            
                },
                 
                                                                            error: function (e) {
                                                                                $("#admin-groupList-loader").hide();
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
                                                                                
                   
                                                                                getGroupDataDB();
                                                                            }	        
                                                                        });         
   
            
            organisationGroupDataSource.fetch(function(){
                
                  
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
                                    $("#tabAddGroup").css('width','100%');
                                    showLiveData();
                                }else if(data[0]['status'][0].Msg==="Session Expired"){
                                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
                                    app.LogoutFromAdmin(); 
                                
                                
                                }else if(data[0]['status'][0].Msg==="You don't have access"){
                                    
                                    if (!app.checkSimulator()) {
                                             window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                                    }else {
                                             app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }
                                                             
                                    backToOrgDetail();
                                    
                                }else if (data[0]['status'][0].Msg==='Success') {
                                     $("#tabDeleteGroup").show();

                                    //console.log(orgVal.groupData.length);
                                    orgNotificationData = data[0]['status'][0].groupData;                                                                               
                                    //console.log(orgNotificationData);                                       
                                    saveOrgGroupNotification(orgNotificationData);                                                                                                                                                                      
                                }
                            });    
                            
               };  
    
        var orgNotiGroupDataVal;         
        function saveOrgGroupNotification(data) {                      
            orgNotiGroupDataVal = data;
            //alert('dataaaaaaaaa');
            var db = app.getDb();
            db.transaction(insertOrgGroupNotiData, app.errorCB, getGroupDataDB);
        };
                        
        function insertOrgGroupNotiData(tx) {
            var queryDelete = "DELETE FROM ADMIN_ORG_GROUP";
            app.deleteQuery(tx, queryDelete);
          
            var dataLength = orgNotiGroupDataVal.length;         
            //alert(dataLength);
    
            var orgGroupData;
          
            for (var i = 0;i < dataLength;i++) {   
                orgGroupData = orgNotiGroupDataVal[i].org_id;
           
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
                    //console.log(pos);
                    //alert(results.rows.item(i).addDate);
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
                                $("#tabAddGroup").css('width','45%');

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
                $("#tabAddGroup").css('width','100%');

            }
        }
            
        var showLiveData = function() {
            //console.log('Hello');                 
            //console.log(JSON.stringify(groupDataShow));
                
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });           
                           
            $("#group-listview").kendoMobileListView({
                                                         template: kendo.template($("#groupTemplate").html()),    		
                                                         dataSource: organisationListDataSource
                                                     });        
                
            $('#group-listview').data('kendoMobileListView').refresh();
              
            $("#admin-groupList-loader").hide();
            $("#group-listview").show();
            $("#groupFooter").show();

        };

        var backToOrgDetail = function() {
            groupDataShow = [];         
            app.mobileApp.navigate('#view-all-activities-GroupDetail');                 
            //app.slide('right', 'green' ,'3' ,'#view-all-activities-GroupDetail');
            
        }
    
        var groupSelected = function (e) {
            //console.log(e.data);
            //console.log(e.data.groupID);
            //console.log(e.data.orgID);//groupName//groupDesc
            app.MenuPage = false;	
             
            localStorage.setItem("groupIdAdmin", e.data.groupID);
            localStorage.setItem("groupNameAdmin", e.data.groupName);
            localStorage.setItem("groupDescAdmin", e.data.groupDesc);
            

            app.analyticsService.viewModel.trackFeature("User navigate to Group in Admin");            
             
            app.mobileApp.navigate('views/subGroupDetailView.html?groupID=' + e.data.groupID + '&orgID=' + e.data.orgID + '&groupName=' + e.data.groupName + '&groupDesc=' + e.data.groupDesc);
        };
                
        var addGroup = function() {
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                app.mobileApp.navigate('views/addGroup.html');  
                app.analyticsService.viewModel.trackFeature("User navigate to Add Group in Admin");            
            }            
            //app.slide('left', 'green' ,'3' ,'#views/addGroup.html'); 
        };
        
        
        
        var deleteGroup = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                app.mobileApp.navigate('views/deleteGroup.html');
                app.analyticsService.viewModel.trackFeature("User navigate to Delete Group in Admin");            
            }                       //app.slide('left', 'green' ,'3' ,'#views/deleteGroup.html');
 
        };
    
        var goToGroupList = function() {
            app.analyticsService.viewModel.trackFeature("User navigate to Group List Page in Admin");            

            app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID);                
        }
         
        var addGroupFunc = function() {            
            var group_name = $("#newGroup").val();     
            var group_description = $("#newGroupDesc").val();
            
            
            if (group_name === "Enter New Group Name" || group_name === "") {
                app.showAlert("Please enter Group Name.", "Validation Error");
            }else if (group_description === "Write Group description here (Optional) ?" || group_description === "") {
                app.showAlert("Please enter Group Description.", "Validation Error");
            }else{
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
                        console.log(data);
                        return [data];
                    }
                },
                                                                   error: function (e) {
                                                                      $("#addGroupLoader").hide();
                                                                       console.log(e);
                                                                      
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
                    //console.log(addGroupData.status[0].Msg);           
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
                        //app.showAlert("Group Added Successfully", "Notification");
                    }else if (addGroupData.status[0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }
                     
                        goToGroupList();
                    }else if(addGroupData.status[0].Msg==="Session Expired"){
                                    app.showAlert(app.SESSION_EXPIRE , 'Notification');
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
            //var orgId = localStorage.getItem("UserOrgID"); 
            //var data = $('input:checkbox:checked').val();
            
            var groupID = [];
            /*$(':checkbox:checked').each(function(i) {
                groupID[i] = $(this).val();
            });*/
            
            $('#deleteGroupData input:checked').each(function() {
                groupID.push($(this).val());
            });
            
            groupID = String(groupID);
            
            
        if(groupID.length!==0 && groupID.length!=='0'){

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
                        console.log(data);
                        return [data];
                    }
                },
                                                                       error: function (e) {
                                                                           $("#deleteGroupLoader").hide();
                                                                           console.log(e);
                                                                           
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
                    if (deleteGroupData.status[0].Msg==='Deleted Successfully') {      
                        $("#deleteGroupLoader").hide();
                        app.mobileApp.navigate('views/groupListPage.html?organisationId=' + organisationID);

                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom('Group Deleted Successfully');   
                        }else {
                            app.showAlert("Group Deleted Successfully", "Notification");  
                        }
                        //app.showAlert("Group Deleted Successfully","Notification");
                    }else if (deleteGroupData.status[0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                                window.plugins.toast.showLongBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }
                                             
                        goToGroupList();
  
                    }else if(deleteGroupData.status[0].Msg==="Session Expired"){
  
                        app.showAlert(app.SESSION_EXPIRE , 'Notification');                        
                        app.LogoutFromAdmin(); 
                                                                
                    }else {
                        $("#deleteGroupLoader").hide();
                        app.showAlert(deleteGroupData.status[0].Msg , 'Notification'); 
                    }
                });
            });
            /*$.each(val,function(i,dataValue){  
            var data = el.data('Group');
            data.destroySingle({ Id: dataValue },    		
            function(){
            delVal++;
            },
            function(error){
            });
            });*/
            
         }else{
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom('Please Select Group To Delete.');   
                        }else {
                            app.showAlert("Please Select Group To Delete.", "Notification");  
                        }

         }   
        };
          
        var showGroup = function() {

            //console.log(groupDataShow);
             
            $("#deleteGroupData").kendoListView({
                                                    template: kendo.template($("#Group-Delete-template").html()),    		
                                                    dataSource: groupDataShow 
                                                });    
        }; 
                
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
            //groupListData:GroupsListModel.groupListData
        };
    }());
        
    return activityListViewModel;
}());