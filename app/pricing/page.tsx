'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PricingCard } from '@/components/PricingCard'
import { ComparisonTable } from '@/components/ComparisonTable'
import { FAQ } from '@/components/Faq'
import { tiers } from '@/lib/constants'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
        <p className="text-xl text-center text-muted-foreground mb-8">
          Select the perfect plan for your email management needs
        </p>

        <div className="flex justify-center mb-8">
          <div className="bg-secondary rounded-full p-1">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              onClick={() => setBillingCycle('monthly')}
              className="rounded-full"
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'annually' ? 'default' : 'ghost'}
              onClick={() => setBillingCycle('annually')}
              className="rounded-full"
            >
              Annually
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, index) => (
            <PricingCard
              key={tier.name}
              tier={tier}
              billingCycle={billingCycle}
              index={index}
            />
          ))}
        </div>

        <ComparisonTable tiers={tiers} />
        <FAQ />
      </motion.div>
    </div>
  )
}
