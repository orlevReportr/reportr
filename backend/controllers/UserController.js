const Counter = require("../models/CounterModel");
const ClientRecord = require("../models/ClientRecordModel");
const Audio = require("../models/AudioModel");

const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const addUser = async (req, res) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { id: "autovalUser" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      id: counter.seq,
      email: req.body.email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Added User",
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    );

    if (passwordMatch) {
      res.status(200).json({
        status: "success",
        message: "Login successful",
        user: user,
        token: token,
      });
    } else {
      res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

const getStats = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find all clientRecords of the user
    const clientRecords = await ClientRecord.find({ userId: userId });
    const audios = await Audio.find({ userId: userId });

    let totalClientRecordTime = 0;
    clientRecords.forEach((clientRecord) => {
      if (
        clientRecord.clientRecordStartTime &&
        clientRecord.clientRecordEndTime
      ) {
        totalClientRecordTime +=
          clientRecord.clientRecordEndTime - clientRecord.clientRecordStartTime;
      }
    });

    // Convert total clientRecord time to hh:mm:ss format
    const totalClientRecordTimeInSeconds = Math.floor(
      totalClientRecordTime / 1000
    );
    const hours = Math.floor(totalClientRecordTimeInSeconds / 3600);
    const minutes = Math.floor((totalClientRecordTimeInSeconds % 3600) / 60);
    const seconds = totalClientRecordTimeInSeconds % 60;
    const formattedTotalClientRecordTime = `${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;

    return res.status(200).json({
      status: "success",
      message: "User clientRecord stats retrieved",
      stats: {
        totalClientRecordTime: formattedTotalClientRecordTime,
        totalClientRecords: clientRecords.length,
        totalAudios: audios.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error!",
    });
  }
};

module.exports = { addUser, loginUser, getStats };
