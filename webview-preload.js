// 웹뷰 안 페이지에 "미리 주입"되는 스크립트 (preload).
// 웹뷰 안의 일반 웹페이지는 Node/Electron API가 전혀 없다.
// preload가 유일한 창구라서, 이걸로 호스트와 웹뷰 사이의 안전한 다리를 만든다.
const { ipcRenderer } = require('electron');

// 호스트(renderer)가 wv.send()로 보낸 메시지 수신
ipcRenderer.on('host-greeting', (_event, msg) => {
  console.log('[웹뷰 preload] 호스트에게 받음:', msg);
  // 다시 호스트로 응답. 호스트에서는 'ipc-message' 이벤트로 도착한다.
  ipcRenderer.sendToHost('webview-pong', '웹뷰가 응답함: ' + msg);
});
