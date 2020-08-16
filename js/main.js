var clicks = [];
var pages = [];
var ts, tsp, scrollStatus;
var sumedges;

var setTabIndexesPage = function (pageId) {
  console.log("set TabIndexes of Page:", pageId);
  let elements = document.querySelectorAll(
    ".page:not(#" + pageId + ') [tabindex="0"]'
  );
  for (var i = 0; i < elements.length; i++)
    elements[i].setAttribute("tabindex", "-1");

  elements = document.querySelectorAll(".page#" + pageId + ' [tabindex="-1"]');
  for (var i = 0; i < elements.length; i++)
    elements[i].setAttribute("tabindex", "0");
};

var getCurrentPageId = function () {
  let currPage = document.querySelector("[data-scroll].active");
  let currPageId;
  if (currPage == null) {
    currPageId = window.localStorage.getItem("nav");
    if (currPageId == null) currPageId = "zero";
    document
      .querySelector("[data-scroll='" + currPageId + "']")
      .classList.add("active");
      document.getElementById(currPageId).classList.add("active");
  } else {
    currPageId = currPage.dataset.scroll;
  }
  window.localStorage.setItem("nav", currPageId);
  console.log("getCurrentPageId: ", currPageId);
  return currPageId;
};

var isCurrentPage = function (pageId) {
  let currPageId = getCurrentPageId();
  console.log("isCurrentPageId: ", currPageId == pageId);
  return currPageId == pageId;
};

var setCurrentPage = function (pageId) {
  console.log("setCurrentPage: ", pageId);
  if (!isCurrentPage(pageId)) {
    document.querySelector("[data-scroll].active").classList.remove("active");
    document.querySelector(".page.active").classList.remove("active");
    document
      .querySelector("[data-scroll='" + pageId + "']")
      .classList.add("active");
      document.getElementById(pageId).classList.add("active");
    setTabIndexesPage(pageId);
  }
  window.localStorage.setItem("nav", pageId);
  
};

var scrollToPage = function (pageId, behavior) {
  let topview = document.getElementById("viewport").scrollTop;
  let offsetel = document.getElementById(pageId).getBoundingClientRect().top;
  let blockOffset = offsetel + topview;
  if (offsetel != 0) {
    console.log("blockOffset:", blockOffset);
    try {
      document
        .getElementById("viewport")
        .scroll({ left: 0, top: blockOffset, behavior: behavior });
    } catch (err) {
      document.getElementById("viewport").scrollTop = blockOffset;
    }
  }
};

var goToPage = function (pageId, behavior) {
  document.querySelector("[data-scroll='" + pageId + "']").focus();
  setCurrentPage(pageId);
  scrollToPage(pageId, behavior);
  document.querySelector("[data-scroll='" + pageId + "']").blur();
};

var initMenu = function () {
  let elements = document.querySelectorAll("[data-scroll]");
  for (var i = 0; i < elements.length; i++) {
    pages.push(elements[i].dataset.scroll);
    elements[i].onclick = function (event) {
      console.log("click: ", event);
      let pageId = this.dataset.scroll;
      behavior = event.isTrusted ? "smooth" : "auto";
      goToPage(pageId, behavior);
      return false;
    };
  }
};

var slider = function (offset) {
  console.log("slider");
  if (offset != 0) {
    let currPage = getCurrentPageId();
    direction = Math.abs(offset) > 50 ? Math.sign(offset) : 0;
    let index = pages.indexOf(currPage) + direction;
    if (0 <= index && index < pages.length && direction != 0)
      goToPage(pages[index], "smooth");
    else scrollToPage(currPage, "smooth");
  }
};

var getScrollStatus = function (elements) {
  let status = "both";
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].id == "nav") {
      status = "not";
      break;
    } else if (
      !["body", "html", "viewport"].includes(elements[i].id) &&
      elements[i].style != null &&
      ["scroll", "auto"].includes(getComputedStyle(elements[i]).overflowY) &&
      elements[i].scrollHeight > elements[i].clientHeight
    ) {
      console.log(
        elements[i],
        elements[i].scrollTop,
        elements[i].scrollHeight,
        elements[i].clientHeight
      );
      tmp = "not";
      if (elements[i].scrollTop == 0) tmp = "up";
      else if (
        elements[i].scrollHeight - elements[i].scrollTop <=
        elements[i].clientHeight
      )
        tmp = "down";
      if (status == "both") status = tmp;
      else if (status != tmp) {
        status = "not";
        break;
      }
    }
  }
  return status;
};

