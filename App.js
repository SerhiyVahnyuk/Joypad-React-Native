import { StatusBar } from 'expo-status-bar';
import { LogBox, StyleSheet, Text, View, Image, ImageBackground, TextInput, Button, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { io } from "socket.io-client";
import BigNumber from "bignumber.js";
import { withSafeAreaInsets } from 'react-native-safe-area-context';

const socket = io("https://joypadapi.onrender.com/");
const Stack = createNativeStackNavigator();

const storeData = async (key, value) => {
  try {
    console.log(value)
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
};

const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.error(e);
  }
};

const removeValue = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(e);
  }
};


function Toggle(grp){
  
}


function HomeScreen({ navigation }) {

  const [code, setCode] = useState('')

  getData("token").then((token) => {
    if (token) {
      if (token != null) {
        navigation.navigate("Profile")
      } else {
        removeValue("token")
      }
    }
  })

  const handleCode = () => {
    if (code) {
      fetch(`https://joypadapi.onrender.com/user/auth/code?code=${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "type": "app"
        },
      }).then((result) => {
        return result.json();
      }).then((data) => {
        if (data.code == 200) {
          storeData("token", data.info.token).then(() => {
            navigation.navigate("Profile");
          });
        } else {
          console.log("Error with status:", data.status);
        }
      }).catch((error) => {
        console.error('Error:', error);
      });
    } else {
      console.log("Code is incorrect")
    }
  }

  return (
    <ImageBackground source={{ uri: 'https://joypadapi.onrender.com/image/bg.png' }} resizeMode="cover" style={styles.page_bg}>
      <View style={styles.page}>
        <Image source={{ uri: 'https://joypadapi.onrender.com/image/logo.png' }} style={{ width: 175, height: 175, marginTop: "50%" }} />
        <Text style={styles.helloText}>
          HELLO
        </Text>
        <View style={{ marginTop: 35, }}>
          <View style={{ width: 274, height: 77, alignItems: 'center', borderColor: '#60D44D', borderWidth: 3, borderRadius: 5, flexDirection: 'row' }}>
            <TextInput style={[styles.input_log, { width: 200, height: 77 }]} placeholderTextColor="#9274C1" placeholder="Enter Code" onChangeText={setCode} />
            <TouchableOpacity onPress={() => { handleCode() }}>
              <Image source={{ uri: 'https://joypadapi.onrender.com/image/login_mobile.png' }} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.login_message, { width: 244 }]}>*This code you can get in your profile page on our site</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

function ProfileScreen({ navigation }) {

  const [userData, setUserData] = useState()
  const [userInfo, setUserInfo] = useState()
  const [info, setInfo] = useState()

  function updateinfo(inffo) {
    if (inffo) {
      const steam32id = BigNumber(`${inffo.steamID}`).minus('76561197960265728').c[0]
      fetch(`https://api.opendota.com/api/players/${steam32id}`, {
        method: "GET"
      }).then((resp) => {
        return resp.json()
      }).then((respp) => {
        fetch(`https://api.opendota.com/api/players/${steam32id}/wl/?significant=0&game_mode=23`, {
          method: "GET"
        }).then((resp2) => {
          return resp2.json()
        }).then((resp22) => {
          fetch(`https://api.opendota.com/api/players/${steam32id}/wl/`, {
            method: "GET"
          }).then((resp3) => {
            return resp3.json()
          }).then((resp33) => {
            if (!respp["error"]) {
              const user = inffo
              user["winrate"] = { "win": resp22['win'] + resp33['win'], "lose": resp22['lose'] + resp33['lose'] }
              user["rank"] = respp["rank_tier"]
              setUserInfo(user)
            } else {
              const user = inffo
              user["winrate"] = { "win": 0, "lose": 0 }
              user["rank"] = null
              setUserInfo(user)
            }
          })
        })
      })
    }
  }

  getData("token").then((token) => {
    if (token) {
      if (token != null) {
        if (!info) {
          fetch('https://joypadapi.onrender.com/user/auth', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: token
            },
          }).then((result) => {
            return result.json()
          }).then((resul) => {
            if (resul.code != 200) {
              navigation.navigate("Auth")
            }
            setInfo(resul.info)
            updateinfo(resul.info)
          })
        }
      } else {
        removeValue("token")
        navigation.navigate("Auth")
      }
    } else {
      removeValue("token")
      navigation.navigate("Auth")
    }
  })


  return (
    <ImageBackground source={{ uri: 'https://joypadapi.onrender.com/image/bg.png' }} resizeMode="cover" style={styles.page_bg}>
      <View>
        {userInfo &&
          <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40, }}>
            <View style={[styles.header_profile, { flexDirection: "row", justifyContent: "space-between" }]}>
              <TouchableOpacity onClick={() => { navigation.navigate("Profile") }}>
                <Image source={{ uri: 'https://joypadapi.onrender.com/image/logo.png' }} style={{ width: 47, height: 47, }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { navigation.navigate("Groups") }}>
                <Image source={{ uri: 'https://joypadapi.onrender.com/image/strelka_left.png' }} style={{ width: 36, height: 36, }} />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 11, }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                <Image source={{ uri: userInfo.avatar }} style={{ width: 100, height: 100, borderRadius: 50, borderColor: "#9747FF", borderWidth: 3 }} />
                <View>
                  <Image source={{ uri: `https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${`${userInfo.rank}` == 'null' ? 0 : `${userInfo.rank}`[0]}.png` }} style={{ width: 100, height: 100 }} />
                  {info.rank != null && info.rank[1] != 0 &&
                    <Image source={{ uri: `https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_${userInfo.rank[1]}.png` }} />}
                </View>
              </View>
              <Text style={{ color: "#B198DD", fontFamily: "br_hendrix_r", fontSize: 20 }}>{info.name}</Text>
              <Text>{info.description || ""}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View>
                  <Text style={{ color: "#CACACA", fontFamily: "br_hendrix_r", fontSize: 20 }}>victory</Text>
                  <Text style={{ color: "#66BB6A", fontFamily: "br_hendrix_r", fontSize: 31 }}>{info.winrate.win}</Text>
                </View>
                <View>
                  <Text style={{ color: "#CACACA", fontFamily: "br_hendrix_r", fontSize: 20 }}>defeats</Text>
                  <Text style={{ color: "#FF4C4C", fontFamily: "br_hendrix_r", fontSize: 31 }}>{info.winrate.lose}</Text>
                </View>
                <View>
                  <Text style={{ color: "#CACACA", fontFamily: "br_hendrix_r", fontSize: 20 }}>win share</Text>
                  <Text style={{ color: "#FFFFFF", fontFamily: "br_hendrix_r", fontSize: 31 }}>{Math.round(100 / (info.winrate.win + info.winrate.lose == 0 ? 1 : info.winrate.win + info.winrate.lose) * info.winrate.win)}%</Text>
                </View>
              </View>
            </View>
            <View>
              <Text style={{ color: "#FFFFFF", fontSize: 20 }}>About me</Text>
            </View>
          </View>
        }
      </View>
    </ImageBackground>
  )
}

