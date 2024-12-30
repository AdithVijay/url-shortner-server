const express = require("express");
const userRoute = express.Router()

const userController = require('../controller/userController');
const urlController = require('../controller/urlController')
const urlAnalyticsController = require("../controller/urlAnalyticsController");
const { rateLimiter } = require("../midlleware/rateLimiter");

userRoute.post("/signup",userController.signup)
userRoute.post("/googlesignin",userController.googleSignIn)
userRoute.post("/login",userController.login);
userRoute.post("/googleLogin",userController.googleLogin)

userRoute.post("/shorten",rateLimiter, urlController.handleGenerateNewUrl)
userRoute.get("/getUrlData/:id",urlController.getUrlData)
userRoute.get("/:shortUrl",urlController.handleRedirect)


userRoute.get("/analytics/:id",urlAnalyticsController.fetchUrlAnalytics)
userRoute.get("/analytics/overall/:id",urlAnalyticsController.fetchUserAnalytics)

module.exports = userRoute