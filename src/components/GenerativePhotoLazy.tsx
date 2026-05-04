'use client';

import dynamic from 'next/dynamic';

const GenerativePhoto = dynamic(() => import('./GenerativePhoto'), {
  ssr: false,
  loading: () => <div className="w-full aspect-[4/5] bg-[#f4f4f4]" aria-hidden />,
});

export default GenerativePhoto;
