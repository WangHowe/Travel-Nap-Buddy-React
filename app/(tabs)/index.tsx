import SearchBar from '@/components/SearchBar';
import { geodesic, getData, getDistanceString } from '@/constants/functions';
import * as Location from 'expo-location';
// import { GoogleMaps } from 'expo-maps';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { LatLng, MapPressEvent, Marker } from 'react-native-maps';

// onRegionChangeComplete={data=>console.log(data)}

export default function Index() {

  // ----- Handle location -----
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [initialRegionDone, setInitialRegionDone] = useState<Boolean>(false);
  
  async function getCurrentLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    // console.log(`getCurrentLocation() - Permission status - ${status}`)
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied')
    } else {
      let location_temp = await Location.getCurrentPositionAsync({});
      setLocation(location_temp);
      // console.log('getCurrentLocation() - Location loaded');
      if (!initialRegionDone){
        setInitialRegionDone(true)
        setInitialRegion({
        latitude: location_temp.coords.latitude,
        longitude: location_temp.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
        });
      }
    }
  }
  
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      // console.log('requestLocationPermission()',PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION));
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        console.log(`requestLocationPermission() - Location access permission - ${granted}`);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required to show your current location on the map.');
          // setLocation(defaultLocation); setLoading(false);
        } else {
          // getCurrentLocation();
        }
      } catch (err) {
        console.warn('requestLocationPermission() error: ',err);
        // setLocation(defaultLocation); setLoading(false);
      }
    } else {
      // IOS stuff
    }
  }
  useEffect(()=>{ requestLocationPermission() },[])
  
  // ----- Handle markers -----
  const [markerCoord, setMarkerCoord] = useState<LatLng | null>(null);
  const [isSetMarkerActive, setMarkerActive] = useState<Boolean>(false);
  const [markerDesc, setMarkerDesc] = useState<string>('...');

  const mvOnPress = (data : MapPressEvent)=>{
    if (!isSetMarkerActive) {
      
    } else if (proximityAlertActive) {
      Alert.alert('Journey ongoing!','Please end journey first')
    } else if (isSetMarkerActive){
      console.log('Marker added');
      setMarkerCoord(data.nativeEvent.coordinate);
      setMarkerActive(false);
      setMarkerDesc(getGeodesicString())
    }
  }

  const removeMarker = ()=>{
    if (proximityAlertActive) {
      Alert.alert('Journey ongoing!','Please end journey first')
    } else if (markerCoord){
      setMarkerCoord(null)
      console.log('Marker removed');
    } else {
      Alert.alert('Warning!','No marker to remove')
    }
  }

  const setMarkerButton = (active : Boolean)=>{
    if (active){
      return <TouchableOpacity className='bg-accent p-3 rounded-full w-[30%] items-center justify-center' onPress={()=>{setMarkerActive(!isSetMarkerActive)}}>
          <Text className='text-dark'>Place</Text>
      </TouchableOpacity>
    } else {
      return <TouchableOpacity
        className='bg-primary p-3 rounded-full w-[30%] items-center justify-center' 
        onPress={()=>{setMarkerActive(!isSetMarkerActive)}}>
          <Text className='text-white'>Set</Text>
      </TouchableOpacity>
    }
  }

  // Handle distance
  const [distanceThreshold, setDistanceThreshold] = useState(0);

  useEffect(()=>{
    getData('distanceThreshold',setDistanceThreshold)
  },[])

  const handleJourney = ()=>{
    if (!markerCoord){ // If havent set destination
      console.log('Journey cannot start, no marker coords');
      Alert.alert('Cannot start!', "Please set a destination")
    } else if (proximityAlertActive) { // If press on 'End' button
      setProximityAlertActive(false)
      // Alert.alert('Journey ended', "Thank you for using Travel Nap Buddy!")
    } else {
      // console.log('handleJourney()');
      setProximityAlertActive(true)
      setPersonAlerted(false)
      // if (!proximityAlertActive){
      Alert.alert('Journey started', "Press \"End\" to stop the journey.")
      // }
    }
  }

  const getGeodesicString = () => {
    // console.log(location?.coords.latitude, location?.coords.longitude, markerCoord)
    if (location && markerCoord) {
      let dist = geodesic(markerCoord.latitude, markerCoord.longitude, location.coords.latitude, location.coords.longitude)
      return getDistanceString(dist)
    } else if (!location) {
      console.log('Location not available');
      return 'Location not available'
    } else {
      // throw new Error('No destination set')
      console.log('getGeodesicString - other');
      return 'Loading...'
    }
  }

  const [proximityAlertActive, setProximityAlertActive] = useState<Boolean>(false);
  const [personAlerted, setPersonAlerted] = useState<Boolean>(false);

  const proximityAlert = ()=>{
    if (!proximityAlertActive) {
      // console.log('Proximity alert not active', proximityAlertActive);
    } else {
      console.log(`Distance - ${getGeodesicString()}`);
      let dist = geodesic(markerCoord.latitude, markerCoord.longitude, location.coords.latitude, location.coords.longitude)
      if (dist < distanceThreshold && !personAlerted){
        Alert.alert('Reaching destination. Wake up!')
        setPersonAlerted(true)
      }
    }
  }

  // Handle search barx
  const [searchText, setSearchText] = useState<string>('');

  // Timerx

  useEffect(()=>{
    const interval = setInterval(() => {
      proximityAlert()
    }, 1000);
      return ()=>{clearInterval(interval)}
  }, [markerCoord, proximityAlertActive, personAlerted, distanceThreshold])

  useEffect(()=>{ // Update location on timer
    const interval = setInterval(() => {
      getCurrentLocation()
      setMarkerDesc(getGeodesicString())
    }, 3000);
      return ()=>{clearInterval(interval)}
  }, [markerDesc, location])
    
