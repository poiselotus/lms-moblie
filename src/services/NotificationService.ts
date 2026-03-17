import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification types
export type NotificationType =
  | "new_lesson"
  | "course_update"
  | "reminder"
  | "certificate"
  | "quiz_result";

export interface PushToken {
  userId: string;
  token: string;
  deviceId: string;
  platform: "ios" | "android" | "web";
  createdAt: Date;
}

// Notification payload
export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type: NotificationType;
    courseId?: string;
    lessonId?: string;
    [key: string]: any;
  };
}

class NotificationService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      if (!Device.isDevice) {
        console.log("Notifications require a physical device");
        return false;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permission not granted");
        return false;
      }

      // Configure Android channel
      if (process.platform === "android") {
        await Notifications.setNotificationChannelAsync("lms-notifications", {
          name: "LMS Notifications",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B35",
        });
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.initialize();
      if (!hasPermission) return null;

      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  async savePushToken(userId: string): Promise<void> {
    try {
      const token = await this.getPushToken();
      if (!token) return;

      const tokenDoc = doc(db, "pushTokens", userId);
      await setDoc(
        tokenDoc,
        {
          userId,
          token,
          deviceId: Device.deviceId || "unknown",
          platform: Device.platform?.toLowerCase() || "unknown",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Error saving push token:", error);
    }
  }

  async removePushToken(userId: string): Promise<void> {
    try {
      const tokenDoc = doc(db, "pushTokens", userId);
      await setDoc(
        tokenDoc,
        {
          token: null,
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Error removing push token:", error);
    }
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Error sending local notification:", error);
    }
  }

  async scheduleNotification(
    payload: NotificationPayload,
    trigger: Notifications.NotificationTriggerInput,
  ): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        trigger,
      });
      return id;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  }

  async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  }

  // Schedule a reminder notification
  async scheduleReminder(
    lessonId: string,
    courseId: string,
    scheduledDate: Date,
  ): Promise<string> {
    return this.scheduleNotification(
      {
        title: "Continue Learning!",
        body: "Don't forget to continue your course",
        data: {
          type: "reminder",
          courseId,
          lessonId,
        },
      },
      { date: scheduledDate },
    );
  }

  // Notification for new lesson
  async notifyNewLesson(
    courseName: string,
    lessonTitle: string,
    courseId: string,
    lessonId: string,
  ): Promise<void> {
    await this.sendLocalNotification({
      title: "New Lesson Available!",
      body: `${courseName}: ${lessonTitle} is now available`,
      data: {
        type: "new_lesson",
        courseId,
        lessonId,
      },
    });
  }

  // Notification for course update
  async notifyCourseUpdate(
    courseName: string,
    courseId: string,
  ): Promise<void> {
    await this.sendLocalNotification({
      title: "Course Updated!",
      body: `${courseName} has been updated with new content`,
      data: {
        type: "course_update",
        courseId,
      },
    });
  }

  // Notification for certificate earned
  async notifyCertificate(courseName: string, courseId: string): Promise<void> {
    await this.sendLocalNotification({
      title: "Congratulations! 🎉",
      body: `You've earned a certificate for completing ${courseName}!`,
      data: {
        type: "certificate",
        courseId,
      },
    });
  }

  // Notification for quiz result
  async notifyQuizResult(
    courseName: string,
    passed: boolean,
    courseId: string,
  ): Promise<void> {
    await this.sendLocalNotification({
      title: passed ? "Quiz Passed! 🎉" : "Quiz Result",
      body: passed
        ? `Congratulations! You passed the quiz for ${courseName}`
        : `You didn't pass the quiz for ${courseName}. Keep learning!`,
      data: {
        type: "quiz_result",
        courseId,
      },
    });
  }

  // Add notification listener
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void,
  ): Notifications.EventSubscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Add notification response listener
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void,
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default new NotificationService();
