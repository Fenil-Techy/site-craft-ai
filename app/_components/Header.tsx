'use client'
import { Button } from '@/components/ui/button';
import { SignInButton, useUser } from '@clerk/nextjs';
import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image'


function Header() {
  

  const menu = [
    {
      name: 'Pricing',
      href: '/pricing'
    },
    {
      name: 'Contact',
      href: '/contact'
    }
  ];
  return (
    <div className='flex justify-between items-center p-4 shadow'>

      {/* logo & name */}

      <div className='flex gap-2 items-center'>
        <Image src="/logo.png" alt="logo" width={50} height={50} />
        <h2 className='text-2xl font-bold'>AI CraftShip</h2>
      </div>

      {/* menu options */}

      <div className='flex gap-3'>
        {
          menu.map((item, index) => (
            <Button key={index} variant={'ghost'} className='text-base'>{item.name}</Button>
          ))
        }
      </div>

      {/* CTA button */}

      <div>
        <SignInButton mode="modal" forceRedirectUrl={"/workspace"}><Button>Get Started <ArrowRightIcon size={10} /></Button></SignInButton>  
      </div>
    </div>
  )
}

export default Header