var initViewPort = function () {
  let viewheight = window.innerHeight;
  let viewwidth = window.innerWidth;
  sumedges = viewheight + viewwidth;
  let viewport = document.querySelector("meta[name=viewport]");
  viewport.setAttribute(
    "content",
    "width=device-width, height=" + viewheight + ", initial-scale=1.0"
  );
  console.log("set orientation size", viewwidth, viewheight);
};

var checkNav = function () {
  currPageId = getCurrentPageId();
  // setCurrentPage(currPageId);
  element = document.querySelector("[data-scroll='" + currPageId + "']");
  console.log("CHECKNAV: ", element);
  element.click();
};

function changeBtn() {
  titles = document.getElementById("intro-titles");
  btn = document.getElementById("intro-btn");
  if (titles.classList.contains("active")) {
    btn.innerHTML = "Узнать больше";
    btn.classList.remove("warn-btn");
  } else {
    btn.innerHTML = "Закрыть";
    btn.classList.add("warn-btn");
  }
}

function activeIntro(active) {
  titles = document.getElementById("intro-titles");
  info = document.getElementById("intro-info");
  if (active && !titles.classList.contains("active")) {
    info.classList.remove("active");
    titles.classList.add("active");
    changeBtn();
  }
  if (!active && titles.classList.contains("active")) {
    titles.classList.remove("active");
    info.classList.add("active");
    changeBtn();
  }
}

function deleteAllCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

document.getElementById("intro-btn").onclick = function () {
  titles = document.getElementById("intro-titles");
  if (titles.classList.contains("active")) {
    activeIntro(false);
  } else {
    activeIntro(true);
  }
  changeBtn();
};

function logoutUser() {
  window.localStorage.removeItem("login");
  window.localStorage.removeItem("name");
  unsetUser();
}

function errorLogin() {
  console.log("Error login!!!");
}

function res_getLogin() {
  console.log("status login: ", this.readyState);
  if (this.readyState == 4 && this.status == 200) {
    console.log("Loaded getLogin");
    try {
      console.log(this.responseText);
      var res = JSON.parse(this.responseText);
      console.log(res);
      if (!res.err) {
        setUser(res);
      } else {
        errorLogin(res);
      }
    } catch (err) {
      console.log("!!!:", err);
    }
  }
}

// function res_getId() {
//   console.log("statusid: ", this.readyState);
//   if (this.readyState == 4 && this.status == 200) {
//     console.log("Loaded getId");
//     try {
//       console.log(this.responseText);
//       var res = JSON.parse(this.responseText);
//       console.log(res);
//       if (!res.err) {
//         window.localStorage.setItem("id", res.id);
//         clicks.forEach((fun) => {
//           fun.call();
//           clicks.remove(fun);
//         });
//       } else if (res.id == "retry") {
//         window.localStorage.removeItem("id");
//         console.log("GGGGGGGGGGGG1");
//         deleteAllCookies();
//         // getId();
//       }
//     } catch (err) {
//       console.log("!!!:", err);
//     }
//   }
// }

// function res_getCookie() {
//   console.log("statuscook: ", this.readyState);
//   if (this.readyState == 4 && this.status == 200) {
//     console.log("Loaded getCookie");
//     try {
//       console.log(this.responseText);
//       var res = JSON.parse(this.responseText);
//       console.log("setting id: ", res.id);
//       if (!res.err) {
//         clicks.forEach((fun) => {
//           fun.call();
//           clicks.remove(fun);
//         });
//       } else if (res.id == "not found") {
//         console.log(">getID");
//         window.localStorage.removeItem("id");
//         console.log("GGGGGGGGGGGG2");
//         deleteAllCookies();
//         getId();
//       }
//     } catch (err) {
//       console.log("!!!:", err);
//     }
//   }
// }

// document.getElementById("cookie-btn").onclick = function (event) {
//   event.preventDefault();
//   getCookie();
// };