function UserAchievementsScreen({ navigation }) {
  const [data, setData] = useState()
  const [stats, setStats] = useState()
  const [filter, setFilter] = useState([])

  getData("token").then((token) => {
    if (token) {
      if (token != null) {
        console.log("Token", token)
        if (!data) {
          console.log("FETCH 1")
          fetch(`https://joypadapi.onrender.com/achievements/user/`, {
            method: "GET",
            headers: {
              token: token
            }
          }).then((response) => {
            console.log("FETCH 2")
            return response.json()
          }).then((resp) => {
            console.log("FETCH 3")
            console.log(resp)
            setData(resp.achievement)
            console.log("THIS IS DATA", data)
          })
          if (!stats) {
            fetch("https://joypadapi.onrender.com/user/stats", {
              method: "GET",
              headers: {
                token: token
              }
            }).then((respons) => {
              console.log("FETCH 2")
              return respons.json()
            }).then((rep) => {
              console.log("FETCH 3")
              console.log(rep)
              setStats(rep.message)
              console.log("THIS IS STATS", stats)
            })
          }
          // if (!filter){

          // }
        }
      } else {
        removeValue("token")
        navigation.navigate("Auth")
      }
    }
  })

  function handleCheckboxChange(category) {
    if (filter.includes(category)) {
      setFilter(filter.filter((c) => c !== category))
    } else {
      setFilter([...filter, category])
    }
  }


  return (
    <ImageBackground source={{ uri: 'https://joypadapi.onrender.com/image/bg.png' }} resizeMode="cover" style={styles.page_bg}>
      <View style={{ justifyContent: "space-between", flexDirection: "column", alignItems: 'center', gap: 10, paddingLeft: 20, paddingRight: 20, paddingTop: 40, }}>
        <View style={[styles.header_profile, { flexDirection: "row", justifyContent: "space-between" }]}>
          <TouchableOpacity onClick={() => { navigation.navigate("Profile") }}>
            <Image source={{ uri: 'https://joypadapi.onrender.com/image/logo.png' }} style={{ width: 47, height: 47, }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { navigation.navigate("Groups") }}>
            <Image source={{ uri: 'https://joypadapi.onrender.com/image/strelka_left.png' }} style={{ width: 36, height: 36, }} />
          </TouchableOpacity>
        </View>
        <View className="div_filter" style={{ padding: 15, paddingBottom: 15, paddingTop: 15, backgroundColor: "rgba(27, 22, 42, 0.3)", backdropFilter: "blur(10px)", width: 256, borderRadius: 30, }}>
          <View style={{ gap: 20, }}>
            <Text className="text-white" style={{ color: "white", fontSize: 20, }}>Filter</Text>
            {/* <div className="form-check">
              <input className="form-check-input" type="checkbox" id="flexCheckDefault" />
              <label className="form-check-label text-white" htmlFor="flexCheckDefault">
                Completed
              </label>
            </div> */}
            <View style={{ gap: 20, }}>
              <View className="form-check" style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text className="form-check-label text-white" htmlFor="flexCheckDefault" style={{ color: "white" }}>
                  Send
                </Text>
                <TextInput onClick={() => handleCheckboxChange(1)} className="form-check-input" type="checkbox" id="flexCheckDefault" />
              </View>
              <View className="form-check" style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text className="form-check-label text-white" htmlFor="flexCheckDefault" style={{ color: "white" }}>
                  Delete
                </Text>
                <TextInput onClick={() => handleCheckboxChange(2)} className="form-check-input" type="checkbox" id="flexCheckDefault" />
              </View>
            </View>
          </View>
        </View>
        {data &&
          <View >
            {data.filter((res) => (filter.length === 0 ||
              filter.includes(res.category)
            )).map((res, idx) => {
              console.log("THIS IS RES", res)
              return (
                <View style={{ gap: 10 }}>
                  <ScrollView>
                  <View key={idx} style={{ width: 246, height: 238, backgroundColor: "rgba(27, 22, 42, 0.3)", backdropFilter: "blur(10px)", borderRadius: 30, justifyContent: "space-between", flexDirection: "column", alignItems: 'center', padding: 15, }}>
                    <Text style={{ color: "white", fontWeight: 800, fontSize: 20 }}> {res.name} </Text>
                    <View>
                      <Image loader={() => `https://joypadapi.onrender.com/image/message_icon_achievements.png`} src={"https://joypadapi.onrender.com/image/message_icon_achievements.png"} width={111} height={111} style={{ borderRadius: 50, }} />
                    </View>
                    {stats &&
                      <View style={{ justifyContent: "space-between", flexDirection: "column", alignItems: 'center', }}>
                        <progress className={Number(res.category == 1 ? stats.sentMessages : stats.deletedMessages) >= res.value ? "styles2.progress1" : "styles2.progress2"} max={res.value} value={res.category == 1 ? stats.sentMessages : stats.deletedMessages}></progress>
                        <Text style={{ color: "white", fontWeight: 400, fontSize: 20 }}>{res.category == 1 ? stats.sentMessages : stats.deletedMessages}/{res.value} </Text>
                      </View>
                    }
                  </View>
                  </ScrollView>
                </View>
              )
            })}
          </View>
        }
      </View>
    </ImageBackground>
  )

}

