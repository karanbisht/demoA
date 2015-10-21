var app = app || {};
app.timeTable = (function () {
    'use strict';
    var timeTableModel = (function () {
        var timeTableOrgId;
        var account_Id;
        var groupAlltimeTable = [];
        var page = 0;
        var totalListView = 0;
        var dataReceived = 0;
        var device_type; 
        var pbUsertimeTable;
        var circleLoader;
        var countVal = 0;
        var fileTransfer;
        var sdcardPath;


        var init = function() {
        };
    
        var show = function(e) {
            $(".km-scroll-container").css("-webkit-transform", ""); 
            device_type = localStorage.getItem("DEVICE_TYPE"); 
            $("#showMoretimeTableBtn").hide();
            $("#CalProcesstimeTable").show();                                     
            account_Id = localStorage.getItem("ACCOUNT_ID");
            timeTableOrgId = localStorage.getItem("selectedOrgId"); 
            sdcardPath = localStorage.getItem("sdCardPath");
            
            page = 0;
            dataReceived = 0;
            totalListView = 0;
            groupAlltimeTable = [];
            countVal = 0;
            
            document.getElementById("imgDownloaderTT").innerHTML = "";
            
            circleLoader = new ProgressBar.Circle('#imgDownloaderTT', {
                   color: '#7FBF4D',
                   strokeWidth: 8,
                   fill: '#f3f3f3'
            });

            /*pbUsertimeTable = $("#profileCompletenesstimeTable").kendoProgressBar({
                                                                                    type: "percent",
                                                                                    chunkCount: 100,
                                                                                    min: 0,
                                                                                    max: 100,
                                                                                    value: 0
                                                                                }).data("kendoProgressBar");    
            */
     
          if (!app.checkConnection()) {
              if (!app.checkSimulator()) {                                                                     
                  window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
              }else {              
                  app.showAlert(app.INTERNET_ERROR , 'Offline');                   
              }              
            getLocalData();  
          }else{
            getLiveData();  
          }    
        }
        
        var getLiveData = function() {            
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                                                                   read: {
                                                                            url: app.serverUrl() + "timetable/getTimeTable/"+timeTableOrgId+"/"+account_Id,
                                                                            type:"POST",
                                                                            dataType: "json"
                                                                       }
                                                                         },
                                                                schema: {
                    data: function(data) {	
                        console.log(data);
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
                                                                        app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response' + JSON.stringify(e));
                                                                    }   
                                                                    getLocalData();
                                                                }                              
                                                            });  
	            
            dataSourceLogin.fetch(function() {
              var data = this.data();
                console.log(data[0]['status'][0].Msg);
              if (data[0]['status'][0].Msg==='Success') {
                     if(data[0]['status'][0].Timetable === false) {
                            groupAlltimeTable.push({
                                                  id:0,
                                                  timetable_group: 'No Timetable from this Organization.'
                                                });
                            timeTableListFirstShow();
                     }else{
                        
                        var TimeTableListLength = data[0].status[0].Timetable.length;
                        for (var i = 0 ; i < TimeTableListLength ;i++) {  
                            groupAlltimeTable.push({
                                                   id: data[0].status[0].Timetable[i].id,
                                                   added_by: data[0].status[0].Timetable[i].added_by,
                                                   timetable_url : data[0].status[0].Timetable[i].timetable,
                                                   timetable_group: data[0].status[0].Timetable[i].group_name,                                                                                  										  
                                                   timetable_groupID: data[0].status[0].Timetable[i].group_id,
                                                   org_id: data[0].status[0].Timetable[i].org_id
                                               });        
                        } 
                          timeTableListFirstShow();
                          callOfflineSaving();  
                     }                     
              }else if(data[0]['status'][0].Msg==='Unauthorise Access'){
                groupAlltimeTable.push({
                    id:0,
                    timetable_group: 'No Timetable from this Organization.'
                });                  
                timeTableListFirstShow();
              }         
            });
        }
        
        var timeTableListFirstShow = function() { 
            var organisationListDataSourceFirst = new kendo.data.DataSource({
                                                                                data: groupAlltimeTable
                                                                            });           
                
            $("#timeTableFirstAllList").kendoMobileListView({
                                                               template: kendo.template($("#timeTableListTemplate").html()),  		
                                                               dataSource: organisationListDataSourceFirst
                                                           });
             
            $('#timeTableFirstAllList').data('kendoMobileListView').refresh();           
            $("#CalProcesstimeTable").hide();            
        };
                
        var gobackOrgPage = function() {
            app.mobileApp.navigate('#userOrgManage');            
        };
        
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
        };
        
        
       
        var pdfToDownload;
        var Filename;
        var fp;
        var timetableId;
        var downloadName;

        var timeTableSelected = function(e) {
            //console.log(e);                                         
            countVal = 0;
            pdfToDownload = e.data.timetable_url;
            timetableId = e.data.id;
            downloadName = 'timetable_'+timetableId;
            Filename = pdfToDownload.replace(/^.*[\\\/]/, ''); 
            var ext = app.getFileExtension(Filename);
            
            if (ext==='') {                
                Filename = Filename + '.jpg'; 
                downloadName = downloadName+ '.jpg';
            }else if (ext==='pdf'){
                downloadName = downloadName+ '.pdf';
            }else{
                downloadName = downloadName+ '.jpg';
            }
          
            fp = sdcardPath + app.SD_NAME+"/" + 'timeTable/' + Filename;           
            window.resolveLocalFileSystemURL(fp, pdfExist, pdfNotExist);  
                         
        };        
        
        var pdfExist = function() {     
            console.log('exist');
            if (device_type==="AN") {                                      
                window.plugins.fileOpener.open(fp);
            }else {
                window.open(fp, "_blank", 'location=no,enableViewportScale=yes,closebuttoncaption=Close');                                   
            }
        };
        
        var pdfNotExist = function(){  
            console.log('Not exist');
            if (!app.checkConnection()) {
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                                                                           
            }else {
                fileTransfer = new FileTransfer();   
                $("#timeTable-upload-file").data("kendoMobileModalView").open();
                fileTransfer.onprogress = function(progresstimeTable) {
                    if (progresstimeTable.lengthComputable) {
                        var perc = Math.floor(progresstimeTable.loaded / progresstimeTable.total * 100);
                        countVal = perc;
                        var j = countVal/100;                        
                        circleLoader.animate(j, function() {
                                circleLoader.animate(j);
                        });
                    }else {
                        circleLoader.animate(0);
                        countVal = 0;
                    }
                };
  
                fileTransfer.download(pdfToDownload, fp,
                                      function(entry) {        
                                          countVal = 0;                                          
                                          $("#timeTable-upload-file").data("kendoMobileModalView").close();
                                          circleLoader.animate(0);
                                          //if (device_type==="AN") {                                      
                                              //window.open(fp, "_system", 'location=yes');
                                              //window.plugins.fileOpener.open(fp);
                                          //}else {
                                              //window.open(fp, "_blank", 'location=no,enableViewportScale=yes,closebuttoncaption=Close');                                   
                                          //}
                                          window.plugins.toast.showShortBottom(app.DOWNLOAD_COMPLETED);
                                      }, 
                                      function(error) {
                                          countVal = 0;
                                          circleLoader.animate(0);
                                          window.plugins.toast.showShortBottom(app.DOWNLOAD_NOT_COMPLETE);
                                          $("#timeTable-upload-file").data("kendoMobileModalView").close();                                   
                                      }
                    );                          
            }      
        };
        
        var timeTableFileAbort = function() {  
            circleLoader.animate(0);
            if (countVal < 90) {                
                countVal=0;            
                fileTransfer.abort(); 
                $("#timeTable-upload-file").data("kendoMobileModalView").close();
            }else {           
                if (!app.checkSimulator()) {
                    window.plugins.toast.showShortBottom(app.CANNOT_CANCEL);  
                }else {
                    app.showAlert(app.CANNOT_CANCEL , 'Notification');  
                } 
            }    
        };
        
        function callOfflineSaving(){
            var db = app.getDb();
            db.transaction(saveDataOffline, app.errorCB, app.successCB);                                
        }
        
        function saveDataOffline(tx){
              var length = groupAlltimeTable.length;
            
              var queryDelete = "DELETE FROM TIME_TABLE";
              app.deleteQuery(tx, queryDelete);
   
              if(length!==null || lenght!=='null' || lenght!==0 || lenght!=='0'){                                    
                  for(var i=0;i<length;i++){
                        /*console.log(groupAlltimeTable[i].org_id+'||'+groupAlltimeTable[i].id+'||'+groupAlltimeTable[i].timeTable_name
                        +'||'+groupAlltimeTable[i].timeTable_image+'||'+groupAlltimeTable[i].add_date);*/                        
                        var query = 'INSERT INTO TIME_TABLE(org_id,id,group_name,timetable,group_id,added_by) VALUES ("'
                                    + groupAlltimeTable[i].org_id
                                    + '","'
                                    + groupAlltimeTable[i].id
                                    + '","'
                                    + groupAlltimeTable[i].timetable_group
                                    + '","'
                                    + groupAlltimeTable[i].timetable_url
                                    + '","'
                                    + groupAlltimeTable[i].timetable_groupID
                                    + '","'
                                    + groupAlltimeTable[i].added_by                                   
                                    + '")';              
                        
                        app.insertQuery(tx, query);
                  }  
              }    
        }
        
        function getLocalData(){
            var db = app.getDb();
            db.transaction(getDatafromDB, app.errorCB, timeTableListFirstShow);         
        }
        
        function getDatafromDB(tx){
            var query = "SELECT * FROM TIME_TABLE";
            app.selectQuery(tx, query, dataFromtimeTable);
        }
        
        function dataFromtimeTable(tx, results){
             var count = results.rows.length;
               if (count !== 0) {
                     for(var i=0;i<count;i++){
                            groupAlltimeTable.push({
                                                   id: results.rows.item(i).id,
                                                   added_by: results.rows.item(i).added_by,
                                                   timetable_url : results.rows.item(i).timetable,
                                                   timetable_group: results.rows.item(i).group_name,                                                                                  										  
                                                   timetable_groupID: results.rows.item(i).group_id,
                                                   org_id:results.rows.item(i).org_id                                
                                                  });
                     }   
               }else{
                   
                         groupAlltimeTable.push({
                                          id:0,
                                          timetable_url:''
                                      });
               }  
        }
        
        
        return {
            init: init,
            show: show,
            timeTableSelected:timeTableSelected,
            timeTableListFirstShow:timeTableListFirstShow,
            gobackOrgPage:gobackOrgPage,
            timeTableFileAbort:timeTableFileAbort,
            showMoreButtonPress:showMoreButtonPress,
            getLiveData:getLiveData
        };
    }());
        
    return timeTableModel;
}());