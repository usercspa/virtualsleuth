const {
  conversation,
  Suggestion,
  Simple,
} = require('@assistant/conversation');
const functions = require('firebase-functions');

const app = conversation();

app.handle('welcome', conv => {
  conv.add(responses.WELCOME.new);
  providesYesNoSuggestionChips(conv);
});


app.handle('setupGame', conv => {
  const action = responses.scene_data.scene.action;
  const message = choose(responses.startGameMessage.confirmation) +
    responses.startGameMessage.message + action;
  conv.add(message);
  providesActionSuggestionChips(conv, responses.scene_data.scene);
});


app.handle('noPlayGame', conv => {
  conv.add(choose(responses.GOODBYE));
});

app.handle('noMatch1', conv => {
  responsesNoMatch(conv, 'fallback');
});

app.handle('noMatch2', conv => {
  responsesNoMatch(conv, 'fallback');
});

app.handle('noMatchFinal', conv => {
  responsesNoMatch(conv, 'fallback');
});

app.handle('noInput1', conv => {
  responsesNoMatch(conv, 'noInput');
});

app.handle('noInput2', conv => {
  responsesNoMatch(conv, 'noInput');
});

app.handle('noInputFinal', conv => {
  responsesNoMatch(conv, 'noInput');
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);

function choose(choices, numItem=1) {
  const selectionIndex = [];
  const selection = [];
  while (selection.length < (numItem)) {
    let choiceIndex = Math.floor(Math.random() * choices.length);
    while (!selectionIndex.includes(choiceIndex)) {
        selectionIndex.push(choiceIndex);
        selection.push(choices[choiceIndex]);
    }
  }
  if (numItem === 1){
    return selection[0];
  }
  return selection;
}

function responsesNoMatch(conv, intentType) {
  const scene = conv.request.scene.name;
  const intent = conv.request.intent.name;
  const message = responses[intentType][scene][intent];
  conv.add(new Simple(message));
  if (responses[intentType][scene].suggestionChips){
    providesYesNoSuggestionChips(conv);
  } else {
    providesActionSuggestionChips(conv, responses.scene_data[scene]);
  }
}

function providesActionSuggestionChips(conv, current_scene_data) {
  const actionSuggestions = Object.keys(current_scene_data);
  conv.add(new Suggestion({ title: actionSuggestions[0]}));
  conv.add(new Suggestion({ title: actionSuggestions[1]}));
  conv.add(new Suggestion({ title: actionSuggestions[2]}));
  conv.add(new Suggestion({ title: actionSuggestions[3]}));
}

/**
 * Provides Yes & No suggestions chips
 * @param {obj} conv, the conversation object.
 */
 function providesYesNoSuggestionChips(conv) {
  conv.add(new Suggestion({ title: 'Yes'}));
  conv.add(new Suggestion({ title: 'No'}));
}

function clearParams(conv) {
  for (const key in conv.session.params) {
    conv.session.params[key] = null;
  }
}

// Responses
let responses = {};
console.log(responses);

responses.WELCOME = {
  new: "Welcome to Virtual Sleuth! Get ready for a fun detective game. Your neighbour Cuckoo has died this morning, and you need to find out who killed Cuckoo. Ready to start?",
  returning: "Welcome to Virtual Sleuth! Get ready for a fun detective game. Your neighbour Cuckoo has died this morning, and you need to find out who killed Cuckoo. Ready to start?"
};


responses.startGameMessage = {
  confirmation: [
    'Great!',
    'Alright!',
    'Let\'s go!'
  ],
  message: ' You have examined Cuckoo\'s body and found some scratches, his feathers were all over the place. What do you want to do next? '
};

responses.playAgainMessages = [
  'Oh no! The real murderer fled. Wanna start over and try again?',
  'Too bad! The real murderer fled. Wanna start from the beginning?',
  'Well, the real murderer fled. But do you wanna give it another try and start over? ',
  'Game over! But do you wanna play again? ',
];

responses.scene_data = {
  scene: {
    examine: {
      preText: 'Ok, let\'s take a closer look. ',
      text: 'There was no footsteps on the ground. It looks like the murderer attacked from air. Alright, what do you want to do next?',
      speech: 'There was no footsteps on the ground. It looks like the murderer attacked from air. Alright, what do you want to do next?',
      continue: true
    },
    hill: {
      preText: 'Ok, go to hill. Let\'s start the journey. ',
      text: 'You saw hawk and cat. Who do you wanna talk to?' ,
      speech: 'You saw hawk and cat. Who do you wanna talk to?',
      continue: true
    },
    forest: {
      preText: 'Ok, go to forest. Let\'s start the journey. ',
      text: 'You saw owl and snake. Who do you wanna talk to?',
      speech: ' You saw owl and snake. Who do you wanna talk to? ',
      continue: true
    },
    
    	finish: {
      preText: 'Ok, finish case. ',
      text: 'Which animal do you think is the murderer: hawk, cat, snake or owl? ',
      speech: 'Which animal do you think is the murderer: hawk, cat, snake or owl?',
      continue: true
    },
    
    action: 'Take a closer look, go to hill, go to forest or finish case',
    sound: 'https://actions.google.com/sounds/v1/water/small_stream_flowing.ogg',
    nextScene: 'actions',
  }
  
}