const express = require('express');
const app = express();
const path = require('path');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const Chance = require('chance');
const ChatGrant = AccessToken.ChatGrant
const chance = new Chance();

require('dotenv').config();

const MAX_ALLOWED_SESSION_DURATION = 14400;
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKeySID = process.env.TWILIO_API_KEY_SID;
const twilioApiKeySecret = process.env.TWILIO_API_KEY_SECRET;

const twilioChatServiceID = process.env.TWILIO_CHAT_SERVICE_SID;


app.use(express.static(path.join(__dirname, 'build')));

app.get('/token', (req, res) => {
  const { identity, roomName } = req.query;
  const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });
  token.identity = identity;
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  res.send(token.toJwt());
  console.log(`issued token for ${identity} in room ${roomName} ${token}`);
});

app.get('/token-chat', function (req, res) {
  const token = new AccessToken(twilioAccountSid, twilioApiKeySID, twilioApiKeySecret, {
    ttl: MAX_ALLOWED_SESSION_DURATION,
  });

  token.identity = chance.d10();
  token.addGrant(new ChatGrant({
    serviceSid: twilioChatServiceID
  }))
  console.log(`issued token for ${token.identity} in chat SID ${twilioChatServiceID} ${token}`);
  res.send({
    identity: token.identity,
    jwt: token.toJwt()
  })
  
})
app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'build/index.html')));

app.listen(8081, () => console.log('token server running on 8081'));
