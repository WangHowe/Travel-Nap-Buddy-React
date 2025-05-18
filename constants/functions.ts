const toRad = (value:any) => (value * Math.PI) / 180;

export function geodesic(latitude1:number, longitude1:number, latitude2:number, longitude2:number){
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(latitude2 - latitude1);
  const dLon = toRad(longitude2 - longitude1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(latitude1)) * Math.cos(toRad(latitude2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance*1000;
}

export function getDistanceString (distance : number ) {
    if (distance >= 1000){
      return String(Math.round(distance/10)/100)+'km'
    }else{
      return String(Math.round(distance*100)/100)+'m'
    }
  }

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key:string, value:string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};
export const getData = async (key:string, setFunction:Function) => {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(`getData - key:${key} - value:${value}`)
    if (value !== null) {
      // value previously stored
      setFunction(value)
      return value
    }
  } catch (e) {
    // error reading value
  }
};