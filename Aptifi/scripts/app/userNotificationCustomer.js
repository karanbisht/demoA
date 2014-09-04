var app = app || {};

app.replyedCustomer = (function () {

    var GroupName;
    var selectedGroupId;
    var selectedGroupDesc;
    var custFromGroup= [];
    //var orgId = localStorage.getItem("UserOrgID");
    
    var groupID;
    var organisationID;
       
    var groupDetailViewModel = (function () {

        
  	var init = function () {
             
                      
      };


var showSubGroupMembers = function(){
            app.MenuPage=false;
            app.mobileApp.navigate('#subGroupMemberShow');         
            console.log(organisationID);
            console.log(groupID);
            
            var UserModel ={
            id: 'Id',
            fields: {
                mobile: {
                    field: 'mobile',
                    defaultValue: ''
                },
                first_name: {
                    field: 'first_name',
                    defaultValue: ''
                },
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
                }

               }
             };
            
        var MemberDataSource = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/group/getCustomerByGroupID/"+groupID+"/"+organisationID,
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
                                         mobile: '',
                                         first_name: '',
                                         email:'No Customer in this Group',  
                                         last_name : '',
                                         customerID:'0',
                                         orgID:0
    	                               });                                      
	                                }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.customerInfo.length);  
                                        for(var i=0;i<orgVal.customerInfo.length;i++){
                                            groupDataShow.push({
		                                         first_name: orgVal.customerInfo[i].first_name,
        		                                 email:orgVal.customerInfo[i].email,  
                		                         last_name : orgVal.customerInfo[i].last_name,
                        		                 customerID:orgVal.customerInfo[i].customerID,
                                		         mobile:orgVal.customerInfo[i].mobile,
                                                 orgID:orgVal.customerInfo[i].orgID
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
         
            
            MemberDataSource.fetch(function() {
                
 		   });
	
         
    	    $("#subGroupMember-listview").kendoMobileListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#subGroupMemberTemplate").html()),
                pullToRefresh: true, 
			});
            
             $("#deleteSubMemberData").kendoListView({
  		    template: kendo.template($("#sub-Member-Delete-template").html()),    		
     		 dataSource: MemberDataSource,
        		schema: {
           		model:  UserModel
				}			 
		     });
            
        };
        
        
        
        
        	   return {
        	   init: init,
           	show: show
           	};
            
           }());
    
    return groupDetailViewModel;
}());  
