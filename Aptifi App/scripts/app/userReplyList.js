var app = app || {};

app.userReplyList = (function () {

    var userReplyListViewModel = (function () {

        
  	var init = function () {
             
                      
      };
         

      var show = function(){
	    
	      var orgId = localStorage.getItem("UserOrgID");
          
            var userReplyModel = {
            id: 'Id',
            fields: {
                cust_fname: {
                    field: 'cust_fname',
                    defaultValue: ''
                },
                cust_lname: {
                    field: 'cust_lname',
                    defaultValue:''
                }, 
                cust_email: {
                    field: 'cust_email',
                    defaultValue: ''
                },
                mobile: {
                    field: 'mobile',
                    defaultValue: ''
                },
                add_date :{
                     field: 'add_date',
                    defaultValue: new Date()  
                }
                
            },
            CreatedAtFormatted: function () {
                return app.helper.formatDate(this.get('add_date'));
            }
          };
            
            
            var userReplyDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/notification/getReplyUserList/"+orgId,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {
               model: userReplyModel,
                                
                 data: function(data)
  	             {
                       console.log(data);
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                   console.log(groupValue) 
                                     var returnMsg =groupValue[0].Msg;
                                     console.log(returnMsg);
                                     if(returnMsg==='Success'){

                                     var userReplyLength=groupValue[0].customerList.length;                                    
                                     console.log(userReplyLength);
                            
                                     for(var j=1;j<userReplyLength;j++){
                                        $.each( groupValue[0].customerList[j], function(i, dataValue) {
                                                       console.log(dataValue) ;
                                       groupDataShow.push({
                                        cust_fname:dataValue.cust_fname,
                                        cust_lname: dataValue.cust_lname,
                                        cust_email: dataValue.cust_email,
                                        mobile: dataValue.mobile,
                                        add_date: dataValue.add_date,
                                        cust_id: dataValue.cust_id   
                                         

                                         //notification_id: groupValue[0].replyData[j].notification_id,
                                         //send_date:groupValue[0].replyData[j].send_date,
                                         //title:groupValue[0].replyData[j].title,
                                         //type:groupValue[0].replyData[j].type

                                       });
                                        // console.log(groupValue[0].replyData[j].comment); 
                                             
                                     });

                                   }

                                  } 
                                                                                                          
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
                     
            userReplyDataSource.fetch(function() {
                
 		   });

            $("#user-Reply-listview").kendoMobileListView({
  		    template: kendo.template($("#userReplyTemplate").html()),    		
     		 dataSource: userReplyDataSource,
              click: function(e){
                      //var index = $(e.item).index();
                  	//console.log(e.dataItem);
                  	//console.log(e.dataItem.cust_id);
                  	app.mobileApp.navigate('views/userReplyNotification.html?cust_id=' + e.dataItem.cust_id);
              },
        		schema: {
           		model:  userReplyModel
				}			 
		     });
		};
        
        var clickOnUserName = function(e){
            console.log(e.target)
			alert("got click");
            
        };
        
            return {
        	   init: init,
           	show: show,
               clickOnUserName:clickOnUserName 
           	};
            
           }());
    
    return userReplyListViewModel;
}());