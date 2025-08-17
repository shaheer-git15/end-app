import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { progressService } from '../services/firebase';

const { width, height } = Dimensions.get('window');

const UploadVideoScreen = ({ navigation }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPhoneme, setSelectedPhoneme] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  
  const { user } = useAuth();

  const handleBackPress = () => {
    navigation.navigate('StudentDashboard');
  };

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const connected = await apiService.testConnection();
      setBackendConnected(connected);
      if (!connected) {
        Alert.alert(
          'Connection Error',
          'Cannot connect to backend server. Please make sure the backend is running.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Backend connection check failed:', error);
      setBackendConnected(false);
    }
  };

  const handleSelectVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setSelectedVideo(file);
      console.log('Selected video:', file);
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    }
  };

  const handleCancelVideo = () => {
    setSelectedVideo(null);
    setSelectedPhoneme('');
    setGradingResult(null);
  };

  const handleUploadVideo = async () => {
    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video file');
      return;
    }

    if (!selectedPhoneme.trim()) {
      Alert.alert('Error', 'Please select a phoneme to practice');
      return;
    }

    if (!backendConnected) {
      Alert.alert('Error', 'Backend server is not connected. Please try again.');
      return;
    }

    setIsUploading(true);

    try {
      // Create file object for upload
      const videoFile = {
        uri: selectedVideo.uri,
        type: selectedVideo.mimeType || 'video/mp4',
        name: selectedVideo.name || 'video.mp4',
      };

      console.log('Sending video file:', videoFile);
      console.log('Selected phoneme:', selectedPhoneme);

      // Send to backend for analysis
      const result = await apiService.gradePronunciation(videoFile, selectedPhoneme);
      
      setGradingResult(result);
      
      // Save progress to Firebase if user is logged in
      if (user) {
        try {
          await progressService.saveAttempt(
            user.email,
            selectedPhoneme,
            result.audio_score,
            result.video_score,
            result.audio_most_likely || null,
            result.video_most_likely || null
          );
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
      
      setIsUploading(false);
      
      // Show results with detailed feedback
      const resultMessage = `Audio Score: ${result.audio_score}%\nVideo Score: ${result.video_score}%\n\n${
        result.audio_most_likely ? `Audio suggests: "${result.audio_most_likely}"\n` : ''
      }${
        result.video_most_likely ? `Video suggests: "${result.video_most_likely}"\n` : ''
      }`;
      
      Alert.alert(
        'Analysis Complete',
        resultMessage,
        [
          {
            text: 'View Progress',
            onPress: () => navigation.navigate('ProgressScreen'),
          },
          {
            text: 'Try Again',
            onPress: () => {
              setGradingResult(null);
              setSelectedVideo(null);
              setSelectedPhoneme('');
            },
          },
        ]
      );
    } catch (error) {
      setIsUploading(false);
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Failed to analyze video. Please try again.');
    }
  };

  const phonemes = [
    'ai', 'y', 'z', 'th', 'sh', 'ch', 'ng', 'ee', 'oo', 'ar', 'er', 'or'
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Left - Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <View style={styles.backIcon}>
            <Text style={styles.backArrow}>←</Text>
          </View>
        </TouchableOpacity>

        {/* Center - Title */}
        <Text style={styles.headerTitle}>Upload Video</Text>

        {/* Right - Upload Button */}
        <TouchableOpacity 
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]} 
          onPress={handleUploadVideo}
          disabled={isUploading}
        >
          <Text style={styles.uploadButtonText}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upload Video Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Preview Section */}
        <View style={styles.videoPreviewSection}>
          <View style={styles.videoPreviewContainer}>
            <View style={styles.videoPreview}>
              <Text style={styles.videoPreviewIcon}>🎥</Text>
              <Text style={styles.videoPreviewText}>
                {selectedVideo ? selectedVideo.name : 'No video selected'}
              </Text>
              {selectedVideo && (
                <Text style={styles.videoInfoText}>
                  Size: {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.selectVideoButton} onPress={handleSelectVideo}>
                <Text style={styles.selectVideoButtonText}>
                  {selectedVideo ? 'Change Video' : 'Select Video'}
                </Text>
              </TouchableOpacity>
              {selectedVideo && (
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelVideo}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Phoneme Selection */}
        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Select Phoneme to Practice</Text>
            <View style={styles.categoryContainer}>
              {phonemes.map((phoneme) => (
                <TouchableOpacity
                  key={phoneme}
                  style={[
                    styles.categoryChip,
                    selectedPhoneme === phoneme && styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedPhoneme(phoneme)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedPhoneme === phoneme && styles.categoryChipTextSelected,
                    ]}
                  >
                    {phoneme}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Upload Progress */}
          {isUploading && (
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Analysis Progress</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>Analyzing pronunciation... Please wait</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2D479D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  uploadButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  uploadButtonText: {
    color: '#2D479D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  videoPreviewSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  videoPreviewContainer: {
    alignItems: 'center',
  },
  videoPreview: {
    width: 280,
    height: 180,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  videoPreviewIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  videoPreviewText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  selectVideoButton: {
    backgroundColor: '#2D479D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  selectVideoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipSelected: {
    backgroundColor: '#2D479D',
    borderColor: '#2D479D',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2D479D',
    width: '60%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  videoInfoText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});

export default UploadVideoScreen;
