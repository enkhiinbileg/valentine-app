export const compressImage = async (file: File): Promise<File> => {
    // Only compress images
    if (!file.type.startsWith('image/')) return file;

    // Skip small images (< 1MB)
    if (file.size < 1024 * 1024) return file;

    const compressionPromise = new Promise<File>((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        reader.onerror = () => resolve(file); // Fallback on read error

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(file);
                return;
            }

            // Max dimensions (Facebook uses ~2048px for standard uploads)
            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1920;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        try {
                            const newFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(newFile);
                        } catch (e) {
                            resolve(file); // Fallback if File constructor fails
                        }
                    } else {
                        resolve(file);
                    }
                },
                'image/jpeg',
                0.8
            );
        };

        img.onerror = () => resolve(file); // Fallback on image load error

        try {
            reader.readAsDataURL(file);
        } catch (e) {
            resolve(file);
        }
    });

    // Race with timeout (3 seconds limit)
    const timeoutPromise = new Promise<File>((resolve) => {
        setTimeout(() => resolve(file), 3000);
    });

    return Promise.race([compressionPromise, timeoutPromise]);
};
