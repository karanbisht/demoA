var app = app || {};

app.replyedCustomer = (function () {
    var replyedCustomerView = (function () {
        var message;
        var title;
        var org_id;
        var userCount;
        var notiId;
        var comment_allow;
        var attachedimg;
        
        var init = function () {
        };
        
        var show = function(e) {
            app.MenuPage = false;
            //message = e.view.params.message;
            //title = e.view.params.title;
         
            app.mobileApp.pane.loader.hide();
            app.mobileApp.pane.loader.hide();

            $("#loaderReplyCustomer").show();
            $("#reply-customer-listview").hide();
          
            org_id = localStorage.getItem("orgSelectAdmin");
            userCount= localStorage.getItem("incommingMsgCount"); 
            
            //userCount = e.view.params.count;
          
            //notiId = e.view.params.notiId;
            //comment_allow = e.view.params.comment_allow;
            //attachedimg = e.view.params.attached;
          
            //console.log(attachedimg);
                    
            $(".km-scroll-container").css("-webkit-transform", "");
          
            var UserModel = {
                id: 'Id',
                fields: {
                    user_fname: {
                            field: 'user_fname',
                            defaultValue: ''
                        },
                    user_lname: {
                            field: 'user_lname',
                            defaultValue: ''
                        }/*,
                    email: {
                    field: 'email',
                    defaultValue:''
                    },
                    last_name: {
                    field: 'last_name',
                    defaultValue:''
                    },
                    customerID: {
                    field: 'customerID',
                    defaultValue:''
                    }*/

                }
            };

            app.mobileApp.pane.loader.hide();
            var MemberDataSource = new kendo.data.DataSource({
                                                                 transport: {
                    read: {
                                                                             //url: "http://54.85.208.215/webservice/notification/getReplycustomerList/"+org_id+"/"+notiId,
                                                                             url: app.serverUrl() + "notification/replyListbyOrg/" + org_id,
                                                                             type:"POST",
                                                                             dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
                                                                         }
                },
                                                                 schema: {
                    model: UserModel,
                                
                    data: function(data) {
                        console.log(data);
                       
                        var groupDataShow = [];
                        $.each(data, function(i, groupValue) {
                            console.log(groupValue);

                            //alert(JSON.stringify(groupValue));           
 
                            $.each(groupValue, function(i, orgVal) {
                                console.log(orgVal);
                                     
                                if(orgVal.Msg==="You don't have access"){                                    
                                    app.showAlert('Current user session has expired. Please re-login in Admin Panel' , 'Notification');
                                    app.LogoutFromAdmin(); 
                                    
                                    //app.mobileApp.navigate('views/organisationLogin.html');   
                                    //localStorage.setItem("loginStatusCheck", 1);                                
                                      
                                }else if (orgVal.Msg ==='No list found') {   
                                    groupDataShow.push({
                                                           user_fname: 'No Customer found',
                                                           user_lname: '',
                                                           customerID:0,  
                                                           user_type : '',
                                                           //orgID:0,
                                                           comment:'',
                                                           notification_id:'',
                                                           add_date:'',
                                                           user_id:0
    	                               
                                                       });                                      
                                }else if (orgVal.Msg==='Success') {
                                    console.log(orgVal.customerList.length);  
                                        
                                    for (var i = 0;i < orgVal.customerList.length;i++) {
                                         var dateString = orgVal.customerList[i].add_date;
                                         var split = dateString .split(' ');
                                         console.log(split[0] + " || " + split[1]);
                                         var commentDate = app.formatDate(split[0]);
                                         var commentTime = app.formatTime(split[1]);
                                         var date_show= commentDate +' '+commentTime;
 
                                        groupDataShow.push({
                                                               user_fname: orgVal.customerList[i].user_fname,
                                                               user_lname : orgVal.customerList[i].user_lname,
                                                               customerID:orgVal.customerList[i].customerID,
                                                               user_type:orgVal.customerList[i].user_type,
                                                               //orgID:orgVal.customerList[i].orgID,
                                                               comment:orgVal.customerList[i].comment,
                                                               notification_id:orgVal.customerList[i].notification_id,
                                                               add_date:date_show,
                                                               user_id:orgVal.customerList[i].user_id
                                                           });
                                    }     
                                } 
                            });
                        });
                       
                        console.log(groupDataShow);
                        //alert(groupDataShow);
                        return groupDataShow;
                    }

                },
                                                                 error: function (e) {
                                                                     //apps.hideLoading();
                                                                     //console.log(e);
                                                                     console.log(JSON.stringify(e));
                                                                     
                                                                     //navigator.notification.alert("Please check your internet connection.",
                                                                     //function () { }, "Notification", 'OK');
                                                                     $("#loaderReplyCustomer").hide();
                                                                     $("#reply-customer-listview").show();
                                                                     if (!app.checkSimulator()) {
                                                                         window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                                                                     }else {
                                                                         app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                                                                     } 
                     
                                                                     var showNotiTypes = [
                                                                         { message: "Your request has not been processed due to a connection error . Please try again"}
                                                                     ];
                        
                                                                     var dataSource = new kendo.data.DataSource({
                                                                                                                    data: showNotiTypes
                                                                                                                });
                    
                                                                     $("#reply-customer-listview").kendoMobileListView({
                                                                                                                           template: kendo.template($("#errorTemplate").html()),
                                                                                                                           dataSource: dataSource  
                                                                                                                       });
                                                                 }
                                                             });         
            
            //MemberDataSource.fetch(function() {
                
            //});
            app.mobileApp.pane.loader.hide();
    	    
            $("#reply-customer-listview").kendoMobileListView({
                                                                  dataSource: MemberDataSource,
                                                                  template: kendo.template($("#replyCustomerTemplate").html()),
                                                                  schema: {
                    model:  UserModel
                }		
                                                              });

            app.mobileApp.pane.loader.hide();

           setTimeout(function(){
                $("#loaderReplyCustomer").hide();
                $("#reply-customer-listview").show();
           },100);
            var db = app.getDb();
            db.transaction(updateBagCount, app.errorCB, app.successCB);   
        };
       
        var updateBagCount = function(tx) {
            //alert('update');
            var queryUpdate = "UPDATE ADMIN_ORG SET bagCount='" + userCount + "' where org_id=" + org_id;
            app.updateQuery(tx, queryUpdate);                         
        }
                     
        var customerSelected = function(e) {
            console.log(e);
            console.log(e.data.user_fname);
            console.log(e.data.customerID);
            app.MenuPage = false;

            app.analyticsService.viewModel.trackFeature("User navigate to Reply page in Admin");            

            app.mobileApp.navigate('views/userNotificationComment.html?org_id=' + org_id + '&customerID=' + e.data.customerID + '&userName=' + e.data.user_fname + '&notification_id=' + e.data.notification_id + '&date=' + e.data.add_date);
        };
       
        return {
            init: init,
            show: show,
            customerSelected:customerSelected
        };
    }());
    
    return replyedCustomerView;
}());