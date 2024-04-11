const express=require("express")
const router=express.Router();



const{
  startRecording,
  createMeeting,
  stopRecording,
  getUserMeetings,
  getOneMeeting
} = require("../controllers/MeetingController")

router.post("/add",createMeeting)
router.post("/get",getUserMeetings)
router.post("/",getOneMeeting)

router.post("/start-recording",startRecording)
router.post("/stop-recording",stopRecording) 


module.exports=router