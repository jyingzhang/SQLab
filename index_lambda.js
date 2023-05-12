// MIS3502 - Project 4: SQLab
// Created by: Ying Zhang and Najuk Patel
// Spring 2023

// NOTES ************************************************
// You should raise the default lambda timeout 
// from 3 seconds to 3 minutes

// declarations *****************************************
const qs = require('qs'); //for parsing URL encoded data
const axios = require('axios'); // for calling another API
const base64 = require('js-base64'); // encode / decode
const mysql = require('sync-mysql');  //for talking to a database


// Put your database connection information here.

//database credentials hidden!!
const dboptions = {
  'user' : 'xxxxx',
  'password' : 'xxxxx',
  'database' : 'mis259cherry',
  'host' : 'dataanalytics.temple.edu'
};

const dboptions2 = {
  'user' : 'xxxxx',
  'password' : 'xxxxx',
  'database' : 'moviedb',
  'host' : 'dataanalytics.temple.edu'
};


const connection = new mysql(dboptions);
const connection2 = new mysql(dboptions2);

const features = [
	"Issue a POST against ./users to create a new user record. You must provide the following keys: username, password, email, signup_as (client or admin). The API will respond with the userid of the newly created record.",
	"Issue a GET against ./auth and provide a username, password, and login_as (admin or client).  The API will respond with a JSON object containing all the user information except the password.",
	"Issue a GET against ./questions . User must difficulty (1, 2, 3). The API will return a single object containing the correct SQL statement",
	"Issue a GET against ./checkAnswer. Must provide username, question_id, difficulty, sql_query. The API will return with a single object of the result of the query answer.",
	"Issue a PATCH to ./users to update user score. You must provide the username and difficulty level (1, 2, 3). The API will respond with the username and updated score. ",
	"Issue a GET to ./scores to retrieve scores for all users. The API will respond with a list of top five users and their scores.",
	"Issue a GET to ./userScore to retrieve userscore. Must provide username. The API will return user score. ",
	"Issue a POST ./questions to add questions to the bank. The user must provide username, sql_question, difficulty, and sqlanswer. The API will respond with the question_id of the newly created question.",
	"This API belongs to Najuk Patel and Ying Zhang"
	];


// supporting functions *********************************

let createQuestion = (res, body) => {
    let username = body.username;
    let question = body.sql_question;
    let difficulty = body.difficulty;
    let answer = body.sql_answer;

    if (username == undefined || username.trim() == ""){
        return formatres(res,"You must provide a username",400);
    }
    
    if (difficulty == undefined || difficulty == ""){
        return formatres(res,"You must provide a difficulty of 1, 2, or 3",400);
    }
    
    if (question == ""){
        return formatres(res,"You must provide a question",400);
    }
    
    if (answer == ""){
        return formatres(res,"You must provide an answer to the question",400);
    }
    
    let txtSql = "select count(*) as qty from questions where question = ?";
    var results = connection.query(txtSql,[question]);
    if ( results[0]['qty'] > 0 ){
        return formatres(res,'Question already exists',400);
    }

    let txtSql2 = "insert into questions (question,answer,difficulty) values (?,?,?)";

    try {
      var results2 = connection.query(txtSql2,[question,answer,difficulty]);
    }
    catch(e){
        console.log(e);
        return formatres(res,'Unexpected error. (createQuestion)',500);
    }
    
    return formatres(res,results2.insertId,200);
}

let getQuestionList = (res, query) => {
    let difficulty = query.difficulty;
    
    if (difficulty == undefined || difficulty == ""){
        return formatres(res,"You must provide a difficulty of 1, 2, or 3",400);
    }
    
    //do some work and return the result

    let txtSQL = "SELECT question_id, question FROM questions where difficulty = ?";
    try {
	    var results = connection.query(txtSQL,[difficulty]);
    }
    catch(e){
    	return formatres(res,'Unexpected error. (getQuestionList)',500);
    }
    
    return formatres(res,results,200);

}

let updateScore = (res, query) => {
    
    let difficulty = query.difficulty;
    let username = query.username;
    
    if (username == undefined || username.trim() == ""){
        return formatres(res,"You must provide a username",400);
    }
    
    if (difficulty == undefined || difficulty == ""){
        return formatres(res,"You must provide a difficulty of 1, 2, or 3",400);
    }

    //adding points/update user score
    let txtSQL_addPoints = "UPDATE users SET score = score + ? WHERE username = ?;";
    let txtSQL_newScore = "SELECT username, score FROM users WHERE username = ?;";
    
    try {
        var addPoints = connection.query(txtSQL_addPoints, [difficulty, username]);
        var newScore = connection.query(txtSQL_newScore, [username]);
        var results = [addPoints, newScore]
    }catch(e){
        return formatres(res, 'Unexpected error. (getQuestionList, addPoints)',500);
    }
    
    return formatres(res,results,200);

}

