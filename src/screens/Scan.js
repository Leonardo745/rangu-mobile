import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Image, TextInput, TouchableOpacity, ImageBackground, Animated, Platform, SafeAreaView } from "react-native";
import Lottie from 'lottie-react-native';
//import NfcAnim from '../../assets/animations/nfc/phone-tap.json'
import NfcAnim from '../../assets/animations/nfc/scan-menu.json'
import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiMenu from '../services/apiMenu.js';

import QrCodeScanner from '../components/QrCodeScanner';

let userId = '';

const images = [
    require("../../assets/images/icon0_alpha.png"),
];


export default function ScanScreen({ navigation }) {

    const [errorOpacityAnim] = useState(new Animated.Value(0));
    const [infoMessage, setInfoMessage] = useState('Erro');
    const modalizeRef = useRef(null);

    function haddleRestaurant() {
        global.stopPullingToLeave = false;
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'Navigation' },
                ],
            })
        )
    }

    function haddleSettings() {
        navigation.dispatch(
            CommonActions.reset({
                index: 1,
                routes: [{ name: 'SettingsScreen', params: { fromScan: true } },
                ],
            })
        )
    }

    function Bypass() {
        ScanComplete('{"tableId": "fe720e33-c7a7-462d-9e0f-a2e3c5e8b20f"}')
    }

    async function ScanComplete(data) {

        let qrCodeInfo
        //Exemplo '{"tableId": "03af2e27-c118-45c9-9d9c-a0691c9c67bf"}'
        try {
            console.log("Scan Qrcode info: ", data);
            qrCodeInfo = JSON.parse(data);

        } catch (error) {
            console.log('QRCode not recognized');

            setInfoMessage('QRCode not recognized');
            Animated.timing(errorOpacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }


        try {
            setInfoMessage('Connecting you to the table...');
            Animated.timing(errorOpacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()

            await AsyncStorage.getItem('userid')
                .then(value => {
                    userId = value;

                }).catch(err => {
                    console.log(err);

                });
            let response = await apiMenu.post('/clientTables', { tableId: qrCodeInfo.tableId }, { headers: { clientId: userId } })
            console.log('Scan TableId: ', response.data.id);
            console.log('Scan RestaurantId: ', response.data.restaurantId);
            await AsyncStorage.setItem('tableId', response.data.id);
            await AsyncStorage.setItem('restaurantId', response.data.restaurantId);

            setTimeout(haddleRestaurant, 0);

        } catch (error) {
            console.log(error);
            setInfoMessage('Invalid QrCode');
            Animated.timing(errorOpacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()
        }


    }

    function OpenModalScanner() {
        modalizeRef.current?.open();
    }

    function CloseModalScanner() {
        modalizeRef.current?.close();
    }

    return (

        <LinearGradient style={styles.background} colors={["#D7233C", "#E65F4C"]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} >

            <Animated.View style={styles.container} >
                <Animated.View style={[styles.containeSettings]}>
                    <TouchableOpacity onPress={haddleSettings}>
                        <AntDesign name="setting" size={45} color="white" />
                    </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity styles={styles.touch} onPress={Bypass}>
                    <Lottie style={[styles.anim]} source={NfcAnim} autoPlay loop />
                </TouchableOpacity>
                <Animated.View style={[styles.containerInfo, { opacity: errorOpacityAnim }]}>
                    <Text style={styles.textInfo}>{infoMessage}</Text>
                </Animated.View>
                <Animated.View style={[styles.containeQrBt]}>
                    <TouchableOpacity style={styles.qrButton} onPress={OpenModalScanner}>
                        <MaterialCommunityIcons name="qrcode-scan" size={60} color="white" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.qrButton}>
                        <MaterialCommunityIcons name="qrcode-edit" size={60} color="white" />
                    </TouchableOpacity> */}
                </Animated.View>

            </Animated.View>

            <Modalize modalStyle={styles.modal} ref={modalizeRef} /*modalHeight={770} onClose={ }*/ scrollViewProps={{ showsVerticalScrollIndicator: false, scrollEnabled: false, }}>
                <QrCodeScanner CodeScanned={ScanComplete} closeModal={CloseModalScanner} />
            </Modalize>

        </LinearGradient>

    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        position: 'absolute',
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",

    },
    containeSettings: {
        position: 'absolute',
        top: "7.1%",
        left: "85%",
        zIndex: 1,
    },
    touch: {

        alignItems: "center",
        justifyContent: "center",
    },
    anim: {
        width: "100%"
    },
    containeQrBt: {
        flexDirection: 'row',
    },
    containerInfo: {
        backgroundColor: "#FFF",
        height: 40,
        width: 330,
        marginBottom: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 80,
    },
    textInfo: {
        color: "#E65F4C",
        fontWeight: "bold",
    },
    qrButton: {
        padding: "10%"
    },
    modal: {
        backgroundColor: "#1e222b",
    },
});