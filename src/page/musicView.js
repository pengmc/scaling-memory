import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/api";
import { NavBar } from "antd-mobile";
import { observer } from "mobx-react-lite";
import { store } from "../store";

function MusicView() {
  const param = useParams();

  const navigate = useNavigate();

  const [lrclist, setlrclist] = useState([]);

  let [time, settime] = useState(0);

  const [isshow, setShow] = useState(false);

  const [Id, setId] = useState(param.id);

  useEffect(() => {
    clearInterval(store.time);
    let el = document.querySelector("#musicview");
    let audio = document.querySelector("#audio");

    el.scrollTo(0, 0);
    audio.currentTime = 0;
    settime(0);
    setShow(false);

    store.time = setInterval(() => {
      settime(parseInt(audio.currentTime * 1000));
      el.scrollTo(0, getscoll() - 20 - el.offsetHeight / 2);
    }, 1000);
  }, [Id]);

  const back = () => {
    navigate(-1);
    clearInterval(store.time);
  };

  //时间转换
  const timeformat = (item) => {
    if (item === "") {
      return "000000";
    }
    let m = item.slice(1, 3);
    let s = item.slice(4, 6);
    let h = item.slice(7, 10);

    return parseInt(m * 60 * 1000) + parseInt(s * 1000) + parseInt(h);
  };

  const pretime = (item, index) => {
    let pretime = lrclist[index + 1];
    if (!pretime) return "000000";
    let m = pretime.slice(1, 3);
    let s = pretime.slice(4, 6);
    let h = pretime.slice(7, 10);
    return parseInt(m * 60 * 1000) + parseInt(s * 1000) + parseInt(h);
  };

  const getscoll = () => {
    let active = document.querySelector(".active");
    if (!active) {
      return 220;
    }
    return active.offsetTop - active.offsetHeight;
  };

  useEffect(() => {
    axios.get("/lyric?id=" + Id).then((res) => {
      setlrclist(res.lrc.lyric.split("\n"));
    });

    axios.get("/song/url?id=" + Id).then((res) => {
      store.playUrl(res.data[0].url);
    });
  }, [Id]);

  const getTime = (time) => {
    let m =
      parseInt(time / 1000 / 60) < 10
        ? "0" + parseInt(time / 1000 / 60)
        : parseInt(time / 1000 / 60);

    let s =
      parseInt((time / 1000) % 60) < 10
        ? "0" + parseInt((time / 1000) % 60)
        : parseInt((time / 1000) % 60);

    return m + ":" + s;
  };

  const palyer = (falg) => {
    let audio = document.querySelector("#audio");
    if (!falg) {
      audio.play();
    } else {
      audio.pause();
    }

    setShow(falg);
  };

  const toPlay = (index) => {
    let count = store.count + index;
    if (count < 0) {
      count = store.lzylist.length - 1;
    } else if (count > store.lzylist.length - 1) {
      count = 0;
    }
    store.setCount(count);
    let item = store.lzylist[store.count];
    store.setsong(item.name + " — " + item.ar[0].name);
    setId(item.id);
  };

  return (
    <div>
      <NavBar onBack={back}>
        <marquee direction="left" style={{ width: "100%" }}>
          <div>{store.song || "空"}</div>
        </marquee>
      </NavBar>

      <ul
        className="text_c scroll C6 fs15"
        id="musicview"
        style={{ height: "40vh", paddingTop: "50%" }}
      >
        {lrclist.map((item, index) => {
          return (
            <li
              key={index}
              className={
                time >= timeformat(item) && time <= pretime(item, index)
                  ? "active mt16"
                  : "mt16"
              }
            >
              {item.split("]")[1] || "~ ~ ~"}
            </li>
          );
        })}
      </ul>

      <p className="text_c" style={{ color: "#666", fontSize: "16px" }}>
        {getTime(time)}
      </p>

      <div className="flex justify mt20" style={{ padding: "0 50px" }}>
        <img
          src={require("../assets/pre.png")}
          alt=""
          style={{ width: "30px", height: "30px" }}
          onClick={() => toPlay(-1)}
        />
        <div>
          {isshow ? (
            <img
              src={require("../assets/play.png")}
              alt=""
              style={{ width: "30px", height: "30px" }}
              onClick={() => palyer(false)}
            />
          ) : (
            <img
              src={require("../assets/pause.png")}
              alt=""
              style={{ width: "30px", height: "30px" }}
              onClick={() => palyer(true)}
            />
          )}
        </div>

        <img
          src={require("../assets/next.png")}
          alt=""
          style={{ width: "30px", height: "30px" }}
          onClick={() => toPlay(1)}
        />
      </div>

      <audio src={store.url} autoPlay id="audio"></audio>
    </div>
  );
}

export default observer(MusicView);
