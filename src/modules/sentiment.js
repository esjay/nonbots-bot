var sentiment = require('sentiment')
var afinn = require('sentiment/build/AFINN.json')

module.exports = function analyzeSentiment(controller) {
    var listeningFor = '^' + Object.keys(afinn).map(escapeStringRegexp).join('|') + '$';
    controller.hears([listeningFor], ['ambient'], function(bot, message) {
        var sentimentAnalysis = sentiment(message.text);
        console.log({
            sentimentAnalysis: sentimentAnalysis
        });
        if (COUNT_POSITIVE_SCORES == false && sentimentAnalysis.score > 0) {
            return;
        }

        if (COUNT_NEGATIVE_SCORES == false && sentimentAnalysis.score < 0) {
            return;
        }

        collection.findAndModify({
            _id: message.user
        }, [
            ['_id', 1]
        ], {
            $inc: {
                score: sentimentAnalysis.score
            }
        }, {
            'new': true,
            upsert: true
        }, function(err, result) {
            if (err) {
                throw err;
            }

            // full doc is available in result object:
            // console.log(result)
            var shamed = false;
            if (INSTANCE_PUBLIC_SHAMING &&
                sentimentAnalysis.score <= INSTANCE_PUBLIC_SHAMING_THRESHOLD) {
                shamed = true;
                bot.startConversation(message, function(err, convo) {
                    if (err) {
                        throw err;
                    }

                    var publicShamingMessage = _.sample(INSTANCE_PUBLIC_SHAMING_MESSAGES);
                    console.log({
                        publicShamingMessage: publicShamingMessage
                    });
                    convo.say(publicShamingMessage);
                });
            }

            if (!shamed && INSTANCE_PRIVATE_SHAMING &&
                sentimentAnalysis.score <= INSTANCE_PRIVATE_SHAMING_THRESHOLD) {
                bot.startPrivateConversation(message, function(err, dm) {
                    if (err) {
                        throw err;
                    }

                    var privateShamingMessage = _.sample(INSTANCE_PRIVATE_SHAMING_MESSAGES);
                    console.log({
                        privateShamingMessage: privateShamingMessage
                    });
                    dm.say(privateShamingMessage);
                });
            }
        });
    });
}
