import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What AI models do you use?",
    answer:
      "We use state-of-the-art language models from OpenAI, including GPT-3.5 and GPT-4. Our Enterprise plan also offers custom model fine-tuning.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "We offer a 14-day free trial for our Starter and Pro plans. No credit card is required to start your trial.",
  },
  {
    question: "How do you handle data privacy?",
    answer:
      "We take data privacy very seriously. All data is encrypted in transit and at rest. We do not use your data to train our AI models.",
  },
]

export function FAQ() {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

