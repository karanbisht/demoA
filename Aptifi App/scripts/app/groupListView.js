var app = app || {};

app.GroupList = (function () {

 var el = new Everlive('wKkFz2wbqFe4Gj0s');  
 var groupListDataSource;   

   var GroupsListModel = (function () {                 
       var GroupListModel = {
            id: 'Id',
            fields: {
                CreatedAt: {
                    field: 'CreatedAt',
                    defaultValue: new Date()
                },
                Name: {
                    field: 'Name',
                    defaultValue: null
                }
            },
	            CreatedAtFormatted: function () {
        	        return app.helper.formatDate(this.get('CreatedAt'));
    	        }
	       };        
        
	        groupListDataSource = new kendo.data.DataSource({
            type: 'everlive',
	           schema: {
                model: GroupListModel
            },

            transport: {
                typeName: 'Group'
            },
               
             sort: { field: 'CreatedAt', dir: 'desc' }    
	        });
               
	        return {
            	groupListData: groupListDataSource
        	};
	}());
    
	    	var activityListViewModel = (function () {
    	     
     		 var init = function () {
				  //console.log('helloasda');
                  $('#newGroup').val('');
              };
                
              var show = function(){
				$('#newGroup').val('');
              };  
                
               var groupSelected = function (e) {
            		console.log("karan Bisht"+e);
					app.MenuPage=false;	
            		app.mobileApp.navigate('views/groupDetailView.html?uid=' + e.data.uid);
        	 };
                
          var addGroup = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/addGroup.html');    
        };
        
        var deleteGroup = function(){
            app.MenuPage=false;	
            app.mobileApp.navigate('views/deleteGroup.html');    
        };
                
         
        var addGroupFunc = function(){            
            var newGroupValue = $("#newGroup").val();             
			var data = el.data('Group');
            data.create({ 'Name' : newGroupValue },
    
            function(data){
        		//alert(JSON.stringify(data));
                app.showAlert("Group Added Successfully","Notification");
                //$("#group-listview").data("kendoListView").groupListDataSource.read();
                app.mobileApp.navigate('views/groupListPage.html');
    		},
    
            function(error){
                    app.showAlert("Please try again later","Notification");
                //alert(JSON.stringify(error));
    		});
  
        };
 
        
         var deleteGroupFunc = function(){
            //var data = $('input:checkbox:checked').val();
			var val = [];
		        $(':checkbox:checked').each(function(i){
          	  val[i] = $(this).val();
        	});
            
            var arrLength=val.length;
            var delVal =0;
            
          $.each(val,function(i,dataValue){  
            var data = el.data('Group');
			data.destroySingle({ Id: dataValue },    		
	        
              function(){
				  delVal++;
   			 },
 		
              function(error){
			    });
          
          });
             app.mobileApp.navigate('views/groupListPage.html');
             app.showAlert("Group Deleted Successfully","Notification");
         };
                
                
    	 return {
        	   init: init,
           	show: show,
               groupSelected:groupSelected,
	           deleteGroupFunc:deleteGroupFunc,
               addGroup:addGroup,
               deleteGroup:deleteGroup,
               addGroupFunc:addGroupFunc,
             
             
               groupListData:GroupsListModel.groupListData
          };
           
    }());
        
    return activityListViewModel;
    
}());