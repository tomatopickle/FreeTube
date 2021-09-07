let auth0 = null;
var usr = false;
// var app.customPlayList = false;
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var key = 'AIzaSyCBCjn6lSKfcl0LhlKnf1abn8rhf61vEaU';
//alt key = "AIzaSyBzGwj0n4NjhyogpqvhsJPY42StEbKyWFY"
let player;
var safe = false;
var app = new Vue({
  el: "#app",
  vuetify: new Vuetify({
  theme: {
    themes: {
    dark: {
    primary:"#ff3333",
    secondary: "#424242",
    accent: "#82B1FF",
    error: "#FF5252",
    info: "#2196F3",
    success: "#4CAF50",
    warning: "#FFC107",
   }
  },
  dark:true,
 }}),
 data:()=>({
   first:true,
   search:"",
   loading:false,
   items: [],
   currntKey:0,
   history:false,
   historyOpts:[{opt:"Videos",val:"video"},{opt:"Search",val:"search"}],
   historyOpt:"video",
   songNumb:0,
   user:{
     id:false,
     playlists:[],
     history:{
       videos:[],
       search:[]
     },
   },
   video:{
     shown:false,
     id:'',
     playing:true,
     playlist:[],
     mini:{
       shown:false
     }
   },
   playlistAdd:{
     modal:false,
     title:""
   },
   playlistModal:false,
   customPlaylist:false,
   showMenu: false,
   x: 0,
   y: 0,
 }),
 mounted:()=>{
    const url = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=QA&videoCategoryId=10&key="+key+"&maxResults=25&safeSearch=" + safe
    getData(url,(data)=>{
      data = JSON.parse(data);
      console.log(data)
      app.items = data.items;
      app.loading = false;
    });
    if(localStorage.getItem("usr")){
    getData("/api/user?id="+JSON.parse(localStorage.getItem("usr")).id,(data)=>{
      localStorage.setItem("usr",data);
      data = JSON.parse(data);
      app.user = data;
      console.log(data);
      usr = true;
    });
    }
 },
 methods:{
   addPlayList(){
     app.playlistAdd.modal = false;
     let playlist = [];
     app.video.playlist.forEach((item)=>{
       if(item.snippet){
         let vid = {};
         console.log(item)
         vid.id = item.id;
         vid.img = item.snippet.thumbnails.maxres ?     item.snippet.thumbnails.maxres.url:item.snippet.thumbnails.medium.url;
         vid.title = item.snippet.title;
         playlist.push(vid);
       }
     });
     let data = {};
     data.title = app.playlistAdd.title;
     data.vids = playlist;
     console.log(data);
     postData("/api/playlist",{id:app.user.id,playlist:data},(e)=>{
        console.log(e);
     });
     console.log(playlist);
   },
   opnPlayList(e){
     console.log(e)
     app.customPlayList = true;
     this.opnVideo(e.vids[0].id.videoId,e.vids[0]);
     console.log(e.vids)
     app.video.playlist = e.vids;
   },
   checkSearch(e){
     if (e.keyCode === 13) {
       app.loading = true;
       const url = `https://www.googleapis.com/youtube/v3/search?key=${key}&q=${e.target.value}&part=snippet&maxResults=50&type=video&videoEmbeddable=true&safeSearch=moderate&videoCategoryId=10`;
       getData(url,(data)=>{
         data = JSON.parse(data);
         console.log(data);
         app.items = data.items;
         app.loading = false;
         if(usr){
           postData("/api/search",{id:app.user.id,search:e.target.value},(data)=>{
             console.log(data);
           });
           app.user.search.unshift(e.target.value);
         }
      });
     }
   },
   queue(item){
     if(!app.customPlayList){
       app.video.playlist = [];
       app.video.playlist.push(item);
       app.video.playlist.unshift({id:app.video.id,title:app.video.title,img:app.video.img});
       setTimeout(()=>{
         document.querySelectorAll("#recommends .v-list-item")[0].classList.add("info");
       },500);
      }else{
       app.video.playlist.push(item);
     }
     app.customPlayList = true;
   },
   searchVid(q){
     app.loading = true;
     app.history = false;
       const url = `https://www.googleapis.com/youtube/v3/search?key=${key}&q=${q}&part=snippet&maxResults=50&type=video&videoEmbeddable=true&safeSearch=moderate&videoCategoryId=10`;
       getData(url,(data)=>{
         data = JSON.parse(data);
         console.log(data);
         app.items = data.items;
         app.loading = false;
         if(usr){
           postData("/api/search",{id:app.user.id,search:q},(data)=>{
             console.log(data);
             app.user.search.unshift(q);
           });
         }
     });
   },
   opnVideo(id,item,i){
      if(!app.video.mini.shown){
      app.video.shown = true;
      }
      if(!this.first){
        player.destroy();
      }
      this.first = false;
      player = new YT.Player('videoPlayer', {
        videoId: id.videoId || id,
        playerVars:{
          autoplay:true
        },
        events: {
          onStateChange: onPlayerStateChange
        }
     });
     console.log(id.videoId || id);
     id = id.videoId || id;
     if(item.snippet){
       app.video.img = item.snippet.thumbnails.maxres ?   item.snippet.thumbnails.maxres.url:item.snippet.thumbnails.medium.url;
       app.video.title = item.snippet.title;
     }else{
       app.video.img = item.img;
       app.video.title = item.title;
     }
     if(!app.customPlayList){
     getData("https://www.googleapis.com/youtube/v3/search?key="+key+"&relatedToVideoId=" +  id + "&type=video&maxResults=16&part=snippet&videoCategoryId=10",(data)=>{
       app.video.playlist = JSON.parse(data).items;
       console.log(JSON.parse(data));
       if(usr){
         let video = {title:item.snippet.title,id:id,img:app.video.img};
         console.log(video)
          postData("/api/video",{id:app.user.id,video:video},(data)=>{
            console.log(data);
            app.user.videos.unshift(video);
          });
        }
     });
     }else{
       let video = {title:item.title,id:id,img:item.img};
       if(i){
       app.songNumb = i;
       if(document.querySelector("#recommends .v-list .info")){
       document.querySelector("#recommends .v-list .info").classList.remove("info");
       }
       document.querySelectorAll("#recommends .v-list-item")[app.songNumb].classList.add("info");
       }
       postData("/api/video",{id:app.user.id,video:video},(data)=>{
          console.log(data);
          app.user.videos.unshift(video);
        });
     }
   },
   minimize(){
     app.video.shown = false;
     app.video.mini.shown = true;
   },
   toggleVideo(){
     app.video.playing = !app.video.playing;
     if(app.video.playing){
       player.playVideo();
     }else{
       player.pauseVideo();
     }
   },
   show (e) {
     e.preventDefault();
     this.showMenu = false;
     this.x = e.clientX;
     this.y = e.clientY;
     this.$nextTick(() => {
       this.showMenu = true;
     });
  },
  async toggleLog(){
    const isAuthenticated = await auth0.isAuthenticated();
     if(isAuthenticated){
      logout();
     }else{
       login();
     }
   }
 }
});
function onPlayerStateChange(e){
  if(player.getPlayerState()==0){
    console.log(app.video.playlist[1])
    if(!app.customPlayList){
      app.opnVideo(app.video.playlist[1].id);
    }else{
      console.log(app.songNumb);
      app.songNumb++;
      if(app.songNumb == app.video.playlist.length){
         app.songNumb = 0;
      }
      app.opnVideo(app.video.playlist[app.songNumb].id,app.video.playlist[app.songNumb]);
      if(document.querySelector("#recommends .v-list .info")){
       document.querySelector("#recommends .v-list .info").classList.remove("info");
       }
      document.querySelectorAll("#recommends .v-list-item")[app.songNumb].classList.add("info");
    }
  }
}
function getData(url,func){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       return func(xhttp.responseText);
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}
const fetchAuthConfig = () => fetch("/auth_config.json");
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientId
  });
};
window.onload = async () => {
  await configureClient();
  updateAccState();
  const isAuthenticated = await auth0.isAuthenticated();
  if (isAuthenticated) {
    return;
  }
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0.handleRedirectCallback();
    updateAccState();
    window.history.replaceState({}, document.title, "/");
  }
}

const updateAccState = async () => {
  const isAuthenticated = await auth0.isAuthenticated();
  console.log(isAuthenticated);
  auth0.getUser().then(function(e){
    console.log(e)
    if(!e){return}
    console.log("loading data", e.sub)
    getData("/api/user?id="+e.sub,(data)=>{
      localStorage.setItem("usr",data);
      data = JSON.parse(data);
      app.user = data;
      console.log(data);
      usr = true;
    });
  });
};
const logout = () => {
  localStorage.clear("usr");
  auth0.logout({
    returnTo: window.location.origin
  });
};
async function login () {
  await auth0.loginWithRedirect({
  redirect_uri: window.location.origin
  });
};
function postData(url,json,func){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       return func(xhr.responseText);
    }
  };
  xhr.open("POST", url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(json));
}