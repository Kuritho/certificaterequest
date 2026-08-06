// src/services/dataService.js
import { supabase } from '../lib/supabase';

class DataService {
  // ============================================
  // CERTIFICATE REQUESTS
  // ============================================

  async getRequests(userId, isAdmin = false) {
    let query = supabase.from('certificate_requests').select('*');
    
    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async createRequest(requestData) {
    const { data, error } = await supabase
      .from('certificate_requests')
      .insert([requestData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async updateRequest(id, updates) {
    const { data, error } = await supabase
      .from('certificate_requests')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // ✅ ADD THIS - Delete a certificate request
  async deleteRequest(id) {
    const { data, error } = await supabase
      .from('certificate_requests')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }

  // ✅ ADD THIS - Delete multiple certificate requests
  async deleteMultipleRequests(ids) {
    const { data, error } = await supabase
      .from('certificate_requests')
      .delete()
      .in('id', ids)
      .select();
    
    if (error) throw error;
    return data;
  }

  // ✅ ADD THIS - Delete all certificate requests
  async deleteAllRequests() {
    const { data, error } = await supabase
      .from('certificate_requests')
      .delete()
      .neq('id', 0)
      .select();
    
    if (error) throw error;
    return data;
  }

  // ============================================
  // ANNOUNCEMENTS
  // ============================================

  async getAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createAnnouncement(announcementData) {
    const { data, error } = await supabase
      .from('announcements')
      .insert([announcementData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // ✅ ADD THIS - Delete an announcement
  async deleteAnnouncement(id) {
    const { data, error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }

  // ============================================
  // EVENTS
  // ============================================

  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // ✅ ADD THIS - Delete an event
  async deleteEvent(id) {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================

  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async markNotificationRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // ✅ ADD THIS - Delete a notification
  async deleteNotification(id) {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }

  // ✅ ADD THIS - Delete all notifications for a user
  async deleteAllUserNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    return data;
  }

  // ============================================
  // PROFILES
  // ============================================

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data[0];
  }
}

export const dataService = new DataService();