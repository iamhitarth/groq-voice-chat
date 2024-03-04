# groq-voice-chat

An experimental Google Chrome extension for adding a voice interface on top of the [Groq chat](https://groq.com).

Generated using [create-chrome-ext](https://github.com/guocaoyi/create-chrome-ext) and built with Vite + React and Web Speech API.

## Pre-requisites

1. `Node.js` version >= **14**
2. Latest version of Google Chrome
3. Account on [Groq.com](https://groq.com)
4. System prompt for [Groq.com](https://groq.com)that says `Limit your answers to very succinct and short one line answers only. Do NOT use paragraphs. Just single line answers.`

## Getting up and running

After cloning the repo, run the following commands:

```shell
$ cd groq-voice-chat

$ npm i

$ npm run dev
```

### Loading the Chrome Extension

1. Turn on Chrome 'Developer mode'
2. Click 'Load unpacked', and select `groq-voice-chat/build` folder
3. Head over to [Groq chat](https://groq.com) and tap on the "Push to Talk" button to get started.


## TODOs
This can be added on top of any chatbots as long as:
* we have a place to insert the push to talk button.
* we know where to transcribe the user's speech to.
* we have a way of knowing when the model response is done.
