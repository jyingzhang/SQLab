"use strict";

let endpoint = "https://czlz7p3bq8.execute-api.us-east-1.amazonaws.com/default/SQLab/";
let questionList; 

let i = 0;

//put supporting functions for ajax calls here

let addToDatabase = () => {
    //error trapping

    let usernameVal = $("#username").val()
    let username = $("#username_admin").val(usernameVal);
    let question = $("#sql_question_admin").val()
    let answer = $("#sql_answer_admin").val()
    let difficulty = $("#admin-difficulty").val()

    if(question== undefined || question == ""){
        $("#admin-message").html("You must enter a question");
        $("#admin-message").addClass("alert alert-success");
        return;
    }

    if(answer == undefined || answer == ""){
        $("#admin-message").html("You must enter an answer");
        $("#admin-message").addClass("alert alert-danger");
        return;
    }

    if(difficulty == undefined || difficulty == ""){
        $("#admin-message").html("You must select a difficulty.");
        $("#admin-message").addClass("alert alert-danger");
        return;
    }
    
    let the_serialized_data = $("#form-admin").serialize()
    console.log(the_serialized_data)

    $.ajax({
        url: endpoint+"questions",
        data: the_serialized_data,
        method: "POST",
        success: (results) => {
            console.log(results);
            $("#admin-message").show();
            $("#admin-message").html('Question added.');
            $("#admin-message").addClass('alert alert-success');
        },
        error: (data) => {
            console.log(data);
            $("#admin-message").show();
            $("#admin-message").html('Error. Try again.');
            $("#admin-message").addClass('alert alert-danger');
        }
    })
}

let getQuestions = (difficulty) => {
 
    if (difficulty == 1){
        $('#difficulty').val('1');
    }

    if (difficulty == 2){
        $('#difficulty').val('2');
    }
    
    if (difficulty == 3){
        $('#difficulty').val('3');
    }

    $("#div-sqlQuery").show();

    let the_serialized_data = $("#form-question-difficulty").serialize();
    console.log(the_serialized_data);

    $.ajax({
        url: endpoint+'questions',
        data: the_serialized_data,
        method: "GET",
        success: (results) => {
            console.log(results);
            questionList = results;
            //let questionNumberToShow = ((questionList[0]["question_id"])+1)+") ";
            let questionNumberToShow = (i+1)+") ";
            let questionTextToShow = (questionList[0]["question"]);
            $(".qn").html(questionNumberToShow);
            $(".qt").html(questionTextToShow);

            console.log('questionNumToShow:', questionNumberToShow);
            //showQuestions(questionList);
            return questionList;
        },
        error: (data) => {
            console.log('error');
            console.log(data);
        }
    })
}

let nextQuestion = () => {

    //let questionNumber = parseInt($('.qn').html());
    //console.log("questionNumber:" + questionNumber)
    let questionString = $(".qn").html();
    let questionValue = questionString.replace(") ", "");
    questionValue = parseInt(questionValue);

    console.log('questionNumber', questionValue);
    let listLength = questionList.length;

    if (questionValue == questionList.length){
        $("#nextMessage").show();
        $("#nextMessage").html("There are no more questions left").delay(2000).fadeOut();
        $("#nextMessage").addClass("alert alert-danger")
        return;
    }

    let questionNumberToShow = questionValue;
    //let questionNumberToShow = ((questionList[questionNumber]["question_id"])+1) +") ";
    console.log("line 69: " + questionNumberToShow)
    //let questionNumberToShow = ((questionList[questionNumber]["question_id"])+1) +") ";
    questionValue+=1; 

    let questionTextToShow = (questionList[questionValue-1]["question"]);
    
    
    $(".qn").html((questionNumberToShow+1)+") ");
    $(".qt").html(questionTextToShow);
}

let previousQuestion = () => {

    let questionString = $(".qn").html();
    let questionValue = questionString.replace(") ", "");
    questionValue = parseInt(questionValue)-1;

    console.log('questionValue', questionValue);

    if(questionValue == 0){
        $("#backMessage").show();
        $("#backMessage").html("There are no questions to go back to!").delay(2000).fadeOut();
        //same with this as the next question message
        $("#backMessage").addClass("alert alert-danger")
        //do remove 
        return;
    }

    let questionNumberToShow = questionValue;
    let questionTextToShow = (questionList[questionValue-1]["question"]);

    $(".qn").html((questionNumberToShow)+") ");
    $(".qt").html(questionTextToShow);
    
}

