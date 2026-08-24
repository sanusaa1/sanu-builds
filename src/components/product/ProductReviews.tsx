import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquarePlus, X, ThumbsUp } from 'lucide-react';
import { Review, Product } from '../../types';
import { getProductReviews, addReview } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProductReviewsProps {
  product: Product;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ product }) => {
  const { currentUser, userProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [product.id]);

  const loadReviews = async () => {
    setLoading(true);
    const data = await getProductReviews(product.id);
    setReviews(data);
    setLoading(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toastError('Please sign in to submit a review.');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      toastError('Please provide a title and detailed comment.');
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await addReview({
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || 'Sanu Customer',
        userPhoto: userProfile?.photoURL || currentUser.photoURL || undefined,
        productId: product.id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        verifiedPurchase: true,
      });

      setReviews((prev) => [newReview, ...prev]);
      success('Thank you for reviewing! Your feedback is live.');
      setIsModalOpen(false);
      setTitle('');
      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
      toastError('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Distribution calculation
  const totalReviews = reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviews.filter((rev) => Math.round(rev.rating) === r).length,
    pct: totalReviews > 0 ? (reviews.filter((rev) => Math.round(rev.rating) === r).length / totalReviews) * 100 : 0,
  }));

  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : (product.rating || 5.0).toFixed(1);

  return (
    <div id="product-reviews-section" className="space-y-8">
      {/* Header with Breakdown */}
      <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Average Score */}
          <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-neutral-200 pb-6 md:pb-0 md:pr-6">
            <span className="text-4xl sm:text-5xl font-black text-neutral-900">{avgRating}</span>
            <div className="flex items-center justify-center md:justify-start gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(Number(avgRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-neutral-200 text-neutral-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Based on {totalReviews} verified community ratings
            </p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-1.5">
            {ratingCounts.map((rc) => (
              <div key={rc.stars} className="flex items-center gap-2 text-xs">
                <span className="w-10 text-neutral-600 font-medium">{rc.stars} stars</span>
                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                    style={{ width: `${rc.pct}%` }}
                  />
                </div>
                <span className="w-6 text-neutral-400 text-right text-[11px]">{rc.count}</span>
              </div>
            ))}
          </div>

          {/* Write Review Action */}
          <div className="flex flex-col items-center justify-center gap-2 md:pl-6">
            <p className="text-xs font-semibold text-neutral-800 text-center">
              Own this Sanu Builds piece?
            </p>
            <button
              id="open-write-review-btn"
              onClick={() => {
                if (!currentUser) {
                  toastError('Please log in to write a review.');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write A Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Customer Feedback ({reviews.length})
        </h4>

        {loading ? (
          <div className="py-8 text-center text-xs text-neutral-400 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-lg border border-dashed border-neutral-200">
            <p className="text-sm font-semibold text-neutral-700">No reviews yet for this product.</p>
            <p className="text-xs text-neutral-400 mt-1">Be the first to share your fit and fabric experience.</p>
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-neutral-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{rev.userName}</span>
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'
                      }`}
                    />
                  ))}
                </div>

                <h5 className="text-xs font-bold text-neutral-900">{rev.title}</h5>
                <p className="text-xs text-neutral-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div
          id="write-review-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            id="write-review-modal-content"
            className="bg-white rounded-xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-base">Write Review for {product.name}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4">
              {/* Star Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                      className="p-1 text-neutral-300 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-neutral-700">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unbeatable neckline structure and drape"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the fabric weight, GSM feel, sizing, and washing durability..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-neutral-900 hover:bg-black text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
