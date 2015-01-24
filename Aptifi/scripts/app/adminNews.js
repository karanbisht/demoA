var app = app || {};

app.adminNews = (function () {
    var adminNewsEventModel = (function () {
        var organisationID;
        var groupAllEvent = [];
        var tasks = [];
        var newsDataToSend;
        var upload_type;
        var groupDataShow = [];

        var init = function() {
        }
    
        var show = function() {            
            $("#adminNewsListLoader").show();
            $("#orgAllNewsList").hide();
            
            $(".km-scroll-container").css("-webkit-transform", "");
            
            organisationID = localStorage.getItem("orgSelectAdmin");
            
            //$("#removeNewsAttachment").hide(); 
            $("#attachedImgNews").hide();
            $("#attachedVidNews").hide();
            
            newsDataToSend = '';
            upload_type = '';
             
            pb = $("#profileCompleteness").kendoProgressBar({
                                                                type: "chunk",
                                                                chunkCount: 100,
                                                                min: 0,
                                                                max: 100,
                                                                value: 0
                                                            }).data("kendoProgressBar");
            
            var jsonDataLogin = {"org_id":organisationID}

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
                        console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(e);             
                                                                    console.log(JSON.stringify(e));
                                                                    $("#adminNewsListLoader").hide();
                                                                    $("#orgAllNewsList").show();

                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
                                                                        app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                    }           
                                                                    
                                                                    app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response from API fetching Organization News List in Admin Panel.');
                         
                                                                    var showNotiTypes = [
                                                                        { message: "Please Check Your Internet Connection"}
                                                                    ];
                       
                                                                    var dataSource = new kendo.data.DataSource({
                                                                                                                   data: showNotiTypes
                                                                                                               });
                    
                                                                    $("#orgAllNewsList").kendoMobileListView({
                                                                                                                 template: kendo.template($("#errorTemplate").html()),
                                                                                                                 dataSource: dataSource  
                                                                                                             });
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                //var loginDataView = dataSourceLogin.data();               
                //console.log(loginDataView);
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
                    app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                    app.LogoutFromAdmin(); 
                }else if (data[0]['status'][0].Msg==="You don't have access") {                                    
                    
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }
                }else if (data[0]['status'][0].Msg==='Success') {
                    groupAllEvent = [];

                    if (data[0].status[0].newsData.length!==0) {
                        var eventListLength = data[0].status[0].newsData.length;
                            
                        //console.log(loginData.status[0].newsData);
                            
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
            //tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/
        }
        
        function showEventInCalendar() {                         
            //console.log(tasks);            
            multipleEventArray = [];

            //class="#= data.dates[+data.date] #"
            
            $("#admincalendar").kendoCalendar({
                                                  //value:new Date(),
                                                  dates:tasks,
                                                  month:{
                    content:'# if (typeof data.dates[+data.date] === "string") { #' +
                            '<div style="color:rgb(53,152,219);">' +
                            '#= data.value #' +
                            '</div>' +
                            '# } else { #' +
                            '#= data.value #' +
                            '# } #'
                },
                                                  change: selectedDataByUser,              
              
                                                  navigate:function () {
                                                      $(".ob-done-date", "#admincalendar").parent().addClass("ob-done-date-style k-state-hover");
                                                      $(".ob-not-done-date", "#admincalendar").parent().addClass("ob-not-done-date-style k-state-hover");
                                                  }
                                              }).data("kendoCalendar");             
        }

        var multipleEventArray = [];
        var date2;

        function selectedDataByUser() {
            //console.log("Change :: " + kendo.toString(this.value(), 'd'));
            var date = kendo.toString(this.value(), 'd'); 
            
            date2 = kendo.toString(this.value(), 'd'); 

            $("#eventDetailDiv").hide();
 
            multipleEventArray = [];
            document.getElementById("eventTitle").innerHTML = "";
             
            var checkGotevent = 0;
            
            for (var i = 0;i < groupAllEvent.length;i++) {
                //date=date.toString();
                //groupAllEvent[i].event_date=groupAllEvent[i].event_date.toString();
                //console.log(date);
                //console.log(groupAllEvent[i].event_date);
                var dateFmLive = groupAllEvent[i].event_date;
                
                var values = dateFmLive.split('/');
                var monthShow = values[0]; // globle variable
                var dayShow = values[1];
                var yearShow = values[2];
                
                if (monthShow < 10) {
                    monthShow = monthShow.replace(/^0+/, '');                                                         
                }
                
                var dateToCom = monthShow + '/' + dayShow + '/' + yearShow;
                
                //date=date.trim();//replace(/^"(.*)"$/, '$1');
                //dateToCom=dateToCom.trim();//.replace(/^"(.*)"$/, '$1');
                
                //date=date.replace(/"/g, "");
                //dateToCom = dateToCom.replace(/"/g, "");

                //console.log(JSON.stringify(date));
                //console.log(JSON.stringify(dateToCom));

                //alert(date+"||"+dateToCom);
                
                if (date===dateToCom) {
                    $("#eventDetailDiv").show();
                    $("#eventDate").html(date);
                    
                    document.getElementById("eventTitle").innerHTML += '<ul><li style="color:rgb(53,152,219);">' + groupAllEvent[i].event_name + ' at ' + groupAllEvent[i].event_time + '</li></ul>' 
                                                                                        
                    multipleEventArray.push({
                                                id: groupAllEvent[i].id,
                                                add_date: groupAllEvent[i].add_date,
                                                event_date: groupAllEvent[i].event_date,
                                                event_desc: groupAllEvent[i].event_desc,                                                                                 										  
                                                event_name: groupAllEvent[i].event_name,
                                                upload_type :groupAllEvent[i].upload_type,
                                                event_time: groupAllEvent[i].event_time,                                                                                  										  
                                                mod_date: groupAllEvent[i].mod_date,                                     
                                                org_id: groupAllEvent[i].org_id
                                            });

                    //$("#eventTitle").html(groupAllEvent[i].event_name);
                    //$("#eventTime").html(groupAllEvent[i].event_time);
                    
                    checkGotevent = 1;
                    //break;
                }   
            }
            
            if (checkGotevent===0) {
                app.mobileApp.navigate('#adminAddEventCalendar');
            }else {
                $("#eventDetailDiv").show();
            }
        }
        
        var eventMoreDetailClick = function() {
            app.mobileApp.navigate('#adminEventCalendarDetail');
        }
        
        var showInListView = function() {
            $(".km-scroll-container").css("-webkit-transform", "");

            $("#adminNewsListLoader").hide();
            $("#orgAllNewsList").show();
            
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupAllEvent
                                                                       });           
                
            $("#orgAllNewsList").kendoMobileListView({
                                                         template: kendo.template($("#newsListTemplate").html()),    		
                                                         dataSource: organisationListDataSource
                                                     });
                
            $('#orgAllNewsList').data('kendoMobileListView').refresh();
        }
        
        var addEventshow = function() {
            
            
            $(".km-scroll-container").css("-webkit-transform", "");
           
            groupDataShow = [];
            
            var footer = $(".footer");
            footer.css({ "top": footer.position().top, "bottom": "auto"});
            
            $("#adddatePickerNews").removeAttr('disabled');           
            $("#adddateTimePickerNews").removeAttr('disabled');

            $("#addNewsName").val('');
            $("#addNewsDesc").val('');
            
            $("#adddatePickerNews").parent().css('width', "160px");
            $("#adddateTimePickerNews").parent().css('width', "160px");
            $("#adddatePickerNews").removeClass("k-input");
            $("#adddateTimePickerNews").removeClass("k-input");            
            
            $('#addNewsDesc').css('height', '80px');

            var txt = $('#addNewsDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');

            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            
            $("#sendNewsLoader").show();
            
            $('body').append(hiddenDiv);

            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });
            
            var currentDate = app.getPresentDate();
            
            disabledDaysBefore = [
                +new Date(currentDate)
            ];
            
            $("#adddatePickerNews").kendoDatePicker({
                                                        value: new Date(),
                                                        dates: disabledDaysBefore,    
                                                        month:{
                    content:'# if (data.date > data.dates) { #' + 
                            '<div class="disabledDay">' +
                            '#= data.value #' +
                            '</div>' +
                            '# } else { #' +
                            '#= data.value #' +
                            '# } #'
                },
                                                        position: "bottom left",
                                                        animation: {
                    open: {
                                                                    effects: "slideIn:up"
                                                                }                
                },
                                                        open: function(e) {
                                                            $(".disabledDay").parent().removeClass("k-link")
                                                            $(".disabledDay").parent().removeAttr("href")
                                                        },

                 
                                                        change: function() {
                                                            var value = this.value();
                                                            //console.log(value); 
                                                            /*if(new Date(value) < new Date(currentDate)){                   
                                                            if(!app.checkSimulator()){
                                                            window.plugins.toast.showLongBottom('You Cannot Add Event on Back Date');  
                                                            }else{
                                                            app.showAlert('You Cannot Add Event on Back Date',"Event");  
                                                            }                                
                                                            }*/    
                                                        }
                                                    }).data("kendoDatePicker");
                         
            $("#adddateTimePickerNews").kendoTimePicker({
                                                            value:"10:00 AM",
                                                            interval: 15,
                                                            format: "h:mm tt",
                                                            timeFormat: "HH:mm", 
                                                            /*open: function(e) {
                                                            e.preventDefault(); //prevent popup opening
                                                            },*/
                
                                                            change: function() {
                                                                var value = this.value();
                                                                //console.log(value); //value is the selected date in the timepicker
                                                            }                
                                                        });
            
            $('#adddatePickerNews').attr('disabled', 'disabled');
            $('#adddateTimePickerNews').attr('disabled', 'disabled');

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
                        console.log(data);
                        return [data];                       
                    }
                },
                                                                         error: function (e) {
                                                                             console.log(JSON.stringify(e));

                                                                             $("#sendNewsLoader").hide();

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
            
            comboGroupListDataSource.fetch(function() {                                                       
                groupDataShow = [];
                var data = this.data();                
                                            
                if (data[0]['status'][0].Msg==='No Group list') {
                }else if (data[0]['status'][0].Msg==="You don't have access") {
                    //app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                    //app.LogoutFromAdmin();             
                    if (!app.checkSimulator()) {
                        window.plugins.toast.showLongBottom("You don't have access");  
                    }else {
                        app.showAlert("You don't have access" , 'Offline');  
                    }
                    //app.mobileApp.navigate('views/organisationLogin.html');   
                    //localStorage.setItem("loginStatusCheck", 1);                                
                }else if (data[0]['status'][0].Msg==="Session Expired") {
                    app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                    app.LogoutFromAdmin(); 
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
        
        var showGroupDataInTemplate = function() {
            //alert('hello');
            console.log(groupDataShow);
            $("#sendNewsLoader").hide();

            
            $(".km-scroll-container").css("-webkit-transform", "");
           
            var comboGroupListDataSource = new kendo.data.DataSource({
                                                                         data: groupDataShow
                                                                     });              
            
            $("#groupInAddNews").kendoListView({
                                                   template: kendo.template($("#groupNameShowTemplate").html()),    		
                                                   dataSource: comboGroupListDataSource
                                               });
        }
        
        var newsDescEdit;
        var newsDateEdit;
        var newsTimeEdit;
        var newsImageEdit;
        var newsUploadType;
        var newsPid;
        
        var editNews = function(e) {
            //console.log(e.data.uid);
            //console.log(e.data);
            newsDescEdit = e.data.news_desc;
            newsDateEdit = e.data.news_date;
            newsTimeEdit = e.data.news_time;
            newsImageEdit = e.data.news_image;
            newsUploadType = e.data.upload_type;
            newsPid = e.data.id;

            app.analyticsService.viewModel.trackFeature("User navigate to Edit News in Admin");            

            app.mobileApp.navigate('#adminEditNews');
        }
        
        var deleteNews = function(e) {
            //console.log(e.data.uid);
            //console.log(e.data);
            organisationID = localStorage.getItem("orgSelectAdmin");
            
            //console.log('orgID=' + organisationID + "pid=" + newsPid)

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
                        console.log(data);
                        return [data];
                    }
                },
                                                                   error: function (e) {
                                                                       //apps.hideLoading();
                                                                       console.log(JSON.stringify(e));
                                                                       if (!app.checkSimulator()) {
                                                                           window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                       }else {
                                                                           app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                       }               
                                                                   }               
          
                                                               });  
	            
            dataSourceaddGroup.fetch(function() {
                var loginDataView = dataSourceaddGroup.data();
                $.each(loginDataView, function(i, addGroupData) {
                    //console.log(addGroupData.status[0].Msg);           
                    if (addGroupData.status[0].Msg==='Deleted Successfully') {         
                        app.mobileApp.navigate("#adminOrgNewsList");
                        
                        if (!app.checkSimulator()) {
                            window.plugins.toast.showLongBottom('News Deleted Successfully');  
                        }else {
                            app.showAlert('News Deleted Successfully', "Notification");  
                        }
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }
                });
            });
        }
        
        var adminAllGroupArray = [];
        var customerGroupArray = [];
        var EditGroupArrayMember = [];
        
        var editNewsshow = function() {
            EditGroupArrayMember = [];
            adminAllGroupArray = [];
            customerGroupArray = [];
                                                
            $(".km-scroll-container").css("-webkit-transform", "");                                    
            $('#editNewsDesc').css('height', '80px');
            
            pb = $("#profileCompleteness").kendoProgressBar({
                                                                type: "chunk",
                                                                chunkCount: 100,
                                                                min: 0,
                                                                max: 100,
                                                                value: 0
                                                            }).data("kendoProgressBar");

            var txt = $('#editNewsDesc'),
                hiddenDiv = $(document.createElement('div')),
                content = null;
    
            txt.addClass('txtstuff');
            hiddenDiv.addClass('hiddendiv common');
            
            $("#editdatePickerNews").removeAttr('disabled');
            $("#editdateTimePickerNews").removeAttr('disabled');
            $("#editdatePickerNews").parent().css('width', "160px");
            $("#editdateTimePickerNews").parent().css('width', "160px");
            $("#editdatePickerNews").removeClass("k-input");
            $("#editdateTimePickerNews").removeClass("k-input");        
            $('body').append(hiddenDiv);            
            $("#sendEditNewsLoader").show();
            $("#wrappe_news").hide();
            
            
            txt.on('keyup', function () {
                content = $(this).val();
    
                content = content.replace(/\n/g, '<br>');
                hiddenDiv.html(content + '<br class="lbr">');
    
                $(this).css('height', hiddenDiv.height());
            });

            /*newsDescEdit = e.data.news_desc;
            newsDateEdit = e.data.news_date;
            newsTimeEdit = e.data.news_time;
            newsImageEdit = e.data.news_image;
            newsUploadType = e.data.upload_type;
            newsPid = e.data.id;*/

            var org_id = localStorage.getItem("orgSelectAdmin");
            
            //alert(org_id+"||"+newsPid);
            
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
                        console.log(data);
                        return [data];
                    }
                },
                                                                       error: function (e) {
                                                                           //apps.hideLoading();
                                                                           console.log(JSON.stringify(e));
                                                                           
                                                                           $("#sendEditNewsLoader").hide();

                                                                           
                                                                           if (!app.checkSimulator()) {
                                                                               window.plugins.toast.showShortBottom('Please check your internet connection.');
                                                                           }else {
                                                                               app.showAlert("Please check your internet connection.", "Notification"); 
                                                                           }
                                                                       }               
                                                                   });  
	            
            dataSourceMemberDetail.fetch(function() {
                var loginDataView = dataSourceMemberDetail.data();                                    
                $.each(loginDataView, function(i, addGroupData) {
                    console.log(addGroupData);
                    if (addGroupData.status[0].Msg==='Success') {
                        EditGroupArrayMember = [];
                        adminAllGroupArray = [];
                        customerGroupArray = [];
                        
                      
                        
                        newsDescEdit = addGroupData.status[0].newsDetail[0].news_desc;
                        newsDateEdit = addGroupData.status[0].newsDetail[0].news_date;
                        newsTimeEdit = addGroupData.status[0].newsDetail[0].news_time;
                        newsImageEdit = addGroupData.status[0].newsDetail[0].news_image;
                        newsUploadType = addGroupData.status[0].newsDetail[0].upload_type;
                        newsPid = addGroupData.status[0].newsDetail[0].id;
                                   
                        $("#editNewsDesc").html(app.htmlDecode(newsDescEdit));                

                        if (newsImageEdit!==undefined && newsImageEdit!=="undefined" && newsImageEdit!=='' && newsUploadType==="image") {
                            var largeImage = document.getElementById('attachedImgEditNews');
                            largeImage.style.display = 'block';
                            largeImage.src = newsImageEdit;
                            upload_type_Edit = "image";
                
                            var largeVid = document.getElementById('attachedVidNewsEdit');        
                            largeVid.style.display = 'none';
                            largeVid.src = '';
                            newsDataToSend = newsImageEdit ; 
                        }else if (newsImageEdit!==undefined && newsImageEdit!=="undefined" && newsImageEdit!=='' && newsUploadType==="video") {
                            var largeImageVid = document.getElementById('attachedVidNewsEdit');
                            largeImageVid.style.display = 'block';
                            largeImageVid.src = newsImageEdit;
                            upload_type_Edit = "video";

                            var largeImage = document.getElementById('attachedImgEditNews');        
                            largeImage.style.display = 'none';
                            largeImage.src = '';                    
                            newsDataToSend = newsImageEdit ; 
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
            
                        var currentDate = app.getPresentDate();
            
                        disabledDaysBefore = [
                            +new Date(currentDate)
                        ];

                        $("#editdatePickerNews").kendoDatePicker({                
                                                                     value: newsDateEdit,
                                                                     dates: disabledDaysBefore,    
                                                                     month:{
                                content:'# if (data.date > data.dates) { #' + 
                                        '<div class="disabledDay">' +
                                        '#= data.value #' +
                                        '</div>' +
                                        '# } else { #' +
                                        '#= data.value #' +
                                        '# } #'
                            },
                                                                     position: "bottom left",
                                                                     animation: {
                                open: {
                                                                                 effects: "slideIn:up"
                                                                             }                
                            },
                                                                     open: function(e) {
                                                                         $(".disabledDay").parent().removeClass("k-link")
                                                                         $(".disabledDay").parent().removeAttr("href")
                                                                     },

                 
                                                                     change: function() {
                                                                         var value = this.value();
                                                                         console.log(value); 
                                                                         /*if(new Date(value) < new Date(currentDate)){                   
                                                                         if(!app.checkSimulator()){
                                                                         window.plugins.toast.showLongBottom('You Cannot Add Event on Back Date');  
                                                                         }else{
                                                                         app.showAlert('You Cannot Add Event on Back Date',"Event");  
                                                                         }                                
                                                                         }*/    
                                                                     }
                                                                 }).data("kendoDatePicker");
                         
                        $("#editdateTimePickerNews").kendoTimePicker({
                                                                         value:newsTimeEdit,
                                                                         interval: 15,
                                                                         format: "h:mm tt",
                                                                         timeFormat: "HH:mm", 
                                                                         /*open: function(e) {
                                                                         e.preventDefault(); //prevent popup opening
                                                                         },*/
                
                                                                         change: function() {
                                                                             var value = this.value();
                                                                             //console.log(value); //value is the selected date in the timepicker
                                                                         }                
                                                                     });
                                   
                        //alert(addGroupData.status[0].AdminGroup.length);                        
                        if (addGroupData.status[0].AdminGroup.length!==0 && addGroupData.status[0].AdminGroup.length!==undefined) {
                            adminAllGroupArray = [];
                            for (var i = 0 ; i < addGroupData.status[0].AdminGroup.length;i++) {
                                adminAllGroupArray.push({
                                                            group_name: addGroupData.status[0].AdminGroup[i].group_name,
                                                            pid: addGroupData.status[0].AdminGroup[i].pid
                                                        });
                            }
                        }
                        
                        //alert(addGroupData.status[0].newsGroup.length);
                        if (addGroupData.status[0].newsGroup.length!==0 && addGroupData.status[0].newsGroup.length!==undefined) {
                            customerGroupArray = [];
                            for (var i = 0 ; i < addGroupData.status[0].newsGroup.length;i++) {
                                customerGroupArray.push({
                                                            pid: addGroupData.status[0].newsGroup[i].group_id
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
                                    check = 'checked';
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
                    }else if (addGroupData.status[0].Msg==="Session Expired") {
                        app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                        app.LogoutFromAdmin(); 
                    }else {
                        app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                    }                               
                    //console.log('------------------');
                    console.log(EditGroupArrayMember);
                    
                    /*var comboEditGroupListDataSource = new kendo.data.DataSource({
                    data: EditGroupArrayMember
                    }); */                        
            
                    $("#groupInEditNews").kendoListView({
                                                            template: kendo.template($("#groupNameEditShowTemplate").html()),    		
                                                            dataSource: EditGroupArrayMember
                                                        });
                                $("#sendEditNewsLoader").hide();
                                $("#wrappe_news").show();

                });
            });
        }
        
        var addNewNewsFunction = function() {
            organisationID = localStorage.getItem("orgSelectAdmin");
            
            var event_description = $("#addNewsDesc").val();

            var event_Date = $("#adddatePickerNews").val();
            var event_Time = $("#adddateTimePickerNews").val();

            var group = [];		    
            $(':checkbox:checked').each(function(i) {
                group[i] = $(this).val();
            });            
            group = String(group);       
            
            if (event_description === "Please Enter News Here" || event_description === "") {
                app.showAlert("Please enter News.", "Validation Error");
            }else if (group.length===0 || group.length==='0') {
                app.showAlert("Please select Group.", "Validation Error");    
            }else {
                $("#sendNewsLoader").show();
                var values = event_Date.split('/');            
                var month = values[0]; // globle variable            
                var day = values[1];            
                var year = values[2];
             
                if (day < 10) {
                    day = "0" + day;
                }
            
                var valueTime = event_Time.split(':');            
                var Hour = valueTime[0]; // globle variable            
                var Min = valueTime[1];        
            
                var valueTimeMin = Min.split(' '); 
                var minute = valueTimeMin[0];
                var AmPm = valueTimeMin[1];
                if (AmPm==='PM') {
                    if (Hour!=='12' && Hour!==12) {
                        Hour = parseInt(Hour) + 12;
                    }
                }
            
                //console.log(Hour + "||" + minute + "||" + AmPm);
            
                var eventTimeSend = Hour + ":" + minute + ":00";
                //eventTimeSend=eventTimeSend.toString();
             
                event_Date = year + "-" + month + "-" + day;
                //event_Date=event_Date.toString();

                var actionval = "Add";

                //alert(upload_type);
                
                var vidFmAndroid = 0;
                if (newsDataToSend!==undefined && newsDataToSend!=="undefined" && newsDataToSend!=='') { 
                    pb.value(0);
                    if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="image")) {
                        //alert('1');
                        photo_split = newsDataToSend.split("%3A");
                        //console.log(photo_split);
                        newsDataToSend = "content://media/external/images/media/" + photo_split[1];
                        vidFmAndroid = 1;
                    }else if ((newsDataToSend.substring(0, 21)==="content://com.android") && (upload_type==="video")) {
                        //alert('2');
                        photo_split = newsDataToSend.split("%3A");
                        //console.log(photo_split);
                        newsDataToSend = "content://media/external/video/media/" + photo_split[1];
                        vidFmAndroid = 1;  
                    }
                        
                    var mimeTypeVal;

                    if (upload_type==="image") {
                        mimeTypeVal = "image/jpeg"
                    }else {
                        mimeTypeVal = "video/mpeg"
                    }    

                    //console.log("org_id=" + organisationID + "txtNewsDesc=" + event_description + "txtNewsDate=" + event_Date + "txtNewsTime=" + eventTimeSend);                            
                    //alert(newsDataToSend);
                            
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
                            
                    var path = newsDataToSend;
                    //console.log(path);
                    
                    $("#tabstrip-upload-file").data("kendoMobileModalView").open();
                    
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
                    //console.log(options.fileName);
              
                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.chunkedMode = true;
                    options.headers = {
                        Connection: "close"
                    }
                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            pb.value(perc);                            
                        }else {
                            pb.value('');                            
                        }
                    };
       
                    //console.log(tasks);

                    ft.upload(newsDataToSend, app.serverUrl() + "news/add", win, fail, options , true);                    
                }else {
                    //console.log("org_id=" + organisationID + "txtNewsDesc=" + event_description + "txtNewsDate=" + event_Date + "txtNewsTime=" + eventTimeSend);
                    var jsonDataSaveGroup = {"org_id":organisationID,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":eventTimeSend,"cmbGroup":group}
                
                    console.log(jsonDataSaveGroup);
                    
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
                                console.log(data);
                                console.log(JSON.stringify(data))
                                return [data];
                            }
                        },
                                                                           error: function (e) {
                                                                               //apps.hideLoading();
                                                                               console.log(JSON.stringify(e));
                                                                               $("#sendNewsLoader").hide();
                                                                               if (!app.checkSimulator()) {
                                                                                   window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                               }else {
                                                                                   app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                               }               
                                                                           }              
                                                                       });  
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            console.log(addGroupData.status[0].Msg);           
                            if (addGroupData.status[0].Msg==='News added successfully') {  
                                $(".km-scroll-container").css("-webkit-transform", "");                           
                                $("#addNewsDesc").val('');                   
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom('News Added Successfully');  
                                }else {
                                    app.showAlert('News Added Successfully", "Notification');  
                                }
                                                        
                                $("#sendNewsLoader").hide();

                                app.mobileApp.navigate("#adminOrgNewsList");
                            }else {
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                                $("#sendNewsLoader").hide();
                            }
                        });
                    });
                }   
            }      
        }
        
        var transferFileAbort = function() {           
            ft.abort(); 
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            pb.value(0); 
        }
        
        function win(r) {
            pb.value(0);
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            //console.log('win');
            //console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            //console.log("Sent = " + r.bytesSent);

            $("#sendNewsLoader").hide();

            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('News Added Successfully');   
            }else {
                app.showAlert("News Added Successfully", "Notification"); 
            }              
            $("#addNewsDesc").val('');             
            
            var largeImage = document.getElementById('attachedImgNews');
            largeImage.src = '';
            
            var largevid = document.getElementById('attachedVidNews');
            largevid.src = '';
            
            $("#attachedImgNews").hide();
            $("#removeNewsAttachment").hide();
            app.mobileApp.navigate("#adminAddNews");
        }
                
        function fail(error) {
            pb.value(0);
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();
            //console.log(error);
            console.log(JSON.stringify(error));
            console.log("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            //console.log("upload error target " + error.target);

            $("#sendNewsLoader").hide();
            $("#sendEditNewsLoader").hide();
 
            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('Network problem . Please try again later');   
            }else {
                app.showAlert("Network problem . Please try again later", "Notification");  
            }
        }

        var saveEditNewsData = function() {
            var event_description = $("#editNewsDesc").val();
            var event_Date = $("#editdatePickerNews").val();
            var event_Time = $("#editdateTimePickerNews").val();

            var groupEdit = [];		    
            $(':checkbox:checked').each(function(i) {
                groupEdit[i] = $(this).val();
            });            
            groupEdit = String(groupEdit);             
            console.log(groupEdit);
            
            if (event_description === "Please Enter News Here" || event_description === "") {
                app.showAlert("Please Enter News .", "Validation Error");
            }else if (groupEdit.length===0 || groupEdit.length==='0') {
                app.showAlert("Please select Group.", "Validation Error");    
            }else {                    
                $("#sendEditNewsLoader").show();                
                var values = event_Date.split('/');            
                var month = values[0]; // globle variable            
                var day = values[1];            
                var year = values[2];
             
                if (day < 10) {
                    day = "0" + day;
                }
            
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
                   
                    var path = newsDataToSend;

                    pb.value(0);
                     
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
              
                    //console.log(options.fileName);
              
                    options.mimeType = mimeTypeVal;
                    options.params = params;
                    options.headers = {
                        Connection: "close"
                    }
                    options.chunkedMode = true;
             
                    $("#tabstrip-upload-file").data("kendoMobileModalView").open();
                     
                    ft = new FileTransfer();                    
                    ft.onprogress = function(progressEvent) {
                        if (progressEvent.lengthComputable) {
                            var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                            pb.value(perc);                            
                        }else {
                            pb.value('');                            
                        }
                    };

                    //dataToSend = '//C:/Users/Gaurav/Desktop/R_work/keyy.jpg';
                    ft.upload(newsDataToSend, app.serverUrl() + "news/edit", winEdit, fail, options , true);
                }else {
                    //console.log(organisationID + "||" + event_description + "||" + event_Date + "||" + event_Time + "||" + newsPid);
                    var jsonDataSaveGroup = {"org_id":organisationID ,"txtNewsDesc":event_description,"txtNewsDate":event_Date,"txtNewsTime":event_Time,"pid":newsPid,"cmbGroup":groupEdit}
            
                    var dataSourceaddGroup = new kendo.data.DataSource({
                                                                           transport: {
                            read: {
                                                                                       url: app.serverUrl() + "news/edit",
                                                                                       type:"POST",
                                                                                       dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                                                       //async: false,                                                       
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
                                                                               //console.log(e);
                                                                               console.log(JSON.stringify(e));
                                                                           
                                                                               $("#sendEditNewsLoader").hide();
                                                                               if (!app.checkSimulator()) {
                                                                                   window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                               }else {
                                                                                   app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                               }               
                                                                           }               
          
                                                                       });  
	            
                    dataSourceaddGroup.fetch(function() {
                        var loginDataView = dataSourceaddGroup.data();
                        $.each(loginDataView, function(i, addGroupData) {
                            //console.log(addGroupData.status[0].Msg);           
                            if (addGroupData.status[0].Msg==='News updated successfully') {         
                                app.mobileApp.navigate("#adminOrgNewsList");
                                if (!app.checkSimulator()) {
                                    window.plugins.toast.showLongBottom('News Updated Successfully');  
                                }else {
                                    app.showAlert('News Updated Successfully", "Notification');  
                                }
                                $("#sendEditNewsLoader").hide();
                            }else {
                                $("#sendEditNewsLoader").hide();
                                app.showAlert(addGroupData.status[0].Msg , 'Notification'); 
                            }
                        });
                    });
                }   
            }
        }
        
        function winEdit(r) {
            pb.value(0);
            $("#tabstrip-upload-file").data("kendoMobileModalView").close();

            console.log("Response = " + r.response);
          
            $("#sendEditNewsLoader").hide();

            if (!app.checkSimulator()) {
                window.plugins.toast.showShortBottom('News updated successfully');   
            }else {
                app.showAlert("News updated successfully", "Notification"); 
            }
                        
            app.mobileApp.navigate("#adminOrgNewsList");
        }
        
        var goToManageOrgPage = function() {
            app.mobileApp.navigate('#view-all-activities-GroupDetail');
            //app.slide('rigth', 'green' ,'3' ,'#views/groupDetailView.html');
            //app.slide('right', 'green' ,'3' ,'#view-all-activities-GroupDetail');
        }
        
        var goToAddNewsPage = function() {
            app.mobileApp.navigate('#adminAddNews');

            app.analyticsService.viewModel.trackFeature("User navigate to Add News in Admin");            
            //app.slide('rigth', 'green' ,'3' ,'#adminAddNews');
        }
        
        var goToNewsListPage = function() {
            app.mobileApp.navigate('#adminOrgNewsList');

            app.analyticsService.viewModel.trackFeature("User navigate to News List in Admin");            
            //app.slide('rigth', 'green' ,'3' ,'#adminOrgNewsList');
        }
        
        var orgAllNewsList = function() {
            app.mobileApp.navigate('#adminOrgNewsList');
             
            $("#adddatePickerNews").removeAttr('disabled');
            $("#adddateTimePickerNews").removeAttr('disabled');

            app.analyticsService.viewModel.trackFeature("User navigate to News List in Admin");            
            //app.slide('left', 'green' ,'3' ,'#adminOrgNewsList');
        }
        
        var addNewEvent = function() {
            app.mobileApp.navigate('#adminAddEventCalendar');

            app.analyticsService.viewModel.trackFeature("User navigate to Add Event in Admin");            
            //app.slide('left', 'green' ,'3' ,'#adminAddEventCalendar');
        }
        
        var upcommingEventList = function() {
            app.mobileApp.navigate('#adminEventList');
            //app.slide('left', 'green' ,'3' ,'#adminEventList');    
        }
        
        var eventListShow = function() {
            //var dateShow = multipleEventArray[0].event_date;
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
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            saveToPhotoAlbum:true,
                                            correctOrientation: true
                                        });
        };
        
        var getPhotoVal = function() {
            navigator.camera.getPicture(onPhotoURISuccessData, onFail, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            correctOrientation: true
                                        });
        };
        
        //PHOTOLIBRARY
        
        var getVideoVal = function() {            
            //navigator.device.capture.captureVideo(captureSuccess, captureError, {limit: 1});                      
            navigator.camera.getPicture(onVideoURISuccessData, onFail, { 
                                            quality: 50,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.SAVEDPHOTOALBUM,
                                            mediaType: navigator.camera.MediaType.VIDEO
                                        });
        }
        
        // Called when capture operation is finished
        //

        function captureSuccess(mediaFiles) {
            console.log(mediaFiles);
            console.log(mediaFiles[fullPath]);
            console.log("path : " + mediaFiles.fullPath + ", name : " + mediaFiles.name + ", type : " + mediaFiles.type + ", size : " + mediaFiles.size);
            //var i, path,len;
            //for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            //    path = mediaFiles[i].fullPath;
            //}       
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
        }

        // Called if something bad happens.
        function captureError(error) {
            var msg = 'An error occurred during capture: ' + error.code;
            navigator.notification.alert(msg, null, 'Uh oh!');
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

            console.log(imageURI);
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

            //alert(imageURI);
            console.log(videoURI);
            //newsDataToSend = imageURI;
        }
         
        function onFail(message) {
            console.log('Failed because: ' + message);
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
                                            targetWidth: 300,
                                            targetHeight: 300,
                                            destinationType: navigator.camera.DestinationType.FILE_URI,
                                            sourceType: navigator.camera.PictureSourceType.CAMERA,
                                            correctOrientation: true,
                                            saveToPhotoAlbum:true
                                        });
        };
        
        var getPhotoValEdit = function() {
            navigator.camera.getPicture(onPhotoURISuccessDataEdit, onFailEdit, { 
                                            quality: 50,
                                            targetWidth: 300,
                                            targetHeight: 300,
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
            console.log(imageURI);
        }
        
        function onVideoURISuccessDataEdit(videoURI) {
            var imageAttached = document.getElementById('attachedImgEditNews');
            imageAttached.src = '';
            $("#attachedImgEditNews").hide();
            
            //console.log(imageURI);            
            // Uncomment to view the image file URI
            // console.log(imageURI);
            // Get image handle
            var largeImage = document.getElementById('attachedVidNewsEdit');
            largeImage.style.display = 'block';
            largeImage.src = 'styles/images/videoPlayIcon.png';
            newsDataToSend = videoURI;
            
            upload_type_Edit = "video";
            
            $("#attachedVidNewsEdit").show();           
        }
        
        function onFailEdit(message) {
            console.log('Failed because: ' + message);
            //$("#removeEditNewsAttachment").hide(); 
            //$("#attachedImgEditNews").hide();
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
        
        return {
            init: init,
            show: show,
            editNews:editNews,
            eventListShow:eventListShow,
            getTakePhoto:getTakePhoto,
            getVideoValEdit:getVideoValEdit,
            getPhotoValEdit:getPhotoValEdit,
            getTakePhotoEdit:getTakePhotoEdit,
            getPhotoVal:getPhotoVal,
            getVideoVal:getVideoVal,
            removeImage:removeImage,
            removeImageEdit:removeImageEdit,
            addNewEvent:addNewEvent,
            deleteNews:deleteNews,
            editNewsshow:editNewsshow,
            goToAddNewsPage:goToAddNewsPage,
            goToNewsListPage:goToNewsListPage,
            goToManageOrgPage:goToManageOrgPage,
            eventMoreDetailClick:eventMoreDetailClick,
            addNewNewsFunction:addNewNewsFunction,
            addEventshow:addEventshow,
            orgAllNewsList:orgAllNewsList,
            transferFileAbort:transferFileAbort,
            saveEditNewsData:saveEditNewsData,
            upcommingEventList:upcommingEventList,
            showInListView:showInListView
        };
    }());
        
    return adminNewsEventModel;
}());