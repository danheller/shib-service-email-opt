$(document).ready(function() {
	var error = [];
	var timeout = [];
	var e = a = errcount = 0;
	var errormessage, after;
	cansubmit = true;
	xhr = false;
	function isNumber(x) {
		if ( (x >= 0) > 0 ) {
			return true;
		} else {
			return false;
		}
	}
	
	// set the cursor position in an input field
	$.fn.setCursor = function(pos) {
		this.each(function(index,elem) {
			if(elem.setSelectionRange) {
				elem.setSelectionRange(pos,pos);
			} else if(elem.createTextRange) {
				var range = elem.createTextRange();
				range.collapse(true);
				range.moveEnd('character',pos);
				range.moveStart('character',pos);
				range.select();
			}
		});
		return this;
	}

	// helps with autofill detection
	$.fn.allchange = function (callback) {
		var me = this;
		var last = "";
		var infunc = function () {
			var text = $(me).val();
			if (text != last) {
				last = text;
				callback();
			}
			setTimeout(infunc, 100);
		}
		setTimeout(infunc, 100);
	};

	// format 10-digit ID numbers	
	$.fn.formatIDNumber = function() {
		function validateIDNumber(n) { 
			var re = /^[1-9]{1}[0-9]{9}$/;
			return re.test(n);
		}
	
		var element = this;
		element.attr("maxlength", "15"); // length limited to 15 characters

		(element).keyup(function (e) {
			// replace non-numeric characters and show alert message
			val = element.val();
			if( val.length && !isNumber(val) ) {
				pos = val.match(/[^0-9]/);
				val = val.replace(/[^0-9]+/g,'');
				element.val( val );
				element.setCursor(pos.index);
				if(timeout["numbers"]) { clearTimeout(timeout["numbers"]); }
				$(".tooltip-numbers:not(.active)").addClass("active");
				timeout["numbers"] = setTimeout(function() {
					$(".tooltip-numbers.active").removeClass("active");
				}, 1800);
			}

			// add check icon and update submit button if field is entered correctly
			if(val.length==10) {
				$(".field.id-number:not(.ok)").addClass("ok");
				element.attr("maxlength", "10"); // length limited to 10 characters

				if(error['tendigitid']) {
					delete error['tendigitid'];
					element.parents("form").clearErrors();
				}
			} else {
				$(".field.id-number.ok").removeClass("ok");
				element.attr("maxlength", "15"); // length limited to 15 characters

			}			
			buttonstate(element);
			
			// if it is still empty after keyup, just return
			if (element.val() === "") {
				return false;
			}
		});
		
		(element).blur(function () {
			val = element.val();
			$(".tendigitid-hidden").val(val);
			
			if( val.length && !isNumber(val) ) { // show alert if value is not a numeric
				$(".tooltip-numbers:not(.active)").addClass("active");
				if(timeout["numbers"]) { clearTimeout(timeout["numbers"]); }
				timeout["numbers"] = setTimeout(function() {
					$(".tooltip-numbers.active").removeClass("active");
				}, 1800);
			} else if( val.length && val.length < 10 ) { // show alert if value is less than 10 characters
				$(".tooltip-length:not(.active)").addClass("active");
				if(timeout["length"]) { clearTimeout(timeout["length"]); }
				timeout["length"] = setTimeout(function() {
					$(".tooltip-length.active").removeClass("active");
				}, 1800);
			}
			buttonstate(element);
			
			if( !val || !validateIDNumber(val) ) {
				error["tendigitid"] = "10-digit USC ID number";
			} else {
				if(error['tendigitid']) {
					delete error['tendigitid'];
					element.parents("form").clearErrors();
				}
			}		
		});

		$(element).allchange(function () {
			val = element.val();
			if( val && validateIDNumber(val) ) {
				$(".field.id-number:not(.ok)").addClass("ok");
				buttonstate(element);			
			}
		});
	}

	// format birth date
	$.fn.formatDate = function() {
		function validateDOB(dob) { 
			var re = /^[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}$/;
			if(re.test(dob)) {
				if(dob) {
					var dateParts = dob.split('/');

					if(dateParts[0]) { 
						var m1 = dateParts[0];				
					} else {
						return false;
					}
					if(dateParts[1]) { 
						var d1 = dateParts[1];				
					} else {
						return false;
					}

					if( (parseInt(m1) < 13 && parseInt(d1) < 31) ) {
						if( (m1 == '02') && (parseInt(d1)>29) ) {
							return false;
						} else {
							return true;
						}
					} else {
						if( (d1 == '31') && (m1 != '02') && (m1 != '04') && (m1 != '06') && (m1 != '09') && (m1 != '11') ) {
							return true;
						} else {
							return false;
						}
					}
				} else {
					return false;
				}
			} else {
				return false;
			}
		}	

		var months = { '1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06', '7': '07', '8': '08', '9': '09', '10': '10',
			'11': '11', '12': '12'
		};
		var days = { '1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06', '7': '07', '8': '08', '9': '09', '10': '10',
			'11': '11', '12': '12', '13': '13', '14': '14', '15': '15', '16': '16', '17': '17', '18': '18', '19': '19', '20': '20',
			'21': '21', '22': '22', '23': '23', '24': '24', '25': '25', '26': '26', '27': '27', '28': '28', '29': '29', '30': '30', '31': '31'
		};

		var element = this;
		datelength = newdatelength = false;
		element.attr("maxlength", "14"); // length limited to 14 characters

		(element).keyup(function (e) {
			val = element.val();
			newdatelength = val.length;
			// only fix things when the user is adding characters (not deleting them)
			if(!datelength || newdatelength >= datelength) { 
				datefixes(element,"keyup");
			}
			datelength = element.val().length;
		});
		
		(element).blur(function(e) {
			datefixes(element,"blur");
			
			val = element.val();
			$(".dob-hidden").val(val); // pass the value to any hidden birthdate fields
		});

		(element).bind("paste",function(e) {
			datefixes(element,"blur");
			val = element.val();
			$(".dob-hidden").val(val); // pass the value to any hidden birthdate fields
		});
		
		function datefixes(element,event) {
			// fix problem with extra slashes
			var doubleslash = element.val().indexOf("//");
			if(doubleslash != -1) {
				pos = doubleslash + 1;
				element.val(element.val().replace(/\/\//g,'/'));
				element.setCursor(pos);
			}

			var slashmatches = element.val().match(/\//g);
			if(slashmatches && slashmatches[2]) {
				i=0;
				element.val(element.val().replace(/\//g,function (match, pos, original) {
					i++;
					return (i > 2) ? "" : match;
				}));
			}
			
			val = element.val();	
			// replace characters other than numbers and slashes			
			if( val.length && !isNumber(val.replace(/\s/g,'').replace(/\//g,'')) ) {
				pos = val.match(/[^0-9\/\s]/);
				val = val.replace(/[^0-9\/\s]+/g,'');
				element.val(val);
				element.setCursor(pos.index);
			}

			// fix date formatting
			formattedval = formatMMDDYYYY(element.val());
			if(formattedval != val) { element.val(formattedval); val = formattedval; }
		
			val_no_slashes = element.val().replace(/\s/g,'').replace(/\//g,'');
			if(val_no_slashes.length==8 && isNumber(val_no_slashes) && validateDOB(val) ) {
				$(".field.date:not(.ok)").addClass("ok");
				if(error['bday']) {
					delete error['bday'];
					element.parents("form").clearErrors();
				}
			} else {
				$(".field.date.ok").removeClass("ok");
			}

			if(event=="blur") { // do alerts, etc. only on blur event
				valyear = val.substr(-4);
				dateObj = new Date();
				thisyear = dateObj.getFullYear();
				if(val) {
					if( (val.length && val.replace(/\s/g,'').length != 10) || !validateDOB(val) ) { // show alert if a date has been entered with incorrect formatting
						$(".tooltip-dateformat:not(.active)").addClass("active");
						if(timeout["dateformat"]) { clearTimeout(timeout["dateformat"]); }
						timeout["dateformat"] = setTimeout(function() {
							$(".tooltip-dateformat.active").removeClass("active");
						}, 1800);
					}

					if(valyear < (thisyear-150)) { // show alert if the year is over 150 years ago
						$(".tooltip-dateold:not(.active)").addClass("active");
						if(timeout["dateold"]) { clearTimeout(timeout["dateold"]); }
						timeout["dateold"] = setTimeout(function() {
							$(".tooltip-dateold.active").removeClass("active");
						}, 1800);
					}
			
					if(valyear > (thisyear-10)) { // show alert if the year is under 10 years ago
						$(".tooltip-dateyoung:not(.active)").addClass("active");
						if(timeout["dateyoung"]) { clearTimeout(timeout["dateyoung"]); }
						timeout["dateyoung"] = setTimeout(function() {
							$(".tooltip-dateyoung.active").removeClass("active");
						}, 1800);
					}

					if(valyear > thisyear) { // show alert if the year is in the future
						$(".tooltip-datefuture:not(.active)").addClass("active");
						if(timeout["datefuture"]) { clearTimeout(timeout["datefuture"]); }
						timeout["datefuture"] = setTimeout(function() {
							$(".tooltip-datefuture.active").removeClass("active");
						}, 1800);			
					}
				}

				if( !val || !validateDOB(val) ) {
					error["bday"] = "date of birth";
				} else {
					if(error['bday']) {
						delete error['bday'];
						element.parents("form").clearErrors();
					}
				}
			}

			buttonstate(element);
		}

		function getDay(d) {
			return (days[d] != undefined)
					? days[d]
					: d;
		}

		function getMonth(m) {
			return (months[m] != undefined)
					? months[m]
					: m;
		}

		function formatMMDDYYYY(dob) {
			var formattedDate = dob;
			var day, month, year;

			if (dob.slice(dob.length - 1) === "/") {
				var dateParts = dob.split('/');
				var m1 = getMonth(dateParts[0]);
				var d1 = getDay(dateParts[1]);

				formattedDate = m1 + "/";
				if (d1 != undefined && dateParts.length == 3) {
					formattedDate += d1 + "/";
				}
			} else if (dob.length < 2) {
				// nothing to do
			} else if (dob.length == 2) {
				// if it is less than 13, append a slash
				if (dob < 13) {
					formattedDate = dob + "/";
				} else {
					var m = getMonth(dob.substr(0,1));
					if(dob.substr(1,1) > 3) { 
						var d = getDay(dob.substr(1));
						formattedDate = m + "/" + d + "/";
					} else {
						var d = dob.substr(1,1);
						formattedDate = m + "/" + d;
					}
				}
			} else if (dob.length == 3) {
				if( dob.substr(2,1) != "/") {
					var m1 = dob.substr(0,1);
					if(m1 > 1) {
						var m = getMonth(dob.substr(0,1));
						if(dob.slice(1,2) > 3) { 
							var d = getDay(dob.substr(1,1));
							var y = dob.substr(2,1);
							formattedDate = m+"/"+d+"/"+y;
						} else {
							var d = getDay(dob.substr(1,2));
							formattedDate = m+"/"+d+"/";
						}
					} else if(m1==1) {
						if(dob.substr(1,1)>2) {
							var m = getMonth(dob.substr(0,1));
							if(dob.slice(1,1) > 3) {
								var d = getDay(dob.substr(1,1));
								formattedDate = m+"/"+d+"/"+dob.substr(2,1);
							} else {
								var d = getDay(dob.substr(1,2));
								formattedDate = m+"/"+d+"/";
							}
						} else {
							var m = getMonth(dob.substr(0,2));
							if(dob.slice(2,1) > 3) {
								var d = getDay(dob.substr(2,1));
								formattedDate = m+"/"+d+"/";
							} else {
								formattedDate = m+"/"+dob.substr(2,1);
							}
						}					
					} else if(m1===0) {
						var m = getMonth(dob.substr(0,2));
						if(dob.slice(2,1) > 3) {
							var d = getDay(dob.substr(2,1));
							formattedDate = m+"/"+d+"/";
						} else {
							formattedDate = m+"/"+dob.substr(2,1);
						}
					}
				}
			} else if (dob.length > 3 && dob.length < 6) {
				var dateParts = dob.split('/');
				if(dateParts.length == 2) {
					var m1 = dateParts[0];
					var d1 = dateParts[1];

					// if date has already been input
					formattedDate = m1 + "/";

					if (d1 > 10 || dob.length == 5) {
						formattedDate += d1 + "/";
					} else {
						formattedDate += d1;
					}
				} else {
					dob = dob.replace(/\//g,'');
					
					if(dob.slice(0,1)>1) {
						var m = getMonth(dob.substr(0,1));
						if(dob.slice(1,1)>3) {
							var d = getDay(dob.substr(1,2));
							formattedDate = m+"/"+d+"/"+dob.substr(3);
						} else {
							formattedDate = m+"/"+dob.substr(1,2)+"/"+dob.substr(3);
						}
					} else {
						var m = getMonth(dob.substr(0,2));
						formattedDate = m+"/"+dob.substr(1,2)+"/"+dob.substr(3);
					}
				}
			} else if(dob.length > 5) {
				var dateParts = dob.split('/');

				if(dateParts && dateParts.length == 3) {
					formattedDate = dob;
				} else if (dateParts.length == 2 && dob.substr(2,1)=="/") {
					m = getMonth(dateParts[0]);
					d = getDay(dateParts[1].substr(0,2));
					formattedDate = m+"/"+d+"/"+dateParts[1].substr(2);					
				} else {
					dob = dob.replace(/\//g,'');
					if(dob.substr(0,1)>1) {
						var m = getMonth(dob.substr(0,1));
						if(dob.substr(1,1)>3) {
							var d = getDay(dob.substr(1,1));
							formattedDate = m+"/"+d+"/"+dob.substr(2);
						} else {
							formattedDate = m+"/"+dob.substr(1,2)+"/"+dob.substr(3);
						}
					} else {
						var m = getMonth(dob.substr(0,2));
						if(dob.substr(2,1)>3) {
							var d = getDay(dob.substr(2,1));
							formattedDate = m+"/"+d+"/"+dob.substr(3);
						} else {
							formattedDate = m+"/"+dob.substr(2,2)+"/"+dob.substr(4);
						}
					}				
				}			
			}
			return formattedDate;
		}
	};
	
	// format email address
	$.fn.formatEmail = function() {
		function validateEmail(email) { 
			var re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
			return re.test(email);
		}
		var element = this;	
		(element).on("keyup",function (e) {
			val = element.val(); 

			if( val && validateEmail(val) ) {
				$(".field.email:not(.ok)").addClass("ok");
				if(error['email']) {
					delete error['email'];
					element.parents("form").clearErrors();
				}
			} else {
				$(".field.email.ok").removeClass("ok");
			}
			buttonstate(element);
			
			// if it is still empty after keyup, just return
			if (element.val() === "") {
				return false;
			}
		});
		
		(element).on("blur",function () {
			val = element.val();
			$(".email-hidden").val(val);
			if( val && !validateEmail(val) ) { // show alert if the email address is not valid
				$(".tooltip-email:not(.active)").addClass("active");
				if(timeout["email"]) { clearTimeout(timeout["email"]); }
				timeout["email"] = setTimeout(function() {
					$(".tooltip-email.active").removeClass("active");
				}, 1800);
			}
			if( !val || !validateEmail(val) ) {
				error["email"] = "email address";
			} else {
				if(error['email']) {
					delete error['email'];
					element.parents("form").clearErrors();
				}
			}

			buttonstate(element);
		});

		$(element).allchange(function () {
			val = element.val();
			$(".email-hidden").val(val);
			if( val && validateEmail(val) ) {
				$(".field.email:not(.ok)").addClass("ok");
				buttonstate(element);			
			}
		});
	}

	// format USC NetID
	$.fn.formatNetID = function() {
		// character set limited to letters, numbers, dashes, underscores
		function validateNetIDchars(netid) { 
			var re = /^[a-zA-Z0-9\-\_]+$/;
			return re.test(netid);
		}

		// first character can only be a letter
		function validateNetIDfirst(character) { 
			var re = /^[a-zA-Z]$/;
			return re.test(character);
		}
		
		// length is at least 3 characters and at most 8
		function validateNetIDlength(netid) { 
			var re = /^\w{3,8}$/;
			return re.test(netid);
		}
		
		// all-in-one NetID validation regular expression
		function validateNetID(netid) {
			var re = /^[a-zA-Z][a-zA-Z0-9\-\_]{2,7}$/;
			return re.test(netid);
		}

		var element = this;
		$(element).keyup(function (e) {
			val = element.val();
			if( val && val.length >= 3 && validateNetID(val) ) {
				$(".field.net-id:not(.ok)").addClass("ok");
				if(error['netid']) {
					delete error['netid'];
					element.parents("form").clearErrors();
				}
			} else {
				var first = val.substr(0,1);
				if( val && !validateNetIDchars(val) ) { // show alert if there is an invalid character
					$(".tooltip-netid-charset:not(.active)").addClass("active");
					if(timeout["netid-charset"]) { clearTimeout(timeout["netid-charset"]); }
					timeout["netid-charset"] = setTimeout(function() {
						$(".tooltip-netid-charset.active").removeClass("active");
					}, 2500);
				} else if( val && !validateNetIDfirst(first) ) { // show alert if the first character isn't a letter
					$(".tooltip-netid-first:not(.active)").addClass("active");
					if(timeout["netid-first"]) { clearTimeout(timeout["netid-first"]); }
					timeout["netid-first"] = setTimeout(function() {
						$(".tooltip-netid-first.active").removeClass("active");
					}, 2500);
				}

				$(".field.net-id.ok").removeClass("ok");
			}
			
			buttonstate( element );		
		});

		$(element).blur(function () {
			val = element.val();
			$("input.netid-hidden").val(val);
			if( val && !validateNetIDchars(val) ) { // show alert if there is an invalid character
				$(".tooltip-netid-charset:not(.active)").addClass("active");
				if(timeout["netid-charset"]) { clearTimeout(timeout["netid-charset"]); }
				timeout["netid-charset"] = setTimeout(function() {
					$(".tooltip-netid-charset.active").removeClass("active");
				}, 2500);
			} else if(val && !validateNetIDfirst(val.substr(0,1)) ) { // show alert if the first character isn't a letter
				$(".tooltip-netid-first:not(.active)").addClass("active");
				if(timeout["netid-first"]) { clearTimeout(timeout["netid-first"]); }
				timeout["netid-first"] = setTimeout(function() {
					$(".tooltip-netid-first.active").removeClass("active");
				}, 2000);
			} else if(val && !validateNetIDlength(val) ) { // show alert if the NetID is too short or long
				$(".tooltip-netid-length:not(.active)").addClass("active");
				if(timeout["netid-length"]) { clearTimeout(timeout["netid-length"]); }
				timeout["netid-length"] = setTimeout(function() {
					$(".tooltip-netid-length.active").removeClass("active");
				}, 2000);
			}
			if( !val || !validateNetID(val) ) {
				error['netid'] = "USC NetID";
			} else {
				if(error['netid']) {
					delete error['netid'];
					element.parents("form").clearErrors();
				}
			}
			buttonstate(element);
		});

		$(element).allchange(function () {
			val = element.val();
			if( val && validateNetID(val) ) {
				$(".field.net-id:not(.ok)").addClass("ok");
				buttonstate(element);
			}
		});
	}

	// check if password and retyped password match
	$.fn.passwordsMatch = function() {	
		var elements = this;
	
		checkmatch = function() {
			var enter = $("#enter-password").val();
			var retype = $("#retype-password").val();

			if( enter && retype && enter == retype ) {
				return true;
			} else {
				return false;
			}
		} 

		$("#enter-password,#retype-password").keyup(function() {
			var thisfield = $(this).parents(".field");
			if( checkmatch() ) {
				if(!thisfield.hasClass("ok")) { 
					thisfield.addClass("ok");
				}
				if(error['retype-password']) {
					delete error['retype-password'];
					thisfield.parents("form").clearErrors();
				}
			} else {
				if( $("#retype-password").parents(".field").hasClass("ok")) { $("#retype-password").parents(".field").removeClass("ok"); }
				error['retype-password'] = "make sure you retyped the password correctly";
			}
			buttonstate( thisfield );	
		});

		$("#retype-password").blur(function() {
			val = $(this).val();
			if( !val || !checkmatch() ) {
				error['retype-password'] = "make sure you retyped the password correctly";
			} else {
				if(error['retype-password']) {
					delete error['retype-password'];
					element.parents("form").clearErrors();
				}
			}
		});

	}

    // check if password is the required length
    $.fn.passwordCheck = function(min) { // min = minimum length
        function validatePasswordLength(pwd) {
            if(typeof min === 'number') {
                if(pwd.length < min || pwd.length > 32) {
                    return false;
                } else {
                    return true;
                }
            } else {
                var re = /^.{12,32}$/;
                return re.test(pwd);
            }
        }

        var element = this;
        pwlength = 0;
        $(element).keyup(function (e) { 
            var thisfield = element.parents(".field");
            val = element.val();
            if( val && validatePasswordLength(val) ) {
                if(!thisfield.hasClass("ok")) { 

                    thisfield.addClass("ok"); 
                    if(error['password']) {
                        delete error['password'];
                        element.parents("form").clearErrors();
                    }
                }
            } else {
                if( val.length > 32 && val.length > pwlength ) {
                    pwlength = val.length;
                    error["password"] = "enter a valid password";
                    if(timeout["password-length"]) { clearTimeout(timeout["password-length"]); }
                    $(".tooltip-password-length:not(.active)").addClass("active");
                    timeout["password-length"] = setTimeout(function() {
                        $(".tooltip-password-length.active").removeClass("active");
                    }, 2500);
                }
                if(thisfield.hasClass("ok")) { thisfield.removeClass("ok"); }
            }
            buttonstate( element );     
        });
        
        $(element).blur(function () {
            val = element.val();
            if( !val || !validatePasswordLength(val) ) {
                error["password"] = "enter a valid password";
                if(val) {
                    if(timeout["password-length"]) { clearTimeout(timeout["password-length"]); }
                    $(".tooltip-password-length:not(.active)").addClass("active");
                    timeout["password-length"] = setTimeout(function() {
                        $(".tooltip-password-length.active").removeClass("active");
                    }, 2500);
                }
            } else {
                if(error['password']) {
                    delete error['password'];
                    element.parents("form").clearErrors();
                }
            }
            buttonstate(element);
        });
        
        $(element).allchange(function () {
            val = element.val();
            var thisfield = element.parents(".field");
            if( val && validatePasswordLength(val) ) {
                if(!thisfield.hasClass("ok")) { 
                    thisfield.addClass("ok"); 
                }
                buttonstate(element);           
            }
        });
    }

	function startTimer(duration, display) {
		var timer = duration, minutes, seconds;
		setInterval(function () {
			rightnow = new Date().getTime();
			timer = ( expires - rightnow ) / 1000;
			minutes = parseInt(timer / 60, 10);
			seconds = parseInt(timer % 60, 10);

			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;

			display.text(minutes + ":" + seconds);

			if (--timer < 0) {
				timer = duration;
			}
		}, 1000);
	}

	// check if confirmation code is valid (must be 32 characters long)
	$.fn.confirmationCheck = function() {	

		function validateConfirmationCode(code) {
			var re = /^[a-zA-Z0-9]{32}$/;
			code = code.trim();
			return re.test(code);
		}

		var element = this;

		if(element.hasClass("timeout")) {
			if(timeout["confirmation"]) { clearInterval(timeout["confirmation"]); }	
		
			expires = new Date().getTime() + (1000*60*60);
			warning = new Date().getTime() + (1000*60*50) - 2000;
			var warned = false;
			timeout["confirmation"] = setInterval(function () {
				rightnow = new Date().getTime();
				if(rightnow >= expires) { 
					element.parents("form").children(".status").removeClass("warning").addClass("error").html("Sorry, your confirmation code has expired. Please <a href=\"javascript:history.go(0);\">start over</a> to get a new confirmation code."); 
					clearInterval(timeout["confirmation"]);
				} else if(!warned && rightnow >= warning) {
					element.parents("form").children(".status").addClass("warning").html("You have <strong class=\"countdown\">10:00</strong> left to complete this step.");
					startTimer(600, $(".countdown"));
					warned = true;
				}
			}, 1000);
		}

		$(element).keyup(function (e) { 
			var thisfield = element.parents(".field");
			var val = element.val();
			if( val != val.trim() ) { element.val(val.trim()); }
			if( val && validateConfirmationCode(val) ) {
				if(!thisfield.hasClass("ok")) { 
					thisfield.addClass("ok maybe"); 
					if(error['confirmation-code']) {
						delete error['confirmation-code'];
						element.parents("form").clearErrors();
					}
				}
			} else {
				if(thisfield.hasClass("ok")) { thisfield.removeClass("ok maybe"); }
			}
			buttonstate( element );		
		});

		$(element).blur(function () {
			val = element.val();
			if( val != val.trim() ) { element.val(val.trim()); }
			if( !val || !validateConfirmationCode(val) ) {
				error["confirmation-code"] = "confirmation code";
			} else {
				if(error['confirmation-code']) {
					delete error['confirmation-code'];
					element.parents("form").clearErrors();
				}
			}
			buttonstate(element);
		});

		$(element).allchange(function () {
			var thisfield = element.parents(".field");
			var val = element.val();
			if( val != val.trim() ) { element.val(val.trim()); }
			if( val && validateConfirmationCode(val) ) {
				if(!thisfield.hasClass("ok")) { 
					thisfield.addClass("ok maybe"); 
					if(error['confirmation-code']) {
						delete error['confirmation-code'];
						element.parents("form").clearErrors();
					}
				}
			} else {
				if(thisfield.hasClass("ok")) { thisfield.removeClass("ok maybe"); }
			}
			buttonstate( element );	
		});

	}

	// loop through the fields to show any errors that remain
	$.fn.hasErrors = function(show) {
		var thisform = this;
		cansubmit = true;
		thisform.children("input:not(:focus)").each(function() {
			$(this).blur();
		});

		e = a = 0;
		after = "";
		errormessage = "Please ";

		// assemble an error message from the fields that have problems
		for ( var key in error) {
			if(key == "retype-password" || key == "password") {
				if(!a && e) {
					after += " and ";
				} else if(a) {
					after += ", and "
				}
				after += error[key];
				a++;
			} else if(!e) {
				errormessage += "correct your "+error[key];
				if(a) { errormessage += " and "; }
				e++;
			} else {
				if((e + 1) < Object.keys(error).length) { errormessage += ", "; }
				if((e + 1 || a) == Object.keys(error).length) { errormessage += " and "; }
				errormessage += error[key];
				e++;
			}
		}
		e = parseInt(e) + parseInt(a);
		if( e ) {

			if( e == 1 && $("#"+key) && show) { 
				$("#"+key).focus(); 
			}
			if(show) {
				thisform.children(".status").hide().addClass("error").html(errormessage+after+".").fadeIn("slow");
			}
			return true;
		} else {
			return false;
		}
	}

	// clear field errors as the user fixes them
	$.fn.clearErrors = function() {
		var thisform = this;
		if( thisform.hasErrors(false) ) {
			if( errcount != e && thisform.children(".status.error")[0] ) {
				errcount = e;
				thisform.children(".status").hide().addClass("error").html(errormessage+after+".").fadeIn("slow");	
			}
		} else {
			thisform.children(".status").not(":empty").slideUp(function() { $(this).css('display','block'); }).removeClass("error").html("");
			cansubmit = true;
		}
	}

	// slide open help messages
	$("a.help").on("click",function(e) {
		if(!e) e = window.event;
		e.preventDefault();
		e.stopImmediatePropagation();
		
		thisclass = $(this).attr("class");
		thisid = $(this).attr("id");
		if(thisclass.indexOf("active")!=-1 && $(".help-area").attr("data-shown")==thisid) {
			closehelp();
		} else {
			$("#"+thisid).addClass("active");
			thispos = $(this).offset();
			thistop = thispos.top;
			thistop = thistop - $(".site-header").height();
			thishelp = $(this).next(".details").html();
			$(".content-area:not(.shifted), .content-area.unshifted").addClass("shifted").removeClass("unshifted");
			$(".help-area").html(thishelp).attr("data-shown",thisid).css({"top":thistop}).delay(400).fadeIn(800);
			if(!$(".help-area span.close")[0]) { 
				$(".help-area").append('<span class="close"></span>'); 
			}

			// the "send again?" link should resend the previous "send-mail" form, without error checking etc. because it's already been sent
			if(thisid=='send-again') {
				$("form.send-mail").each(function() {
					var thisform = $(this);
					var thisaction = $(this).attr("action");
					var thisformdata = $(this).serialize();

					// if the form has class "pwd," add any NetID/password fields to the postdata
					if(	thisform.hasClass("pwd") && $("#password").val() && $("#netid").val() ) {
						thisformdata += "&current_password="+encodeURIComponent($("#password").val())+"&usc_net_id="+encodeURIComponent($("#netid").val());
					}
					
					$.ajax({
						"url": thisaction,
						"type": "POST",
						"data": thisformdata,
						"success": function(result) {
						var resultstatus = jQuery.parseJSON( result );

							if(resultstatus.success=="false") { 
								$(".help-area").html("Sorry, the message could not be sent. <a href=\"#\" class=\"reload\">Please try filling this form out again</a>, or contact ITS Customer Support at <a href=\"tel:+1-213-740-5555\">213&#8209;740&#8209;5555</a> or <a href=\"mailto:consult@usc.edu\">consult@usc.edu</a>.");
								$(".reload").on("click",function() { location.reload(true); });
							} else {
								// message was sent
							}
					
						}
					});
				});
			}
			
			
			$("html").on("click swipe touchend",function(e) {				
				var container = $(".help-area");
				if (!container.is(e.target) // if the target of the click isn't the container...					
					&& (e.target.className=="close" || container.has(e.target).length === 0)) // ... nor a descendant of the container
				{
					if(!e) e = window.event;
					e.preventDefault();
					e.stopImmediatePropagation();
					closehelp();
				}
			});
		}
	});

	// help message slides closed when user clicks the close button or clicks elsewhere in the document	
	closehelp = function() {
		if( $(".help.active")[0] ) { 
			$(".content-area.shifted").addClass("unshifted").removeClass("shifted");
			$(".help-area").fadeOut(200,function() { $(this).html(); });
			$(".help.active").removeClass("active");
		}
	}
	
	// add the "ok" class to the submit button when all fields have been entered correctly
	buttonstate = function(which) {
		thisform = which.parents("form");
		thisform.children(".field").each(function() {
			if( $(this).attr("class").indexOf("ok")==-1 ) {
				thisform.children("button.ok").removeClass("ok");
				return false;
			}
			
			thisform.children("button:not(.ok)").addClass("ok");
		});
	}


	// submit an AJAX form, receive a JSON result, then proceed to the next step

    $.fn.ajaxform = function() {

        $(this).on("submit",function(e) {
			if(!e) e = window.event;
			e.preventDefault();
			e.stopPropagation();
			
			var $form = $(e.currentTarget);
			var currentValues = $form.serialize();
			var previousValues = $form.attr('data-form-submit-single-last');
			if (previousValues === currentValues) {
				var thisform = $(this);
				thisform.children("button").addClass("state-error");
				return false; 
			} else {
				$form.attr('data-form-submit-single-last', currentValues);
			}
			
			$(this).hasErrors(false);
			
			// determine if the user has already tried to submit
			if(cansubmit) {
				cansubmit = false; 
				var thisform = $(this);
				var thisaction = $(this).attr("action");
				var thisformdata = $(this).serialize();

				// which step number is this?
				var thisclass = $(this).attr("class");
				if(thisclass.indexOf("step-")!=-1) { 
					var step = thisclass.substr(thisclass.indexOf("step-")+5);
					step = step.substr(0,step.indexOf(" "));
				}
			
				// clear any old errors away and check for remaining ones
				thisform.children(".status.error").removeClass("error").html("");
				if( !thisform.hasErrors(true) && thisform.children("button").hasClass("ok") ) {
		
					// if the form has class "pwd," add any NetID/password fields to the form data
					if(	thisform.hasClass("pwd") && $("#password").val() && $("#netid").val() ) {
						thisformdata += "&current_password="+encodeURIComponent($("#password").val())+"&usc_net_id="+encodeURIComponent($("#netid").val());
					}

					xhrabort(20); // cancel the request after 20 seconds

					xhr = $.ajax({
						"url": thisaction,
						"type": "POST",
						"data": thisformdata,
						"success": function(result) {
							if(timeout["xhr"]) { clearTimeout(timeout["xhr"]); }
							var resultstatus = jQuery.parseJSON( result );

							// JSON is returned with an unsuccessful result and an error message 
							if(resultstatus.success=="false") {
								if(resultstatus.message) { 
									var errortext = resultstatus.message; 
								} else {
									var errortext = thisform.children(".error-text.mismatch").html();
								}

								// show the error message using the form's status element
								thisform.children(".status").hide().addClass("error").html(errortext).delay(1200).fadeIn("slow",function() { cansubmit = true; });

								thisform.children("button").addClass("state-error");

								// if there was a problem with the email address, add class "error" to that field and focus it
								if( thisform.hasClass("send-mail") && thisform.children(".field.email input")[0] ) { $(".field.email").addClass("error").find("input")[0].focus(); }

							} else {
								thisform.children("button").addClass("state-success");
								// JSON is returned with a successful result
								thisform.delay(1200).fadeOut(200,function() { 

									$(".description:visible").slideUp(200);

									// special handling for a form with class "find-netid"
									if(thisclass.indexOf("find-netid")!=-1 && resultstatus.usc_net_id) { 
										var netid = resultstatus.usc_net_id;
										$(".cta").hide();
										
										// if the user has multiple USC NetIDs, show the list of NetIDs to choose from
										if(netid && netid.length>0 && netid[0].length>1) {
											var alternate_form = "multiple-netids";
											$("#"+alternate_form).fadeIn(400,function() { var thisclass = $(this).attr("class"); thisclass = thisclass.replace("alt","1"); $(this).attr("class",thisclass); cansubmit = true; });
											for ( var n = 0; n < netid.length; n++ ) {
												if(netid.length > 5) { many = ' class="many"'; } else { many = ''; }
												$(".choose-netid").append('<li'+many+'><input class="netid-option" id="netid-'+netid[n]+'" type="radio" name="usc_net_id" value="'+netid[n]+'"><label for="netid-'+netid[n]+'">'+netid[n]+'</label></li>');								
											}
											$(".netid-option").on("change",function() { $(this).parents("form").children("button").addClass("ok"); });
											$(".no-submit li input").remove();											
										} else {
								
											// put the returned NetID in the element with class "netid"
											$(".netid").html(netid); 
											$("input.netid-hidden").val(netid); 
										}
																				
										if(resultstatus.has_secondary) {
											var has_secondary = resultstatus.has_secondary;
											if(has_secondary=="false") {
												$(".cta").delay(400).fadeIn(400);
											}
										}
									}
									if(!alternate_form) {
														
										// advance to the next step
										var nextstep = parseInt(step)+1;
										
										$(".step-"+nextstep+".step").fadeIn(400,function() { 
											if($("input:visible")[0]) { $("input:visible")[0].focus(); }
											cansubmit = true;
										});
										$(".steps li.active").removeClass("active"); 
										$(".steps li#step-"+nextstep).addClass("active"); 
									}
							
									// when updating a secondary email address, put the old email address in the input field and highlight it to let the user delete and re-enter it
									if(resultstatus.email) { var email = resultstatus.email; $("#email").val(email).select(); }

									// if the result includes a password expiration date, show it
									if(resultstatus.expiration_date) { 

										exp = resultstatus.expiration_date;
										zone = "";
										expzone = new Date(exp).toString();
										if( expzone.indexOf("PST")==-1 && expzone.indexOf("PDT")==-1 && expzone.indexOf("Pacific")==-1 ) {
											zone = " Pacific";
										}
										var mo = parseInt(exp.substr(5,2)) - 1;
										var yr = exp.substr(0,4);
										var da = parseInt(exp.substr(8,2));
										var hh = exp.substr(11,2);
										var m = exp.substr(14,2);
										var dd = "am";
										var h = parseInt(hh);
										if (h >= 12) {
											h = hh - 12;
											dd = "pm";
										}
										if (h === 0) {
											h = 12;
										}
										if(m=="00") {
											var time = h + dd;									
										} else {
											var time = h + ":" + m + dd;
										}
										var months = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
		
										$(".expiration").html("Your current password expires "+months[mo]+" "+da+", "+yr+", at "+time+zone+".");
									}


									if( $("#confirmation-code")[0] ) {
										$("#confirmation-code").confirmationCheck();
									}
								});
							}
						},
						"error": function(error) {
							if(timeout["xhr"]) { clearTimeout(timeout["xhr"]); }
							cansubmit = true;
							// if there's an AJAX error, show a standard error message

							if(error.status==404) {
								var errortext = "It appears your request has timed out. Please <a href=\"javascript:history.go(0);\">reload the page</a> and try again. If you continue to see this message, please call ITS Customer Support at <a href=\"tel:+1-213-740-5555\">213&#8209;740&#8209;5555</a>"; 
							} else {
								var errortext = "Sorry, there was a problem submitting the form. Please <a href=\"javascript:history.go(0);\">reload the page</a> and try again. If you continue to see this message, please call ITS Customer Support at <a href=\"tel:+1-213-740-5555\">213&#8209;740&#8209;5555</a>"; 							
							}

							thisform.children(".status").hide().addClass("error").html(errortext).fadeIn("slow",function() { cansubmit = true; });

							$(thisform).children("button").removeAttr("disabled").removeClass("state-loading").addClass("state-error");
							$(".progress-inner").remove();
							
							// after options.statusTime remove status
							setTimeout( function() {
								$("button.state-error").removeClass("state-error");
							}, 1200 );
						}
					});
				} else {
					cansubmit = true;
					$(thisform).children("button").removeClass("state-loading").addClass("state-error");

					// after options.statusTime remove status
					setTimeout( function() {
						$("button.state-error").removeClass("state-error");
					}, 1200 );
				}
			}
		});
	}

	function xhrabort(secs) {
		var msecs = parseInt(secs)*1000;
		timeout["xhr"] = setTimeout( function() {
			xhr.abort();
			var errortext = "It appears your request has timed out.  Please <a href=\"javascript:history.go(0);\">reload the page</a> and try again. If you continue to see this message, please call ITS Customer Support at <a href=\"tel:+1-213-740-5555\">213&#8209;740&#8209;5555</a>"; 
			thisform.children(".status").hide().addClass("error").html(errortext).fadeIn("slow",function() { cansubmit = true; });

			$(thisform).children("button").removeAttr("disabled").removeClass("state-loading").addClass("state-error");
			$(".progress-inner").remove();

			// after options.statusTime remove status
			setTimeout( function() {
				$("button.state-error").removeClass("state-error");
			}, 1200 );
		}, msecs );	
	}
	
	// submit an AJAX form, receive a JSON result, then forward to another page in the "data-success" attribute
    $.fn.successform = function() {

		$(this).on("submit",function(e) {
			if(!e) e = window.event;
			e.preventDefault();
			e.stopImmediatePropagation();

			var $form = $(e.currentTarget);
			var currentValues = $form.serialize();
			var previousValues = $form.attr('data-form-submit-single-last');
			if (previousValues === currentValues) {
			  return false; 
			} else {
			  $form.attr('data-form-submit-single-last', currentValues);
			}
						
			// determine if the user has already tried to submit
			if(cansubmit) {
				cansubmit = false; 

				var thisform = $(this);
				var thisaction = $(this).attr("action");
				var thisformdata = $(this).serialize();
				var thisformsuccess = thisform.attr("data-success"); 

				// clear any old errors away and check for remaining ones
				thisform.children(".status.error").removeClass("error").html("");
				if( !thisform.hasErrors(true) && thisform.children("button").hasClass("ok") ) {

					// if the form has class "pwd," add any NetID/password fields to the form data
					if( thisform.hasClass("pwd") && $("#password").val() && $("#netid").val() ) {
						thisformdata += "&current_password="+encodeURIComponent($("#password").val())+"&usc_net_id="+encodeURIComponent($("#netid").val());
					}

					xhrabort(20); // cancel the request after 20 seconds

					xhr = $.ajax({
						"url": thisaction,
						"type": "POST",
						"data": thisformdata,
						"success": function(result) {
							if(timeout["xhr"]) { clearTimeout(timeout["xhr"]); }
							var resultstatus = jQuery.parseJSON( result );
					
							// JSON is returned with an unsuccessful result and an error message 
							if(resultstatus.success=="false") {
								thisform.children("button").addClass("state-error");	
								if(resultstatus.message) { 
									var errortext = resultstatus.message; 
								}
						
								// show the error message using the form's status element
								thisform.children(".status").hide().addClass("error").html(errortext).fadeIn("slow",function() { cansubmit = true; });
							} else {
								thisform.children("button").addClass("state-success").delay(1200).slideUp(10,function() {
									// forward to the success URL
									window.location = thisformsuccess;								
								});
							}
						},
						"error": function(error) {
							if(timeout["xhr"]) { clearTimeout(timeout["xhr"]); }
							cansubmit = true;		
							// if there's an AJAX error, show a standard error message
							if(error.status==404) {
								var errortext = "It appears your request has timed out. Please <a href=\"javascript:history.go(0);\">reload the page</a> and try again. If you continue to see this message, please call ITS Customer Support at <a href=\"tel:+1-213-740-5555\">213&#8209;740&#8209;5555</a>"; 
							} else {
								var errortext = "Sorry, there was a problem submitting the form. Please <a href=\"javascript:history.go(0);\">reload the page</a> and try again. If you continue to see this message, please call ITS Customer Support at <a href=\"tel:+1-213-740-5555\">213&#8209;740&#8209;5555</a>"; 							
							}

							thisform.children(".status").hide().addClass("error").html(errortext).fadeIn("slow",function() { cansubmit = true; });

							$(thisform).children("button").removeAttr("disabled").removeClass("state-loading").addClass("state-error");
							$(".progress-inner").remove();

							// after options.statusTime remove status
							setTimeout( function() {
								$("button.state-error").removeClass("state-error");
							}, 1200 );

						}
					});
				} else {
					$(thisform).children("button").addClass("state-error");

					// after options.statusTime remove status
					setTimeout( function() {
						$("button.state-error").removeClass("state-error");
						cansubmit = true;
					}, 1200 );
				}
			}
		});
	}

	// toggle between show/hide password
	var optiontoggle = function() {
		var currenttype = document.querySelector(".choose").dataset.choice; 
		if(currenttype!="office") { 
			thistype="office"; 
		} else { 
			thistype="google"; 
		}
		var forms = document.forms;
		for ( var f = 0; f < forms.length; f++ ) {
			var formNodes = forms[f].childNodes;
			for ( var z = 0; z < formNodes.length; z++ ) {
				var self = formNodes[z];
				if(self.className && self.className.indexOf("google")!=-1) {
					var passwordNodes = self.childNodes;
					for ( var y = 0; y < passwordNodes.length; y++ ) {
						var subself = passwordNodes[y];
						if ( subself.nodeName.toLowerCase() === 'input' ) {
							subself.type = thistype;
						}
					}
				}
			}
		}
		document.querySelector(".choose").dataset.choice = thistype;
		return false;
	}


    var slides = $('.choose li').length;
    var slideWidth = $('.choose').width();

	var choice = $(".choose").attr("data-choice");
	if("office"==choice) {
		opos = $(".choice").position();
		opos = opos.left;
		$(".choice").css({"left":opos+"px"});
		gpos = opos + 68;
	} else {
		opos = $(".choice").position();
		opos = opos.left;
		gpos = opos + 68;
		$(".choice").css({"left":gpos+"px"});
	}
	var mid = (opos + gpos) / 2;
    var min = opos;
    var max = gpos;

    $(".choice").draggable({
        axis: 'x',
        snap: true,
        containment: ".slidewrapper",
        stop: function (event, ui) {
        	if (ui.position.left < mid) { $(".choice").animate({"left":opos+"px"}, 250, function() { $(".choose").attr("data-choice","office"); }); $("button").addClass("ok"); $(".o365 a.toggler").addClass("active"); $(".ga a.toggler").removeClass("active"); }
            if (ui.position.left > mid) { $(".choice").animate({"left":gpos+"px"}, 250, function() { $(".choose").attr("data-choice","google"); }); $("button").addClass("ok"); $(".o365 a.toggler").removeClass("active"); $(".ga a.toggler").addClass("active"); }
        }
    });

	$(".ga a.toggler, .slide.google").on("click touchend swipe",function(e) {
		e.preventDefault();
		$(".choice").animate({"left":gpos+"px"}, 250, function() { $(".choose").attr("data-choice","google"); });
		$(".o365 a.toggler").removeClass("active"); 
		$(".ga a.toggler").addClass("active");
		$("button").addClass("ok");
	});

	$(".o365 a.toggler, .slide.office").on("click touchend swipe",function(e) {
		e.preventDefault();
		$(".choice").animate({"left":opos+"px"}, 250, function() { $(".choose").attr("data-choice","office"); });
		$(".o365 a.toggler").addClass("active"); 
		$(".ga a.toggler").removeClass("active");
//		$("button").removeClass("ok");
	});

	
	// focus the first visible field
	if($("input:visible")[0]) { $("input:visible")[0].focus(); }

	// format the various types of fields
	$("#bday").formatDate();
	$("#tendigitid").formatIDNumber();
	$("#email").formatEmail();
	$("#netid").formatNetID();
	$(".new-password").passwordsMatch();
	$("#password").passwordCheck(8);
	$("#enter-password").passwordCheck(12);
	
	// show/hide password toggle function should activate on click, touch, swipe
	$(".shown,.hidden").on("click touchend swipe",function(e) { 
		if(!e) e = window.event;
		e.preventDefault();
		e.stopPropagation();
		
	 	optiontoggle(); 
	 });
	
	// for multistep forms, show only the first step
	$("form.step:not(.step-1)").hide();

    $("form.success").successform();
    $("form.ajax").ajaxform();
	

	// progress button
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function ProgressButton( el, options ) {
		this.button = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}

	ProgressButton.prototype.options = {
		// time in ms that the status (success or error will be displayed)
		// during this time the button will be disabled
		statusTime : 1200
	};

	ProgressButton.prototype._init = function() {
		this._validate();
		// create structure
		this._create();
		// init events
		this._initEvents();
	};

	ProgressButton.prototype._validate = function() {
		// we will consider the fill/horizontal as default
		if( this.button.getAttribute( 'data-style' ) === null ) {
			this.button.setAttribute( 'data-style', 'fill' );
		}
		if( this.button.getAttribute( 'data-vertical' ) === null && this.button.getAttribute( 'data-horizontal' ) === null ) {
			this.button.setAttribute( 'data-horizontal', '' );
		}
	};

	ProgressButton.prototype._create = function() {
		var textEl = document.createElement( 'span' );
		textEl.className = 'content';
		textEl.innerHTML = this.button.innerHTML;
		var progressEl = document.createElement( 'span' );
		progressEl.className = 'progress';

		var progressInnerEl = document.createElement( 'span' );
		progressInnerEl.className = 'progress-inner';
		progressInnerEl.style.display = "block";
		progressEl.appendChild( progressInnerEl );
		// clear content
		this.button.innerHTML = '';
		this.button.appendChild( textEl );
		this.button.appendChild( progressEl );
		
		// the element that serves as the progress bar
		this.progress = progressInnerEl;

		// property to change on the progress element
		if( this.button.getAttribute( 'data-horizontal' ) !== null ) {
			this.progressProp = 'width';
		}
		this._enable();
	};

	ProgressButton.prototype._setProgress = function( val ) {
		this.progress.style[ this.progressProp ] = 100 * val + '%';
	};

	ProgressButton.prototype._initEvents = function() {
		var self = this; 
				
		this.button.addEventListener( 'click', function() {
			selfparent = self.button.parentNode.id;
			if( $("#"+selfparent+" button").hasClass("ok") ) {	
				// disable the button
				self.button.setAttribute( 'disabled', '' );	

				// added
				$("#"+selfparent+" button").addClass("state-loading");

				$("#"+selfparent).submit();
				
				setTimeout( function() {
					if( typeof self.options.callback === 'function' ) {
					
						self.options.callback( self );
					}
					else { 
						self._setProgress( 1 );
						var onEndTransFn = function( ev ) {
							if( ev.propertyName !== self.progressProp ) return;
							this.removeEventListener( 'webkitTransitionEnd',onEndTransFn );
							this.removeEventListener( 'oTransitionEnd',onEndTransFn );
							this.removeEventListener( 'MSTransitionEnd',onEndTransFn );
							this.removeEventListener( 'transitionend',onEndTransFn );
							self._stop();
						};
					
						self.progress.addEventListener( 'webkitTransitionEnd',onEndTransFn );
						self.progress.addEventListener( 'oTransitionEnd',onEndTransFn );
						self.progress.addEventListener( 'MSTransitionEnd',onEndTransFn );
						self.progress.addEventListener( 'transitionend',onEndTransFn );	
					}
				}, 200 );
			}
		});
	};

	ProgressButton.prototype._stop = function( status ) {
		var self = this;
		
		var selfparent = this.button.parentNode.id;
	
		setTimeout( function() {
			// fade out progress bar
			self.progress.style.opacity = 0;
			var onEndTransFn = function( ev ) {
				if( ev.propertyName !== 'opacity' ) return;
				this.removeEventListener( 'webkitTransitionEnd',onEndTransFn );
				this.removeEventListener( 'oTransitionEnd',onEndTransFn );
				this.removeEventListener( 'MSTransitionEnd',onEndTransFn );
				this.removeEventListener( 'transitionend',onEndTransFn );
				// added
				$("#"+selfparent+" button .progress").addClass("notransition");
				self.progress.style[ self.progressProp ] = '0%';
				self.progress.style.opacity = 1;
			};

			self.progress.addEventListener( 'webkitTransitionEnd',onEndTransFn );
			self.progress.addEventListener( 'oTransitionEnd',onEndTransFn );
			self.progress.addEventListener( 'MSTransitionEnd',onEndTransFn );
			self.progress.addEventListener( 'transitionend',onEndTransFn );
			
			var statusClass = '';
			self.button.removeAttribute( 'disabled' );
			// remove class state-loading from the button
			$("#"+selfparent+" button").removeClass("state-loading");
			
			// after options.statusTime remove status
			setTimeout( function() {
				$("#"+selfparent+" button.state-success").removeClass("state-success");
				$("#"+selfparent+" button.state-error").removeClass("state-error");

				self._enable();
			}, self.options.statusTime );
		}, 100 );
	};

	// enable button
	ProgressButton.prototype._enable = function() {
		this.button.removeAttribute( 'disabled' );
	}

	// add to global namespace
	var ProgressButton = ProgressButton;

	[].slice.call( document.querySelectorAll( 'button' ) ).forEach( function( bttn ) {
		new ProgressButton( bttn, {
			callback : function( instance ) { 						
				var progress = 0,
					interval = setInterval( function() { 
						progress = Math.min( progress + Math.random() * 0.1, 1 );
						instance._setProgress( progress );
						if( progress === 1 ) {
							if( $("#"+bttn.parentNode.id+" button").hasClass("state-success") || $("#"+bttn.parentNode.id+" button").hasClass("state-error") ) {
								instance._stop();
								clearInterval( interval );
							}
						}
					}, 44 );
			}
		} );
	} );

}); //end document ready function
