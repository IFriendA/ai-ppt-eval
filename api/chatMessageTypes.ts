export interface OutlineItem {
  content?: string;
  design_suggestion?: string;
}

export interface KeyInfosTheme {
  id?: string;
  name?: string;
  screenshot?: string;
}

export interface KeyInfosBrand {
  id?: number;
  brand_name?: string;
  brand_logo?: string;
  brand_color?: string;
}

export interface KeyInfosData {
  key_infos_topic?: string;
  key_infos_objective?: string;
  key_infos_scenario?: string;
  key_infos_audience?: string;
  key_infos_page_count?: number;
  key_infos_page_num?: string;
  key_infos_ratio?: string;
  key_infos_theme?: KeyInfosTheme;
  key_infos_animation?: string;
  key_infos_language?: string;
  key_infos_enable_web_search?: boolean;
  key_infos_brand?: KeyInfosBrand;
}

export interface OutlineData {
  outline?: OutlineItem[];
}

export interface OutlineNewData {
  outline?: string;
}

export interface NewVerData {
  ver_id?: number;
  ver_str?: string;
  ver_desc?: string;
  ver_create_time?: number;
  ver_streaming_msg?: string;
}
