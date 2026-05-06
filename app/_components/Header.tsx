'use client'
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { ArrowRightIcon } from 'lucide-react';
import Image from 'next/image'
import Link from 'next/link';


function Header() {
  
  const{user}=useUser()

  const menu = [
    {
      name: 'Workspace',
      href: '/workspace'
    },
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
    <div className='flex justify-between items-center p-4 shadow w-[80%]'>

      {/* logo & name */}

      <div className='flex gap-2 items-center'>
        <Image src="/logo.png" alt="logo" width={50} height={50} />
        <h2 className='text-2xl font-bold text-white'>AI <span className='text-blue-400'>Craft</span><span className='text-purple-400'>Ship</span></h2>
      </div>

      {/* menu options */}

      <div className='flex gap-3'>
        {
          menu.map((item, index) => (
            <Link key={index} href={item.href}>
            <Button variant={'ghost'} className='text-base text-gray-300 p-4 hover:bg-zinc-800 hover:text-white'>{item.name}</Button>
            </Link>
          ))
        }
      </div>

      {/* CTA button */}

      <div>
        {user?<UserButton/>:
        <SignInButton mode="modal"><Button>Get Started <ArrowRightIcon size={10} /></Button></SignInButton>  
        }
        </div>

    </div>
  )
}

export default Header