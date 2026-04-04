import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ShareButton from '@/components/ShareButton'

const location = () => {
  return (
    <View>
      <Text>location</Text>
      <ShareButton sessionId={''}/>
    </View> 
  )
}

export default location

const styles = StyleSheet.create({})