function ChatScreen({ navigation, route }) {
  const [message, setMessage] = useState()
  const [messages, setMessages] = useState([])
  const [group, setGroup] = useState()
  const [groups, setGroups] = useState()
  const [info, setInfo] = useState()
  const [mute,setMute] = useState()
  
  const groupId = route.params.groupId

   function updateMessages(grpId) {
    getData("token").then((token) => {
      if (token) {
        if (groupId && groupId != group) {
            fetch(`https://joypadapi.onrender.com/messages/group/${groupId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: token
            }
          }).then((ressp) => {
            return ressp.json()
          }).then(async (mesgs) => {
            const msgs = []
            fetch(`https://joypadapi.onrender.com/group/users/avatar/${groupId}`, {
              method: "GET"
            }).then((avas) => {
              return avas.json()
            }).then(async (avatars) => {
              for await (let i of mesgs.messages) {
                i["avatar"] = avatars.avatars[`${i.steamid}`]
                msgs.push(i)
              }
              setMessages(msgs)
            })
          })
        }
      }
    })  
  }
  
  useEffect(() => {
    getData("token").then((token) => {
      if (token) {
        console.log(token)
        if (token != null) {
          if (!info) {
            fetch('https://joypadapi.onrender.com/user/auth', {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                token: token
              },
            }).then((result) => {
              return result.json()
            }).then((resul) => {
              if (resul.code != 200) {
                navigation.navigate("Auth")
              }
              setInfo(resul.info)
            }).then(() => {
              if (!groups) {
                fetch('https://joypadapi.onrender.com/user/groups/', {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    token: token
                  }
                }).then((result) => {
                  return result.json()
                }).then((reslt) => {
                  if (reslt.groups != null) {
                    setGroups(reslt.groups)
                    setGroup(reslt.groups[0].id)
                    updateMessages(reslt.groups[0].id)
                  }
                })
              }
            })
          }
        } else {
          removeValue("token")
          navigation.navigate("Auth")
        }
      } else {
        removeValue("token")
        navigation.navigate("Auth")
      }
    })

    if (group) {            
      socket.on(`message:${group}`, async (args) => {
          const msgs = [...messages]
          if (!msgs.find(val => val.id == args.id)) {
              msgs.push(args)
              setMessages(msgs)
          }
      })
      socket.on(`deleteMessage:${group}`, async (args) => {
          const msgs = [...messages]
          msgs.splice(msgs.findIndex((elem)=>Number(elem.id)==Number(args.id)),1)
          setMessages(msgs)
      })
      socket.on(`mute:${group}:${info.steamID}`,async (args)=>{
          if(mute != args){
              setMute(args)                    
          }
      })
  }
  })

  

  function sendMessage() {
    getData("token").then((token) => {
      if (token) {
    if (`${Number(group)}` != "Nan") {
        if (message.split(/,| |\n/).filter((mess) => mess != '').length > 0) {
            if(message.length <= 3000){
                if(message.length > 0){
                    setMessage("")
                    socket.emit("send", {
                        message: message,
                        group: group,
                        token: token
                    })
                }
            }
        }
    }
  }
})
}

