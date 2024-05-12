import { useEffect, useState, useCallback } from "react";
import { SliderImage, SliderImageInput } from "../types";
import {
  getHomepageContent,
  addHomepageContent,
  updateHomepageContent,
  deleteHomepageContent
} from "../services/homepageService";

const useHomepageContent = () => {
  const [content, setContent] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedContent = await getHomepageContent();
      setContent(fetchedContent);
      setError(null);
    } catch (error) {
      setError("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleContentChange = useCallback(async () => {
    await fetchContent();
  }, [fetchContent]);

  const handleAddContent = async (data: SliderImageInput) => {
    try {
      setLoading(true);
      const newId = await addHomepageContent(data);
      handleContentChange();
      return newId;
    } catch (error) {
      setError("Failed to add content");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async (id: string, data: SliderImageInput) => {
    try {
      setLoading(true);
      await updateHomepageContent(id, data);
      handleContentChange();
    } catch (error) {
      setError("Failed to update content");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      setLoading(true);
      await deleteHomepageContent(id);
      handleContentChange();
    } catch (error) {
      setError("Failed to delete content");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { content, loading, error, handleAddContent, handleUpdateContent, handleDeleteContent, handleContentChange };
};

export default useHomepageContent;