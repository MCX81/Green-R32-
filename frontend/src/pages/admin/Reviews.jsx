import React, { useEffect, useState } from 'react';
import { adminAPI, reviewsAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Star, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const response = await adminAPI.getReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Sigur vrei să ștergi acest review?')) return;

    try {
      await reviewsAPI.delete(reviewId);
      toast({ title: 'Review șters cu succes!' });
      loadReviews();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge review-ul',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="p-8">Se încarcă...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Review-uri</h1>
        <div className="text-gray-600">
          Total: {reviews.length} review-uri
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl">
          <p className="text-gray-500 text-lg">Nu există review-uri</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="p-6 rounded-2xl border-2 border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-semibold text-lg">{review.userName}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    Produs ID: {review.productId} • {new Date(review.createdAt).toLocaleDateString('ro-RO')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteReview(review._id)}
                  className="rounded-xl text-red-600 hover:bg-red-50 ml-4"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
