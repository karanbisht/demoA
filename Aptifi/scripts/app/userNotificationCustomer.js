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
        
      var show = function(e){
                  app.MenuPage=false;
                  //message = e.view.params.message;
                  //title = e.view.params.title;
         
                  org_id = e.view.params.org_id;
                  userCount = e.view.params.count;
          
                  //notiId = e.view.params.notiId;
                  //comment_allow = e.view.params.comment_allow;
                  //attachedimg = e.view.params.attached;
          
                  //console.log(attachedimg);
                    
                     $(".km-scroll-container").css("-webkit-transform", "");

          
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
                   //url: "http://54.85.208.215/webservice/notification/getReplycustomerList/"+org_id+"/"+notiId,
                   url: "http://54.85.208.215/webservice/notification/replyListbyOrg/"+org_id,
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

                                    //alert(JSON.stringify(groupValue));           
 
                                 $.each(groupValue, function(i, orgVal) {
                                    console.log(orgVal);

                   	             if(orgVal.Msg ==='No list found'){   
                                     
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
	                                }else if(orgVal.Msg==='Success'){

                                        console.log(orgVal.customerList.length);  
                                        
                                        for(var i=0;i<orgVal.customerList.length;i++){
                                            groupDataShow.push({
		                                         user_fname: orgVal.customerList[i].user_fname,
                		                         user_lname : orgVal.customerList[i].user_lname,
                        		                 customerID:orgVal.customerList[i].customerID,
                                		         user_type:orgVal.customerList[i].user_type,
                                                 //orgID:orgVal.customerList[i].orgID,
                                                 comment:orgVal.customerList[i].comment,
                                                 notification_id:orgVal.customerList[i].notification_id,
                                                 add_date:orgVal.customerList[i].add_date,
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
            	   //navigator.notification.alert("Please check your internet connection.",
               	//function () { }, "Notification", 'OK');
                    
                    
                     
                    var showNotiTypes=[
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
	       
    	    
             $("#reply-customer-listview").kendoMobileListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#replyCustomerTemplate").html()),
                schema: {
           		model:  UserModel
				}		
			});


          
                     var db = app.getDb();
		             db.transaction(updateBagCount, app.errorCB, app.successCB);   

      };
       
       
       var updateBagCount = function(tx){
           //alert('update');
                    var queryUpdate = "UPDATE ADMIN_ORG SET bagCount='"+userCount+"' where org_id="+org_id;
                    app.updateQuery(tx, queryUpdate);                         
  
       }
       
                     
       var customerSelected = function(e){
            console.log(e);
            console.log(e.data.user_fname);
       	 console.log(e.data.customerID);
            app.MenuPage=false;
            app.mobileApp.navigate('views/userNotificationComment.html?org_id='+org_id+'&customerID='+e.data.customerID+'&userName='+e.data.user_fname+'&notification_id='+e.data.notification_id);
       };
       
        	   return {
        	   init: init,
           	show: show,
               customerSelected:customerSelected
           	};
            
           }());
    
    return replyedCustomerView;
}());  
