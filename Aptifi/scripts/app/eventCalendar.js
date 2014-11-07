var app = app || {};

app.eventCalender = (function () {

    
    var calendarEventModel = (function () {

        var init = function(){
        
        
        
        }
    
         var show = function(){
             
             document.getElementById("calendar").innerHTML = "";
             
             var tasks = [];
                /*tasks[+new Date(2014, 8 - 2, 22)] = "ob-done-date";
                tasks[+new Date(2014, 8 - 2, 27)] = "ob-done-date";
                tasks[+new Date(2014, 8 - 1, 3)] = "ob-done-date";
                tasks[+new Date(2014, 8 - 1, 5)] = "ob-not-done-date";*/
                tasks[+new Date(2014, 10, 8)] = "ob-done-date";
                tasks[+new Date(2014, 10, 12)] = "ob-done-date";
                tasks[+new Date(2014, 10, 24)] = "ob-done-date";
                //tasks[+new Date(2014, 8 + 1, 6)] = "ob-done-date";
                /*tasks[+new Date(2014, 8 + 1, 7)] = "ob-not-done-date";
                tasks[+new Date(2014, 8 + 1, 25)] = "ob-done-date";
                tasks[+new Date(2014, 8 + 1, 27)] = "ob-not-done-date";*/
             
              
                //$("#calendar").kendoCalendar();

             /*$("#calendar").kendoCalendar({
                    value:new Date(),
                    dates:tasks,
                    month:{
                    content:'# if (typeof data.dates[+data.date] === "string") { #' +
                            '<div class="#= data.dates[+data.date] #">' +
                            '#= data.value #' +
                            '</div>' +
                            '# } else { #' +
                            '#= data.value #' +
                            '# } #'
                    }
             }).data("kendoCalendar");*/
                          
             $("#calendar").kendoCalendar({
             value:new Date(),
             dates:tasks,
             month:{
             content:'# if (typeof data.dates[+data.date] === "string") { #' +
                '<div class="#= data.dates[+data.date] #">' +
                '#= data.value #' +
                '</div>' +
                '# } else { #' +
                '#= data.value #' +
                '# } #'
            },
              change: selectedDataByUser,              
              
              navigate:function () {
                $(".ob-done-date", "#calendar").parent().addClass("ob-done-date-style k-state-hover");
                $(".ob-not-done-date", "#calendar").parent().addClass("ob-not-done-date-style k-state-hover");
              }
            }).data("kendoCalendar");             
         }
        
        
        function selectedDataByUser(){
            console.log("Change :: " + kendo.toString(this.value(), 'd'));
            
           var date = kendo.toString(this.value(), 'd'); 
            
            $("#eventTime").val(date);
        }
    
    	 return {
        	   init: init,
           	show: show
          };
           
    }());
        
    return calendarEventModel;
    
}());