// function getCookie() {
//   var myId = window.localStorage.getItem("Id");
//   if (myId == null) {
//     getId();
//   } else {
//     console.log("before:", myId);
//     console.log("after:", md5(myId.concat("sdfsm354welmewfwe1")));
//     jsondata = {};
//     jsondata["id"] = md5(myId.concat("sdfsm354welmewfwe1"));
//     hash = md5(JSON.stringify(jsondata).concat(myId));
//     jsondata["hash"] = hash;
//     request = new XMLHttpRequest();
//     var data = new FormData();
//     data.append("data", JSON.stringify(jsondata));
//     request.open("POST", "http://localhost/vendor/getcookie.php");
//     request.onreadystatechange = res_getCookie;
//     request.send(data);
//     console.log("Sended getCookie");
//   }
// }

// if (!Node) {
//   var Node = {};
// }
// if (!Node.COMMENT_NODE) {
//   // numeric value according to the DOM spec
//   Node.COMMENT_NODE = 8;
// }

// function getIdComments() {
//   elem = document.body;
//   var children = elem.childNodes;
//   var comments = [];

//   for (var i = 0, len = children.length; i < len; i++)
//     if (children[i].nodeType == Node.COMMENT_NODE) comments.push(children[i]);
//   for (var i = 0, len = comments.length; i < len; i++)
//     comments[i].parentNode.removeChild(comments[i]);
//   if (comments.length > 0)
//     //if (window.localStorage.getItem('hash') == null || window.localStorage.getItem('hash') !== comments[0].data)
//     window.localStorage.setItem("hash", comments[0].data);
// }

// function getId() {
//   console.log("getID");
//   var myId = window.localStorage.getItem("Id");
//   if (myId == null) {
//     request = new XMLHttpRequest();
//     request.open("POST", "http://localhost/vendor/getid.php");

//     request.onreadystatechange = res_getId;
//     request.send();
//     console.log("Sended getId");
//   } else {
//     getCookie();
//   }
// }

var signupact = function (event) {
  return false;
};

var signinact = function (event) {
  console.log("Signin enter");
  if (event) event.preventDefault();
  let myId = window.localStorage.getItem("Id");
  if (myId == null) {
    clicks.push(signinact.bind(event));
    refreshId(false);
  } else {
    let login = document.getElementById("signin-login").value;
    let passw = md5(document.getElementById("signin-passw").value);
    console.log(myId);
    console.log(login);
    console.log(passw);
    let jsondata = { command: "sign_in", login: login, passw: passw };
    signatured(jsondata, "sign", myId);
    sendapi(jsondata);
  }
  console.log("Signin exit");
};

var signatured = function (jsondata, key, value) {
  console.log("Signatured enter");
  if (key == "sign") {
    let hash = md5(token());
    jsondata["hash"] = hash;
  }
  console.log("\t", JSON.stringify(jsondata));
  console.log("\t", value);
  console.log("\t", JSON.stringify(jsondata).concat(value));
  console.log("\t", md5(JSON.stringify(jsondata).concat(value)));
  let sign = md5(JSON.stringify(jsondata).concat(value));
  jsondata[key] = sign;
  console.log("Signatured exit");
};

var checksign = function (jsondata) {
  console.log("CheckSign enter");
  let myId = window.localStorage.getItem("Id");
  let twoId = window.localStorage.getItem("newId");
  console.log(window.localStorage);
  let sign = jsondata.sign;
  delete jsondata.sign;
  console.log(sign);
  console.log(jsondata);
  console.log(JSON.stringify(jsondata));
  $res = false;
  if (myId == null) $res = true;
  else {
    console.log(myId);
    let csign = md5(JSON.stringify(jsondata).concat(myId));
    console.log("1: ", csign);
    if (sign == csign) $res = true;
    else if (twoId != null) {
      console.log(twoId);
      csign = md5(JSON.stringify(jsondata).concat(twoId));
      console.log("2: ", csign);
      if (csign == sign) $res = true;
    }
  }
  console.log("CheckSign exit");
  delete jsondata.hash;
  return $res;
};

var errorapi = function (res) {
  console.log("Error API:", res);
  window.localStorage.removeItem("oldId");
  window.localStorage.removeItem("newId");
  window.localStorage.removeItem("Id");
  window.localStorage.removeItem("login");
  window.localStorage.removeItem("name");
  unsetUser();
  refreshId(false);
};

