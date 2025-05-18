import { getData, storeData } from '@/constants/functions';
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings() {
  
  const [distanceThreshold, setDistanceThreshold] = useState<string>('')
  
  useEffect(()=>{
    storeData('distanceThreshold', '50')
    getData('distanceThreshold', setDistanceThreshold)
  },[])
  
  const updateDistanceThreshold = (value:string) => {
    storeData('distanceThreshold', value)
    setDistanceThreshold(value)
  }

  return (
    <View className="flex-1 bg-primary">
      <View className="pl-5 pt-20">
        <Text className="text-accent text-3xl font-bold">Settings</Text>
      </View>
      <View className="flex-row m-5 items-center">
        <Text className="text-white text-l mr-3">Distance:</Text>
        <TextInput className="text-primary flex-1 bg-accent mr-3" keyboardType='numeric' value={distanceThreshold} onChangeText={(text)=>{updateDistanceThreshold(text)}}/>
          <TouchableOpacity className='bg-accent p-3' onPress={()=>{}}>
            <Text>Save</Text>
          </TouchableOpacity>
      </View>
      <View className="flex-row m-5">
        <Text className="text-accent">
          {distanceThreshold}
        </Text>
      </View>
    </View>
  );
}
