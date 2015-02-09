(function(global){
    var AnalyticsModel,
        app = global.app = global.app || {};
    
    var productId = "3533a3c811324734a532336ccef5f288",
    version   = localStorage.getItem("AppVersion");
    
    AnalyticsModel = kendo.data.ObservableObject.extend({
       
       setAnalyticMonitor:function(latitude,longitude)
       {  
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
       },
        
        monitorCreate:function(latitude,longitude)
        {
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
            
            //console.log(settings);
            
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
            
        },
        
        monitorStart:function()
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            var loginStatus = localStorage.getItem("isLoggedIn");

            if(loginStatus === 'true' || loginStatus === true)
            {
                app.analyticsService.viewModel.setInstallationInfo(localStorage.getItem("username"));
            }
            else
            {
                app.analyticsService.viewModel.setInstallationInfo("Anonymous User");
            }
            monitor.Start(function()
            {
                //console.log(monitor);
                console.log('monitor start');
                app.analyticsService.viewModel.trackFeature("Detect Status.App new session is start.");
            });
        },
        
        monitorStop:function()
        {   
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            app.analyticsService.viewModel.trackFeature("Detect Status.App is closed.");
            monitor.Stop(function()
            {
                console.log('monitor stop');
            });
        },
        loginUserMonitorStop:function()
        {   
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            app.analyticsService.viewModel.trackFeature("Login.User logout");
            monitor.Stop(function()
            {
                console.log('User logout and monitor stop');
                
            });
        },
        userLoginStatus:function()
        {              
               app.analyticsService.viewModel.trackFeature("Login.User login with Mobile No:"+localStorage.getItem("username"));
               app.analyticsService.viewModel.setInstallationInfo(localStorage.getItem("username"));           
        },
        
        trackFeature:function(feature)
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            monitor.TrackFeature(feature);
        },
        
        setInstallationInfo:function(installationId)
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            //console.log(installationId);
            monitor.SetInstallationInfo(installationId);
        },
        trackException:function(e,msg)
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            
            monitor.TrackExceptionMessage(e, msg);
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