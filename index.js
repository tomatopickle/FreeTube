const express = require('express');
const app = express();
var Datastore = require('nedb')
  , db = new Datastore({ filename: __dirname + '/data.db', autoload: true });
var bodyParser = require('body-parser')
app.use( bodyParser.json() );  
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname+"/public"));
app.listen(3000, () => {
  console.log('server started');
});
app.get("/api/user",(req,res)=>{
  db.findOne({ id: req.query.id }, function (err, usr) {
    if(!usr){
      const newUser = {id:req.query.id,playlists:[],history:{videos:[],search:[]}};
      db.insert(newUser,(err,usr)=>{
        res.json(newUser);
      });
    }else{
        usr.videos = usr.videos.reverse();
        usr.search = usr.search.reverse();
        usr.playlists = usr.playlists.reverse();
        res.json(usr);
    }
  });
});
app.post("/api/search",(req,res)=>{
   db.update({ id: req.body.id }, { $push: { search: req.body.search } }, {}, function () {
     res.end("200");
  });
});
app.post("/api/video",(req,res)=>{
   db.update({ id: req.body.id }, { $push: { videos: req.body.video } }, {}, function () {
     res.end("200");
  });
});
app.post("/api/playlist",(req,res)=>{
   db.update({ id: req.body.id }, { $push: { playlists: req.body.playlist } }, {}, function () {
     res.end("200");
  });
});