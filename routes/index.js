var express = require('express');
const request = require('request');
var router = express.Router();
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');
var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
require('dotenv').config();
const reddit = require("./reddit.js")
const keywords = require("./keywords.js")

// JSON for the front end
var jsonReport = {
  anger: false,
  fear: false,
  joy: false,
  sadness: false,
  analytical: false,
  confident: false,
  tentative: false,
  keywords: {
    one: '',
    two: '',
    three: '',
  },
  key_rel: {
    one: '',
    two: '',
    three: '',
  },
  posts: {
    one: {
      title: '',
      id: '',
    },
    two: {
      title: '',
      id: '',
    },
    three: {
      title: '',
      id: '',
    },
    four: {
      title: '',
      id: '',
    },
    five: {
      title: '',
      id: '',
    },
    six: {
      title: '',
      id: '',
    },
    seven: {
      title: '',
      id: '',
    },
    eight: {
      title: '',
      id: '',
    },
    nine: {
      title: '',
      id: '',
    },
    ten: {
      title: '',
      id: '',
    },

  }
}

var new_test_text = '';

var test_text = 'WASHINGTON, N.C. — After slamming into the Carolina coast on Friday with powerful winds and torrential rains, Hurricane Florence left a trail of devastation as it crawled over the southeastern part of the state, posing what may be its greatest threat in the days ahead as it roars inland with what are shaping up to be record-setting quantities of water.' +
'The storm, whose destructive power was unlike any the area has seen in a generation, had already caused at least five fatalities as of Friday afternoon, and rescue crews across a wide region were attempting to pluck distressed residents from rooftops. The victims included a mother and her infant in Wilmington, N.C., who were killed when a tree fell on their house, the police department said.' +
'Rescuers spent hours trying to reach the mother and infant, who were trapped by the tree and a portion of the roof that had collapsed on them, said Deputy Fire Chief J.S. Mason.' +
'Downed trees also delayed crews responding to a 911 call from the home of a woman who died of a heart attack Friday morning in Hampstead, an unincorporated area of Pender County, N.C., officials said. Another two people, both in their 70s, were killed in Lenoir County, one while trying to connect two extension cords outside in the rain, and the other when he went outside to check on his hunting dogs and was blown down by wind, the authorities said.' +
'Rescue teams had to suspend some operations because of powerful winds in South Carolina’s Horry County, which includes the coastal cities of Myrtle Beach and North Myrtle Beach.' +
'“We have now halted emergency responses until storm conditions allow for personnel to respond safely,” said Jay Fernandez, the director of public safety for North Myrtle Beach, describing winds so strong that rescuers were at risk.';

// IBM Watson Natural Language Understanding API Setup
var naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2018-03-16',
  username: process.env.WATSON_UN,
  password: process.env.WATSON_PN,
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
});
var natParams = {
  'text': test_text,
  'features': {
    'keywords': {
      'sentiment': true,
      'emotion': true,
      'limit': 3
    }
  },
  'return_analyzed_text': true
}

// IBM Watson Tone Analyzer API Setup
var toneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    iam_apikey: process.env.WATSON_TONE_KEY,
    url: 'https://gateway-wdc.watsonplatform.net/tone-analyzer/api'
});
var toneParams = {
  'tone_input': { 'text': test_text },
  'content_type': 'application/json',
  'sentences': false,
}

function pAnalyze() { // Call Watson Natural Language Understanding
  //importText returns a tuple [[post title, id], plaintext comments]
  //var new_test_text = reddit.importText(subreddit, 10,10);

  /* var synonyms = keywords.synonymRequest("boy",3);
  keywords.multiSynonymRequest(["boy","anger"],3); */
  /* return new_test_text.then((text) => {
    console.log(text);
    
    var newNatParams = natParams;
    newNatParams.text=text[1];
    return newNatParams
  }).then((params) => {  */
  return new Promise((resolve, reject) => {
    natParams.text = new_test_text[1];
    naturalLanguageUnderstanding.analyze(natParams, function(err, response) {
      console.log("nature");
      if (err) {
        console.log(err);
        reject('pAnalyze');
      }
      else {
        responses = JSON.stringify(response);
        //console.log(response);
        jsonReport.keywords.one = response.keywords[0].text;
        jsonReport.keywords.two = response.keywords[1].text;
        jsonReport.keywords.three = response.keywords[2].text;
        jsonReport.key_rel.one = response.keywords[0].relevance;
        jsonReport.key_rel.two = response.keywords[1].relevance;
        jsonReport.key_rel.three = response.keywords[2].relevance;
      }
      resolve('Text analyzed');
    });
  });
}

