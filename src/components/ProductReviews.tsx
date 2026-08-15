import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ChevronDown, ChevronUp, Trash2, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, reviewsApi, Review } from '@/services/api';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
  productId: string;
}

const REVIEW_TEXT_PREVIEW = 260;
const PRO_CON_PREVIEW = 140;
const INITIAL_VISIBLE_REVIEWS = 5;
const USER_DELETE_REVIEW_WINDOW_MS = 4 * 24 * 60 * 60 * 1000;

const StarRating = ({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange?: (val: number) => void;
  size?: number;
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, idx) => {
      const ratingValue = idx + 1;
      const active = ratingValue <= value;
      return (
        <button
          key={ratingValue}
          type="button"
          onClick={() => onChange?.(ratingValue)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          aria-label={`${ratingValue} star`}
        >
          <Star
            className={`${active ? 'text-yellow-400' : 'text-muted-foreground'} ${onChange ? 'hover:text-yellow-300' : ''}`}
            style={{ width: size, height: size }}
            fill={active ? 'currentColor' : 'none'}
          />
        </button>
      );
    })}
  </div>
);

const SubRatingRow = ({ label, value }: { label: string; value: number }) => {
  if (!value || value < 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>{label}</span>
      <StarRating value={Math.round(value)} size={12} />
    </div>
  );
};

function truncateWithEllipsis(text: string, maxChars: number): { short: string; needsMore: boolean } {
  const t = text.trim();
  if (t.length <= maxChars) return { short: t, needsMore: false };
  let cut = t.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > maxChars * 0.6) cut = cut.slice(0, lastSpace);
  return { short: `${cut.trim()}…`, needsMore: true };
}

function truncateByLines(text: string, maxLines: number): { short: string; needsMore: boolean } {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n');
  if (lines.length <= maxLines) return { short: normalized, needsMore: false };
  const preview = lines.slice(0, maxLines).join('\n').trimEnd();
  return { short: `${preview}…`, needsMore: true };
}

