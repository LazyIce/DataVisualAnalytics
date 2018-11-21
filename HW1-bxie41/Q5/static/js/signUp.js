$(function(){
	$('button').click(function(){
		var user = $('#inputUsername').val();
		var pass = $('#inputPassword').val();
		if (user === '' || pass === '')
			$('.confirmation').text('Please enter your details!');
		else
			$.ajax({
				url: '/signUpUser',
				data: $('form').serialize(),
				type: 'POST',
				success: function(response) {
                    console.log(response);
                    response = JSON.parse(response);
                    if (response.status === 'OK') {
                        var message = 'Congratulations on registering for CSE6242, ' + response.user
                            + '! Redirecting you to the course homepage...';
                        $('.confirmation').text(message);
                        $('#inputUsername').val('');
						$('#inputPassword').val('');
                        setTimeout(function () {
                            window.location.href = 'http://poloclub.gatech.edu/cse6242/';
                        }, 3000)
                    } else {
                    	var criteria = [];
                    	for (var i = 0; i < response.pass.length; i++) {
                    		if (response.pass[i] === 1)
                    			criteria.push('1. Should be at least 8 characters in length');
                    		else if (response.pass[i] === 2)
                    			criteria.push('2. Should have at least 1 uppercase character');
                    		else if (response.pass[i] === 3)
                    			criteria.push('3. Should have at least 1 number');
						}
						criteria = criteria.join(' , ');
                    	var message = response.user + ', the password is invalid because it, ' + criteria
							+ ' . Please Try Again!';
                    	$('#inputPassword').val('');
                    	$('.confirmation').text(message);
					}
				},
				error: function(error){
					console.log(error);
				}
			});
	});
});