let checkAnswer = () => {

    let sql_query = $('#sql_query').val();
    //console.log('sql query:', sql_query);

    if(sql_query != ""){
        $("#checkAnswer").hide()
        $("#spinner1").show();
    }

    //filling in form for required fields
    let username = $('#username').val();
    $("#username_sql").val(username);
    console.log('username:', username);

    let question_id = $('.qn').html();
    question_id = question_id.replace(") ", "");
    question_id = (parseInt(question_id))-1; //the indexer
    question_id = questionList[question_id]['question_id'];
    $("#question_id_sql").val(question_id);
    //console.log('quesiton id:', question_id);

    let difficulty = $("#difficulty").val();
    $("#difficulty_sql").val(difficulty);
    //console.log('difficulty:',difficulty);


    if(sql_query == "" || sql_query == undefined){
        $("#sql_message").html("You must enter a query to check")
        $("#sql_message").addClass("alert alert-danger")
        return;
    }
    let the_serialized_data = $("#form-sql_query").serialize();
    console.log(the_serialized_data);

    $.ajax({
        url: endpoint + "checkAnswer",
        data: the_serialized_data,
        method: "GET",
        success: (results) => {
            $("#sql_message").hide();
            $("#checkAnswer").show()
            $("#spinner1").hide();
            $("#correct").show();
            console.log(results);
            console.log(results[0]);
        
            let response = results[0];
            let incorrect = "Incorrect. Try again.";
            let correct = "Correct!";
        
            if(response == incorrect){
                $("#correct").hide();
                $("#correctImage").hide();
                $("#wrong").show("Try again. This answer is incorrect");
                $("#wrong").html("Try again. This answer is incorrect");
                $("#wrong").addClass("alert alert-danger");
                $("#wrongImage").show("alert alert-danger");
            }
            
            if(response == correct){
                $("#wrong").hide();
                $("#wrongImage").hide();
                $("#correct").show("Congratulations! This answer is correct!");
                $("#correct").html("Congratulations! This answer is correct!");
                $("#correct").addClass("alert alert-success");
                $("#correctImage").show("alert alert-success");
            }
        },
        error: (data) => {
            $("#sql_message").hide();
            $("#checkAnswer").show()
            $("#spinner1").hide();
            console.log(data);
            console.log(data['responseJSON']);
        
            let response = data['responseJSON'];
            let unexpected = "Unexpected error. (checkAnswers)";
        
            if(response == unexpected){
                $("#correct").hide();
                $("#correctImage").hide();
                $("#wrong").show("Check your syntax!");
                $("#wrong").html("Check your syntax!");
                $("#wrong").addClass("alert alert-danger");
                $("#wrongImage").show("alert alert-danger");
        
                //console.log("Check your syntax! The database did not understand your message");
            }
        }
    })
    //check your syntax, your query might be wrong - goes in error
    //use 0 index from json response as the message as well - goes in success even if the answer is wrong or right! -- show check and x mark

}

let allScores = () => {
    $.ajax({
        url: endpoint + "scores",
        data: null,
        method: "GET",
        success: (results) => {
            console.log(results);

            var topFivePlayersName = [];
            var topFivePlayersScore = [];
            
            for (let i = 0 ; i < results.length; i++) 
            {
                topFivePlayersName.push(results[i]['username']);
                topFivePlayersScore.push(results[i]['score']);
            }

            // console.log(topFivePlayersName);
            // console.log(topFivePlayersScore);

            const topFiveUsers = topFivePlayersName;
            //console.log('topFiveUsers: '+ topFiveUsers);

            //localStorage.setItem("vOneLocalStorage", topFivePlayersName);  

            runLeaderboard(topFivePlayersName, topFivePlayersScore);
        },
        error: (data) => {
            console.log("error");
            console.log(data);
        }
    })
}