let checkAnswer = (res, query) => {
    
    //error trapping
    let username = query.username;
    let question_id = query.question_id;
    let difficulty = query.difficulty;
    let sql_query = query.sql_query;
    let results = "";
    
    if (username == undefined || username.trim() == ""){
        return formatres(res,"You must provide a username",400);
    }
    if (question_id == "" || question_id == undefined){
        return formatres(res, "You must provide a question_id",400)
    }
    if (difficulty == undefined || difficulty == ""){
        return formatres(res,"You must provide a difficulty of 1, 2, or 3",400);
    }
    if (sql_query == "" || sql_query == undefined) {
        return formatres(res,"You must provide a SQL query.",400);
    }
    if (isNaN(question_id)) {
        return formatres(res, "question_id must be a number",400)
    }
    
    //TEST CASE! MAKE SURE TO CHANGE!!!!!!!
    
    let txtSQL_user = sql_query;
    //let txtSQL_user = "SELECT title FROM film WHERE film_id = 750;";
    let txtSQL_correctAnswer = "SELECT answer FROM questions WHERE question_id = ?";
    
    try {
        
        //getting formatting user_answer
	    var user_answer = connection2.query(txtSQL_user);
	    user_answer = user_answer;
	    user_answer = Object.values(user_answer);
        var user_answer1 = '';
	    
	    //extracting list of values(answers without keys aka column names)
	    for (let i = 0; i < user_answer.length; i++) {
	        user_answer1 += (Object.values(user_answer[i]));
	        if (i<user_answer.length-1){
	            user_answer1+=',';
	        }
	    }
	    
	    //getting correct_answer
	    var correct_answer = connection.query(txtSQL_correctAnswer, [question_id]);
	    correct_answer = correct_answer[0]['answer'];

    }catch(e){1
    	return formatres(res, 'Unexpected error. (checkAnswers)',500);

    }
    
    //checking answer
	if (user_answer1 == correct_answer){
        results = "Correct!"
        updateScore(res,query)
    }
    else {
        results = "Incorrect. Try again."
    }
    
    let results1 = [results, 'user answer: '+ user_answer1, 'correct answer: ' +correct_answer]
    return formatres(res,results1,200);
}

let getAllScores = (res, query) => {
    let txtSQL_getScores = 'SELECT username, score FROM users ORDER BY score DESC LIMIT 5';

    try {
        var results = connection.query(txtSQL_getScores);
    }catch(e){
        return formatres(res, 'Unexpected error. (getAllScores)',500);
    }
    
    return formatres(res,results,200);
}

let getUserScore = (res, query) => {
    let username = query.username;
    
    if (username == undefined || username.trim() == ""){
        return formatres(res,"You must provide a username",400);
    }
    
    let txtSQL_userScore = "SELECT score FROM users WHERE username = ? ";

    try {
        var results = connection.query(txtSQL_userScore, [username]);
    }catch(e){
        return formatres(res, 'Unexpected error. (getUserScore)',500);
    }
    
    return formatres(res,results,200);
}

let authenticate = (res,query) => {
	
	// error trapping
	if (isEmpty(query)){
		return formatres(res,"You must provide a username and password.",400);
	}

    let username = query.username;
    //username = username.toString();
    let password = query.password;
    //password = password.toString();
    let admin_or_client = query.login_as;
    
    if (admin_or_client == "admin"){
	    admin_or_client = "A" ;
	}
	
	if (admin_or_client == "client"){
	    admin_or_client = "C" ;
	}

    if (username == undefined || username.trim() == ""){
        return formatres(res,"You must provide a username",400);
    }

    if (password == undefined || password.trim() == "" || password.length < 8 ){
    	return formatres(res,"You must provide a password",400);
    }
    
    if (admin_or_client == undefined || admin_or_client == ""){
        return formatres(res,"Are you an admin or client?",400);

    }
	
	//do some work and return the result
	
	let txtSQL_admin_or_client = "SELECT admin_or_client FROM users WHERE username = ?;";
    let txtSQL = 'SELECT user_id, username, password, email, score, admin_or_client FROM users WHERE username = ? AND password = ?';
    
    try {
        var admin_or_client_results = connection.query(txtSQL_admin_or_client,[username]);
	    var signin_results = connection.query(txtSQL, [username, password]);
    }
    catch(e){
    	return formatres(res,'Unexpected error.  (authenticate)',500);
    }
    
    let message = [signin_results,username,password,"Login Failed"];

    if (signin_results.length == 0){
        return formatres(res,message, 400);
    }
    
    admin_or_client_results = admin_or_client_results[0]['admin_or_client'];
    
    if ((admin_or_client_results == "C") && (admin_or_client == "A")){
        return formatres(res,"You are not an admin", 400);
    }
    
    if ((admin_or_client_results == "A") && (admin_or_client == "C")){
        return formatres(res,"You are not a student", 400);
    }

	return formatres(res,signin_results,200);
}

