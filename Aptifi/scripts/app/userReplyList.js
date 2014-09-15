var app = app || {};

app.userReplyList = (function () {

    var userReplyListViewModel = (function () {
    var account_Id;
        
  	var init = function () {
             
                      
      };
         

      var show = function(){	    
	       app.MenuPage=false;
           app.userPosition=false;
           app.mobileApp.pane.loader.hide();
            
           account_Id = localStorage.getItem("ACCOUNT_ID");
            

            console.log(account_Id);
             
            var organisationNotificationModel = {
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
                }/*,
                CreatedAt: {
                    field: 'send_date',
                    defaultValue: new Date()
                },
                organisationID: {
                    field: 'organisationID',
                    defaultValue: null
                }*/                  
            },            
                 
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('CreatedAt'));
            }
            
          };
             
             
          var organisationListDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/organisation/managableOrg/"+account_Id,
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
                                      
                                  /*   
                                     var orgLength=groupValue[0].sentNotification.length;
                                     console.log(orgLength);
                            
                                     for(var j=0;j<orgLength;j++){
                                     groupDataShow.push({
                                         attached: groupValue[0].sentNotification[j].attached,
                                         message: groupValue[0].sentNotification[j].message,
                                         notification_id: groupValue[0].sentNotification[j].notification_id,
                                         send_date:groupValue[0].sentNotification[j].send_date,
                                         title:groupValue[0].sentNotification[j].title,
                                          type:groupValue[0].sentNotification[j].type

                                     });
                                   }
                                     */
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
         
            
            //organisationListDataSource.fetch(function() {
                
 		   //});

             $("#user-Reply-listview").kendoMobileListView({
  		    template: kendo.template($("#userReplyTemplate").html()),    		
     		 dataSource: organisationListDataSource,
              pullToRefresh: true,
               /*click: function(e){
                  	console.log(e.dataItem);
                  	console.log(e.dataItem.organisationID);
   				   //app.mobileApp.navigate('views/userNotificationComment.html?uid=' + e.dataItem.notification_id+'&custId='+custId+'&message='+e.dataItem.message+'&title='+e.dataItem.title);                 
                     app.mobileApp.navigate('views/userReplyNotification.html?organisationID=' + e.dataItem.organisationID);                   
               },*/    
        		schema: {
           		model:  organisationNotificationModel
				}			 
		     });
  
      
          
      };
        
        var clickOnUserName = function(e){
            console.log('karanbisht');
            console.log(e.data);
            console.log(e.data.organisationID);
   				   //app.mobileApp.navigate('views/userNotificationComment.html?uid=' + e.dataItem.notification_id+'&custId='+custId+'&message='+e.dataItem.message+'&title='+e.dataItem.title);                 
            app.mobileApp.navigate('views/userReplyNotification.html?organisationID='+e.data.organisationID+'&orgName='+e.data.orgName);                   
        }
        
            return {
        	   init: init,
           	show: show,
               clickOnUserName:clickOnUserName 
           	};
            
           }());
    
    return userReplyListViewModel;
}());