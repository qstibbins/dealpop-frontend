import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Alert, AlertHistory, AlertPreferences, PriceCheckResult } from '../types/alerts';

const db = getFirestore();
const auth = getAuth();

export class AlertService {
  // Create a new alert
  static async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt'>): Promise<Alert> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const alert: Alert = {
      ...alertData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'alerts', alert.id), alert);
    return alert;
  }

  // Get all alerts for current user
  static async getUserAlerts(): Promise<Alert[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Alert);
  }

  // Get active alerts
  static async getActiveAlerts(): Promise<Alert[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Alert);
  }

  // Update alert
  static async updateAlert(alertId: string, updates: Partial<Alert>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const alertRef = doc(db, 'alerts', alertId);
    const alertDoc = await getDoc(alertRef);
    
    if (!alertDoc.exists()) throw new Error('Alert not found');
    if (alertDoc.data().userId !== userId) throw new Error('Unauthorized');

    await updateDoc(alertRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // Delete alert
  static async deleteAlert(alertId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const alertRef = doc(db, 'alerts', alertId);
    const alertDoc = await getDoc(alertRef);
    
    if (!alertDoc.exists()) throw new Error('Alert not found');
    if (alertDoc.data().userId !== userId) throw new Error('Unauthorized');

    await deleteDoc(alertRef);
  }

  // Get alert history
  static async getAlertHistory(alertId: string): Promise<AlertHistory[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'alertHistory'),
      where('alertId', '==', alertId),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AlertHistory);
  }

  // Add alert history entry
  static async addAlertHistory(historyEntry: Omit<AlertHistory, 'id'>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const history: AlertHistory = {
      ...historyEntry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    await setDoc(doc(db, 'alertHistory', history.id), history);
  }

  // Get user alert preferences
  static async getAlertPreferences(): Promise<AlertPreferences | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(db, 'alertPreferences', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as AlertPreferences;
    }
    return null;
  }

  // Update alert preferences
  static async updateAlertPreferences(preferences: Partial<AlertPreferences>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = doc(db, 'alertPreferences', userId);
    await setDoc(docRef, { userId, ...preferences }, { merge: true });
  }

  // Real-time listener for alerts
  static subscribeToAlerts(callback: (alerts: Alert[]) => void): () => void {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const q = query(
      collection(db, 'alerts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const alerts = querySnapshot.docs.map(doc => doc.data() as Alert);
      callback(alerts);
    });
  }

  // Check if price drop threshold is met
  static checkPriceDropThreshold(alert: Alert, currentPrice: number): boolean {
    const priceChange = alert.currentPrice - currentPrice;
    const priceChangePercentage = (priceChange / alert.currentPrice) * 100;

    return (
      priceChange >= alert.thresholds.absolutePriceDrop ||
      priceChangePercentage >= alert.thresholds.priceDropPercentage
    );
  }

  // Simulate price check (in real implementation, this would call external APIs)
  static async checkProductPrice(productUrl: string): Promise<PriceCheckResult> {
    // This is a mock implementation
    // In a real app, you'd integrate with price tracking APIs
    const mockPrice = Math.random() * 1000 + 100;
    const mockPreviousPrice = mockPrice + (Math.random() * 50 - 25);
    
    return {
      productId: 'mock-product-id',
      currentPrice: mockPrice,
      previousPrice: mockPreviousPrice,
      priceChange: mockPrice - mockPreviousPrice,
      priceChangePercentage: ((mockPrice - mockPreviousPrice) / mockPreviousPrice) * 100,
      inStock: Math.random() > 0.1,
      lastChecked: new Date().toISOString(),
    };
  }
} 