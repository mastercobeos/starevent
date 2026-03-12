import { useState, useCallback, useEffect, memo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { BackgroundSection } from '../ui/BackgroundSection';
import { useResponsiveCount } from '../../hooks/useResponsiveCount';
import { useSwipe } from '../../hooks/useSwipe';
import { googleReviews as fallbackReviews } from '../../data/homeData';

const BG_IMAGE = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=70';

export const ReviewsSection = memo(function ReviewsSection({ t }) {
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviews, setReviews] = useState(fallbackReviews);
  const [googleRating, setGoogleRating] = useState(4.7);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch real Google reviews
  useEffect(() => {
    fetch('/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
          setGoogleRating(data.rating);
          setTotalReviews(data.totalReviews);
        }
      })
      .catch(() => {}); // Silently fall back to hardcoded reviews
  }, []);

  const visibleReviews = useResponsiveCount(
    [[500, 1], [Infinity, 2]],
    useCallback(() => setReviewIndex(0), [])
  );

  const reviewPages = Math.ceil(reviews.length / visibleReviews);

  const goNext = useCallback(() => setReviewIndex((prev) => (prev + 1) % reviewPages), [reviewPages]);
  const goPrev = useCallback(() => setReviewIndex((prev) => (prev - 1 + reviewPages) % reviewPages), [reviewPages]);
  const swipe = useSwipe(goNext, goPrev);

  useEffect(() => {
    const interval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % reviewPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviewPages]);

  const fullStars = Math.floor(googleRating);
  const hasHalfStar = googleRating - fullStars >= 0.3;
  const starCount = hasHalfStar ? fullStars + 1 : fullStars;

  return (
    <BackgroundSection imageSrc={BG_IMAGE} className="py-12 sm:py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-white text-lg sm:text-2xl md:text-3xl font-medium mb-6 leading-relaxed px-4">
            {t.ctaTitle}
          </p>
          <a href="#about">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-xl font-bold rounded-lg shadow-lg hover:shadow-xl transition-[box-shadow] border-2 border-[#C9A84C]">
              {t.learnMore}
            </Button>
          </a>
        </div>

        <div className="border-t border-white/20 pt-6 sm:pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <h2 className="text-base sm:text-lg font-bold text-white">{t.reviewsTitle}</h2>
            <div className="flex items-center gap-0.5 ml-1">
              {[...Array(starCount)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
              <span className="text-white/60 text-xs ml-1">
                {googleRating}
                {totalReviews > 0 && ` (${totalReviews})`}
              </span>
            </div>
          </div>

          <div className="relative" {...swipe}>
            <button
              onClick={() => setReviewIndex((prev) => (prev - 1 + reviewPages) % reviewPages)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-[background-color,color]"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setReviewIndex((prev) => (prev + 1) % reviewPages)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-[background-color,color]"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="overflow-hidden mx-6 sm:mx-8">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${reviewIndex * 100}%)` }}
              >
                {Array.from({ length: reviewPages }).map((_, pageIdx) => (
                  <div key={pageIdx} className="w-full shrink-0 px-1">
                    <div className="flex gap-3">
                      {reviews.slice(pageIdx * visibleReviews, pageIdx * visibleReviews + visibleReviews).map((review, i) => (
                        <div
                          key={i}
                          className="flex-1 min-w-0 rounded-xl p-3 sm:p-4 border border-white/15 backdrop-blur-md"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                            backdropFilter: 'blur(12px) saturate(150%)',
                            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(review.rating)].map((_, j) => (
                                <svg key={j} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                              ))}
                            </div>
                            {review.time && (
                              <span className="text-white/40 text-[10px]">{review.time}</span>
                            )}
                          </div>
                          <p className="text-white/85 text-[11px] sm:text-xs italic leading-relaxed mb-2 line-clamp-4">
                            &ldquo;{review.text}&rdquo;
                          </p>
                          <div className="flex items-center gap-2">
                            {review.photo && (
                              <Image
                                src={review.photo}
                                alt={`${review.author} - Star Event Rental review`}
                                width={20}
                                height={20}
                                className="w-5 h-5 rounded-full object-cover"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <p className="text-primary font-semibold text-xs">{review.author}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-1.5 mt-4">
              {Array.from({ length: reviewPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setReviewIndex(idx)}
                  className={`h-1.5 rounded-full transition-[width,background-color] ${
                    reviewIndex === idx ? 'bg-primary w-5' : 'bg-white/30 w-1.5 hover:bg-white/50'
                  }`}
                  aria-label={`Go to review page ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </BackgroundSection>
  );
});
