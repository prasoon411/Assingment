var urllinkforskill = 'https://diracjobtest.appspot.com/';//API Link for Google Cloud
var urllinkforquestion = 'https://ft-goutam-bose1511.oraclecloud2.dreamfactory.com/api/v2/questionbank/_table/savsoft_qbank?fields=question&limit=3&api_key=ba3047c6a6e01f8fee570c6e6730f7a6d6dd8fb2acddfb04ddcbe669b806516d&filter=cid=';//API link for questions to be displayed depending on skill
var urllinkforcid = 'https://ft-goutam-bose1511.oraclecloud2.dreamfactory.com/api/v2/questionbank/_table/savsoft_category?api_key=ba3047c6a6e01f8fee570c6e6730f7a6d6dd8fb2acddfb04ddcbe669b806516d&fields=cid&filter=category_name%20LIKE%20%';/*API link to retrieve cid depending on skill to retrieve questions*/
var htmltoshow = '';
var nocounter = 0;
var yescounter = 0;
var maindata;

function callchatwindow(t){//open chat window after Google Cloud API responds
	htmltoshow = '<div class="msg"><p>'+t.string+'</p></div>';
	$('#chatbox').html(htmltoshow);//Show initial message responded by Google Cloud API
	$('.hidetillgo').show();//Show buttons of Yes and No
};

function ajaxcall(t){//Calling Google Cloud API
		urllinkforskill = urllinkforskill + t;//Concatenate job code with link
		$.getJSON(urllinkforskill, function(data){//Callback function to initialize chat window
				maindata = data;
				callchatwindow(data);
			});
};

function questioncall(t){//Function to show questions from Cleartest API
		if(t.toLowerCase()==='database'){//Exception to handle keyword database as skill
			urllinkforcid = 'https://ft-goutam-bose1511.oraclecloud2.dreamfactory.com/api/v2/questionbank/_table/savsoft_category?api_key=ba3047c6a6e01f8fee570c6e6730f7a6d6dd8fb2acddfb04ddcbe669b806516d&fields=cid&filter=category_name%20LIKE%20'+t;
		}
		else{
			urllinkforcid = urllinkforcid + t + '%';//Concatenate skill inserted with link to retrieve cid
		}
		$.getJSON(urllinkforcid, function(data){//callback to handle API call for cid of skill
			if(data['resource'].length > 0) {//Exception handling 
				console.log(data['resource'][0]['cid']);
				urllinkforquestion = urllinkforquestion + data['resource'][0]['cid'];
				$.getJSON(urllinkforquestion , function(data) {//Callback to handle the questions retrieved from Question API
					if(data['resource'].length > 0) {//Exception handling
						htmltoshow = htmltoshow + '<div class="msg">';//Attaching the questions retrieved
						for(var i=0;i<data['resource'].length;i++)
							htmltoshow = htmltoshow + '<p>'+ data['resource'][i]['question']+'</p>';
						htmltoshow = htmltoshow + '<p>Do you wish to see more questions like this and take a full test for interview preparation?</p></div>';
						$('#chatbox').html(htmltoshow);//Showing the updated chat
						$('.extra-rounded').attr('disabled',false);
					}
					else {//In case no questions returned or something went wrong with API call for questions
						htmltoshow = htmltoshow + '<div class="msg">'+ '<p>No question found as of now. Do you wish to see more questions like this and take a full test for interview preparation?</p></div>';;
						$('#chatbox').html(htmltoshow);
						$('.extra-rounded').attr('disabled',false);
					}
				});
			}
			else {//In case no cid returned for the skill
				htmltoshow = htmltoshow + '<div class="msg">'+ '<p>No question found as of now. Do you wish to see more questions like this and take a full test for interview preparation?</p></div>';;
				$('#chatbox').html(htmltoshow);
				$('.extra-rounded').attr('disabled',false);
			}
		});	
};

$(document).ready(function(){
	$('#ajaxhit').on('click',function(){//Calling the main Google cloud API after clicking the 'Send' button to send the Jobcode
		var title = $('#textfield').val();
		ajaxcall(title);
		$('#textfield').val("");//clear the input textbox for reuse
	});
	$(document).on('click','#yes',function(){//Function to handle the click of 'Yes' button
		yescounter = yescounter + 1;
		htmltoshow = htmltoshow + '<div class="msg darker"><p> YES </p></div>';
		$('#chatbox').html(htmltoshow);
		$('.extra-rounded').attr('disabled',true);//Disabling the 'Yes/No' buttons to restrict over-clicking of those buttons
		if((yescounter==1)&&(maindata.skills!='0')){/*If Skill found by Google API and user clicks 'Yes' once to indicate he wants to see questions*/
			questioncall(maindata.skills);
		}
		if((yescounter==1)&&(maindata.skills=='0')){//If no skill returned by Google API but user wants to type in question
			$('#skillsend').attr('disabled',false);//Show the textbox to insert skill from user
			$('.hidetilltrigger').show();//Button to send user entered skill
		}
		if((yescounter==2)&&(nocounter==0)){//User wants to see more questions hence redirected to Cleartest
			window.location.href = "http://cleartest.diracsol.com/2017SummerTrg/index.php";
		}
	});
	$('#skillsend').click(function(){//Function to handle the user entered skill and show questions from Cleartest
		var skillsent = $('#skilltext').val();
		$('.hidetilltrigger').hide();
		htmltoshow = htmltoshow + '<div class="msg darker"><p>'+skillsent+'</p></div>';
		$('#chatbox').html(htmltoshow);
		questioncall(skillsent);
	});
	$(document).on('click','#no',function(){//If user clicks No once just close the chat
		$('.hidetillgo').hide();
	});
});