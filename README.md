# Bike-Sevice-Application

Bike Service Booking Application using Node.js, MongoDb, Express.js, RESTful API

## Built-Using

- Node.js
- Express js
- Mongoose
- bcrypt
- jsonwebtoken
- Nodemailer
- Used MongoDB Atlas for data storage

## Features :

JWT Authentication and Password Hashing

Role based Authentication

A New Shop Owner can be created and Login by 
Bike Shop Owner can Add a New Service, Edit a Service, Delete a Service, Update the status of Booking, Get all bookings for the Owner

A New Customer can be created and Login by JWT Authentication
Customer can View all Services, Book a Service from a Shop, Edit their booking details, View all their bookings

I used PostmanAPI for creating and sending response.

### Installation

1. Clone the repo

    ```sh
    git clone https://github.com/tirthajyoti-ghosh/final-capstone-frontend.git
    ```

2. Install NPM packages

    ```sh
    npm install
    ```

3.Install the needed packages  

    
    npm install nodemon mongodb express cors bcrypt bcryptjs body-parser dotenv jsonwebtoken model mongoose node-schedule nodemailer 
    
 4.Open terminal in VScode and run the following code to run the app

    npm run dev
    
## Sample Working and Output

1. Create a new Owner
   
![Screenshot (398)](https://github.com/vihashinidurga/Bike-Sevice-Application/assets/129977867/f0c155e4-b568-46c3-971c-95b378fb077a)

2.Create a service by user

![Screenshot (400)](https://github.com/vihashinidurga/Bike-Sevice-Application/assets/129977867/afcd03c0-d040-4843-bd74-8843ca10c7fd)

3.Create a Customer

![Screenshot (399)](https://github.com/vihashinidurga/Bike-Sevice-Application/assets/129977867/abd66eec-333b-4e16-be3a-3483e0cafb7a)

4.Book a Service by Customer

![Screenshot (401)](https://github.com/vihashinidurga/Bike-Sevice-Application/assets/129977867/e50fb7fe-4e36-434f-a934-a9546cc805f1)

5.Mail recieved by owner from admin after booking done by customer

![Screenshot (402)](https://github.com/vihashinidurga/Bike-Sevice-Application/assets/129977867/13493b25-0dec-4036-b23e-e33bd0dbdbfa)

6.Update status by customer

![Screenshot (403)](https://github.com/vihashinidurga/Bike-Sevice-Application/assets/129977867/98d4523f-3008-4b85-8fdb-ed34d69cf9f2)

7.Mail recieved by customer after Bike is ready for delivery

![Screenshot (404)](https://github.com/vihashinidurga/Bike-Sevice-Application/assets/129977867/ef971027-823a-4f5c-a21c-a44f4f98b32c)
