const express=require("express")
const router=express.Router();



const{
  addUser,loginUser
} = require("../controllers/UserController");

router.post("/login",loginUser);
router.post("/signup",addUser);


module.exports=router