(function(global){
    var AnalyticsModel,
        app = global.app = global.app || {};
    
     var productId;
     //var loginStatusCheck = localStorage.getItem("loginStatusCheck");                                     
    
     /*if (loginStatusCheck==='2') {    
        productId = "c9e67f320a5e4c2aae427468edc67704"; // for Live Project for Admin
     }else{*/
        productId = "baac21f0a525479d93e6918592b7a8cf"; // for Live Project for User 
     //} 
    
     var version   = localStorage.getItem("AppVersion");     
    
     AnalyticsModel = kendo.data.ObservableObject.extend({
     setAnalyticMonitor:function(latitude,longitude)
       {  
         if (!app.checkSimulator()) {  
           var factory = window.plugins.EqatecAnalytics.Factory;           
           factory.IsMonitorCreated(function(result){
               if(result.IsCreated === 'true' || result.IsCreated === true)
               {
                   console.log("monitor has been create");
                   app.analyticsService.viewModel.monitorStart();
               }
               else
               {
                   console.log("monitor not create");
                   app.analyticsService.viewModel.monitorCreate(latitude,longitude);
               }
           });
         }    
       },
        
        monitorCreate:function(latitude,longitude)
        {
          if (!app.checkSimulator()) {
            var factory = window.plugins.EqatecAnalytics.Factory;
            var settings = factory.CreateSettings(productId,version);
            
            settings.TestMode = 'true';
            settings.LoggingInterface = {
                                            LogError:function(errorMsg)
                                            {
                                                console.log("Error :"+errorMsg);
                                            },
                                            LogMessage:function(msg)
                                            {
                                                console.log(msg);    
                                            }
                                        };
            settings.DailyNetworkUtilizationInKB = 5120;
            settings.MaxStorageSizeInKB = 8192;
            settings.LocationCoordinates.Latitude = latitude;
            settings.LocationCoordinates.Longitude = longitude;
            
            
            factory.CreateMonitorWithSettings(settings,
                function()
                {
                    console.log("Monitor create");
                    app.analyticsService.viewModel.monitorStart();
                },
                function(msg)
                {
                    console.log("Error creating monitor :"+msg);
                }
            );
          }   
        },
        
        monitorStart:function()
        {
            if (!app.checkSimulator()) {
             
                var monitor = window.plugins.EqatecAnalytics.Monitor;
                var loginStatusCheck = localStorage.getItem("loginStatusCheck");                             
            
                if (loginStatusCheck==='0' || loginStatusCheck===null)
                {
                    app.analyticsService.viewModel.setInstallationInfo("Anonymous User");
                }
                else
                {
                    var userNumber = localStorage.getItem("usernameAnalytic"); 
                    app.analyticsService.viewModel.setInstallationInfo(userNumber);
                }
            
                monitor.Start(function()
                {
                    console.log('monitor start');
                    app.analyticsService.viewModel.trackFeature("Detect Status.App new session is start.");
                });
           }     
        },
        
        monitorStop:function()
        {
            if (!app.checkSimulator()) {
                var monitor = window.plugins.EqatecAnalytics.Monitor;
                app.analyticsService.viewModel.trackFeature("Detect Status.App is closed.");
                monitor.Stop(function()
                {
                    console.log('monitor stop');
                });
            }     
        },
        loginUserMonitorStop:function()
        {
            if (!app.checkSimulator()) {   
                var monitor = window.plugins.EqatecAnalytics.Monitor;
                app.analyticsService.viewModel.trackFeature("Login.User logout");
                monitor.Stop(function()
                {
                    console.log('User logout and monitor stop');
                
                });
            }    
        },
        userLoginStatus:function()
        {
            if (!app.checkSimulator()) {              
               app.analyticsService.viewModel.trackFeature("Login.User login with Mobile No:"+localStorage.getItem("usernameAnalytic"));
               app.analyticsService.viewModel.setInstallationInfo(localStorage.getItem("usernameAnalytic"));           
            }    
        },
        
        trackFeature:function(feature)
        {
           if (!app.checkSimulator()) {
                var monitor = window.plugins.EqatecAnalytics.Monitor;
                monitor.TrackFeature(feature);
           }   
        },
        
        setInstallationInfo:function(installationId)
        {
            if (!app.checkSimulator()) {
                var monitor = window.plugins.EqatecAnalytics.Monitor;
                monitor.SetInstallationInfo(installationId);
            } 
        },
        trackException:function(e,msg)
        {
            if (!app.checkSimulator()) {
                var monitor = window.plugins.EqatecAnalytics.Monitor;            
                monitor.TrackExceptionMessage(e, msg);
            }    
        },        
               
       /* monitorStatusChange:function(op){
            
            var monitor = window.plugins.EqatecAnalytics.Monitor;
           
            monitor.GetStatus(function(status) {
                if(status.IsStarted === true)
                {
                    
                    app.analyticsService.viewModel.monitorStop("Unknown User");
                    app.analyticsService.viewModel.userStatus();
                }
                else
                {
                    app.analyticsService.viewModel.monitorStart();
                    app.analyticsService.viewModel.userStatus();
                }
            });
        }*/
    });
    app.analyticsService = {
        viewModel :new AnalyticsModel()
    };
})(window);