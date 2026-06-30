export type Locale = 'ar' | 'en' | 'he';
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface Timestamped { created_at: string; updated_at: string }
export interface ActiveSortable { is_active: boolean; sort_order: number }
export interface LocalizedTitle {
  title_en: string; title_he: string;
  description_en: string | null; description_he: string | null;
}

export interface ServiceDto extends Timestamped, ActiveSortable, LocalizedTitle { id: number; image_url: string | null; starting_price: string | null }
export interface ProjectDto extends Timestamped, ActiveSortable, LocalizedTitle {
  id: number; category: 'LOCAL' | 'INTERNATIONAL' | 'FEATURED'; main_image_url: string | null;
}
export interface ProjectImageDto { id: number; project_id: number; image_url: string; alt_text_en: string | null; alt_text_he: string | null; sort_order: number; created_at: string }
export interface ProjectDetailDto extends ProjectDto { images: ProjectImageDto[] }
export interface GalleryDto extends Timestamped, ActiveSortable {
  id: number; image_url: string; title_en: string | null; title_he: string | null;
  alt_text_en: string | null; alt_text_he: string | null; category: string | null;
}
export interface PartnerDto extends Timestamped, ActiveSortable { id: number; name_en: string; name_he: string; logo_url: string; website_url: string | null }
export interface TestimonialDto extends Timestamped, ActiveSortable {
  id: number; client_name_en: string; client_name_he: string;
  message_en: string; message_he: string;
  client_position_en: string | null; client_position_he: string | null;
}
export interface AdminDto extends Timestamped { id: number; full_name: string; email: string; role: 'admin' | 'super_admin'; is_active: boolean; last_login_at: string | null }
export interface SiteContentDto extends Timestamped { id: number; section: string; key: string; value: JsonValue; content_type: string; is_active: boolean }
export interface SiteSettingDto extends Timestamped { id: number; key: string; value: JsonValue }
export type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';
export type QuoteStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
export interface ContactMessageDto { id: number; name: string; email: string; phone: string | null; subject: string | null; message: string; status: ContactStatus; created_at: string }
export interface QuoteRequestDto extends Timestamped { id: number; name: string; email: string | null; phone: string; service_type: string | null; message: string | null; plans_link: string | null; status: QuoteStatus }
export interface AuditLogDto { id: number; admin_id: number | null; actor_name: string | null; actor_email: string | null; action: string; entity_type: string | null; entity_id: string | null; created_at: string }
