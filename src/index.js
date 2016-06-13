var Botkit = require('botkit')
var firebase = require('firebase')
var path = require('path')
require('dotenv').config({path: path.join(__dirname, '../.env')})

console.log(process.env.SERVICE_ACCOUNT)
var firebaseConfig = {
    serviceAccount: process.env.SERVICE_ACCOUNT,
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    storageBucket: process.env.STORAGE_BUCKET
  };
var firebaseStorage = require('./lib/botkitFirebaseStorage')(firebaseConfig)
// var firebaseStorage = require('botkit-storage-firebase')(firebaseConfig);

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: true,
  storage: firebaseStorage
})

var beans = {id: 'cool', beans: ['pinto', 'garbanzo']};
controller.storage.teams.save(beans);
beans = controller.storage.teams.get('cool');
console.log('beans', beans)

// console.log('BEEPBOOP_RESOURCER', process.env.BEEPBOOP_RESOURCER,
// 'BEEPBOOP_TOKEN', process.env.BEEPBOOP_TOKEN,
// 'BEEPBOOP_ID', process.env.BEEPBOOP_ID)

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
  // console.log('controller', controller)
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})

require('./modules/onboard')(controller)

controller.hears(['nm'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Oh ok, I won\'t mind it, then.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  console.log(bot.identity.name);
  var help = 'I will respond to the following messages: \n' +
      `\`/dm @${bot.identity.name} @{user-name} delivers great presentations for clients :thumbsup:\`\n` +
      `or...\n` +
      `\`/dm @${bot.identity.name} @{user-name} should be more confident when presenting to clients :confused:\`\n` +
      `both of the above messages will default to anonymous feedback at a random date and time in the future.\n` +
      `\`@${bot.identity.name} hi\` for a simple message.\n` +
      `\`@${bot.identity.name} attachment\` to see a Slack attachment message.\n` +
      `\`@${bot.identity.name}\` to demonstrate detecting a mention.\n` +
      `\`@${bot.identity.name} help\` to see this again.`
  bot.reply(message, help)
})

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})

controller.on('reaction_added', function(bot, event) {
  // { type: 'reaction_added',
  // user: 'U0AB141EJ',
  // item:
  //  { type: 'message',
  //    channel: 'C1B73CTQE',
  //    ts: '1465177458.000005' },
  // reaction: '100',
  // item_user: 'U1E7SH0VB',
  // event_ts: '1465178320.282076' }
  console.log('hey, reaction added', event)
  if(event.item_user === bot.identity.id) {
    bot.reply(event.item, `oh wow! :${event.reaction}: right back atcha, <@${event.user}>!`)
  } else {
    console.log('event.item_user', event.item_user, 'vs bot.identity', bot.identity)
  }
})

controller.on('emoji_changed', function(bot, emoji) {
  // {
  //     "type": "emoji_changed",
  //     "subtype": "remove",
  //     "names": ["picard_facepalm"],
  //     "event_ts" : "1361482916.000004"
  // }

  // { type: 'emoji_changed',
  // subtype: 'add',
  // name: 'kappa',
  // value: 'https://emoji.slack-edge.com/T0AB17SUB/kappa/90def4d5cf60e567.png',
  // event_ts: '1465178389.282357' }
  console.log('emoji changed', emoji)
})

controller.on('team_join', function(bot, event) {

})
