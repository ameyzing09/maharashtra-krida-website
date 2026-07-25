import { supabase } from "./supabaseClient";
import { SliderImage, SliderImageInput } from "../types";
import { toServiceError } from "./error";

const TABLE = "homepage_content";

export const getHomepageContent = async (): Promise<SliderImage[]> => {
  try {
    const { data, error } = await supabase.from(TABLE).select("*");
    if (error) throw error;
    return (data ?? []) as SliderImage[];
  } catch (error) {
    throw toServiceError(error, 'Failed to fetch homepage content');
  }
};

export const addHomepageContent = async (data: SliderImageInput): Promise<string> => {
  try {
    const { data: row, error } = await supabase.from(TABLE).insert(data).select("id").single();
    if (error) throw error;
    return row.id as string;
  } catch (error) {
    throw toServiceError(error, 'Failed to add homepage content');
  }
};

export const updateHomepageContent = async (id: string, data: SliderImageInput): Promise<void> => {
  try {
    const { error } = await supabase.from(TABLE).update({ ...data }).eq("id", id);
    if (error) throw error;
  } catch (error) {
    throw toServiceError(error, 'Failed to update homepage content');
  }
};

export const deleteHomepageContent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    throw toServiceError(error, 'Failed to delete homepage content');
  }
};
