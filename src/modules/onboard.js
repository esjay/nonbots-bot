module.exports = function onboard (controller) {
  controller.hears(['hello', 'hi', 'sup'], ['direct_message'], function (bot, message) {
    // start a conversation to handle this response.
    bot.startConversation(message,function(err,convo) {

      convo.say('Hello!');
      convo.say('Welp...');
      convo.say('uh---');
      convo.say('gotta go...');
      convo.say('Have a nice day!');

    });
  })
}
