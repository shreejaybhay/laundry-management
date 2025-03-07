import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"

/**
 * @typedef {Object} ServiceCardProps
 * @property {import('react').ReactNode} icon
 * @property {string} title
 * @property {string} description
 * @property {string[]} features
 * @property {string} [imageSrc]
 */

/**
 * @param {ServiceCardProps} props
 */
export function ServiceCard({ icon, title, description, features, imageSrc }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border hover:border-primary/20 overflow-hidden h-full flex flex-col">
      <div className="h-2 bg-gradient-to-r from-primary to-primary-dark"></div>
      {imageSrc && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <CardContent className="pt-8 flex-grow flex flex-col">
        <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-3 mb-8 flex-grow">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary/90 hover:to-primary-dark/90 transition-colors shadow hover:shadow-md">
          Learn More
        </Button>
      </CardContent>
    </Card>
  )
}

