import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingCardProps {
  tier: {
    name: string
    price: number
    features: string[]
    aiModel: string
    popular?: boolean
  }
  billingCycle: "monthly" | "annually"
  index: number
}

export function PricingCard({ tier, billingCycle, index }: PricingCardProps) {
  const price = billingCycle === "annually" ? tier.price * 10 : tier.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`bg-card rounded-lg p-6 shadow-lg ${tier.popular ? "border-2 border-primary" : ""}`}
    >
      {tier.popular && (
        <div className="bg-primary text-primary-foreground text-sm font-semibold py-1 px-3 rounded-full inline-block mb-4">
          Most Popular
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">{tier.name}</h2>
      <p className="text-4xl font-bold mb-4">
        ${price}
        <span className="text-lg font-normal text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
      </p>
      <ul className="mb-6 space-y-2">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className="text-primary mr-2 h-5 w-5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <p className="mb-6 text-sm text-muted-foreground">
        AI Model: <span className="font-semibold">{tier.aiModel}</span>
      </p>
      <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
        Choose Plan
      </Button>
    </motion.div>
  )
}

