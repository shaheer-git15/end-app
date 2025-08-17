import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ProgressScreen = ({ navigation }) => {
  const [progressData] = useState({
    overallGPA: 3.8,
    semesterGPA: 3.9,
    totalCredits: 75,
    completedCredits: 60,
    courses: [
      {
        id: '1',
        name: 'Advanced Mathematics',
        grade: 'A',
        credits: 4,
        score: 92,
        status: 'Completed',
      },
      {
        id: '2',
        name: 'Computer Science Fundamentals',
        grade: 'A-',
        credits: 3,
        score: 88,
        status: 'Completed',
      },
      {
        id: '3',
        name: 'Literature & Composition',
        grade: 'B+',
        credits: 3,
        score: 87,
        status: 'Completed',
      },
      {
        id: '4',
        name: 'Physics I',
        grade: 'A',
        credits: 4,
        score: 91,
        status: 'In Progress',
      },
      {
        id: '5',
        name: 'History of Art',
        grade: 'B',
        credits: 3,
        score: 85,
        status: 'In Progress',
      },
    ],
  });

  const handleBackPress = () => {
    navigation.navigate('StudentDashboard');
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
        return '#66BB6A';
      case 'A-':
        return '#81C784';
      case 'B+':
        return '#42A5F5';
      case 'B':
        return '#64B5F6';
      case 'B-':
        return '#90CAF9';
      case 'C+':
        return '#FFA726';
      case 'C':
        return '#FFB74D';
      case 'C-':
        return '#FFCC02';
      default:
        return '#999';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#66BB6A';
      case 'In Progress':
        return '#42A5F5';
      default:
        return '#999';
    }
  };

  const renderCourseItem = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <Text style={styles.courseName}>{item.name}</Text>
        <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.grade) }]}>
          <Text style={styles.gradeText}>{item.grade}</Text>
        </View>
      </View>
      
      <View style={styles.courseDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Credits:</Text>
          <Text style={styles.detailValue}>{item.credits}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Score:</Text>
          <Text style={styles.detailValue}>{item.score}%</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const progressPercentage = (progressData.completedCredits / progressData.totalCredits) * 100;

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
        <Text style={styles.headerTitle}>Progress</Text>

        {/* Right - Share Button */}
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

             {/* Progress Content */}
       <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                 {/* Skills Progress Rings - At the Top */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Skills Progress</Text>
          <View style={styles.skillsRow}>
            {/* Phonics Progress Ring */}
            <View style={styles.skillCard}>
              <View style={styles.progressRingContainer}>
                <View style={styles.progressRingNoBg}>
                  <View style={[styles.phonicsProgressRingFill, { transform: [{ rotate: `${(75 / 100) * 360}deg` }] }]} />
                  <View style={styles.progressRingCenterFix}>
                    <Text style={styles.progressPercentage}>75%</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.skillLabel}>Phonics</Text>
            </View>

            {/* Gestures Progress Ring */}
            <View style={styles.skillCard}>
              <View style={styles.progressRingContainer}>
                <View style={styles.progressRingNoBg}>
                  <View style={[styles.gesturesProgressRingFill, { transform: [{ rotate: `${(60 / 100) * 360}deg` }] }]} />
                  <View style={styles.progressRingCenterFix}>
                    <Text style={styles.progressPercentage}>60%</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.skillLabel}>Gestures</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.recentActivitySection}>
          <View style={styles.recentActivityCard}>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Practiced Phonics: A, B, C</Text>
                <Text style={styles.activityDate}>13 July</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Practiced Phonics: A, E, I</Text>
                <Text style={styles.activityDate}>14 July</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Practiced Phonics: L, U, S</Text>
                <Text style={styles.activityDate}>15 July</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Completed sound quiz: A–D</Text>
                <Text style={styles.activityDate}>16 July</Text>
              </View>
              <View style={styles.activityItem}>
                <Text style={styles.activityText}>Practiced Phonics: J, H, O</Text>
                <Text style={styles.activityDate}>17 July</Text>
              </View>
            </View>
          </View>
        </View>
        {/* ...existing code... */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  progressRingNoBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
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
  shareButton: {
    padding: 5,
  },
  shareIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summarySection: {
    marginTop: 20,
    marginBottom: 20,
  },
  summaryCard: {
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
  },
  // phonicsProgressRingFill: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   width: 100,
  //   height: 100,
  //   borderRadius: 50,
  //   borderWidth: 10,
  //   borderColor: '#2D479D',
  //   borderTopColor: 'transparent',
  //   borderRightColor: 'transparent',
  //   backgroundColor: 'transparent',
  //   zIndex: 1,
  //   transform: [{ rotate: '-90deg' }],
  // },
  // gesturesProgressRingFill: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   width: 100,
  //   height: 100,
  //   borderRadius: 50,
  //   borderWidth: 10,
  //   borderColor: '#1E88E5',
  //   borderTopColor: 'transparent',
  //   borderRightColor: 'transparent',
  //   backgroundColor: 'transparent',
  //   zIndex: 1,
  //   transform: [{ rotate: '-90deg' }],
  // },
  progressRingCenterFix: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D479D',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  coursesSection: {
    marginBottom: 30,
  },
  courseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  courseDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    alignItems: 'flex-start',
  },
  skillCard: {
    alignItems: 'center',
    width: '48%',
  },
  progressRingContainer: {
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressRingFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#2D479D',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  phonicsProgressRingFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#2D479D',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  gesturesProgressRingFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#1E88E5',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  progressRingCenterFix: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 2,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D479D',
    textAlign: 'center',
  },
  skillLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  recentActivitySection: {
    marginBottom: 20,
  },
  recentActivityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recentActivityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  activityList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
});

export default ProgressScreen;