let makeUser = (res,body) => {

	//error trapping
    let username = body.username;
    let password = body.password;
    let email = body.email;
    let admin_or_client = body.signup_as;

    if (username == undefined || username.trim() == ""){
        return formatres(res,"You must provide a username",400);
    }

    if (password == undefined || password.trim() == "" || password.length < 8 ){
        return formatres(res,"You must provide a password",400);

    }
    
    if (admin_or_client == undefined || admin_or_client == ""){
        return formatres(res,"Are you an admin or client?",400);

    }
	

    let pos0 = password.indexOf(' ');
    
    if (pos0 != -1 ){
       return formatres(res,"The password may not contain blank spaces. ",400);
    }

    if (email == undefined || email.trim() == ""){
       return formatres(res,"You must provide an email",400);
    }

    let pos1 = email.indexOf('@');
    let pos2 = email.indexOf('.');

    if (pos1 == -1 || pos1 == 0 || pos1 == email.length){
        return formatres(res,"You must provide a valid email",400);
    }

    if (pos2 == -1 || pos2 == 0 || pos2 == email.length){
        return formatres(res,"You must provide a valid email",400);
    }

	// do some work and return the result
	
	if (admin_or_client == "admin"){
	    admin_or_client = "A" ;
	}
	
	if (admin_or_client == "client"){
	    admin_or_client = "C" ;
	}

    let txtSql = "select count(*) as qty from users where username = ?";
    var results = connection.query(txtSql,[username]);
    if ( results[0]['qty'] > 0 ){
        return formatres(res,'Username already exists',400);
    }

    let txtSql2 = "insert into users (username,password,email,admin_or_client) values (?,?,?,?)";

    try {
      var results2 = connection.query(txtSql2,[username,password,email,admin_or_client]);
    }
    catch(e){
        console.log(e);
        return formatres(res,'Unexpected error. (makeUser)',500);
    }
    
    return formatres(res,results2.insertId,200);
}

// do not delete this handy little supporting function
let formatres = (res, output, statusCode) => {
	res.statusCode = statusCode;
	res.body = JSON.stringify(output);
	return res;	
}

// do not delete this handy little supportng function
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// My Routing Function **********************************

let myRoutingFunction = (res,method,path,query,body) => {

	// conditional statements go here.
	// look at the path and method and return the output from the 
	// correct supporting function.

	// Simple GET request with no features specified results
	// in a list of features / instructions
	if (method == "GET" && path == ""){
		return formatres(res, features, 200);
	}
	
	if (method == "GET" && path == "auth"){
		return authenticate(res,query);
	}
	
	if (method == "POST" && path == "users"){
		return makeUser(res,body);
	}
	
	if (method == "GET" && path == "questions"){
		return getQuestionList(res,query);
	}
	
	if (method == "GET" && path == "checkAnswer"){
		return checkAnswer(res,query);
	}
	
	if (method == 'PATCH' && path == "users") {
	    return updateScore(res, body);
	}
	
	if (method == "GET" && path == "scores"){
		return getAllScores(res,query);
	}
	
	if (method == "GET" && path == "userScore"){
		return getUserScore(res,query);
	}
	
	if (method == "POST" && path == "questions") {
	    return createQuestion(res, body);
	}
	
	return(res);
}


// event handler ****************************************

// Students should not have to change the code here.
// Students should be able to read and understand the code here.

exports.handler = async (request) => {

	// identify the method (it will be a string)
	let method = request["httpMethod"];
	
	// identify the path (it will also be a string)
	let fullpath = request["path"];
	
	// we clean the full path up a little bit
	if (fullpath == undefined || fullpath == null){ fullpath = ""};
	let pathitems = fullpath.split("/");
	let path = pathitems[2];
	if (path == undefined || path == null){ path = ""};
	
	// identify the querystring ( we will convert it to 
	//   a JSON object named query)
	let query = request["queryStringParameters"];
	if (query == undefined || query == null){ query={} };
	
	// identify the body (we will convert it to 
	//   a JSON object named body)
	let body = qs.parse(request["body"]);
	if (body == undefined || body == null){ body={} };

	// Create the default response object that will include 
	// the status code, the headers needed by CORS, and
	// the string to be returned formatted as a JSON data structure.
    let res = {
        'statusCode': 400,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true  
        },
        'body': JSON.stringify("Feature not found."),
    };

	// run all the parameters through my routing function
	// and return the result
    return myRoutingFunction(res,method,path,query,body);
    
    //this is an example of Shafer testing one specific function:
    //body={"username":"adam","password":"Password123","email":"adam@email.com"}
    //return makeUser(res,body)
};