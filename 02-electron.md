# 02 — Electron 웹뷰 동작 원리 (실습 예제 기준)

실행: `npm install && npm start`

## 핵심 개념: 프로세스가 3개로 나뉜다

```
[메인 프로세스 main.js]  ← 앱의 심장. 창 생성, OS 접근, IPC 라우터
        │  (index.html 로드)
[호스트 렌더러 index.html]  ← "네이티브 앱 UI" 역할. host-preload.js가 다리
        │  (<webview> 태그 = 임베디드 브라우저)
[웹뷰 렌더러 example.com]  ← 완전히 별도 프로세스. webview-preload.js가 다리
```

- 웹뷰 안의 페이지는 **별도 렌더러 프로세스**에서 돈다. 호스트와 JS 컨텍스트를 공유하지 않아서 직접 접근이 불가능하다.
- 그래서 모든 통신은 **IPC(프로세스 간 통신)** 로만 가능하다.

## 메시지가 움직이는 3가지 경로

1. **호스트 → 웹뷰**: `wv.send('host-greeting', msg)` → 웹뷰의 preload에서 `ipcRenderer.on('host-greeting')` 수신
2. **웹뷰 → 호스트**: preload에서 `ipcRenderer.sendToHost('webview-pong', ...)` → 호스트에서 `wv.addEventListener('ipc-message')` 수신
3. **웹뷰 → 메인**: preload에서 `ipcRenderer.send('from-webview', ...)` → 메인에서 `ipcMain.on()` 수신 → 필요하면 `win.webContents.send()`로 호스트에 중계

## 보안 패턴: 두 개의 preload 다리

`contextIsolation: true, nodeIntegration: false`가 기본 방어선이다.

- **host-preload.js**: `contextBridge.exposeInMainWorld('hostApi', ...)`로 페이지에 안전한 API만 노출
- **webview-preload.js**: 웹뷰 안 페이지가 Electron API를 쓸 수 있는 **유일한 창구**. 여기서 허용한 채널만 오간다

웹뷰 안에 로드된 외부 사이트(example.com)는 아무것도 할 수 없고, preload가 허용한 다리만 쓴다 — 이게 웹뷰 보안 모델의 핵심.

## 확인해볼 것

- [ ] "웹뷰에 메시지 보내기" → 로그에 호스트→웹뷰→메인 중계까지 3단계 흐름
- [ ] DevTools(⌥⌘I)에서 웹뷰와 호스트의 프로세스가 다른지 확인 (콘솔 분리됨)
- [ ] `webview-preload.js`의 `ipcRenderer.on` 채널명을 바꾸면 통신이 끊기는지 확인
