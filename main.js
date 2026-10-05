const {app,BrowserWindow,BrowserView,ipcMain,session}=require("electron");
const path=require("path");
let win, tabs=[], active=0;

function createWindow(){
 win=new BrowserWindow({width:1400,height:900,minWidth:900,minHeight:600,
  backgroundColor:"#202124",
  webPreferences:{preload:path.join(__dirname,"preload.js"),contextIsolation:true,nodeIntegration:false}});
 win.loadFile("ui.html");
 addTab("https://www.google.com");
 win.on("resize",resize);
}

function addTab(url="https://www.google.com"){
 const view=new BrowserView({webPreferences:{contextIsolation:true,sandbox:true}});
 tabs.push({view,url});
 win.setBrowserView(view); active=tabs.length-1; resize();
 view.webContents.loadURL(url);
 view.webContents.on("did-navigate",(_,u)=>{tabs[active].url=u;sendState();});
 view.webContents.on("did-navigate-in-page",(_,u)=>{tabs[active].url=u;sendState();});
 view.webContents.on("page-title-updated",(_,title)=>{tabs[active].title=title;sendState();});
 sendState();
}

function resize(){
 if(!win||!tabs[active])return;
 const [w,h]=win.getContentSize();
 tabs[active].view.setBounds({x:0,y:108,width:w,height:Math.max(0,h-108)});
 tabs[active].view.setAutoResize({width:true,height:true});
}

function sendState(){
 if(!win)return;
 win.webContents.send("state",tabs.map((t,i)=>({title:t.title||"Nouvel onglet",url:t.url,active:i===active})));
}

function nav(text){
 let v=String(text||"").trim(); if(!v)return;
 let u=/^https?:\/\//i.test(v)?v:(/^[^\s]+\.[^\s]+$/.test(v)?"https://"+v:"https://www.google.com/search?q="+encodeURIComponent(v));
 tabs[active].url=u; tabs[active].view.webContents.loadURL(u);
}

ipcMain.handle("navigate",(_,x)=>nav(x));
ipcMain.handle("back",()=>{if(tabs[active].view.webContents.canGoBack())tabs[active].view.webContents.goBack()});
ipcMain.handle("forward",()=>{if(tabs[active].view.webContents.canGoForward())tabs[active].view.webContents.goForward()});
ipcMain.handle("reload",()=>tabs[active].view.webContents.reload());
ipcMain.handle("home",()=>nav("https://www.google.com"));
ipcMain.handle("new-tab",()=>addTab());
ipcMain.handle("select-tab",(_,i)=>{if(!tabs[i])return;active=i;win.setBrowserView(tabs[i].view);resize();sendState()});
ipcMain.handle("close-tab",(_,i)=>{if(tabs.length===1)return;if(!tabs[i])return;tabs[i].view.webContents.destroy();tabs.splice(i,1);active=Math.min(active,tabs.length-1);win.setBrowserView(tabs[active].view);resize();sendState()});

app.whenReady().then(createWindow);
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
