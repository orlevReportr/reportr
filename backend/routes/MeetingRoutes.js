const express=require("express")
const router=express.Router();



const{
  startRecording,
  createMeeting,
  stopRecording,
  getUserMeetings,
  getOneMeetings
} = require("../controllers/MeetingController")

router.post("/add",createMeeting)
router.post("/get",getUserMeetings)
router.get("/:meetingId",getOneMeetings)

router.post("/start-recording",startRecording)
router.post("/stop-recording",stopRecording) 


module.exports=router