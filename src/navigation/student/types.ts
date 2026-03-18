/**
 * GDS Driving School — Student Navigation Types
 * ================================================
 * Extracted to a separate file to break circular dependencies between
 * navigation files and screen files.
 */

export type StudentStackParamList = {
  StudentTabs: undefined;
  InstructorDiscovery: undefined;
  InstructorProfile: { instructorId: string };
  PackageListing: { instructorId: string };
  MyInstructors: undefined;
  BookLesson: { instructorId?: string; packageId?: string } | undefined;
  MyLessons: undefined;
  StudentMessages: undefined;
  Chat: { conversationId: string; instructorName: string };
  StudentOffers: undefined;
  StudentOfferDetail: { offerId: string };
};