let playerScore = (username) => {
    $.ajax({
        url: endpoint + "userScore",
        data: "username="+username,
        method: "GET",
        success: (results) => {
            console.log(results);
            let score = results[0]['score'];
            $("#number").html(score);
        },
        error: (data) => {
            console.log("error");
            console.log("data");
        }
    })
}

let signupController = () => {


    $('#signup_message').html("");
    $('#signup_message').removeClass();
    
    let newusername = $("#newusername").val();
    let newpassword = $("#newpassword").val();
    let newpassword2 = $("#newpassword2").val();
    let email = $("#email").val();
    let admin_or_client = $("#signup_as-signup").val();

    if (newusername == "" || newpassword == "" || newpassword2 == "" || email == "" || admin_or_client == undefined){
        $('#signup_message').html('All fields are required.');
        $('#signup_message').addClass("alert alert-danger text-center");
        return; //quit the function now!   
    }

    if(newpassword.length < 8){
        $('#signup_message').html('Password is too short.');
        $('#signup_message').addClass("alert alert-danger text-center");
        return; //quit the function now!  

    }

    if (admin_or_client == ""){
        $('#signup_message').html("Please indicate if you're an admin or student");
        $('#signup_message').addClass("alert alert-danger text-center");
        return; //quit the function now!  
    }

    if(newpassword != newpassword2){
        $('#signup_message').html('The passwords do not match. Please try again.');
        $('#signup_message').addClass("alert alert-danger text-center");
        return; //quit the function now!  

    }

    let the_serialized_data = $("#form-signup").serialize();
    console.log(the_serialized_data);
    //ajax call goes here
    $.ajax({
        url: endpoint + "users",
        data: the_serialized_data,
        method: "POST",
        //does not matter what the variable inside the parantheses are called -- as long as you name it something that the response can understand
        success: (results) => {
            console.log(results);
            $("#username").val(newusername);
            $("#password").val(newpassword2);
            $(".content-wrapper").hide();
            $("#div-login").show();
        },
        error: (data) => {
            console.log(data);
            $('#signup_message').html(data['responseJSON']);
            $('#signup_message').addClass("alert alert-danger text-center");
            return; //quit the function now! 
        }
    })
}

let loginController = () => {

    //$(".content-wrapper").hide();   /* hide all content-wrappers */
    $(".topnav").hide(); // want to show the top nav for all of the pages except for main login page

    //focus on the button
            
    //clear any previous messages
    $('#login_message').html("");
    $('#login_message').removeClass();

    //error trapping.
    let username = $("#username").val();
    let password = $("#password").val();
    
    if (username == "" || password == ""){
        $('#login_message').html('The user name and password are both required.');
        $('#login_message').addClass("alert alert-danger text-center");
        return; //quit the function now!   
        console.log('no info presented');
    }
    
    let the_serialized_data = $("#form-login").serialize();
    console.log(the_serialized_data);

    $.ajax({
        url: endpoint + "auth",
        data: the_serialized_data,
        method: "GET",
        success:(results) => {
            console.log(results);
            //login succeeded.  Set userid.
            localStorage.userid = results[0]['user_id']; // adam has a userid of 1 
            $("#userid").val(localStorage.userid)
            //manage the appearence of things...
            $(".topnav").show();
            //show nav here so that it doesnt show right when you click login!!
            $('#login_message').html('');
            $('#login_message').removeClass();
            $('.secured').removeClass('locked');
            $('.secured').addClass('unlocked');
            $('#div-login').hide(); //hide the login page
            $('#div-homepage').show();   //show the default page

            if (results[0]["admin_or_client"] == "A"){
                $("#adminIcon").show();
            }

            playerScore(username);
            allScores();
        },
        error: (data) => {
            console.log(data);
            // login failed.  Remove userid 
            localStorage.removeItem("userid");

            if (data['responseJSON'] == "You are not a student"){
                $('#login_message').html("You are not a student. Try again.");
                $('#login_message').addClass("alert alert-danger text-center");
            }
            else if (data['responseJSON'] == "You are not an admin"){
                $('#login_message').html("You are not an admin. Try again.");
                $('#login_message').addClass("alert alert-danger text-center");
            } else {
            $('#login_message').html("Login Failed. Try again.");
            $('#login_message').addClass("alert alert-danger text-center");
            }
        }
    });

    //scroll to top of page
    $("html, body").animate({ scrollTop: "0px" });
}