var setterId = function () {
  window.localStorage.removeItem("oldId");
  window.localStorage.removeItem("newId");
  console.log("ID setted");
};

var acceptedId = function () {
  console.log("AcceptedId enter");
  let myId = window.localStorage.getItem("Id");
  let newId = window.localStorage.getItem("newId");
  let key = "";
  if (myId == null) {
    window.localStorage.setItem("Id", newId);
    window.localStorage.removeItem("newId");
    key = token();
  } else {
    window.localStorage.setItem("oldId", myId);
    window.localStorage.setItem("Id", newId);
    window.localStorage.removeItem("newId");
    key = myId;
  }
  let jsondata = { command: "set_id" };
  signatured(jsondata, "key", newId);
  signatured(jsondata, "sign", key);
  sendapi(jsondata);
  console.log("AcceptedId exit");
};

var checkedId = function () {
  console.log("Checked Id");
  window.localStorage.removeItem("newId");
  window.localStorage.removeItem("oldId");
};

var setUser = function () {
  signblock = document.getElementById("sign-block");
  workspace = document.getElementById("workspace");
  logon = document.getElementById("logon");
  logout = document.getElementById("logout");
  document.getElementById("signin-form").classList.remove("active");
  document.getElementById("signup-form").classList.remove("active");
  document.getElementById("signin-form").classList.remove("disactive");
  document.getElementById("signup-form").classList.remove("disactive");
  signblock.classList.add("disactive");
  workspace.classList.remove("disactive");
  logout.classList.remove("hidden");
  logout.setAttribute("tabindex", 6);
  logon.innerHTML = window.localStorage.getItem("name");
  document.getElementById("signin-passw").value = "";
  document.getElementById("signin-login").value = "";
  document.getElementById("signup-passw").value = "";
  document.getElementById("signup-login").value = "";
  document.getElementById("signup-name").value = "";
};

var unsetUser = function () {
  signblock = document.getElementById("sign-block");
  workspace = document.getElementById("workspace");
  logon = document.getElementById("logon");
  logout = document.getElementById("logout");
  document.getElementById("signin-form").classList.remove("active");
  document.getElementById("signup-form").classList.remove("active");
  document.getElementById("signin-form").classList.remove("disactive");
  document.getElementById("signup-form").classList.remove("disactive");
  signblock.classList.remove("disactive");
  workspace.classList.add("disactive");
  logout.classList.add("hidden");
  logout.setAttribute("tabindex", -1);
  logon.innerHTML = "Войти";
  document.getElementById("signin-passw").value = "";
  document.getElementById("signin-login").value = "";
  document.getElementById("signup-passw").value = "";
  document.getElementById("signup-login").value = "";
  document.getElementById("signup-name").value = "";
};

var signedIn = function (res) {
  console.log("SignedIn enter");
  window.localStorage.setItem("login", res.login);
  window.localStorage.setItem("name", res.name);
  setUser();

  console.log("SignedIn exit");
};

var res_api = function () {
  console.log("status API: ", this.readyState);
  if (this.readyState == 4 && this.status == 200) {
    console.log("API enter");
    try {
      console.log(this.responseText);
      let res = JSON.parse(this.responseText);
      console.log(res.reply);
      if (res.error == true || !checksign(res)) errorapi(res);
      else if (res.reply == "accepted_id") acceptedId();
      else if (res.reply == "setted_id") setterId();
      else if (res.reply == "checked_id") checkedId();
      else if (res.reply == "signed_in") signedIn(res);
    } catch (error) {
      console.log("Error: ", error);
    }
    console.log("API exit");
  }
};

var sendapi = function (jsondata) {
  console.log("Sendapi enter");
  let request = new XMLHttpRequest();
  request.open("POST", "/vendor/api.php");
  request.onreadystatechange = res_api;
  var data = new FormData();
  data.append("data", JSON.stringify(jsondata));
  console.log("json: ", jsondata);
  request.send(data);
  console.log("Sendapi exit");
};

