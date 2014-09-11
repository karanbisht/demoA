var app = app || {};

app.replyedCustomer = (function () {
       
   var replyedCustomerView = (function () {
    	var message;
        var title;
        var org_id;
        var notiId;
        var comment_allow;
		var attachedimg;
        
        
  	var init = function () {
                                   
      };
        
      var show = function(e){
                  app.MenuPage=false;
                  message = e.view.params.message;
                  title = e.view.params.title;
                  org_id = e.view.params.org_id;
                  notiId = e.view.params.notiId;
                  comment_allow = e.view.params.comment_allow;
                  attachedimg = e.view.params.attached;
          
          console.log(attachedimg);
          
          
            var UserModel ={
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
            
        var MemberDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getReplycustomerList/"+org_id+"/"+notiId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                  
              	}
              },
       	 schema: {
               model: UserModel,
                                
                 data: function(data)
  	             {
                       console.log(data);
                       
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
									console.log(groupValue);
                                     
                                 $.each(groupValue, function(i, orgVal) {
                                    console.log(orgVal);

                   	             if(orgVal.Msg ==='No Customer in this group'){     
                                     groupDataShow.push({
                                         user_fname: 'No Customer',
                                         user_lname: '',
                                         customerID:0,  
                                         user_type : '',
                                         orgID:0,
                                         user_id:0
    	                               });                                      
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.customerList.length);  
                                        for(var i=0;i<orgVal.customerList.length;i++){
                                            groupDataShow.push({
		                                         user_fname: orgVal.customerList[i].user_fname,
                		                         user_lname : orgVal.customerList[i].user_lname,
                        		                 customerID:orgVal.customerList[i].customerID,
                                		         user_type:orgVal.customerList[i].user_type,
                                                 orgID:orgVal.customerList[i].orgID,
                                                 user_id:orgVal.customerList[i].user_id
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
         
            
            //MemberDataSource.fetch(function() {
                
 		   //});
	
         
    	    $("#reply-customer-listview").kendoMobileListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#replyCustomerTemplate").html()),
                pullToRefresh: true,
                schema: {
           		model:  UserModel
				}		
			});
      };
       
       
                     
       var customerSelected = function(e){
            console.log(e.data.user_fname);
       	 console.log(e.data.customerID);
            app.MenuPage=false;
            app.mobileApp.navigate('views/userNotificationComment.html?message=' + message +'&title='+title+'&org_id='+org_id+'&notiId='+notiId+'&comment_allow='+comment_allow+'&customerID='+e.data.customerID+'&userName='+e.data.user_fname+'&attached='+attachedimg);
       };
       
        	   return {
        	   init: init,
           	show: show,
               customerSelected:customerSelected
           	};
            
           }());
    
    return replyedCustomerView;
}());  
