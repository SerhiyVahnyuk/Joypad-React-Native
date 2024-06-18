import { StatusBar } from 'expo-status-bar';
import { LogBox, StyleSheet, Text, View, Image, ImageBackground, TextInput, Button, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState, useEffect  } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { io } from "socket.io-client";
import BigNumber from "bignumber.js";


// '.././api-db/api/BRHendrix-SemiBold.otf'

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



function HomeScreen({ navigation }) {

  const [code, setCode] = useState('')

  getData("token").then((token)=>{
    if(token){
      if(token != null){
        navigation.navigate("Profile")
      }else{
        removeValue("token")
      }
    }
  })

  const handleCode = () => {
    if (code) {
      console.log("THIS IS CODE 1", code);
      fetch(`https://joypadapi.onrender.com/user/auth/code?code=${code}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "type":"app"
        },
        // query: JSON.stringify({
        //   code: code
        // })
      }).then((result) => {
        console.log("THIS IS CODE 2", code);
        return result.json();
      }).then((data) => {
        console.log("THIS IS DATA", data);
        console.log("THIS IS DATA INFO TOKEN", data.info.token)
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
            <TextInput style={[styles.input_log, { width: 200, height: 77}]} placeholderTextColor="#9274C1" placeholder="Enter Code" onChangeText={setCode} />
            <TouchableOpacity onPress={()=>{handleCode()}}> 
              <Image source={{ uri: 'https://joypadapi.onrender.com/image/login_mobile.png' }} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.login_message, { width: 244 }]}>*This code you can get in your profile page on our site</Text>
        </View> 
      </View>
    </ImageBackground>
  );
}

function ProfileScreen({ navigation }){

  const [userData, setUserData] = useState()
  const [userInfo, setUserInfo] = useState()
  const [info, setInfo] = useState()

  function updateinfo(inffo){
    if(inffo){
        const steam32id = BigNumber(`${inffo.steamID}`).minus('76561197960265728').c[0]
        fetch(`https://api.opendota.com/api/players/${steam32id}`,{
            method:"GET"
        }).then((resp)=>{
            return resp.json()
        }).then((respp)=>{
            fetch(`https://api.opendota.com/api/players/${steam32id}/wl/?significant=0&game_mode=23`,{
                method:"GET"
            }).then((resp2)=>{
                return resp2.json()
            }).then((resp22)=>{
                fetch(`https://api.opendota.com/api/players/${steam32id}/wl/`,{
                    method:"GET"
                }).then((resp3)=>{
                    return resp3.json()
                }).then((resp33)=>{
                    if(!respp["error"]){
                        const user = inffo
                        user["winrate"] = {"win": resp22['win'] + resp33['win'],"lose":resp22['lose'] + resp33['lose']}
                        user["rank"] = respp["rank_tier"]
                        setUserInfo(user)
                    } else {
                        const user = inffo
                        user["winrate"] = {"win": 0 ,"lose":0}
                        user["rank"] = null
                        console.log(user)
                        setUserInfo(user)
                    }
                })
            })
        })
    }
}

  getData("token").then((token)=>{
    if(token){
      if(token != null){
        if (!info){
          fetch('https://joypadapi.onrender.com/user/auth', {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              token: token
          },
          }).then((result) => {
            return result.json()
          }).then((resul) => {
            if (resul.code != 200){
              navigation.navigate("Auth")
            }
            setInfo(resul.info)
            updateinfo(resul.info)
          })
        }
      }else{
        removeValue("token")
        navigation.navigate("Auth")
      }
    }else{
      removeValue("token")
      navigation.navigate("Auth")
    }
  })


  return (
    <ImageBackground source={{ uri: 'https://joypadapi.onrender.com/image/bg.png' }} resizeMode="cover" style={styles.page_bg}>
      <View>
          {userInfo && 
              <View>
                <Text>About Me</Text>
                  <View>
                      <Image source={{uri : userInfo.avatar}} style={{width:100,height:100}}/>
                      <View >
                          <Image source={{ uri :`https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${`${userInfo.rank}` == 'null' ? 0: `${userInfo.rank}`[0]}.png`}} style={{width:100,height:100}}/>
                          {info.rank != null && info.rank[1] != 0 &&
                              <Image source={{ uri : `https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_${userInfo.rank[1]}.png`}}/>
                          }
                      </View>
                  </View>
                  <Text>{info.name}</Text>
                  <Text>{info.description || ""}</Text>
                  <View >
                      <View>
                          <Text>victory</Text>
                          <Text>{info.winrate.win}</Text>
                      </View>
                      <View>
                          <Text>defeats</Text>
                          <Text>{info.winrate.lose}</Text>
                      </View>
                      <View>
                          <Text>win share</Text>
                          <Text>{Math.round(100/(info.winrate.win+info.winrate.lose == 0 ? 1:info.winrate.win+info.winrate.lose)*info.winrate.win)}%</Text>
                      </View>
                  </View>
              </View>
            }     
        </View>
    </ImageBackground>
  )
}


export default function App() {
  const [loaded] = useFonts({
    br_hendrix: require('./assets/BRHendrix-SemiBold.otf'),
  });
  if (!loaded) {
    return <Text>Loading...</Text>;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Auth'>
        <Stack.Screen options={{ headerShown: false }} name='Auth' component={HomeScreen} />
        <Stack.Screen options={{ headerShown: false }} name='Profile' component={ProfileScreen} />
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
    height: "100px"
  }
});