function deleteMessage(id){
  getData("token").then((token) => {
    if (token) {
      socket.emit("delete",{
          token:token,
          id:Number(id),
          groupId:group
      })
    }
  })
}



  return (
    <ImageBackground source={{ uri: 'https://joypadapi.onrender.com/image/bg.png' }} resizeMode="cover" style={styles.page_bg}>
      <View>
        {messages.length > 0 &&
          <View id="ll" onLoad={() => { const obj = document.querySelector("#ll"); obj.scrollTo(0, obj.scrollHeight) }}>
            {messages.map((mess, idx) => {
              let prevDate
              if (messages[idx - 1]) {
                prevDate = messages[idx - 1].createdAt.split('T')[0].split(":")
              }
              const avatarExist = !messages[idx - 1] || messages[idx - 1].steamid != messages[idx].steamid
              const timeSrc = mess.createdAt.split('T')[1].split(":")
              const time = timeSrc[0] + ":" + timeSrc[1]
              const dateSrc = mess.createdAt.split('T')[0]

              return (
                <View key={idx}>
                  {(!prevDate || prevDate != dateSrc) &&
                    <View>
                      <View style={{borderBottomColor: 'gray'}} />
                      <Text>{dateSrc}</Text>
                      <View style={{borderBottomColor: 'gray'}} />
                    </View>
                  }
                  <View key={idx}>

                    {avatarExist &&
                      <Image src={mess.avatar} width={20} height={20} />
                    }
                    {!avatarExist &&
                      <View>
                        {mess.steamid == info.steamID &&
                          <TouchableOpacity onPress={() => { deleteMessage(mess.id) }}>
                          <Image src='https://joypadapi.onrender.com/image/delete.png' width={20} height={20}/>
                          </TouchableOpacity>
                        }
                        <Text className={styles.messageTimeInvis}>{time}</Text>
                      </View>
                    }
                    <View className={styles.messageBlock}>
                      {(!messages[idx - 1] || messages[idx - 1].steamid != messages[idx].steamid) &&
                        <View className={styles.messageInfo}>
                          <Text className={styles.messageName}>{mess.name}</Text>
                          <Text className={styles.messageTime}>{time}</Text>
                          {mess.steamid == info.steamID &&
                            <Image className={styles.delImg} src='https://joypadapi.onrender.com/image/delete.png' onClick={() => { deleteMessage(mess.id) } } width={20} height={20} />
                          }
                        </View>
                      }
                      {mess.value.split("\n").map((ms, idx) => {
                        return (
                          <Text key={idx} className={styles.messageText}>{ms}</Text>
                        )
                      })}
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        }
        <View>
          <TextInput style={{backgroundColor: "white"}} onChange={(e) => { setMessage(e.target.value) }} value={message} minLength={1} maxLength={3000}></TextInput>
          {!(mute) &&
            <TouchableOpacity onPress={sendMessage}>
            <img src={"https://joypadapi.onrender.com/image/send1.png"} width={25} height={25} />
            </TouchableOpacity>
          }
        </View>
      </View>
    </ImageBackground>
  )
}

function GroupSelection({ navigation }) {

  const [message, setMessage] = useState()
  const [messages, setMessages] = useState([])
  const [group, setGroup] = useState()
  const [groups, setGroups] = useState()
  const [info, setInfo] = useState()

  getData("token").then((token) => {
    if (token) {
      if (token != null) {
        if (!info) {
          fetch('https://joypadapi.onrender.com/user/auth', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: token
            },
          }).then((result) => {
            return result.json()
          }).then((resul) => {
            if (resul.code != 200) {
              navigation.navigate("Auth")
            }
            setInfo(resul.info)
          }).then(() => {
            if (!groups) {
              console.log("Token", token)
              fetch('https://joypadapi.onrender.com/user/groups/', {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  token: token
                }
              }).then((result) => {
                return result.json()
              }).then((reslt) => {
                if (reslt.groups != null) {
                  setGroups(reslt.groups)
                  setGroup(reslt.groups[0].id)
                }
              })
            }
          })
        }
      } else {
        removeValue("token")
        navigation.navigate("Auth")
      }
    } else {
      removeValue("token")
      navigation.navigate("Auth")
    }
  })

  return (
    <View style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 40, backgroundColor: "#120742", height: "100%" }}>
      <View style={[styles.header_profile, { flexDirection: "row", justifyContent: "space-between" }]}>
        <TouchableOpacity onPress={() => { navigation.navigate("Profile") }}>
          <Image source={{ uri: 'https://joypadapi.onrender.com/image/logo.png' }} style={{ width: 47, height: 47, }} />
        </TouchableOpacity>
      </View>
      <View>
        {groups &&
          groups.map((grp, idx) => {
            return (
              <Button style={{backgroundColor: "#120742"}} key={idx} className={Number(grp.id) == Number(group) ? "styles.sideBarButtonsSelected" : "styles.sideBarButtons"} title={JSON.stringify(grp.name)} value={grp.id} onPress={() => { if (grp.id && Number(grp.id) != group) { setGroup(Number(grp.id)) } else { navigation.navigate('Chat', {groupId: grp.id}) } } }>
                <View>{grp.name}</View>
                <TouchableOpacity onPress={() => { if (grp.id && Number(grp.id) != group) { setGroup(Number(grp.id)) } else { navigation.navigate('GroupAchievements', {id: grp.id}) } } }>
                  <img src={"https://joypadapi.onrender.com/image/dots1.png"} width={25} height={25} />
                </TouchableOpacity>
              </Button>
            )
          })
        }
      </View>
    </View>
  )
}

