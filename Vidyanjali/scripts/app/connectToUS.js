var app = app || {};
app.connectToUS = (function () {
    'use strict';
    var connectModel = (function () {
        var device_type;
        var account_Id;
        var userOrgId;
        var selectedGroup;
        var userGroupDataShow = [];
        var userAdminDataList = [];
        var init = function() {
            
        };
    
        var show = function(e) {
            console.log('show');
            $(".km-scroll-container").css("-webkit-transform", ""); 
            device_type = localStorage.getItem("DEVICE_TYPE"); 
            account_Id = localStorage.getItem("ACCOUNT_ID");
            userOrgId = localStorage.getItem("selectedOrgId");

            //var dataToS = $.cookie();
            //console.log(JSON.stringify(dataToS));
            
            //$.cookie('name', '1234567890123121412');
            
            //console.log($.cookie('name')); // => "value"
            //console.log($.cookie('nothing')); 
            
            $("#adminListFromGroup option:selected").removeAttr("selected");
            $('#adminListFromGroup').empty();

            getGroupToShowInCombo();
        };
        
        
        var getGroupToShowInCombo = function(e) {
            $("#progressConnectLoader").show();
            $("#connectContent").hide();
            
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                       transport: {
                                                                read: {
                                                                       url: app.serverUrl() + "group/getCustomerGroup/" + userOrgId + "/A/"+account_Id,
                                                                       type:"POST",
                                                                       dataType: "json"
                                                                      }
                                                                    },
                                                                       schema: {               
                    data: function(data) {
                        console.log(JSON.stringify(data));
                        //console.log(data);
                        return [data];                       
                    }
                },
                                                                         error: function (e) {
                                                                            //console.log(JSON.stringify(e));
                                                                             console.log(e);
                                                                            $("#progressConnectLoader").hide();
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
            
            comboGroupListDataSource.fetch(function() {                                                       
                userGroupDataShow = [];
                var data = this.data();                                                            
                if (data[0]['status'][0].Msg==='No Group') {
                   userGroupDataShow=[];
                   app.noGroupAvailableOTO();
                   app.callUserLogin(); 
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    userGroupDataShow=[];
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    app.callUserLogin();
                }else if (data[0]['status'][0].Msg==="Success") {
                    var orgLength = data[0].status[0].groupData.length;
                    for (var j = 0;j < orgLength;j++) {
                        userGroupDataShow.push({
                                               group_name: data[0].status[0].groupData[j].group_name,
                                               pid:data[0].status[0].groupData[j].pid
                                           });
                    }
                    showGroupDataInTemplate();
                }                  
            });
        };
        
        var showGroupDataInTemplate = function() {         
            $(".km-scroll-container").css("-webkit-transform", "");                     
            $.each(userGroupDataShow, function (index, value) {
                $('#adminListFromGroup').append($('<option/>', { 
                    value: value.pid,
                    text : value.group_name 
                }));
            });
            
            selectedGroup = userGroupDataShow[0].pid;
            getAdminFromGroup();
        }
        
        $(document.body).on('change',"#adminListFromGroup",function (e) {
           selectedGroup= $("#adminListFromGroup option:selected").val();
           getAdminFromGroup(); 
        });
        
        function getAdminFromGroup(){
            $("#progressConnectLoader").show();
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             url: app.serverUrl() + "group/getGroupAdmin/"+selectedGroup,
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
                userAdminDataList = [];
                if (data[0]['status'][0].Msg ==='No Admin') {     
                      userAdminDataList.push({
                                           mobile: '',
                                           first_name: '',
                                           email:'No Admin in this Group',  
                                           last_name : '',
                                           customerID:'0',
                                           account_id:'0',
                                           orgID:'0'
                                       });     
                }else if (data[0]['status'][0].Msg==='Success') {
                    for (var i = 0;i < data[0]['status'][0].userData.length;i++) {
                        userAdminDataList.push({
                                               mobile: data[0]['status'][0].userData[i].mobile,
                                               first_name: data[0]['status'][0].userData[i].user_fname,
                                               email:data[0]['status'][0].userData[i].user_email,  
                                               last_name : data[0]['status'][0].userData[i].user_lname,
                                               full_name:data[0]['status'][0].userData[i].user_fname+" "+data[0]['status'][0].userData[i].user_lname,
                                               pid:data[0]['status'][0].userData[i].pid,
                                               account_id:data[0]['status'][0].userData[i].accountID,
                                               photo:data[0]['status'][0].userData[i].photo,
                                               orgID:data[0]['status'][0].userData[i].org_id
                                           });
                    }     
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                }                
                showAdminDataFunc(userAdminDataList);
            });
        }
        
        function showAdminDataFunc(data) {
            $("#progressConnectLoader").hide();  
            $("#connectContent").show();
            
            $("#groupAdmin-listview").kendoMobileListView({
                            dataSource: data,                                        
                            template: kendo.template($("#groupAdminTemplate").html())                           
            });            
            $('#groupAdmin-listview').data('kendoMobileListView').refresh();          
        }   
        
        
        
        var clickOnGroupAdmin = function(e) {
            console.log(e.data);
            localStorage.setItem("selAdmPhoto", e.data.photo);
            localStorage.setItem("selAdmPid", e.data.pid);
            localStorage.setItem("selAdmFulName", e.data.full_name);
            localStorage.setItem("selAdmAccId", e.data.account_id);
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                 app.analyticsService.viewModel.trackFeature("User navigate to Connect To Us ");            
                 app.mobileApp.navigate('views/connectToUsWindow.html');       
            }            
        };
        
        
        
        return {
            init: init,
            show: show,
            clickOnGroupAdmin:clickOnGroupAdmin
        };
    }());        
    return connectModel;
}());