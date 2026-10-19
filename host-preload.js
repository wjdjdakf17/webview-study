// 호스트 창(네이티브 쪽 UI)에도 같은 패턴의 다리를 제공.
// contextIsolation: true라서 index.html의 페이지 스크립트는 require()가 없고,
// 이 preload가 노출해주는 window.hostApi만 쓸 수 있다.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hostApi', {
  onWebviewRelay: (cb) => ipcRenderer.on('webview-relay', (_e, payload) => cb(payload)),
});
