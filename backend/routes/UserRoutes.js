const express=require("express")
const router=express.Router();



const{
  addUser,loginUser,
  getStats
} = require("../controllers/UserController");

router.post("/login",loginUser);
router.post("/signup",addUser);
router.post("/stats",getStats);


module.exports=router