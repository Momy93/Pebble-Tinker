var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');

var DEVICE_ID = '123456987456321456987456'; //Replace with your photon device ID
var ACCESS_TOKEN = '1234567890abcdef1234567890abcdf123456789'; //Replace with your particle access token. Remember not share it
var url ='https://api.particle.io/v1/devices/';

var circle = new UI.Circle(
{
    position: new Vector2(56, 100),
    radius: 40,
    backgroundColor: 'black'
});

var title = new UI.Text(
{ 
    position: new Vector2(10, 10), 
    size: new Vector2(90, 30),  
    backgroundColor: 'black',
    textAlign: 'center',
    font: 'gothic-28'
});

var val_label = new UI.Text(
{ 
    position: new Vector2(18, 80), 
    size: new Vector2(80, 80),
    textAlign: 'center',
    font: 'gothic-28'
});  

var menu = new UI.Menu(
{
    sections: 
    [
        {
            items: 
            [
                {title: 'D0'},
                {title: 'D1'},
                {title: 'D2'},
                {title: 'D3'},
                {title: 'D4'},
                {title: 'D5'},
                {title: 'D6'},
                {title: 'D7'},
                {title: 'A0'},
                {title: 'A1'},
                {title: 'A2'},
                {title: 'A3'},
                {title: 'A4'},
                {title: 'A5'}
            ]
        }
    ]
});
        
menu.on('select', function(e) 
{
    title.text(e.item.title);
    var submenu = new UI.Menu(
    {
        sections: 
        [
            {
                items: 
                [
                    {title: 'WRITE'},
                    {title: 'READ'},
                ]
            }
        ]
    });
    
    submenu.on('select', function(e2) 
    {   
        var submenu2 = new UI.Menu(
        {
            sections: [{items: [{title: 'DIGITAL'}]}]
        });
          
        if(e2.itemIndex === 0)
        {
            circle.position(new Vector2(56, 100));
            title.size(new Vector2(90, 30));
            val_label.position(new Vector2(18, 80));
            submenu2.item(0, 1, {title: 'ANALOG'});  
            submenu2.on('select', function(e3) 
            {        
                var win = new UI.Window(
                {
                    action: 
                    {
                        up: 'images/icon_plus.png',
                        down: 'images/icon_minus.png',
                    },
                    backgroundColor: 'white'
                });
                    
                win.add(title);
                win.add(circle);
                win.add(val_label);
                     
                if(e3.itemIndex === 0)
                {
                    var val = false; 
                    val_label.text('LOW');
                        
                    win.on('click', 'up', function(e) 
                    {
                        val = !val;
                        val_label.text(val? 'HIGH':'LOW');
                    });
                
                    win.on('click', 'down', function(e) 
                    {
                        val = !val;
                        val_label.text(val? 'HIGH':'LOW');
                    });
            
                    win.on('click', 'select', function() 
                    {
                        ajax
                        (        
                            {
                                url: url+DEVICE_ID+'/digitalwrite',
                                method:'post',
                                data:
                                {
                                    access_token: ACCESS_TOKEN,
                                    arg: e.item.title + ' ' + (val?'HIGH':'LOW')
                                }
                            },
                            function(data, status, request) 
                            {
                                console.log(data);
                            },
                            function(error, status, request) 
                            {
                                console.log('The ajax request failed: ' + error + " " + status + " "  + request);
                            }
                        );
                    });                       
                }
                else
                {
                    var analogVal = 127;    
                    val_label.text(analogVal);
                    win.on('click', 'up', function(e) 
                    {   
                        if(analogVal < 255)
                        {
                            analogVal++;
                            val_label.text(analogVal);
                        }
                        else;
                    });
                                        
                    win.on('click', 'down', function(e) 
                    {
                        if(analogVal > 0)
                        {
                            analogVal--;
                            val_label.text(analogVal);
                        }
                    });
                       
                    win.on('click', 'select', function() 
                    {
                        ajax
                        (        
                            {
                                url: url+DEVICE_ID+'/analogwrite',
                                method:'post',
                                data:
                                {
                                    access_token: ACCESS_TOKEN,
                                    arg: e.item.title + ' ' + analogVal
                                }
                            },
                            function(data, status, request) 
                            {
                                console.log(data);
                            },
                            function(error, status, request) 
                            {
                                console.log('The ajax request failed: ' + error + "Status: " + status + "Request: "  + request);
                            }
                        );
                    });
                }
                win.show();
            });
        }
                                   
        else
        {
            if(e.itemIndex > 7)submenu2.item(0, 1, {title: 'ANALOG'});
            submenu2.on('select', function(e3) 
            {   
                var win = new UI.Window({backgroundColor: 'white'});
                val_label.text('...');
                circle.position(new Vector2(70, 100));
                title.size(new Vector2(125, 30));
                val_label.position(new Vector2(30, 80));
                win.add(title);
                win.add(circle);
                win.add(val_label);
                win.show();
                readValue(e3.itemIndex === 0?'digitalread':'analogread', e.item.title);
                
                //setTinterval, setTimeout and friends should be avoided with Pebble.js
                var intervalID = setInterval(function()
                {
                    readValue(e3.itemIndex === 0?'digitalread':'analogread', e.item.title);
                }, 500);
                win.on('click', 'back', function(e) 
                {
                    clearInterval(intervalID); //Bad
                    win.hide();
                });
            });
        }    
        submenu2.show();
    });
    submenu.show();
});
menu.show();


function readValue(func, command)
{
    ajax
    (        
        {
            url: url +DEVICE_ID+'/'+func,
            method:'post',
            data:
            {
                access_token: ACCESS_TOKEN,
                arg: command
            }
        },
        function(data, status, request) 
        {
            var result = JSON.parse(data);
            if(func === 'analogread')val_label.text(result.return_value);
            else val_label.text(result.return_value === 0?'LOW':'HIGH');
        },
        function(error, status, request) 
        {
            console.log('The ajax request failed: ' + error + " " + status + " "  + request);
            val_label.text(-4);
        }
    );
}