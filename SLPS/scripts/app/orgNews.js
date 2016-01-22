var app = app || {};

app.orgNews = (function () {
    'use strict';    
    var orgNewsModel = (function () {
        var eventOrgId;
        var account_Id;
        var groupAllEvent = [];
        var device_type;
        var page = 0;
        var totalListView = 0;
        var dataReceived = 0;
        var orgin;
        var countValNews = 0;
        var sdcardPath;

        var init = function() {
        };
    
        var show = function(e) {      
            device_type = localStorage.getItem("DEVICE_TYPE");
            $("#showMoreNewsBtn").hide();
            app.showAppLoader();
            $(".km-scroll-container").css("-webkit-transform", "");             
            eventOrgId = localStorage.getItem("selectedOrgId");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            sdcardPath = localStorage.getItem("sdCardPath");
            //orgin = e.view.params.orgin;
            orgin=1;
            page = 0;
            dataReceived = 0;
            totalListView = 0;
            groupAllEvent = [];
      
            if (orgin===1 || orgin==='1') {
                $("#idBackHomeNews").show();
                $("#idBackOrgNews").hide();
            }else {
                $("#idBackHomeNews").hide();
                $("#idBackOrgNews").show();               
            }
            
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {                                                                     
                    window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
                }else {              
                    app.showAlert(app.INTERNET_ERROR , 'Offline');                   
                }              
                getLocalData();  
            }else {
                getLiveData();  
            }            
        };
        
        var getLiveData = function() {
            var jsonDataLogin = {"org_id":eventOrgId,"account_id":account_Id,"page":page};            
            var dataSourceLogin = new kendo.data.DataSource({
                                                                transport: {
                    read: {
                                                                            url: app.serverUrl() + "news/customerNews",
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
                    showInListView();
                }else if (data[0]['status'][0].Msg==='Success') {
                    totalListView = data[0]['status'][0].Total;
                    if (data[0]['status'][0].newsData!=='No News List') { 
                        if (data[0].status[0].newsData.length!==0) {                           
                            $
                                .each(
                                    data[0].status[0].newsData,
                                    function(i, newsData) {  
                                        var newsDateString = newsData.news_date;
                                        var newsTimeString = newsData.news_time;
                                        var newsDate = app.formatDate(newsDateString);
                                        var newsTime = app.formatTime(newsTimeString);
                                 
                                        var Filename;
                                        var fp;
                                        var downloadedImg;                                  
                                        var attachedData = newsData.news_image;  
                                        var uplaodData = newsData.upload_type;
                                        if (attachedData!== null && attachedData!=='' && attachedData!=="0" && uplaodData==="image") {     
                                            Filename = attachedData.replace(/^.*[\\\/]/, '');
                                            var ext = app.getFileExtension(Filename);
                                            if (ext==='') {
                                                Filename = Filename + '.jpg'; 
                                            }
                                            fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_img_' + Filename;                                                                 
                                            window.resolveLocalFileSystemURL(fp, 
                                                                             function(entry) {
                                                                                 //console.log('sdcard');
                                                                                 downloadedImg = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_img_' + Filename;                        
                                                                                 pushDataInArray(newsData, newsDate, newsTime, i, downloadedImg);  
                                                                             }, function(error) {
                                                                                 //console.log('not in sdcard');  
                                                                                 downloadedImg = newsData.news_image;
                                                                                 pushDataInArray(newsData, newsDate, newsTime, i, downloadedImg);  
                                                                             });
                                        }else {
                                            downloadedImg = '';
                                            pushDataInArray(newsData, newsDate, newsTime, i, downloadedImg);
                                        }                                      
                                    });
                        }
                    }else {
                        groupAllEvent.push({
                                               id: 0,
                                               add_date: 0,
                                               news_date: 0,
                                               news_desc: 'No News from this Organization',                                                                                 										  
                                               news_name: 'No News',                                                                                  										  
                                               news_time: '',
                                               news_image:'',
                                               mod_date: '',                                     
                                               org_id: '',
                                               index:'0'
                                           });
                        showInListView();
                    }  
                }
                //showInListView();
            });
        }
    
        function pushDataInArray(newsData, newsDate, newsTime, i, downloadedImg) {             
            var indexVal; 
            if (page!==0) {
                indexVal = parseInt(page + '0') + i + 1;
            }else {
                indexVal = i + 1;
            }            
            groupAllEvent.push({
                                   id: newsData.id,
                                   add_date: newsData.add_date,
                                   news_date: newsDate,
                                   upload_type:newsData.upload_type,
                                   news_desc: newsData.news_desc,                                                                                 										  
                                   news_name: newsData.org_name, 
                                   news_image : newsData.news_image,
                                   news_image_show : downloadedImg,
                                   news_time: newsTime,                                                                                  										  
                                   mod_date: newsData.mod_date,                                     
                                   org_id: newsData.org_id,
                                   index:indexVal
                               });

            if (totalListView===indexVal) {
                showInListView(); 
                setTimeout(function() {
                    callNewsSaving();
                }, 100);    
            }else if (indexVal % 10 ===0) {                     
                showInListView();
                setTimeout(function() {     
                    callNewsSaving();
                }, 100);     
            }                       
        }
        
        function callNewsSaving() {        
            var db = app.getDb();
            db.transaction(saveEventOffline, app.errorCB, app.successCB);
        }
        
        function saveEventOffline(tx) {
            var length = groupAllEvent.length;      
            var queryDelete = "DELETE FROM ORG_NEWS";
            app.deleteQuery(tx, queryDelete);               
            if (length!==null && length!=='null' && length!==0 && length!=='0') {                                    
                for (var i = 0;i < length;i++) {
                    var query = 'INSERT INTO ORG_NEWS(id,org_id,news_name,news_desc,news_image,news_image_DB,upload_type,news_date,news_time) VALUES ("'
                                + groupAllEvent[i].id
                                + '","'
                                + groupAllEvent[i].org_id
                                + '","'
                                + groupAllEvent[i].news_name
                                + '","'
                                + groupAllEvent[i].news_desc
                                + '","'
                                + groupAllEvent[i].news_image
                                + '","'                      
                                + groupAllEvent[i].news_image_show
                                + '","'
                                + groupAllEvent[i].upload_type
                                + '","'
                                + groupAllEvent[i].news_date
                                + '","'
                                + groupAllEvent[i].news_time
                                + '")';                                      
                    app.insertQuery(tx, query);
                }                                                                        
            }    
        }
        
        var showInListView = function() {           
            var allEventLength = groupAllEvent.length;                        
            if (allEventLength===0) {
                groupAllEvent.push({
                                       id: 0,
                                       add_date: 0,
                                       news_date: 0,
                                       news_desc: 'No News from this Organization',                                                                                 										  
                                       news_name: 'No News',                                                                                  										  
                                       news_time: '',
                                       news_image:'',
                                       mod_date: '',                                     
                                       org_id: '',
                                       index:'0'
                                   });  
            }            
            setTimeout(function() {    
                app.hideAppLoader();
                groupAllEvent = groupAllEvent.sort(function(a, b) {
                    return parseInt(a.index) - parseInt(b.index);
                });
           
                var organisationListDataSource = new kendo.data.DataSource({
                                                                               data: groupAllEvent
                                                                           });           
                
                $("#orgNewsList").kendoMobileListView({
                                                          template: kendo.template($("#orgNewsTemplate").html()),    		
                                                          dataSource: organisationListDataSource
                                                      });
                
                $('#orgNewsList').data('kendoMobileListView').refresh();
            
                if ((totalListView > 10) && (totalListView >= dataReceived + 10)) {
                    $("#showMoreNewsBtn").show();
                }else {
                    $("#showMoreNewsBtn").hide();
                }
            
                countValNews = 0;
                newsImgClickFun();
                newsVidClickFun();                
            }, 300);  
        }
        
        function newsImgClickFun() {
            $('.newsImgClick').click(function(event) {
                var imgData = event.target.id.split('-----');
                      
                imgFile = imgData[0];
                imgNotiFi = imgData[1];
                 
                attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
                var ext = app.getFileExtension(attachedImgFilename);
                if (ext==='') {
                    attachedImgFilename = attachedImgFilename + '.jpg'; 
                }
                var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_img_' + attachedImgFilename;             
                window.resolveLocalFileSystemURL(fp, imgPathExist, imgPathNotExist);                                                
            }); 
        }
        
        function newsVidClickFun() {
            $('.newsVidClick').click(function(event) {
                var imgData = event.target.alt.split('-----');                      
                videoFile = imgData[0];
                notiFi = imgData[1];

                attachedFilename = videoFile.replace(/^.*[\\\/]/, '');
                var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_video_' + attachedFilename;             
                window.resolveLocalFileSystemURL(fp, videoPathExist, videoPathNotExist);
            });            
        }
        
        var gobackOrgPage = function() {
            app.mobileApp.navigate('#userOrgManage'); 
        }
                
        var attachedFilename;
        var videoFile;
        var notiFi;
        
        var videoDownlaodClick = function(e) {            
            var data = e.button.data();
            videoFile = data.someattribute;  
            notiFi = data.notiid;
            attachedFilename = videoFile.replace(/^.*[\\\/]/, '');
            var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_video_' + attachedFilename;             
            window.resolveLocalFileSystemURL(fp, videoPathExist, videoPathNotExist);                        
        }
        
        var videoPathExist = function() {                      
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + app.SD_NAME + "/" + 'Zaffio_news_video_' + attachedFilename;            
            if (device_type==="AP") {
                window.open(fp, "_blank");
            }else {
                window.plugins.fileOpener.open(fp);
            }            
        }
        
        var videoPathNotExist = function() {        
            if (countValNews!==0) {
                if (!app.checkSimulator()) {                                                                                               
                    window.plugins.toast.showShortBottom(app.VIDEO_ALY_DOWNLOAD);                                                                                           
                }else {                                                                                                
                    app.showAlert(app.VIDEO_ALY_DOWNLOAD , 'Errro');                                                                                             
                }                                
            }else {      
                var newNotiFi = notiFi;                
                $("#video_Div_Image_" + newNotiFi).show();
                var attachedVid = videoFile;                        
                var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_video_' + attachedFilename;                           
                var fileTransfer = new FileTransfer();                    
                fileTransfer.onprogress = function(progressEvent) {
                    if (progressEvent.lengthComputable) {
                        var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);                                                                             
                        countValNews = perc;
                        document.getElementById("downloadPerNews_" + newNotiFi).value = countValNews;
                        document.getElementById("progressValueNews_" + newNotiFi).innerHTML = countValNews;                                                                                     
                    }else {
                        document.getElementById("progressValueNews_" + newNotiFi).innerHTML = 0;
                        countValNews = 0;
                    }
                };
                        
                fileTransfer.download(attachedVid, fp, 
                                      function(entry) {                                                                            
                                          $("#video_Div_Image_" + newNotiFi).hide();
                                          $("#downloadPerNews_" + newNotiFi).hide();   
                                          countValNews = 0;
                                          document.getElementById("progressValueNews_" + newNotiFi).innerHTML = 0;
                                          window.plugins.toast.showShortBottom(app.DOWNLOAD_COMPLETED);
                                      },
    
                                      function(error) {
                                          countValNews = 0;
                                          $("#video_Div_Image_" + newNotiFi).hide();
                                          $("#downloadPerNews_" + newNotiFi).hide();
                                          document.getElementById("progressValueNews_" + newNotiFi).innerHTML = 0;  
                                          window.plugins.toast.showShortBottom(app.DOWNLOAD_NOT_COMPLETE);
                                      }
                    );                
            }   
        }

        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;
                        
        var imgPathExist = function() {                    
            var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_img_' + attachedImgFilename; 
            $("#img_Div_Image_" + imgNotiFi).hide();
            if (device_type==="AP") {
                window.open(fp, '_blank', 'location=no,enableViewportScale=yes,closebuttoncaption=Close');
            }else {
                window.plugins.fileOpener.open(fp);
            }
        }
        
        var newsImgIdArray = []; 
        var imgPathNotExist = function() {
            if (!app.checkConnection()) {
                window.plugins.toast.showShortBottom(app.INTERNET_ERROR);                  
            }else {
                var pos = $.inArray(imgNotiFi, newsImgIdArray);                                
                if (pos === -1) {
                    newsImgIdArray.push(imgNotiFi);
                    
                    $("#img_Div_Image_" + imgNotiFi).show();            
                    var attachedImg = imgFile;                           
                    var fp = sdcardPath + app.SD_NAME + "/" + 'Zaffio_news_img_' + attachedImgFilename;
                    var fileTransfer = new FileTransfer();   
               
                    var circle = new ProgressBar.Circle("#img_Div_Image_" + imgNotiFi, {
                                                            color: '#e7613e',
                                                            trailColor: '#eee',
                                                            strokeWidth: 10,
                                                            duration: 2500,
                                                            easing: 'easeInOut'
                                                        });

                    circle.set(0.05);
                    setTimeout(function() {
                        circle.animate(0.3);
                    }, 1000);
                    setTimeout(function() {
                        circle.animate(0.4);
                    }, 3500);
                    setTimeout(function() {
                        circle.animate(0.6);
                    }, 5500);
                    setTimeout(function() {
                        circle.animate(0.8);
                    }, 8000);
                    setTimeout(function() {
                        circle.animate(.9);
                    }, 10000);                
                    $("#img_Div_Image_" + imgNotiFi).show();            
                  
                    fileTransfer.download(attachedImg, fp, 
                                          function(entry) {
                                              $("#img_Div_Image_" + imgNotiFi).hide();
                                              window.plugins.toast.showShortBottom(app.DOWNLOAD_COMPLETED);
                                              var index = newsImgIdArray.indexOf(imgNotiFi);
                                              if (index > -1) {
                                                  newsImgIdArray.splice(index, 1);
                                              }
                                          },
    
                                          function(error) {
                                              $("#img_Div_Image_" + imgNotiFi).hide();
                                              window.plugins.toast.showShortBottom(app.DOWNLOAD_NOT_COMPLETE);
                                              var index = newsImgIdArray.indexOf(imgNotiFi);
                                              if (index > -1) {
                                                  newsImgIdArray.splice(index, 1);
                                              }
                                          }
                        );                
                }
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
        
        function getLocalData() {
            var db = app.getDb();
            db.transaction(getDatafromDB, app.errorCB, showInListView);         
        }
        
        function getDatafromDB(tx) {
            var query = "SELECT * FROM ORG_NEWS";
            app.selectQuery(tx, query, dataFromEventDB);
        }
        
        function dataFromEventDB(tx, results) {
            var count = results.rows.length;
            //console.log(count);
            if (count !== 0) {
                for (var i = 0;i < count;i++) {
                    groupAllEvent.push({
                                           id: results.rows.item(i).id,
                                           news_date: results.rows.item(i).news_date,
                                           upload_type:results.rows.item(i).upload_type,
                                           news_desc: results.rows.item(i).news_desc,                                                                                 										  
                                           news_name: results.rows.item(i).org_name, 
                                           news_image : results.rows.item(i).news_image,
                                           news_image_show : results.rows.item(i).news_image_DB,
                                           news_time: results.rows.item(i).news_time,                                                                                  										  
                                           org_id: results.rows.item(i).org_id
                                       });
                }
            } 
        }
        
        return {
            init: init,
            show: show,
            showMoreButtonPress:showMoreButtonPress,
            gobackOrgPage:gobackOrgPage,
            getDataToPost:getDataToPost,
            getLiveData:getLiveData,
            showInListView:showInListView,
            videoDownlaodClick:videoDownlaodClick
        };
    }());
        
    return orgNewsModel;
}());