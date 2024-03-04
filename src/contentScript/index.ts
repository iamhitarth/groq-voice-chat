console.info('contentScript is running')

let submitButton: HTMLButtonElement | null;
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
let recognition: typeof SpeechRecognition | null = null
let observer: MutationObserver | null = null

const findElementByText = (text: string): HTMLElement | null => {
  // Get all elements that could potentially contain the text.
  const elements = document.querySelectorAll('main *')

  // Iterate over the collected elements to find a match.
  for (const element of elements) {
    if ((element as HTMLElement).innerText === text) {
      return element as HTMLElement
    }
  }
  // If no element with the given text is found, return null.
  return null
}

/*
TODOs
Figure out when model response is done consistently - observer approach is flaky
Remove the messages being sent from background script
Figure out when to call observer.disconnect
 */

const setupDOMObserver = () => {
  const observeTarget = document.querySelector('main')

  observer = new MutationObserver((mutations) => {
    const STOPButtonElement = findElementByText('STOP')

    // If the element is not found, it means the mutations are likely completed
    if (!STOPButtonElement) {
      console.log('Response from model is likely completed.')
      const paragraphElement = document.querySelectorAll('div.font-montserrat p.text-left')[0]
      if (paragraphElement instanceof HTMLElement) {
        const utterance = new SpeechSynthesisUtterance(paragraphElement.innerText)
        window.speechSynthesis.speak(utterance)
      }
      // TODO hacky - try adding this to mousedown event listener
      const textarea = document.querySelector('form.w-full textarea')
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.value = ''
      }
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

    const onResult = (event: { results: any }) => {
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
      console.log('SpeechRecognition has stopped.')
    }

    recognition.continuous = true
    recognition.interimResults = true
    recognition.addEventListener('result', onResult)
    recognition.addEventListener('end', onEnd)

    recognition.start()
    console.log('SpeechRecognition is running')
  } else {
    console.error('SpeechRecognition is not supported in this browser')
  }
}

const stopSpeechRecognition = () => {
  recognition.stop()
}

const addPushToTalkButton = () => {
  // Create the Push to Talk button
  const pushToTalkButton = document.createElement('button')
  pushToTalkButton.textContent = 'Push to Talk'
  pushToTalkButton.title = 'Click and hold to start speaking'
  pushToTalkButton.style.marginLeft = '0.75em' // Add some spacing between buttons
  pushToTalkButton.style.padding = '0.5em' // Add padding for better appearance
  pushToTalkButton.style.border = '1px solid #ccc' // Add border
  pushToTalkButton.style.cursor = 'pointer' // Change cursor on hover
  pushToTalkButton.style.backgroundColor = '#f8f8f8' // Default background color
  pushToTalkButton.style.borderRadius = '5px' // Rounded corners

  // Define active and inactive colors
  const activeColor = '#4CAF50' // Green color when active
  const inactiveColor = '#f8f8f8' // Original color when inactive

  // Event listeners for the Push to Talk button
  pushToTalkButton.addEventListener('mousedown', () => {
    // Start speech recognition when the button is pressed
    startSpeechRecognition()
    pushToTalkButton.style.backgroundColor = activeColor // Change to active color
    window.speechSynthesis.cancel()
  })

  pushToTalkButton.addEventListener('mouseup', () => {
    // Stop speech recognition when the button is released
    stopSpeechRecognition()
    pushToTalkButton.style.backgroundColor = inactiveColor // Change to active color
  })

  // Insert the Push to Talk button next to the submit button
  if (submitButton && submitButton.parentNode) {
    submitButton.parentNode.insertBefore(pushToTalkButton, submitButton.nextSibling)
  } else {
    console.error('Submit button not found')
  }
}

// Make sure the submit button exists before kicking off rest of the code
const checkExist = setInterval(function () {
  submitButton = document.querySelector('form.w-full button[type="submit"]')
  if (submitButton) {
    clearInterval(checkExist)

    addPushToTalkButton()
    setupDOMObserver()
  }
}, 100)
