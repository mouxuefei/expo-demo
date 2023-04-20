import * as FaceDetector from 'expo-face-detector'
import { captureRef } from 'react-native-view-shot'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import {
  Button,
  StyleSheet,
  Text,
  View,
  Image,
  ToastAndroid,
  Platform
} from 'react-native'
import Rectangle from './Rectangle.js'
import { Camera } from 'expo-camera'
import { BlurView } from 'expo-blur'
import * as MediaLibrary from 'expo-media-library'

export default function App () {
  const [permission, setPermission] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const [posGroup, setPosGroup] = useState(null)
  const [showCameraPage, setShowCameraPage] = useState(true)
  const cameraRef = useRef(undefined)
  const imageContainerRef = useRef(undefined)
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()
  const [propsFaceDetector, setPropsFaceDetector] = useState(null)
  const [firstImage, setFirstImage] = useState(null)
  const [firstImagePos, setFirstImagePos] = useState(null)
  const [cameraType, setCameraType] = useState('front')
  const msgRef = useRef(undefined)
  useEffect(() => {
    (async () => {
      await requestPermission()
      const { status } = await Camera.requestMicrophonePermissionsAsync()
      setPermission(status === 'granted')
    })()
  }, [])

  if (!permission) {
    return <Text>No access to camera</Text>
  }

  const showToast = (msg) => {
    if (msgRef.current !== msg) {
      if (Platform.OS === 'android') {
        msgRef.current = msg
        ToastAndroid.show(msg, ToastAndroid.SHORT)
      }
    }
  }

  const handleDetectedFaces = ({ faces }) => {
    if (faces && faces[0]) {
      console.log('faces[0]========', faces[0])
      const boundWidth = faces[0]?.bounds?.size?.width
      const boundHeight = faces[0]?.bounds?.size?.height
      const boundTop = faces[0]?.bounds?.origin?.y
      const boundLeft = faces[0]?.bounds?.origin?.x
      const firstMask = {
        width: boundWidth / 2,
        height: boundHeight / 2,
        top: boundTop / 2,
        left: boundLeft / 2
      }
      setFirstImagePos(firstMask)
      setPosGroup(faces[0])
      showToast('Face Detected!!')
    } else {
      setFirstImagePos(undefined)
      setPosGroup(undefined)
      showToast('Captured images should contain a face!!')
    }
  }

  const onPressTake = async () => {
    try {
      requestPermission()
      const { uri } = await cameraRef.current?.takePictureAsync()
      console.log('aaa===', uri)
      const asset = await MediaLibrary.createAssetAsync(uri)
      console.log('nbbbb===', asset)
      setFirstImage({ type: cameraType, ...asset })
      setShowCameraPage(false)
    } catch (error) {
      console.log('erorr====', error)
    }
  }

  const onPressChangeCamera = () => {
    if (cameraType === 'front') {
      setCameraType('back')
    } else {
      setCameraType('front')
    }
  }

  const onPressSave = async () => {
    try {
      const result = await captureRef(imageContainerRef, {
        result: 'tmpfile',
        height: firstImage.height,
        width: firstImage.width,
        quality: 1,
        format: 'png'
      })
      console.log('result====', result)
      const asset = await MediaLibrary.createAssetAsync(result)
      console.log('nbbbb2===', asset)
    } catch (error) {
      console.log('erorr====', error)
    }
  }

  let contentView

  if (showCameraPage) {
    contentView = (
      <View style={{ flex: 1 }}>
        <Camera
          style={{ flex: 1 }}
          ref={cameraRef}
          type={cameraType}
          ratio={'16:9'}
          {...propsFaceDetector}
          onCameraReady={() => {
            setPropsFaceDetector({
              onFacesDetected: handleDetectedFaces,
              faceDetectorSettings: {
                mode: FaceDetector.FaceDetectorMode.fast,
                detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                runClassifications:
                  FaceDetector.FaceDetectorClassifications.none,
                minDetectionInterval: 300
              }
            })
          }}
        >
          <Rectangle face={posGroup} />
        </Camera>
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Button title="take Photo" onPress={onPressTake}></Button>
          <Button title="change camera" onPress={onPressChangeCamera}></Button>
        </View>
      </View>
    )
  } else {
    contentView = (
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{ aspectRatio: 9 / 16, width: windowWidth / 2 }}
            ref={imageContainerRef}
          >
            <Image
              style={{
                aspectRatio: windowWidth / windowHeight,
                width: windowWidth / 2,
                transform:
                  firstImage.type === 'front' ? [{ rotateY: '180deg' }] : []
              }}
              source={{ uri: firstImage.uri }}
            />
            <BlurView
              intensity={90}
              tint="light"
              style={[styles.blurContainer, { ...firstImagePos }]}
            ></BlurView>
          </View>
          <Image
            style={{
              aspectRatio: windowWidth / windowHeight,
              backgroundColor: 'green',
              width: windowWidth / 2
            }}
          />
        </View>
        <View style={{}}>
          <Button title="save Photo" onPress={onPressSave}></Button>
        </View>
      </View>
    )
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        const height = e.nativeEvent.layout.height
        const width = e.nativeEvent.layout.width
        if (height > width) {
          setWindowWidth(width)
          setWindowHeight(height)
        } else {
          setWindowWidth(height)
          setWindowHeight(width)
        }
      }}
    >
      {contentView}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  blurContainer: {
    position: 'absolute'
  }
})
