$(function() {
	
	var offset = 0;
	
	function update_log(data) {
		if (data.error) {
			append_log('','Could not get Logs (Error:'+data.error+') retrying in 10 seconds');
			setTimeout(poll_log, 10000);
			return;
		}
		offset = data.offset;
		$.each(data.log, function(index, line){
			append_log(line[0], line[1]);
		})
		setTimeout(poll_log, 500);
	}
	
	function append_log(timestamp, message) {
		$('<div class="entry"><div class="log-timestamp">'+timestamp+'</div><div class="log-message">'+message+'</div></div>').appendTo('#logviewer');
		$("#logviewer").scrollTop($("#logviewer")[0].scrollHeight);
	}
	
	function poll_log() {
		$.ajax({
	        url: '/api/site/admin/liquidsoap/log',
	        type: "GET",
	        data: {offset: offset},
	        dataType: "json",
	        success: update_log
	    });
    }
	poll_log();
	
	function update_status(data) {
		if (data.error) {
			$('#liquidsoap-version').html('Offline');
			$('#liquidsoap-uptime').html('Offline');
			$('#liquidsoap-toolbar > .btn-group > button span').removeClass('label-warning label-success');
			setTimeout(poll_status, 5000);
			return;
		}
		if (data.version) {
			$('#liquidsoap-version').html(data.version);
		}
		if (data.uptime) {
            $('#liquidsoap-uptime').html(data.uptime);
        }
		$.each(data.sources, function(index, source){
			id = source.handler.replace('(dot)', '.');
			id = id.replace('/', '');
			
			if ($('#liquidsoap-toolbar #'+id).length == 0) {
				$('<div class="btn-group"><button class="btn btn-default dropdown-toggle" id="'+id+'" data-toggle="dropdown">' +
				  '<span class="label label-success"><i class="icon-off"></i></span> '+
				  source.handler+'</button>'+
				  '<ul class="dropdown-menu"><li class="disabled">'+
				  '<a href="#" tabindex="-1" id="status-'+id+'">'+source.status_msg+'</a>'+
				  '</li><li>'+
				  '<a href="#" onclick="stop_endpoint(\''+source.handler+'\');">Stop</a>'+
				  '</li></ul></div>'
				).appendTo('#liquidsoap-toolbar');
			}
			var label = $('#liquidsoap-toolbar #'+id+' span');
            if (source.status) {
                label.removeClass('label-warning');
                label.addClass('label-success');
            } else {
                label.removeClass('label-success');
                label.addClass('label-warning');
            }
            $('#status-'+id+'').html(source.status_msg);
		});
		$.each(data.sinks, function(index, sink){
            id = sink.handler.replace('(dot)', '-');
            id = id.replace('/', '');
            
            if ($('#liquidsoap-toolbar #'+id).length == 0) {
                $('<div class="btn-group"><button class="btn btn-default dropdown-toggle" id="'+id+'" data-toggle="dropdown">'+
                  '<span class="label"><i class="icon-off"></i></span> '+
                  sink.handler+'</button>'+
                  '<ul class="dropdown-menu"><li>'+
                  '<a href="#" onclick="start_endpoint(\''+sink.handler+'\');">Start</a>'+
                  '</li><li>'+
                  '<a href="#" onclick="stop_endpoint(\''+sink.handler+'\');">Stop</a>'+
                  '</li></ul></div>'
                 ).appendTo('#liquidsoap-toolbar');
            }
            var label = $('#liquidsoap-toolbar #'+id+' span');
            if (sink.status) {
            	label.removeClass('label-important');
                label.addClass('label-success');
            } else {
            	label.removeClass('label-success');
            	label.addClass('label-important');
            }
        });
		setTimeout(poll_status, 2500);
	}
	
	function poll_status() {
        $.ajax({
            url: '/api/site/admin/liquidsoap/status',
            type: "GET",
            dataType: "json",
            success: update_status
        });
    }
	
	poll_status();
});

function after_command(data) {
    if (data.error) {
    	alert(data.error);
    }
}

function shutdown() {
    $.ajax({
        url: '/api/site/admin/liquidsoap/shutdown',
        type: "GET",
        dataType: "json",
        success: after_command
    });
    return false;
}

function start() {
    $.ajax({
        url: '/api/site/admin/liquidsoap/start',
        type: "GET",
        dataType: "json",
        success: after_command
    });
    return false;
}

function endpoint_action(handler, action) {
	$.ajax({
        url: '/api/site/admin/liquidsoap/endpoint/'+action,
        type: "GET",
        data: {endpoint:handler},
        dataType: "json",
        success: after_command
    });
}
function stop_endpoint(handler) {
    endpoint_action(handler,'stop');
    return false;
}

function start_endpoint(handler) {
	endpoint_action(handler,'start');
    return false;
}