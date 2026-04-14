import { forwardRef } from 'react';
import { SmartImage } from '../shared/SmartImage';

interface FlipbookCoverProps {
    coverImage: string;
    titleImage: string;
    storyTitle: string;
}

export const FlipbookCover = forwardRef<HTMLDivElement, FlipbookCoverProps>(({ coverImage, titleImage, storyTitle }, ref) => {
    return (
        <div ref={ref} className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 border-r-4 border-slate-800">
            {/* Cover Image */}
            <div className="relative w-full h-full">
                <SmartImage
                    src={coverImage}
                    alt={`${storyTitle} cover`}
                    className="w-full h-full object-cover"
                />

                {/* Title Image Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <SmartImage
                        src={titleImage}
                        alt={storyTitle}
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Book Spine Shadow Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
            </div>
        </div>
    );
});

FlipbookCover.displayName = 'FlipbookCover';
