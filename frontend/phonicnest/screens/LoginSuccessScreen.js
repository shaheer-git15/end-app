import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginSuccessScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to StudentDashboard after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('StudentDashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
      <SafeAreaView style={styles.container}>
        {/* Animation above divider */}
        <View style={styles.topSection}>
          <LottieView
            source={require('../assets/success.json')}
            autoPlay
            loop={false}
            style={styles.successLottie}
          />
        </View>
        {/* Divider */}
        <View style={styles.divider} />
        {/* Text below divider */}
        <View style={styles.bottomSection}>
          <Text style={styles.successText}>Log in Successfull!</Text>
          <Text style={styles.welcomeText}>Welcome, again!</Text>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  successLottie: {
    width: 300,
    height: 300,
  },
  topSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#2D479D',
  },
  divider: {
    position: 'absolute',
    top: height * 0.5,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'white',
    zIndex: 1,
  },
  contentSection: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -height * 0.1 }],
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
});

export default LoginSuccessScreen;
