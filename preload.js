const {contextBridge,ipcRenderer}=require("electron");
contextBridge.exposeInMainWorld("chromeAPI",{
 navigate:x=>ipcRenderer.invoke("navigate",x),back:()=>ipcRenderer.invoke("back"),
 forward:()=>ipcRenderer.invoke("forward"),reload:()=>ipcRenderer.invoke("reload"),
 home:()=>ipcRenderer.invoke("home"),newTab:()=>ipcRenderer.invoke("new-tab"),
 selectTab:i=>ipcRenderer.invoke("select-tab",i),closeTab:i=>ipcRenderer.invoke("close-tab",i),
 onState:cb=>ipcRenderer.on("state",(_,s)=>cb(s))
});