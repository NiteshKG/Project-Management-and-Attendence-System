## This is a Attendance tracker and Project Management system project based on MEAN stack technology and Socket.io for chat integretion.

##  login - signup

Firstly the user authenticates by signup/login. During sign up , if any field leave blank , it gives validation error , after each data is filled , password is hashed and stores in mongodb User collection.
During login it first matches email from 'users' collection , if it doesnt exist then it gives error by name of 'User doesnt exist' , when email matches , it check for password by conververting it to hash , and when user successfully logged-in , then it creates a JWT token with remains active during login session.
During routing to various components on projects such as /home, /project,etc... all routes controller contains the middleware protection which verifies if the user is logged-in or not , only then he allows routing to the protected routes.

## Home page 

On successful login user redirects to dashboard of home page  , which shows graphical and chart data and statistics of projects, attendance of month and tasks completed and team members.

## Attendance

When user start the time from timesheet component , the timer starts and showing the running time in format and when user ends timer then it stores the status of schema :'true' and attendance marks as present.

## Timesheet

This is the central point to start work timer and which can be use to track attendance and do calculations for half-day, present or absent and also shows the logs of different entry in a day for a user with start and end time.
This further record sessions and shows in attendance component about total sessions of a user for a particular day.


## Projects

When user clicks on create project then project form appears which take input such as deadline, manager, description, tasks(add or remove task functionality) then when user submits the forms , it saves data in backend and redirects back to home page.
With the functionality of add members and manager , different users can be interacted to edit it or to communicate in chat.

## Edit-project

when user clicks on edit project from home page then it opens up the form html component with filled data of existing form. and performs updating of data on submission in the existing project id that opens the component with.
the assigned users is ticked in select checkbox and can be unassigned or can add more users.




<video controls src="Project Management - Google Chrome 2025-12-22 19-38-36.mp4" title="Title"><video>


## chat-feature in project
In projects component , below is a chat button with stores message sent by user regarding specific project and along with message sent , the user's name along with the time at which it is sent is being displayed.


## Trash
This is used for the recovery of deleted projects which stored in a separate collection and after restoring can be saved to original document and if permanently deleted then its completely deleted can can be restored.
Later the auto deletion can be added based on project requirement.

## For trash-bin access 
route is /trash   its not directly accessible for now due to security purposes

## 🎥 Project Demonstration

[Watch the project demonstration video]

<video width="800" height="450" controls poster="./assets/video-thumbnail.jpg">
  <source src="./Project%20Management%20-%20Google%20Chrome%202026-01-07%2016-13-29.mp4" type="video/mp4">
  Your browser does not support HTML5 video. 
  [Download the video](./Project%20Management%20-%20Google%20Chrome%202026-01-07%2016-13-29.mp4) instead.
</video>

<video width="800" height="450" controls poster="./assets/video-thumbnail-2.jpg">
  <source src="./Project%20Management%20-%20Google%20Chrome%202026-01-07%2016-36-39.mp4" type="video/mp4">
  Your browser does not support HTML5 video. 
  [Download the video](./Project%20Management%20-%20Google%20Chrome%202026-01-07%2016-36-39.mp4) instead.
</video>


*Video: Project management system demo showing task creation and team collaboration*