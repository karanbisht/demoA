var app = app || {};

app.userGroupList = (function () {
    var groupListDataSource;   
    var orgId = localStorage.getItem("UserOrgID");
    
    //console.log(orgId);
    
    var GroupsListModel = (function () {                 
        var GroupListModel = {
            id: 'Id',
            fields: {
                add: {
                        field: 'add',
                        defaultValue: new Date()
                    },
                group_name: {
                        field: 'group_name',
                        defaultValue: null
                    }
            },
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('add'));
            }
        };        
        
        groupListDataSource = new kendo.data.DataSource({
                                                            transport: {
                read: {
                                                                        url: app.serverUrl() + "group/getGroupByOrgID/" + orgId,
                                                                        type:"POST",
                                                                        dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
                                                                    }
            },
                                                            schema: {
                model: GroupListModel,                
                data: function(data) {
                    console.log(data);
                    var groupDataShow = [];
                    $.each(data, function(i, groupValue) {
                        var orgLength = groupValue[0].grpData.length;
                        for (var j = 0;j < orgLength;j++) {
                            groupDataShow.push({
                                                   pid: groupValue[0].grpData[j].pid,
                                                   group_name: groupValue[0].grpData[j].group_name,
                                                   add:groupValue[0].grpData[j].add,
                                                   group_desc:groupValue[0].grpData[j].group_desc
                                               });
                        }
                    });
                       
                    console.log(groupDataShow);
                    return groupDataShow;                       
                }

            },
                                                            error: function (e) {
                                                                //apps.hideLoading();
                                                                console.log(e);
                                                                console.log(JSON.stringify(e));
                                                                navigator.notification.alert("Please check your internet connection.",
                                                                                             function () {
                                                                                             }, "Notification", 'OK');
                                                            },       
                                                            sort: { field: 'add', dir: 'desc' }    
                                                        });
               
        return {
            groupListData: groupListDataSource
        };
    }());
    
    var activityListViewModel = (function () {
        var init = function () {
            //console.log('helloasda');
            $('#newGroup').val('');
        };
                
        var show = function() {
            $('#newGroup').val('');
        };  
                
        var groupSelected = function (e) {
            console.log("karan Bisht" + e);
            app.MenuPage = false;	
            app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        };
                
        var addGroup = function() {
            app.MenuPage = false;	
            app.mobileApp.navigate('views/addGroup.html');    
        };
        
        var deleteGroup = function() {
            app.MenuPage = false;	
            app.mobileApp.navigate('views/deleteGroup.html');    
        };
         
        var addGroupFunc = function() {            
            var group_name = $("#newGroup").val();     
            var group_description = $("#newGroupDesc").val();
            //var data = el.data('Group');
            //data.create({ 'Name' : newGroupValue },  
            // function(data){
            //   app.showAlert("Group Added Successfully","Notification");
            //   app.mobileApp.navigate('views/groupListPage.html');
            //	},
            //  function(error){
            //         app.showAlert("Please try again later","Notification");
            //	});
         
            var group_status = 'A';
            var org_id = 1; 
            
            var jsonDataSaveGroup = {"org_id":org_id ,"group_name":group_name,"group_description":group_description, "group_status":group_status}
            
            var dataSourceaddGroup = new kendo.data.DataSource({
                                                                   transport: {
                    read: {
                                                                               url: app.serverUrl() + "group/saveGroup",
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
                                                                       console.log(JSON.stringify(e));
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
                            window.plugins.toast.showShortBottom('Group Added Successfully');   
                        }else {
                            app.showAlert("Group Added Successfully", "Notification");  
                        }
                        //app.showAlert("Group Added Successfully","Notification");
                        app.mobileApp.navigate('views/groupListPage.html');
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }
                });
            });
        };
                 
        return {
            init: init,
            show: show,
            groupSelected:groupSelected,
            groupListData:GroupsListModel.groupListData
        };
    }());
        
    return activityListViewModel;
}());