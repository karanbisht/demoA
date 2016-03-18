var app = app || {};
app.attendance = (function () {
    'use strict';
    var attendanceViewModel = (function () {      
        var groupDataShow = [];      
        var check = '';
        var comboGroupListDataSource;
        
        var attendanceInit = function () {
        };
        
        var attendanceShow = function (e) {        
            app.showAppLoader(true);
            $("#popover-markAttend").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");
            
            $("#attendance-listview").hide();
            $("#attendanceFooter").hide();
                        
            groupDataShow = [];

            $("#attendance-listview").removeClass("km-list");
            $(".km-filter-form").hide();
            getGroupToShowInCombo();                                            
        };
               
        var getGroupToShowInCombo = function() {                           
            var organisationID = localStorage.getItem("orgSelectAdmin");  
            var selectedGroupID = localStorage.getItem("attendanceGroupId");            
        
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "group/getCustomerByGroupID/" + selectedGroupID + "/" + organisationID,
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
                                                                     $("#attendance-listview").show();
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
                groupDataShow = [];
                if (data[0]['status'][0].Msg ==='No member in group') {                        
                    groupDataShow.push({
                                           mobile: '',
                                           first_name: '',
                                           email:'No member in this group',  
                                           last_name : '',
                                           full_name:'', 
                                           customerID:'0',
                                           account_id:'0',
                                           orgID:'0'
                                       });     
                    app.hideAppLoader();
                    $("#attendance-listview").show();    
                    $("#attendanceFooter").hide();
                    showNoGroupDataInTemplate();
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin();                     
                }else if (data[0]['status'][0].Msg==='Success') {  
                    groupDataShow.push({
                                           mobile:'' ,
                                           first_name:'SELECT' ,
                                           email:'',  
                                           photo:'',
                                           last_name :'ALL',
                                           customerID:'000',
                                           full_name:'SELECT' + " " + 'ALL', 
                                           inputID:'AMSL',
                                           check:check,
                                           orgID:''
                                       });
                    
                    for (var i = 0;i < data[0]['status'][0].customerInfo.length;i++) {                                                        
                        groupDataShow.push({
                                               mobile: data[0]['status'][0].customerInfo[i].mobile,
                                               first_name: data[0]['status'][0].customerInfo[i].first_name,
                                               email:data[0]['status'][0].customerInfo[i].email,  
                                               photo:data[0]['status'][0].customerInfo[i].photo,
                                               last_name : data[0]['status'][0].customerInfo[i].last_name,
                                               customerID:data[0]['status'][0].customerInfo[i].customerID,
                                               full_name:data[0]['status'][0].customerInfo[i].first_name + " " + data[0]['status'][0].customerInfo[i].last_name, 
                                               inputID:'AM' + i,
                                               check:check,                                               
                                               orgID:data[0]['status'][0].customerInfo[i].orgID
                                           });
                    }     
                    $("#attendanceFooter").show();
                    showGroupDataInTemplate();
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                    
                    backToOrgDetail();  
                }                
            });
        };

        var showGroupDataInTemplate = function() {     
            $(".km-scroll-container").css("-webkit-transform", "");
            app.hideAppLoader();
            $("#attendance-listview").show();
            $("#attendanceFooter").show();            

            comboGroupListDataSource = new kendo.data.DataSource({
                                                                     data: groupDataShow
                                                                 });              
            
            $("#attendance-listview").kendoMobileListView({
                                                              dataSource: comboGroupListDataSource,                                        
                                                              template: kendo.template($("#attendanceTemplate").html()),
                                                              filterable: {
                    field: "full_name",
                    operator: "contains",
                },
                                                          });        
            $('#attendance-listview').data('kendoMobileListView').refresh(); 
        };
                       
        var showNoGroupDataInTemplate = function() {           
            $(".km-scroll-container").css("-webkit-transform", "");
            app.hideAppLoader();
            $("#attendance-listview").show();

            var comboGroupListDataSourceNo = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });              
            
            $("#attendance-listview").kendoListView({
                                                        dataSource: comboGroupListDataSourceNo,                                        
                                                        template: kendo.template($("#attendanceTemplate").html())
                                                    });                            
        };

        $(document).on("click", "#attendance-listview li input" , function (event) {   
            var memberIndex = $(this).attr('id');
            if (memberIndex==='AMSL') {
                if ($("#AMSL").prop('checked')===false) {                      
                    $('#attendance-listview input').prop('checked', false);                         
                }else {
                    $('#attendance-listview input').prop('checked', true);                         
                }    
                $('#attendance-listview input').change();
            }else {
                $('#AMSL').prop('checked', false);
                $('#attendance-listview input').change();
            }            
        }); 
                 
        var backToOrgDetail = function() {
            app.mobileApp.navigate("#view-all-activities-GroupDetail");
        };
          
        var backToSelectGroup = function() {
            app.mobileApp.navigate("#attendancePageGroupList");
        };
        
        var markAsAbsent = function() {            
            var organisationID = localStorage.getItem("orgSelectAdmin");                         
            var group = [];		            
            $('#attendance-listview input:checked').each(function() {
                if ($(this).val()!=='000') {
                    group.push($(this).val());
                }    
            });            
            group = String(group);                         
            
            if (group.length!==0 && group.length!=='0') {
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else {
                    navigator.notification.confirm(app.ABSENT_CONFIRM, function (confirmed) {           
                        if (confirmed === true || confirmed === 1) {
                            app.showAppLoader(true);

                            var typeVal = "A";
                            var jsonDataLogin = {"org_id":organisationID,"cust_id":group,"type":typeVal};            
                            var dataSourceLogin = new kendo.data.DataSource({
                                                                                transport: {
                                    read: {
                                                                                            url: app.serverUrl() + "notification/attendance",
                                                                                            type:"POST",
                                                                                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                            data: jsonDataLogin
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
	            
                            dataSourceLogin.fetch(function() {
                                var data = this.data();                                               
                                if (data[0]['status'][0].Msg==="Session Expired") {
                                    app.LogoutFromAdmin(); 
                                }else if (data[0]['status'][0].Msg==='Notification Sent') {                     
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom("User marked as Absent");  
                                    }else {
                                        app.showAlert("User marked as Absent", "Notification");  
                                    }     
                                    app.hideAppLoader();                                                
                                    $('#attendance-listview').find('input[type=checkbox]:checked').removeAttr('checked');
                                }else if (data[0]['status'][0].Msg==="You don't have access") {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }
                                    backToOrgDetail();                          
                                }else {                       
                                    app.showAlert(data[0]['status'][0].Msg , 'Notification'); 
                                    app.hideAppLoader();
                                }

                                app.hideAppLoader();
                            });
                        }
                    }, app.APP_NAME, ['Yes', 'No']);
                }        
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Select student to mark as absent.');   
                }else {
                    app.showAlert("Select student to mark as absent.", "Notification");  
                }
            }                        
        };
        
        var markAsPresent = function() {
            var organisationID = localStorage.getItem("orgSelectAdmin");                         
            var group = [];		                
            $('#attendance-listview input:checked').each(function() {
                if ($(this).val()!=='000') { 
                    group.push($(this).val());
                }    
            });            
            group = String(group);                   
            if (group.length!==0 && group.length!=='0') {
                if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                }else {     
                    navigator.notification.confirm(app.PRESENT_CONFIRM, function (confirmed) {           
                        if (confirmed === true || confirmed === 1) {
                            app.showAppLoader(true);

                            var typeVal = "P";
                            var jsonDataLogin = {"org_id":organisationID,"cust_id":group,"type":typeVal};            
                            var dataSourceLogin = new kendo.data.DataSource({
                                                                                transport: {
                                    read: {
                                                                                            url: app.serverUrl() + "notification/attendance",
                                                                                            type:"POST",
                                                                                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                            data: jsonDataLogin
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
	            
                            dataSourceLogin.fetch(function() {
                                var data = this.data();                                               
                                if (data[0]['status'][0].Msg==="Session Expired") {
                                    app.LogoutFromAdmin(); 
                                }else if (data[0]['status'][0].Msg==='Notification Sent') {                     
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom("User marked as Present");  
                                    }else {
                                        app.showAlert("User marked as Present", "Notification");  
                                    }     
                                    app.hideAppLoader();
                                    $('#attendance-listview').find('input[type=checkbox]:checked').removeAttr('checked');
                                }else if (data[0]['status'][0].Msg==="You don't have access") {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }
                                    backToOrgDetail();                          
                                }else {                       
                                    app.showAlert(data[0]['status'][0].Msg , 'Notification'); 
                                    app.hideAppLoader();
                                }

                                app.hideAppLoader();
                            });
                        }
                    }, app.APP_NAME, ['Yes', 'No']);
                } 
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Select student to mark as present.');   
                }else {
                    app.showAlert("Select student to mark as present.", "Notification");  
                }
            }                            
        };
        
        var attendanceGroupDataShow = [];
        var showGroup = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
            app.showAppLoader();
            $("#attendanceGroup-listview").hide();
                    
            var organisationID = localStorage.getItem("orgSelectAdmin");
                                    
            attendanceGroupDataShow = [];      
    
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
                    attendanceGroupDataShow.push({
                                                     orgName: '',
                                                     groupID:0,
                                                     groupName:'No Group',
                                                     organisationID:'',
                                                     groupDesc:'No Group in this Organization',
                                                     addDate:''  
                                                 });                       
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
                        attendanceGroupDataShow.push({
                                                         orgName: data[0]['status'][0].groupData[i].org_name,
                                                         groupID:data[0]['status'][0].groupData[i].pid,
                                                         groupName:data[0]['status'][0].groupData[i].group_name,
                                                         organisationID:data[0]['status'][0].groupData[i].org_id,
                                                         groupDesc:data[0]['status'][0].groupData[i].group_desc,
                                                         addDate:data[0]['status'][0].groupData[i].add  
                                                     }); 
                    }                                       
                }
                showLiveData();
            });                                
        };  

        var showLiveData = function() {
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: attendanceGroupDataShow
                                                                       });                                      
            $("#attendanceGroup-listview").kendoMobileListView({
                                                                   template: kendo.template($("#attendanceGroupTemplate").html()),    		
                                                                   dataSource: organisationListDataSource
                                                               });                        
            $('#attendanceGroup-listview').data('kendoMobileListView').refresh();              
            app.hideAppLoader();
            $("#attendanceGroup-listview").show();
        };
        
        var attendanceGroupSelected = function (e) {   
            localStorage.setItem("attendanceGroupId", e.data.groupID);                         
            //app.analyticsService.viewModel.trackFeature("User navigate to Attendance Module in Admin Attendance Group Page");                         
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else {                
                app.mobileApp.navigate('#attendancePage');
            }
        };
        
        return {
            attendanceInit: attendanceInit,
            attendanceShow: attendanceShow,
            showGroup:showGroup,
            attendanceGroupSelected:attendanceGroupSelected,
            markAsPresent:markAsPresent,
            backToOrgDetail:backToOrgDetail,
            backToSelectGroup:backToSelectGroup,
            comboGroupListDataSource:comboGroupListDataSource,
            markAsAbsent:markAsAbsent    
        };
    }());

    return attendanceViewModel;
}());
