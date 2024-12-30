
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const securePassword = async (password) => {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error) {
      console.log(error);
    }
  };

const signup = async(req,res)=>{
    try{
        const {name,email,password} = req.body
        console.log(req.body);
        
        const isEmailExists = await User.findOne({email})
        if(isEmailExists){
           return res.status(401).json({message: "email already exists"});
        }
         
            const passwordhash =await securePassword(password)
            console.log(passwordhash)
            const user = await User.create({
                name:name,
                password:passwordhash,
                email:email,
            })

            return res.status(200).json({ message: "User is registered", user });
    }catch(err){
        console.log("Err is msg:",err.message);
        return res.status(500).json({
          success: false,
          message : err.message
      })
    }
}

const googleSignIn = async(req,res)=>{

    try{
      const { token } = req.body;
      console.log("token",token);
      
      const client = new OAuth2Client("461750813528-fh0oohkab4fjsq691h0soud0ll0bjqe4.apps.googleusercontent.com");

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience:"461750813528-fh0oohkab4fjsq691h0soud0ll0bjqe4.apps.googleusercontent.com", // Specify the CLIENT_ID of the app that accesses the backend
      });
      const payload = ticket.getPayload();
      console.log(payload);
      const { sub, email, name } = payload;

      let user = await User.findOne({ email });
      if(user){
        res.status(409).json({ message: "User already exists" });
    }
      if (!user) {
        // If the user doesn't exist, create a new user
        user = await User.create({
          name: name,
          email: email,
        });
      }

      return res.status(200).json({
        success: true,
        message: "User signed in successfully with Google",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      })

    }catch(err){
      console.log("google signin error",err);
    }
}


const login = async(req,res)=>{
    try{
      const {email,password}= req.body
      const user = await User.findOne({email})
  
      if(!user){
        res.status(401).json({message: "Invalid email or password"})
      }
  
    

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if(!isPasswordValid){
        return res.status(400).json({ message: "Invalid email or password" });
      }

      if(user){
          if(isPasswordValid){
            console.log(user)
          return res.status(200).json({
              message: "Login successful",
              id: user._id,
              name: user.name,
              email: user.email,
            })
          }
      }else{
          return res.status(400).json({ message: "Invalid email or password" });
      }
  }catch(err){
      console.log(err);
  }
}

const googleLogin = async(req,res)=>{

    try {
      const { token } = req.body;
  
      const client = new OAuth2Client("461750813528-fh0oohkab4fjsq691h0soud0ll0bjqe4.apps.googleusercontent.com");
  
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "461750813528-fh0oohkab4fjsq691h0soud0ll0bjqe4.apps.googleusercontent.com", 
      });
  
      const { email, name } = ticket.getPayload(); 
  
  
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name: name,
          email: email,
        });
        await user.save();
      }
      
  
      res.status(200).json({
        success: true,
        message: "Google login successful",
        user: user,
    });
  
    } catch (error) {
      console.error('Google sign-in error:', error);
      res.status(500).json({
        message: 'Google sign-in failed',
        error: error.message,
      });
    }
  
  }


module.exports = {
    signup,
    googleSignIn,
    login,
    googleLogin
}