//document ready section
$(document).ready( () => {
   
        // if ( localStorage.userid   ){
        //     $("#userid").val(localStorage.userid)
        //     $('.secured').removeClass('locked');
        //     $('.secured').addClass('unlocked');
        //     $('#div-login').hide(); //hide the login page
        //     $('#div-homepage').show();   //show the default page
        //     playerScore(username);
        //     allScores();
        // }

        //changes the http to https
        let loc = window.location.href+'';
        if (loc.indexOf('http://')==0){
            window.location.href = loc.replace('http://','https://');
        }

        /* ------------------  basic navigation -----------------*/ 
        /* this controls navigation - show / hide pages as needed */

        /* what happens if the login button is clicked? */

        /* what happens if the btnsignup tag is clicked? */
        $('#btnsignup').click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").hide(); // want to show the top nav for all of the pages except for main login page and the sign up page!!!
            $("#div-signup").show(); /* show the chosen content wrapper */
        });

        $('#btnCreateAccount').click( () => {
            signupController();
            $("#newusername").val("");
            $("#newpassword").val("");
            $("#newpassword2").val("");
            $("#email").val("");
        });

        $('#btnCancelMakeAccount').click( () => {
            $("#newusername").val("");
            $("#newpassword").val("");
            $("#newpassword2").val("");
            $("#email").val("");
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").hide(); // want to show the top nav for all of the pages except for main login page
            $("#div-login").show(); /* show the chosen content wrapper */
        });

        $('#btnLogin').click( () => {
            //$(".content-wrapper").hide();   /* hide all content-wrappers */
            //$(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            //$("#div-homepage").show(); /* show the chosen content wrapper */
            loginController();
        });

        $('#quiz').click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            $("#div-difficulty").show(); /* show the chosen content wrapper */
        });

        $('#learn').click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            $("#div-yes").show(); /* show the chosen content wrapper */
        });

        $('#easy').click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            $("#div-easy").show(); /* show the chosen content wrapper */
            $("#sql_query").val("")
            $("#wrong").hide();
            $("#correct").hide();
            $("#wrongImage").hide();
            $("#correctImage").hide();
 

            i = 0;
            getQuestions(1);

        });

        $('#medium').click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            $("#div-medium").show(); /* show the chosen content wrapper */
            $("#sql_query").val("")
            $("#wrong").hide();
            $("#correct").hide();
            $("#wrongImage").hide();
            $("#correctImage").hide();

            
            i = 0;
            getQuestions(2);       
        });

        $('#hard').click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            $("#div-hard").show(); /* show the chosen content wrapper */
            $("#sql_query").val("")
            $("#wrong").hide();
            $("#correct").hide();
            $("#wrongImage").hide();
            $("#correctImage").hide();


            i = 0;
            getQuestions(3);
        });

        $('#back').click( () => {
            console.log('back button clicked');
            previousQuestion();
            $("#sql_query").val("")
            $("#correct").hide();
            $("#correctImage").hide();
            $("#wrong").hide();
            $("#wrongImage").hide();
            $("#sql_message").hide()
        });

        $('#next').click( () => {
            console.log('next button clicked');
            nextQuestion();
            $("#sql_query").val("");
            $("#correct").hide();
            $("#correctImage").hide();
            $("#wrong").hide();
            $("#wrongImage").hide();
            $("#sql_message").hide()
        });  
        
        $("#checkAnswer").click( () => {
            checkAnswer();
        });

        $("#homepageIcon").click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            $("#div-homepage").show(); /* show the chosen content wrapper */
            let username = $("#username").val();

            allScores();
            playerScore(username);
            console.log('homepageicon clicked');
        });

        $("#adminIcon").click( () => {
            $(".content-wrapper").hide();   /* hide all content-wrappers */
            $(".topnav").show(); // want to show the top nav for all of the pages except for main login page
            $("#div-admin").show(); /* show the chosen content wrapper */
        });

        $("#addToDatabase").click( () => {
            addToDatabase();
        });
        

    }); /* end the document ready event*/
    