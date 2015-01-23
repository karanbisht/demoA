var app = app || {};


app.orgNews = (function () {
    var orgNewsModel = (function () {
        var eventOrgId;
        var account_Id;
        var groupAllEvent = [];

        var init = function() {
        }
    
        var show = function(e) {
            
            $("#newsLoader").show();
            
            $(".km-scroll-container").css("-webkit-transform", "");             

            eventOrgId = localStorage.getItem("selectedOrgId");
            account_Id = localStorage.getItem("ACCOUNT_ID");

            
            var jsonDataLogin = {"org_id":eventOrgId,"account_id":account_Id}

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
                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
                                                                        app.showAlert('Network unavailable . Please try again later' , 'Offline');  
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
                        groupAllEvent = [];
                        
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
            //}); 
            //tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/
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
        }
        
        var gobackOrgPage = function() {
            app.mobileApp.navigate('views/userOrgManage.html'); 
                            //app.slide('right', 'green' ,'3' ,'#views/userOrgManage.html');
 
        }
        


        
        return {
            init: init,
            show: show,
            gobackOrgPage:gobackOrgPage,
            showInListView:showInListView
        };
    }());
        
    return orgNewsModel;
}());