import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with CraftPortfolio. Have a question, feedback, or need help? Contact us at fenilkapopara34@gmail.com.',
  alternates: {
    canonical: 'https://www.craftportfolio.online/contact',
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