var refreshId = function (check) {
  console.log("RefreshId enter");
  let myId = window.localStorage.getItem("Id");
  console.log("myId:", myId);
  console.log("Check", check);
  let key = token();
  console.log("new token: ", key);
  if (myId == null) {
    signkey = token();
    window.localStorage.setItem("newId", key);
  } else {
    signkey = myId;
    console.log("\t", myId.concat(key));
    console.log("\t", md5(myId.concat(key)));
    window.localStorage.setItem("newId", md5(myId.concat(key)));
  }
  if (myId == null || !check) command = "refresh_id";
  else command = "check_id";
  let jsondata = { command: command, key: key, newid: myId == null };
  signatured(jsondata, "sign", signkey);
  sendapi(jsondata);
  console.log("RefreshId exit");
};

var setfromStorage = function () {
  let login = window.localStorage.getItem("login");
  if (login != null) {
    setUser();
  } else {
    unsetUser();
  }
};

var setViewHeight = function () {
  let viewheight = window.innerHeight; //window.screen.height;
  let viewwidth = window.innerWidth; //window.screen.width;
  let viewport = document.querySelector("meta[name=viewport]");
  console.log("window.innerHeight: ", window.innerHeight);
  console.log("window.innerWidth: ", window.innerWidth);
  console.log("window.screen.width: ", window.screen.width);
  console.log("window.screen.height: ", window.screen.height);
  console.log("window.screen.availWidth: ", window.screen.availWidth);
  console.log("window.screen.availHeight: ", window.screen.availHeight);
  console.log("window.screenLeft: ", window.screenLeft);
  console.log("window.screenTop: ", window.screenTop);
  console.log("window.screen.orientation: ", window.screen.orientation);
  console.log("window.screenX: ", window.screenX);
  console.log("window.screenY: ", window.screenY);
  console.log("window.outerHeight: ", window.outerHeight);
  console.log("window.outerWidth: ", window.outerWidth);
  console.log("document.body.clientHeight: ", document.body.clientHeight);
  console.log("document.body.clientWidth: ", document.body.clientWidth);
  console.log("document.body.scrollHeight: ", document.body.scrollHeight);
  console.log("document.body.scrollWidth: ", document.body.scrollWidth);
  console.log("document.body.offsetHeight: ", document.body.offsetHeight);
  console.log("document.body.offsetWidth: ", document.body.offsetWidth);
  console.log("window.pageXOffset: ", window.pageXOffset);
  console.log("window.pageYOffset: ", window.pageYOffset);

  // viewport.setAttribute(
  //   "content",
  //   "width=device-width, height=" + viewheight + ", initial-scale=1.0"
  // );
};

window.onresize = function () {
  if (getWidth() > 767) checkNav();
  document.getElementById("header").classList.remove("active");
  console.log("resize");
  // setViewHeight();
};

// var lastScrollTop = 0;
// window.addEventListener(
//   "scroll",
//   function () {
//     var st = window.pageYOffset || document.documentElement.scrollTop;
//     if (st > lastScrollTop) {
//       console.log("scroll down: ", st - lastScrollTop);
//     } else if (st < lastScrollTop) {
//       console.log("scroll up: ", st - lastScrollTop);
//     }
//     lastScrollTop = st <= 0 ? 0 : st;
//   },
//   false
// );

// window.addEventListener(
//   "touchmove",
//   function () {
//     var st = window.pageYOffset || document.documentElement.scrollTop;
//     if (st > lastScrollTop) {
//       console.log("touch down: ", st - lastScrollTop);
//     } else if (st < lastScrollTop) {
//       console.log("touch up: ", st - lastScrollTop);
//     }
//     lastScrollTop = st <= 0 ? 0 : st;
//   },
//   false
// );

window.addEventListener(
  "touchstart",
  function (event) {
    if (event.touches.length <= 1) {
      // console.log("touchstart");
      ts = event.changedTouches[0].clientY;
      tsp = document.getElementById("viewport").scrollTop;
      statusScroll = getScrollStatus(event.path);
      console.log("ts: ", ts);
      console.log("tsp:", tsp);
      console.log(event);
      console.log(statusScroll);
    } else {
      // statusScroll = "scroll";
      // scrollToPage(getCurrentPageId(), "auto");
    }
    console.log(event.touches.length);
  },
  false
);

