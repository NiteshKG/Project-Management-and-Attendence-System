This is a Attendance tracker and Project Management system project based on MEAN stack technology and Socket.io for chat integretion.

//  login/signup

Firstly the user authenticates by signup/login. During sign up , if any field leave blank , it gives validation error , after each data is filled , password is hashed and stores in mongodb User collection.
During login it first matches email from 'users' collection , if it doesnt exist then it gives error by name of 'User doesnt exist' , when email matches , it check for password by conververting it to hash , and when user successfully logged-in , then it creates a JWT token with remains active during login session.
During routing to various components on projects such as /home, /project,etc... all routes controller contains the middleware protection which verifies if the user is logged-in or not , only then he allows routing to the protected routes.


//home page 

On successful login user redirects to home page , which shows places for projects and attendance timer.

//attendance

When user start the time on the left upper side of home page , the timer starts and showing the running time in format and when user ends timer then it stores the status of schema :'true' and attendance marks as present.


//projects

When user clicks on create project then project form appears which take input such as deadline, manager, description, tasks(add or remove task functionality) then when user submits the forms , it saves data in backend and redirects back to home page.

//edit-project

when user clicks on edit project from home page then it opens up the form html component with filled data of existing form. and performs updating of data on submission in the existing project id that opens the component with.

//task - logs

in projects component UI below task there is a functionality to start timer and stop and it also shows the logs of previous timer actions respectively.So that it can track time active for each tasks.

//chat-feature in project

In projects component , below is a chat button with stores message sent by user regarding specific project and along with message sent , the user's name along with the time at which it is sent is being displayed.