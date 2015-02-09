var app = app || {};

app.Activities = (function () { 
    'use strict';
    
    var organisationID;  
    var account_Id;  
    var bagCount;
    var groupDataShow = [];
    var lastNotificationPID;
    var orgName;
    var totalOrgNotification = 0;    
    var StartDbCount = 0;
    var EndDbCount = 10;
    var checkVal=0;
    var noDatainDB=0;
    var device_type = localStorage.getItem("DEVICE_TYPE"); 

    
    var activitiesViewModel = (function () {
    
        var init = function() {
                    
        }   
        
        var show = function(e) {            
                    
            StartDbCount = 0;
            checkVal=0;
            EndDbCount = 10;
            totalOrgNotification = 0;
            groupDataShow = [];
            $("#showMoreButton").hide();

            app.mobileApp.pane.loader.hide();

            $(".km-scroll-container").css("-webkit-transform", "");  
        
            
            organisationID = localStorage.getItem("user_SelectOrgID");
            account_Id = localStorage.getItem("user_ACCOUNT_ID");
            bagCount = localStorage.getItem("user_orgBagCount");
            orgName = localStorage.getItem("user_selectedOrgName");
                         

            var OrgDisplayName;
            if (orgName.length > 25) {
                    OrgDisplayName = orgName.substr(0, 25) + '..';
            }else {
                    OrgDisplayName = orgName;
                
            }
            $("#navBarHeader").html(OrgDisplayName);                  
        
            getDataFromDB();
        };
        
        var getDataFromDB = function(){
            groupDataShow = [];
            var db = app.getDb();
            db.transaction(getDataOrgNoti, app.errorCB, showLiveDataDB);         
        }
                    
        var getLastOrgNoti = function(tx) {
            var query = "SELECT MAX(pid) as pid FROM ORG_NOTIFICATION where org_id=" + organisationID;
            app.selectQuery(tx, query, getOrgLastNotiDataSuccess);
        };    
                    
        function getOrgLastNotiDataSuccess(tx, results) {
            var count = results.rows.length;
            var lastNotificationPID = results.rows.item(0).pid;
            if (lastNotificationPID===null) {
                lastNotificationPID = 0;
            }
                        
            var organisationALLNewListDataSource = new kendo.data.DataSource({
                                                                                     transport: {
                        read: {
                                                                                                 url: app.serverUrl() + "notification/getCustomerNotification/" + organisationID + "/" + account_Id + "/" + lastNotificationPID,
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
                                                                                         
                                                                                         if (!app.checkSimulator()) {
                                                                                             window.plugins.toast.showLongBottom(app.INTERNET_ERROR);
                                                                                         }else {
                                                                                             app.showAlert(app.INTERNET_ERROR , 'Offline');
                                                                                         }
                                                                                         
                                                                                        app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                    
                                                                                         /*var db = app.getDb();
                                                                                         db.transaction(getDataOrgNoti, app.errorCB, app.successCB);*/         
                                                                                     }	        
                                                                                 });        
                                
 
            organisationALLNewListDataSource.fetch(function() {
                        var data = this.data();
            
                                    if (data[0]['status'][0].Msg ==='No notification') { 
                                        //alert('no noti 1');                                        
                                        /*var db = app.getDb();
                                        db.transaction(getDataOrgNoti, app.errorCB, app.successCB);*/                                        
                                    }else if (data[0]['status'][0].Msg==='Success') {
                                        StartDbCount=0;
                                        var orgNotificationData = data[0]['status'][0].notificationList;
                                        if(noDatainDB===1){
                                               groupDataShow=[]; 
                                        }                                        
                                        saveOrgNotification(orgNotificationData);                                                                                     
                                    }

            });

        }                      
        
        var orgNotiDataVal;
        
        function saveOrgNotification(data) {
            orgNotiDataVal = data;      
            var db = app.getDb();
            db.transaction(insertOrgNotiData, app.errorCB, getDataFromDB);
        };
            
        function insertOrgNotiData(tx) {
            //var query = "DELETE FROM ORG_NOTIFICATION";
            //app.deleteQuery(tx, query);
            var dataLength = orgNotiDataVal.length;

            var orgData;        
            var orgLastMsg;
 
            for (var i = 0;i < dataLength;i++) {    
                orgData = orgNotiDataVal[i].org_id;
                orgLastMsg = orgNotiDataVal[i].message;
          

                var notiTitleEncode = app.urlEncode(orgNotiDataVal[i].title);
                var notiMessageEncode = app.urlEncode(orgNotiDataVal[i].message);

                var query = 'INSERT INTO ORG_NOTIFICATION(org_id ,pid ,attached ,message ,title,comment_allow,send_date,type,upload_type) VALUES ("'
                            + orgNotiDataVal[i].org_id
                            + '","'
                            + orgNotiDataVal[i].pid
                            + '","'
                            + orgNotiDataVal[i].attached
                            + '","'
                            + notiMessageEncode
                            + '","'
                            + notiTitleEncode
                            + '","'
                            + orgNotiDataVal[i].comment_allow
                            + '","'
                            + orgNotiDataVal[i].send_date
                            + '","'
                            + orgNotiDataVal[i].type
                            + '","'
                            + orgNotiDataVal[i].upload_type
                            + '")';              
                app.insertQuery(tx, query);
            }   
            updateJoinOrgTable(orgData, orgLastMsg, dataLength);
        }
                         
        var GlobalDataOrgId;
        var GlobalDataLastMsg;
        var GlobalDataCount;
        
        var updateJoinOrgTable = function(orgData, orgLastMsg, dataLength) {
            GlobalDataOrgId = orgData;
            GlobalDataLastMsg = orgLastMsg;
            GlobalDataCount = dataLength;
            var db = app.getDb();
            db.transaction(updateLoginStatus, app.errorCB, app.successDB);
        }
        
        function updateLoginStatus(tx) {
            GlobalDataLastMsg = app.urlEncode(GlobalDataLastMsg);
            var query = "UPDATE JOINED_ORG SET count='" + GlobalDataCount + "',bagCount='" + GlobalDataCount + "', lastNoti='" + GlobalDataLastMsg + "' where org_id='" + GlobalDataOrgId + "' and role='C'";
            app.updateQuery(tx, query);
        }
        
        function showDBNotification() {
            var db = app.getDb();
            db.transaction(getDataOrgNoti, app.errorCB, showLiveData);         
        }
            
        var getDataOrgNoti = function(tx) {
                        
            var query = "SELECT * FROM ORG_NOTIFICATION where org_id='" + organisationID + "' ORDER BY pid DESC limit'" + StartDbCount + "','" + EndDbCount + "'" ;
            app.selectQuery(tx, query, getOrgNotiDataSuccess);
            
            var query = "SELECT count(pid) as TOTAL_DATA from ORG_NOTIFICATION where org_id=" + organisationID;
            app.selectQuery(tx, query, getOrgTotalNotiData);
        };    
        
        function getOrgTotalNotiData(tx, results){
            
            totalOrgNotification = results.rows.item(0).TOTAL_DATA;               
            
            if (totalOrgNotification > StartDbCount) {
                $("#showMoreButton").show();

            }else {
                                
                $("#showMoreButton").hide();
            }
        }
        
        

        var showLiveDataDB = function() {
            var organisationALLListDataSource = new kendo.data.DataSource({
                                                                              data: groupDataShow
                                                                         });
             
            $("#activities-listview").kendoMobileListView({
                                      template: kendo.template($("#activityTemplate").html()),    		
                                      dataSource: organisationALLListDataSource
            });
            
            $('#activities-listview').data('kendoMobileListView').refresh();          
            $("#progressNotification").hide();
            
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                }else {
                    app.showAlert(app.INTERNET_ERROR , 'Offline');  
                } 
            }else{                
                var db = app.getDb();
                db.transaction(getLastOrgNoti, app.errorCB, app.successCB);                                  
            }
        };
               
        function getOrgNotiDataSuccess(tx, results) {
            var count = results.rows.length;             
            if(checkVal===0){
                StartDbCount = count+1;
            }else{
                StartDbCount=StartDbCount+count;
            }    
            checkVal++;
            var previousDate = '';
            
            if (count !== 0) {
                //groupDataShow=[];
                for (var i = 0 ; i < count ; i++) {                    
                    var dateString = results.rows.item(i).send_date;                    
                    var notiTitleDecode = app.urldecode(results.rows.item(i).title);
                    var notiMessageDecode = app.urldecode(results.rows.item(i).message);

                    var notiDate = app.timeConverter(dateString);
                    

                    var attachedData=results.rows.item(i).attached;
                    var uplaodData=results.rows.item(i).upload_type;
                    var downlaod=0;

                    /*if (attachedData!== null && attachedData!=='' && attachedData!=="0" && uplaodData==="other"){        

                        var vidPathData = app.getfbValue();    
                        var Filename = attachedData.replace(/^.*[\\\/]/, '');
                        var fp = vidPathData + "Aptifi/" + 'Aptifi_img_' + Filename;             

                        alert('data');
                        window.resolveLocalFileSystemURL(fp, 
                        function(entry)
                        {

                            alert('got');

                          downlaod=1;   
                        },function(error)
                        {
                                                        alert('not');

                          downlaod=0;  
                        });                                    
                    }else if(attachedData!== null && attachedData!=='' && attachedData!=="0" && uplaodData==="video"){ 
                         var vidPathData = app.getfbValue();    
                         var Filename = attachedData.replace(/^.*[\\\/]/, '');
                         var fp = vidPathData + "Aptifi/" + 'Aptifi_Video_' + Filename;             
                         window.resolveLocalFileSystemURL(fp, 
                         function(entry){
                           downlaod=1;   
                         },function(error){
                           downlaod=0;  
                         });
                    }*/
                    
                    groupDataShow.push({
                                           message: notiMessageDecode,
                                           org_id: results.rows.item(i).org_id,
                                           date:notiDate,
                                           title:notiTitleDecode,
                                           pid :results.rows.item(i).pid ,
                                           comment_allow:results.rows.item(i).comment_allow ,
                                           bagCount : 'C',
                                           comment_count :results.rows.item(i).adminReply , 
                                           upload_type:results.rows.item(i).upload_type,
                                           attached :results.rows.item(i).attached,
                                           previousDate:previousDate,
                                           //inLocal:downlaod,
                                           attachedImg :results.rows.item(i).attached
                                       });                    
                    
                    previousDate = notiDate;                    
                    lastNotificationPID = results.rows.item(i).pid;
                }    
            }else {
                
                lastNotificationPID = 0;
                $("#showMoreButton").hide();                    

                if(checkVal===0){
                    noDatainDB=1;                                                                  
                }else{
                    noDatainDB=0;
                }
                
                groupDataShow.push({
                                       title: ' No Message ',
                                       message: 'No messages from this organization',
                                       date:'0',  
                                       comment_allow : 'Y',
                                       org_id:'0', 
                                       pid:'',
                                       bagCount : '',
                                       attachedImg :'',  
                                       attached:''  
                                   });                   
            }                       
        };       
        
        var showMoreButtonPress = function() {
            //StartDbCount = StartDbCount + 10;
            EndDbCount = 10;                       
            showDBNotification();
        }

        var afterShow = function() {
            var db = app.getDb();
            db.transaction(insertBagCount, app.errorCB, app.successCB);  
        };    
            
        var insertBagCount = function(tx) {             
            var query = "UPDATE JOINED_ORG SET bagCount='" + bagCount + "' WHERE org_id='" + organisationID + "'" ;
            app.updateQuery(tx, query);
        };   
            
        var showLiveData = function() {
            var organisationALLListDataSource = new kendo.data.DataSource({
                                                                              data: groupDataShow                                                                          });
             
                        $("#activities-listview").kendoMobileListView({
                                                              template: kendo.template($("#activityTemplate").html()),    		
                                                              dataSource: organisationALLListDataSource
                                                          });
            
            $('#activities-listview').data('kendoMobileListView').refresh();          
             
        };
              
            
        var activitySelected = function (e) {
            var message = e.data.message;
            var title = e.data.title;
            var org_id = e.data.org_id;
            var notiId = e.data.pid;
            var comment_allow = e.data.comment_allow; //"1"
            var attached = e.data.attached;
            var type = e.data.type;
            //var upload_type = e.data.upload_type;                            
            var messageVal = app.urlEncode(message); 
            var titleVal = app.urlEncode(title);
            app.mobileApp.navigate('views/activityView.html?message=' + messageVal + '&title=' + titleVal + '&org_id=' + org_id + '&notiId=' + notiId + '&account_Id=' + account_Id + '&comment_allow=' + comment_allow + '&attached=' + attached + '&type=' + type + '&date=' + e.data.date + '&upload_type=' + e.data.upload_type);
            
            app.analyticsService.viewModel.trackFeature("User navigate to Customer Notification Comment List");            

        };
      
               
        var goToAppFirstView =  function(){
             app.mobileApp.navigate('#organisationNotiList');
        }
        
        var attachedFilename;
        var videoFile;
        var notiFi;
        
        var videoDownlaodClick = function(e){            
            var data = e.button.data();
            //console.log(data);            
            videoFile = data.someattribute;  
            //console.log(videoFile);            
            notiFi = data.notiid;
            //alert(notiFi);
            attachedFilename = videoFile.replace(/^.*[\\\/]/, '');
            var vidPathData = app.getfbValue();                    
            var fp = vidPathData + "Aptifi/" + 'Aptifi_Video_' + attachedFilename;             
            window.resolveLocalFileSystemURL(fp, videoPathExist, videoPathNotExist);                        
        }
        
        var videoPathExist = function() {          
            
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Aptifi/" + 'Aptifi_Video_' + attachedFilename;

            /*var vid = $('<video  width="300" height="300" controls><source></source></video>'); //Equivalent: $(document.createElement('img'))
            vid.attr('src', fp);
            vid.appendTo('#video_Div_'+notiFi);*/
            

            if(device_type==="AP"){
                  window.open(fp, "_blank");
            }else{
                  window.plugins.fileOpener.open(fp);
            }
            
        }
        
        var videoPathNotExist = function() {
            $("#video_Div_"+notiFi).show();
            $("videoToDownload_"+notiFi).text('Downloading..');
            var attachedVid = videoFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Aptifi/" + 'Aptifi_Video_' + attachedFilename;
            
            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedVid, fp, 
                                  function(entry) {
                                      

                                      if(device_type==="AP"){
                                          window.open(fp, "_blank");
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }

                                      $("#video_Div_"+notiFi).hide();
                                      $("videoToDownload_"+notiFi).text('View');

                                  },
    
                                  function(error) {
                                      $("#video_Div_"+notiFi).hide();
                                      $("videoToDownload_"+notiFi).text('View');
                                      //$("#progressChat").hide();
                                  }
                );                
        }
        

        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;

        var imageDownlaodClick = function(e){
            //alert('imgclick');
            var data = e.button.data();
            console.log(data);            
            imgFile = data.imgpath;  
            console.log(imgFile);            
            imgNotiFi = data.notiid;
            attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
            attachedImgFilename=attachedImgFilename+'.jpg';
            var vidPathData = app.getfbValue();                    
            var fp = vidPathData + "Aptifi/" + 'Aptifi_img_' + attachedImgFilename;             
            console.log(vidPathData);
            console.log(fp);
            window.resolveLocalFileSystemURL(fp, imgPathExist, imgPathNotExist);                                    
            //$("#img_Div_"+imgNotiFi).show();
            
            //alert("#img_Div_"+imgNotiFi);
            
            //alert('click');
            //console.log(JSON.stringify(window.plugins));
            //window.plugins.fileOpener.open("file:///storage/emulated/0/Aptifi/Aptifi_74.jpg");
        }
        
                
        var imgPathExist = function() {                    
            //alert('img_exixt');
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Aptifi/" + 'Aptifi_img_' + attachedImgFilename;   
            //fp=fp+'.jpg';
            console.log(fp);
            
                                      if(device_type==="AP"){
                                          //alert('Show');
                                          //window.open("www.google.com", "_system");
                                          window.open(fp, '_blank');

                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }

        }
        
        var imgPathNotExist = function() {
            //alert('img_not_exixt');

            $("#img_Div_"+imgNotiFi).show();
            $("#imgToDownload_"+imgNotiFi).text('Downloading..');
            
            var attachedImg = imgFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Aptifi/" + 'Aptifi_img_' + attachedImgFilename;
                        console.log(fp);


            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      $("#imgToDownload_"+imgNotiFi).text('View');

                                      if(device_type==="AP"){
                                          //alert('1');
                                          window.open(fp, "_blank");
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }
                                      
                                      $("#img_Div_"+imgNotiFi).hide();
                                  },
    
                                  function(error) {
                                      $("#imgToDownload_"+imgNotiFi).text('View');
                                      $("#img_Div_"+imgNotiFi).hide();
                                  }
                );                
        }


        return {
            activitySelected: activitySelected,
            init:init,
            videoDownlaodClick:videoDownlaodClick,
            goToAppFirstView:goToAppFirstView,
            show:show,
            imageDownlaodClick:imageDownlaodClick,
            afterShow:afterShow,
            showMoreButtonPress:showMoreButtonPress,
        };
    }());

    return activitiesViewModel;
}());