function pTone() { // Call Watson Tone Analyzer
  //importText returns a tuple [[post title, id], plaintext comments]
  /* var new_test_text = reddit.importText(subreddit,10,10)
  console.log();
  return new_test_text.then((text) => { */
  /* }).then((params) => {  */
  return new Promise((resolve, reject) => {
    toneParams.text = new_test_text[0][1];
    toneAnalyzer.tone(toneParams, function (error, toneAnalysis) {
      console.log("tone");
      if (error) {
        console.log(error);
        reject('pTone');
      } else {
        tones = JSON.parse(JSON.stringify(toneAnalysis));
        console.log(tones);
        for(let tone of tones.document_tone.tones) {
          if(tone.tone_name.toLowerCase() === 'analytical') {
            jsonReport.analytical = true
          }
          if(tone.tone_name.toLowerCase() === 'confident') {
            jsonReport.confident = true
          }
          if(tone.tone_name.toLowerCase() === 'tentative') {
            jsonReport.tentative = true
          }
          if(tone.tone_name.toLowerCase() === 'anger') {
            jsonReport.anger = true
          }
          if(tone.tone_name.toLowerCase() === 'fear') {
            jsonReport.fear = true
          }
          if(tone.tone_name.toLowerCase() === 'joy') {
            jsonReport.joy = true
          }
          if(tone.tone_name.toLowerCase() === 'sadnesss') {
            jsonReport.sadness = true
          }
        }
      }
      resolve('Tone analyzed');
    });
  });
}

function getText(subreddit) {
  return new Promise((resolve, reject) => {
    reddit.importText(subreddit, 10,10).then((text) =>{
      new_test_text = text;
      if(text[0][0] !== undefined){
        jsonReport.posts.one.title = text[0][0][0];
        jsonReport.posts.one.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][0][1];
      }
      if(text[0][1] !== undefined){
        jsonReport.posts.two.title = text[0][1][0];
        jsonReport.posts.two.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][1][1];
      }
      if(text[0][2] !== undefined){
        jsonReport.posts.three.title = text[0][2][0];
        jsonReport.posts.three.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][2][1];
      }
      if(text[0][3] !== undefined){
        jsonReport.posts.four.title = text[0][3][0];
        jsonReport.posts.four.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][3][1];
      }
      if(text[0][4] !== undefined){
        jsonReport.posts.five.title = text[0][4][0];
        jsonReport.posts.five.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][4][1];
      }
      if(text[0][5] !== undefined){
        jsonReport.posts.six.title = text[0][5][0];
        jsonReport.posts.six.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][5][1];
      }
      if(text[0][6] !== undefined){
        jsonReport.posts.seven.title = text[0][6][0];
        jsonReport.posts.seven.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][6][1];
      }
      if(text[0][7] !== undefined){
        jsonReport.posts.eight.title = text[0][7][0];
        jsonReport.posts.eight.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][7][1];
      }
      if(text[0][8] !== undefined){
        jsonReport.posts.nine.title = text[0][8][0];
        jsonReport.posts.nine.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][8][1];
      }
      if(text[0][9] !== undefined){
        jsonReport.posts.ten.title = text[0][9][0];
        jsonReport.posts.ten.id = 'https://reddit.com/r/' + subreddit + '/comments/' + text[0][9][1];
      }
      resolve('Text retrieved');
    }).catch((err) => {
      console.log(err);
      reject('getText');
    });
    if(new_test_text === undefined) {
      reject('getText');
    }
  });
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'MarketMe' });
});

router.post('/results', (req, res) => {
  var input = req.body.input;
  //Input parsing
  // API Call

  getText(input).then(() =>{
    pAnalyze().then(() => {
      pTone().then(() =>{
        console.log(jsonReport);
        res.render('results', { report: jsonReport });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }).catch((err) => {
    console.log(err);
  });
  
  //res.render('results', { report: jsonReport });
});

module.exports = router;
