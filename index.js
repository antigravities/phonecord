const fs = require("fs");
const config = JSON.parse(fs.readFileSync("config.json"));
const twilio = require("twilio")(config.accountSid, config.accountToken);
const client = new(require("discord.js")).Client();
const express = require("express");

const a = express();
a.use(require("body-parser").urlencoded({ extended: false }));

function getNumber(channel) {
  let numbers = [null, null];

  channel.topic.split("\n").forEach(i => {
    switch (i.split(" ")[0]) {
    case "@number":
      numbers[0] = i.split(" ")[1];
      break;
    case "@from":
      numbers[1] = i.split(" ")[1];
      break;
    }
  });

  return numbers;
}

async function getChannel(body) {
  let chan = false;

  client.channels.array().forEach(i => {
    if (i && i.topic) {
      let res = getNumber(i);
      if (res[0] && res[0] === body.From) {
        chan = i;
      }
    }
  });

  if (!chan) {
    try {
      let chan = await client.guilds.array()[0].createChannel(body.From.substring(1));
      let location = (body.FromCity ? body.FromCity : "Unknown State") + ", " + (body.FromState ? body.FromState : "Unknown State");
      await chan.setTopic(location + "\n\n" + "@number " + body.From + "\n@from " + body.To);
    }
    catch (e) {
      console.log(e);
    }
  }

  return chan;
}

client.on("ready", () => {
  console.log("Connected!");
});

client.on("message", async message => {
  if (message.author.bot) return;

  let number = null;
  let from = config.defaultPhone;

  if (message.channel.topic) {
    let res = getNumber(message.channel);

    number = res[0];
    from = res[1] || config.defaultPhone;
  }

  if (!number) return;

  try {
    await twilio.messages.create({
      body: message.content,
      to: number,
      from: from
    });
  }
  catch (e) {
    console.log(e);
    message.reply("Error sending message: " + e);
  }
});

client.login(config.discord);

a.post("/message", async(req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<Response />");

  try {
    (await getChannel(req.body)).send(req.body.Body);
  }
  catch (e) {
    console.log(e);
  }
});

a.post("/call", async(req, res) => {
  if (req.body.From === config.myNumber) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<Response><Gather input='dtmf' action='dial' finishOnKey='#' timeout='10'><Say>Please enter the number you would like to call in E point one six four format followed by the pound sign.</Say></Gather><Say>We did not receive your input. Goodbye!</Say></Response>");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<Response><Dial><Conference beep='false' startConferenceOnEnter='true' endConferenceOnExit='true' maxParticipants='2' waitUrl='wait'>" + req.body.CallSid + "</Conference></Dial></Response>");

  await twilio.calls.create({
    url: "https://" + config.hostname + "/join/" + req.body.CallSid,
    method: "GET",
    to: config.myNumber,
    from: config.defaultPhone
  });

  try {
    (await getChannel(req.body)).send("Ring-ring! New call from **" + req.body.From + "**.");
  }
  catch (e) {
    console.log(e);
  }
});

a.post("/dial", async(req, res) => {
  if (req.body.From !== config.myNumber) return res.end();

  res.writeHead(200, { "Content-Type": "text/html" });

  try {
    await twilio.calls.create({
      url: "https://" + config.hostname + "/join/" + req.body.CallSid,
      method: "GET",
      to: "+" + req.body.Digits,
      from: config.defaultPhone
    });
  }
  catch (e) {
    return res.end("<Response><Say>We're sorry, we were unable to contact that number.</Say><Redirect>/call</Redirect></Response>");
  }

  res.end("<Response><Say>Please wait while we connect your call.</Say><Dial><Conference beep='false' startConferenceOnEnter='true' endConferenceOnExit='true' maxParticipants='2' waitUrl='wait'>" + req.body.CallSid + "</Conference></Dial></Response>");
});

a.post("/wait", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html " });
  res.end("<Response><Play Loop=\"0\">" + config.holdmusic[Math.floor(Math.random() * config.holdmusic.length)] + "</Play></Response>");
});

a.get("/join/:id", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html " });
  res.end("<Response><Dial><Conference beep='false' startConferenceOnEnter='true' endConferenceOnExit='true' maxParticipants='2' waitUrl='/wait'>" + req.params.id + "</Conference></Dial></Response>");
});

a.listen(config.port);
