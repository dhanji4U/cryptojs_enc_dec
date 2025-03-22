import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  adUrl?: string;
  adImage?: string;
  adTitle?: string;
  adDescription?: string;
}

const AdBanner = ({
  adUrl = 'https://example.com/ad',
  adImage = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80',
  adTitle = 'Premium Encryption Tools',
  adDescription = 'Upgrade to our premium suite for advanced encryption features and priority support.'
}: AdBannerProps) => {
  return (
    <Card className='w-full h-[100px] bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-md'>
      <div className='flex h-full'>
        <div className='hidden sm:block w-[180px] h-full overflow-hidden'>
          <img src={adImage} alt='Advertisement' className='w-full h-full object-cover' />
        </div>
        <div className='flex-1 flex items-center justify-between p-4'>
          <div className='flex flex-col justify-center'>
            <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100'>{adTitle}</h3>
            <p className='text-sm text-slate-600 dark:text-slate-400 line-clamp-2'>{adDescription}</p>
          </div>
          <div className='flex items-center'>
            <Button variant='default' size='sm' className='whitespace-nowrap' onClick={() => window.open(adUrl, '_blank')}>
              Learn More
              <ExternalLink className='ml-2 h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AdBanner;
