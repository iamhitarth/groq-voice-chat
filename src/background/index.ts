console.log('background is running')

// chrome.runtime.onMessage.addListener((request) => {
//   if (request.type === 'COUNT') {
//     console.log('background has received a message from popup, and count is ', request?.count)
//   }
// })

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.action.getBadgeText({ tabId: tab.id }, (result) => {
      if (typeof tab.id === 'number') {
        if (result === 'ON') {
          console.log('Turning off speech recognition')
          chrome.tabs.sendMessage(tab.id, { action: 'stopSpeechRecognition' })
          chrome.action.setBadgeText({ text: 'OFF', tabId: tab.id })
          chrome.action.setBadgeBackgroundColor({ color: '#808080', tabId: tab.id })
        } else {
          console.log('Turning on speech recognition')
          chrome.tabs.sendMessage(tab.id, { action: 'startSpeechRecognition' })
          chrome.action.setBadgeText({ text: 'ON', tabId: tab.id })
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000', tabId: tab.id })
        }
      }
    })
  }
})
