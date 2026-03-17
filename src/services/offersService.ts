/**
 * GDS Driving School — Exclusive Offers Service
 * =================================================
 * Firestore CRUD for the shared `ads` collection.
 * Uses the same collection as the web app.
 */

import {
  collection as firestoreCollection,
  doc as firestoreDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from '@react-native-firebase/firestore';
import { db } from '../config/firebase';
import type { Ad } from '../types/ad';

const ADS_COLLECTION = 'ads';

// ─── Helpers ────────────────────────────────────────────────────────────────

type FirestoreAd = Omit<Ad, 'id'> & {
  createdAt?: any;
  updatedAt?: any;
  importedFromLocalStorage?: boolean;
};

function removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
  const entries = Object.entries(obj).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as T;
}

function sanitizeAd(input: Partial<Ad>, fallbackId: string): Ad {
  return {
    id: input.id || fallbackId,
    title: input.title || 'Untitled Offer',
    description: input.description || '',
    image_url: input.image_url || '',
    imagePosition: input.imagePosition || 'center',
    link: input.link || undefined,
    active: input.active ?? true,
    category: input.category || 'general',
    offerCode: input.offerCode || undefined,
    fullDescription: input.fullDescription || input.description || '',
    terms: input.terms || 'Standard terms and conditions apply.',
    postcodes: Array.isArray(input.postcodes) ? input.postcodes : [],
    showToStudents: input.showToStudents !== false,
    showToInstructors: input.showToInstructors !== false,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
    cities: Array.isArray(input.cities) ? input.cities : undefined,
    clientName: input.clientName || undefined,
    revenue: typeof input.revenue === 'number' ? input.revenue : undefined,
    clientEmail: input.clientEmail || undefined,
    clientPhone: input.clientPhone || undefined,
    clientAddress: input.clientAddress || undefined,
    amountPaid: typeof input.amountPaid === 'number' ? input.amountPaid : undefined,
    amountOutstanding: typeof input.amountOutstanding === 'number' ? input.amountOutstanding : undefined,
    views: typeof input.views === 'number' ? input.views : undefined,
    clicks: typeof input.clicks === 'number' ? input.clicks : undefined,
  };
}

function toFirestoreAd(ad: Ad): FirestoreAd {
  const { id: _id, ...rest } = ad;
  return removeUndefinedFields(rest);
}

// ─── Real-time Listener ─────────────────────────────────────────────────────

