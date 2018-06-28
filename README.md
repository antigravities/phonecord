# Phonecord
Receive S/MMS messages and call information on Discord.

## Disclaimer
* Don't ask me questions about this.
* I'm not helping you set this up.
* I'm not responsible for what you do with this. That being said, I politely ask you not to do bad things.
* You're free to make feature requests, but I'm also free to not consider them.

## Prerequisites
1. An existing phone number (to handle calls)
2. A Twilio account (can be trial if you want)
3. A Twilio number
4. Your Twilio API keys
5. A dedicated Discord guild for this bot
6. A Discord bot joined to the guild in step 4 and its token
7. Your fully qualified domain name where Phonecord is running; [this must be set up in Twilio](https://www.twilio.com/console/phone-numbers/incoming)

## Install
```
git clone https://github.com/antigravities/phonecord
cd phonecord
npm install
cp config.json.example config.json
node index.js
```

## Sending and receiving SMS messages
Phonecord reads the number to send to/from based on the channel's topic. A sample topic might look like:

```
NORTH BRUNSWICK, NJ

@number +1732XXXXXXX
@from +1908XXXXXXX
```

Phonecord will create a channel like this Automagically&trade; for each message you receive from a new "contact".
If you want to send a message to a "contact" you haven't seen before, you'll have to create this channel yourself.

## Placing phone calls
If you call one of your `@from` numbers from your `myNumber` (configured in config.json), you'll be prompted for a number to call.
You must enter this number in E.164 format minus the plus with a # at the end (e.g. 16092926000#, 12024561111#, 18004681714#, 903122921000#, 420224186252#...).

When placing or receiving phone calls, your custom hold music (defined in config.json) will play.

## Receiving phone calls
Phonecord will call the number you have specified as `myNumber` (configured in config.json) whenever you receive a call, and you'll get a message in the channel for the contact.

When placing or receiving phone calls, your custom hold music (defined in config.json) will play.

## License
```
phonecord - Receive S/MMS messages and call information on Discord.
Copyright (C) 2018 Cutie Café.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```