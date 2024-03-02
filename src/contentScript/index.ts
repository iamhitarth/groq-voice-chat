console.info('contentScript is running')

//@ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
let recognition = null
let observer = null
let observeTarget = null

const findElementByText = (text) => {
  // Get all elements that could potentially contain the text.
  const elements = document.querySelectorAll('main *')

  // Iterate over the collected elements to find a match.
  for (const element of elements) {
    if (element.innerText === text) {
      return element
    }
  }

  // If no element with the given text is found, return null.
  return null
}

/*
Speech recog is brittle - keeps stopping randomly - looks like there's a limit in terms of how long speech recog lasts for without user input. After a few seconds it auto stops. Have put in a hack to catch for that error and keep it running but there's still edge cases where it breaks.

Figure out better ways to start stop speech recognition - maybe add a push to talk button next to the submit button

See other TODOs
*/

const setupObserver = () => {
  observeTarget = document.querySelector('main')

  observer = new MutationObserver((mutations) => {
    const activeRequestsElement = findElementByText('STOP')

    // TODO hacky - hook this to when submit button is clicked
    const textarea = document.querySelector('form.w-full textarea')
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.value = ''
    }
    stopSpeechRecognition()

    // If the element is not found, it means the mutations are likely completed
    if (!activeRequestsElement) {
      console.log('Mutations are likely completed.')
      const utterance = new SpeechSynthesisUtterance(
        document.querySelectorAll('div.font-montserrat p.text-left')[0].innerText,
      )
      window.speechSynthesis.speak(utterance)
      // TODO Stop the utterance if the user starts speaking

      // TODO Hacky way to restart speech recognition
      startSpeechRecognition()
    }
  })

  const observerConfig = {
    childList: true,
    subtree: true,
  }

  if (observeTarget instanceof Node) {
    observer.observe(observeTarget, observerConfig)
  } else {
    console.error('Cannot initialize MutationObserver: observeTarget is not a Node')
  }
}

const startSpeechRecognition = () => {
  if (typeof SpeechRecognition !== 'undefined') {
    recognition = new SpeechRecognition()

    const onResult = (event) => {
      let transcribed = ''
      for (const res of event.results) {
        transcribed += res[0].transcript
      }
      const textarea = document.querySelector('form.w-full textarea')
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = transcribed
      }
    }

    const onEnd = () => {
      console.log('SpeechRecognition service has stopped.');
      // recognition.start();
    }

    const onError = (event) => {
      console.error('SpeechRecognition error:', event?.error);
      // Handle specific error cases or recover if possible
      // For example, if the error is 'no-speech', you might want to restart the recognition
      if (event?.error === 'no-speech') {
        console.log('No speech detected, should restart recognition in this case...');
        recognition.abort();
        console.log('Aborted speech recog. Attempting to restart.')
        recognition.start();
        console.log('SpeechRecognition service has restarted.');
      }
    }
    recognition.continuous = true
    recognition.interimResults = true
    recognition.addEventListener('result', onResult)
    recognition.addEventListener('end', onEnd)
    recognition.addEventListener('error', onError)

    recognition.start()
    console.log('startSpeechRecognition is running')
  } else {
    console.error('SpeechRecognition is not supported in this browser')
  }
}

const stopSpeechRecognition = () => {
  recognition.stop()
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startSpeechRecognition') {
    startSpeechRecognition()
    setupObserver()
  } else if (message.action === 'stopSpeechRecognition') {
    console.log('Calling stopSpeechRecognition')
    stopSpeechRecognition()
    observer.disconnect()
  }
})
