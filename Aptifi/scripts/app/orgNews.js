var app = app || {};

app.orgNews = (function () {
    var orgNewsModel = (function () {
        var eventOrgId;
        var groupAllEvent = [];

        var init = function() {
        }
    
        var show = function(e) {
            $(".km-scroll-container").css("-webkit-transform", "");             

            eventOrgId = localStorage.getItem("selectedOrgId");
            
            var jsonDataLogin = {"org_id":eventOrgId}

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
                                                                    console.log(e);               
                                                                    if (!app.checkSimulator()) {
                                                                        window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                    }else {
                                                                        app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                    }               
                                                                }               
                                                            });  
	            
            dataSourceLogin.fetch(function() {
                var loginDataView = dataSourceLogin.data();               
                var orgDataId = [];
                var userAllGroupId = [];
						   
                $.each(loginDataView, function(i, loginData) {
                    console.log(loginData.status[0].Msg);
                               
                    if (loginData.status[0].Msg==='No News list') {
                        groupAllEvent = [];
                          
                        groupAllEvent.push({
                                               id: 0,
                                               add_date: 0,
                                               news_date: 0,
                                               news_desc: 'No News from this Organization',                                                                                 										  
                                               news_name: 'No News',                                                                                  										  
                                               news_time: '',                                                                                  										  
                                               mod_date: '',                                     
                                               org_id: ''
                                           });
                    }else if (loginData.status[0].Msg==='Success') {
                        groupAllEvent = [];

                        if (loginData.status[0].newsData.length!==0) {
                            var eventListLength = loginData.status[0].newsData.length;
                              
                            for (var i = 0 ; i < eventListLength ;i++) {
                                var newsDate = loginData.status[0].newsData[i].news_date;
                                console.log("-------karan---------------");
                                console.log(newsDate);
                                  
                                var values = newsDate.split('-');
                                var year = values[0]; // globle variable
                                var month = values[1];
                                var day = values[2];
                                  
                                console.log('------------------date=---------------------');
                                console.log(year + "||" + month + "||" + day);
                                  
                                //tasks[+new Date(2014, 11, 8)] = "ob-done-date";
                                 
                                if (day < 10) {
                                    day = day.replace(/^0+/, '');                                     
                                }
                                var saveData = month + "/" + day + "/" + year;
                                 
                                groupAllEvent.push({
                                                       id: loginData.status[0].newsData[i].id,
                                                       add_date: loginData.status[0].newsData[i].add_date,
                                                       news_date: saveData,
                                                       news_desc: loginData.status[0].newsData[i].news_desc,                                                                                 										  
                                                       news_name: loginData.status[0].newsData[i].org_name,                                                                                  										  
                                                       news_time: loginData.status[0].newsData[i].news_time,                                                                                  										  
                                                       mod_date: loginData.status[0].newsData[i].mod_date,                                     
                                                       org_id: loginData.status[0].newsData[i].org_id
                                                   });
                            }
                        } 
                    }

                    showInListView();
                });
            }); 
            //tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/
        }
    
        var showInListView = function() {
            console.log(groupAllEvent);

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
            //app.mobileApp.navigate('views/userOrgManage.html'); 
                            app.slide('right', 'green' ,'3' ,'#views/userOrgManage.html');
 
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