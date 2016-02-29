var app = app || {};
app.createAdmMsg = (function () {
    'use strict';
    var connectModel = (function () {
        var device_type;
        var account_Id;
        var userOrgId;
        //var selectedGroup;
        var userGroupDataShow = [];
        var userAdminDataList = [];
        var selectedCustGroup;

        var init = function() {
            
        };
    
        var show = function(e) {
            $(".km-scroll-container").css("-webkit-transform", ""); 
            device_type = localStorage.getItem("DEVICE_TYPE"); 
            account_Id = localStorage.getItem("ACCOUNT_ID");
            userOrgId = localStorage.getItem("selectedOrgId");


            $('#custSendMsgDesc').css('height', '40px');

            var txt = $('#custSendMsgDesc'),
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
            
            $("#custGroupToSelect option:selected").removeAttr("selected");
            $('#custGroupToSelect').empty();

            $("#groupAdminToSelect option:selected").removeAttr("selected");
            $('#groupAdminToSelect').empty();

            $("#custSendMsgDesc").val('');

            getGroupToShowInCombo();
        };
        
        
        var getGroupToShowInCombo = function(e) {
            
            app.showAppLoader(true);
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
                        //console.log(JSON.stringify(data));
                        //console.log(data);
                        return [data];                       
                    }
                },
                                                                         error: function (e) {
                                                                             //console.log(JSON.stringify(e));
                                                                             //console.log(e);
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
                                                                         
                                                                         }  	     
                                                                     });
            
            comboGroupListDataSource.fetch(function() {                                                       
                userGroupDataShow = [];
                var data = this.data();                                                            
                if (data[0]['status'][0].Msg==='No Group') {
                   userGroupDataShow=[];
                   app.noGroupAvailableOTO();
                   app.callUserLogin(); 
                   app.hideAppLoader(true);
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    userGroupDataShow=[];
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    app.callUserLogin();
                    app.hideAppLoader(true);
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
                $('#custGroupToSelect').append($('<option/>', { 
                    value: value.pid,
                    text : value.group_name 
                }));
                selectedCustGroup=value.pid;
            });
        
            app.hideAppLoader();
            
            //console.log(selectedCustGroup);
            getAdminFromGroup();
        }
        
        /*$(document.body).on('change',"#custGroupToSelect",function (e) {
           selectedGroup= $("#custGroupToSelect option:selected").val();
           getAdminFromGroup(); 
        });*/
                        
        var sendQueryToAdm = function(){
         //console.log('Submit clicked');
         if (!app.checkConnection()) {
               if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
         }else {
                var selectedAdm;
                $('#groupAdminToSelect :selected').each(function(i, selected) { 
                    selectedAdm = $(selected).val(); 
                });  

                var admTextMesg = $("#custSendMsgDesc").val();
                //console.log(selectedCustGroup+"---"+selectedAdm+"---"+admTextMesg);

                if (selectedCustGroup==='' || selectedCustGroup===undefined) {
                    app.showAlert('Please select Group to send Message.', app.APP_NAME);
                }else if (selectedAdm==='' || selectedAdm===undefined) {
                    app.showAlert('Please select Group Admin to send Message.', app.APP_NAME);    
                }else if (admTextMesg==='') {
                    app.showAlert('Please enter Message', app.APP_NAME); 
                }else{
            
                 app.showAppLoader(true);
                 var msgOthData = {"sender":account_Id,"receiver":selectedAdm ,"message":admTextMesg,"org_id":userOrgId }                            
   
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                                                    read: {
                                                                             url: app.serverUrl() + "notification/onetwoone",
                                                                             type:"POST",
                                                                             dataType: "json", 
                                                                             data: msgOthData
                  
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
                                                                     app.hideAppLoader(true);

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
                userAdminDataList=[];
                if (data[0]['status'][0].Msg==='No Admin') {
                   userAdminDataList=[];
                   app.noAdminAvailableOTO();
                   //app.callUserLogin(); 
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    userAdminDataList=[];
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    app.callUserLogin();
                }else if (data[0]['status'][0].Msg==="Success") {
        
                    if (!app.checkSimulator()) {
                             window.plugins.toast.showShortBottom(app.NOTIFICATION_MSG_SENT);   
                    }else {
                             app.showAlert(app.NOTIFICATION_MSG_SENT, "Message"); 
                    }
                    
                    $("#custSendMsgDesc").val('');
                    app.Activities.getAdminSentMsg();
                }                

                app.hideAppLoader(true);

            });
                
          }
         } 
        };
        
        var getSelectGroup = function(val){
            selectedCustGroup=val.value;
            $("#groupAdminToSelect option:selected").removeAttr("selected");
            $('#groupAdminToSelect').empty();
            getAdminFromGroup();
        }


        function getAdminFromGroup(){
            app.showAppLoader(true);
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                                                    read: {
                                                                             url: app.serverUrl() + "group/getGroupAdmin/"+selectedCustGroup,
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
                                                                     app.hideAppLoader(true);

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
                userAdminDataList=[];
                if (data[0]['status'][0].Msg==='No Admin') {
                   userAdminDataList=[];
                   app.noAdminAvailableOTO();
                   //app.callUserLogin(); 
                   app.hideAppLoader();                     
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    userAdminDataList=[];
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    app.callUserLogin();
                }else if (data[0]['status'][0].Msg==="Success") {
                    var orgLength = data[0].status[0].userData.length;
                    for (var j = 0;j < orgLength;j++) {
                        userAdminDataList.push({
                                               user_name: data[0].status[0].userData[j].user_fname+" "+data[0].status[0].userData[j].user_lname,
                                               pid:data[0].status[0].userData[j].upro_uacc_fk
                                           });
                    }
                    showAdminMemberInTemplate();
                }                
            });
        }
        
        var showAdminMemberInTemplate = function() {         
            $(".km-scroll-container").css("-webkit-transform", "");                     
            $.each(userAdminDataList, function (index, value) {
                $('#groupAdminToSelect').append($('<option/>', { 
                    value: value.pid,
                    text : value.user_name 
                }));
            });            
            app.hideAppLoader();            
        }
        
        return {
            init: init,
            show: show,
            getSelectGroup:getSelectGroup,
            sendQueryToAdm:sendQueryToAdm
        };
    }());        
    return connectModel;
}());