"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function CrawlAllButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleCrawlAll() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/crawl/all", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Crawl Complete",
          description: `Processed ${data.total} items. ${data.created} new snapshots, ${data.skipped} skipped.`,
        })
      } else {
        toast({
          title: "Crawl Error",
          description: data.error || "Failed to crawl items",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger crawl. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCrawlAll} disabled={isLoading} variant="secondary">
      {isLoading ? "Crawling..." : "Crawl Now"}
    </Button>
  )
}
