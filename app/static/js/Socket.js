import io from 'socket.io-client';
import icon from './Icon'
import u from './Util';
import anchorme from "anchorme";
import _ from './utils/I18n';

RegExp.escape= function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const socket = io('///snt', {transports: ['websocket'], upgrade: false});

function updateNotifications(count){
  var title = document.getElementsByTagName('title')[0].innerHTML.split('\n');
  title = title[title.length-1]
  var doc = new DOMParser().parseFromString(title, "text/html");
  title = doc.documentElement.textContent;
  if(count == 0){
    document.title = '\n' + title;
    document.getElementById('mailcount').innerHTML = '';
    document.getElementById('mailcount').style.display = 'none';
  }else{
    document.title = '(' + count + ')\n ' + title;
    document.getElementById('mailcount').innerHTML = count;
    document.getElementById('mailcount').style.display = 'inline-block';
  }

}

socket.on('notification', function(d){
  updateNotifications(d.count)
});

socket.on('uinfo', function(d){
  updateNotifications(d.ntf);
  document.getElementById('postscore').innerHTML = d.taken;
});

socket.on('uscore', function(d){
  document.getElementById('postscore').innerHTML = d.score;
})

socket.on('deletion', function(data){
  var post = document.querySelector('div.post[pid="' + data.pid + '"]');
  post.parentNode.removeChild(post);
})

socket.on('thread', function(data){
  if(window.blocked){
    if(window.blocked.indexOf(data.sid) >= 0){return;}
  }
  socket.emit('subscribe', {target: data.pid})
  var ndata = document.createElement( "div" );
  ndata.innerHTML = data.html;
  var x =document.getElementsByClassName('alldaposts')[0];

  while (ndata.firstChild) {
    var k = x.insertBefore(ndata.firstChild ,x.children[0]);
    if(window.expandall && k.getElementsByClassName){
      var q = k.getElementsByClassName('expando-btn')[0]
      if(q && q.getAttribute('data-icon') == "image"){
        q.click()
      }
    }

  }

  icon.rendericons();
})

socket.on('threadscore', function(data){
  console.log('article#' + data.pid + ' .count')
  document.querySelector('div[pid="' + data.pid + '"] .score').innerHTML = data.score;
})

socket.on('threadcomments', function(data){
  console.log('article#' + data.pid + ' .ccount')
  document.querySelector('div[pid="' + data.pid + '"] .comments').innerHTML = _('comments (%1)', data.comments);
})

socket.on('threadtitle', function(data){
  document.querySelector('div[pid="' + data.pid + '"] .title').innerHTML = data.title;
});

socket.on('yourvote', function(data){
  var th = document.querySelector('div.post[pid="' + data.pid + '"] .votebuttons')
  if(th){
    if(data.status == -1){
      th.querySelector('.upvote').classList.remove('upvoted');
      th.querySelector('.downvote').classList.add('downvoted');
    }else if(data.status == 1){
      th.querySelector('.upvote').classList.add('upvoted');
      th.querySelector('.downvote').classList.remove('downvoted');
    }else{
      th.querySelector('.upvote').classList.remove('upvoted');
      th.querySelector('.downvote').classList.remove('downvoted');
    }
    th.querySelector('.score').innerHTML = data.score;
  }
})

u.ready(function(){
  socket.on('connect', function() {
    if(document.getElementById('chpop') && window.chat == true){
      socket.emit('subscribe', {target: 'chat'});
    }
  });
  if(window.labrat){
    socket.on('connect', function() {
      window.sio = true;
      if(window.nposts){
        socket.emit('subscribe', {target: window.nposts});
      }
      u.each('div.post', function(t, i){
        socket.emit('subscribe', {target: parseInt(t.getAttribute('pid'))});
      })
    });
  }
})


u.sub('#chtitle', 'click', function(e){
  var hid = this.getAttribute('hid');
  if(!hid){ // hid
    this.parentNode.style.height = '1.65em';
    this.parentNode.style.width = '25%';
    document.getElementById('chbott').style.display='none';
    this.setAttribute('hid', true);
  }else{
    this.parentNode.style.height = '50%';
    this.parentNode.style.width = '50%';
    document.getElementById('chbott').style.display='block';
    this.removeAttribute('hid');
    var x = document.getElementById('chcont');
    x.scrollTop = x.scrollHeight
  }
})

function isScrolledIntoView(el) {
    var elemTop = el.getBoundingClientRect().top;
    var elemBottom = el.getBoundingClientRect().bottom;
    var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
    return isVisible;
}

u.sub('#chsend', 'keydown', function(e){
  if(e.keyCode == 13){
    socket.emit('msg', {msg: this.value})
    this.value = '';
    var x = document.getElementById('chcont');
    x.scrollTop = x.scrollHeight
  }
})

var ircStylize = require("irc-style-parser");

socket.on('rmannouncement', function(){
  if(window.oindex){
    document.getElementById('announcement-post').outerHTML = '';
  }
})

socket.on('announcement', function(data){
  if(window.oindex){
    var elm = document.createElement('div');
    elm.id = "announcement-post";
    elm.innerHTML = data.cont;
    document.getElementById('container').insertAdjacentElement('afterbegin', elm);
    icon.rendericons();
  }
})

socket.on('msg', function(data){
  var cont = document.getElementById('chcont')
  if(!cont){return;}
  var uname = document.getElementById('unameb').innerHTML.toLowerCase();
  var reg = /(^|\s)(@|\/u\/)([a-zA-Z0-9_-]{3,})(\s|\'|\.|,|$)/g
  var reg2 = /\u0001ACTION (.+)\u0001/
  var m = data.msg.match(reg);
  var m2 = data.msg.match(reg2);
  var xc="";
  if(m && !m[3]){m[3] = '';}
  if(m && m[3].toLowerCase() == uname && data.user.toLowerCase() != uname){
    xc="msg-hl";
    // TODO: Ping sounds here?
  }
  if(m2){
    data.msg = data.user + ' ' + m2[1];
    data.user = "*";
    xc=xc + " msg-ac";
  }
  cont.innerHTML = cont.innerHTML + '<div class="msg ' + xc + '"><span class="msguser">' + data.user + '&gt;</span><span class="damsg">' + anchorme(ircStylize(data.msg.replace(/  /g, '&#32;&nbsp;')), {emails: false, files: false, attributes: [{name:"target",value:"blank"}]}).replace(reg, "$1<a href='/u/$3'>$2$3</a>$4") + '</span></div>';
  var k = document.getElementsByClassName('msg')
  if(k.length > 3){
    if(isScrolledIntoView(k[k.length-2])){
      k[k.length-2].scrollIntoView();
    }
  }
})


module.exports = socket;
