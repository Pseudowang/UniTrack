"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function DeleteTrackedItemButton({ itemId }: { itemId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    if (!confirm("Are you sure you want to stop tracking this item?")) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item removed from tracking",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to remove item",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleDelete} disabled={isLoading} variant="destructive" size="sm">
      {isLoading ? "Removing..." : "Stop Tracking"}
    </Button>
  )
}
