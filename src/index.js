var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: true
})

console.log('BEEPBOOP_RESOURCER', process.env.BEEPBOOP_RESOURCER,
'BEEPBOOP_TOKEN', process.env.BEEPBOOP_TOKEN,
'BEEPBOOP_ID', process.env.BEEPBOOP_ID)


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
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})
console.log('registered hearing listener')

controller.hears(['hello', 'hi', 'sup'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

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
