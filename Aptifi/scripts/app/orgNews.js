var app = app || {};

app.orgNews = (function () {
    'use strict'
    
    var orgNewsModel = (function () {
        var eventOrgId;
        var account_Id;
        var groupAllEvent = [];
        var device_type = localStorage.getItem("DEVICE_TYPE");
        var page=0;
        var totalListView=0;
        var dataReceived=0;


        var init = function() {
        }
    
        var show = function(e) {      
             $("#showMoreNewsBtn").hide();
            $("#newsLoader").show();            
            $(".km-scroll-container").css("-webkit-transform", "");             
            eventOrgId = localStorage.getItem("selectedOrgId");
            account_Id = localStorage.getItem("ACCOUNT_ID");
            page=0;
            dataReceived=0;
            totalListView=0;
            groupAllEvent = [];
            
            getLiveData();
        }
        
        var getLiveData = function(){
        
            var jsonDataLogin = {"org_id":eventOrgId,"account_id":account_Id,"page":page}            
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
                        console.log(data);
                        return [data];
                    }
                },
                                                                error: function (e) {
                                                                    //console.log(e);
                                                                    console.log(JSON.stringify(e));
                                                                    app.analyticsService.viewModel.trackException(e, 'Api Call , Unable to get response'+JSON.stringify(e));
                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom(app.INTERNET_ERROR);  
                                                                    }else {
                                                                        app.showAlert(app.INTERNET_ERROR , 'Offline');  
                                                                    }               
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                //var loginDataView = dataSourceLogin.data();               
             	
                var data = this.data();
                
                //$.each(loginDataView, function(i, loginData) {
                    //console.log(loginData.status[0].Msg);
                               
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
                    }else if (data[0]['status'][0].Msg==='Success') {
                        //groupAllEvent = [];
                        totalListView = data[0]['status'][0].Total;
                        
                    if (data[0]['status'][0].newsData!=='No News List') { 
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
                      }else{
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
                      }  
                    }

                    showInListView();
                });

        }
    
        var showInListView = function() {                        
            $("#newsLoader").hide();
            $(".km-scroll-container").css("-webkit-transform", "");
           
            var organisationListDataSource = new kendo.data.DataSource({
                              data: groupAllEvent
            });           
                
            $("#orgNewsList").kendoMobileListView({
                              template: kendo.template($("#orgNewsTemplate").html()),    		
                              dataSource: organisationListDataSource
            });
                
            $('#orgNewsList').data('kendoMobileListView').refresh();
            
            if((totalListView > 10) && (totalListView >=dataReceived+10)){
                $("#showMoreNewsBtn").show();
            }else{
                $("#showMoreNewsBtn").hide();
            }
        }
        
        var gobackOrgPage = function() {
            app.mobileApp.navigate('views/userOrgManage.html'); 
            //app.slide('right', 'green' ,'3' ,'#views/userOrgManage.html');
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
            var fp = vidPathData + "Zaffio/" + 'Zaffio_news_video_' + attachedFilename;             
            window.resolveLocalFileSystemURL(fp, videoPathExist, videoPathNotExist);                        
        }
        
        var videoPathExist = function() {                      
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_news_video_' + attachedFilename;

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
            $("#video_Div_Image_"+notiFi).show();
            //$("videoToDownloadImage_"+notiFi).text('Downloading..');
            var attachedVid = videoFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_news_video_' + attachedFilename;
            
            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedVid, fp, 
                                  function(entry) {
                                      

                                      if(device_type==="AP"){
                                          window.open(fp, "_blank");
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }

                                      $("#video_Div_Image_"+notiFi).hide();
                                      //$("videoToDownloadImage_"+notiFi).text('View');

                                  },
    
                                  function(error) {
                                      $("#video_Div_Image_"+notiFi).hide();
                                      //$("videoToDownloadImage_"+notiFi).text('View');
                                      //$("#progressChat").hide();
                                  }
                );                
        }
        

        var attachedImgFilename;
        var imgFile;
        var imgNotiFi;

        var imageDownlaodClick = function(e){
            var data = e.button.data();
            console.log(data);            
            imgFile = data.imgpath;  
            console.log(imgFile);            
            imgNotiFi = data.notiid;
            attachedImgFilename = imgFile.replace(/^.*[\\\/]/, '');
            attachedImgFilename=attachedImgFilename+'.jpg';
            var vidPathData = app.getfbValue();                    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_news_img_' + attachedImgFilename;             
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
            var fp = vidPathData + "Zaffio/" + 'Zaffio_news_img_' + attachedImgFilename;   
            //fp=fp+'.jpg';
            console.log(fp);
            
                                      if(device_type==="AP"){
                                          //alert('Show');
                                          //window.open("www.google.com", "_system");
                                          window.open(fp, '_blank', 'EnableViewPortScale=yes');

                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }

        }
        
        var imgPathNotExist = function() {
            //alert('img_not_exixt');

            $("#img_Div_Image_"+imgNotiFi).show();
            //$("#imgToDownloadImage_"+imgNotiFi).text('Downloading..');
            
            var attachedImg = imgFile;                        
            var vidPathData = app.getfbValue();    
            var fp = vidPathData + "Zaffio/" + 'Zaffio_news_img_' + attachedImgFilename;
                        console.log(fp);


            var fileTransfer = new FileTransfer();              
            fileTransfer.download(attachedImg, fp, 
                                  function(entry) {
                                      //$("#imgToDownloadImage_"+imgNotiFi).text('View');
                                      $("#img_Div_Image_"+imgNotiFi).hide();


                                      if(device_type==="AP"){
                                          //alert('1');
                                          window.open(fp, "_blank", 'EnableViewPortScale=yes');
                                      }else{
                                          window.plugins.fileOpener.open(fp);
                                      }
                                      
                                  },
    
                                  function(error) {
                                      //$("#imgToDownloadImage_"+imgNotiFi).text('View');
                                      $("#img_Div_Image_"+imgNotiFi).hide();
                                  }
                );                
        }

        
        

        var showMoreButtonPress = function() {
            page++;
            dataReceived=dataReceived+10;
            getLiveData();            
        }



        
        return {
            init: init,
            show: show,
            showMoreButtonPress:showMoreButtonPress,
            gobackOrgPage:gobackOrgPage,
            getLiveData:getLiveData,
            showInListView:showInListView,
            videoDownlaodClick:videoDownlaodClick,
            imageDownlaodClick:imageDownlaodClick            
        };
    }());
        
    return orgNewsModel;
}());