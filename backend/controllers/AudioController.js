const Audio = require("../models/AudioModel");
const Counter = require("../models/CounterModel");

const addAudio=async(req,res)=>{
    try {
      const {audioTitle,userId}=req.body;
      const file = req.file;


      if (!file) {
        return res.status(400).json({message:"No file uploaded!"});
        }
    const counter = await Counter.findOneAndUpdate(
      { id: "autovalAudio" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

   
    const audio = new Audio({
      id: counter.seq,
      audioTitle,
      userId,
      audioPath:file.path
    });

    await audio.save();

    res.status(201).json({
      status: "success",
      message: "Added Audio",
      audio
    });
    } catch (error) {
      console.log(error)
        return res.status(500).json({ error: 'Server Error!' });

    }
}

const getUserAudios=async (req,res)=>{
  try{
      const {userId}=req.body
      const audios=await Audio.find({userId})

      return res.status(200).json({
          status: "success",
          message: "Audios retrieved",
          audios
        }); 
  }catch(e){
      console.error(e);
    res.status(500).json({
      message: "Server Error!"
    });
  }
}

const getOneAudio=async (req,res)=>{
  try{
      const {audioId}=req.body;
      const audio=await Audio.findOne({_id:audioId})

      return res.status(200).json({
          status: "success",
          message: "Audio retrieved",
          audio
        }); 
  }catch(e){
      console.error(e);
    res.status(500).json({
      message: "Server Error!"
    });
  }
}


module.exports = {
  addAudio,getOneAudio,getUserAudios
};
