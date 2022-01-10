## Template for back-end in node.js 
# Authentication with JWT-Token:
- Given JWT-Token for login (not signup)

# NodeMailer:
- NodeMailer for signUp - Confirmation by email (not required)
- NodeMailer for forgotten Password - sending an email containing a token and giving access to the front password reset
- NodeMailer for UpdateEmail, UpdatePassword (with authentication)

# Reusable User model template
- Model for User (auth : email & encrypted password Bcrypt)
- Model with modular attributes for the UserProfile 

# Multer
- Image Managament (multer) for UserProfile avatar (create, update)

# Messages configuration for front
- Messages for front ok (error + message) for Model User (CRUD)

# To use this Repository and API locally: 

- git clone https://github.com/amjoda-2021/HomeCooker-back.git
- npm install 
- npm run dev 

# To use the online API in front : 

- Online app API: https://home-cooker-back.herokuapp.com/
- request URL : https://home-cooker-back.herokuapp.com/api/

for Auth request : 
- https://home-cooker-back.herokuapp.com/api/auth/signin => SignIn
- https://home-cooker-back.herokuapp.com/api/auth/signup => SignUp
