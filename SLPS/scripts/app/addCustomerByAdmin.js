var app = app || {};

app.addCustomerByAdmin = (function () {
    'use strict'

    var addCustomerViewModel = (function () {
        var $regFirstName;
        var $regLastName;
        var $regEmail;
        var $regMobile;
        var organisationID;
        var addMoreMobile;
        var countMobile;
        var mobileArray = [];
        var firstTime;
        var memberAddPhoto;

        var groupDataShow = [];      
            
        var regInit = function () {
            $regFirstName = $('#regFirstName');
            $regLastName = $('#regLastName');
            $regEmail = $('#regEmail');
            $regMobile = $('#regMobile');
        };
        
        var addNewRegistration = function (e) {
            $('#groupInAddCustomer').find('input[type=checkbox]:checked').removeAttr('checked');
            $('.km-popup-arrow').addClass("removeArrow");

            $regFirstName.val('');
            $regLastName.val('');
            $regEmail.val('');
            $regMobile.val('');
            organisationID = e.view.params.organisationID;
            memberAddPhoto = "";
            
            $("#addMemberUl").empty();
            
            var largeImage = document.getElementById('addMemberPhoto');
            largeImage.src = "styles/images/profile-img1.png"; 
            
            addMoreMobile = 0;
            countMobile = 0;
            firstTime = 0;
            mobileArray = [];
            groupDataShow = [];

            $("#groupInAddCustomer option:selected").removeAttr("selected");
            $('#groupInAddCustomer').empty();
            
            getGroupToShowInCombo();
        };
        
        var getGroupToShowInCombo = function(e) {
            var org = localStorage.getItem("orgSelectAdmin");
                         
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         transport: {
                    read: {
                                                                                     url: app.serverUrl() + "group/adminGroup/" + org + "/A",
                                                                                     type:"POST",
                                                                                     dataType: "json"    
                                                                                 }
                },
                                                                         schema: {               
                    data: function(data) {
                        return [data];                       
                    }
                },
                                                                         error: function (e) {
                                                                             $("#selectOrgLoader").hide();    
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
                                                                         },       
                                                                         sort: { field: 'add', dir: 'desc' }    	     
                                                                     });
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    app.noGroupAvailable();                                
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin();                                 
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }                                 
                }else {
                    var orgLength = data[0].status[0].groupData.length;
                    for (var j = 0;j < orgLength;j++) {
                        groupDataShow.push({
                                               group_name: data[0].status[0].groupData[j].group_name,
                                               pid:data[0].status[0].groupData[j].pid
                                           });
                    }                                
                }  
                
                showGroupDataInTemplate();
            });
        };

        var showGroupDataInTemplate = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
           
            $.each(groupDataShow, function (index, value) {
                $('#groupInAddCustomer').append($('<option/>', { 
                                                      value: value.pid,
                                                      text : value.group_name 
                                                  }));
            });
        }
        
        function onchangeGroupData(e) {
        }

        function onSelectGroupData(e) {            
        };       
        
        var takeMemberPhoto = function() {
            navigator.camera.getPicture(onProfilePhotoURISuccess, onFail, { 
                                            quality: 40,
                                            targetWidth: 150,
                                            targetHeight: 150,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true                                           
                                        });
        };
        
        var selectMemberPhoto = function() {
            navigator.camera.getPicture(onProfilePhotoURISuccess, onFail, { 
                                            quality: 40,
                                            targetWidth: 150,
                                            targetHeight: 150,                            
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        var resetMemberPhoto = function() {
            var largeImage = document.getElementById('addMemberPhoto');
            largeImage.src = "styles/images/profile-img1.png";
            memberAddPhoto = "";   
        }
        
        function onFail(e) {
        }
        
        function onProfilePhotoURISuccess(imageURI) {            
            var largeImage = document.getElementById('addMemberPhoto');
            largeImage.src = imageURI;
            memberAddPhoto = imageURI;   
        } 
              
        var registerR = function() {            
            var fname = $regFirstName.val();
            var lname = $regLastName.val();
            var email = $regEmail.val();
            var mobile = $regMobile.val();

            if (firstTime===0) {
                countMobile = addMoreMobile;
            }else {
                firstTime++;  
            }
               
            var group = [];		    
            
            $('#groupInAddCustomer :selected').each(function(i, selected) { 
                group[i] = $(selected).val(); 
            });
            
            group = String(group);            
               
            if (fname === "First Name" || fname === "") {
                app.showAlert("Please enter your First Name.", app.APP_NAME);
            }else if (lname === "Last Name" || lname === "") {
                app.showAlert("Please enter your Last Name.", app.APP_NAME);
                /*}else if (email === "Email" || email === "") {
                app.showAlert("Please enter your Email.", app.APP_NAME);
                } else if (!app.validateEmail(email)) {
                app.showAlert("Please enter a valid Email.", app.APP_NAME);*/
            } else if (mobile === "Mobile Number" || mobile === "") {
                app.showAlert("Please enter your Mobile Number.", app.APP_NAME);
            } else if (!app.validateMobile(mobile)) {
                app.showAlert("Please enter a valid Mobile Number.", app.APP_NAME);
            }else if (group.length===0 || group.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);    
            }else if (countMobile!==0) {
                app.showAppLoader(true);
                mobileArray = [];
                mobileArray.push(mobile);                
                var count = 0;
                               
                for (var i = 1;i <= countMobile;i++) {
                    var newMobile = $("#regMobile" + i).val(); 
                    if (newMobile === "Mobile Number" || newMobile === "") {
                        count++;                        
                    }else if (!app.validateMobile(newMobile)) {
                        app.showAlert("Please enter a valid Mobile Number.", app.APP_NAME);                                                  
                    }else {
                        count++;
                        mobileArray.push(newMobile);
                    } 
                }             
                
                mobileArray = String(mobileArray);

                if (count===countMobile) {
                    if (memberAddPhoto==="") {
                        var jsonDataRegister;                          
                        jsonDataRegister = {"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"org_id":organisationID,"cmbGroup":group,"profile_pic":memberAddPhoto}; 
       
                        var dataSourceRegister = new kendo.data.DataSource({
                                                                               transport: {
                                read: {
                                                                                           url: app.serverUrl() + "customer/add",
                                                                                           type:"POST",
                                                                                           dataType: "json", 
                                                                                           data: jsonDataRegister
                                                                                       }
                            },
                                                                               schema: {
                                data: function(data) {
                                    return [data];
                                }
                            },
                                                                               error: function (e) {
                                                                                   app.hideAppLoader();
                                                                                   //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                                   if (!app.checkSimulator()) {
                                                                                       window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                                   }else {
                                                                                       app.showAlert(app.INTERNET_ERROR, "Notification"); 
                                                                                   }
                                                                               }               
                                                                           });  
             
                        dataSourceRegister.fetch(function() {
                            var loginDataView = dataSourceRegister.data();
                            $.each(loginDataView, function(i, loginData) {
                                if (loginData.status[0].Msg==='Customer added successfully') {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.MEMBER_ADDED_MSG);   
                                    }else {
                                        app.showAlert(app.MEMBER_ADDED_MSG, "Notification"); 
                                    }
                            
                                    app.hideAppLoader();
                                                        
                                    refreshOrgMember();
                                    $regFirstName.val('');
                                    $regLastName.val('');
                                    $regEmail.val('');
                                    $regMobile.val('');
                                }else if (loginData.status[0].Msg==="Session Expired") {
                                    app.LogoutFromAdmin(); 
                                }else if (loginData.status[0].Msg==="You don't have access") {
                                    if (!app.checkSimulator()) {
                                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                    }else {
                                        app.showAlert(app.NO_ACCESS , 'Offline');  
                                    }
                                              
                                    app.mobileApp.navigate('views/orgMemberPage.html');
                                }else {
                                    app.hideAppLoader();
                                    app.showAlert(loginData.status[0].Msg , 'Notification'); 
                                }
                            });
                        });
                    }else {
                        if (memberAddPhoto.substring(0, 21)==="content://com.android") {
                            var photo_split = memberAddPhoto.split("%3A");
                            memberAddPhoto = "content://media/external/images/media/" + photo_split[1];
                        }   
              
                        var filename = memberAddPhoto.substr(memberAddPhoto.lastIndexOf('/') + 1);                                                
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                    

                        var params = new Object();
                        params.org_id = organisationID;  
                        params.txtFName = fname;
                        params.txtLName = lname;
                        params.txtEmail = email;
                        params.txtMobile = mobileArray;
                        params.cmbGroup = group;
                        var ft = new FileTransfer();
                        var options = new FileUploadOptions();          
                        options.fileKey = "profile_pic";
                        options.fileName = filename;  
                        options.mimeType = "image/jpeg";
                        options.params = params;
                        options.chunkedMode = false;
                        options.headers = {
                            Connection: "close"
                        };     
              
                        ft.upload(memberAddPhoto, app.serverUrl() + "customer/add", memberWin, memberFail, options , true); 
                    }   
                } 
            }else {    
                app.showAppLoader(true);
                mobileArray = [];                
                if (addMoreMobile===0) {
                    mobileArray.push(mobile);
                }               
                mobileArray = String(mobileArray);
       
                if (memberAddPhoto==="") {
                    var jsonDataReg;                          
                    jsonDataReg = {"txtFName":fname,"txtLName":lname,"txtEmail":email,"txtMobile":mobileArray,"org_id":organisationID,"cmbGroup":group,"profile_pic":memberAddPhoto}; 
       
                    var dataSourceReg = new kendo.data.DataSource({
                                                                      transport: {
                            read: {
                                                                                  url: app.serverUrl() + "customer/add",
                                                                                  type:"POST",
                                                                                  dataType: "json", 
                                                                                  data: jsonDataReg
                                                                              }
                        },
                                                                      schema: {
                            data: function(data) {
                                return [data];
                            }
                        },
                                                                      error: function (e) {
                                                                          app.hideAppLoader();
                                                                          //app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                          if (!app.checkSimulator()) {
                                                                              window.plugins.toast.showShortBottom(app.INTERNET_ERROR);
                                                                          }else {
                                                                              app.showAlert(app.INTERNET_ERROR, "Notification");
                                                                          }
                                                                      }               
                                                                  });  
             
                    dataSourceReg.fetch(function() {
                        var loginDataView = dataSourceReg.data();
                        $.each(loginDataView, function(i, loginData) {
                            if (loginData.status[0].Msg==='Customer added successfully') {
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.MEMBER_ADDED_MSG);   
                                }else {
                                    app.showAlert(app.MEMBER_ADDED_MSG, "Notification"); 
                                }
                            
                                app.hideAppLoader();
                            
                                refreshOrgMember();
                                $regFirstName.val('');
                                $regLastName.val('');
                                $regEmail.val('');
                                $regMobile.val('');
                            }else if (loginData.status[0].Msg==="Session Expired") {
                                app.LogoutFromAdmin(); 
                            }else if (loginData.status[0].Msg==="You don't have access") {
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }
                                              
                                app.mobileApp.navigate('views/orgMemberPage.html');
                            }else {
                                app.showAlert(loginData.status[0].Msg , 'Notification');
                                app.hideAppLoader();
                            }
                        });
                    });            
                }else {
                    if (memberAddPhoto.substring(0, 21)==="content://com.android") {
                        var photo_split1 = memberAddPhoto.split("%3A");
                        memberAddPhoto = "content://media/external/images/media/" + photo_split1[1];
                    }   
              
                    var filename1 = memberAddPhoto.substr(memberAddPhoto.lastIndexOf('/') + 1);                                                
                    if (filename1.indexOf('.') === -1) {
                        filename1 = filename1 + '.jpg';
                    }                

                    var params1 = new Object();
                    params1.org_id = organisationID;  
                    params1.txtFName = fname;
                    params1.txtLName = lname;
                    params1.txtEmail = email;
                    params1.txtMobile = mobileArray;
                    params1.cmbGroup = group;
                    var ft1 = new FileTransfer();
                    var options1 = new FileUploadOptions();          
                    options1.fileKey = "profile_pic";
                    options1.fileName = filename;  
                    options1.mimeType = "image/jpeg";
                    options1.params = params1;
                    options1.chunkedMode = false;
                    options1.headers = {
                        Connection: "close"
                    };     
              
                    ft1.upload(memberAddPhoto, app.serverUrl() + "customer/add", memberWin, memberFail, options1 , true); 
                }
            }      
        };
        
        function memberWin(r) {
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.MEMBER_ADDED_MSG);   
            }else {
                app.showAlert(app.MEMBER_ADDED_MSG, "Notification"); 
            }                            
            app.hideAppLoader();
            app.mobileApp.navigate('views/orgMemberPage.html');
        }

        function memberFail(e) {
            app.hideAppLoader();
        }        
        function refreshOrgMember() {  
            app.groupDetail.showGroupMembers();
        };
        
        var addMoreMobileNo = function() {    
            addMoreMobile++;
            $("#addMemberUl").append('<li class="username"><input type="number" pattern="[0-9]*" step="0.01" id="regMobile' + addMoreMobile + '" placeholder="Mobile Number" /></li>');
        }
        
        var open = 0;
        var clickToSelectGroup = function() {            
            if (open===0) {
                $("#groupInAddCustomer").hide().slideDown({duration: 500});
                open = 1;
            }else {
                $("#groupInAddCustomer").slideUp("slow");
                open = 0
            }
        }
        
        var selectAllCheckBox = function() {
            if ($("#selectAll").prop('checked')===true) { 
                $('.largerCheckbox').prop('checked', false);
                document.getElementById("selectAll").checked = false;
            }else {
                $('.largerCheckbox').prop('checked', true); 
                document.getElementById("selectAll").checked = true;
            }
        } 
        
        var checkClick = function() {
            if ($("#selectAll").prop('checked')===true) {
                $('.largerCheckboxSelectAll').prop('checked', false);
                document.getElementById("selectAll").checked = false;
            }
        }
        
        return {
            regInit: regInit,
            addNewRegistration: addNewRegistration,
            addMoreMobileNo:addMoreMobileNo,
            clickToSelectGroup:clickToSelectGroup,
            selectAllCheckBox:selectAllCheckBox,
            takeMemberPhoto:takeMemberPhoto,
            selectMemberPhoto:selectMemberPhoto,
            resetMemberPhoto:resetMemberPhoto,
            checkClick:checkClick,
            registerR: registerR
        };
    }());

    return addCustomerViewModel;
}());