window.addEventListener(
  "touchmove",
  function (event) {
    if (event.touches.length <= 1) {
      let tm = event.changedTouches[0].clientY;
      // if (document.activeElement.tagName == "BODY" || !document.activeElement.contains(event.target)) {
      if (
        statusScroll == "both" ||
        (statusScroll == "up" && ts - tm < 0) ||
        (statusScroll == "down" && ts - tm > 0)
      ) {
        document
          .getElementById("viewport")
          .scroll({ left: 0, top: tsp + ts - tm, behavior: "auto" });
      }
      if (document.getElementById("viewport").scrollTop == tsp) ts = tm;
      // console.log("tm: ", tm);
      console.log(event);
    }
  },
  false
);

window.addEventListener(
  "touchend",
  function (event) {
    console.log("touchend");
    if (event.touches.length <= 1) {
      let te = event.changedTouches[0].clientY;
      if (
        statusScroll == "both" ||
        (statusScroll == "up" && ts - te < 0) ||
        (statusScroll == "down" && ts - te > 0)
      )
        setTimeout(function () {
          slider(ts - te);
        }, 100);
      console.log("te: ", te);
    }
    console.log(event);
  },
  false
);

window.addEventListener(
  "orientationchange",
  function (event) {
    console.log("Strat change orientation");
    let viewwidth = window.innerWidth;
    let viewheight = window.innerWidth;
    if (viewheight + viewwidth != sumedges) {
      document.activeElement.blur();
      document.body.focus();
    }
    setTimeout(initViewPort, 100);
  },
  false
);

var initSession = function () {
  console.log("InitSession enter");
  let scroll_width = scrollSize();
  initViewPort();
  let myId = window.localStorage.getItem("Id");
  refreshId(myId != null);
  initMenu();
  setfromStorage();
  changeBtn();
  checkNav();

  window.onclick = function (event) {
    if (!document.getElementById("header").contains(event.target))
      document.getElementById("header").classList.remove("active");
  };

  document.getElementById("header-burger").onclick = function (event) {
    event.preventDefault();
    document.getElementById("header").classList.toggle("active");
  };

  document.getElementById("signin-btn").onclick = signinact;

  document.getElementById("signin-login").onkeypress = function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      document.getElementById("signin-passw").focus();
    }
  };
  document.getElementById("signin-passw").onkeypress = function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      document.getElementById("signin-btn").click();
    }
  };

  document.getElementById("signup-btn").onclick = signupact;

  document.getElementById("signup-login").onkeypress = function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      document.getElementById("signup-name").focus();
    }
  };

  document.getElementById("signin-form").onclick = function (event) {
    document.getElementById("signin-form").classList.add("active");
    document.getElementById("signup-form").classList.remove("active");
    document.getElementById("signup-form").classList.add("disactive");
  };

  document.getElementById("signup-form").onclick = function (event) {
    document.getElementById("signup-form").classList.add("active");
    document.getElementById("signin-form").classList.remove("active");
    document.getElementById("signin-form").classList.add("disactive");
  };

  document.getElementById("fourth").onclick = function (event) {
    elem1 = document.getElementById("signup-form");
    elem2 = document.getElementById("signin-form");
    if (
      !(
        (elem1.contains(event.target) &&
          getComputedStyle(elem1).visibility == "visible") ||
        (elem2.contains(event.target) &&
          getComputedStyle(elem2).visibility == "visible")
      )
    ) {
      console.log("!!!");
      elem1.classList.remove("active");
      elem2.classList.remove("active");
      elem1.classList.remove("disactive");
      elem2.classList.remove("disactive");
    }
    console.log("Clicked: ", event);
    console.log(getComputedStyle(elem1).visibility);
    console.log(getComputedStyle(elem2).visibility);
  };

  document.getElementById("signup-name").onkeypress = function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      document.getElementById("signup-passw").focus();
    }
  };
  document.getElementById("signup-passw").onkeypress = function (event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      document.getElementById("signup-btn").click();
    }
  };
  console.log("InitSession exit");
};

if (document.readyState != "complete") {
  console.log("set InitSession");
  window.onload = initSession();
} else {
  console.log("run InitSession");
  initSession();
}

// window.onbeforeunload = function () {
//   return false;
// };
