var app = app || {};

app.userReplyList = (function () {
    var userReplyListViewModel = (function () {
        var account_Id;
        var tabstrip1;
        
        var init = function () {
        };
        
        var beforeShow = function() {
            var db = app.getDb();
            db.transaction(getDataOrg, app.errorCB, showLiveData);   
        };
    
        var getDataOrg = function(tx) {
            var query = "SELECT * FROM ADMIN_ORG";
            app.selectQuery(tx, query, getDataSuccess);
        };
            
        var groupDataShow = [];
            
        function getDataSuccess(tx, results) {                        
            groupDataShow = [];
            
            var count = results.rows.length;
            var totalShowData = 0;
            if (count !== 0) { 
                for (var i = 0 ; i < count ; i++) {                
                    var bagCountData = results.rows.item(i).bagCount;
                   
                    var countData = results.rows.item(i).count;
                   
                    if (countData===null || countData==="null") {
                        countData = 0; 
                    }
                   
                    if (bagCountData===null || bagCountData==="null") {
                        bagCountData = 0;
                    }
                   
                    var showData = countData - bagCountData;
                    totalShowData = showData + totalShowData;
                    //alert(showData);
                    groupDataShow.push({
                                           orgName: results.rows.item(i).org_name,
                                           orgDesc: results.rows.item(i).orgDesc,
                                           organisationID:results.rows.item(i).org_id,
                                           org_logo:results.rows.item(i).imageSource,
                                           imageSource:results.rows.item(i).imageSource,
                                           count : results.rows.item(i).count,
                                           bagCount : results.rows.item(i).bagCount,
                                           showCount: showData 
                                       });
                }
                //tabstrip1.badge(1, totalShowData);
            }else {
                groupDataShow.push({
                                       orgName: 'Welcome to Aptifi',
                                       orgDesc: 'You are not a customer of any organization',
                                       organisationID:'0',
                                       org_logo:null,
                                       imageSource:null,
                                       count:0,
                                       bagCount : 0,
                                       showCount:0
                                   });          
            }
        }               
            
        var showLiveData = function() {
            console.log('Hello');
            console.log(groupDataShow);
                
            var organisationListDataSource = new kendo.data.DataSource({
                                                                           data: groupDataShow
                                                                       });           
              
            $("#user-Reply-listview").kendoMobileListView({
                                                              template: kendo.template($("#userReplyTemplate").html()),    		
                                                              dataSource: organisationListDataSource
                                                          });
                                   
            $('#user-Reply-listview').data('kendoMobileListView').refresh();
                
            app.mobileApp.pane.loader.hide();
        };

        var show = function(e) {
            if (!app.checkConnection()) {
                if (!app.checkSimulator()) {
                    window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                }else {
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                } 
            }
          
            app.MenuPage = false;
            app.userPosition = false;
            app.mobileApp.pane.loader.hide();
            
            $(".km-scroll-container").css("-webkit-transform", "");

            tabstrip1 = e.view.header.find(".km-tabstrip").data("kendoMobileTabStrip");

            account_Id = localStorage.getItem("ACCOUNT_ID");

            console.log(account_Id);
            /* var organisationNotificationModel = {
            id: 'Id',
            fields: {
            orgName: {
            field: 'orgName',
            defaultValue: ''
            },
            orgDesc :{
            field: 'orgDesc',
            defaultValue: ''  
            },
            organisationID: {
            field: 'organisationID',
            defaultValue: null
            }                  
            },            
            CreatedAtFormatted: function () {
            return app.helper.formatDate(this.get('CreatedAt'));
            }
            };
            var organisationListDataSource = new kendo.data.DataSource({
            transport: {
            read: {
            url: app.serverUrl()+"organisation/managableOrg/"+account_Id,
            type:"POST",
            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
            }
            },
            schema: {
            model: organisationNotificationModel,                                
            data: function(data)
            {
            console.log(data);
            var groupDataShow = [];
            $.each(data, function(i, groupValue) {
            console.log(groupValue);
            $.each(groupValue, function(i, orgVal) {
            console.log();
            if(orgVal.Msg ==='Not a customer to any organisation'){     
            groupDataShow.push({
            orgName: 'Welcome to Aptifi',
            orgDesc: 'You are not a customer of any organisation',
            organisationID:'0',  
            bagCount : 'D'    
            });                                      
            }else if(orgVal.Msg==='Success'){
            console.log(orgVal.orgData.length);  
            for(var i=0;i<orgVal.orgData.length;i++){
            groupDataShow.push({
            orgName: orgVal.orgData[i].org_name,
            orgDesc: orgVal.orgData[i].org_desc,
            organisationID:orgVal.orgData[i].organisationID,
            bagCount : 'C'					
            });
            }     
            }
            });    
            });
            console.log(groupDataShow);
            return groupDataShow;
            }                       
            },
            error: function (e) {
            //apps.hideLoading();
            console.log(e);
            navigator.notification.alert("Please check your internet connection.",
            function () { }, "Notification", 'OK');
            }
            });         
            */    
            //organisationListDataSource.fetch(function() {
            //});
        };
        
        var clickOnUserName = function(e) {
            console.log('karanbisht');
            console.log(e.data);
            console.log(e.data.count);
            //app.mobileApp.navigate('views/userNotificationComment.html?uid=' + e.dataItem.notification_id+'&custId='+custId+'&message='+e.dataItem.message+'&title='+e.dataItem.title);                 
            //app.mobileApp.navigate('views/userReplyNotification.html?organisationID='+e.data.organisationID+'&orgName='+e.data.orgName); 

            app.analyticsService.viewModel.trackFeature("User navigate to Reply To Customer in Admin");            
            
            app.mobileApp.navigate('views/userNotificationCustomer.html?org_id=' + e.data.organisationID + '&count=' + e.data.count); 
            
        }
        
        return {
            init: init,
            show: show,
            beforeShow:beforeShow, 
            clickOnUserName:clickOnUserName 
        };
    }());
    
    return userReplyListViewModel;
}());