//   useEffect(()=>{
//     const interval = setInterval(() => {
      
//       if (!permissionGranted) {
//         requestLocationPermission()
//         console.log('pg',permissionGranted);
//       }
      
//     }, 1000);
//       return ()=>{clearInterval(interval)}
// }, [permissionGranted, ])

  return (
    // <GoogleMaps.View style={{ flex: 1 }} />
    <View style={styles.container}>
        {
          location || !location
          ? 
          <View>
            <View className='absolute top-10 left-5 right-5 z-1'>
              <SearchBar placeholder='Search' value={searchText} onPress={()=>{console.log('pressed search')}} onChangeText={text=>setSearchText(text)}/>
            </View>
            <MapView style={styles.map} showsUserLocation={true} showsMyLocationButton={false} region={initialRegion} onPress={data=>{mvOnPress(data)}} location>

              {markerCoord
              ? 
              <Marker key={1} title={'Destination'} description={markerDesc ? markerDesc : '...'} coordinate={markerCoord}/> : 
              null}

            </MapView>
            <View className='flex-1 flex-row absolute left-0 right-0 justify-between p-5' style={styles.buttonContainer}>
              {isSetMarkerActive ? setMarkerButton(true) : setMarkerButton(false)}
              
              <TouchableOpacity className='py-4 px-6 bg-accent rounded-full items-center justify-center' onPress={()=>{handleJourney()}}>
                <Text className='text-dark font-bold text-2xl'>{!proximityAlertActive ?  'Start' : 'End'}</Text>
              </TouchableOpacity>

              <TouchableOpacity className='bg-primary rounded-full p-3 w-[30%] items-center justify-center' onPress={()=>{removeMarker()}}>
                <Text className='text-white'>Remove</Text>
              </TouchableOpacity>
            </View>
            {/* <View className='flex-1 flex-row absolute left-0 right-0 justify-center p-5' style={{bottom:'21%'}}>
              <TouchableOpacity className='py-4 px-6 bg-primary rounded-full items-center justify-center' onPress={()=>{}}>
                <Text className='text-white'>DEBUG</Text>
              </TouchableOpacity>
            </View> */}
          </View>
          : 
          <View className='flex-1 justify-center items-center bg-primary'>
            <ActivityIndicator size='large' color={'#fff'} className="mb-20"/>
            <Text className='text-white'>Loading...</Text>
          </View>
        } 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  buttonContainer: {
    // flex: 1,
    // position: 'absolute',
    bottom: '13%',
    // left: 0,
    // right: 0,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // marginHorizontal: 20,
  },
  // button: {
  //   alignItems: 'center',
  //   backgroundColor: '#FF0000',
  //   padding: 10,
  // },
});