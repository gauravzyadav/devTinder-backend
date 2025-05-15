# DevTinder APIs

## authRouter
- POST /signup
- POST /login
- POST /logout

## profileRouter
- GET   /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter
- POST /request/sent/interested/:userId
- POST /request/sent/ignored/:userId
- POST /request/review/accepted/:userId
- POST /request/review/rejected/:userId

## userRouter
- GET /user/connections
- GET /user/request
- GET /user/feed   -  gets u the profile of others users on platform


    status : ignore, interested, accepeted, rejected
