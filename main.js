// 메인 프로세스 = 앱의 "호스트" 역할.
// 웹뷰 안의 웹페이지는 별도 렌더러 프로세스에서 돌고,
// 메인은 그 둘 사이의 중개자(IPC 라우터)가 된다.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      // <webview> 태그를 쓰려면 명시적으로 켜야 한다 (기본값 꺼짐).
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'host-preload.js'),
    },
  });

  // 호스트 창 자체는 로컬 HTML을 로드한다.
  win.loadFile('index.html');

  // 웹뷰 안에서 보낸 메시지를 중계: 메인이 받아서 호스트 렌더러로 전달.
  // (웹뷰 → 메인 → 호스트. 웹뷰와 호스트는 직접 통신할 수 없어서 메인이 다리 역할)
  ipcMain.on('from-webview', (_event, payload) => {
    console.log('[main] 웹뷰에서 받음:', payload);
    // win.webContents.send()로 호스트 쪽에 다시 쏴준다.
    win.webContents.send('webview-relay', payload);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
