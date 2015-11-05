var app = app || {};
app.attendance = (function () {
    'use strict';
    var attendanceViewModel = (function () {      
        var groupDataShow=[];      
        var selectedStudentArray=[];
        var check='';
        var comboGroupListDataSource;
        
        var organisationID;  
        var account_Id;
        var orgName;
        var orgDesc;

        var attendanceInit = function () {

        };
        
        var attendanceShow = function (e) {        
            $("#progressAdminAttendance").show();
            $("#attendance-listview").hide();
            $("#attendanceFooter").hide();
                        
            groupDataShow=[];
            selectedStudentArray=[];
                         
            $("#attendance-listview").removeClass("km-list");
             //$("#attendance-listview").removeClass("km-listinset");
             //$('#attendance-listview').find('input[type=checkbox]:checked').removeAttr('checked');            
            $(".km-filter-form").hide();
             //$("#attendance-listview").data("kendoMobileListView").destroy();            
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
                        console.log(data);                                             
                        return [data];
                    }
                },
                                                                 error: function (e) {
                                                                     //console.log(JSON.stringify(e));                                                                    
                                                                     $("#progressAdminAttendance").hide();
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
                                                                              app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
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
                                           email:'No member in group',  
                                           last_name : '',
                                           full_name:'', 
                                           customerID:'0',
                                           account_id:'0',
                                           orgID:'0'
                                       });     
                    $("#progressAdminAttendance").hide();
                    $("#attendance-listview").show();    
                    $("#attendanceFooter").hide();
                    showNoGroupDataInTemplate();

                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin();                     
                }else if (data[0]['status'][0].Msg==='Success') {  
                        for (var i = 0;i < data[0]['status'][0].customerInfo.length;i++) {                                                        
                            groupDataShow.push({
                                               mobile: data[0]['status'][0].customerInfo[i].mobile,
                                               first_name: data[0]['status'][0].customerInfo[i].first_name,
                                               email:data[0]['status'][0].customerInfo[i].email,  
                                               last_name : data[0]['status'][0].customerInfo[i].last_name,
                                               customerID:data[0]['status'][0].customerInfo[i].customerID,
                                               full_name:data[0]['status'][0].customerInfo[i].first_name+" "+data[0]['status'][0].customerInfo[i].last_name, 
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

        var showGroupDataInTemplate = function(){           
            $(".km-scroll-container").css("-webkit-transform", "");

            $("#progressAdminAttendance").hide();
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
             //$("#attendance-listview").removeClass("km-list");            
        };
                       
        var showNoGroupDataInTemplate = function(){           
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#progressAdminAttendance").hide();
            $("#attendance-listview").show();
            //$("#attendanceFooter").show();            

            var comboGroupListDataSourceNo = new kendo.data.DataSource({
                                          data: groupDataShow
            });              
            
            $("#attendance-listview").kendoListView({
                            dataSource: comboGroupListDataSourceNo,                                        
                            template: kendo.template($("#attendanceTemplate").html())
            });                            
            //$("#attendance-listview").removeClass("km-list");            
        };
                 
        var backToOrgDetail = function() {
            app.mobileApp.navigate("#view-all-activities-GroupDetail");
        };

          
        var backToSelectGroup = function() {
            app.mobileApp.navigate("#attendancePageGroupList");
        };
        var markAsAbsent = function(){            
            var organisationID = localStorage.getItem("orgSelectAdmin");                         
            var group = [];		            
                $('#attendance-listview input:checked').each(function() {
                    group.push($(this).val());
                });
            
                group = String(group);                 
                //console.log(group);
        
            if (group.length!==0 && group.length!=='0') {
                  if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                  }else {                           

                      $("#progressAdminAttendance").show();

                      //console.log(organisationID+"||"+group);
                      var typeVal="A";
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
                        //console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(e);
                                                                    //console.log(JSON.stringify(e));                                                                    
                                                                    $("#progressAdminAttendance").hide();
                                                                    
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
	            
               dataSourceLogin.fetch(function() {
                var data = this.data();                                               
                    if (data[0]['status'][0].Msg==="Session Expired") {
                        //app.showAlert(app.SESSION_EXPIRE , 'Notification');
                        app.LogoutFromAdmin(); 
                    }else if (data[0]['status'][0].Msg==='Notification Sent') {                     
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom("User marked as Absent");  
                                }else {
                                    app.showAlert("User marked as Absent", "Notification");  
                                }     
                                                
                        $("#progressAdminAttendance").hide();
                        selectedStudentArray=[];
                        $('#attendance-listview').find('input[type=checkbox]:checked').removeAttr('checked');
                    
                    }else if (data[0]['status'][0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }
                         backToOrgDetail();                          
                    }else{                       
                        app.showAlert(data[0]['status'][0].Msg , 'Notification'); 
                        $("#progressAdminAttendance").hide();
                    }

                   $("#progressAdminAttendance").hide();

                });
              }        
                      
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Select student to mark as absent.');   
                }else {
                    app.showAlert("Select student to mark as absent.", "Notification");  
                }
            }                            
        };
        
        var markAsPresent = function(){
            var organisationID = localStorage.getItem("orgSelectAdmin");                         
            var group = [];		                
            $('#attendance-listview input:checked').each(function() {
                group.push($(this).val());
            });            
            group = String(group);                   
            //console.log(group);
          
            if (group.length!==0 && group.length!=='0') {
                  if (!app.checkConnection()) {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                    }else {
                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                    } 
                  }else {     
                      

                      $("#progressAdminAttendance").show();

                      //console.log(organisationID+"||"+group);
                      var typeVal="P";
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
                        //console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(e);
                                                                    //console.log(JSON.stringify(e));

                                                                    $("#progressAdminAttendance").hide();
                                                                    
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
	            
               dataSourceLogin.fetch(function() {
                var data = this.data();                                               
                    if (data[0]['status'][0].Msg==="Session Expired") {
                        //app.showAlert(app.SESSION_EXPIRE , 'Notification');
                        app.LogoutFromAdmin(); 
                    }else if (data[0]['status'][0].Msg==='Notification Sent') {                     
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom("User marked as Present");  
                                }else {
                                    app.showAlert("User marked as Present", "Notification");  
                                }     
                                                
                        $("#progressAdminAttendance").hide();
                        selectedStudentArray=[];
                        $('#attendance-listview').find('input[type=checkbox]:checked').removeAttr('checked');
                    
                    }else if (data[0]['status'][0].Msg==="You don't have access") {
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                        }else {
                            app.showAlert(app.NO_ACCESS , 'Offline');  
                        }
                         backToOrgDetail();                          
                    }else{                       
                        app.showAlert(data[0]['status'][0].Msg , 'Notification'); 
                        $("#progressAdminAttendance").hide();
                    }

                   $("#progressAdminAttendance").hide();

                });
              }        

    
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom('Select student to mark as present.');   
                }else {
                    app.showAlert("Select student to mark as present.", "Notification");  
                }
            }                            
        };
        

        var checkClick = function(val){
            var arrayLength = groupDataShow.length;
            
            //console.log(groupDataShow);
            
            for(var i=0; i<arrayLength;i++){               
              //console.log(groupDataShow[i].customerID +"||"+ val);
                
              if(parseInt(groupDataShow[i].customerID) === parseInt(val)){
                     //alert(groupDataShow[i].customerID +"||"+val);    
                  
                  //alert(i);
                  
                      check = 'checked';                                                                      
                      groupDataShow[i].check=check;
                  
                                      /*groupDataShow.push({
                                               mobile: groupDataShow[i].mobile,
                                               first_name: groupDataShow[i].first_name,
                                               email:groupDataShow[i].email,  
                                               last_name : groupDataShow[i].last_name,
                                               customerID:groupDataShow[i].customerID,
                                               account_id:groupDataShow[i].account_id,
                                               check:check,
                                               orgID:groupDataShow[i].orgID
                                           });*/
                  
              }  
            }            
            
            //console.log(groupDataShow);
            
            comboGroupListDataSource = new kendo.data.DataSource({
                                          data: groupDataShow
            });  
            
            var pos = $.inArray(val, selectedStudentArray);
            if (pos === -1) {
                        selectedStudentArray.push(val);								                    
            }else{
                var j = selectedStudentArray.indexOf(val);               
                if(j !== -1) {
	                selectedStudentArray.splice(j, 1);
                }
            }
            //console.log(selectedStudentArray);
        };
        
        var attendanceGroupDataShow = [];
        var showGroup = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");
            $("#attendance-groupList-loader").show();
            $("#attendanceGroup-listview").hide();
                    
           var organisationID = localStorage.getItem("orgSelectAdmin");
           //orgDesc = localStorage.getItem("orgDescAdmin");
                                    
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
                        console.log(data);                                                                          
                        return [data]; 
                    }                                                            
                },
                 
                                                                            error: function (e) {
                                                                              $("#attendance-groupList-loader").hide();                   
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
                                                                                //getGroupDataDB();
                                                                            }	        
                                                                        });         
   
            
            organisationGroupDataSource.fetch(function(){
                  //var orgNotificationData;
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
                                    //showLiveData();
                                }else if(data[0]['status'][0].Msg==="Session Expired"){
                                    app.LogoutFromAdmin(); 
                                }else if(data[0]['status'][0].Msg==="You don't have access"){                                    
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
                                    //saveOrgGroupNotification(orgNotificationData);                                                                                                                                                                      
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
              
            $("#attendance-groupList-loader").hide();
            $("#attendanceGroup-listview").show();
        };
        
         var attendanceGroupSelected = function (e) {   
            console.log(e.data); 
            localStorage.setItem("attendanceGroupId", e.data.groupID);                         
            app.analyticsService.viewModel.trackFeature("User navigate to Attendance Module in Admin Attendance Group Page");                         
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
            checkClick:checkClick,
            markAsPresent:markAsPresent,
            backToOrgDetail:backToOrgDetail,
            backToSelectGroup:backToSelectGroup,
            comboGroupListDataSource:comboGroupListDataSource,
            markAsAbsent:markAsAbsent    
        };
        
    }());

    return attendanceViewModel;
}());
