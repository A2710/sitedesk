// apps/widget/src/components/WidgetChatFeedback.tsx

import { useState } from 'react';
import { useWidgetStore } from '@/hooks/useWidgetStore';
import { useWidgetApi } from '@/hooks/useWidgetApis';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';

export function WidgetChatFeedback() {
  const chatId = useWidgetStore(s => s.currentChat? s.currentChat.id : null);
  const setStatus = useWidgetStore(s => s.setStatus);
  const resetStatus = useWidgetStore(s => s.reset);
  const { submitFeedbackMutation } = useWidgetApi();
  const { mutate, isSuccess, isPending } = submitFeedbackMutation;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  if (isSuccess) {
    setStatus("ENDED");
    setTimeout(() => {
      resetStatus();
    }, 1000);
  }

  const handleSubmit = () => {
    if (!chatId) return;
    mutate({ chatId, rating, comment });
  };

  return (
    <div className="p-4 flex flex-col space-y-4">
      <h2 className="text-lg font-bold text-center">How did we do?</h2>

      <div className="flex justify-center space-x-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={32}
            className={`cursor-pointer fill-current stroke-current ${
                n <= rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
            strokeWidth={ n <= rating ? 0 : 0 }
            fill={ n <= rating ? 'currentColor' : 'none' }

            onClick={() => setRating(n)}
          />
        ))}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Any additional comments?"
        className="w-full border rounded p-2 h-24"
      />

      {/* Submit button */}
      <div className="flex justify-center">
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? 'Submitting…' : 'Submit Feedback'}
        </Button>
      </div>
    </div>
  );
}