function GroupAchievementsScreen({ navigation, route }){
  const [data, setData] = useState()
  const [stats, setStats] = useState()

  const id = route.params.id 

  getData("token").then((token) => {
    if (token) {
      if (token != null) {
        console.log("Token", token)
        if (!data) {
          console.log("FETCH 1")
          fetch(`https://joypadapi.onrender.com/achievements/group/all`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          }).then((response) => {
            console.log("FETCH 2")
            return response.json()
          }).then((resp) => {
            console.log("FETCH 3")
            console.log(resp)
            setData(resp.message)
            console.log("THIS IS DATA", data)
          })
          if (!stats) {
            fetch(`https://joypadapi.onrender.com/group/stats/${id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              }
            }).then((respons) => {
              console.log("FETCH 2")
              return respons.json()
            }).then((rep) => {
              console.log("FETCH 3")
              console.log(rep)
              setStats(rep.message)
              console.log("THIS IS STATS", stats)
            })
          }
        }
      } else {
        removeValue("token")
        navigation.navigate("Auth")
      }
    }
  })

  function handleCheckboxChange(category) {
    if (filter.includes(category)) {
      setFilter(filter.filter((c) => c !== category))
    } else {
      setFilter([...filter, category])
    }
  }

  return (
    <ImageBackground source={{ uri: 'https://joypadapi.onrender.com/image/bg.png' }} resizeMode="cover" style={styles.page_bg}>
      <View style={{ justifyContent: "space-between", flexDirection: "column", alignItems: 'center', gap: 10, paddingLeft: 20, paddingRight: 20, paddingTop: 40, }}>
        <View style={[styles.header_profile, { flexDirection: "row", justifyContent: "space-between" }]}>
          <TouchableOpacity onClick={() => { navigation.navigate("Profile") }}>
            <Image source={{ uri: 'https://joypadapi.onrender.com/image/logo.png' }} style={{ width: 47, height: 47, }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { navigation.navigate("Groups") }}>
            <Image source={{ uri: 'https://joypadapi.onrender.com/image/strelka_left.png' }} style={{ width: 36, height: 36, }} />
          </TouchableOpacity>
        </View>
        <View className="div_filter" style={{ padding: 15, paddingBottom: 15, paddingTop: 15, backgroundColor: "rgba(27, 22, 42, 0.3)", backdropFilter: "blur(10px)", width: 256, borderRadius: 30, }}>
          <View style={{ gap: 20, }}>
            <Text className="text-white" style={{ color: "white", fontSize: 20, }}>Filter</Text>
            <View style={{ gap: 20, }}>
              <View className="form-check" style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <label className="form-check-label text-white" htmlFor="flexCheckDefault" style={{ color: "white" }}>
                  Send
                </label>
                <input onClick={() => handleCheckboxChange(1)} className="form-check-input" type="checkbox" id="flexCheckDefault" />
              </View>
              <View className="form-check" style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <label className="form-check-label text-white" htmlFor="flexCheckDefault" style={{ color: "white" }}>
                  Delete
                </label>
                <input onClick={() => handleCheckboxChange(2)} className="form-check-input" type="checkbox" id="flexCheckDefault" />
              </View>
            </View>
          </View>
        </View>
        {data &&
          <View >
            {data.filter((res) => (filter.length === 0 ||
              filter.includes(res.category)
            )).map((res, idx) => {
              console.log("THIS IS RES", res)
              return (
                <View style={{ gap: 10 }}>
                  <ScrollView>
                  <View key={idx} style={{ width: 246, height: 238, backgroundColor: "rgba(27, 22, 42, 0.3)", backdropFilter: "blur(10px)", borderRadius: 30, justifyContent: "space-between", flexDirection: "column", alignItems: 'center', padding: 15, }}>
                    <Text style={{ color: "white", fontWeight: 800, fontSize: 20 }}> {res.name} </Text>
                    <View>
                      <Image loader={() => `https://joypadapi.onrender.com/image/message_icon_achievements.png`} src={"https://joypadapi.onrender.com/image/message_icon_achievements.png"} width={111} height={111} style={{ borderRadius: 50, }} />
                    </View>
                    {stats &&
                      <View style={{ justifyContent: "space-between", flexDirection: "column", alignItems: 'center', }}>
                        <progress className={Number(res.category == 1 ? stats.sentMessages : stats.deletedMessages) >= res.value ? "styles2.progress1" : "styles2.progress2"} max={res.value} value={res.category == 1 ? stats.sentMessages : stats.deletedMessages}></progress>
                        <Text style={{ color: "white", fontWeight: 400, fontSize: 20 }}>{res.category == 1 ? stats.sentMessages : stats.deletedMessages}/{res.value} </Text>
                      </View>
                    }
                  </View>
                  </ScrollView>
                </View>
              )
            })}
          </View>
        }
      </View>
    </ImageBackground>
  )

}


