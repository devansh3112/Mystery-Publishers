
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  imageUrl?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  imageUrl
}) => {
  return (
    <Card className="border border-border bg-white hover:shadow-md transition-all duration-300">
      <CardContent className="pt-6 px-6 pb-6">
        <div className="flex flex-col h-full">
          <div className="text-4xl font-playfair text-primary/30 mb-4">"</div>
          <p className="italic text-lg mb-6">{quote}</p>
          
          <div className="mt-auto flex items-center">
            {imageUrl ? (
              <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                <img src={imageUrl} alt={author} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-4">
                <span className="text-lg font-semibold">{author.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="font-semibold">{author}</div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
