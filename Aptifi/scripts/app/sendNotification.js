var app = app || {};

app.sendNotification = (function () {
    var validator;
    var notificationTypeSelected;
    var dataToSend ;
    var noGroup=0;
    var noCustomer=0;

    var groupChecked = [];
	 var sendNotificationViewModel = (function () {

      var orgId = localStorage.getItem("UserOrgID"); 
      console.log(orgId);
      var account_Id;          
      var pictureSource;   // picture source
      var destinationType; // sets the format of returned value
   
    	var init = function () {				                 
           app.MenuPage=false;
           app.userPosition=false;
           //validator = $('#enterNotification').kendoValidator().data('kendoValidator');                                 
            

           var showNotiTypes=[
                                        { text: "Promotion", value: "P" },
                                        { text: "Invitaion", value: "V" },
                                        { text: "Information", value: "I" },
                                        { text: "Reminder", value: "R" },
                                        { text: "Alert", value: "A" }      
          ];
            
            
            var dataSource = new kendo.data.DataSource({
                  data: showNotiTypes
            });

            
             $("#type-Name-listview").kendoMobileListView({
  		    template: kendo.template($("#typeNameTemplate").html()),    		
     		 dataSource: dataSource,
              click : function(e){
                     console.log(e.dataItem.value);
                     notificationTypeSelected=e.dataItem.value;
                     app.mobileApp.pane.loader.show(); 
                     $("#selectTypeDiv").hide();
                     $("#sendNotificationDivMsg").show();
                     app.mobileApp.pane.loader.hide();     
              }
             });

            

           /*$("#notificationType").kendoComboBox({
                        dataTextField: "text",
                        dataValueField: "value",
                        dataSource: [
                            { text: "Promotion", value: "P" },
                            { text: "Invitaion", value: "V" },
                            { text: "Information", value: "I" },
                            { text: "Reminder", value: "R" },
                            { text: "Alert", value: "A" }
                        ],
                        filter: "contains",
                        placeholder: "Select Type",
                        suggest: true
                        //index: 0
                    });
            */
            
           /*$("#type-Name-listview").kendoMobileListView({
  		    template: kendo.template($("#typeNameTemplate").html()),    		
     		 dataSource: dataSource,
              pullToRefresh: true
		     });
          */


            //$("#groupSelectNotification").kendoComboBox();

            
            /*$("#groupforNotification").kendoComboBox({
                          
               });
            
            var comboboxGroup = $("#groupforNotification").data("kendoComboBox"); 
				comboboxGroup.input.focus(function() {
	                //$( "#orgforNotification" ).blur();
                    comboboxGroup.input.blur();
				});
            
            
                 var combobox = $("#notificationType").data("kendoComboBox"); 
				combobox.input.focus(function() {
	                //$( "#orgforNotification" ).blur();
                    combobox.input.blur();
				});*/                             
        };
         
         
         
         
        var beforeShow=function(){
           var db = app.getDb();
		   db.transaction(getDataOrg, app.errorCB, showLiveData);   
        };
            
    
        var getDataOrg = function(tx){
            	var query = "SELECT * FROM ADMIN_ORG";
				app.selectQuery(tx, query, getDataSuccess);
        };
            
            
            var groupDataShowOffline=[];
            
        function getDataSuccess(tx, results) {                        
            groupDataShowOffline=[];
            
			var count = results.rows.length;                    			
               if (count !== 0) {                
            	    for(var i =0 ; i<count ; i++){                
                                       groupDataShowOffline.push({
												 org_name: results.rows.item(i).org_name,
        		                                 orgDesc: results.rows.item(i).orgDesc,
                                                 org_id:results.rows.item(i).org_id,
		                                         bagCount : 'C'					
                                       });
                    }
                }else{
                                     groupDataShowOffline.push({
                                         org_name: 'No Notification',
                                         orgDesc: 'You are not a customer of any organisation',
                                         org_id:'0',
                                         bagCount : 'D'    
    	                               });          
                }
  
             };
         
         
         
         var showLiveData = function(){
                //console.log('Hello');
             
                console.log(groupDataShowOffline);
                
             var organisationListDataSource = new kendo.data.DataSource({
                  data: groupDataShowOffline
              });                           
             
             $("#organisation-Name-listview").kendoMobileListView({
  		    template: kendo.template($("#orgNameTemplate").html()),    		
     		 dataSource: organisationListDataSource
              //pullToRefresh: true
		     });
                                        
              $('#organisation-Name-listview').data('kendoMobileListView').refresh();                
              app.mobileApp.pane.loader.hide();
              $("#selectOrgDiv").show();

            };
    
                                       
        var show = function(e){
            

            noGroup=0;
            noCustomer=0;
            
            $("#removeAttachment").hide(); 
             $(".km-scroll-container").css("-webkit-transform", "");
             dataToSend='';
             pictureSource=navigator.camera.PictureSourceType;
             destinationType=navigator.camera.DestinationType;
            
            //$notificationDesc.val('');
           // validator.hideMessages();
            
             //var scroller = e.view.scroller;
             //scroller.reset();

            
            app.mobileApp.pane.loader.show();

            localStorage.setItem("SELECTED_GROUP",'');
            localStorage.setItem("SELECTED_CUSTOMER",'');
            
            $("#notificationTitleValue").val('');            
            $("#notificationDesc").val('');
            
            var largeImage = document.getElementById('largeImage');
            largeImage.src ='';
            document.getElementById('comment_allow').checked = false;
            
            $("#selectGroupDiv").hide();
            $("#selectTypeDiv").hide();
            $("#sendNotificationDivMsg").hide();
            $("#selectCustomerToSend").hide();
            
            if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }            
            
            var account_Id = localStorage.getItem("ACCOUNT_ID");          
       };    
             
                              
         var onChangeNotiGroup = function(){
            	 var selectDataNoti = $("#groupforNotification").data("kendoComboBox");    
             	var groupSelectedNoti = selectDataNoti.value();
                 console.log(groupSelectedNoti);
             	return groupSelectedNoti;
         };
         
         
         var getPhotoVal = function(){
                    navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
                    destinationType: destinationType.FILE_URI,
                    sourceType: pictureSource.SAVEDPHOTOALBUM });

         };
                          

         var sendNotificationMessage = function () {    
           //alert(dataToSend);undefined
             console.log(dataToSend);
             
         if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
           }else{     
             //var cmbGroup = [];
             var org_id = localStorage.getItem("SELECTED_ORG");    
         
            //if (validator.validate()) {
               //var group=onChangeNotiGroup();
               // cmbGroup.push(group);
            
                //cmbGroup = String(cmbGroup);
                //console.log(cmbGroup);
		  
        
               var cmbGroup = localStorage.getItem("SELECTED_GROUP");
               cmbGroup = String(cmbGroup);
             
               var cmbCust=localStorage.getItem("SELECTED_CUSTOMER");
               cmbCust = String(cmbCust);
             
                //alert(cmbGroup);
             
                //var selectedType = $("#notificationType").data("kendoComboBox");
                //var type=selectedType.value();
             
                 var type= notificationTypeSelected;
                //alert(type);
             
             var cmmt_allow ;
             if($("#comment_allow").prop('checked')){
    				cmmt_allow = 1;  // checked
	 		}else{
    				cmmt_allow = 0;
             }
             
             console.log(cmmt_allow);
                var notificationValue = $("#notificationDesc").val();
                var titleValue = $("#notificationTitleValue").val();
                
                //alert(titleValue +"||"+notificationValue);            
             
          //console.log(notificationValue+"||"+titleValue+"||"+type+"||"+cmmt_allow+"||"+cmbGroup+"||"+cmbCust+"||"+org_id);
                   
               //alert(cmbGroup);
               //alert(cmbCust);
               
          if(org_id===null){
            app.showAlert('Please select Organization','Validation Error');
          }else if(cmbGroup ==='' && (cmbCust==='' || cmbCust==="null")){
            app.showAlert('Please Organization Group or Customer.','Validation Error'); 
               $("#selectGroupDiv").show(); 
               $("#sendNotificationDivMsg").hide();
          }else if(cmbGroup ==='0' && (cmbCust==='' || cmbCust==="null")){
            app.showAlert('Please Customer to Send Notification.','Validation Error'); 
                           $("#selectCustomerToSend").show(); 
                           $("#sendNotificationDivMsg").hide();
          }else if(type===''){
            app.showAlert('Please select Notification Type','Validation Error');     
          }else if(titleValue===''){
            app.showAlert('Please select Notification Title','Validation Error');       
          }else if(notificationValue===''){
            app.showAlert('Please select Notification Message','Validation Error');           
          }else{ 

              $("#progressSendNotification").show();

              //var url = "http://54.85.208.215/webservice/notification/sendNotification";
              
             if(dataToSend!==undefined && dataToSend!=="undefined"&& dataToSend!==''){ 
                 
                 //alert("1");
                 
                 if (dataToSend.substring(0,21)==="content://com.android") {
                  photo_split=dataToSend.split("%3A");
                  dataToSend="content://media/external/images/media/"+photo_split[1];
                 }
                        var params = new Object();
                        params.cmbGroup = cmbGroup;  //you can send additional info with the file
                        params.cmbCust = cmbCust;
                        params.type = type;
                        params.title = titleValue;
                        params.message = notificationValue;
                        params.org_id = org_id;
                        params.comment_allow = cmmt_allow;
                         
                        var options = new FileUploadOptions();
                        options.fileKey = "attached";
                        options.fileName = dataToSend.substr(dataToSend.lastIndexOf('/')+1);
              
                        console.log("-------------------------------------------");
                        console.log(options.fileName);
              
                        options.mimeType = "image/jpeg";
                        options.params = params;
                        options.headers = {
                            Connection: "close"
                        }
                        options.chunkedMode = false;
                        var ft = new FileTransfer();

                   
                  
                  
                 /* 
                 var deviceName = app.devicePlatform();             
                      if(deviceName==='Android'){
                           console.log("upload file from Android");
                           window.resolveLocalFileSystemURL(dataToSend, function(fileEntry) {
                                fileEntry.file(function(fileObj) {
                                   var fileName;
                                    fileName = fileObj.fullPath;
                                      console.log("-------------------------------------------");
                                                 console.log(fileName);
                                  options.fileName = fileName.substr(fileName.lastIndexOf('/') + 1);
                                   ft.upload(fileName,encodeURI("http://54.85.208.215/webservice/notification/sendNotification"), win, fail, options, true);
                                });
                           });
                     } else {
                                   console.log("upload file from other device");
                                   ft.upload(dataToSend, 'http://54.85.208.215/webservice/notification/sendNotification', win, fail, options, true);
                     }
                  */
                   
               /*window.resolveLocalFileSystemURI(dataToSend
                   , function(entry){

                            console.log("****************HERE YOU WILL GET THE NAME AND OTHER PROPERTIES***********************");
                            console.log("IMAGE NAME-"+entry.name);
                               console.log("PATH NAME"+entry.fullPath);

                        }, function(e){

                       }); 
                  */ 

               ft.upload(dataToSend, 'http://54.85.208.215/webservice/notification/sendNotification', win, fail, options , true);
                  

             }else{
 
              var notificationData = {"cmbGroup":cmbGroup,"cmbCust":cmbCust ,"type":type,"title":titleValue, "message":notificationValue ,"org_id" : org_id,"comment_allow":cmmt_allow}
                            
             var dataSourceSendNotification = new kendo.data.DataSource({
               transport: {
               read: {
                   url: app.serverUrl()+"notification/sendNotification",
                   type:"POST",
                   dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                   data: notificationData
           	}
           },
           schema: {
               data: function(data)
               {   
                   console.log(data);
               	return [data];
               }
           },
           error: function (e) {
               //apps.hideLoading();
               console.log(e);
               //navigator.notification.alert("Please check your internet connection.",
               //function () { }, "Notification", 'OK');
               
                      if(!app.checkSimulator()){
                                      //window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                      }else{
                                      //app.showAlert("Network problem . Please try again later","Notification");  
                     }
                   
                               if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Notification Send Successfully');   
                                 }else{
                                       app.showAlert("Notification Send Successfully","Notification"); 
                                 }
                                   $("#notificationTitleValue").val('');            
						           $("#notificationDesc").val('');
                                   document.getElementById('comment_allow').checked = false;
                                      var largeImage = document.getElementById('largeImage');
                                      largeImage.src ='';
                                  $("#progressSendNotification").hide();
                             //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
                             app.mobileApp.navigate('#view-all-activities-admin'); 


                 
           }               
          });  
	            
           
           dataSourceSendNotification.fetch(function() {                   
               var sendNotificationDataView = dataSourceSendNotification.data();
						   $.each(sendNotificationDataView, function(i, notification) {
                               console.log(notification.status[0].Msg);
                               
                               if(notification.status[0].Msg==='Notification Sent'){
            
                                 if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Notification Send Successfully');   
                                 }else{
                                       app.showAlert("Notification Send Successfully","Notification"); 
                                 }
            
  
                                   $("#notificationTitleValue").val('');            
						           $("#notificationDesc").val('');
                                   document.getElementById('comment_allow').checked = false;
                                   var largeImage = document.getElementById('largeImage');
                                   largeImage.src ='';
                                   $("#progressSendNotification").hide();

                                   app.mobileApp.navigate('#view-all-activities-admin'); 

                                   //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 



                                   
                                   app.callAdminOrganisationList();
                                   //$("#notificationType").data("kendoComboBox").value("");
             					  //$("#groupforNotification").data("kendoComboBox").value("");
                                   //$("#orgforNotification").data("kendoComboBox").value("");
                                                                                    
                               }else{
                                  app.showAlert(notification.status[0].Msg ,'Notification'); 
                                  $("#progressSendNotification").hide();
  
                               }
                           });               
               
            });                
           }  
          }
            }   
        };
         
         
         function win(r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
          
                                 if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Notification Send Successfully');   
                                 }else{
                                       app.showAlert("Notification Send Successfully","Notification"); 
                                 }
              
                                   $("#notificationTitleValue").val('');            
						           $("#notificationDesc").val('');
                                   document.getElementById('comment_allow').checked = false;
                                   var largeImage = document.getElementById('largeImage');
                                   largeImage.src ='';
                                   $("#progressSendNotification").hide();

                                     app.mobileApp.navigate('#view-all-activities-admin');

                                   //app.mobileApp.navigate('views/adminGetOrganisation.html?account_Id='+account_Id); 
         }
         
         
         function fail(error) {
             console.log("An error has occurred: Code = " + error.code);
             console.log("upload error source " + error.source);
             console.log("upload error target " + error.target);

             $("#progressSendNotification").hide();
 
                               if(!app.checkSimulator()){
                                      window.plugins.toast.showShortBottom('Network problem . Please try again later');   
                               }else{
                                      app.showAlert("Network problem . Please try again later","Notification");  
                               }
    
         }
         
         
         var sendNotificationOrg = function(e){
             console.log(e.data.org_id);
             app.mobileApp.pane.loader.show();            
             var org = e.data.org_id;       

             localStorage.setItem("SELECTED_ORG",org);
             
             var comboGroupListDataSource = new kendo.data.DataSource({
             transport: {
               read: {
                   url: app.serverUrl()+"group/index/"+org,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
              	}
              },
       	 schema: {               
                  data: function(data)
  	             {	console.log(data);
                        var groupDataShow = [];
                                 $.each(data, function(i, groupValue) {
                                     console.log(groupValue);

                                     console.log(groupValue[0].Msg);
                                     
                                     if(groupValue[0].Msg==='No Group list'){
                                         $("#selectGroupDiv").hide();
                                         $("#selectOrgDiv").hide();
                                            noGroup=1;        
                                         
                                         localStorage.setItem("SELECTED_GROUP",0); 
                                         escapeGroupGoCustClick();
                                     }else{
                                         var orgLength = groupValue[0].groupData.length;

                                     for(var j=0;j<orgLength;j++){

                                         groupDataShow.push({
                                         group_desc: groupValue[0].groupData[j].group_desc,
                                         group_name: groupValue[0].groupData[j].group_name,
                                         group_status:groupValue[0].groupData[j].group_status,
                                         org_id:groupValue[0].groupData[j].org_id,
                                         pid:groupValue[0].groupData[j].pid

                                       });
                                     }
                                          $("#selectOrgDiv").hide();
                                          $("#selectGroupDiv").show();

                                   }
                                     
                                 });
                       
                       console.log(groupDataShow);
                       return groupDataShow;                       
	               }
            },
            error: function (e) {
               //apps.hideLoading();
               console.log(e);
               //navigator.notification.alert("Please check your internet connection.",
               //function () { }, "Notification", 'OK');
                
                   var showNotiTypes=[
                      { message: "Your request has not been processed due to a connection error . Please try again"}
                    ];
                        
                    var dataSource = new kendo.data.DataSource({
                          data: showNotiTypes
                    });
                    
                    $("#group-Name-listview").kendoMobileListView({
  		          template: kendo.template($("#errorTemplate").html()),
                    dataSource: dataSource  
     		       });
           },       
             sort: { field: 'add', dir: 'desc' }    	     
          });
                       
                          
             $("#group-Name-listview").kendoListView({
  		    template: kendo.template($("#groupNameTemplate").html()),    		
     		 dataSource: comboGroupListDataSource
              //pullToRefresh: true
		     });
             
             //$("#selectGroupDiv").hide();

             app.mobileApp.pane.loader.hide();
             
             
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
                   url: app.serverUrl()+"customer/getOrgCustomer/"+org,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                  
              	}
              },
       	 schema: {
                 model: UserModel,
                 data: function(data)
  	             {
                       console.log(data);                      
                        var groupDataShowCustomer = [];
                                 $.each(data, function(i, groupValue) {
									console.log(groupValue);
                                     
                                 $.each(groupValue, function(i, orgVal) {
                                    console.log(orgVal);

                   	             if(orgVal.Msg ==='No Customer in this organisation'){     
                                      noCustomer=1;
                                      escapeGroupClick();

                                    }else if(orgVal.Msg==='Success'){
                                        console.log(orgVal.allCustomer.length);  
                                        for(var i=0;i<orgVal.allCustomer.length;i++){
                                            groupDataShowCustomer.push({
                                                 mobile: orgVal.allCustomer[i].uacc_username,
		                                         first_name: orgVal.allCustomer[i].user_fname,
        		                                 email:orgVal.allCustomer[i].user_email,  
                		                         last_name : orgVal.allCustomer[i].user_lname,
                        		                 customerID:orgVal.allCustomer[i].custID,
                                		         account_id:orgVal.allCustomer[i].account_id,
                                                 orgID:orgVal.allCustomer[i].orgID
                                            });
                                        }     
                                    } 
    							  });
                               });
                       
		                         console.log(groupDataShowCustomer);
                                 return groupDataShowCustomer;
	               }

            },
	            error: function (e) {
        	       console.log(e);
                    
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               
            	   //navigator.notification.alert("Please check your internet connection.",
               	//function () { }, "Notification", 'OK');                    
           	}
	        
    	    });         
                     
            /*MemberDataSource.fetch(function() {
                
 		   });*/
	                     
    	    $("#customer-Name-listview").kendoListView({
        		dataSource: MemberDataSource,
       		 template: kendo.template($("#customerNameTemplate").html()),
                schema: {
           		model:  UserModel
				}			
			});
                                      
         };
         
         
         var skipToSeletType = function(){
           $("#selectCustomerToSend").hide();
          
            escapeGroupClick();
        };

         
          var NextToSeletType = function(){
           $("#selectCustomerToSend").hide();
          
            var customer = [];
		    
            $(':checkbox:checked').each(function(i){
          	  customer[i] = $(this).val();
        	});
            
            customer = String(customer);        
            console.log(customer);       
            localStorage.setItem("SELECTED_CUSTOMER",customer);  
                 escapeGroupClick();
        };
         
         
          var skipToCustomerType = function(){
           $("#selectGroupDiv").hide();
           $("#selectCustomerToSend").show();
          };

         
         
           var NextToCustomerType = function(){
            $("#selectGroupDiv").hide();
               
            var group = [];
		    
            $(':checkbox:checked').each(function(i){
          	  group[i] = $(this).val();
        	});
            
            group = String(group);        
            console.log(group);      
            localStorage.setItem("SELECTED_GROUP",group); 
            $("#selectCustomerToSend").show();                               
        };
        
         
         var sendNotificationGroup = function(e){
             console.log(e.data.pid);
             var group = e.data.pid;
             localStorage.setItem("SELECTED_GROUP",group);
             app.mobileApp.pane.loader.show();              
              $("#selectGroupDiv").hide();
             //$("#selectTypeDiv").show();
              $("#selectCustomerToSend").show();
             app.mobileApp.pane.loader.hide();              
         };
                  
         var escapeGroupClick = function(){                 
             app.mobileApp.pane.loader.show(); 
             $("#selectGroupDiv").hide();
             $("#selectCustomerToSend").hide();
             
            //alert(noGroup +"||"+ noCustomer);
             
             if(noGroup===1 && noCustomer===1){

                 if(!app.checkSimulator()){
                 
                     window.plugins.toast.showShortBottom('No Customer and Group To Send Notification');   
                     
                 }else{
                 
                     app.showAlert("No Customer and Group To Send Notification","Notification");  
                     
                 }

                  app.mobileApp.navigate('#view-all-activities-admin'); 

             }else{
                 
                 $("#selectTypeDiv").show();

             }


             
             $(".km-scroll-container").css("-webkit-transform", "");

             app.mobileApp.pane.loader.hide();    
         };
         
         var escapeGroupGoCustClick = function(){                 
             app.mobileApp.pane.loader.show(); 
             $("#selectGroupDiv").hide();
             $("#selectCustomerToSend").show();
             app.mobileApp.pane.loader.hide();    
         };
         

         var groupCheckData = function(){
            $(':checkbox:checked').each(function(i){
          	  groupChecked[i] = $(this).val();
        	});
            
            groupChecked = String(groupChecked);        
            console.log(groupChecked);
         };
         
         
          var getPhoto =function() {
              //alert('123');
              // Retrieve image file location from specified source
              
              navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
                    correctOrientation: true,
                    destinationType : navigator.camera.DestinationType.DATA_URI,
                    sourceType : navigator.camera.PictureSourceType.SAVEDPHOTOALBUM
                    });
              
              
                  /*navigator.gallery.getPicture(onGallerySuccess, onFail, {
		                quality : 100,
		                targetWidth : 800,
		                targetHeight : 600
	          	});*/
              
              
          }
                  
          function onPhotoURISuccess(imageURI) {
                  // Uncomment to view the image file URI
                  // console.log(imageURI);
                  // Get image handle
                  var largeImage = document.getElementById('largeImage');

                  // Unhide image elements
                  //
                  largeImage.style.display = 'block';

                  // Show the captured photo
                  // The inline CSS rules are used to resize the image
                  //
                  largeImage.src = imageURI;
                  dataToSend = imageURI;
              
                  $("#removeAttachment").show();
              
             // alert(imageURI);
              console.log(imageURI);
              //dataToSend = imageURI;
          }
         
          function onFail(message) {
              console.log('Failed because: ' + message);
          }
         
         var removeImage = function(){
            var largeImage = document.getElementById('largeImage');
            largeImage.src ='';
            $("#removeAttachment").hide(); 
         }

    	 return {
        	   init: init,
           	show: show,
               beforeShow:beforeShow,
               skipToSeletType:skipToSeletType,
               sendNotificationOrg:sendNotificationOrg,
               sendNotificationGroup:sendNotificationGroup,
               escapeGroupClick:escapeGroupClick,
               skipToCustomerType:skipToCustomerType,
               NextToCustomerType:NextToCustomerType,
               NextToSeletType:NextToSeletType,
               groupCheckData:groupCheckData,
               onChangeNotiGroup:onChangeNotiGroup,
               getPhoto:getPhoto,
               getPhotoVal:getPhotoVal,
               removeImage:removeImage,
               sendNotificationMessage:sendNotificationMessage
         };
           
    }());
        
    return sendNotificationViewModel;
    
}());