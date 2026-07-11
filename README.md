# FixItNow Backend API

A production-ready REST API for **FixItNow**, a Home Service Marketplace where customers can book professional technicians, technicians can manage their services and bookings, and administrators can manage the entire platform.

The project is built with **Node.js**, **Express.js**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **JWT Authentication**, and **Stripe Payment Integration** following a modular backend architecture.



## Live API

**Base URL**
https://fixitnow-backend-gz17.onrender.com/



## GitHub Repository
https://github.com/khaled8787/fixitnow-backend.git


# Admin Credentials

**Email**
admin@fixitnow.com


**Password**
Admin@12345




# Tech Stack
 Node.js
 Express.js
 TypeScript
 PostgreSQL (Neon)
 Prisma ORM
 JWT Authentication
 Stripe Payment
 Zod Validation
 bcrypt
 CORS
 Helmet
 Morgan



# Features

## Authentication
 User Registration
 Secure Login
 JWT Authentication
 Role Based Authorization
 Current User Profile (`/auth/me`)



## Customer Features
 Register and Login
 Browse Categories
 Browse Services
 View Technician Profiles
 Create Bookings
 Track Booking Status
 Make Stripe Payments
 View Payment History
 Leave Reviews
 Manage Profile



## Technician Features
 Register as Technician
 Update Technician Profile
 Set Availability
 View Assigned Bookings
 Accept Bookings
 Reject Bookings
 Mark Jobs as In Progress
 Complete Jobs



## Admin Features
 View All Users
 Ban / Unban Users
 View All Bookings
 Create Categories
 Update Categories
 Delete Categories
 Manage Services
 Manage Platform Data



# Security Features
 JWT Authentication
 Password Hashing with bcrypt
 Role Based Authorization
 Server Side Validation using Zod
 Structured Error Responses
 Protected Routes
 Environment Variables
 Secure Stripe Integration



# API Endpoints

## Authentication

 Method  Endpoint           
 
 POST    /api/auth/register 
 POST    /api/auth/login    
 GET     /api/auth/me       



## Users

 Method  Endpoint              
 
 GET     /api/users            
 GET     /api/users/:id        
 PATCH   /api/users/profile    
 PATCH   /api/users/:id/status 
 DELETE  /api/users/:id        



## Categories

 Method  Endpoint            
 
 POST    /api/categories     
 GET     /api/categories     
 GET     /api/categories/:id 
 PATCH   /api/categories/:id 
 DELETE  /api/categories/:id 



## Services

 Method  Endpoint          
 
 POST    /api/services     
 GET     /api/services     
 GET     /api/services/:id 
 PATCH   /api/services/:id 
 DELETE  /api/services/:id 



## Technicians

 Method  Endpoint                      
  
 GET     /api/technicians              
 GET     /api/technicians/:id          
 PUT     /api/technicians/profile      
 PUT     /api/technicians/availability 
 GET     /api/technicians/bookings     
 PATCH   /api/technicians/bookings/:id 


## Bookings

 Method  Endpoint                 

 POST    /api/bookings            
 GET     /api/bookings            
 GET     /api/bookings/:id        
 PATCH   /api/bookings/:id        
 PATCH   /api/bookings/:id/status 
 PATCH   /api/bookings/:id/cancel 



## Payments

 Method  Endpoint                 

 POST    /api/payments            
 GET     /api/payments            
 GET     /api/payments/:id        
 PATCH   /api/payments/:id/status 



## Reviews

 Method  Endpoint         

 POST    /api/reviews     
 GET     /api/reviews     
 GET     /api/reviews/:id 
 PATCH   /api/reviews/:id 
 DELETE  /api/reviews/:id 



## Admin

 Method  Endpoint                    

 GET     /api/admin/users            
 PATCH   /api/admin/users/:id/status 
 GET     /api/admin/bookings         
 GET     /api/admin/categories       
 POST    /api/admin/categories       


# Installation

Clone the repository
bash
git clone https://github.com/khaled8787/fixitnow-backend.git


Go to the project folder
bash
cd fixitnow-backend


Install dependencies
bash
npm install


Generate Prisma Client
bash
npx prisma generate


Run database migrations
bash
npx prisma migrate deploy


Start development server
bash
npm run dev


Build project
bash
npm run build


Start production server
bash
npm start


# API Documentation
The complete API documentation is provided as:

 Postman Collection
 Postman Environment


# Error Response Format
All API errors follow a consistent response format.

 json
{
  "success": false,
  "message": "Error message",
  "errorDetails": {}
}


# Assignment Requirements Checklist
 RESTful API
 JWT Authentication
 Role Based Authorization
 PostgreSQL Database
 Prisma ORM
 Stripe Payment Integration
 Zod Input Validation
 Consistent Error Responses
 Postman API Documentation
 Admin Credentials Included
 20+ Meaningful Git Commits
 Render Deployment



# Author

**Khaled Mahmud**
