/**
 * Created by Vunb on 4.11.2015.
 */

var Fello = function () {
  var style = "border: medium none!important;" +
      "overflow: hidden!important;" +
      "position: fixed!important;" +
      "top: 0px!important;" +
      "right: 0px!important;" +
      "left: auto!important;" +
      "bottom: auto!important;" +
      "z-index: 2147483647!important;" +
      "width: 100%!important;" +
      "height: 100%!important;"
  //+ "display: none"
    , btnStyle = "color: white;" +
      "cursor: pointer;" +
      "position: absolute;" +
      "right: 20px;" +
      "bottom:0px;" +
      "height: 30px;" +
      "padding: 5px 36px;" +
      "font: bold 16px/30px Tahoma,Verdana,sans-serif;" +
      "background: url(\"/icon/chatVideo.svg\") no-repeat scroll left center rgb(51, 102, 102);"
  //, embed = "http://localhost:1337/embed/embed.html"
    , embed = "http://localhost:1337/embed/demo"
    , button = "<div class='openFello' onclick='Fello.open()' style='" + btnStyle + "'><span></span></div>"
      + "<style>div.openFello span:after {content: 'Click here to Call Video';}</style>"

    ;

  this.id = false;
  this.drawer = false;
  this.isCreated = false;
  // Create IE + others compatible event handler
  var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
  var eventer = window[eventMethod];
  var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

  // Listen to message from child window
  eventer(messageEvent, function (event) {
    if (event.origin !== 'https://fello.in') {
      // return;
      console.log(event.origin);
    }
    var type = event.type;
    var data = event.data;
    var id = Fello.id;
    if (data == "close" && id) {
      Fello.drawer.style.display = "none";
      //Fello.drawer.style.opacity = 0;
    }
  }, false);

  this.init = function (roomid) {
    this.id = roomid;
    // buton call
    var btnCallVideo = document.createElement('div');
    btnCallVideo.innerHTML = button;
    document.body.appendChild(btnCallVideo);
  };

  this.open = function () {
    var drawer = this.loadRoom(this.id);
    drawer.style.display = "block";
    //drawer.style.opacity = 1;
  };

  this.loadRoom = function (roomid) {
    if (this.drawer) {
      return this.drawer;
    } else {
      var link = embed;
      if (roomid) {
        link += "?roomName=" + roomid;
      }
      var iframe = document.createElement('iframe');
      iframe.id = "fid_" + roomid;
      iframe.title = "Fello";
      iframe.width = "100%";
      iframe.height = "100%";
      iframe.className = "cl0";
      iframe.frameBorder = 0;
      iframe.allowtransparency = true;
      iframe.style.cssText = style;
      iframe.setAttribute("src", link);
      document.body.appendChild(iframe);
      this.id = iframe.id;
      this.drawer = iframe;
      return this.drawer;
    }
  };

  this.createCallButton = function () {

  }

};

window.Fello = new Fello();
