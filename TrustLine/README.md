# Chat Application

Welcome to the Trust Line Chat Application! This is a real-time chat web application that allows internal bank staff to connect with each other and stay updated on time.It allows users to register, login, and chat with each other in real-time. The server is built with Node.js and the client with React.

## Installation

### Prerequisites
- Node.js and npm installed on your machine
- A modern web browser
- Create a .env in server and include the following
    FRONTEND_URL =
    MONGODB_URI  = 
    JWT_SECREAT_KEY =
- Create a .env in client and include the following
    REACT_APP_CLOUDINARY_CLOUD_NAME = 
    REACT_APP_BACKEND_URL = 

## Technologies Used
- MERN stack (MongoDB, Express.js, React.js, and Node.js)
- Socket.io
- Redux Toolkit
- Tailwind CSS

### Server Setup
1. Clone the repository:
    ```sh
    git clone https://github.com/IT21253058/chatapp
    ```

2. Install server dependencies:
    ```sh
    npm install
    ```

3. Start the server:
    ```sh
    npm run dev
    ```

   The server will be running on `http://localhost:8080`.

### Client Setup
1. Open a new terminal and navigate to the client directory:
    ```sh
    cd chat-application/client
    ```

2. Install client dependencies:
    ```sh
    npm install
    ```

3. Start the client:
    ```sh
    npm start
    ```

   The client will be running on `http://localhost:3000`.

## Usage

### Register as a User
1. Open your web browser and navigate to `http://localhost:3000/register`.
2. Click on the `Register` link.
3. Fill in the registration form with your details and submit.

### Login as a User
1. Navigate to the login page at `http://localhost:3000/email`.
2. Enter your registered email and password.
3. Click on the `Login` button.

### Start Chatting
1. Once logged in, you will be redirected to the chat interface.
2. Add friends from the list
3. You can start sending messages in the chat room.

## Features
- User registration and login
- Password Validation (Should include minimum of 8 charactrs, a Special character, a number, an uppercase letter, a lowercase letter)
- User authentication: users can sign up, log in, and log out using JWT
- Real-time messaging and Responsive design
- Search functionality.
- Messages can include images and videos
- Sensitive information such as phone numbers, credit card numbers and URLs are restricted and displays an error message
- Prohibited words are blocked and displays an error message
- Profile page where users can update their avatar and display name.

## Student Information

IT21253058  Kavirathne G.P.R.Y.
IT21201578  Fawsikdeen H.
