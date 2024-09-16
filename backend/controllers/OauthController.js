const querystring = require("querystring");
const Calendar = require("../models/CalendarModel");
const User = require("../models/UserModel");
const Counter = require("../models/CounterModel");
const axios = require("axios");

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  AUTHORIZATION_URL,
  TOKEN_URL,
  SCOPE,
} = process.env;

const oauthLogin = (req, res) => {
  const params = querystring.stringify({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: "random-string", // Optional for security
  });

  res.json({ url: `${AUTHORIZATION_URL}?${params}` });
};

const callbackFunction = async (req, res) => {
  const { code, userId } = req.body;
  const user = await User.findOne({ id: userId });
  const calendarId = user.calendarId;
  try {
    // Step 3: Exchange authorization code for access and refresh tokens

    const tokenResponse = await axios.post(
      TOKEN_URL,
      querystring.stringify({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const { access_token, refresh_token } = tokenResponse.data;
    let localCalendar = null;
    let recallCalendar = null;
    if (calendarId) {
      localCalendar = await Calendar.findOne({ id: calendarId });
    }

    if (localCalendar) {
      try {
        recallCalendar = await axios.patch(
          `${process.env.RECALL_API_URL}/api/v2/calendars/${localCalendar.recallId}`,
          {
            oauth_refresh_token: refresh_token,
            oauth_client_id: process.env.GOOGLE_CALENDAR_OAUTH_CLIENT_ID,
            oauth_client_secret:
              process.env.GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET,
            webhook_url: `${process.env.PUBLIC_URL}/webhooks/recall-calendar-updates`,
          },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              Authorization: process.env.RECALL_API_TOKEN,
            },
          }
        );
      } catch (e) {
        console.log("recall error");
        return res.status(500).send("Recall error");
      }

      console.log(`Successfully updated calendar in Recall`);
      localCalendar.recallData = recallCalendar.data;
      await localCalendar.save();
      console.log(
        `Successfully updated calendar(id: ${localCalendar.id}) in database`
      );
    } else {
      console.log("didn't find calendar");
      try {
        recallCalendar = await axios.post(
          `${process.env.RECALL_API_URL}/api/v2/calendars`,
          {
            platform: "google_calendar",
            webhook_url: `${process.env.PUBLIC_URL}/webhooks/recall-calendar-updates`,
            oauth_refresh_token: refresh_token,
            oauth_client_id: process.env.CLIENT_ID,
            oauth_client_secret: process.env.CLIENT_SECRET,
          },
          {
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              Authorization: process.env.RECALL_API_TOKEN,
            },
          }
        );
      } catch (error) {
        console.log("recall erro");
        return res.status(500).send("Recall error");
      }

      console.log("Successfully created calendar in Recall");
      const counter = await Counter.findOneAndUpdate(
        { id: "autovalAudio" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      console.log(recallCalendar.data);
      const calendar = new Calendar({
        id: counter.seq,
        platform: "google_calendar",
        recallId: recallCalendar.data.id,
        recallData: recallCalendar.data,
        userId,
      });

      user.calendarId = counter.seq;
      await user.save();
      await calendar.save();
      console.log(
        `Successfully created calendar in database with id: ${calendar.id}`
      );
    }
    // // Step 4: Use access token to access the user's Google Calendar events
    // const eventsResponse = await axios.get(
    //   "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    //   {
    //     headers: {
    //       Authorization: `Bearer ${access_token}`,
    //     },
    //   }
    // );

    // // Render the events to the user
    // res.json(eventsResponse.data.items);

    res.status(200).send("OAuth flow completed");
  } catch (error) {
    console.error(
      "Error during OAuth flow:",
      error.response?.data || error.message
    );
    res.status(500).send("OAuth error");
  }
};

module.exports = {
  oauthLogin,
  callbackFunction,
};