export function subscribeToAds(
  onChange: (ads: Ad[]) => void,
  onError?: (error: unknown) => void,
) {
  const q = query(
    firestoreCollection(db, ADS_COLLECTION),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const ads = snapshot.docs.map((snap) => {
        const data = snap.data() as FirestoreAd;
        return sanitizeAd({ ...data, id: snap.id }, snap.id);
      });
      onChange(ads);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}

// ─── CRUD Operations ────────────────────────────────────────────────────────

export async function createAd(ad: Ad): Promise<void> {
  await setDoc(
    firestoreDoc(firestoreCollection(db, ADS_COLLECTION), ad.id),
    {
      ...toFirestoreAd(ad),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function upsertAd(ad: Ad): Promise<void> {
  await setDoc(
    firestoreDoc(firestoreCollection(db, ADS_COLLECTION), ad.id),
    {
      ...toFirestoreAd(ad),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteAdById(adId: string): Promise<void> {
  await deleteDoc(firestoreDoc(firestoreCollection(db, ADS_COLLECTION), adId));
}

export async function setAdActiveStatus(adId: string, active: boolean): Promise<void> {
  await setDoc(
    firestoreDoc(firestoreCollection(db, ADS_COLLECTION), adId),
    { active, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function replaceAllAds(ads: Ad[]): Promise<void> {
  const existingSnapshot = await getDocs(firestoreCollection(db, ADS_COLLECTION));
  const batch = writeBatch(db);

  existingSnapshot.docs.forEach((d) => {
    batch.delete(firestoreDoc(firestoreCollection(db, ADS_COLLECTION), d.id));
  });

  ads.forEach((ad) => {
    batch.set(firestoreDoc(firestoreCollection(db, ADS_COLLECTION), ad.id), {
      ...toFirestoreAd(ad),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

// ─── Default Offers (same as web) ───────────────────────────────────────────

export const EXCLUSIVE_OFFERS: Ad[] = [
  {
    id: '1',
    title: 'Mechanics – 15% Off Repairs',
    description: 'Get 15% off your next car service or repair.',
    image_url: 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    active: true,
    category: 'automotive',
    offerCode: 'REPAIR15',
    fullDescription: 'Save 15% on all car repairs and services at our partner mechanics. This exclusive offer includes oil changes, brake repairs, engine diagnostics, and general maintenance. Valid at over 200 locations nationwide.',
    terms: 'Valid until end of month. Cannot be combined with other offers. Minimum spend £50.',
    showToStudents: true,
    showToInstructors: true,
    postcodes: ['AB12 3CD', 'EF45 6GH', 'IJ78 9KL'],
  },
  {
    id: '2',
    title: 'Restaurant – 15% Off Your Meal',
    description: 'Dine in with 15% off at selected local restaurants.',
    image_url: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    active: true,
    category: 'dining',
    offerCode: 'DINE15',
    fullDescription: 'Enjoy 15% off your total bill at participating restaurants. From casual dining to fine cuisine, discover amazing flavors while saving money.',
    terms: 'Valid Monday-Thursday. Excludes alcohol. Maximum discount £25 per table.',
    showToStudents: true,
    showToInstructors: true,
    postcodes: ['AB12 3CD', 'EF45 6GH', 'IJ78 9KL'],
  },
  {
    id: '3',
    title: 'Takeaway – 10% Off First Order',
    description: 'Enjoy 10% off your first order from partnered takeaways.',
    image_url: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    active: true,
    category: 'takeaway',
    offerCode: 'FIRST10',
    fullDescription: 'Get 10% off your first order from our network of partner takeaways. Choose from pizza, Chinese, Indian, burgers, and more.',
    terms: 'New customers only. Minimum order £15. Free delivery included.',
    showToStudents: true,
    showToInstructors: true,
    postcodes: ['AB12 3CD', 'EF45 6GH', 'IJ78 9KL'],
  },
  {
    id: '4',
    title: 'Insurance – 10% Off New Policies',
    description: 'Discount on learner driver insurance packages.',
    image_url: 'https://images.pexels.com/photos/1028741/pexels-photo-1028741.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    active: true,
    category: 'insurance',
    offerCode: 'LEARN10',
    fullDescription: 'Special insurance rates for learner drivers and new drivers. Comprehensive coverage with competitive premiums.',
    terms: 'Valid for new policies only. Age restrictions apply. Quote valid for 30 days.',
    showToStudents: true,
    showToInstructors: true,
    postcodes: ['AB12 3CD', 'EF45 6GH', 'IJ78 9KL'],
  },
  {
    id: '5',
    title: 'Breakdown Cover – 15% Off Subscriptions',
    description: 'Drive with peace of mind with discounted breakdown cover.',
    image_url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    active: true,
    category: 'automotive',
    offerCode: 'BREAKDOWN15',
    fullDescription: '24/7 breakdown assistance with 15% off annual subscriptions. Includes roadside recovery, home start, and onward travel.',
    terms: 'Annual subscription only. UK coverage. 24/7 helpline included.',
    showToStudents: true,
    showToInstructors: true,
    postcodes: ['AB12 3CD', 'EF45 6GH', 'IJ78 9KL'],
  },
  {
    id: '6',
    title: 'Car Sales – Great Deals on Vehicles',
    description: 'Exclusive student discounts on new and used cars.',
    image_url: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop',
    active: true,
    category: 'automotive',
    offerCode: 'STUDENT500',
    fullDescription: 'Exclusive deals for students on quality new and used vehicles. Get up to £500 off your first car purchase plus flexible financing options.',
    terms: 'Valid student ID required. Financing subject to approval. Offer applies to vehicles over £5000.',
    showToStudents: true,
    showToInstructors: true,
    postcodes: ['AB12 3CD', 'EF45 6GH', 'IJ78 9KL'],
  },
];
