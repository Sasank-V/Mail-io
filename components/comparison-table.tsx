import { Check, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ComparisonTableProps {
  tiers: {
    name: string
    features: string[]
  }[]
}

export function ComparisonTable({ tiers }: ComparisonTableProps) {
  const allFeatures = Array.from(new Set(tiers.flatMap((tier) => tier.features)))

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">Feature Comparison</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">Feature</TableHead>
            {tiers.map((tier) => (
              <TableHead key={tier.name} className="text-center">
                {tier.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {allFeatures.map((feature) => (
            <TableRow key={feature}>
              <TableCell className="font-medium">{feature}</TableCell>
              {tiers.map((tier) => (
                <TableCell key={tier.name} className="text-center">
                  {tier.features.includes(feature) ? (
                    <Check className="mx-auto text-primary" />
                  ) : (
                    <X className="mx-auto text-muted-foreground" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

