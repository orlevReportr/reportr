const express=require("express")
const router=express.Router();



const{
  startRecording,
  createMeeting
} = require("../controllers/MeetingController")

router.post("/add",createMeeting)

router.post("/start-recording",startRecording)



module.exports=router