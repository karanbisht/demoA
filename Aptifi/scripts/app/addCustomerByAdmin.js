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

            $("#addMemberUl").empty();

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
            }else if(countMobile!==0){  
                mobileArray=[];
                mobileArray.push(mobile);
                var count=0;
               
                //alert(countMobile);
               
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
                    
                                    //console.log(mobileArray);


                                    var jsonDataRegister;
                          
                jsonDataRegister = {"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"org_id":organisationID} 
       
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
                                                                          // console.log(e);
                                                                           //console.log(JSON.stringify(e));           

                                                                           app.mobileApp.pane.loader.hide();
                                                                           navigator.notification.alert("Please check your internet connection.",
                                                                                                        function () {
                                                                                                        }, "Notification", 'OK');
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    //console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        //console.log(loginData.status[0].Msg);
                               
                        if (loginData.status[0].Msg==='Customer added successfully') {
                            app.showAlert("Member Added Successfully", "Notification");
                            refreshOrgMember();
                            $regFirstName.val('');
                            $regLastName.val('');
                            $regEmail.val('');
                            $regMobile.val('');
                            //app.mobileApp.navigate('#groupMemberShow');
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
                        }
                    });
                });
            

                } 
            }else{    
                
                if(addMoreMobile===0){
                    mobileArray.push(mobile);
                }
                
                //console.log(mobileArray);
                //console.log(fname + "||" + lname + "||" + email + "||" + mobile + "||" + organisationID);
                var jsonDataRegister;
                          
                jsonDataRegister = {"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"org_id":organisationID} 
       
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
                                                                           //console.log(e);

                                                                           //console.log(JSON.stringify(e));           

                                                                           
                                                                           app.mobileApp.pane.loader.hide();
                                                                           navigator.notification.alert("Please check your internet connection.",
                                                                                                        function () {
                                                                                                        }, "Notification", 'OK');
                                                                       }               
                                                                   });  
             
                dataSourceRegister.fetch(function() {
                    var loginDataView = dataSourceRegister.data();
                    //console.log(loginDataView);       
                    $.each(loginDataView, function(i, loginData) {
                        //console.log(loginData.status[0].Msg);
                               
                        if (loginData.status[0].Msg==='Customer added successfully') {
                            app.showAlert("Member Added Successfully", "Notification");
                            refreshOrgMember();
                            $regFirstName.val('');
                            $regLastName.val('');
                            $regEmail.val('');
                            $regMobile.val('');
                            //app.mobileApp.navigate('#groupMemberShow');
                        }else {
                            app.showAlert(loginData.status[0].Msg , 'Notification'); 
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
            $("#addMemberUl").append('<li class="username"><input type="number" pattern="[0-9]*" step="0.01" class="k-textbox" id="regMobile'+addMoreMobile+'" placeholder="Mobile Number" /></li>');
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