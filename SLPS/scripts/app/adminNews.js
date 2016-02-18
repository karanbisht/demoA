var app = app || {};

app.adminNews = (function () {
    'use strict';

    var adminNewsEventModel = (function () {
        var organisationID;
        var groupAllEvent = [];
        var newsDataToSend;
        var upload_type;
        var groupDataShow = [];
        var pbNews;
        var ft;
        var photo_split;
        var countVal = 0;

        var page = 0;
        var totalListView = 0;
        var dataReceived = 0;
        
        var init = function() {
        }
    
        var show = function() {            
            $("#showMoreEventBtnNews").hide();
            app.showAppLoader();
            $(".km-scroll-container").css("-webkit-transform", "");            
            organisationID = localStorage.getItem("orgSelectAdmin");
            $("#attachedImgNews").hide();
            $("#attachedVidNews").hide();

            newsDataToSend = '';
            upload_type = '';   

            groupAllEvent = [];

            page = 0;
            dataReceived = 0;
            totalListView = 0;
            
            document.getElementById("imgDownloaderNews").innerHTML = "";
            
            pbNews = new ProgressBar.Circle('#imgDownloaderNews', {
                                                color: '#e7613e',
                                                strokeWidth: 8,
                                                fill: '#f3f3f3'
                                            });
            
            getLiveData();
        }
        
        var getLiveData = function() {
            var jsonDataLogin = {"org_id":organisationID,"page":page}
            
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "news/index",
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
                                                                    $("#orgAllNewsList").show();
                                                                    
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
                               
                if (data[0]['status'][0].Msg==='No News list') {
                    groupAllEvent = [];                          
                    groupAllEvent.push({
                                           id: 0,
                                           add_date: 0,
                                           news_date: 0,
                                           news_desc: 'No News from this Organization',                                                                                 										  
                                           news_name: 'No News',                                                                                  										  
                                           news_time: '', 
                                           news_image:'',
                                           mod_date: '',                                     
                                           org_id: ''
                                       });
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==="You don't have access") {                                    
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    
                    goToManageOrgPage();
                }else if (data[0]['status'][0].Msg==='Success') {
                    totalListView = data[0]['status'][0].Total;

                    if (data[0].status[0].newsData.length!==0) {
                        var eventListLength = data[0].status[0].newsData.length;
                            
                        for (var i = 0 ; i < eventListLength ;i++) {
                            var newsDateString = data[0].status[0].newsData[i].news_date;
                            var newsTimeString = data[0].status[0].newsData[i].news_time;
                            var newsDate = app.formatDate(newsDateString);
                            var newsTime = app.formatTime(newsTimeString);
                                 
                            groupAllEvent.push({
                                                   id: data[0].status[0].newsData[i].id,
                                                   add_date: data[0].status[0].newsData[i].add_date,
                                                   news_date: newsDate,
                                                   upload_type:data[0].status[0].newsData[i].upload_type,
                                                   news_desc: data[0].status[0].newsData[i].news_desc,                                                                                 										  
                                                   news_name: data[0].status[0].newsData[i].org_name,
                                                   news_image : data[0].status[0].newsData[i].news_image,
                                                   news_time: newsTime,                                                                                  										  
                                                   mod_date: data[0].status[0].newsData[i].mod_date,                                     
                                                   org_id: data[0].status[0].newsData[i].org_id
                                               });
                        }
                    } 
                }
                showInListView();
            });
        }
        
        var showInListView = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
            app.hideAppLoader();
            $("#orgAllNewsList").show();
            
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#orgAllNewsList").kendoMobileListView({
                                                         template: kendo.template($("#newsListTemplate").html()),    		
                                                         dataSource: organisationListDataSource
                                                     });
                
            $('#orgAllNewsList').data('kendoMobileListView').refresh();
            
            if ((totalListView > 10) && (totalListView >= dataReceived + 10)) {
                $("#showMoreEventBtnNews").show();
            }else {
                $("#showMoreEventBtnNews").hide();
            }
        }
        
        var addNewsshow = function() {                        
            $(".km-scroll-container").css("-webkit-transform", "");           
            groupDataShow = [];                        
            $('.km-popup-arrow').addClass("removeArrow");

            $("#addNewsName").val('');
            $("#addNewsDesc").val('');
            
            $('#addNewsDesc').css('height', '40px');

            var txt = $('#addNewsDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');
            
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            
            app.showAppLoader(true);
            
            $('body').append(hiddenDiv);

            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });
            
            $("#groupInAddNews option:selected").removeAttr("selected");
            $('#groupInAddNews').empty();
            
            document.getElementById('adddatePickerNews').valueAsDate = new Date();

            getGroupToShowInCombo();
        }

        var getGroupToShowInCombo = function(e) {
            var org = localStorage.getItem("orgSelectAdmin");
             
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         transport: {
                    read: {
                                                                                     url: app.serverUrl() + "group/adminGroup/" + org + "/A",
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
                                                                         },       
                                                                         sort: { field: 'add', dir: 'desc' }    	     
                                                                     });
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                    groupDataShow = [];
                    app.hideAppLoader();
                    app.noGroupAvailable();
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                    }else {
                        app.showAlert(app.NO_ACCESS , 'Offline');  
                    }
                    goToNewsListPage();
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
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
            app.hideAppLoader();
        };
        
        var showGroupDataInTemplate = function() {
            app.hideAppLoader();
            
            $(".km-scroll-container").css("-webkit-transform", "");
            
            $.each(groupDataShow, function (index, value) {
                $('#groupInAddNews').append($('<option/>', { 
                                                  value: value.pid,
                                                  text : value.group_name 
                                              }));
            });
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
        
        var newsDescEdit;
        var newsDateEdit;
        var newsTimeEdit;
        var newsImageEdit;
        var newsUploadType;
        var newsPid;
        
        var editNews = function(e) {
            newsDescEdit = e.data.news_desc;
            newsDateEdit = e.data.news_date;
            newsTimeEdit = e.data.news_time;
            newsImageEdit = e.data.news_image;
            newsUploadType = e.data.upload_type;
            newsPid = e.data.id;

            //app.analyticsService.viewModel.trackFeature("User navigate to Edit News in Admin");            

            app.mobileApp.navigate('#adminEditNews');
        }
        
        var deleteNews = function(e) {
            navigator.notification.confirm(app.DELETE_CONFIRM, function (confirmed) {           
                if (confirmed === true || confirmed === 1) {
                    organisationID = localStorage.getItem("orgSelectAdmin");

                    var jsonDataSaveGroup = {"orgID":organisationID,"pid":newsPid}
            
                    var dataSourceaddGroup = new kendo.data.DataSource({
                                                                           transport: {
                            read: {
                                                                                       url: app.serverUrl() + "news/delete/",
                                                                                       type:"POST",
                                                                                       dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                                                               
                                                                                       data: jsonDataSaveGroup
                                                                                   }
                        },
                                                                           schema: {
                            data: function(data) {
                                return [data];
                            }
                        },
                                                                           error: function (e) {
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
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            if (addGroupData.status[0].Msg==='Deleted Successfully') {         
                                app.mobileApp.navigate("#adminOrgNewsList");
                        
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NEWS_DELETED_MSG);  
                                }else {
                                    app.showAlert(app.NEWS_DELETED_MSG, "Notification");  
                                }
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                           
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }                  
                                goToNewsListPage();
                            }else {
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                            }
                        });
                    });
                }else {
                }
            }, app.APP_NAME, ['Yes', 'No']);
        }
        
        var adminAllGroupArray = [];
        var customerGroupArray = [];
        var EditGroupArrayMember = [];
        
        var editNewsshow = function() {
            $("#popover-editNews").removeClass("km-widget km-popup");
            $('.km-popup-arrow').addClass("removeArrow");

            EditGroupArrayMember = [];
            adminAllGroupArray = [];
            customerGroupArray = [];                                                
            newsDataToSend = '';
            
            $(".km-scroll-container").css("-webkit-transform", "");                                    
            $('#editNewsDesc').css('height', '80px');
            
            document.getElementById("imgDownloaderNews").innerHTML = "";            
            pbNews = new ProgressBar.Circle('#imgDownloaderNews', {
                                                color: '#e7613e',
                                                strokeWidth: 8,
                                                fill: '#f3f3f3'
                                            });

            $("#groupInEditNews option:selected").removeAttr("selected");
            $('#groupInEditNews').empty();

            var txt = $('#editNewsDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');
            
            $('body').append(hiddenDiv);            
            app.showAppLoader(true);
            $("#wrappe_news").hide();
            
            txt.on('keyup', function () {
                content = $(this).val();    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });

            var org_id = localStorage.getItem("orgSelectAdmin");
            
            var dataSourceMemberDetail = new kendo.data.DataSource({
                                                                       transport: {
                    read: {
                                                                                   url: app.serverUrl() + "news/newsdetail/" + org_id + "/" + newsPid,
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
                                                                       }               
                                                                   });  
	            
            dataSourceMemberDetail.fetch(function() {
                var data = this.data();                        
 
                if (data[0]['status'][0].Msg==='Success') {
                    EditGroupArrayMember = [];
                    adminAllGroupArray = [];
                    customerGroupArray = [];
                        
                    newsDescEdit = data[0]['status'][0].newsDetail[0].news_desc;
                    newsDateEdit = data[0]['status'][0].newsDetail[0].news_date;
                    newsTimeEdit = data[0]['status'][0].newsDetail[0].news_time;
                    newsImageEdit = data[0]['status'][0].newsDetail[0].news_image;
                    newsUploadType = data[0]['status'][0].newsDetail[0].upload_type;
                    newsPid = data[0]['status'][0].newsDetail[0].id;

                    document.getElementById('editdatePickerNews').value = newsDateEdit;
                    document.getElementById('editdateTimePickerNews').value = newsTimeEdit;

                    $("#editNewsDesc").html(app.htmlDecode(newsDescEdit));                

                    if (newsImageEdit!==undefined && newsImageEdit!=="undefined" && newsImageEdit!=='' && newsUploadType==="image") {
                        var largeImage = document.getElementById('attachedImgEditNews');
                        largeImage.style.display = 'block';
                        largeImage.src = newsImageEdit;
                        upload_type_Edit = "image";
                
                        var largeVid = document.getElementById('attachedVidNewsEdit');        
                        largeVid.style.display = 'none';
                        largeVid.src = '';
                    }else if (newsImageEdit!==undefined && newsImageEdit!=="undefined" && newsImageEdit!=='' && newsUploadType==="video") {
                        var largeImageVid = document.getElementById('attachedVidNewsEdit');
                        largeImageVid.style.display = 'block';
                        largeImageVid.src = "styles/images/videoPlayIcon.png";
                        upload_type_Edit = "video";

                        var largeImage = document.getElementById('attachedImgEditNews');        
                        largeImage.style.display = 'none';
                        largeImage.src = '';                    
                    }else {            
                        var largeImage = document.getElementById('attachedImgEditNews');        
                        largeImage.style.display = 'none';
                        largeImage.src = '';

                        var largeVid = document.getElementById('attachedVidNewsEdit');        
                        largeVid.style.display = 'none';
                        largeVid.src = '';
                
                        newsDataToSend = '';
                        upload_type_Edit = '';
                    }
                                   
                    if (data[0]['status'][0].AdminGroup!==false) {
                        if (data[0]['status'][0].AdminGroup.length!==0 && data[0]['status'][0].AdminGroup.length!==undefined) {
                            adminAllGroupArray = [];
                            for (var i = 0 ; i < data[0]['status'][0].AdminGroup.length;i++) {
                                adminAllGroupArray.push({
                                                            group_name: data[0]['status'][0].AdminGroup[i].group_name,
                                                            pid: data[0]['status'][0].AdminGroup[i].pid
                                                        });
                            }
                        }

                        if (data[0]['status'][0].newsGroup !== null) {
                            if (data[0]['status'][0].newsGroup.length!==0 && data[0]['status'][0].newsGroup.length!==undefined) {
                                customerGroupArray = [];
                                for (var i = 0 ; i < data[0]['status'][0].newsGroup.length;i++) {
                                    customerGroupArray.push({
                                                                pid: data[0]['status'][0].newsGroup[i].group_id
                                                            });
                                }
                            }
                        
                            var allGroupLength = adminAllGroupArray.length;
                            var allCustomerLength = customerGroupArray.length;  

                            EditGroupArrayMember = [];
                            for (var i = 0;i < allGroupLength;i++) {                    
                                adminAllGroupArray[i].pid = parseInt(adminAllGroupArray[i].pid);                            
                                var check = ''; 
                                for (var j = 0;j < allCustomerLength;j++) {       
                                    if (parseInt(adminAllGroupArray[i].pid)===parseInt(customerGroupArray[j].pid)) {                                  
                                        check = 'selected';
                                        break;
                                    }else {                        
                                        check = '';                                               
                                    }  
                                }   

                                EditGroupArrayMember.push({
                                                              group_name: adminAllGroupArray[i].group_name,
                                                              pid: adminAllGroupArray[i].pid,
                                                              check:check
                                                          });
                            }
                        }else {
                            var allGroupLength = adminAllGroupArray.length;                         
                            for (var i = 0;i < allGroupLength;i++) {       
                                EditGroupArrayMember.push({
                                                              group_name: adminAllGroupArray[i].group_name,
                                                              pid: adminAllGroupArray[i].pid,
                                                              check:''
                                                          });
                            }
                        }   
                        
                        $.each(EditGroupArrayMember, function (index, value) {                            
                            if (value.check==='') {
                                $('#groupInEditNews').append($('<option/>', { 
                                                                   value: value.pid,
                                                                   text : value.group_name                                   
                                                               }));   
                            }else {
                                $('#groupInEditNews').append($('<option/>', { 
                                                                   value: value.pid,
                                                                   text : value.group_name ,
                                                                   selected:"selected"
                                                               }));   
                            }                                
                        });
                    }else {
                        app.noGroupAvailable();
                    }   
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.LogoutFromAdmin(); 
                }else {
                    app.showAlert(data[0]['status'][0].Msg , 'Notification'); 
                }                               
                app.hideAppLoader();
                $("#wrappe_news").show();
            });
        }
        
        var addNewNewsFunction = function() {
            organisationID = localStorage.getItem("orgSelectAdmin");            
            var event_description = $("#addNewsDesc").val();
            var event_Date = $("#adddatePickerNews").val();
            var event_Time = $("#adddateTimePickerNews").val();

            var group = [];		    
            
            $('#groupInAddNews :selected').each(function(i, selected) { 
                group[i] = $(selected).val(); 
            });
            
            group = String(group);   

            var currentDate = app.newGetCurrentDateTime();
            var values = currentDate.split('||');            
            var newsCompareDate = values[0];
            var newsCompareTime = values[1];
            
            if (event_description === "Please Enter News Here" || event_description === "") {
                app.showAlert("Please enter News.", app.APP_NAME);
            }else if (group.length===0 || group.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);
            }else if ((event_Date === "")) {
                app.showAlert("Please enter News date.", app.APP_NAME);
            }else if ((event_Time ==="")) {
                app.showAlert("Please enter News time.", app.APP_NAME);
            }else if ((event_Date > newsCompareDate)) {
                app.showAlert("News Can not be add in future date.", app.APP_NAME);    
            }else if ((event_Date===newsCompareDate) && (event_Time > newsCompareTime)) {
                app.showAlert("News Can not be add in future time.", app.APP_NAME);                            
            }else {
                var values = event_Date.split('-');            
                var year = values[0]; // globle variable            
                var month = values[1];            
                var day = values[2];
            
                var valueTime = event_Time.split(':');            
                var Hour = valueTime[0]; // globle variable            
                var Min = valueTime[1];        
            
                var eventTimeSend = Hour + ":" + Min + ":00";
             
                event_Date = year + "-" + month + "-" + day;
                
                var vidFmAndroid = 0;
                if (newsDataToSend!==undefined && newsDataToSend!=="undefined" && newsDataToSend!=='') { 
                    pbNews.animate(0);
                    countVal = 0;
                    if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="image")) {
                        photo_split = newsDataToSend.split("%3A");
                        newsDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroid = 1;
                    }else if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="video")) {
                        photo_split = newsDataToSend.split("%3A");
                        newsDataToSend = "content://media/external/video/media/" + photo_split[1];
                        vidFmAndroid = 1;  
                    }
                        
                    var mimeTypeVal;

                    if (upload_type==="image") {
                        mimeTypeVal = "image/jpeg"
                    }else {
                        mimeTypeVal = "video/mpeg"
                    }    
                            
                    var filename = newsDataToSend.substr(newsDataToSend.lastIndexOf('/') + 1);                            

                    if (upload_type==="image" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                    }else if (upload_type==="video" && vidFmAndroid===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.mp4';
                        }
                    }
                            
                    var openView = $("#tabstrip-upload-file").data("kendoMobileModalView");
                    openView.shim.popup.options.animation.open.duration = 400;
                    openView.open();
                    
                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtNewsDesc = event_description;
                    params.txtNewsDate = event_Date;
                    params.txtNewsTime = eventTimeSend;
                    params.upload_type = upload_type;
                    params.cmbGroup = group;                            
                    ft = new FileTransfer();
                    var options = new FileUploadOptions();
                    options.fileKey = "news_image";
                    options.fileName = filename;              
              
                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.chunkedMode = false;
                    options.headers = {
                        Connection: "close"
                    }
                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            countVal = perc;
                            var j = countVal / 100;                        
                            pbNews.animate(j, function() {
                                pbNews.animate(j);
                            });
                        }else {
                            pbNews.animate(0);
                            countVal = 0;
                        }
                    };
       
                    ft.upload(newsDataToSend, app.serverUrl() + "news/add", win, fail, options , true);                    
                }else {
                    app.showAppLoader(true);

                    var jsonDataSaveGroup = {"org_id":organisationID,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":eventTimeSend,"cmbGroup":group}
                    
                    var dataSourceaddGroup = new kendo.data.DataSource({
                                                                           transport: {
                            read: {
                                                                                       url: app.serverUrl() + "news/add",
                                                                                       type:"POST",
                                                                                       dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                  
                                                                                       data: jsonDataSaveGroup
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
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            if (addGroupData.status[0].Msg==='News added successfully') {  
                                $(".km-scroll-container").css("-webkit-transform", "");                           
                                $("#addNewsDesc").val('');                   
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NEWS_ADDED_MSG);  
                                }else {
                                    app.showAlert(app.NEWS_ADDED_MSG, "Notification");  
                                }                                                        
                                app.hideAppLoader();
                                app.mobileApp.navigate("#adminOrgNewsList");
                            }else if (addGroupData.status[0].Msg==="You don't have access") {                                           
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }                  
                                goToNewsListPage();
                            }else {
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                                app.hideAppLoader();
                            }
                        });
                    });
                }
            }      
        }
        
        var transferFileAbort = function() {    
            if (countVal < 90) {
                pbNews.animate(0);
                app.hideAppLoader();
                ft.abort(); 
                $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            }else {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.CANNOT_CANCEL);  
                }else {
                    app.showAlert(app.CANNOT_CANCEL , 'Notification');  
                } 
            }    
        }
        
        function win(r) {
            pbNews.animate(0);
            countVal = 0;
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            app.hideAppLoader();

            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.NEWS_ADDED_MSG);   
            }else {
                app.showAlert(app.NEWS_ADDED_MSG, "Notification"); 
            }
            
            $("#addNewsDesc").val('');             
            
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            
            var largevid = document.getElementById('attachedVidNews');
            largevid.src = '';
            
            $("#attachedImgNews").hide();
            $("#removeNewsAttachment").hide();            
            app.mobileApp.navigate("#adminOrgNewsList");
        }
                
        function fail(error) {
            pbNews.animate(0);
            countVal = 0;            
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            app.hideAppLoader();
 
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Notification');  
                } 
            }else {                
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.NEWS_EVENT_FAIL);  
                }else {
                    app.showAlert(app.NEWS_EVENT_FAIL , 'Notification');  
                }
            }
            //app.analyticsService.viewModel.trackFeature("News Add or Update fail" + JSON.stringify(error));            
        }

        var saveEditNewsData = function() {
            var event_description = $("#editNewsDesc").val();
            var event_Date = $("#editdatePickerNews").val();
            var event_Time = $("#editdateTimePickerNews").val();

            var groupEdit = [];		  
            
            $('#groupInEditNews :selected').each(function(i, selected) { 
                groupEdit[i] = $(selected).val(); 
            });                        
            groupEdit = String(groupEdit);             
            
            if (event_description === "Please Enter News Here" || event_description === "") {
                app.showAlert("Please Enter News .", app.APP_NAME);
            }else if (groupEdit.length===0 || groupEdit.length==='0') {
                app.showAlert("Please select Group.", app.APP_NAME);
            }else if ((event_Date === "")) {
                app.showAlert("Please enter News date.", app.APP_NAME);
            }else if ((event_Time ==="")) {
                app.showAlert("Please enter News time.", app.APP_NAME);
            }else {                    
                var values = event_Date.split('-');            
                var year = values[0]; // globle variable            
                var month = values[1];            
                var day = values[2];
            
                event_Date = year + "-" + month + "-" + day;
                
                var vidFmAndroidEdit = 0;
                
                if (newsDataToSend!==undefined && newsDataToSend!=="undefined" && newsDataToSend!=='') { 
                    if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type_Edit==="image")) {
                        photo_split = newsDataToSend.split("%3A");
                        newsDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroidEdit = 1;
                    }else if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type_Edit==="video")) {
                        photo_split = newsDataToSend.split("%3A");
                        newsDataToSend = "content://media/external/video/media/" + photo_split[1];
                        vidFmAndroidEdit = 1;  
                    }

                    var mimeTypeVal;
                    if (upload_type_Edit==="image") {
                        mimeTypeVal = "image/jpeg"
                    }else {
                        mimeTypeVal = "video/mpeg"
                    }                    
        
                    var filename = newsDataToSend.substr(newsDataToSend.lastIndexOf('/') + 1);                            
                    
                    if (upload_type_Edit==="image" && vidFmAndroidEdit===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.jpg';
                        }                
                    }else if (upload_type_Edit==="video" && vidFmAndroidEdit===1) {
                        if (filename.indexOf('.') === -1) {
                            filename = filename + '.mp4';
                        }
                    }
                   
                    pbNews.animate(0);
                    countVal = 0;
                     
                    var params = new Object();
                    params.org_id = organisationID;  //you can send additional info with the file
                    params.txtNewsDesc = event_description;
                    params.txtNewsDate = event_Date;
                    params.txtNewsTime = event_Time;
                    params.pid = newsPid;    
                    params.upload_type = upload_type_Edit;
                    params.cmbGroup = groupEdit;
                     
                    var options = new FileUploadOptions();
                    options.fileKey = "news_image";
                    options.fileName = filename;
              
                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }
                    options.chunkedMode = false;
             
                    $("#tabstrip-upload-file").data("kendoMobileModalView").open();
                     
                    ft = new FileTransfer();                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            countVal = perc;
                            var j = countVal / 100;                        
                            pbNews.animate(j, function() {
                                pbNews.animate(j);
                            });
                        }else {
                            pbNews.animate(0);
                            countVal = 0;
                        }
                    };
                    ft.upload(newsDataToSend, app.serverUrl() + "news/edit", winEdit, fail, options , true);
                }else {
                    app.showAppLoader(true);

                    var jsonDataSaveGroup = {"org_id":organisationID ,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":event_Time,"pid":newsPid,"cmbGroup":groupEdit,"upload_type":upload_type_Edit}
            
                    var dataSourceaddGroup = new kendo.data.DataSource({
                                                                           transport: {
                            read: {
                                                                                       url: app.serverUrl() + "news/edit",
                                                                                       type:"POST",
                                                                                       dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                                                      
                                                                                       data: jsonDataSaveGroup
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
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            if (addGroupData.status[0].Msg==='News updated successfully') {         
                                app.mobileApp.navigate("#adminOrgNewsList");
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NEWS_UPDATED_MSG);  
                                }else {
                                    app.showAlert(app.NEWS_UPDATED_MSG, "Notification");  
                                }
                                app.hideAppLoader();
                            }else if (addGroupData.status[0].Msg==="Session Expired") {
                                app.LogoutFromAdmin(); 
                            }else if (addGroupData.status[0].Msg==="You don't have access") {
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showShortBottom(app.NO_ACCESS);  
                                }else {
                                    app.showAlert(app.NO_ACCESS , 'Offline');  
                                }
                     
                                goToNewsListPage();
                            } else {
                                app.hideAppLoader();
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                            }
                        });
                    });
                }   
            }
        }
        
        function winEdit(r) {
            pbNews.animate(0);
            countVal = 0;
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();

            app.hideAppLoader();
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom(app.NEWS_UPDATED_MSG);  
            }else {
                app.showAlert(app.NEWS_UPDATED_MSG , 'Notification');  
            }
                        
            app.mobileApp.navigate("#adminOrgNewsList");
        }
        
        var goToManageOrgPage = function() {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
        }
        
        var goToAddNewsPage = function() {
            app.mobileApp.navigate('#adminAddNews');

            //app.analyticsService.viewModel.trackFeature("User navigate to Add News in Admin");            
        }
        
        var goToNewsListPage = function() {
            app.mobileApp.navigate('#adminOrgNewsList');

            //app.analyticsService.viewModel.trackFeature("User navigate to News List in Admin");            
        }
        
        var orgAllNewsList = function() {
            app.mobileApp.navigate('#adminOrgNewsList');

            //app.analyticsService.viewModel.trackFeature("User navigate to News List in Admin");            
        }
        
        var addNewEvent = function() {
            app.mobileApp.navigate('#adminAddEventCalendar');
            //app.analyticsService.viewModel.trackFeature("User navigate to Add Event in Admin");            
        }
        
        var upcommingEventList = function() {
            app.mobileApp.navigate('#adminEventList');
        }
        
        var eventListShow = function() {
            $(".km-scroll-container").css("-webkit-transform", "");
            
            var allEventLength = groupAllEvent.length;
            
            if (allEventLength===0) {
                groupAllEvent.push({
                                       id:0 ,
                                       add_date:'',
                                       event_date:'',
                                       event_desc: 'This Organization has no event.',                                                                                 										  
                                       event_name: 'No Event',                                                                                  										  
                                       event_time: '',                                                                                  										  
                                       mod_date: '',                                     
                                       org_id: ''
                                   });
            }
 
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#eventCalendarAllList").kendoMobileListView({
                                                               template: kendo.template($("#calendarEventListTemplate").html()),    		
                                                               dataSource: organisationListDataSource
                                                           });
                
            $('#eventCalendarAllList').data('kendoMobileListView').refresh();
        }
        
        var getTakePhoto = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,                                     
                                            correctOrientation: true
                                        });
        };
        
        var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        var getVideoVal = function() {            
            navigator.camera.getPicture(onVideoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
                                        });
        }
                
        function onPhotoURISuccessData(imageURI) {        
            var videoAttached = document.getElementById('attachedVidNews');
            videoAttached.src = '';    
            $("#attachedVidNews").hide();
            
            var largeImage = document.getElementById('attachedImgNews');
            
            largeImage.style.display = 'block';
            
            largeImage.src = imageURI;
            newsDataToSend = imageURI;
            upload_type = "image";
            
            $("#attachedImgNews").show();
        }
        
        function onVideoURISuccessData(videoURI) {             
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = ''; 
            $("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();            
            
            var videoAttached = document.getElementById('attachedVidNews');
            videoAttached.style.display = 'block';            
            
            videoAttached.src = 'styles/images/videoPlayIcon.png';
            
            newsDataToSend = videoURI;    
            upload_type = "video";
            
            $("#removeNewsAttachment").show(); 
            $("#attachedVidNews").show();
        }
         
        function onFail(message) {
            $("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();
        }
         
        var removeImage = function() {
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            var videoAttached = document.getElementById('attachedVidNews');
            videoAttached.src = '';            

            $("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();
            $("#attachedVidNews").hide();            
            newsDataToSend = ''; 
        }
        
        var getTakePhotoEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true
                                        });
        };
        
        var getPhotoValEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        var upload_type_Edit;
                
        var getVideoValEdit = function() {
            navigator.camera.getPicture(onVideoURISuccessDataEdit, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
                                        }); 
        }
        
        function onPhotoURISuccessDataEdit(imageURI) {
            var imageAttached = document.getElementById('attachedVidNewsEdit');
            imageAttached.src = '';
            $("#attachedVidNewsEdit").hide();
               
            var largeImage = document.getElementById('attachedImgEditNews');
            largeImage.style.display = 'block';
            largeImage.src = imageURI;
            newsDataToSend = imageURI;              
            $("#attachedImgEditNews").show();

            upload_type_Edit = "image";   
        }
        
        function onVideoURISuccessDataEdit(videoURI) {
            var imageAttached = document.getElementById('attachedImgEditNews');
            imageAttached.src = '';
            $("#attachedImgEditNews").hide();
            
            var largeImage = document.getElementById('attachedVidNewsEdit');
            largeImage.style.display = 'block';
            largeImage.src = 'styles/images/videoPlayIcon.png';
            newsDataToSend = videoURI;
            
            upload_type_Edit = "video";
            
            $("#attachedVidNewsEdit").show();           
        }
        
        function onFailEdit(message) {
        }
         
        var removeImageEdit = function() {
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';            
            $("#attachedImgEditNews").hide();
            
            var largeVid = document.getElementById('attachedVidNewsEdit');
            largeVid.src = '';            
            $("#attachedVidNewsEdit").hide();

            newsDataToSend = ''; 
            upload_type_Edit = '';
        }
        
        var open = 0;
        var clickToSelectGroup = function() {
            if (open===0) {
                $("#groupInAddNews").hide().slideDown({duration: 500});
                open = 1;
            }else {
                $("#groupInAddNews").slideUp("slow");
                open = 0
            }
        }
        
        var showMoreButtonPress = function() {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else { 
                page++;
                dataReceived = dataReceived + 10;
                getLiveData();            
            }
        }
         
        var checkClick = function() {
            if ($("#selectAll").prop('checked')===true) {
                $('.largerCheckboxSelectAll').prop('checked', false);
                document.getElementById("selectAll").checked = false;
            }
        }
        
        var getDataToPost = function(e) {
            var message = e.data.news_desc;
            var title = '';
            var attached = e.data.news_image;
            var type = e.data.upload_type;            

            if (attached!== null && attached!=='' && attached!=="0") {
                localStorage.setItem("shareImg", attached);
            }else {
                localStorage.setItem("shareImg", null);
            }
            
            localStorage.setItem("shareMsg", message);
            localStorage.setItem("shareTitle", title);            
        }
        
        return {
            init: init,
            show: show,
            editNews:editNews,
            checkClick:checkClick,
            eventListShow:eventListShow,
            getTakePhoto:getTakePhoto,
            getVideoValEdit:getVideoValEdit,
            getPhotoValEdit:getPhotoValEdit,
            getTakePhotoEdit:getTakePhotoEdit,
            getPhotoVal:getPhotoVal,
            getVideoVal:getVideoVal,
            getDataToPost:getDataToPost,
            removeImage:removeImage,
            removeImageEdit:removeImageEdit,
            addNewEvent:addNewEvent,
            deleteNews:deleteNews,
            getLiveData:getLiveData,
            clickToSelectGroup:clickToSelectGroup,
            editNewsshow:editNewsshow,
            goToAddNewsPage:goToAddNewsPage,
            goToNewsListPage:goToNewsListPage,
            goToManageOrgPage:goToManageOrgPage,
            showMoreButtonPress:showMoreButtonPress,
            addNewNewsFunction:addNewNewsFunction,
            addNewsshow:addNewsshow,
            orgAllNewsList:orgAllNewsList,
            transferFileAbort:transferFileAbort,
            saveEditNewsData:saveEditNewsData,
            upcommingEventList:upcommingEventList,
            selectAllCheckBox:selectAllCheckBox,
            showInListView:showInListView
        };
    }());
        
    return adminNewsEventModel;
}());