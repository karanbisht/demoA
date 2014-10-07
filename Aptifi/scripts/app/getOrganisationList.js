var app = app || {};

app.OragnisationList = (function () {
    'use strict'
 //var el = new Everlive('wKkFz2wbqFe4Gj0s');   
 
 var activitiesDataSource;   
 var account_Id;
 var userType;
 var newUserType;   
 var num1=0,num2=0,num3=0;
 var groupDataShow = [];   
      
        var organisationViewModel = (function () {
            
        var init = function(){
        
        };
                    
            
        var getDataOrg = function(tx){
            	var query = "SELECT * FROM JOINED_ORG where role='C'";
				app.selectQuery(tx, query, getDataSuccess);
        };    
            
         var getDataOrgDB=[];
         var getDataCountDB=[];
         var org_id_DB;
         var lastMessageShow;
        
        function getDataSuccess(tx, results) {                        
            console.log('before Show');
            console.log(results.rows);
            $('#organisation-listview').data('kendoMobileListView').refresh(); 
            getDataOrgDB=[];
            getDataCountDB=[];
            groupDataShow=[];
            
			var count = results.rows.length;                    
            console.log("DBCount"+count);
			
            if (count !== 0) {                
            	for(var i =0 ; i<count ; i++){   
                    
                    console.log('functionRun'+i);					
                    org_id_DB = results.rows.item(i).org_id;                  
                    console.log(org_id_DB);
                    //var db = app.getDb();
        		    //db.transaction(getLastNotification, app.errorCB, app.successCB);                     

                    var bagCount = results.rows.item(i).bagCount;                   
                    getDataOrgDB.push(org_id_DB);
                    getDataCountDB.push(bagCount);
                    
                    //alert(lastMessageShow);
                    var countValue;
                    var bagCountValue;
                    
                                    if(results.rows.item(i).count==='' || results.rows.item(i).count==='null'){
                                        countValue=0;
                                    }else{
                                        countValue = results.rows.item(i).count;
                                    }
                    
                                    if(results.rows.item(i).bagCount==='' || results.rows.item(i).bagCount==='null'){
                                        bagCountValue=0;
                                    }else{
                                        bagCountValue = results.rows.item(i).bagCount;
                                    }
                    
                    
                    
                        var lastNotifi;
                            if(results.rows.item(i).lastNoti===null || results.rows.item(i).lastNoti==='null'){
                                 lastNotifi='';   
                            }else{
                                lastNotifi=results.rows.item(i).lastNoti;
                            }
                                    var countData= countValue - bagCountValue;
                       
                                        groupDataShow.push({
												 orgName: results.rows.item(i).org_name,
        		                                 orgDesc: lastNotifi,
                                                 organisationID:results.rows.item(i).org_id,
                                                 org_logo:results.rows.item(i).imageSource,
                                                 imageSource:'http://54.85.208.215/assets/upload_logo/'+results.rows.item(i).imageSource,
		                                         bagCount : bagCountValue,
                                                 countData:countData,
                                                 count : countValue
                                         });
        	    }    
            }else{
                  groupDataShow.push({
                                         orgName: 'Welcome to Aptifi',
                                         orgDesc: 'You are not a customer of any organisation',
                                         organisationID:'0',
                                         imageSource:'',
                                         org_logo :null,  
                                         bagCount : 0 ,
                                         bagValToStore:0
    	                               });      
            }
         };       

            
          var getLastNotification = function(tx){
                console.log('orgId'+org_id_DB);
            	var query = 'SELECT message FROM ORG_NOTIFICATION where org_id ='+org_id_DB;
				app.selectQuery(tx, query, getLastNotificationSuccess);
          };      
                
            
         function getLastNotificationSuccess(tx, results) {             
			var count = results.rows.length;
            console.log('count'+count);
            //bagValueForDB=count;             
			if (count !== 0) {                
            	for(var i =count-1 ; i<count ; i++){                    
					lastMessageShow = results.rows.item(i).message;
        	    }    
            }else{
                lastMessageShow='';               
            }
                console.log('lastMessage'+lastMessageShow);
         };    
            

         var show = function(e){                     
                          
             $('#organisation-listview').data('kendoMobileListView').refresh();
             var scroller = e.view.scroller;
             scroller.reset();
             
            //window.plugins.toast.showShortBottom('Hello TESTING PLUGIN');             
            //app.mobileApp.pane.loader.show();
             
            $("#progress").show();
            $("#organisationListView").hide();
             
            var tabStrip = $("#upperMainTab").data("kendoMobileTabStrip");
	   	 tabStrip.switchTo("#organisationNotiList");

           //console.log(getDataOrgDB);
           //console.log(getDataCountDB);  
             
           app.MenuPage=true;
           app.userPosition=false;

             
           var from= e.view.params.from; 
             
             if(from==='Login'){
              account_Id = e.view.params.account_Id;
              userType= e.view.params.userType;
              newUserType = userType.split(',');   
                 
              //console.log("karan"+newUserType);  
              //console.log(newUserType.length);
                 
              localStorage.setItem("ACCOUNT_ID",account_Id);
              localStorage.setItem("USERTYPE",userType);                 
             }else{                 
               account_Id = localStorage.getItem("ACCOUNT_ID");
               userType = localStorage.getItem("USERTYPE");
               newUserType = userType.split(',');   
             }
			
             
             console.log(account_Id);
             console.log(userType);
              
             
             for(var i=0;i<newUserType.length;i++){
                 console.log(newUserType[i]);
                 if(newUserType[i]==='C'){
                  num1=1;   
                 }else if(newUserType[i]==='O'){
                  num2=3;   
                 }else{
                  num3=5;   
                 }
             }
                          
            if(num1===1 && num2===0 && num3===0){
                localStorage.setItem("ShowMore",1);
                $("#goToAdmin").hide();
            }else if(num2===3 && num1===0 && num3===0){
                localStorage.setItem("ShowMore",0);
                $("#moreOption").hide();  
            }else if(num1===1 && num2===3){
                 localStorage.setItem("ShowMore",0);
                 $("#moreOption").hide();
            }else if(num1===1){
                 localStorage.setItem("ShowMore",1);
                 $("#goToAdmin").hide();
            }
                              
        };
            
                        
            
            var showLiveData = function(){
                
             console.log('alertvalue');
             console.log(groupDataShow);
                
             var organisationListDataSource = new kendo.data.DataSource({
                  data: groupDataShow
             });           

                
            $("#organisation-listview").kendoMobileListView({
  		    template: kendo.template($("#organisationTemplate").html()),    		
     		 dataSource: organisationListDataSource,
              pullToRefresh: true
             });
                
              $('#organisation-listview').data('kendoMobileListView').refresh();
                
              app.mobileApp.pane.loader.hide();
                
                if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }   
                 
            };
                                                        
                                     function fileExist( file ) {
                                            var status;    
                                            window.resolveLocalFileSystemURI('file://' + window.rootFS.fullPath + '/' + file,
                                            function(){ status = true; },
                                            function(){ status = false; }
                                            );
                                            return status;
                                     }

            
          /* var imagePathExist = function(){
                   return 1;    
            };

            var imagePathNotExist = function(){
            	return 2;    
            };
          */  
            
            var storeImageSdcard = function(imageName , orgId){
                var imgData='http://54.85.208.215/assets/upload_logo/'+imageName;               
                var imgPathData = app.getfbValue();    
	            var fp = imgPathData+"/Aptifi/"+'Aptifi_OrgLogo_'+orgId+'.jpg';
            	
               var fileTransfer = new FileTransfer();    
               fileTransfer.download(imgData,fp,  
        			function(entry) {
                        app.mobileApp.pane.loader.hide();
	        		},
    
    		        function(error) {
                        app.mobileApp.pane.loader.hide();
	        		}
	    		);                        
            };
            
        var afterShow = function(){
            
           var db = app.getDb();
		   db.transaction(getDataOrg, app.errorCB, showLiveData);   

            
           //$('#organisation-listview').data('kendoMobileListView').refresh();
           //var db = app.getDb();
		   //db.transaction(insertOrgImage, app.errorCB, app.successCB);  
        }    
        
        /*
         var insertOrgImage = function(tx){
             console.log(groupDataShow.length);
             
             for(var i=0;i<groupDataShow.length;i++){     
                 var query = 'UPDATE JOINED_ORG SET imageSource=' + groupDataShow[i].imageSource + ' WHERE org_id=' + groupDataShow[i].organisationID;
				 app.updateQuery(tx, query);
             }
         };   
         */   
        
        /*var offlineQueryDB = function(tx){
            var query = 'SELECT * FROM GetNotification';
			app.selectQuery(tx, query, offlineTestQuerySuccess);
        };
        
        var offlineTestQuerySuccess = function(tx, results) {
            $("#activities-listview").empty();
			var count = results.rows.length;
			if (count !== 0) {
				for (var i = 0; i < count; i++) {
					var Title = results.rows.item(i).Title;
					var Message = results.rows.item(i).Message;
					var CreatedAt = results.rows.item(i).CreatedAt; 
                    var template;
                    
                    //if(i===0){
                      //  template = kendo.template($("#activityTemplate").html());
       			//	 $("#activities-listview").html(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
                    //    $("#activities-listview").on('click', offlineActivitySelected);
       			 //}else{

	                template = kendo.template($("#activityTemplate").html());
					$("#activities-listview").append(template({Title: Title, CreatedAtFormatted: function (){return app.helper.formatDate(CreatedAt);} ,Message: Message}));
					kendo.bind($('#activityTemplate'), activitiesDataSource);
                    //}
                 }
       		}else{
                   	$("#activities-listview").html("You are Currently Offline and data not available in local storage");
               }
        };
                 
        var CreatedAtFormatted = function(value){
            return app.helper.formatDate(value);
        };

		var offlineQueryDBSuccess = function(){
            console.log("Query Success");
        };
        */
    
        var organisationSelected = function (e) {
            app.mobileApp.pane.loader.show();
            console.log(e.data);
            var organisationID=e.data.organisationID;
            var bagCount =e.data.count;
            //uid=' + e.data.uid
            
			app.MenuPage=false;	
            app.mobileApp.navigate('views/activitiesView.html?organisationID=' + organisationID +'&account_Id='+account_Id+'&bagCount='+bagCount+'&orgName='+e.data.orgName);
        };
            
       
        var groupSelected = function (e) {
            console.log("karan Bisht"+e);
			app.MenuPage=false;	
            app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        };
         
        var offlineActivitySelected = function (i) {
            console.log(i);
			app.MenuPage=false;	
            console.log("click");
            //app.mobileApp.navigate('views/activityView.html?uid=' + e.data.uid);
        };
        
        
        var notificationSelected = function (e) {
			app.MenuPage=false;	
            //alert(e.data.uid);
            app.mobileApp.navigate('views/notificationView.html?uid=' + e.data.uid);
        };

        // Navigate to app home
        var navigateHome = function () {
            app.MenuPage=false;
            app.mobileApp.navigate('#welcome');
        };
        

        
        var replyUser = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/userReplyView.html');                         
        };
        
        var manageGroup =function(){
            app.MenuPage=false;	
            //app.mobileApp.pane.loader.show();
            app.mobileApp.navigate('views/groupListPage.html');           
        };
        
        
        var sendNotification = function(){
            app.MenuPage=false;
            //document.location.href="#sendNotificationDiv";
            app.mobileApp.navigate('views/sendNotification.html');           
        };
        
        var refreshButton = function(){
            
        };
                                 
        var info = function(){
            
        };
        
        var orgShow = function(){
           app.MenuPage=false;
		   $("#organisation-listview1").html("");
           var showMore = localStorage.getItem("ShowMore");
             if(showMore!==1){
               $("#goToAdmin").hide();             
             }else{
               $("#moreOption").hide();  
             }
                        
         var db = app.getDb();
		 db.transaction(getOrgInfoDB, app.errorCB, getOrgDBSuccess);       
        };                        
                     
        function getOrgInfoDB(tx) {                    
            var query = 'SELECT * FROM JOINED_ORG';
			app.selectQuery(tx, query, orgDataForOrgSuccess);
		};

		var orgDbData = [];
            
        function orgDataForOrgSuccess(tx, results) {
            var tempArray= [];
            orgDbData = [];
			var count = results.rows.length;
            console.log('count'+count);
			if (count !== 0) {
                for(var i=0;i<count;i++){
                     var pos = $.inArray(results.rows.item(i).org_id, tempArray);
                     
                     console.log(pos);
					if (pos === -1) {
						 tempArray.push(results.rows.item(i).org_id); 

                        orgDbData.push({
						 org_name: results.rows.item(i).org_name,
        		         org_id: results.rows.item(i).org_id,
                         role:results.rows.item(i).role,
                         imgData:results.rows.item(i).imageSource,   
                         imageSourceOrg:'http://54.85.208.215/assets/upload_logo/'+results.rows.item(i).imageSource,   
                         orgDesc:results.rows.item(i).orgDesc,                      
                         joinDate:results.rows.item(i).joinedDate                   
                       });         
                    }
                }
			}
		};
           

	function getOrgDBSuccess() {
			app.mobileApp.pane.loader.hide();
            //console.log(orgDbData);
        
             $("#organisation-listview1").kendoMobileListView({
  		    template: kendo.template($("#orgTemplate").html()),    		
     		 dataSource: orgDbData        			 
		     });
        
            $('#organisation-listview1').data('kendoMobileListView').refresh();    		    			
                
            if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }
		};
                
            
            
        var orgMoreInfoSelected =function(e){
            console.log(e.data);
            var orgID=e.data.org_id;
            var orgName=e.data.org_name;
            var orgDesc=e.data.orgDesc;
            var role = e.data.role;
            var joinDate = e.data.joinDate;
            //alert(joinDate);
			app.MenuPage=false;	
            app.mobileApp.navigate('views/userOrgManage.html?orgID=' + orgID +'&orgName='+orgName+'&orgDesc='+orgDesc+'&account_Id='+account_Id+'&role='+role+'&joinDate='+joinDate);
        };    
            
           
        var orgManageID;
            
        var showOrgInfoPage = function(e){
           orgManageID = e.view.params.orgID;
           var orgName = e.view.params.orgName; 
           var orgDesc = e.view.params.orgDesc;
           var account_Id = e.view.params.account_Id;
           var role = e.view.params.role;                 
           var joinDate = e.view.params.joinDate;
            
            
            $("#orgDescList").css("background-color", "#ffffff");
            $("#manageOrgDesc").css("background-color", "#ffffff");
			$("#orgDescList").css("z-index", "999");
            $("#manageOrgDesc").css("z-index", "999");
            
            
            if(orgDesc===''){
                orgDesc="Description Not Available";
             }
            
            //alert(orgDesc+"||"+joinDate);
            if(role==='C'){
                $("#manageOrgFooter").show();
            }else{
                $("#manageOrgFooter").hide();
            }
            
           $("#orgJoinData").html(joinDate); 
           $("#navBarOrgHeader").html(orgName);        
           $("#OrgDescData").html(orgDesc); 
                   
   
            if(!app.checkConnection()){
                  if(!app.checkSimulator()){
                     window.plugins.toast.showLongBottom('Network unavailable . Please try again later');  
                  }else{
                    app.showAlert('Network unavailable . Please try again later' , 'Offline');  
                  } 
               }
        }    
        
        
         var unsubscribeOrg = function(){                         
             
           var delOrgfromServerDB = new kendo.data.DataSource({
            transport: {
               read: {
                   url: "http://54.85.208.215/webservice/customer/unsubscribe/"+orgManageID+"/"+account_Id,
                   type:"POST",
                   dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                 
              	}
              },
       	 schema: {                                
                 data: function(data)
  	             {
                       console.log(data);
               
                                  if(data.status[0].Msg==='Sucess'){                                                      
                                        var db = app.getDb();
                                        db.transaction(delOrgRelData, delOrgError,delOrgSuccess);                          
                                     } 
                                 
                       
		                        // console.log(groupDataShow);
                                   return groupDataShow;
                   }                       
            },
	            error: function (e) {
        	       console.log(e);
           	}
	        
    	    });         
             
           delOrgfromServerDB.read();  
         }
            
            
            
              function delOrgRelData(tx) {
                
                var query = "DELETE FROM JOINED_ORG where org_id="+orgManageID;
        	    app.deleteQuery(tx, query);

            	var query = "DELETE FROM ORG_NOTIFICATION where org_id="+orgManageID;
	            app.deleteQuery(tx, query);
                               
            }
            

            function delOrgSuccess() {
                app.showAlert('Successfully Unsubscribe Organisation','Unsubscribe');
                app.callUserLogin();
            }

            function delOrgError(err) {
	            console.log(err);
            }
            
            
            
            
        var onAdminComboChange = function(){
       		  var selectData = $("#groupSelectAdmin").data("kendoComboBox");    
           	  var groupSelected = selectData.value();
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   if(groupSelected==='All'){
    			             app.Activities.activities.filter({
							                	
        	    								});
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: groupSelected
        	    								});
                                }

            
                      kendo.bind($('#activityTemplate'), activitiesDataSource);                              
			};
        
        
	    var onComboChange = function(){
                 //$("#activities-listview").empty();
            	 //var activities;
       		  var selectData = $("#groupSelect").data("kendoComboBox");    
           	  var groupSelected = selectData.value();
    		              //var query = new Everlive.Query().where().equal('Group',groupSelected);
                  		//notificationModel();
        
            			   if(groupSelected==='All'){
    			              app.Activities.activities.filter({
							                	
                                 
        	    			  });
                           }else{		
                                                app.Activities.activities.filter({
							                	field: 'Group',
                								operator: 'eq',
                								value: groupSelected
        	    								});
                                }

                      kendo.bind($('#activityTemplate'), activitiesDataSource);
                                    	         
   		 //var $notificationContainer = $('#activities-listview');
            //$notificationContainer.empty();
           // var notificationModel1 = (function () { 

             /*   var notiCModel = {
            				id: 'Id',
            				fields: {
				                CreatedAt: {
                					    field: 'CreatedAt',
        					            defaultValue: new Date()
		                					},
                                   Message: {
					                    field: 'Message',
                    					defaultValue: ''
               							 },
				                   Title :{
                   					 field: 'Title',
					                    defaultValue: ''  
                							}
            					    },
	            					CreatedAtFormatted: function () {
        	        						return app.helper.formatDate(this.get('CreatedAt'));
					    	        }
	        			};
                
					
                
			   if(groupSelected==='All'){
		                dataSource = new kendo.data.DataSource({
                                            type: 'everlive',
        						            schema: {
          									      model: notiCModel
        										    },

									            transport: {
								                // Required by Backend Services
								                typeName: 'GetNotification'
    									        },
            									                pageSize: '100',
                    					    				    page: 1,
											    				serverPaging: true,
                            
                                            change: function (e) {
									                if (e.items && e.items.length > 0) {
                    										$('#no-activities-span').hide();
									                } else {
										                    $('#no-activities-span').show();
                									}
           									 }    
   						  			  });
                  
               }else{
	            	        dataSource = new kendo.data.DataSource({
                                            type: 'everlive',
                                            filter: { field: "Group", value:groupSelected },
 									       schema: {
          									      model: notiCModel
        										    },

									        transport: {
									            typeName: 'GetNotification'
    									    },
												                pageSize: '100',
                                								page: 1,
															    serverPaging: true,
                                            change: function (e) {
									                if (e.items && e.items.length > 0) {
                    										$('#no-activities-span').hide();
									                } else {
										                    $('#no-activities-span').show();
                									}
           									 }    
   						  			  });
					}               
                
               	 console.log(dataSource);
                    $("#activities-listview").kendoMobileListView({
                	style: "inset",    
           		 dataSource: dataSource,
	                template: kendo.template($("#activityTemplate").html()),
            		endlessScroll: true,
            		scrollTreshold: 30,
            			click: function (e) {
	
                        }
        			});
                	$("#activities-listview").data("kendoMobileListView").dataSource.fetch();
                    $("#activities-listview").data("kendoMobileListView").refresh();
             */   
				//	}());             

/*                $("#activities-listview").kendoMobileListView({
				 	dataSource: dataSource,
	                 template: kendo.template($("#activityTemplate").html()),
				 	//template: $("#activityTemplate").html(),
     				endlessScroll: true,
					 scrollTreshold: 30
    			});
*/                
                
               // if ($("#activities-listview").data("kendoMobileListView") == undefined) {
     	
				/*}else {
                                        console.log("hello2");
    				$("#activities-listview").data("kendoMobileListView").dataSource = dataSource;
    				$("#activities-listview").data("kendoMobileListView").refresh();
				}*/
                
            };
        
    
           
         var userProfileInt = function () {       
      	    app.MenuPage=false; 
         };
        
        var userProfileShow = function(){
            app.mobileApp.pane.loader.show();
            app.MenuPage=false;    
            
   		var showMore = localStorage.getItem("ShowMore");
             if(showMore!==1){
               $("#goToAdmin").hide();             
             }else{
               $("#moreOption").hide();  
             }

            var db = app.getDb();
			db.transaction(getProfileInfoDB, app.errorCB, getProfileDBSuccess);
         };
            
            
         function getProfileInfoDB(tx) {
				var query = 'SELECT first_name , last_name , email , mobile FROM PROFILE_INFO';
				app.selectQuery(tx, query, profileDataSuccess);
             
                var query = 'SELECT org_id , org_name , role FROM JOINED_ORG';
				app.selectQuery(tx, query, orgDataSuccess);
			}


            function profileDataSuccess(tx, results) {
				var count = results.rows.length;
			if (count !== 0) {
			var fname = results.rows.item(0).first_name;
			var lname = results.rows.item(0).last_name;
			var email = results.rows.item(0).email;
			var mobile = results.rows.item(0).mobile;
        
            $("#userEmailId").html(email); 
            $("#userMobileNo").html(mobile);
            $("#userlname").html(lname);
            $("#userfname").html(fname); 
		}
			}
            
	function orgDataSuccess(tx, results) {    
        	var count = results.rows.length;      
        	var tempArray=[];
				if (count !== 0) {
                    
	             document.getElementById("orgData").innerHTML = "";
                    
        			for(var x=0; x < count;x++){
                    var pos = $.inArray(results.rows.item(x).org_id, tempArray);
                     console.log(pos);
					if (pos === -1) {
						tempArray.push(results.rows.item(x).org_id);								                    
                		document.getElementById("orgData").innerHTML += '<ul><li>' + results.rows.item(x).org_name + '</li></ul>' 
                        }
            		}             
                }
        
      }
            


	function getProfileDBSuccess() {
		app.mobileApp.pane.loader.hide();
	}
            
            
            
           function OnImageLoad(evt) {

            var img = evt.currentTarget;

            // what's the size of this image and it's parent
            var w = $(img).width();
            var h = $(img).height();
            var tw = $(img).parent().width();
            var th = $(img).parent().height();

            // compute the new size and offsets
            var result = app.ScaleImage(w, h, tw, th, false);

            // adjust the image coordinates and size
            img.width = result.width;
            img.height = result.height;
            $(img).css("left", result.targetleft);
            $(img).css("top", result.targettop);
           
          };
            
            
                     
        var callOrganisationLogin = function(){
          alert('click');  
          app.MenuPage=false;	
          //window.location.href = "views/organisationLogin.html"; 
          console.log(account_Id);
          app.mobileApp.navigate('views/organisationLogin.html?account_Id='+account_Id);      
        };
        
    	         
        // Logout user
        var logout = function () {

        navigator.notification.confirm('Are you sure to Logout ?', function (checkLogout) {
            	if (checkLogout === true || checkLogout === 1) {                    
                   app.mobileApp.pane.loader.show();    
                   setTimeout(function() {
                       var db = app.getDb();
                       db.transaction(updateLoginStatus, updateLoginStatusError,updateLoginStatusSuccess);

                   }, 100);
            	}
        	}, 'Logout', ['OK', 'Cancel']);
        };
            
            
            
            function updateLoginStatus(tx) {
                
                var query = "DELETE FROM PROFILE_INFO";
        	    app.deleteQuery(tx, query);

            	var query = "DELETE FROM JOINED_ORG";
	            app.deleteQuery(tx, query);

            	var query = "DELETE FROM ORG_NOTIFICATION";
	            app.deleteQuery(tx, query);
                
                var query = "DELETE FROM ORG_NOTI_COMMENT";
	            app.deleteQuery(tx, query);
                                
	            var query = 'UPDATE PROFILE_INFO SET login_status=0';
            	app.updateQuery(tx, query);
            }
            

            function updateLoginStatusSuccess() {
                  window.location.href = "index.html";
            }

            function updateLoginStatusError(err) {
	            console.log(err);
            }

            
                    var inAppBrowser= function() {
                        app.MenuPage=false;
                        window.open('http://www.sakshay.in','_blank');
                    };
                        
                    var makeCall = function(){
                        app.MenuPage=false;
                        document.location.href = 'tel:+91-971-781-8898';
                    };
       
                    var about = function(){
                         app.MenuPage=false;
                         document.location.href="#infoDiv";
                    };
    
                    var setting = function(){
                         app.MenuPage=false;
                         document.location.href="#settingDiv";
                    };       


        return {
            //activities: activitiesModel.activities,
            //groupData:GroupsModel.groupData,
            //userData:UsersModel.userData,
            organisationSelected: organisationSelected,
            orgMoreInfoSelected:orgMoreInfoSelected,
            groupSelected:groupSelected,
            afterShow:afterShow,
            showOrgInfoPage:showOrgInfoPage,
            notificationSelected:notificationSelected,
            //CreatedAtFormatted:CreatedAtFormatted,          
                   
            manageGroup:manageGroup,
            about:about,
            setting:setting,
            inAppBrowser:inAppBrowser,  
            makeCall:makeCall,
            OnImageLoad:OnImageLoad,
            replyUser:replyUser,
            userProfileInt:userProfileInt,
            sendNotification:sendNotification,
            userProfileShow:userProfileShow,
	        orgShow:orgShow,
            info:info,
            init:init,
            show:show,
            callOrganisationLogin:callOrganisationLogin,
            refreshButton:refreshButton,
            unsubscribeOrg:unsubscribeOrg,
            logout: logout
        };

    }());

    return organisationViewModel;

}());
