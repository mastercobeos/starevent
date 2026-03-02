import { NextResponse } from 'next/server';

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
let cachedData = null;
let cacheTimestamp = 0;

export async function GET() {
  const now = Date.now();

  // Return cached data if still fresh
  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json({ reviews: [], rating: 0, totalReviews: 0 });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      console.error('Google Places API error:', data.status, data.error_message);
      return NextResponse.json({ reviews: [], rating: 0, totalReviews: 0 });
    }

    const result = {
      reviews: (data.result.reviews || []).map((r) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        photo: r.profile_photo_url,
        time: r.relative_time_description,
      })),
      rating: data.result.rating || 0,
      totalReviews: data.result.user_ratings_total || 0,
    };

    // Cache the result
    cachedData = result;
    cacheTimestamp = now;

    return NextResponse.json(result);
  } catch (err) {
    console.error('Failed to fetch Google reviews:', err);
    return NextResponse.json({ reviews: [], rating: 0, totalReviews: 0 });
  }
}
