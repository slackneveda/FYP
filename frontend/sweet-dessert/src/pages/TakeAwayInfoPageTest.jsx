import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TakeAwayInfoPageTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/order-type')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Type
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Take Away Info - Test Page
            </h1>
            <p className="text-muted-foreground">
              This is a test page to check if navigation works
            </p>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg">
            🎉 Success! The "Choose Pickup" button is working correctly.
          </p>
          <p className="text-muted-foreground mt-4">
            The navigation from Order Type Selection to Take Away Info page is functioning properly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TakeAwayInfoPageTest;