const ExpandableText = ({
  text,
  previewChars,
  previewLines,
  className,
  label,
}: {
  text: string;
  previewChars?: number;
  previewLines?: number;
  className?: string;
  label?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const raw = text?.trim() || '';
  if (!raw) return null;
  const { short, needsMore } =
    typeof previewLines === 'number' && previewLines > 0
      ? truncateByLines(raw, previewLines)
      : truncateWithEllipsis(raw, previewChars ?? REVIEW_TEXT_PREVIEW);
  const showToggle = needsMore && !expanded;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <p className="text-xs font-medium text-muted-foreground">{label}</p> : null}
      <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed text-pretty">
        {expanded ? raw : showToggle ? short : raw}
      </p>
      {needsMore && (
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline touch-manipulation min-h-[44px] py-2 -mx-1 px-1 text-left inline-flex items-center gap-1"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <>
              Read less <ChevronUp className="w-4 h-4 shrink-0" aria-hidden />
            </>
          ) : (
            <>
              Read more <ChevronDown className="w-4 h-4 shrink-0" aria-hidden />
            </>
          )}
        </button>
      )}
    </div>
  );
};

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const loginUrl = `/login?redirect=${encodeURIComponent(location.pathname)}`;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [eligibleOrderId, setEligibleOrderId] = useState<string>('');
  const [reviewMode, setReviewMode] = useState<'any-user' | 'delivered-only'>('delivered-only');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const [form, setForm] = useState({
    rating: 0,
    valueForMoney: 0,
    durability: 0,
    deliverySpeed: 0,
    comment: '',
    pros: '',
    cons: '',
  });

  const canSubmit =
    form.rating > 0 &&
    form.comment.trim().length > 0 &&
    (reviewMode === 'any-user' || !!eligibleOrderId);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [reviewRes, modeRes] = await Promise.all([
          reviewsApi.getByProduct(productId).catch(() => null),
          reviewsApi.getMode().catch(() => null),
        ]);
        const reviewList = (reviewRes as { data?: Review[] })?.data || [];
        const mode = (modeRes as { data?: { mode?: 'any-user' | 'delivered-only' } })?.data?.mode;
        const approvedReviews = Array.isArray(reviewList)
          ? reviewList.filter((r) => (r as Review & { status?: string }).status === 'approved' || !(r as Review & { status?: string }).status)
          : [];
        setReviews(approvedReviews);
        if (mode) setReviewMode(mode);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [productId]);

  useEffect(() => {
    setShowAllReviews(false);
  }, [productId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setEligibleOrderId('');
      return;
    }
    const loadEligibleOrder = async () => {
      try {
        const res = await ordersApi.getMyOrders();
        const orders = (res as { data?: Array<{ _id: string; orderStatus: string; products: Array<{ productId: string }> }> }).data || [];
        const delivered = orders.find(
          (o) => o.orderStatus === 'Delivered' && o.products.some((p) => p.productId === productId)
        );
        setEligibleOrderId(delivered?._id || '');
      } catch {
        setEligibleOrderId('');
      }
    };
    loadEligibleOrder();
  }, [isAuthenticated, productId]);

  const ratingSummary = useMemo(() => {
    if (!reviews.length) return { average: 0, total: 0, counts: [0, 0, 0, 0, 0] };
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    reviews.forEach((r) => {
      const rating = Math.round(Number(r.rating) || 0);
      if (rating >= 1 && rating <= 5) counts[rating - 1] += 1;
      total += rating;
    });
    return { average: total / reviews.length, total: reviews.length, counts };
  }, [reviews]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (editingReviewId) {
      await reviewsApi.updateMine(editingReviewId, {
        rating: form.rating,
        valueForMoney: form.valueForMoney || undefined,
        durability: form.durability || undefined,
        deliverySpeed: form.deliverySpeed || undefined,
        comment: form.comment.trim(),
        pros: form.pros.trim() || undefined,
        cons: form.cons.trim() || undefined,
      });
    } else {
      await reviewsApi.create({
        productId,
        orderId: eligibleOrderId || undefined,
        rating: form.rating,
        valueForMoney: form.valueForMoney || undefined,
        durability: form.durability || undefined,
        deliverySpeed: form.deliverySpeed || undefined,
        comment: form.comment.trim(),
        pros: form.pros.trim() || undefined,
        cons: form.cons.trim() || undefined,
      });
    }
    setShowModal(false);
    setEditingReviewId(null);
    setForm({ rating: 0, valueForMoney: 0, durability: 0, deliverySpeed: 0, comment: '', pros: '', cons: '' });
    const reviewRes = await reviewsApi.getByProduct(productId).catch(() => null);
    const reviewList = (reviewRes as { data?: Review[] })?.data || [];
    const approvedReviews = Array.isArray(reviewList)
      ? reviewList.filter((r) => (r as Review & { status?: string }).status === 'approved' || !(r as Review & { status?: string }).status)
      : [];
    setReviews(approvedReviews);
  };

  const displayedReviews = useMemo(() => {
    if (reviews.length <= INITIAL_VISIBLE_REVIEWS || showAllReviews) return reviews;
    return reviews.slice(0, INITIAL_VISIBLE_REVIEWS);
  }, [reviews, showAllReviews]);

  const totalReviewCount = reviews.length;
  const hasMoreReviewsToLoad = totalReviewCount > INITIAL_VISIBLE_REVIEWS && !showAllReviews;
  const useTwoColumnGrid = displayedReviews.length > INITIAL_VISIBLE_REVIEWS;
  const currentUserId = user?._id || '';

  const getReviewOwnerId = (review: Review) =>
    typeof review.userId === 'object' ? review.userId?._id || '' : review.userId || '';

  const canUserDeleteReview = (review: Review) => {
    if (!isAuthenticated || !currentUserId) return false;
    const isOwnReview = getReviewOwnerId(review) === currentUserId;
    if (!isOwnReview || !review.createdAt) return false;
    const createdAtMs = new Date(review.createdAt).getTime();
    if (Number.isNaN(createdAtMs)) return false;
    return Date.now() - createdAtMs <= USER_DELETE_REVIEW_WINDOW_MS;
  };

  const canUserEditReview = (review: Review) => canUserDeleteReview(review);

  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review._id);
    setForm({
      rating: Number(review.rating) || 0,
      valueForMoney: Number(review.valueForMoney) || 0,
      durability: Number(review.durability) || 0,
      deliverySpeed: Number(review.deliverySpeed) || 0,
      comment: review.comment || '',
      pros: review.pros || '',
      cons: review.cons || '',
    });
    setShowModal(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    const confirmed = window.confirm('Delete this review? This action cannot be undone.');
    if (!confirmed) return;
    try {
      setDeletingReviewId(reviewId);
      await reviewsApi.deleteMine(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete review';
      window.alert(message);
    } finally {
      setDeletingReviewId(null);
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Reviews</h2>
      <p className="text-sm text-muted-foreground mb-6">Ratings and feedback from verified buyers.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 lg:mb-10">
        <div className="bg-secondary/20 rounded-xl p-4 sm:p-6 border border-border/60">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground">{ratingSummary.average.toFixed(1)}</p>
              <StarRating value={Math.round(ratingSummary.average)} size={18} />
              <p className="text-sm text-muted-foreground mt-1">{ratingSummary.total} review{ratingSummary.total === 1 ? '' : 's'}</p>
            </div>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingSummary.counts[star - 1] || 0;
              const percent = ratingSummary.total ? (count / ratingSummary.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-14 shrink-0">
                    <span>{star}</span>
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-0">
                    <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-10 text-right text-muted-foreground shrink-0 tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-secondary/20 rounded-xl p-4 sm:p-6 border border-border/60 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">Write a review</h3>
          {!isAuthenticated ? (
            <>
              <p className="text-sm text-muted-foreground">Please log in to submit a review.</p>
              <Link to={loginUrl}>
                <Button>Log in</Button>
              </Link>
            </>
          ) : reviewMode === 'delivered-only' && !eligibleOrderId ? (
            <p className="text-sm text-muted-foreground">You can submit a review after your order for this product is delivered.</p>
          ) : (
            <Button
              type="button"
              onClick={() => {
                setEditingReviewId(null);
                setForm({ rating: 0, valueForMoney: 0, durability: 0, deliverySpeed: 0, comment: '', pros: '', cons: '' });
                setShowModal(true);
              }}
              className="w-fit"
            >
              Add review
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-8 sm:pt-10">
        <h3
          id="customer-reviews-heading"
          className="text-lg sm:text-xl font-semibold text-foreground mb-6 sm:mb-8 scroll-mt-28 sm:scroll-mt-32"
        >
          Customer reviews
          {!isLoading && totalReviewCount > 0 && (
            <span className="text-muted-foreground font-normal"> ({totalReviewCount})</span>
          )}
        </h3>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 sm:py-8">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            <ul
              className={cn(
                'grid gap-5 sm:gap-6 max-w-4xl',
                useTwoColumnGrid && 'sm:grid-cols-1 xl:grid-cols-2 xl:max-w-none xl:gap-x-8 xl:gap-y-6'
              )}
            >
              {displayedReviews.map((review) => {
              const hasSub =
                (Number(review.valueForMoney) || 0) >= 1 ||
                (Number(review.durability) || 0) >= 1 ||
                (Number(review.deliverySpeed) || 0) >= 1;
              return (
                <li key={review._id}>
                  <article
                    className={cn(
                      'border border-border rounded-xl p-5 sm:p-6 bg-card h-full flex flex-col gap-4 shadow-sm/50',
                      useTwoColumnGrid && 'xl:min-h-0'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {(() => {
                          const profile =
                            review.userId && typeof review.userId === 'object'
                              ? (review.userId as { profileImage?: string }).profileImage
                              : review.userProfileImage;
                          const name =
                            review.userName ||
                            (review.userId && typeof review.userId === 'object' ? (review.userId as { name?: string }).name : '');
                          const initial = (name || 'U').charAt(0).toUpperCase();
                          return profile ? (
                            <img
                              src={profile}
                              alt={name || 'User'}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                              {initial}
                            </div>
                          );
                        })()}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {review.userName ||
                              (typeof review.userId === 'object' ? (review.userId as { name?: string }).name : 'User')}
                          </p>
                          <StarRating value={Number(review.rating) || 0} size={14} />
                        </div>
                      </div>
                      <time className="text-xs text-muted-foreground shrink-0 pt-0.5">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : ''}
                      </time>
                    </div>

                    {(canUserEditReview(review) || canUserDeleteReview(review)) && (
                      <div className="flex justify-end -mt-2 gap-1">
                        {canUserEditReview(review) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleStartEdit(review)}
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingReviewId === review._id}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {deletingReviewId === review._id ? 'Deleting…' : 'Delete'}
                        </Button>
                      </div>
                    )}

                    {hasSub && (
                      <div className="rounded-lg bg-muted/40 px-3 py-2.5 space-y-1.5 text-xs">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Also rated</p>
                        <SubRatingRow label="Value for money" value={Number(review.valueForMoney) || 0} />
                        <SubRatingRow label="Durability" value={Number(review.durability) || 0} />
                        <SubRatingRow label="Delivery speed" value={Number(review.deliverySpeed) || 0} />
                      </div>
                    )}

                    <ExpandableText text={review.comment || ''} previewChars={REVIEW_TEXT_PREVIEW} />

                    {(review.pros || review.cons) && (
                      <div className="text-xs text-muted-foreground space-y-4 pt-3 border-t border-border mt-auto">
                        {review.pros ? (
                          <ExpandableText text={review.pros} previewLines={2} label="Pros" />
                        ) : null}
                        {review.cons ? (
                          <ExpandableText text={review.cons} previewLines={2} label="Cons" />
                        ) : null}
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
            </ul>

            {hasMoreReviewsToLoad && (
              <div className="flex flex-col items-center gap-4 sm:gap-5 text-center px-2 pt-2 sm:pt-4 max-w-4xl xl:max-w-none">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Showing{' '}
                  <span className="font-semibold text-foreground tabular-nums">{INITIAL_VISIBLE_REVIEWS}</span>
                  {' of '}
                  <span className="font-semibold text-foreground tabular-nums">{totalReviewCount}</span> reviews
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-h-[52px] w-full max-w-md sm:max-w-lg px-8 gap-2 touch-manipulation border-2 text-base font-medium"
                  onClick={() => setShowAllReviews(true)}
                >
                  Read more reviews
                  <ChevronDown className="w-5 h-5 shrink-0" aria-hidden />
                </Button>
              </div>
            )}

            {totalReviewCount > INITIAL_VISIBLE_REVIEWS && showAllReviews && (
              <div className="flex justify-center px-2 pt-4 sm:pt-6 border-t border-border/60 mt-8 sm:mt-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="min-h-[48px] gap-2 text-muted-foreground hover:text-foreground touch-manipulation"
                  onClick={() => {
                    setShowAllReviews(false);
                    document.getElementById('customer-reviews-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <ChevronUp className="w-5 h-5 shrink-0" aria-hidden />
                  Show fewer reviews
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setEditingReviewId(null);
            setForm({ rating: 0, valueForMoney: 0, durability: 0, deliverySpeed: 0, comment: '', pros: '', cons: '' });
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold">{editingReviewId ? 'Edit your review' : 'Submit a review'}</DialogTitle>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall rating *</p>
              <StarRating value={form.rating} onChange={(val) => setForm({ ...form, rating: val })} size={18} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value for money</p>
                <StarRating value={form.valueForMoney} onChange={(val) => setForm({ ...form, valueForMoney: val })} size={14} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Durability</p>
                <StarRating value={form.durability} onChange={(val) => setForm({ ...form, durability: val })} size={14} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Delivery speed</p>
                <StarRating value={form.deliverySpeed} onChange={(val) => setForm({ ...form, deliverySpeed: val })} size={14} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Written review *</p>
              <Textarea
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                rows={4}
                placeholder="Share your experience with this product…"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pros (optional)</p>
                <Textarea
                  value={form.pros}
                  onChange={(e) => setForm({ ...form, pros: e.target.value })}
                  rows={4}
                  placeholder="Write pros line by line (press Enter for next line)"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cons (optional)</p>
                <Textarea
                  value={form.cons}
                  onChange={(e) => setForm({ ...form, cons: e.target.value })}
                  rows={4}
                  placeholder="Write cons line by line (press Enter for next line)"
                />
              </div>
            </div>
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit} className="w-full">
              {editingReviewId ? 'Update review' : 'Submit review'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductReviews;
