



        var orgMemberShow = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");              
            var organisationID = localStorage.getItem("orgSelectAdmin");         
            $("#groupMember-listview").hide();
            $("#progressAdminOrgMem").show();
            $("#orgMemFooter").hide();
            $(".km-filter-form").hide();                        

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
                
                    data: function(data) {
                        //console.log(data);                                             
                        return [data];
                    }

                },
                                                                 error: function (e) {
                                                                     //console.log(JSON.stringify(e));                                                                     
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
                                                                                                //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                      }

                                                                        $("#progressAdminOrgMem").hide();
                                                                        $("#groupMember-listview").show();
                                                                 }	        
                                                             });         
            MemberDataSource.fetch(function() {
                var data = this.data();                        
                groupDataShow = [];
                if (data[0]['status'][0].Msg ==='No Customer in this organisation') {     
                    groupDataShow.push({
                                           mobile: '',
                                           first_name: '',
                                           email:'No Member in this Organization',  
                                           last_name : '',
                                           customerID:'0',
                                           account_id:'0',
                                           orgID:'0'
                                       });     
                    $("#adminRemoveMember").hide();
                    $("#adminAddMember").css('width','100%');
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    //app.showAlert(app.SESSION_EXPIRE , 'Notification');
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==='Success') {
                    for (var i = 0;i < data[0]['status'][0].allCustomer.length;i++) {
                        groupDataShow.push({
                                               mobile: data[0]['status'][0].allCustomer[i].uacc_username,
                                               first_name: data[0]['status'][0].allCustomer[i].user_fname,
                                               email:data[0]['status'][0].allCustomer[i].user_email,  
                                               last_name : data[0]['status'][0].allCustomer[i].user_lname,
                                               full_name:data[0]['status'][0].allCustomer[i].user_fname+" "+data[0]['status'][0].allCustomer[i].user_lname,
                                               customerID:data[0]['status'][0].allCustomer[i].custID,
                                               account_id:data[0]['status'][0].allCustomer[i].account_id,
                                               photo:data[0]['status'][0].allCustomer[i].photo,
                                               orgID:data[0]['status'][0].allCustomer[i].orgID
                                           });
                    }     
                    $("#adminRemoveMember").show();
                    $("#adminAddMember").css('width','45%');

                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                  backToOrgDetail();  
                }
                
                showMemberDataFunc(groupDataShow);
            });
        }
        
        function showMemberDataFunc(data) {
            $("#progressAdminOrgMem").hide();
            $("#groupMember-listview").show();
            $("#orgMemFooter").show();
            
            //$("#groupMember-listview").removeClass("km-list");
            $(".km-filter-form").hide();

            $("#groupMember-listview").kendoMobileListView({
                            dataSource: data,                                        
                            template: kendo.template($("#groupMemberTemplate").html()),
                            filterable: {
                field: "full_name",
                operator: "contains",
                },
            });
            
            $('#groupMember-listview').data('kendoMobileListView').refresh();          
            //$("#groupMember-listview").removeClass("km-list");

            
            
            
            /*$("#groupMember-listview").kendoMobileListView({
                                                               dataSource: data,
                                                               template: kendo.template($("#groupMemberTemplate").html())
                                                           });

            $('#groupMember-listview').data('kendoMobileListView').refresh();*/ 
        }
