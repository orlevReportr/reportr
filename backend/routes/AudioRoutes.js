const express=require("express")
const router=express.Router();

const{
 addAudio,getOneAudio,getUserAudios
} = require("../controllers/AudioController");
const upload = require("../config/multerConfiguration");

router.post("/add", upload.single('file'),addAudio)
router.post("/get",getUserAudios)
router.post("/",getOneAudio)



module.exports=router