export default function App() {
  const [loaded] = useFonts({
    br_hendrix: require('./assets/BRHendrix-SemiBold.otf'),
    br_hendrix_r: require('./assets/BRHendrix_Regular.otf'),
  });
  if (!loaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Auth'>
        <Stack.Screen options={{ headerShown: false }} name='Auth' component={HomeScreen} />
        <Stack.Screen options={{ headerShown: false }} name='Profile' component={ProfileScreen} />
        <Stack.Screen options={{ headerShown: false }} name='UserAchievements' component={UserAchievementsScreen} />
        <Stack.Screen options={{ headerShown: false }} name='GroupAchievements' component={GroupAchievementsScreen} />
        <Stack.Screen options={{ headerShown: false }} name='Chat' component={ChatScreen} />
        <Stack.Screen options={{ headerShown: false }} name='Groups' component={GroupSelection} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  page_bg: {
    width: '100%',
    height: '100%',
  },
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  input_log: {
    color: "white",
    paddingHorizontal: 10,
  },
  helloText: {
    fontSize: "48",
    color: "white",
    fontFamily: "br_hendrix",
  },
  login_message: {
    color: "#878787",
    fontSize: 10,
    marginTop: 5,
    marginBottom: 5,
    width: "274px",
  },
  avatar: {
    width: "100px",
    height: "100px",
  },
  header_profile: {
    width: "100%",
    height: "87px",
    alignItems: "center",
  },
});
