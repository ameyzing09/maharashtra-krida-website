import { useEffect, useState } from "react";

const useImagePreloader = (imageUrl: string[]) => {
    const [loadedImages, setLoadedImages] = useState(0);
    const [isAllImagesLoaded, setIsAllImagesLoaded] = useState(false);

    useEffect(() => {
    imageUrl.forEach((imageUrl) => {
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            setLoadedImages(prev => prev + 1);
        }
    });
    }, [imageUrl]);

    useEffect(() => {
        if(loadedImages === imageUrl.length) {
            setIsAllImagesLoaded(true);
        }
    }, [loadedImages, imageUrl.length]);

    return isAllImagesLoaded;
}

export default useImagePreloader;

