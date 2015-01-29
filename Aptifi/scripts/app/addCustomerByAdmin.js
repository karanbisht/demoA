var app = app || {};
app.addCustomerByAdmin = (function () {
    'use strict'

    var addCustomerViewModel = (function () {
        var $regFirstName;
        var $regLastName;
        var $regEmail;
        var $regMobile;
        var backToRegPage = false;
        var username;
        var organisationID;
        var addMoreMobile;
        var countMobile;
        var mobileArray = [];
        var firstTime;

        var groupDataShow=[];      

            
        var regInit = function () {
            app.userPosition = false;
            $regFirstName = $('#regFirstName');
            $regLastName = $('#regLastName');
            $regEmail = $('#regEmail');
            $regMobile = $('#regMobile');
        };
        
        // Navigate to activityView When some activity is selected
        
        var addNewRegistration = function (e) {
            app.userPosition = false;
            $regFirstName.val('');
            $regLastName.val('');
            $regEmail.val('');
            $regMobile.val('');
            organisationID = e.view.params.organisationID;
            addMoreMobile=0;
            countMobile=0;
            firstTime=0;
            mobileArray=[];
            groupDataShow=[];
                                              
            getGroupToShowInCombo();
                      
        };
        
        
        var getGroupToShowInCombo = function(e) {
            
            var org = localStorage.getItem("orgSelectAdmin");
             
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         transport: {
                    read: {
                                                                                     url: app.serverUrl() + "group/adminGroup/" + org +"/A",
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
                                                                       console.log(JSON.stringify(e));
                                                                             $("#selectOrgLoader").hide();
                                                                             app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response from API fetching Organization Group for Send Notification in Admin Panel.');
                         
                                                                     var showNotiTypes = [
                                                                         { message: "Please Check Your Internet Connection"}
                                                                     ];
                       
                                                                     var dataSource = new kendo.data.DataSource({
                                                                                                                    data: showNotiTypes
                                                                                                     });
                    
                                                                     $("#group-Name-listview").kendoMobileListView({
                                                                                                                        template: kendo.template($("#errorTemplate").html()),
                                                                                                                        dataSource: dataSource  
                                                                                                                    });
                
                                                                         },       
                                                                         sort: { field: 'add', dir: 'desc' }    	     
                                                                     });
                          

            
            comboGroupListDataSource.fetch(function(){                                                       
                groupDataShow = [];
                 var data = this.data();                
                                            
                            if (data[0]['status'][0].Msg==='No Group list') {
                                         
                                groupDataShow.push({
                                                          
                                                           group_name: 'No Group Available , To Add Member First Add Group',
                                                           pid:'0'
                                                       });
                            }else if(data[0]['status'][0].Msg==="Session Expired"){
                                    app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                                    app.LogoutFromAdmin(); 
                                
                        }else if(data[0]['status'][0].Msg==="You don't have access"){
                                   
                                    if (!app.checkSimulator()) {
                                             window.plugins.toast.showLongBottom("You don't have access");  
                                    }else {
                                             app.showAlert("You don't have access" , 'Offline');  
                                    }
                                
                                  
                            }else {
                                var orgLength = data[0].status[0].groupData.length;
                                for (var j = 0;j < orgLength;j++) {
                                    groupDataShow.push({
                                                           //group_desc: data[0].status[0].groupData[j].group_desc,
                                                           group_name: data[0].status[0].groupData[j].group_name,
                                                           //group_status:data[0].status[0].groupData[j].group_status,
                                                           //org_id:data[0].status[0].groupData[j].org_id,
                                                           pid:data[0].status[0].groupData[j].pid
                                                       });
                                }                                
                            }  
                
                showGroupDataInTemplate();

            });
                                  
        };

        var showGroupDataInTemplate = function(){

          //alert('hello');
            console.log(groupDataShow);
            
            $(".km-scroll-container").css("-webkit-transform", "");
           
               var comboGroupListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });              
           
            
            $("#groupInAddCustomer").kendoListView({
                                                        template: kendo.template($("#groupNameShowTemplate").html()),    		
                                                        dataSource: comboGroupListDataSource
            });
            

              /* document.getElementById("multiSelectGroupName").innerHTML = "";
            
               $("#multiSelectGroupName").kendoMultiSelect({
                     dataTextField: "group_name",
                     dataValueField: "pid",
                     select:onSelectGroupData,
                     height: 500,
                     headerTemplate: '<div><h4>Group</h4></div>',
                     dataSource: comboGroupListDataSource
               });*/
            
            
            
           
         //#multiSelectGroupName").kendoMultiSelect().refresh();
            
               /*$("#multiSelectGroupName").kendoMultiSelect({
                        data: groupDataShow
                   });
           
            
                $("#multiSelectGroupName").kendoListView({
                                                        template: kendo.template($("#groupNameShowTemplate").html()),    		
                                                        dataSource: comboGroupListDataSource
               });*/
           
           /*
            $("#multiSelectGroupName").kendoMultiSelect({
                        dataTextField: "ContactName",
                        dataValueField: "CustomerID",
                        headerTemplate: '<div class="dropdown-header">' +
                                '<span class="k-widget k-header">Photo</span>' +
                                '<span class="k-widget k-header">Contact info</span>' +
                            '</div>',
                        itemTemplate: '<span class="k-state-default"></span>' +
                                  '<span class="k-state-default"><h3>#: data.ContactName #</h3><p>#: data.CompanyName #</p></span>',
                        tagTemplate:  '<img class="tag-image" src=\"../content/web/Customers/${data.CustomerID}.jpg\" alt=\"${data.CustomerID}\" />' +
                                      '#: data.ContactName #',
                        dataSource: comboGroupListDataSource,
                        
                        height: 300
                    });

                    var customers = $("#multiSelectGroupName").data("kendoMultiSelect");
                    customers.wrapper.attr("id", "customers-wrapper");

            */                                               
        }
        
        function onchangeGroupData(e){
          console.log(e);   
        }
        

        function onSelectGroupData(e) {            
            /*var item = e.item;
            console.log(item);
            var text = item.text();
            console.log(text);
            var value = item.val();
            console.log(value);
            var multiSelect = $('#multiSelectGroupName').data('kendoMultiSelect').dataItems();
            console.log(multiSelect);*/
       };       
        
        var registerR = function() {            
          
            app.userPosition = false;     
            backToRegPage = true;   
            var fname = $regFirstName.val();
            var lname = $regLastName.val();
            var email = $regEmail.val();
            var mobile = $regMobile.val();
            if(firstTime===0){
            countMobile=addMoreMobile;
            }else{
              firstTime++;  
            }
               
            var group = [];		    
            /*$(':checkbox:checked').each(function(i) {
                group[i] = $(this).val();
            });*/     
            
            $('#groupInAddCustomer input:checked').each(function() {
                group.push($(this).val());
            });
            
            group = String(group);       
            
            //console.log(group);
               

            /*var multiSelect = $('#multiSelectGroupName').data('kendoMultiSelect').dataItems();
            //console.log(multiSelect.length);
            
            for(var i=0;i<multiSelect.length;i++){
               //console.log(multiSelect[i].pid);
               group.push(multiSelect[i].pid); 
            }
               
            group = String(group);               
            console.log(group);
            */  
   
               
            if (fname === "First Name" || fname === "") {
                app.showAlert("Please enter your First Name.", "Validation Error");
            }else if (lname === "Last Name" || lname === "") {
                app.showAlert("Please enter your Last Name.", "Validation Error");
            }else if (email === "Email" || email === "") {
                app.showAlert("Please enter your Email.", "Validation Error");
            } else if (!app.validateEmail(email)) {
                app.showAlert("Please enter a valid Email.", "Validation Error");
            } else if (mobile === "Mobile Number" || mobile === "") {
                app.showAlert("Please enter your Mobile Number.", "Validation Error");
            } else if (!app.validateMobile(mobile)) {
                app.showAlert("Please enter a valid Mobile Number.", "Validation Error");
            }else if(group.length===0 || group.length==='0'){
                app.showAlert("Please select Group.", "Validation Error");    
            }else if(countMobile!==0){
                $("#saveMemberLoader").show();
                mobileArray=[];
                mobileArray.push(mobile);
                var count=0;
                               
                for(var i=1;i<=countMobile;i++){
                    var newMobile = $("#regMobile"+i).val(); 
                    if(newMobile === "Mobile Number" || newMobile === ""){
                        count++;                        
                    }else if (!app.validateMobile(newMobile)) {
                        app.showAlert("Please enter a valid Mobile Number.", "Validation Error");                                                  
                    }else{
                        count++;
                        mobileArray.push(newMobile);
                    } 
                }             

                if(count===countMobile){
                    //alert('inside');
                    var jsonDataRegister;
                          
                jsonDataRegister = {"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"org_id":organisationID,"cmbGroup":group} 
       
                var dataSourceRegister = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "customer/add",
                                                                                   type:"POST",
                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                   data: jsonDataRegister
                                                                               }
                    },
                                                                       schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];
                        }
                    },
                                                                       error: function (e) {
                                                                           //apps.hideLoading();
                                                                           $("#saveMemberLoader").hide();
                                                                            //console.log(e);                                                                           
                                                                            console.log(JSON.stringify(e));           
                                                                            //alert(JSON.stringify(e));
                                                                            //app.mobileApp.pane.loader.hide();
                                                                            
                                                                           app.analyticsService.viewModel.trackException(e,'Api Call , Unable to get response from API fetching Add Member to Organization.');             
                                                                           app.analyticsService.viewModel.trackException(e,'Api Call , Unable to get response from API fetching Add Member to Organization.'+JSON.stringify(e));
             
                                                                            if (!app.checkSimulator()) {
                                                                            window.plugins.toast.showShortBottom('Please check your internet connection.');
                                                                            }else {
                                                                            app.showAlert("Please check your internet connection.", "Notification"); 
                                                                            }
           
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    //console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        //console.log(loginData.status[0].Msg);
                               
                        if (loginData.status[0].Msg==='Customer added successfully') {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Member Added Successfully');   
                            }else {
                                app.showAlert("Member Added Successfully", "Notification"); 
                            }
                            
                            $("#saveMemberLoader").hide();
                                                        
                            refreshOrgMember();
                            $regFirstName.val('');
                            $regLastName.val('');
                            $regEmail.val('');
                            $regMobile.val('');
                            //app.mobileApp.navigate('#groupMemberShow');
                        }else if(loginData.status[0].Msg==="Session Expired"){
                        app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                        app.LogoutFromAdmin(); 
                                
                        }else if (loginData.status[0].Msg==="You don't have access") {
                    
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom("You don't have access");  
                                }else {
                                    app.showAlert("You don't have access" , 'Offline');  
                                }
                                              
                            app.mobileApp.navigate('views/orgMemberPage.html');
  
                        }else {
                            $("#saveMemberLoader").hide();
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            

                } 
            }else{    

                $("#saveMemberLoader").show();
                mobileArray=[];
                
                if(addMoreMobile===0){
                    mobileArray.push(mobile);
                }
                
                
                //console.log(mobileArray);
                //console.log(fname + "||" + lname + "||" + email + "||" + mobile + "||" + organisationID);
                var jsonDataRegister;
                          
                jsonDataRegister = {"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"org_id":organisationID,"cmbGroup":group} 
       
                var dataSourceRegister = new kendo.data.DataSource({
                                                                       transport: {
                        read: {
                                                                                   url: app.serverUrl() + "customer/add",
                                                                                   type:"POST",
                                                                                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                   data: jsonDataRegister
                                                                               }
                    },
                                                                       schema: {
                        data: function(data) {
                            //console.log(data);
                            return [data];
                        }
                    },
                                                                       error: function (e) {
                                                                           $("#saveMemberLoader").hide();
                                                                           //console.log(e);
                                                                           console.log(JSON.stringify(e));           
             
                                                                           app.analyticsService.viewModel.trackException(e,'Api Call , Unable to get response from API fetching Add Member to Organization.');             
                                                                           app.analyticsService.viewModel.trackException(e,'Api Call , Unable to get response from API fetching Add Member to Organization.'+JSON.stringify(e));             
                                                                           
                                                                           //app.mobileApp.pane.loader.hide();
                                                                         
                                                                           if (!app.checkSimulator()) {
                                                                            window.plugins.toast.showShortBottom('Please check your internet connection.');
                                                                            }else {
                                                                            app.showAlert("Please check your internet connection.", "Notification");
                                                                            }
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    //console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        //console.log(loginData.status[0].Msg);
                               
                        if (loginData.status[0].Msg==='Customer added successfully') {
                            if (!app.checkSimulator()) {
                                window.plugins.toast.showShortBottom('Member Added Successfully');   
                            }else {
                                app.showAlert("Member Added Successfully", "Notification"); 
                            }
                            
                            $("#saveMemberLoader").hide();
                            
                            
                            refreshOrgMember();
                            $regFirstName.val('');
                            $regLastName.val('');
                            $regEmail.val('');
                            $regMobile.val('');
                            //app.mobileApp.navigate('#groupMemberShow');
                        }else if(loginData.status[0].Msg==="Session Expired"){
                            app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                            app.LogoutFromAdmin(); 
                                
                        }else if (loginData.status[0].Msg==="You don't have access") {
                    
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom("You don't have access");  
                                }else {
                                    app.showAlert("You don't have access" , 'Offline');  
                                }
                                              
                                app.mobileApp.navigate('views/orgMemberPage.html');
  
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification');
                            $("#saveMemberLoader").hide();
                        }
                    });
                });
            }
        };
        
        function refreshOrgMember() {  
            //console.log('go to member');
            app.groupDetail.showGroupMembers();
        };
        
        var addMoreMobileNo = function(){    
            addMoreMobile++;
            $("#addMemberUl").append('<li class="username"><input type="number" pattern="[0-9]*" step="0.01" id="regMobile'+addMoreMobile+'" placeholder="Mobile Number" /></li>');
        }
        
        
        return {
            regInit: regInit,
            addNewRegistration: addNewRegistration,
            addMoreMobileNo:addMoreMobileNo,
            registerR: registerR
        };
    }());

    return addCustomerViewModel;
}());