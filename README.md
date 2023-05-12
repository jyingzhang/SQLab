# SQLab
Video demonstration of SQLab: https://youtu.be/tAnjDm4DKKM

SQLab is an web application that quizzes users on SQL queries and let users earn points by answering questions correctly. 

This was a a final group project for MIS3502 (Web Service Programming) with my partner Najuk Patel.
I was in charge of the server-side and also helped with client-side a bit.
I worked on the Lambda function, database, integration of the ChartJS, and the ajax calls.
Najuk worked on the client-side with the css, html, and the event handlers. 

SQLab is built using RESTful API archictecure and is stored on AWS S3.
This application utiizes two databases: moviedb and mis259cherry. 

MIS259cherry has two tables: users and questions. The users table stores the following information: userid, username, password, email, score, and if user is an admin or client. 
The questions table stores the questionid, question (text), answer, and difficulty. 

The moviedb database actually contains all of the schema information. So for example, the user will enter a query, and that query will be ran on the moveidb database.
The result (from the moviedb database) will be compared to the answer stored in the mis259cherry database.
